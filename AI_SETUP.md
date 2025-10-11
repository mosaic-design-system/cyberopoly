# 🤖 AI Players Setup Guide

This guide will help you set up and run CyberOpoly with autonomous AI players powered by Claude Sonnet 4.5.

## 🎯 Quick Start (5 minutes)

### Step 1: Get Your Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Navigate to "API Keys"
4. Create a new API key
5. Copy the key (starts with `sk-ant-...`)

### Step 2: Configure the Environment

1. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

2. Open `.env` and add your API key:
```env
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
PORT=3001
```

### Step 3: Install Backend Dependencies

```bash
cd server
npm install
```

### Step 4: Start the Backend Server

In the `server` directory:
```bash
npm start
```

You should see:
```
═══════════════════════════════════════════
  🎮 CyberOpoly AI Server
═══════════════════════════════════════════
  📡 Server running on port 3001
  🏥 Health check: http://localhost:3001/health
  🤖 AI endpoint: http://localhost:3001/api/ai-decision
  🔑 API Key: ✓ Configured
═══════════════════════════════════════════
```

### Step 5: Start the Frontend

**Option A: Direct file access (simplest)**
```bash
# From project root
open index.html
```

**Option B: Local web server (recommended for testing)**
```bash
# From project root
python3 -m http.server 8000
# Then visit http://localhost:8000
```

### Step 6: Play with AI!

1. Open the game in your browser
2. In setup, check "🤖 AI Player" for any players you want to be AI
3. Choose AI strategy (Balanced, Aggressive, or Defensive)
4. Click "Start Game"
5. Watch the AI play! 🎮

## 🎮 Using AI Players

### Adding AI Players

In the game setup screen:
- Check the "🤖 AI Player" box for any player
- Select their strategy from the dropdown
- AI players get named "AI Player 1", "AI Player 2", etc.

### AI Strategies

**🎯 Balanced** (Recommended)
- Buys most properties strategically
- Maintains cash reserves (£200-300)
- Upgrades when safe
- Good general-purpose strategy

**⚔️ Aggressive**
- Buys everything possible
- Upgrades aggressively
- Takes more risks
- Can dominate or go bankrupt quickly

**🛡️ Defensive**
- Very conservative
- Large cash reserves (£400+)
- Focuses on cheaper properties
- Aims to outlast opponents

### Watching AI Play

When it's an AI's turn:
- "🤖" icon appears next to their name
- "AI is thinking..." overlay shows during decision-making
- Game log shows AI reasoning
- Actions execute automatically with delays (for visibility)

## 🔧 Advanced Configuration

### Development Mode (Auto-reload)

```bash
cd server
npm run dev
```

The server will automatically restart when you change code.

### Custom API URL

If your backend is on a different host, edit `js/api-client.js`:

```javascript
detectAPIURL() {
    return 'https://your-api-server.com';
}
```

### AI Decision Timing

AI decisions take 5-15 seconds per turn. This is normal - Claude is analyzing the game state and making strategic decisions.

To adjust delays between actions, edit `js/game.js` and change the timeout values in `executeAIDecision()`.

## 🧪 Testing

### Test Backend is Running

```bash
curl http://localhost:3001/health
```

Should return:
```json
{
  "status": "healthy",
  "service": "cyberopoly-ai",
  "version": "1.0.0"
}
```

### Test Frontend Can Reach Backend

1. Open browser console (F12)
2. Load the game
3. Look for: `✓ AI Backend is available`

If you see `✗ AI Backend is not available`:
- Backend isn't running (check Step 4)
- API key not configured (check `.env`)
- CORS issue (check server logs)

### Test AI Player

1. Create a game with 1 human, 1 AI
2. Take your turn (roll, buy, end turn)
3. AI should automatically take their turn
4. Check console for any errors

## ❓ Troubleshooting

### AI Players Don't Take Turns

**Symptom:** AI checkbox works but AI doesn't act

**Solutions:**
1. Check backend is running: `curl http://localhost:3001/health`
2. Check browser console for errors (F12)
3. Verify `.env` file has correct API key
4. Make sure `.env` is in **root directory**, not `server/`

### "API Key Not Configured" Error

**Solution:**
- `.env` file must be in project root (same level as `index.html`)
- API key must start with `sk-ant-`
- Restart the backend server after adding key

### Long Wait Times

**This is normal!** Claude takes 5-15 seconds to analyze the game and make decisions. For complex situations (many properties, tough decisions), it may take longer.

### CORS Errors

If running frontend and backend on different domains:

1. Set `FRONTEND_URL` in `.env`:
```env
FRONTEND_URL=http://localhost:8000
```

2. Restart backend server

### AI Makes Bad Decisions

The AI is strategic but not perfect. Try different strategies:
- Aggressive AI can bankrupt itself
- Defensive AI may play too safe
- Balanced usually performs best

## 📊 How It Works

### Architecture

```
Browser (Frontend)
    ↓
    API Call with game state
    ↓
Express Server (Backend)
    ↓
    Formats game state for Claude
    ↓
Anthropic API (Claude Sonnet 4.5)
    ↓
    Analyzes state, uses tool to decide action
    ↓
Express Server
    ↓
    Returns action (roll/buy/upgrade/end)
    ↓
Browser executes action
```

### AI Decision Process

1. Game sends current state to backend
2. Backend formats state for Claude (board, money, properties, etc.)
3. Claude analyzes strategic options using its knowledge of Monopoly
4. Claude uses tool calling to select an action
5. Backend returns action to frontend
6. Frontend executes action with animations

### What AI Knows

- All game rules and mechanics
- Property values and rent calculations
- Strategic principles (complete monopolies, upgrade wisely, etc.)
- Current game state (all players' money, properties, positions)
- Cybersecurity context (it knows it's CyberOpoly!)

### What AI Doesn't Know

- Future dice rolls (it doesn't cheat!)
- Hidden information (none in Monopoly anyway)
- Other players' strategies
- Real-time updates during opponent turns

## 🚀 Next Steps

### Play Different Configurations

- **1 Human vs 3 AI**: Learn from AI strategies
- **4 AI Players**: Watch AI vs AI battle (spectator mode)
- **2v2**: You + AI vs 2 AI opponents

### Experiment with Strategies

- Try all AI vs aggressive AI
- Mix strategies: aggressive vs defensive
- Modify strategies in `server/ai-agent.js`

### Deploy to Production

See `DEPLOYMENT.md` for full deployment guide.

## 💡 Tips

1. **Learn from AI**: Watch how AI players make decisions to improve your own strategy
2. **Mix strategies**: Different AI strategies create more dynamic games
3. **Be patient**: AI decisions take time but are worth the wait
4. **Check logs**: The game log shows AI reasoning - read it to understand decisions
5. **Experiment**: Try different player counts and strategy combinations

## 🆘 Still Having Issues?

1. **Check all logs:**
   - Browser console (F12)
   - Backend terminal
   - Network tab in browser DevTools

2. **Verify checklist:**
   - [ ] Node.js 18+ installed: `node --version`
   - [ ] Backend dependencies installed: `cd server && npm install`
   - [ ] `.env` file exists in root with API key
   - [ ] Backend running on port 3001
   - [ ] Frontend can reach backend

3. **Start fresh:**
```bash
# Kill any running servers
# Remove node_modules
rm -rf server/node_modules

# Reinstall
cd server
npm install

# Restart
npm start
```

## 🎉 You're Ready!

Enjoy playing CyberOpoly with AI opponents. Have fun learning cybersecurity while watching autonomous agents battle for digital supremacy! 🛡️🔐

---

**Need help?** Check the logs, test the endpoints, and review this guide. The AI integration is designed to be robust with fallbacks if anything goes wrong.
