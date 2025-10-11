# CyberOpoly

An educational cybersecurity-themed Monopoly game where players learn about common cybersecurity concepts, threats, and defenses while playing.

## 🎮 Game Overview

CyberOpoly is a browser-based board game that combines classic Monopoly gameplay with cybersecurity education. Players move around a board purchasing and upgrading security assets, dealing with phishing attacks, security audits, and learning about real-world cybersecurity concepts.

## 🎯 Features

- **1-4 Player Support**: Play solo or with up to 4 players (hot-seat multiplayer)
- **40 Cybersecurity-Themed Spaces**: Including properties like "SIEM System", "Firewall", "Cloud Storage", and more
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
- **Save/Load**: Game state can be saved to localStorage
- **🤖 AI Players**: Autonomous AI opponents powered by Claude Sonnet 4.5 (optional backend required)

## 🤖 AI Players (NEW!)

CyberOpoly now supports autonomous AI opponents powered by Claude Sonnet 4.5! AI players:

- Make strategic decisions based on game state
- Use different playing styles (Aggressive, Balanced, Defensive)
- Play completely autonomously - no human input needed
- Learn and adapt to the game situation
- Show their reasoning in the game log

**Quick Setup:**
1. Get an Anthropic API key from [console.anthropic.com](https://console.anthropic.com)
2. Follow the setup in `AI_SETUP.md`
3. Start the backend server
4. Check "🤖 AI Player" in game setup
5. Watch AI players compete!

**More Details:** See `AI_SETUP.md` for complete setup instructions.

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server or build process required!

### Installation

1. Clone or download this repository
2. Open `index.html` in your web browser
3. That's it! The game runs entirely in your browser.

```bash
# If you want to run a local server (optional):
python3 -m http.server 8000
# Then visit http://localhost:8000
```

## 📖 How to Play

### Setup

1. Select the number of players (1-4)
2. Enter player names
3. Click "Start Game"

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

- HTML5
- CSS3 (with CSS Variables for theming)
- Vanilla JavaScript (no frameworks)
- LocalStorage for save games

## 📁 Project Structure

```
cyberopoly/
├── index.html              # Main game page
├── css/
│   └── styles.css         # All game styling
├── js/
│   ├── data.js            # Board spaces and game constants
│   ├── cards.js           # Card system and card data
│   ├── player.js          # Player class
│   ├── board.js           # Board management
│   ├── game.js            # Core game logic
│   ├── ui.js              # UI management and rendering
│   └── api-client.js      # AI backend API client
├── server/                 # AI Backend (optional)
│   ├── index.js           # Express server
│   ├── ai-agent.js        # Anthropic SDK & AI logic
│   ├── package.json       # Backend dependencies
│   └── README.md          # Backend documentation
├── assets/
│   ├── images/            # (Future: board graphics, icons)
│   └── sounds/            # (Future: sound effects)
├── AI_SETUP.md            # AI players setup guide
├── DEPLOYMENT.md          # Production deployment guide
└── README.md              # This file
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

- [x] **AI opponents for single-player** ✓ Now available!
- [ ] Network multiplayer (using WebSockets)
- [ ] Trading between players
- [ ] Auction system for unowned properties
- [ ] More card scenarios (100+ cards)
- [ ] Sound effects and music
- [ ] Animations for movement and actions
- [ ] Mobile-responsive design improvements
- [ ] Game statistics and achievements
- [ ] Difficulty levels / AI strategy customization
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
