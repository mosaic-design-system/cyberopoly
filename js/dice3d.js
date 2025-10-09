// 3D Dice using dddice.com SDK

class Dice3D {
    constructor() {
        this.dddice = null;
        this.canvas = null;
        this.isInitialized = false;
        this.isRolling = false;
    }

    async initialize() {
        try {
            // Check if dddice SDK is loaded
            if (typeof ThreeDDice === 'undefined') {
                console.error("dddice SDK not loaded");
                return false;
            }

            const container = document.getElementById('dice-box');
            if (!container) {
                console.error("Dice container not found");
                return false;
            }

            // Create canvas
            this.canvas = document.createElement('canvas');
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            container.appendChild(this.canvas);

            // Initialize dddice
            this.dddice = new ThreeDDice(this.canvas, {
                apiKey: 'dddice_free_api_key', // Free tier
                theme: {
                    id: 'dddice-standard'
                }
            });

            await this.dddice.start();

            this.isInitialized = true;
            console.log("dddice initialized successfully!");
            return true;

        } catch (error) {
            console.error("Failed to initialize dddice:", error);
            this.isInitialized = false;
            return false;
        }
    }

    async roll() {
        if (!this.isInitialized || this.isRolling) {
            return null;
        }

        this.isRolling = true;
        console.log("Rolling dice with dddice...");

        try {
            // Roll 2d6
            const result = await this.dddice.roll('2d6');

            console.log("Dice roll result:", result);

            // Parse the results
            const die1 = result.rolls[0].value;
            const die2 = result.rolls[1].value;

            this.isRolling = false;

            return {
                die1: die1,
                die2: die2,
                total: die1 + die2
            };

        } catch (error) {
            console.error("Error rolling dice:", error);
            this.isRolling = false;
            return null;
        }
    }

    clear() {
        if (this.dddice) {
            this.dddice.clear();
        }
        this.isRolling = false;
    }

    hide() {
        const container = document.getElementById('dice-box');
        if (container) {
            container.style.display = 'none';
        }
    }

    show() {
        const container = document.getElementById('dice-box');
        if (container) {
            container.style.display = 'block';
        }
    }
}

// Create global instance
window.dice3D = new Dice3D();
