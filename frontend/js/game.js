// Main Game Controller

class Game {
    constructor() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.board = new Board();
        this.cardManager = new CardManager();
        this.ui = null; // Will be set by UI manager
        this.gameState = 'setup'; // setup, playing, ended
        this.lastDiceRoll = [0, 0];
        this.turnPhase = 'roll'; // roll, action, end
        this.consecutiveDoubles = 0;
    }

    // Initialize game with players
    startGame(playerData) {
        this.players = [];
        playerData.forEach((data, index) => {
            const player = new Player(
                data.name,
                index,
                PLAYER_COLORS[index],
                data.token,
                data.isAI || false,
                data.aiStrategy || 'balanced'
            );
            this.players.push(player);
        });

        this.currentPlayerIndex = 0;
        this.board.reset();
        this.gameState = 'playing';
        this.turnPhase = 'roll';

        this.log(`Game started with ${this.players.length} players!`, true);
        this.log(`${this.getCurrentPlayer().name}'s turn`, true);

        // Start AI turn if first player is AI
        if (this.getCurrentPlayer().isAI) {
            this.handleAITurn();
        }
    }

    // Get current player
    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    // Roll dice
    rollDice() {
        if (this.turnPhase !== 'roll') {
            this.log("You must end your turn first!");
            return null;
        }

        const die1 = Math.floor(Math.random() * 6) + 1;
        const die2 = Math.floor(Math.random() * 6) + 1;
        this.lastDiceRoll = [die1, die2];

        const total = die1 + die2;
        const isDoubles = die1 === die2;

        const player = this.getCurrentPlayer();

        this.log(`${player.name} rolled ${die1} + ${die2} = ${total}`, true);

        // Record memory for AI players
        if (player.isAI) {
            player.addMemory(`I rolled ${die1} + ${die2} = ${total}${isDoubles ? ' (doubles!)' : ''}`);
        }

        // Handle jail
        if (player.inJail) {
            player.jailTurns++;

            if (isDoubles) {
                player.leaveJail();
                this.log(`${player.name} rolled doubles and escaped Quarantine!`, true);
                this.movePlayer(player, total);
                this.turnPhase = 'action';
            } else if (player.jailTurns >= 3) {
                player.leaveJail();
                player.money -= 50;
                this.log(`${player.name} has been in Quarantine for 3 turns and pays £50 to leave`, true);
                this.movePlayer(player, total);
                this.turnPhase = 'action';
            } else {
                this.log(`${player.name} remains in Quarantine (${player.jailTurns}/3 turns)`);
                this.turnPhase = 'end';

                // If AI player, schedule end turn
                if (player.isAI) {
                    setTimeout(() => {
                        if (this.getCurrentPlayer().id === player.id && player.isAI) {
                            this.handleAITurn();
                        }
                    }, 1000);
                }
            }
            return { die1, die2, total, isDoubles };
        }

        // Handle doubles
        if (isDoubles) {
            this.consecutiveDoubles++;
            if (this.consecutiveDoubles >= 3) {
                this.log(`${player.name} rolled doubles 3 times! Go to Quarantine!`, true);
                player.sendToJail();
                this.consecutiveDoubles = 0;
                this.turnPhase = 'end';

                // Update UI to show jail position
                if (this.ui) {
                    this.ui.updateAll();
                }

                // If AI player, schedule end turn
                if (player.isAI) {
                    setTimeout(() => {
                        if (this.getCurrentPlayer().id === player.id && player.isAI) {
                            this.handleAITurn();
                        }
                    }, 1000);
                }

                return { die1, die2, total, isDoubles };
            }
            this.log(`${player.name} rolled doubles! They get another turn after this one.`);
        }

        // Move player
        this.movePlayer(player, total);
        this.turnPhase = 'action';

        return { die1, die2, total, isDoubles };
    }

    // Move player with animation
    movePlayer(player, spaces) {
        const startPosition = player.position;
        const finalPosition = (player.position + spaces) % this.board.spaces.length;
        let currentStep = 0;
        const animationSpeed = 300; // milliseconds per step

        // Disable actions during movement
        if (this.ui) {
            this.ui.rollDiceBtn.disabled = true;
        }

        const moveStep = () => {
            if (currentStep < spaces) {
                // Move one space
                player.position = (startPosition + currentStep + 1) % this.board.spaces.length;

                // Check if passed GO
                if (player.position === 0 && currentStep > 0) {
                    player.money += GameData.GO_BONUS;
                    this.log(`${player.name} passed GO and collected £${GameData.GO_BONUS}!`, true);
                }

                // Update UI
                if (this.ui) {
                    this.ui.updatePlayerPieces();
                    this.ui.updatePlayersList();
                }

                currentStep++;

                // Continue animation
                setTimeout(moveStep, animationSpeed);
            } else {
                // Animation complete
                this.log(`${player.name} moved to ${this.board.getSpace(player.position).name}`);

                // Land on space after animation
                this.landOnSpace(player);

                // Re-enable actions
                if (this.ui) {
                    this.ui.updateAll();
                }
            }
        };

        // Start the animation
        moveStep();
    }

    // Handle landing on a space
    landOnSpace(player) {
        const space = this.board.getSpace(player.position);

        switch(space.type) {
            case 'go':
                // Already handled in movePlayer (bonus collected on passing)
                this.log(`${player.name} landed on ${space.name}`);

                // If AI player, continue turn
                if (player.isAI) {
                    setTimeout(() => {
                        if (this.getCurrentPlayer().id === player.id && player.isAI) {
                            this.handleAITurn();
                        }
                    }, 800);
                }
                break;

            case 'property':
            case 'incident':
            case 'utility':
                if (!space.owner) {
                    this.log(`${space.name} is available for £${space.price}`);

                    // Handle differently for AI vs human
                    if (player.isAI) {
                        // AI will decide via its normal decision loop
                        // Schedule next AI turn to make buy/decline decision
                        setTimeout(() => {
                            if (this.getCurrentPlayer().id === player.id && player.isAI) {
                                this.handleAITurn();
                            }
                        }, 1000);
                    } else {
                        // Show purchase modal for human players
                        if (this.ui) {
                            this.ui.showPropertyPurchaseModal(space, player);
                        }
                    }
                } else if (space.owner !== player.id) {
                    const rent = this.board.calculateRent(space.id, this.lastDiceRoll[0] + this.lastDiceRoll[1]);
                    if (rent > 0) {
                        player.money -= rent;
                        this.players[space.owner].money += rent;
                        this.log(`${player.name} paid £${rent} rent to ${this.players[space.owner].name}`, true);

                        // Record memory for AI players
                        if (player.isAI) {
                            player.addMemory(`I paid £${rent} rent to ${this.players[space.owner].name} on ${space.name}`);
                        }
                        if (this.players[space.owner].isAI) {
                            this.players[space.owner].addMemory(`I collected £${rent} rent from ${player.name} on ${space.name}`);
                        }

                        // Check for bankruptcy
                        if (player.money < 0) {
                            this.handleBankruptcy(player, this.players[space.owner]);
                        }
                    }

                    // If AI player, continue their turn
                    if (player.isAI) {
                        setTimeout(() => {
                            if (this.getCurrentPlayer().id === player.id && player.isAI) {
                                this.handleAITurn();
                            }
                        }, 1000);
                    }
                }
                break;

            case 'phishing':
                this.log(`${player.name} drew a Phishing Email card`, true);
                const phishingCard = this.cardManager.drawPhishingCard();

                if (player.isAI) {
                    // For AI: Log card and execute immediately
                    this.log(`Card: ${phishingCard.title}`);
                    this.cardManager.executeCard(phishingCard, this, player);

                    // Continue AI turn
                    setTimeout(() => {
                        if (this.getCurrentPlayer().id === player.id && player.isAI) {
                            this.handleAITurn();
                        }
                    }, 1000);
                } else {
                    // For human: Show card modal
                    if (this.ui) {
                        this.ui.showCard(phishingCard, 'Phishing Email');
                    }
                    this.cardManager.executeCard(phishingCard, this, player);
                }
                break;

            case 'audit':
                this.log(`${player.name} drew a Security Audit card`, true);
                const auditCard = this.cardManager.drawAuditCard();

                if (player.isAI) {
                    // For AI: Log card and execute immediately
                    this.log(`Card: ${auditCard.title}`);
                    this.cardManager.executeCard(auditCard, this, player);

                    // Continue AI turn
                    setTimeout(() => {
                        if (this.getCurrentPlayer().id === player.id && player.isAI) {
                            this.handleAITurn();
                        }
                    }, 1000);
                } else {
                    // For human: Show card modal
                    if (this.ui) {
                        this.ui.showCard(auditCard, 'Security Audit');
                    }
                    this.cardManager.executeCard(auditCard, this, player);
                }
                break;

            case 'tax':
                if (player.isAI) {
                    // AI pays automatically
                    player.money -= space.amount;
                    this.log(`${player.name} (AI) paid £${space.amount} in ${space.name}`, true);

                    // Check for bankruptcy
                    if (player.money < 0) {
                        this.handleBankruptcy(player, null);
                    }

                    // Continue AI turn
                    setTimeout(() => {
                        if (this.getCurrentPlayer().id === player.id && player.isAI) {
                            this.handleAITurn();
                        }
                    }, 1000);
                } else {
                    // Show modal for human players
                    if (this.ui) {
                        this.ui.showTaxModal(space, player);
                    } else {
                        player.money -= space.amount;
                        this.log(`${player.name} paid £${space.amount} in ${space.name}`, true);
                    }
                }
                break;

            case 'go-to-jail':
                this.log(`${player.name} got hit with ransomware! Go to Quarantine!`, true);

                if (player.isAI) {
                    // AI goes to jail automatically
                    player.sendToJail();

                    // Continue AI turn (they'll handle jail on next turn)
                    setTimeout(() => {
                        if (this.getCurrentPlayer().id === player.id && player.isAI) {
                            this.handleAITurn();
                        }
                    }, 1000);
                } else {
                    // Show modal for human players
                    if (this.ui) {
                        this.ui.showGoToJailModal(space, player);
                    } else {
                        player.sendToJail();
                    }
                }
                break;

            case 'jail':
                this.log(`${player.name} is just visiting Quarantine`);

                // If AI player on visiting jail, continue turn
                if (player.isAI) {
                    setTimeout(() => {
                        if (this.getCurrentPlayer().id === player.id && player.isAI) {
                            this.handleAITurn();
                        }
                    }, 800);
                }
                break;

            case 'parking':
                this.log(`${player.name} is at ${space.name}`);

                // If AI player, continue turn
                if (player.isAI) {
                    setTimeout(() => {
                        if (this.getCurrentPlayer().id === player.id && player.isAI) {
                            this.handleAITurn();
                        }
                    }, 800);
                }
                break;
        }

        // Update UI
        if (this.ui) {
            this.ui.updateAll();
        }
    }

    // Buy property
    buyProperty() {
        const player = this.getCurrentPlayer();
        const space = this.board.getSpace(player.position);

        if (!space || space.owner !== null) {
            this.log("This property is not available for purchase");
            return false;
        }

        if (player.money < space.price) {
            this.log("Not enough money to buy this property");
            return false;
        }

        // Purchase
        player.money -= space.price;
        player.buyProperty(space.id);
        this.board.setOwner(space.id, player.id);

        this.log(`${player.name} bought ${space.name} for £${space.price}`, true);

        // Record memory for AI players
        if (player.isAI) {
            player.addMemory(`I bought ${space.name} for £${space.price}`);
        }

        if (this.ui) {
            this.ui.updateAll();
        }

        return true;
    }

    // Upgrade property (add houses/hotels)
    upgradeProperty(propertyId) {
        const player = this.getCurrentPlayer();

        if (this.board.upgrade(propertyId, player)) {
            const space = this.board.getSpace(propertyId);
            const level = space.hotel ? "hotel" : `${space.houses} security level(s)`;
            this.log(`${player.name} upgraded ${space.name} to ${level}`, true);

            if (this.ui) {
                this.ui.updateAll();
            }
            return true;
        }

        return false;
    }

    // Mortgage property
    mortgageProperty(propertyId) {
        const player = this.getCurrentPlayer();

        if (this.board.mortgage(propertyId, player)) {
            const space = this.board.getSpace(propertyId);
            this.log(`${player.name} mortgaged ${space.name} for £${space.mortgage}`, true);

            if (this.ui) {
                this.ui.updateAll();
            }
            return true;
        }

        return false;
    }

    // End turn
    endTurn() {
        const player = this.getCurrentPlayer();

        // Check if rolled doubles (get another turn)
        const isDoubles = this.lastDiceRoll[0] === this.lastDiceRoll[1];
        if (isDoubles && !player.inJail && this.consecutiveDoubles < 3 && this.turnPhase === 'action') {
            this.log(`${player.name} gets another turn for rolling doubles!`);
            this.turnPhase = 'roll';
            if (this.ui) this.ui.updateAll();

            // If current player is AI, continue their turn
            if (player.isAI) {
                setTimeout(() => this.handleAITurn(), 1500);
            }
            return;
        }

        // Reset doubles counter
        this.consecutiveDoubles = 0;

        // Next player
        do {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        } while (this.getCurrentPlayer().isBankrupt);

        this.turnPhase = 'roll';

        this.log(`${this.getCurrentPlayer().name}'s turn`, true);

        if (this.ui) {
            this.ui.updateAll();
        }

        // Check if game is over
        this.checkGameOver();

        // Start AI turn if next player is AI
        const nextPlayer = this.getCurrentPlayer();
        if (nextPlayer.isAI && this.gameState === 'playing') {
            setTimeout(() => this.handleAITurn(), 1500);
        }
    }

    // Pay to leave jail
    payJailFee() {
        const player = this.getCurrentPlayer();

        if (!player.inJail) return false;

        if (player.money < 50) {
            this.log("Not enough money to pay the £50 quarantine exit fee");
            return false;
        }

        player.money -= 50;
        player.leaveJail();
        this.log(`${player.name} paid £50 to leave Quarantine`, true);

        if (this.ui) {
            this.ui.updateAll();
        }

        return true;
    }

    // Handle bankruptcy
    handleBankruptcy(player, creditor) {
        this.log(`${player.name} is bankrupt!`, true);

        // Transfer all properties to creditor
        player.properties.forEach(propId => {
            const space = this.board.getSpace(propId);
            if (creditor) {
                // Transfer to creditor
                creditor.buyProperty(propId);
                this.board.setOwner(propId, creditor.id);
                // Remove mortgages if any
                space.mortgaged = false;
            } else {
                // Bank gets it back
                this.board.clearOwner(propId);
            }
        });

        player.properties = [];
        player.declareBankruptcy();

        if (this.ui) {
            this.ui.updateAll();
        }
    }

    // Check if game is over
    checkGameOver() {
        const activePlayers = this.players.filter(p => !p.isBankrupt);

        if (activePlayers.length === 1) {
            this.gameState = 'ended';
            this.log(`${activePlayers[0].name} wins the game!`, true);

            if (this.ui) {
                this.ui.showGameOver(activePlayers[0]);
            }
        }
    }

    // AI Turn Handling
    async handleAITurn() {
        const player = this.getCurrentPlayer();

        if (!player.isAI || this.gameState !== 'playing') {
            console.log('handleAITurn exiting early:', { isAI: player?.isAI, gameState: this.gameState });
            return;
        }

        // Prevent concurrent AI turns for the same player
        if (player._aiTurnInProgress) {
            console.warn('AI turn already in progress for', player.name);
            return;
        }
        player._aiTurnInProgress = true;

        // Show AI thinking indicator
        if (this.ui) {
            this.ui.showAIThinking(true);
        }

        try {
            // Get game state for AI
            const gameState = this.serializeGameState();

            // Get AI decision (with conversation history for memory)
            this.log(`${player.name} (AI) is thinking...`);
            const decision = await apiClient.getAIDecision(gameState, player, player.aiStrategy, player.conversationHistory);

            if (!decision || !decision.action) {
                throw new Error('Invalid AI decision received');
            }

            // Show AI commentary bubble if available
            if (decision.commentary && this.ui) {
                this.ui.showAICommentary(player.name, decision.commentary, player.color);
            }

            // Execute the decision
            await this.executeAIDecision(decision);

        } catch (error) {
            console.error('Error in AI turn:', error);
            this.log(`${player.name} (AI) encountered an error, ending turn`, true);

            // Force end turn to prevent getting stuck
            this.turnPhase = 'end';
            setTimeout(() => {
                if (this.getCurrentPlayer().id === player.id) {
                    this.endTurn();
                }
            }, 500);
        } finally {
            player._aiTurnInProgress = false;
            if (this.ui) {
                this.ui.showAIThinking(false);
            }
        }
    }

    // Serialize game state for AI
    serializeGameState() {
        return {
            board: {
                spaces: this.board.spaces
            },
            players: this.players.map(p => ({
                id: p.id,
                name: p.name,
                money: p.money,
                position: p.position,
                properties: p.properties,
                inJail: p.inJail,
                jailTurns: p.jailTurns,
                isBankrupt: p.isBankrupt
            })),
            currentPlayerIndex: this.currentPlayerIndex,
            turnPhase: this.turnPhase,
            lastDiceRoll: this.lastDiceRoll,
            consecutiveDoubles: this.consecutiveDoubles
        };
    }

    // Execute AI decision
    async executeAIDecision(decision) {
        const player = this.getCurrentPlayer();

        // Add delay for better UX
        await new Promise(resolve => setTimeout(resolve, 800));

        switch (decision.action) {
            case 'roll_dice':
                if (this.turnPhase === 'roll') {
                    this.log(`${player.name} (AI) rolls the dice`, true);
                    if (this.ui) {
                        this.ui.rollDice();
                    } else {
                        this.rollDice();
                    }
                } else {
                    // Fallback if wrong phase
                    this.endTurn();
                }
                break;

            case 'buy_property':
                this.log(`${player.name} (AI) decides to buy the property`, true);
                await new Promise(resolve => setTimeout(resolve, 500));
                const buySuccess = this.buyProperty();

                // After buying (or attempting to buy), AI needs to make next decision
                setTimeout(() => {
                    const currentPlayer = this.getCurrentPlayer();
                    if (currentPlayer && currentPlayer.isAI && currentPlayer.id === player.id && this.gameState === 'playing') {
                        this.handleAITurn();
                    } else {
                        console.warn('AI turn not continuing after buy_property:', {
                            currentPlayerId: currentPlayer?.id,
                            originalPlayerId: player.id,
                            isAI: currentPlayer?.isAI,
                            gameState: this.gameState
                        });
                    }
                }, 1000);
                break;

            case 'decline_property':
                this.log(`${player.name} (AI) declines to buy the property`);
                await new Promise(resolve => setTimeout(resolve, 500));
                // After declining, automatically move to end phase and end turn
                this.turnPhase = 'end';
                setTimeout(() => {
                    const currentPlayer = this.getCurrentPlayer();
                    if (currentPlayer && currentPlayer.isAI && currentPlayer.id === player.id && this.gameState === 'playing') {
                        this.endTurn();  // End turn directly instead of re-analyzing
                    }
                }, 800);
                break;

            case 'upgrade_property':
                if (decision.params && decision.params.property_id !== undefined) {
                    const space = this.board.getSpace(decision.params.property_id);
                    this.log(`${player.name} (AI) upgrades ${space.name}`, true);
                    await new Promise(resolve => setTimeout(resolve, 500));
                    this.upgradeProperty(decision.params.property_id);
                }
                // AI continues after upgrading
                setTimeout(() => {
                    const currentPlayer = this.getCurrentPlayer();
                    if (currentPlayer && currentPlayer.isAI && currentPlayer.id === player.id && this.gameState === 'playing') {
                        this.handleAITurn();
                    }
                }, 1000);
                break;

            case 'mortgage_property':
                if (decision.params && decision.params.property_id !== undefined) {
                    const space = this.board.getSpace(decision.params.property_id);
                    this.log(`${player.name} (AI) mortgages ${space.name}`, true);
                    await new Promise(resolve => setTimeout(resolve, 500));
                    this.mortgageProperty(decision.params.property_id);
                }
                // AI continues after mortgaging
                setTimeout(() => {
                    const currentPlayer = this.getCurrentPlayer();
                    if (currentPlayer && currentPlayer.isAI && currentPlayer.id === player.id && this.gameState === 'playing') {
                        this.handleAITurn();
                    }
                }, 1000);
                break;

            case 'pay_jail_fee':
                this.log(`${player.name} (AI) pays to leave Quarantine`, true);
                await new Promise(resolve => setTimeout(resolve, 500));
                this.payJailFee();
                // AI continues after paying
                setTimeout(() => {
                    const currentPlayer = this.getCurrentPlayer();
                    if (currentPlayer && currentPlayer.isAI && currentPlayer.id === player.id && this.gameState === 'playing') {
                        this.handleAITurn();
                    }
                }, 1000);
                break;

            case 'end_turn':
                this.log(`${player.name} (AI) ends their turn`);
                await new Promise(resolve => setTimeout(resolve, 500));
                this.endTurn();
                break;

            default:
                console.warn(`Unknown AI action: ${decision.action}`);
                this.endTurn();
        }
    }

    // Logging
    log(message, important = false) {
        console.log(message);

        if (this.ui) {
            this.ui.addLogEntry(message, important);
        }
    }

    // Save game
    saveGame() {
        const saveData = {
            players: this.players,
            currentPlayerIndex: this.currentPlayerIndex,
            board: this.board.spaces,
            gameState: this.gameState,
            turnPhase: this.turnPhase
        };

        localStorage.setItem('cyberopoly_save', JSON.stringify(saveData));
        this.log("Game saved!");
    }

    // Load game
    loadGame() {
        const saveData = localStorage.getItem('cyberopoly_save');

        if (!saveData) {
            this.log("No saved game found");
            return false;
        }

        try {
            const data = JSON.parse(saveData);

            // Restore players
            this.players = data.players.map((p, index) => {
                const player = new Player(p.name, p.id, p.color);
                Object.assign(player, p);
                return player;
            });

            this.currentPlayerIndex = data.currentPlayerIndex;
            this.board.spaces = data.board;
            this.gameState = data.gameState;
            this.turnPhase = data.turnPhase;

            this.log("Game loaded!", true);
            return true;

        } catch (error) {
            this.log("Error loading game");
            console.error(error);
            return false;
        }
    }
}

// Initialize game when page loads
let game;

window.addEventListener('DOMContentLoaded', () => {
    game = new Game();
    const ui = new UIManager(game);
    game.ui = ui;
});
