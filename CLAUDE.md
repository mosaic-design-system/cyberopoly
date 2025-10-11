# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CyberOpoly is an educational cybersecurity-themed Monopoly game with optional AI players powered by Claude Sonnet 4.5. The project consists of:
- **Frontend**: Vanilla JavaScript browser-based game (no build step required)
- **Backend** (optional): Node.js Express server for AI player functionality

## Development Commands

### Frontend Development
```bash
# Start frontend server (from project root)
python3 -m http.server 8000
# Visit http://localhost:8000

# Or simply open index.html directly in browser
open index.html
```

**Important**: Frontend changes (HTML/CSS/JS) require **browser hard refresh** only:
- Mac: `Cmd + Shift + R`
- Windows/Linux: `Ctrl + Shift + R`
- No server restart needed

### Backend Development (AI Features)
```bash
# Install dependencies (first time only)
cd server
npm install

# Start backend server
npm start
# Server runs on port 3001

# Development mode with auto-reload
npm run dev
```

**Important**: Backend changes (.js files in `/server/`) require **backend server restart**.

### Environment Setup (AI Features)
```bash
# Create .env file in /server/ directory
ANTHROPIC_API_KEY=sk-ant-your-key-here
PORT=3001
```

## Architecture

### Game State Flow
The game follows a **turn-based state machine**:
1. **Setup Phase** → Player configuration
2. **Roll Phase** → Player must roll dice
3. **Action Phase** → After rolling, player can buy/upgrade/etc
4. **End Phase** → Turn ends, next player starts

### Core Classes & Responsibilities

**Game** (`js/game.js`)
- Central controller managing game state
- Handles turn phases: `'roll'` → `'action'` → `'end'`
- Orchestrates AI turns via `handleAITurn()` and `executeAIDecision()`
- **Critical**: All space landing logic in `landOnSpace()` must schedule AI continuation

**Board** (`js/board.js`)
- Manages 40 board spaces and their states
- Handles property ownership, upgrades, and rent calculations
- Immutable during game (structure-wise)

**Player** (`js/player.js`)
- Tracks individual player state (money, position, properties)
- Can be AI or human (`isAI` flag)
- AI players have `aiStrategy`: `'aggressive'`, `'balanced'`, or `'defensive'`

**UIManager** (`js/ui.js`)
- Handles all DOM manipulation and rendering
- Shows AI commentary bubbles via `showAICommentary()`
- Independent from game logic - game can run headless

**CardManager** (`js/cards.js`)
- Manages "Phishing Email" and "Security Audit" card decks
- Cards have educational cybersecurity content

**APIClient** (`js/api-client.js`)
- Communicates with backend for AI decisions
- Handles fallback logic if backend unavailable
- Auto-detects backend availability

### AI System Architecture

**Frontend → Backend Flow**:
```
1. Game.handleAITurn() serializes game state
2. APIClient.getAIDecision() sends POST to /api/ai-decision
3. Backend formats state for Claude with strategy-specific prompt
4. Claude analyzes and returns tool use (action decision)
5. Frontend executes action via executeAIDecision()
```

**Backend Components** (`server/`):
- **index.js**: Express server with CORS, health checks, AI endpoint
- **ai-agent.js**: Anthropic SDK integration, prompt engineering, tool definitions

**AI Decision Tools**: `roll_dice`, `buy_property`, `decline_property`, `upgrade_property`, `mortgage_property`, `pay_jail_fee`, `end_turn`

**AI Commentary System**:
- AI generates personality-driven commentary text before tool use
- Displayed in animated bubbles (top-right) via `ui.showAICommentary()`
- Commentary appears in bubbles only (NOT duplicated in game log)
- Each AI strategy has distinct personality (Aggressive Hacker, Strategic Analyst, Cautious Guardian)

### Critical AI Turn Flow Pattern

**DO NOT break this pattern** - it prevents infinite loops and stuck states:

```javascript
landOnSpace(player) {
    switch(space.type) {
        case 'property':
            if (!space.owner && player.isAI) {
                // Schedule AI turn to make buy/decline decision
                setTimeout(() => this.handleAITurn(), 1000);
            }
            break;

        case 'go':
        case 'jail':
        case 'parking':
        case 'tax':
        case 'phishing':
        case 'audit':
            // MUST schedule handleAITurn() for AI players
            if (player.isAI) {
                setTimeout(() => this.handleAITurn(), 1000);
            }
            break;
    }
}

executeAIDecision(decision) {
    switch(decision.action) {
        case 'buy_property':
            this.buyProperty();
            // After buying, schedule next turn for end_turn decision
            setTimeout(() => this.handleAITurn(), 1000);
            break;

        case 'decline_property':
            // After declining, end turn directly
            this.turnPhase = 'end';
            setTimeout(() => this.endTurn(), 800);
            break;
    }
}
```

**Key Insight**: AI always needs `handleAITurn()` scheduled after landing on ANY space type. The only space that breaks this is when AI lands on opponent's property (automatic rent payment without decision).

## Common Pitfalls & Solutions

### AI Gets Stuck After Landing on GO
**Problem**: GO space (`type: 'go'`) missing AI continuation logic
**Fix**: Add `setTimeout(() => this.handleAITurn(), 800)` in the 'go' case of `landOnSpace()`

### Double Commentary in Logs
**Problem**: Commentary shown in both bubbles AND game log
**Fix**: Removed `this.log(\`AI: ${decision.reasoning}\`)` from `handleAITurn()` - bubbles are sufficient

### AI Loops on Property Purchase
**Problem**: Both `landOnSpace()` and `executeAIDecision()` schedule `handleAITurn()` after buy
**Solution**: This is intentional - AI needs two decisions:
1. First turn: Roll → land on property → schedule turn
2. Second turn: Decide to buy/decline
3. Third turn: End turn

### Backend Shows "API Key Configured" But Calls Fail
**Problem**: `dotenv.config()` in `index.js` runs AFTER `ai-agent.js` imports and initializes Anthropic client
**Fix**: Add `dotenv.config()` to TOP of `ai-agent.js` before creating Anthropic instance

### AI Commentary Bubbles Don't Appear
**Problem**: `tool_choice: { type: 'any' }` forces tool without text generation
**Fix**: Use `tool_choice: { type: 'auto' }` and strengthen prompt to require commentary before tool use

## Testing AI Players

### Quick Test Checklist
```bash
# 1. Backend health
curl http://localhost:3001/health

# 2. Check browser console for:
✓ AI Backend is available

# 3. Start game with 1 human, 1 AI
# 4. Take your turn, verify AI responds
# 5. Check server logs for:
✓ "Calling Claude API with strategy: balanced"
✓ "Tool selected: roll_dice"
✓ "AI Commentary: [actual text]"
```

### Debugging AI Issues
**Check server logs** for:
- `Error calling Anthropic API` → API key issue
- `Fallback: Must roll` → API not working, using fallback logic
- `AI Commentary: ...` (truncated) → Check if actual commentary present

**Check browser console** for:
- `handleAITurn exiting early` → Game state issue
- `AI turn already in progress` → Duplicate turn scheduling (race condition)

## Code Style Notes

- **No build process**: Plain JavaScript, CSS, HTML
- **No frameworks**: Vanilla JS only
- **ES6 modules**: Use `type="module"` in HTML, `import/export` in backend
- **British English**: All game text uses British spelling and £ currency
- **Educational content**: Every property/card includes real cybersecurity concepts

## Board Space Types

Understanding space types is crucial for `landOnSpace()` logic:
- `'go'`: Security Operations Center (collect £200)
- `'property'`: Standard purchasable property
- `'incident'`: Incident Response Teams (like railroads)
- `'utility'`: Security Certifications (ISO 27001, SOC 2)
- `'phishing'`: Draw Phishing Email card
- `'audit'`: Draw Security Audit card
- `'tax'`: Pay fixed amount (Compliance Fine, Data Breach Tax)
- `'jail'`: Quarantine - visiting or in jail
- `'go-to-jail'`: Ransomware attack - send to jail
- `'parking'`: Bug Bounty Payout (free parking)

## Deployment Notes

- **Frontend**: Static files, can deploy to GitHub Pages, Netlify, etc.
- **Backend**: Requires Node.js environment with `ANTHROPIC_API_KEY` env var
- **CORS**: Backend configured for `*` origin by default, configure `FRONTEND_URL` for production
- **API Costs**: Each AI decision costs ~$0.01-0.03 depending on game state complexity

## Educational Content

All properties, cards, and events teach real cybersecurity concepts:
- Properties grouped by system type (endpoints, network, cloud, security tools)
- Cards simulate real attack scenarios (phishing, ransomware, supply chain)
- Space names use actual security terminology (SIEM, IDS/IPS, SOC, etc.)
