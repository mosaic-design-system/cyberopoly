// Player Class

class Player {
    constructor(name, id, color, token, isAI = false, aiStrategy = 'balanced') {
        this.name = name;
        this.id = id;
        this.color = color;
        this.token = token || GameData.tokens[id] || GameData.tokens[0];
        this.money = GameData.STARTING_MONEY;
        this.position = 0;
        this.properties = [];
        this.inJail = false;
        this.jailTurns = 0;
        this.jailFreeCards = 0;
        this.isBankrupt = false;
        this.doubleCount = 0;
        // AI properties
        this.isAI = isAI;
        this.aiStrategy = aiStrategy; // 'aggressive', 'balanced', 'defensive'
        this.conversationHistory = []; // Memory of game events for AI players
    }

    // Add memory entry for AI players (limited to last 10 events)
    addMemory(event) {
        if (!this.isAI) return; // Only track memory for AI players

        this.conversationHistory.push({
            turn: this.conversationHistory.length + 1,
            event: event,
            timestamp: Date.now()
        });

        // Keep only last 10 memories to avoid token bloat
        if (this.conversationHistory.length > 10) {
            this.conversationHistory.shift();
        }
    }

    // Money management
    addMoney(amount) {
        this.money += amount;
    }

    subtractMoney(amount) {
        this.money -= amount;
        if (this.money < 0) {
            return false; // Not enough money
        }
        return true;
    }

    // Property management
    buyProperty(propertyId) {
        if (!this.properties.includes(propertyId)) {
            this.properties.push(propertyId);
            return true;
        }
        return false;
    }

    removeProperty(propertyId) {
        const index = this.properties.indexOf(propertyId);
        if (index > -1) {
            this.properties.splice(index, 1);
            return true;
        }
        return false;
    }

    hasProperty(propertyId) {
        return this.properties.includes(propertyId);
    }

    // Check if player owns all properties in a group (monopoly)
    ownsMonopoly(group, board) {
        const groupProperties = GameData.propertyGroups[group];
        if (!groupProperties) return false;

        return groupProperties.every(propId => this.hasProperty(propId));
    }

    // Get all properties of a specific group the player owns
    getPropertiesInGroup(group) {
        const groupProperties = GameData.propertyGroups[group];
        if (!groupProperties) return [];

        return this.properties.filter(propId => groupProperties.includes(propId));
    }

    // Count properties by type
    countPropertiesByType(type, board) {
        return this.properties.filter(propId => {
            const space = board.getSpace(propId);
            return space && space.type === type;
        }).length;
    }

    // Jail management
    sendToJail() {
        this.inJail = true;
        this.jailTurns = 0;
        this.position = 10; // Quarantine is space 10
    }

    leaveJail() {
        this.inJail = false;
        this.jailTurns = 0;
    }

    // Get net worth (for bankruptcy calculations)
    getNetWorth(board) {
        let worth = this.money;

        // Add property values
        this.properties.forEach(propId => {
            const space = board.getSpace(propId);
            if (space) {
                worth += space.mortgage || space.price / 2;

                // Add upgrade values
                if (space.houses) {
                    worth += space.houses * space.upgradeCost / 2;
                }
                if (space.hotel) {
                    worth += space.upgradeCost / 2;
                }
            }
        });

        return worth;
    }

    // Declare bankruptcy
    declareBankruptcy() {
        this.isBankrupt = true;
    }
}

// Player colors
const PLAYER_COLORS = [
    '#ff4757', // Red
    '#1e90ff', // Blue
    '#2ed573', // Green
    '#ffa502', // Orange
    '#a55eea', // Purple
    '#fd79a8'  // Pink
];
