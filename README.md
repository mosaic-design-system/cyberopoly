# CyberOpoly

An educational cybersecurity-themed Monopoly game where players learn about common cybersecurity concepts, threats, and defenses while playing.

## 🎮 Game Overview

CyberOpoly is a browser-based board game that combines classic Monopoly gameplay with cybersecurity education. Players move around a board purchasing and upgrading security assets, dealing with phishing attacks, security audits, and learning about real-world cybersecurity concepts.

## 🎯 Features

- **1-6 Player Support**: Play solo or with up to 6 players (hot-seat multiplayer)
- **🤖 AI Players**: Autonomous AI opponents powered by Claude Sonnet 4.5 with personality-driven commentary
  - Three playing styles: Aggressive, Balanced, Defensive
  - Real-time AI decision commentary
  - Spectator mode for watching AI vs AI matches
- **40 Cybersecurity-Themed Spaces**: Including properties like "SIEM System", "Firewall", "Cloud Storage", and more
- **Professional UI/UX**: Modern dark theme with cybersecurity aesthetic
  - Smooth animations and micro-interactions
  - Enhanced player cards with hover states
  - Beautiful modal transitions with backdrop blur
  - Toast notifications for important events
  - Responsive design for various screen sizes
- **Educational Content**: Learn about phishing, ransomware, compliance, incident response, and other cybersecurity topics
- **Property Groups**:
  - Legacy Systems (Brown)
  - User Endpoints (Light Blue)
  - Web Applications (Pink)
  - Network Infrastructure (Orange)
  - Cloud Services (Red)
  - Critical Systems (Yellow)
  - Security Tools (Green)
  - Crown Jewels (Dark Blue)
  - Incident Response Teams (like Railroads)
  - Security Certifications (like Utilities)

- **Card System**:
  - Phishing Email cards with real-world attack scenarios
  - Security Audit cards with compliance and certification events
  - Educational explanations for each scenario

- **British Currency**: All transactions in £ (pounds)
- **Security Upgrades**: Instead of houses/hotels, upgrade security levels on properties
- **Custom Player Tokens**: Choose from 12 unique emoji tokens
- **Save/Load**: Game state can be saved to localStorage

## 🤖 AI Players

CyberOpoly features sophisticated AI opponents powered by Claude Sonnet 4.5! AI players:

- **Strategic Decision-Making**: Make intelligent choices based on complete game state analysis
- **Three Playing Styles**:
  - **Aggressive**: Prioritizes property acquisition and upgrades, takes risks
  - **Balanced**: Mix of offense and defense, moderate risk-taking
  - **Defensive**: Conservative approach, focuses on cash reserves and stability
- **Real-Time Commentary**: AI players explain their decisions with personality-driven commentary bubbles
- **Fully Autonomous**: Play completely independently - no human input needed
- **Spectator Mode**: Watch AI vs AI matches with enhanced UI indicators
- **Smart Gameplay**: Purchase properties, upgrade assets, manage finances, and make tactical decisions

**Quick Setup:**
1. Get an Anthropic API key from [console.anthropic.com](https://console.anthropic.com)
2. Follow the setup in `AI_SETUP.md`
3. Start the backend server: `cd backend && npm start`
4. Check "🤖 AI Player" checkbox during game setup
5. Select AI strategy (Aggressive/Balanced/Defensive)
6. Watch AI players compete!

**Spectator Mode Features:**
- Subtle corner "AI is thinking..." indicator (non-blocking)
- AI commentary bubbles with cyan player names
- "Spectator Mode - AI vs AI" badge when all players are AI
- Extended commentary duration (8s) with hover-to-pause

**More Details:** See `AI_SETUP.md` for complete setup instructions.

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- **For AI Players**: Node.js 16+ and an Anthropic API key (see AI Setup below)

### Quick Start (Human Players Only)

1. Clone or download this repository
2. Open `frontend/index.html` in your web browser
3. That's it! The game runs entirely in your browser.

```bash
# Optional: Run a local server
cd frontend
python3 -m http.server 8000
# Then visit http://localhost:8000
```

### Quick Start (With AI Players)

**⚠️ Important: AI players require a backend server to be running!**

1. **Get an Anthropic API key** from [console.anthropic.com](https://console.anthropic.com)
2. **Set up the backend**:
   ```bash
   cd backend
   npm install
   cp ../.env.example .env
   # Edit .env and add your ANTHROPIC_API_KEY
   ```
3. **Start both servers**:
   ```bash
   # Terminal 1: Start the game server
   cd frontend
   python3 -m http.server 8000

   # Terminal 2: Start the AI backend
   cd backend
   npm start
   ```
4. **Open the game**: Visit `http://localhost:8000`
5. **Enable AI players**: Check the "🤖 AI Player" checkbox during setup

**Note**: Without the backend server running, AI players will not work. The game will function normally for human-only play.

### Docker Deployment

You can run the entire application using Docker:

```bash
# Set your API key (required for AI players)
export ANTHROPIC_API_KEY=sk-ant-your-key-here

# Build and run with docker-compose
docker-compose up

# Or run in detached mode
docker-compose up -d

# Stop services
docker-compose down
```

**Individual Services:**

```bash
# Build and run frontend only
docker build -t cyberopoly-frontend ./frontend
docker run -p 8000:8000 cyberopoly-frontend

# Build and run backend only
docker build -t cyberopoly-backend ./backend
docker run -p 3001:3001 -e ANTHROPIC_API_KEY=your-key-here cyberopoly-backend
```

## 📖 How to Play

### Setup

1. Select the number of players (1-6)
2. Enter player names for each player
3. (Optional) Check "🤖 AI Player" to enable AI control
4. (Optional) Select AI strategy if using AI
5. Choose player tokens from 12 unique emojis
6. Click "Start Game"

### Gameplay

**Basic Turn:**
1. Roll the dice
2. Move your piece around the board
3. Perform actions based on where you land:
   - **Unowned Property**: Buy it or leave it for auction
   - **Owned Property**: Pay rent to the owner
   - **Phishing Email/Security Audit**: Draw a card and follow instructions
   - **GO**: Collect £200
   - **Quarantine (Jail)**: You're isolated due to malware
4. End your turn

**Rolling Doubles:**
- Roll the same number on both dice = take another turn
- Roll doubles 3 times in a row = go to Quarantine

**Properties:**
- Buy properties to build your security empire
- Own all properties in a color group = Monopoly!
- Upgrade properties with security levels (houses) and advanced security (hotels)
- Mortgage properties when you need cash

**Winning:**
- Be the last player standing
- Drive opponents into bankruptcy by collecting rent

## 🎲 Game Elements

### Board Spaces

- **GO (SOC)**: Collect £200 salary
- **Properties**: 22 cybersecurity assets to buy and upgrade
- **Incident Response Teams**: 4 special properties (like railroads)
- **Security Certifications**: 2 utilities (ISO 27001, SOC 2)
- **Phishing Email**: Draw a scenario card
- **Security Audit**: Draw an audit card
- **Compliance Fine**: Pay £200
- **Data Breach Tax**: Pay £100
- **Quarantine**: Jail equivalent - isolated system
- **Go to Quarantine**: Ransomware attack sends you to jail
- **Bug Bounty Payout**: Free parking equivalent

### Educational Aspects

Every property, card, and game event includes:
- Real-world cybersecurity concepts
- Explanations of attack types
- Defense best practices
- Industry standards and compliance information

**Topics Covered:**
- Phishing & Social Engineering
- Ransomware & Malware
- Network Security
- Cloud Security
- Application Security
- Incident Response
- Compliance (GDPR, PCI-DSS, ISO 27001)
- Identity & Access Management
- Security Operations
- Threat Intelligence
- And much more!

## 🎨 Technologies Used

### Frontend
- **HTML5**: Semantic markup for game structure
- **CSS3**: Modern styling with CSS Variables, gradients, animations
  - Custom design system with 8px grid spacing
  - Professional typography (Space Grotesk, Inter, JetBrains Mono)
  - Comprehensive color palette with accessibility in mind
  - Smooth transitions and micro-interactions
  - Responsive layout with flexbox and grid
- **Vanilla JavaScript (ES6+)**: No frameworks, pure JS
  - Object-oriented architecture with class-based components
  - Event-driven UI updates
  - LocalStorage for save games

### Backend (Optional - for AI Players)
- **Node.js** with Express server
- **Anthropic SDK** for Claude AI integration
- **Claude Sonnet 4.5 (20250514)**: Latest AI model for strategic gameplay
- **RESTful API** for AI decision-making endpoint

## 📁 Project Structure

```
cyberopoly/
├── frontend/              # Frontend application
│   ├── index.html        # Main game page with semantic HTML5
│   ├── css/
│   │   └── styles.css   # All game styling (1600+ lines)
│   │                    # - Design system with CSS variables
│   │                    # - Professional component library
│   │                    # - Responsive layouts
│   │                    # - Animations and transitions
│   ├── js/
│   │   ├── data.js      # Board spaces and game constants
│   │   ├── cards.js     # Card system and card data (50+ cards)
│   │   ├── player.js    # Player class with AI support
│   │   ├── board.js     # Board management and property logic
│   │   ├── game.js      # Core game logic and turn management
│   │   ├── ui.js        # UI management and rendering (1100+ lines)
│   │   └── api-client.js # AI backend API client
│   ├── assets/
│   │   ├── images/      # (Future: board graphics, icons)
│   │   └── sounds/      # (Future: sound effects)
│   └── Dockerfile       # Frontend Docker configuration
├── backend/              # AI Backend (optional)
│   ├── index.js         # Express server (port 3001)
│   ├── ai-agent.js      # Anthropic SDK & AI strategic logic
│   ├── package.json     # Backend dependencies
│   ├── README.md        # Backend documentation
│   └── Dockerfile       # Backend Docker configuration
├── AI_SETUP.md          # AI players setup guide
├── DEPLOYMENT.md        # Production deployment guide
├── QUICKSTART.md        # Quick start guide
├── UI_UX_ROADMAP.md     # Comprehensive UI/UX enhancement roadmap
├── CLAUDE.md            # Development architecture documentation
├── services.yaml        # Service configuration for deployment
└── README.md            # This file
```

## 🎓 Educational Goals

CyberOpoly is designed to:

1. **Introduce Concepts**: Expose players to cybersecurity terminology and concepts
2. **Explain Threats**: Demonstrate real-world attack scenarios in an approachable way
3. **Teach Defense**: Highlight security best practices and defensive measures
4. **Build Awareness**: Increase general security awareness through gameplay
5. **Make Learning Fun**: Use game mechanics to make cybersecurity education engaging

## 🔄 Future Enhancements

Potential features for future versions:

### Completed ✅
- [x] **AI opponents for single-player** ✓ Powered by Claude Sonnet 4.5
- [x] **Animations for movement and actions** ✓ Smooth dice rolls, player piece movement, modals
- [x] **Difficulty levels / AI strategy customization** ✓ Three AI strategies available
- [x] **Professional UI/UX design** ✓ Phase 1-3 of roadmap completed

### Planned 📋
- [ ] **Phase 4: Cybersecurity Theme Identity**
  - Matrix-style background effects
  - Terminal-style game log with `$` prefix
  - Cyber-themed section headers
  - Optional scanline CRT effects
- [ ] **Phase 5: Accessibility & Final Polish**
  - Enhanced keyboard navigation
  - Screen reader support (ARIA labels)
  - Reduced motion support
  - High contrast mode
  - Color blind friendly enhancements
- [ ] Network multiplayer (using WebSockets)
- [ ] Trading between players
- [ ] Auction system for unowned properties
- [ ] More card scenarios (100+ cards)
- [ ] Sound effects and music
- [ ] Mobile-responsive design improvements
- [ ] Game statistics and achievements
- [ ] Custom house rules
- [ ] Quiz mode for additional learning
- [ ] Integration with real threat intelligence feeds

## 🐛 Known Issues

- Trading system not yet implemented
- Auction system for declined properties not implemented
- Mobile layout needs optimization for smaller screens

## 👥 Development

Created for educational purposes to teach cybersecurity concepts through gameplay.

### Contributing

This is an educational project. Feel free to:
- Report bugs
- Suggest new card scenarios
- Propose game balance improvements
- Add more educational content

## 📝 License

This is an educational project created for learning purposes.

## 🎮 Tips for Players

1. **Buy Early**: Secure properties early in the game
2. **Complete Groups**: Focus on completing color groups to enable upgrades
3. **Upgrade Strategically**: Upgraded properties generate much more rent
4. **Cash Reserve**: Keep some cash for rent and emergencies
5. **Read the Cards**: Pay attention to the educational content - you might learn something useful!

## 🔒 Cybersecurity Learning

While playing, you'll learn about:

- **Common Attacks**: Phishing, ransomware, DDoS, SQL injection, XSS, etc.
- **Defense Tools**: Firewalls, SIEM, IDS/IPS, EDR, etc.
- **Best Practices**: MFA, encryption, patching, backups, etc.
- **Compliance**: GDPR, PCI-DSS, HIPAA, ISO 27001, SOC 2, etc.
- **Incident Response**: Detection, containment, remediation, recovery
- **Real-World Concepts**: Supply chain attacks, APTs, zero-days, etc.

---

**Have fun and stay secure!** 🔐🎲
