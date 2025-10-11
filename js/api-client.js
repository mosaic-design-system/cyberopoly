// API Client for CyberOpoly AI Backend

class APIClient {
    constructor() {
        // API URL - can be configured via environment or defaults
        this.baseURL = this.detectAPIURL();
        this.isAvailable = null; // null = unknown, true = available, false = unavailable
        this.checkTimeout = 5000; // 5 seconds
    }

    // Detect the correct API URL based on environment
    detectAPIURL() {
        // Check if running in production (deployed)
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            // Production - assume API is on same host at /api
            return window.location.origin;
        }

        // Development - API runs on separate port
        return 'http://localhost:3001';
    }

    // Check if the API backend is available
    async checkAvailability() {
        if (this.isAvailable !== null) {
            return this.isAvailable;
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.checkTimeout);

            const response = await fetch(`${this.baseURL}/health`, {
                method: 'GET',
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            this.isAvailable = response.ok;
            return response.ok;

        } catch (error) {
            console.warn('AI Backend not available:', error.message);
            this.isAvailable = false;
            return false;
        }
    }

    // Get AI decision for the current game state
    async getAIDecision(gameState, player, strategy = 'balanced') {
        try {
            // Check availability first
            const available = await this.checkAvailability();
            if (!available) {
                console.warn('AI Backend unavailable, using fallback decision');
                return this.getFallbackDecision(gameState, player);
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for AI

            const response = await fetch(`${this.baseURL}/api/ai-decision`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    gameState,
                    player,
                    strategy
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}`);
            }

            const data = await response.json();
            return data.decision;

        } catch (error) {
            console.error('Error getting AI decision:', error);

            // Mark as unavailable if we get repeated errors
            if (error.name === 'AbortError' || error.message.includes('fetch')) {
                this.isAvailable = false;
            }

            return this.getFallbackDecision(gameState, player);
        }
    }

    // Simple fallback decision logic when backend is unavailable
    getFallbackDecision(gameState, player) {
        const { turnPhase, board } = gameState;
        const currentSpace = board.spaces[player.position];

        // Basic decision tree
        if (turnPhase === 'roll') {
            return { action: 'roll_dice', reasoning: 'Fallback: Rolling dice' };
        }

        if (turnPhase === 'action') {
            // If on unowned property and can afford it, buy it
            if (currentSpace.type === 'property' &&
                currentSpace.owner === null &&
                player.money >= currentSpace.price) {
                return { action: 'buy_property', reasoning: 'Fallback: Buying available property' };
            }

            // If on unowned property but can't afford, decline
            if (currentSpace.type === 'property' && currentSpace.owner === null) {
                return { action: 'decline_property', reasoning: 'Fallback: Cannot afford property' };
            }
        }

        // Default: end turn
        return { action: 'end_turn', reasoning: 'Fallback: Ending turn' };
    }

    // Reset availability check (useful if connection is restored)
    resetAvailability() {
        this.isAvailable = null;
    }
}

// Create singleton instance
const apiClient = new APIClient();

// Check availability on page load (non-blocking)
apiClient.checkAvailability().then(available => {
    if (available) {
        console.log('✓ AI Backend is available');
    } else {
        console.log('✗ AI Backend is not available - AI features disabled');
    }
});
