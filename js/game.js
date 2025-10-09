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
            const player = new Player(data.name, index, PLAYER_COLORS[index], data.token);
            this.players.push(player);
        });

        this.currentPlayerIndex = 0;
        this.board.reset();
        this.gameState = 'playing';
        this.turnPhase = 'roll';

        this.log(`Game started with ${this.players.length} players!`, true);
        this.log(`${this.getCurrentPlayer().name}'s turn`, true);
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
                // Already handled in movePlayer
                break;

            case 'property':
            case 'incident':
            case 'utility':
                if (!space.owner) {
                    this.log(`${space.name} is available for £${space.price}`);
                    // Show purchase modal
                    if (this.ui) {
                        this.ui.showPropertyPurchaseModal(space, player);
                    }
                } else if (space.owner !== player.id) {
                    const rent = this.board.calculateRent(space.id, this.lastDiceRoll[0] + this.lastDiceRoll[1]);
                    if (rent > 0) {
                        player.money -= rent;
                        this.players[space.owner].money += rent;
                        this.log(`${player.name} paid £${rent} rent to ${this.players[space.owner].name}`, true);

                        // Check for bankruptcy
                        if (player.money < 0) {
                            this.handleBankruptcy(player, this.players[space.owner]);
                        }
                    }
                }
                break;

            case 'phishing':
                this.log(`${player.name} drew a Phishing Email card`, true);
                const phishingCard = this.cardManager.drawPhishingCard();
                if (this.ui) {
                    this.ui.showCard(phishingCard, 'Phishing Email');
                }
                this.cardManager.executeCard(phishingCard, this, player);
                break;

            case 'audit':
                this.log(`${player.name} drew a Security Audit card`, true);
                const auditCard = this.cardManager.drawAuditCard();
                if (this.ui) {
                    this.ui.showCard(auditCard, 'Security Audit');
                }
                this.cardManager.executeCard(auditCard, this, player);
                break;

            case 'tax':
                if (this.ui) {
                    this.ui.showTaxModal(space, player);
                } else {
                    player.money -= space.amount;
                    this.log(`${player.name} paid £${space.amount} in ${space.name}`, true);
                }
                break;

            case 'go-to-jail':
                this.log(`${player.name} got hit with ransomware! Go to Quarantine!`, true);
                if (this.ui) {
                    this.ui.showGoToJailModal(space, player);
                } else {
                    player.sendToJail();
                }
                break;

            case 'jail':
                this.log(`${player.name} is just visiting Quarantine`);
                break;

            case 'parking':
                this.log(`${player.name} is at ${space.name}`);
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

        if (this.ui) {
            this.ui.updateAll();
            this.ui.showBuyButton(false);
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
