# CyberOpoly AI Server

Backend API for CyberOpoly autonomous AI agents powered by Claude Sonnet 4.5.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Anthropic API key

### Installation

1. Install dependencies:
```bash
cd server
npm install
```

2. Create `.env` file in the **root directory** (not in server folder):
```bash
cp ../.env.example ../.env
```

3. Edit `.env` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
```

### Running the Server

**Development mode with auto-reload:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3001`

## 📡 API Endpoints

### Health Check
```
GET /health
```

Returns server status and configuration info.

**Response:**
```json
{
  "status": "healthy",
  "service": "cyberopoly-ai",
  "version": "1.0.0",
  "timestamp": "2025-01-10T12:00:00.000Z"
}
```

### AI Decision
```
POST /api/ai-decision
```

Get an AI decision for the current game state.

**Request Body:**
```json
{
  "gameState": {
    "board": { "spaces": [...] },
    "players": [...],
    "currentPlayerIndex": 0,
    "turnPhase": "roll",
    "lastDiceRoll": [3, 4],
    "consecutiveDoubles": 0
  },
  "player": {
    "id": 0,
    "name": "AI Player 1",
    "money": 1500,
    "position": 5,
    "properties": [],
    "inJail": false
  },
  "strategy": "balanced"
}
```

**Response:**
```json
{
  "success": true,
  "decision": {
    "action": "roll_dice",
    "params": {},
    "reasoning": "Starting turn by rolling dice"
  },
  "timestamp": "2025-01-10T12:00:00.000Z"
}
```

**Possible Actions:**
- `roll_dice` - Roll dice to move
- `buy_property` - Purchase property
- `decline_property` - Pass on property
- `upgrade_property` - Upgrade property (requires `property_id` param)
- `mortgage_property` - Mortgage property (requires `property_id` param)
- `pay_jail_fee` - Pay to leave quarantine
- `end_turn` - End turn

## 🤖 AI Strategies

- **balanced**: Moderate approach - buys selectively, maintains reserves
- **aggressive**: Buys everything, upgrades aggressively, takes risks
- **defensive**: Conservative play, large reserves, cheap properties

## 🔧 Configuration

### Environment Variables

- `ANTHROPIC_API_KEY` (required): Your Anthropic API key
- `PORT` (optional): Server port (default: 3001)
- `FRONTEND_URL` (optional): CORS origin for frontend (default: *)
- `NODE_ENV` (optional): Environment (development/production)

## 🏗️ Architecture

```
server/
├── index.js          # Express server & API endpoints
├── ai-agent.js       # Anthropic SDK & AI logic
├── package.json      # Dependencies
└── README.md         # This file
```

## 🐛 Debugging

Enable verbose logging:
```bash
NODE_ENV=development npm run dev
```

Check API key is loaded:
```bash
curl http://localhost:3001/health
```

Test AI decision endpoint:
```bash
curl -X POST http://localhost:3001/api/ai-decision \
  -H "Content-Type: application/json" \
  -d @test-payload.json
```

## 📦 Deployment

See parent directory `DEPLOYMENT.md` for deployment instructions to your platform.

### Requirements
- Node.js 18+ runtime
- Environment variable: `ANTHROPIC_API_KEY`
- Port configuration (default 3001)
- CORS configuration for your frontend domain

## 🔒 Security

- API key stored in environment variables (never committed)
- CORS configured to restrict origins
- Request size limits (10MB JSON)
- Error messages don't leak sensitive info in production

## 🧪 Testing

Create a test payload and test the endpoint:
```bash
# Test health check
curl http://localhost:3001/health

# Test AI decision (requires running backend)
curl -X POST http://localhost:3001/api/ai-decision \
  -H "Content-Type: application/json" \
  -d '{
    "gameState": {...},
    "player": {...},
    "strategy": "balanced"
  }'
```

## 📊 Monitoring

The server logs all requests with timestamps:
```
[2025-01-10T12:00:00.000Z] POST /api/ai-decision
Processing AI decision for player: AI Player 1 (Strategy: balanced)
AI decision: roll_dice - Starting turn
```

## ⚠️ Troubleshooting

**API key not configured:**
```
Error: ANTHROPIC_API_KEY not configured
```
→ Make sure `.env` file exists in parent directory with your API key

**CORS errors:**
```
Access-Control-Allow-Origin error
```
→ Set `FRONTEND_URL` in `.env` to your frontend domain

**Timeout errors:**
```
AI decision timeout
```
→ Claude API can take 10-30 seconds for complex decisions. This is normal.
