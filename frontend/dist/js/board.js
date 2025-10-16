// Board Class

class Board {
    constructor() {
        this.spaces = this.initializeSpaces();
    }

    initializeSpaces() {
        // Clone the spaces from GameData and add additional properties
        return GameData.spaces.map(space => {
            const newSpace = { ...space };

            // Add ownership and upgrade properties
            if (space.type === 'property') {
                newSpace.owner = null;
                newSpace.houses = 0;
                newSpace.hotel = false;
                newSpace.mortgaged = false;
            }

            if (space.type === 'incident' || space.type === 'utility') {
                newSpace.owner = null;
                newSpace.mortgaged = false;
            }

            return newSpace;
        });
    }

    getSpace(id) {
        return this.spaces[id];
    }

    // Get all spaces of a certain type
    getSpacesByType(type) {
        return this.spaces.filter(space => space.type === type);
    }

    // Get all spaces in a property group
    getSpacesInGroup(group) {
        return this.spaces.filter(space => space.group === group);
    }

    // Property ownership
    setOwner(spaceId, playerId) {
        const space = this.getSpace(spaceId);
        if (space && (space.type === 'property' || space.type === 'incident' || space.type === 'utility')) {
            space.owner = playerId;
            return true;
        }
        return false;
    }

    clearOwner(spaceId) {
        const space = this.getSpace(spaceId);
        if (space) {
            space.owner = null;
            space.houses = 0;
            space.hotel = false;
            space.mortgaged = false;
            return true;
        }
        return false;
    }

    // Upgrade management (houses/hotels = security levels)
    canUpgrade(spaceId, player) {
        const space = this.getSpace(spaceId);

        if (!space || space.type !== 'property') return false;
        if (space.owner !== player.id) return false;
        if (space.mortgaged) return false;
        if (space.hotel) return false; // Already max level

        // Must own monopoly to upgrade
        if (!player.ownsMonopoly(space.group, this)) return false;

        // Check if player can afford
        if (player.money < space.upgradeCost) return false;

        // Check even building rule (all properties in group must be within 1 upgrade of each other)
        const groupSpaces = this.getSpacesInGroup(space.group);
        const minHouses = Math.min(...groupSpaces.map(s => s.houses || 0));

        if (space.houses > minHouses) return false;

        return true;
    }

    upgrade(spaceId, player) {
        if (!this.canUpgrade(spaceId, player)) return false;

        const space = this.getSpace(spaceId);
        player.money -= space.upgradeCost;

        if (space.houses < 4) {
            space.houses++;
        } else {
            // Convert 4 houses to hotel
            space.houses = 0;
            space.hotel = true;
        }

        return true;
    }

    downgrade(spaceId) {
        const space = this.getSpace(spaceId);

        if (!space || space.type !== 'property') return false;

        if (space.hotel) {
            space.hotel = false;
            space.houses = 4;
            return space.upgradeCost / 2;
        } else if (space.houses > 0) {
            space.houses--;
            return space.upgradeCost / 2;
        }

        return 0;
    }

    // Mortgage management
    mortgage(spaceId, player) {
        const space = this.getSpace(spaceId);

        if (!space) return false;
        if (space.owner !== player.id) return false;
        if (space.mortgaged) return false;

        // Can't mortgage if there are upgrades
        if (space.type === 'property' && (space.houses > 0 || space.hotel)) return false;

        space.mortgaged = true;
        const mortgageValue = space.mortgage || Math.floor(space.price / 2);
        player.money += mortgageValue;

        return true;
    }

    unmortgage(spaceId, player) {
        const space = this.getSpace(spaceId);

        if (!space) return false;
        if (space.owner !== player.id) return false;
        if (!space.mortgaged) return false;

        const unmortgageCost = Math.floor((space.mortgage || space.price / 2) * 1.1);

        if (player.money < unmortgageCost) return false;

        space.mortgaged = false;
        player.money -= unmortgageCost;

        return true;
    }

    // Calculate rent for a space
    calculateRent(spaceId, diceRoll) {
        const space = this.getSpace(spaceId);

        if (!space || !space.owner) return 0;
        if (space.mortgaged) return 0;

        if (space.type === 'property') {
            // Standard property rent based on upgrades
            let rentIndex = 0;
            if (space.hotel) {
                rentIndex = 5;
            } else if (space.houses > 0) {
                rentIndex = space.houses;
            } else {
                rentIndex = 0;
                // Double rent if owner has monopoly but no upgrades
                const owner = space.owner;
                const groupSpaces = this.getSpacesInGroup(space.group);
                const ownsAll = groupSpaces.every(s => s.owner === owner);
                if (ownsAll) {
                    return space.rent[0] * 2;
                }
            }
            return space.rent[rentIndex];

        } else if (space.type === 'incident') {
            // Incident Response Teams (like railroads)
            const owner = space.owner;
            const incidentCount = GameData.incidentGroups.filter(id =>
                this.getSpace(id).owner === owner
            ).length;
            return space.rent[incidentCount - 1];

        } else if (space.type === 'utility') {
            // Utilities rent based on dice roll
            const owner = space.owner;
            const utilityCount = GameData.utilityGroups.filter(id =>
                this.getSpace(id).owner === owner
            ).length;
            const multiplier = utilityCount === 1 ? 4 : 10;
            return diceRoll * multiplier;
        }

        return 0;
    }

    // Find nearest space of a specific type or group (for card effects)
    findNearestSpaceOfGroup(currentPosition, group) {
        // Search forward first
        for (let i = 1; i < this.spaces.length; i++) {
            const checkPos = (currentPosition + i) % this.spaces.length;
            const space = this.getSpace(checkPos);
            if (space.group === group) {
                return checkPos;
            }
        }
        return -1;
    }

    // Reset board for new game
    reset() {
        this.spaces = this.initializeSpaces();
    }
}
