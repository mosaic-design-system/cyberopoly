// UI Manager

class UIManager {
    constructor(game) {
        this.game = game;
        this.initializeElements();
        this.setupEventListeners();
        this.showSetupScreen();
    }

    // Get DOM elements
    initializeElements() {
        // Screens
        this.setupScreen = document.getElementById('setup-screen');
        this.gameScreen = document.getElementById('game-screen');

        // Setup elements
        this.playerCountSelect = document.getElementById('player-count');
        this.playerNamesContainer = document.getElementById('player-names-container');
        this.startGameBtn = document.getElementById('start-game-btn');

        // Game elements
        this.board = document.getElementById('board');
        this.dice1 = document.getElementById('dice1');
        this.dice2 = document.getElementById('dice2');
        this.rollDiceBtn = document.getElementById('roll-dice-btn');

        // Action buttons
        this.buyPropertyBtn = document.getElementById('buy-property-btn');
        this.upgradePropertyBtn = document.getElementById('upgrade-property-btn');
        this.mortgageBtn = document.getElementById('mortgage-btn');
        this.tradeBtn = document.getElementById('trade-btn');
        this.endTurnBtn = document.getElementById('end-turn-btn');

        // Info panels
        this.playerTurnDisplay = document.getElementById('player-turn-display');
        this.playersList = document.getElementById('players-list');
        this.gameLog = document.getElementById('game-log');
        this.gameLogPanel = document.getElementById('game-log-panel');

        // Modal
        this.modal = document.getElementById('modal');
        this.modalBody = document.getElementById('modal-body');
        this.modalClose = document.querySelector('.close');
    }

    // Setup event listeners
    setupEventListeners() {
        // Setup screen
        this.playerCountSelect.addEventListener('change', () => this.updatePlayerNameInputs());
        this.startGameBtn.addEventListener('click', () => this.startGame());

        // Game buttons
        this.rollDiceBtn.addEventListener('click', () => this.rollDice());
        this.buyPropertyBtn.addEventListener('click', () => this.buyProperty());
        this.upgradePropertyBtn.addEventListener('click', () => this.showUpgradeMenu());
        this.mortgageBtn.addEventListener('click', () => this.showMortgageMenu());
        this.endTurnBtn.addEventListener('click', () => this.endTurn());

        // Game log toggle
        if (this.gameLogPanel) {
            const logHeader = this.gameLogPanel.querySelector('h3');
            if (logHeader) {
                logHeader.addEventListener('click', () => {
                    this.gameLogPanel.classList.toggle('collapsed');
                });
            }
        }

        // Modal
        this.modalClose.addEventListener('click', () => this.closeModal());
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }

    // Show setup screen
    showSetupScreen() {
        this.setupScreen.classList.add('active');
        this.gameScreen.classList.remove('active');
        this.updatePlayerNameInputs();
    }

    // Update player name inputs
    updatePlayerNameInputs() {
        const count = parseInt(this.playerCountSelect.value);
        this.playerNamesContainer.innerHTML = '';

        for (let i = 0; i < count; i++) {
            const div = document.createElement('div');
            div.className = 'player-setup-row';

            const label = document.createElement('label');
            label.textContent = `Player ${i + 1}:`;
            label.style.color = PLAYER_COLORS[i];
            label.className = 'player-label';

            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Player ${i + 1}`;
            input.value = `Player ${i + 1}`;
            input.dataset.playerId = i;
            input.className = 'player-name-field';

            // Token selector label
            const tokenLabel = document.createElement('div');
            tokenLabel.className = 'token-label';
            tokenLabel.textContent = 'Choose your token:';

            // Token selector
            const tokenSelector = document.createElement('div');
            tokenSelector.className = 'token-selector';

            GameData.tokens.forEach((token, tokenIndex) => {
                const tokenBtn = document.createElement('button');
                tokenBtn.type = 'button';
                tokenBtn.className = 'token-option';
                tokenBtn.textContent = token.icon;
                tokenBtn.title = token.name;
                tokenBtn.dataset.tokenId = token.id;
                tokenBtn.dataset.playerId = i;

                // Pre-select first few tokens for each player
                if (tokenIndex === i) {
                    tokenBtn.classList.add('selected');
                }

                tokenBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Deselect all tokens for this player
                    tokenSelector.querySelectorAll('.token-option').forEach(btn => {
                        btn.classList.remove('selected');
                    });
                    // Select this token
                    tokenBtn.classList.add('selected');
                });

                tokenSelector.appendChild(tokenBtn);
            });

            div.appendChild(label);
            div.appendChild(input);
            div.appendChild(tokenLabel);
            div.appendChild(tokenSelector);
            this.playerNamesContainer.appendChild(div);
        }
    }

    // Start game
    async startGame() {
        const rows = this.playerNamesContainer.querySelectorAll('.player-setup-row');
        const playerData = Array.from(rows).map((row, index) => {
            const nameInput = row.querySelector('.player-name-field');
            const selectedToken = row.querySelector('.token-option.selected');
            const tokenId = selectedToken ? selectedToken.dataset.tokenId : GameData.tokens[index].id;
            const token = GameData.tokens.find(t => t.id === tokenId) || GameData.tokens[index];

            return {
                name: nameInput.value || nameInput.placeholder,
                token: token
            };
        });

        // Initialize game
        this.game.startGame(playerData);

        // Build board
        this.buildBoard();

        // Show game screen
        this.setupScreen.classList.remove('active');
        this.gameScreen.classList.add('active');

        // Initialize 3D dice
        if (window.dice3D && !window.dice3D.isInitialized) {
            console.log("Initializing 3D dice...");
            await window.dice3D.initialize();
        }

        // Update UI
        this.updateAll();
    }

    // Build the board
    buildBoard() {
        this.board.innerHTML = '';

        // Calculate positions for each space
        const spaces = GameData.spaces;
        const boardSize = 900; // pixels
        const cornerSize = 115;
        const sideSize = 77;
        const sideSpaces = 9; // Spaces per side (excluding corners)

        spaces.forEach((space, index) => {
            const spaceElement = document.createElement('div');
            spaceElement.className = 'space';
            spaceElement.dataset.spaceId = space.id;
            spaceElement.dataset.spaceType = space.type;

            // Position calculation
            let left, top, width, height, additionalClass;

            if (index === 0) {
                // GO - bottom right corner
                left = boardSize - cornerSize;
                top = boardSize - cornerSize;
                width = cornerSize;
                height = cornerSize;
                additionalClass = 'corner';
            } else if (index < 10) {
                // Bottom row (right to left)
                left = boardSize - cornerSize - (index * sideSize);
                top = boardSize - cornerSize;
                width = sideSize;
                height = cornerSize;
                additionalClass = 'bottom';
            } else if (index === 10) {
                // Jail - bottom left corner
                left = 0;
                top = boardSize - cornerSize;
                width = cornerSize;
                height = cornerSize;
                additionalClass = 'corner';
            } else if (index < 20) {
                // Left column (bottom to top)
                const position = index - 10;
                left = 0;
                top = boardSize - cornerSize - (position * sideSize);
                width = cornerSize;
                height = sideSize;
                additionalClass = 'left';
            } else if (index === 20) {
                // Free parking - top left corner
                left = 0;
                top = 0;
                width = cornerSize;
                height = cornerSize;
                additionalClass = 'corner';
            } else if (index < 30) {
                // Top row (left to right)
                const position = index - 20;
                left = position * sideSize;
                top = 0;
                width = sideSize;
                height = cornerSize;
                additionalClass = 'top';
            } else if (index === 30) {
                // Go to jail - top right corner
                left = boardSize - cornerSize;
                top = 0;
                width = cornerSize;
                height = cornerSize;
                additionalClass = 'corner';
            } else {
                // Right column (top to bottom)
                const position = index - 30;
                left = boardSize - cornerSize;
                top = position * sideSize;
                width = cornerSize;
                height = sideSize;
                additionalClass = 'right';
            }

            spaceElement.classList.add(additionalClass);
            spaceElement.style.left = left + 'px';
            spaceElement.style.top = top + 'px';
            spaceElement.style.width = width + 'px';
            spaceElement.style.height = height + 'px';

            // Add space content
            if (space.type === 'property') {
                const colorBar = document.createElement('div');
                colorBar.className = `space-color-bar color-${space.group}`;
                spaceElement.appendChild(colorBar);
            }

            const nameElement = document.createElement('div');
            nameElement.className = 'space-name';
            nameElement.textContent = space.name;
            spaceElement.appendChild(nameElement);

            if (space.price) {
                const priceElement = document.createElement('div');
                priceElement.className = 'space-price';
                priceElement.textContent = `£${space.price}`;
                spaceElement.appendChild(priceElement);
            }

            const ownerIndicator = document.createElement('div');
            ownerIndicator.className = 'space-owner-indicator';
            spaceElement.appendChild(ownerIndicator);

            // Click handler
            spaceElement.addEventListener('click', () => this.showSpaceInfo(space));

            this.board.appendChild(spaceElement);
        });

        // Create player pieces
        this.game.players.forEach((player, index) => {
            const piece = document.createElement('div');
            piece.className = `player-piece player-${index}`;
            piece.dataset.playerId = player.id;
            piece.textContent = player.token.icon;
            piece.style.backgroundColor = player.color;
            this.board.appendChild(piece);
        });
    }

    // Update player pieces positions
    updatePlayerPieces() {
        this.game.players.forEach((player) => {
            const piece = this.board.querySelector(`.player-piece[data-player-id="${player.id}"]`);
            if (piece) {
                const spaceElement = this.board.querySelector(`.space[data-space-id="${player.position}"]`);
                if (spaceElement) {
                    const rect = spaceElement.getBoundingClientRect();
                    const boardRect = this.board.getBoundingClientRect();

                    // Position in center of space with offset for multiple players
                    const playersOnSpace = this.game.players.filter(p => p.position === player.position);
                    const indexOnSpace = playersOnSpace.indexOf(player);
                    const offset = indexOnSpace * 20;

                    const newLeft = spaceElement.offsetLeft + spaceElement.offsetWidth / 2 - 14 + offset;
                    const newTop = spaceElement.offsetTop + spaceElement.offsetHeight / 2 - 14;

                    // Add moving animation class if position changed
                    const oldLeft = parseFloat(piece.style.left) || 0;
                    const oldTop = parseFloat(piece.style.top) || 0;

                    if (Math.abs(newLeft - oldLeft) > 5 || Math.abs(newTop - oldTop) > 5) {
                        piece.classList.add('moving');
                        setTimeout(() => {
                            piece.classList.remove('moving');
                        }, 300);
                    }

                    piece.style.left = newLeft + 'px';
                    piece.style.top = newTop + 'px';
                }
            }
        });
    }

    // Update board space owners
    updateSpaceOwners() {
        GameData.spaces.forEach((space) => {
            const spaceElement = this.board.querySelector(`.space[data-space-id="${space.id}"]`);
            if (spaceElement) {
                const ownerIndicator = spaceElement.querySelector('.space-owner-indicator');
                const boardSpace = this.game.board.getSpace(space.id);

                if (boardSpace.owner !== null && boardSpace.owner !== undefined) {
                    const player = this.game.players[boardSpace.owner];
                    ownerIndicator.style.backgroundColor = player.color;
                } else {
                    ownerIndicator.style.backgroundColor = 'transparent';
                }

                // Show houses/hotels
                const existingUpgrades = spaceElement.querySelectorAll('.upgrade-indicator');
                existingUpgrades.forEach(el => el.remove());

                if (boardSpace.houses > 0) {
                    for (let i = 0; i < boardSpace.houses; i++) {
                        const house = document.createElement('div');
                        house.className = 'upgrade-indicator house';
                        house.style.cssText = `
                            width: 8px;
                            height: 8px;
                            background: #2ed573;
                            position: absolute;
                            bottom: 20px;
                            left: ${10 + (i * 10)}px;
                            border-radius: 2px;
                        `;
                        spaceElement.appendChild(house);
                    }
                } else if (boardSpace.hotel) {
                    const hotel = document.createElement('div');
                    hotel.className = 'upgrade-indicator hotel';
                    hotel.style.cssText = `
                        width: 15px;
                        height: 15px;
                        background: #ff4757;
                        position: absolute;
                        bottom: 20px;
                        left: 20px;
                        border-radius: 3px;
                    `;
                    spaceElement.appendChild(hotel);
                }

                // Show mortgaged
                if (boardSpace.mortgaged) {
                    spaceElement.style.opacity = '0.5';
                } else {
                    spaceElement.style.opacity = '1';
                }
            }
        });
    }

    // Update players list
    updatePlayersList() {
        this.playersList.innerHTML = '';

        this.game.players.forEach((player) => {
            const card = document.createElement('div');
            card.className = 'player-card';

            if (player.id === this.game.getCurrentPlayer().id) {
                card.classList.add('active');
            }

            const header = document.createElement('div');
            header.className = 'player-card-header';

            const tokenIcon = document.createElement('div');
            tokenIcon.className = 'player-token-icon';
            tokenIcon.textContent = player.token.icon;
            tokenIcon.style.backgroundColor = player.color;

            const name = document.createElement('div');
            name.className = 'player-name';
            name.textContent = player.name;
            if (player.isBankrupt) {
                name.textContent += ' (Bankrupt)';
                name.style.textDecoration = 'line-through';
            }

            const money = document.createElement('div');
            money.className = 'player-money';
            money.textContent = `£${player.money}`;

            header.appendChild(tokenIcon);
            header.appendChild(name);
            header.appendChild(money);

            const properties = document.createElement('div');
            properties.className = 'player-properties';
            properties.textContent = `Properties: ${player.properties.length}`;
            if (player.inJail) {
                properties.textContent += ' | IN QUARANTINE';
            }

            card.appendChild(header);
            card.appendChild(properties);

            this.playersList.appendChild(card);
        });
    }

    // Update current turn display
    updateTurnDisplay() {
        const player = this.game.getCurrentPlayer();
        this.playerTurnDisplay.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; justify-content: center;">
                <div style="width: 35px; height: 35px; border-radius: 50%; background: ${player.color}; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-size: 1.2em;">${player.token.icon}</div>
                <div style="font-size: 1.2em; font-weight: bold;">${player.name}</div>
            </div>
            <div style="text-align: center; margin-top: 10px; color: var(--primary-color);">£${player.money}</div>
        `;
    }

    // Update action buttons
    updateActionButtons() {
        const player = this.game.getCurrentPlayer();
        const space = this.game.board.getSpace(player.position);

        // Roll dice button
        this.rollDiceBtn.disabled = this.game.turnPhase !== 'roll';

        // Buy property button - hidden since we use modal now
        this.buyPropertyBtn.style.display = 'none';

        // Upgrade button
        const hasUpgradableProperty = player.properties.some(propId =>
            this.game.board.canUpgrade(propId, player)
        );
        this.upgradePropertyBtn.disabled = !hasUpgradableProperty;

        // Mortgage button
        this.mortgageBtn.disabled = player.properties.length === 0;

        // Trade button (not implemented yet)
        this.tradeBtn.disabled = true;

        // End turn button
        this.endTurnBtn.disabled = this.game.turnPhase === 'roll';
    }

    // Roll dice
    async rollDice() {
        // Check if 3D dice is available
        if (window.dice3D && window.dice3D.isInitialized) {
            // Use 3D dice
            this.rollDiceBtn.disabled = true;
            window.dice3D.show();

            try {
                const diceResult = await window.dice3D.roll();

                if (diceResult) {
                    // Update the visual dice display
                    this.dice1.textContent = diceResult.die1;
                    this.dice2.textContent = diceResult.die2;

                    // Pass the result to the game with specific values
                    const gameResult = this.game.rollDice(diceResult.die1, diceResult.die2);

                    // Wait a moment to show the dice
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    // Hide and clear the 3D dice
                    window.dice3D.hide();

                    // Small delay before clearing
                    setTimeout(() => {
                        window.dice3D.clear();
                    }, 300);

                    this.updateAll();
                }
            } catch (error) {
                console.error("Error with 3D dice:", error);
                // Fall back to regular dice roll
                this.rollDiceFallback();
            }

            this.rollDiceBtn.disabled = false;
        } else {
            // Fallback to simple dice animation
            this.rollDiceFallback();
        }
    }

    // Fallback dice roll (original animation)
    rollDiceFallback() {
        this.dice1.classList.add('rolling');
        this.dice2.classList.add('rolling');

        setTimeout(() => {
            const result = this.game.rollDice();

            if (result) {
                this.dice1.textContent = result.die1;
                this.dice2.textContent = result.die2;

                this.dice1.classList.remove('rolling');
                this.dice2.classList.remove('rolling');

                this.updateAll();
            }
        }, 500);
    }

    // Handle property purchase from modal
    handlePropertyPurchase() {
        this.closeModal();
        this.game.buyProperty();
    }

    // Show upgrade menu
    showUpgradeMenu() {
        const player = this.game.getCurrentPlayer();
        const upgradableProperties = player.properties.filter(propId =>
            this.game.board.canUpgrade(propId, player)
        );

        let html = '<h2>Upgrade Security</h2>';
        html += '<p>Select a property to upgrade:</p>';
        html += '<div style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">';

        upgradableProperties.forEach(propId => {
            const space = this.game.board.getSpace(propId);
            const currentLevel = space.hotel ? 'Hotel' : (space.houses > 0 ? `${space.houses} Level(s)` : 'Base');

            html += `
                <button class="btn" onclick="game.upgradeProperty(${propId}); game.ui.closeModal();" style="text-align: left;">
                    <strong>${space.name}</strong><br>
                    Current: ${currentLevel} | Cost: £${space.upgradeCost}
                </button>
            `;
        });

        html += '</div>';

        this.showModal(html);
    }

    // Show mortgage menu
    showMortgageMenu() {
        const player = this.game.getCurrentPlayer();

        let html = '<h2>Mortgage Properties</h2>';
        html += '<p>Select a property to mortgage or unmortgage:</p>';
        html += '<div style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">';

        player.properties.forEach(propId => {
            const space = this.game.board.getSpace(propId);
            const canMortgage = !space.mortgaged && (!space.houses || space.houses === 0) && !space.hotel;
            const canUnmortgage = space.mortgaged && player.money >= Math.floor(space.mortgage * 1.1);

            if (canMortgage) {
                html += `
                    <button class="btn" onclick="game.mortgageProperty(${propId}); game.ui.closeModal();">
                        Mortgage <strong>${space.name}</strong> for £${space.mortgage}
                    </button>
                `;
            } else if (canUnmortgage) {
                html += `
                    <button class="btn" onclick="game.board.unmortgage(${propId}, game.getCurrentPlayer()); game.ui.closeModal(); game.ui.updateAll();">
                        Unmortgage <strong>${space.name}</strong> for £${Math.floor(space.mortgage * 1.1)}
                    </button>
                `;
            } else {
                html += `
                    <button class="btn" disabled>
                        ${space.name} ${space.mortgaged ? '(Mortgaged - not enough money)' : '(Cannot mortgage with upgrades)'}
                    </button>
                `;
            }
        });

        html += '</div>';

        this.showModal(html);
    }

    // End turn
    endTurn() {
        this.game.endTurn();
    }

    // Show tax/fine modal
    showTaxModal(space, player) {
        let html = `<div class="tax-modal">`;
        html += `<h2 style="color: var(--danger-color); margin-bottom: 20px;">⚠️ ${space.name}</h2>`;

        // Description
        if (space.description) {
            html += `<div class="property-description" style="margin: 15px 0; line-height: 1.6; font-size: 1.1em;">${space.description}</div>`;
        }

        // Educational content - highlighted
        if (space.education) {
            html += `
                <div class="card-education" style="margin: 20px 0;">
                    <h3 style="color: var(--primary-color); font-size: 1.1em; margin-bottom: 10px;">🎓 Cybersecurity Education</h3>
                    <p style="line-height: 1.6;">${space.education}</p>
                </div>
            `;
        }

        // Fine amount
        html += `<div style="text-align: center; margin: 20px 0; padding: 20px; background: var(--bg-dark); border-radius: 8px; border: 2px solid var(--danger-color);">`;
        html += `<div style="font-size: 0.9em; color: var(--text-secondary); margin-bottom: 10px;">Fine Amount:</div>`;
        html += `<div style="font-size: 2em; color: var(--danger-color); font-weight: bold;">£${space.amount}</div>`;
        html += `</div>`;

        // Player's remaining money
        const remainingMoney = player.money - space.amount;
        html += `<div style="text-align: center; margin: 15px 0; padding: 15px; background: var(--bg-light); border-radius: 8px;">`;
        html += `<div style="font-size: 0.9em; color: var(--text-secondary);">Your Money After Payment:</div>`;
        html += `<div style="font-size: 1.3em; color: ${remainingMoney < 0 ? 'var(--danger-color)' : 'var(--primary-color)'}; font-weight: bold;">£${remainingMoney}</div>`;
        if (remainingMoney < 0) {
            html += `<div style="color: var(--danger-color); margin-top: 10px; font-weight: bold;">⚠️ Warning: You'll be in debt!</div>`;
        }
        html += `</div>`;

        // Action button
        html += `<button class="btn btn-primary" onclick="game.ui.handleTaxPayment(${space.amount}); game.ui.closeModal();" style="width: 100%; font-size: 1.1em; padding: 15px; margin-top: 20px;">
            💸 Pay Fine
        </button>`;

        html += `</div>`;

        this.showModal(html);
    }

    // Handle tax payment
    handleTaxPayment(amount) {
        const player = this.game.getCurrentPlayer();
        player.money -= amount;
        this.game.log(`${player.name} paid £${amount} fine`, true);

        // Check for bankruptcy
        if (player.money < 0) {
            this.game.handleBankruptcy(player, null);
        }

        this.updateAll();
    }

    // Show Go to Jail modal
    showGoToJailModal(space, player) {
        let html = `<div class="jail-modal">`;
        html += `<h2 style="color: var(--danger-color); margin-bottom: 20px;">🚨 Ransomware Attack!</h2>`;
        html += `<div style="font-size: 3em; text-align: center; margin: 20px 0;">💀🔒</div>`;

        // Description
        if (space.description) {
            html += `<div class="property-description" style="margin: 15px 0; line-height: 1.6; font-size: 1.1em;">${space.description}</div>`;
        }

        // Educational content
        if (space.education) {
            html += `
                <div class="card-education" style="margin: 20px 0;">
                    <h3 style="color: var(--primary-color); font-size: 1.1em; margin-bottom: 10px;">🎓 Cybersecurity Education</h3>
                    <p style="line-height: 1.6;">${space.education}</p>
                </div>
            `;
        }

        // Consequences
        html += `<div style="text-align: center; margin: 20px 0; padding: 20px; background: var(--bg-dark); border-radius: 8px; border: 2px solid var(--danger-color);">`;
        html += `<div style="font-size: 1.2em; color: var(--danger-color); font-weight: bold; margin-bottom: 15px;">Your system is quarantined!</div>`;
        html += `<div style="color: var(--text-primary); line-height: 1.6;">`;
        html += `<p>To escape quarantine, you can:</p>`;
        html += `<ul style="text-align: left; margin: 10px auto; max-width: 300px;">`;
        html += `<li>Roll doubles on your next turn</li>`;
        html += `<li>Pay £50 to exit immediately</li>`;
        html += `<li>Wait 3 turns (auto-pay £50)</li>`;
        html += `</ul>`;
        html += `</div>`;
        html += `</div>`;

        // Action button
        html += `<button class="btn btn-primary" onclick="game.ui.handleGoToJail(); game.ui.closeModal();" style="width: 100%; font-size: 1.1em; padding: 15px; margin-top: 20px; background: var(--danger-color);">
            🔒 Go to Quarantine
        </button>`;

        html += `</div>`;

        this.showModal(html);
    }

    // Handle go to jail
    handleGoToJail() {
        const player = this.game.getCurrentPlayer();
        player.sendToJail();
        this.updateAll();
    }

    // Show property purchase modal
    showPropertyPurchaseModal(space, player) {
        const canAfford = player.money >= space.price;

        let html = `<div class="property-purchase-modal">`;
        html += `<h2 style="color: var(--warning-color); margin-bottom: 20px;">💰 Property Available!</h2>`;
        html += `<h3 style="color: var(--primary-color); font-size: 1.5em; margin-bottom: 15px;">${space.name}</h3>`;

        // Property Type Badge
        let typeBadge = '';
        if (space.type === 'property') {
            const groupColors = {
                brown: '#8b4513',
                lightblue: '#87ceeb',
                pink: '#ff1493',
                orange: '#ff8c00',
                red: '#dc143c',
                yellow: '#ffd700',
                green: '#32cd32',
                darkblue: '#00008b'
            };
            typeBadge = `<div style="display: inline-block; padding: 5px 15px; background: ${groupColors[space.group]}; border-radius: 20px; margin-bottom: 15px; font-weight: bold; text-transform: uppercase; font-size: 0.9em;">Property</div>`;
        } else if (space.type === 'incident') {
            typeBadge = `<div style="display: inline-block; padding: 5px 15px; background: var(--warning-color); border-radius: 20px; margin-bottom: 15px; font-weight: bold; text-transform: uppercase; font-size: 0.9em;">Incident Response Team</div>`;
        } else if (space.type === 'utility') {
            typeBadge = `<div style="display: inline-block; padding: 5px 15px; background: var(--success-color); border-radius: 20px; margin-bottom: 15px; font-weight: bold; text-transform: uppercase; font-size: 0.9em;">Certification</div>`;
        }
        html += typeBadge;

        // Description
        if (space.description) {
            html += `<div class="property-description" style="margin: 15px 0; line-height: 1.6;">${space.description}</div>`;
        }

        // Educational content - highlighted
        if (space.education) {
            html += `
                <div class="card-education" style="margin: 20px 0;">
                    <h3 style="color: var(--primary-color); font-size: 1.1em; margin-bottom: 10px;">🎓 Cybersecurity Education</h3>
                    <p style="line-height: 1.6;">${space.education}</p>
                </div>
            `;
        }

        // Property Stats
        if (space.type === 'property') {
            html += `<div class="property-stats" style="margin: 20px 0;">`;
            html += `<div class="stat-row"><span class="stat-label">Purchase Price:</span><span class="stat-value" style="font-size: 1.2em; font-weight: bold;">£${space.price}</span></div>`;
            html += `<div class="stat-row"><span class="stat-label">Base Rent:</span><span class="stat-value">£${space.rent[0]}</span></div>`;
            if (space.rent[1]) html += `<div class="stat-row"><span class="stat-label">With 1 Security Level:</span><span class="stat-value">£${space.rent[1]}</span></div>`;
            if (space.rent[2]) html += `<div class="stat-row"><span class="stat-label">With 2 Security Levels:</span><span class="stat-value">£${space.rent[2]}</span></div>`;
            if (space.rent[3]) html += `<div class="stat-row"><span class="stat-label">With 3 Security Levels:</span><span class="stat-value">£${space.rent[3]}</span></div>`;
            if (space.rent[4]) html += `<div class="stat-row"><span class="stat-label">With 4 Security Levels:</span><span class="stat-value">£${space.rent[4]}</span></div>`;
            if (space.rent[5]) html += `<div class="stat-row"><span class="stat-label">With Advanced Security:</span><span class="stat-value">£${space.rent[5]}</span></div>`;
            html += `<div class="stat-row"><span class="stat-label">Security Upgrade Cost:</span><span class="stat-value">£${space.upgradeCost}</span></div>`;
            html += `<div class="stat-row"><span class="stat-label">Mortgage Value:</span><span class="stat-value">£${space.mortgage}</span></div>`;
            html += `</div>`;
        } else if (space.type === 'incident') {
            html += `<div class="property-stats" style="margin: 20px 0;">`;
            html += `<div class="stat-row"><span class="stat-label">Purchase Price:</span><span class="stat-value" style="font-size: 1.2em; font-weight: bold;">£${space.price}</span></div>`;
            html += `<div class="stat-row"><span class="stat-label">With 1 Team:</span><span class="stat-value">£${space.rent[0]}</span></div>`;
            html += `<div class="stat-row"><span class="stat-label">With 2 Teams:</span><span class="stat-value">£${space.rent[1]}</span></div>`;
            html += `<div class="stat-row"><span class="stat-label">With 3 Teams:</span><span class="stat-value">£${space.rent[2]}</span></div>`;
            html += `<div class="stat-row"><span class="stat-label">With 4 Teams:</span><span class="stat-value">£${space.rent[3]}</span></div>`;
            html += `<div class="stat-row"><span class="stat-label">Mortgage Value:</span><span class="stat-value">£${space.mortgage}</span></div>`;
            html += `</div>`;
        } else if (space.type === 'utility') {
            html += `<div class="property-stats" style="margin: 20px 0;">`;
            html += `<div class="stat-row"><span class="stat-label">Purchase Price:</span><span class="stat-value" style="font-size: 1.2em; font-weight: bold;">£${space.price}</span></div>`;
            html += `<div class="stat-row"><span class="stat-label">Rent:</span><span class="stat-value">4x dice roll (1 cert) or 10x dice roll (2 certs)</span></div>`;
            html += `<div class="stat-row"><span class="stat-label">Mortgage Value:</span><span class="stat-value">£${space.mortgage}</span></div>`;
            html += `</div>`;
        }

        // Player's current money
        html += `<div style="text-align: center; margin: 20px 0; padding: 15px; background: var(--bg-dark); border-radius: 8px; border: 1px solid var(--border-color);">`;
        html += `<div style="font-size: 0.9em; color: var(--text-secondary);">Your Money:</div>`;
        html += `<div style="font-size: 1.5em; color: var(--primary-color); font-weight: bold;">£${player.money}</div>`;
        if (!canAfford) {
            html += `<div style="color: var(--danger-color); margin-top: 10px; font-weight: bold;">⚠️ Not enough money!</div>`;
        }
        html += `</div>`;

        // Action buttons
        html += `<div style="display: flex; gap: 10px; margin-top: 20px;">`;
        if (canAfford) {
            html += `<button class="btn btn-primary" onclick="game.ui.handlePropertyPurchase();" style="flex: 1; font-size: 1.1em; padding: 15px;">
                💳 Buy for £${space.price}
            </button>`;
        } else {
            html += `<button class="btn" disabled style="flex: 1;">Cannot Afford</button>`;
        }
        html += `<button class="btn" onclick="game.ui.closeModal();" style="flex: 1;">
            ❌ Decline
        </button>`;
        html += `</div>`;

        html += `</div>`;

        this.showModal(html);
    }

    // Show space info (for clicking on spaces)
    showSpaceInfo(space) {
        let html = `<div class="property-card">`;
        html += `<h2>${space.name}</h2>`;

        if (space.description) {
            html += `<div class="property-description">${space.description}</div>`;
        }

        if (space.education) {
            html += `
                <div class="card-education">
                    <h3>💡 Learn More</h3>
                    <p>${space.education}</p>
                </div>
            `;
        }

        if (space.type === 'property') {
            html += `<div class="property-stats">`;
            html += `<div class="stat-row"><span class="stat-label">Price:</span><span class="stat-value">£${space.price}</span></div>`;
            html += `<div class="stat-row"><span class="stat-label">Rent:</span><span class="stat-value">£${space.rent[0]}</span></div>`;
            if (space.rent[1]) html += `<div class="stat-row"><span class="stat-label">With 1 Level:</span><span class="stat-value">£${space.rent[1]}</span></div>`;
            if (space.rent[2]) html += `<div class="stat-row"><span class="stat-label">With 2 Levels:</span><span class="stat-value">£${space.rent[2]}</span></div>`;
            if (space.rent[3]) html += `<div class="stat-row"><span class="stat-label">With 3 Levels:</span><span class="stat-value">£${space.rent[3]}</span></div>`;
            if (space.rent[4]) html += `<div class="stat-row"><span class="stat-label">With 4 Levels:</span><span class="stat-value">£${space.rent[4]}</span></div>`;
            if (space.rent[5]) html += `<div class="stat-row"><span class="stat-label">With Hotel:</span><span class="stat-value">£${space.rent[5]}</span></div>`;
            html += `<div class="stat-row"><span class="stat-label">Upgrade Cost:</span><span class="stat-value">£${space.upgradeCost}</span></div>`;
            html += `<div class="stat-row"><span class="stat-label">Mortgage Value:</span><span class="stat-value">£${space.mortgage}</span></div>`;
            html += `</div>`;
        }

        html += `</div>`;

        this.showModal(html);
    }

    // Show card
    showCard(card, type) {
        let html = `<div class="card-display">`;
        html += `<h2>${type}</h2>`;
        html += `<h3 style="color: var(--warning-color); margin: 15px 0;">${card.title}</h3>`;
        html += `<div class="card-content">${card.description}</div>`;

        if (card.education) {
            html += `
                <div class="card-education">
                    <h3>💡 Cybersecurity Lesson</h3>
                    <p>${card.education}</p>
                </div>
            `;
        }

        html += `<button class="btn btn-primary" onclick="game.ui.closeModal()" style="margin-top: 20px; width: 100%;">Continue</button>`;
        html += `</div>`;

        this.showModal(html);
    }

    // Show game over
    showGameOver(winner) {
        let html = `<div class="card-display">`;
        html += `<h2 style="color: var(--success-color);">Game Over!</h2>`;
        html += `<h3 style="font-size: 2em; margin: 20px 0;">${winner.name} Wins!</h3>`;
        html += `<div class="property-stats">`;
        html += `<div class="stat-row"><span class="stat-label">Final Money:</span><span class="stat-value">£${winner.money}</span></div>`;
        html += `<div class="stat-row"><span class="stat-label">Properties Owned:</span><span class="stat-value">${winner.properties.length}</span></div>`;
        html += `<div class="stat-row"><span class="stat-label">Net Worth:</span><span class="stat-value">£${winner.getNetWorth(this.game.board)}</span></div>`;
        html += `</div>`;
        html += `<button class="btn btn-primary" onclick="location.reload()" style="margin-top: 20px; width: 100%;">New Game</button>`;
        html += `</div>`;

        this.showModal(html);
    }

    // Modal management
    showModal(html) {
        this.modalBody.innerHTML = html;
        this.modal.classList.add('active');
    }

    closeModal() {
        this.modal.classList.remove('active');
    }

    // Add log entry
    addLogEntry(message, important = false) {
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        if (important) entry.classList.add('important');
        entry.textContent = message;

        this.gameLog.insertBefore(entry, this.gameLog.firstChild);

        // Keep only last 50 entries
        while (this.gameLog.children.length > 50) {
            this.gameLog.removeChild(this.gameLog.lastChild);
        }
    }

    // Update all UI elements
    updateAll() {
        this.updatePlayerPieces();
        this.updateSpaceOwners();
        this.updatePlayersList();
        this.updateTurnDisplay();
        this.updateActionButtons();
    }
}
