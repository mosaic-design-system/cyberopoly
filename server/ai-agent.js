import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Tool definitions for Claude
const GAME_TOOLS = [
  {
    name: 'roll_dice',
    description: 'Roll the dice to move around the board. Use this at the start of your turn if you can roll.',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'buy_property',
    description: 'Purchase the property you are currently standing on. Only use if the property is available for purchase and you can afford it.',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'decline_property',
    description: 'Decline to purchase the property you are standing on.',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'upgrade_property',
    description: 'Upgrade a property you own by adding security levels (houses) or advanced security (hotel). Requires owning all properties in the color group.',
    input_schema: {
      type: 'object',
      properties: {
        property_id: {
          type: 'number',
          description: 'The ID of the property to upgrade'
        }
      },
      required: ['property_id']
    }
  },
  {
    name: 'mortgage_property',
    description: 'Mortgage a property you own to get emergency cash. The property cannot have any upgrades on it.',
    input_schema: {
      type: 'object',
      properties: {
        property_id: {
          type: 'number',
          description: 'The ID of the property to mortgage'
        }
      },
      required: ['property_id']
    }
  },
  {
    name: 'pay_jail_fee',
    description: 'Pay £50 to immediately leave Quarantine (jail).',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'end_turn',
    description: 'End your turn and pass control to the next player. Use this when you have completed all actions you want to take.',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  }
];

// System prompt based on strategy
function getSystemPrompt(strategy = 'balanced') {
  const basePrompt = `You are playing CyberOpoly, a cybersecurity-themed Monopoly game. Your goal is to win by bankrupting your opponents.

## Game Rules:
- Roll dice to move around the board (40 spaces)
- Buy properties when you land on unowned ones
- Collect rent when opponents land on your properties
- Complete color groups (monopolies) to enable upgrades
- Upgrade properties with security levels (1-4) and advanced security (hotel) to increase rent
- Manage your money carefully - bankruptcy means you lose
- Get £200 when you pass GO (Security Operations Center)
- Quarantine (jail) - you can pay £50 to leave, roll doubles, or wait 3 turns

## Rent Mechanics:
- Base rent: Listed rent for property
- Monopoly (no upgrades): 2x base rent
- With upgrades: Much higher rent based on security level
- Incident Response Teams: Rent increases with how many you own (25/50/100/200)
- Certifications (Utilities): Rent is 4x or 10x dice roll depending on how many you own

## Winning Strategy:`;

  const strategyAddons = {
    aggressive: `
- Prioritize buying EVERYTHING you land on
- Focus on expensive properties (green, dark blue)
- Upgrade aggressively once you have monopolies
- Take more risks with cash flow
- Trade aggressively to complete monopolies
- Less concern about cash reserves

## Your Personality (Aggressive Hacker):
You're a bold, confident hacker who takes big risks. You speak with swagger and aren't afraid to show off. Use phrases like "Going all in!", "Time to exploit this vulnerability!", "Full send!", "Let's pwn this board!"`,

    balanced: `
- Buy most properties but be selective about expensive ones
- Aim for 2-3 monopolies before heavy upgrading
- Keep £200-300 cash reserve for emergencies
- Prioritize completing orange, red, and yellow groups (good ROI)
- Upgrade evenly across your monopolies
- Avoid risky situations that could lead to bankruptcy

## Your Personality (Strategic Analyst):
You're a calculated, professional security analyst who thinks through every move. You speak methodically and explain your reasoning. Use phrases like "Analyzing the threat landscape...", "This aligns with my strategy", "Risk-reward ratio looks good", "Maintaining operational security"`,

    defensive: `
- Very selective about purchases - focus on completing groups
- Prioritize cheaper property groups (brown, light blue, pink)
- Always maintain large cash reserves (£400+)
- Only upgrade when you have monopoly AND plenty of cash
- Avoid expensive properties unless they complete a group
- Play conservatively to outlast opponents

## Your Personality (Cautious Guardian):
You're a careful, paranoid security professional who values defense above all. You're worried about every risk and prefer safe plays. Use phrases like "Better safe than sorry", "Need to maintain my defenses", "Can't trust this situation", "Staying vigilant"`
  };

  return basePrompt + (strategyAddons[strategy] || strategyAddons.balanced) + `

## Your Task:
Analyze the current game state and make the best strategic decision. Use the provided tools to take actions.

## CRITICAL RESPONSE FORMAT:
You MUST respond in this exact order:
1. FIRST: Write a SHORT (1-2 sentence) commentary in your personality
2. THEN: Use the appropriate tool for your action

## Commentary Requirements:
- Write it BEFORE using any tool
- Keep it 1-2 sentences maximum
- Stay in character with your personality
- Make it engaging and natural
- React to what's happening in the game

## Commentary Examples:
Aggressive:
- "Ooh, landed on Mayfair! This is EXACTLY what I need. Going all in! 💪"
- "Time to roll the dice and make some moves! Let's pwn this board! 🎲"
- "£200 for this property? That's a steal. Acquiring now!"

Balanced:
- "Analyzing the situation... Park Lane at a reasonable price. Risk-reward ratio looks good. Proceeding."
- "My cash reserves are healthy, and this property fits my strategy. Purchasing."
- "Need to roll and assess the board position. Maintaining operational security."

Defensive:
- "Better roll carefully here... need to protect my cash reserves. 🛡️"
- "This property is expensive. Not risking my security budget on it."
- "Hmm, too risky at this price. Better safe than sorry!"

Think strategically and stay in character. Commentary first, then tool use!`;
}

// Format game state for Claude
function formatGameState(gameState, player) {
  const { board, players, currentPlayerIndex, turnPhase, lastDiceRoll } = gameState;
  const currentSpace = board.spaces[player.position];

  // Get player's properties with details
  const myProperties = player.properties.map(id => {
    const space = board.spaces[id];
    return {
      id: space.id,
      name: space.name,
      type: space.type,
      group: space.group,
      houses: space.houses || 0,
      hotel: space.hotel || false,
      mortgaged: space.mortgaged || false,
      price: space.price,
      rent: space.rent
    };
  });

  // Group properties by color
  const propertyGroups = {};
  myProperties.forEach(prop => {
    if (prop.type === 'property') {
      if (!propertyGroups[prop.group]) {
        propertyGroups[prop.group] = [];
      }
      propertyGroups[prop.group].push(prop);
    }
  });

  // Find monopolies (completed color groups)
  const monopolies = Object.entries(propertyGroups).filter(([group, props]) => {
    const groupSize = {
      brown: 2, lightblue: 3, pink: 3, orange: 3,
      red: 3, yellow: 3, green: 3, darkblue: 2
    };
    return props.length === groupSize[group];
  }).map(([group]) => group);

  // Get opponent info
  const opponents = players.filter(p => p.id !== player.id && !p.isBankrupt).map(p => ({
    name: p.name,
    money: p.money,
    properties: p.properties.length,
    position: p.position,
    inJail: p.inJail
  }));

  return `
## Current Turn Phase: ${turnPhase}
${turnPhase === 'roll' ? '(You need to roll the dice)' : ''}
${turnPhase === 'action' ? '(You have rolled and can now take actions)' : ''}
${turnPhase === 'end' ? '(You should end your turn)' : ''}

## Your Status:
- Money: £${player.money}
- Position: Space ${player.position} (${currentSpace.name})
- Properties Owned: ${player.properties.length}
- In Quarantine: ${player.inJail ? `Yes (${player.jailTurns}/3 turns)` : 'No'}
${lastDiceRoll && lastDiceRoll.length === 2 ? `- Last Dice Roll: ${lastDiceRoll[0]} + ${lastDiceRoll[1]} = ${lastDiceRoll[0] + lastDiceRoll[1]}` : ''}

## Current Space Details:
- Name: ${currentSpace.name}
- Type: ${currentSpace.type}
${currentSpace.price ? `- Price: £${currentSpace.price}` : ''}
${currentSpace.owner !== null && currentSpace.owner !== undefined ? `- Owner: ${currentSpace.owner === player.id ? 'You' : players[currentSpace.owner].name}` : '- Owner: None (Available for purchase)'}
${currentSpace.description ? `- Description: ${currentSpace.description}` : ''}

## Your Properties:
${myProperties.length === 0 ? 'None' : myProperties.map(p =>
  `- ${p.name} (${p.group || p.type}) - ${p.mortgaged ? 'MORTGAGED' : p.hotel ? 'Hotel' : p.houses > 0 ? `${p.houses} houses` : 'No upgrades'}`
).join('\n')}

## Monopolies You Own:
${monopolies.length === 0 ? 'None' : monopolies.join(', ')}

## Opponents:
${opponents.map(o => `- ${o.name}: £${o.money}, ${o.properties} properties${o.inJail ? ' (IN JAIL)' : ''}`).join('\n')}

## Available Actions Based on Turn Phase:
${turnPhase === 'roll' ? `- You MUST roll_dice first` : ''}
${turnPhase === 'action' ? `
- If standing on unowned property you can afford: buy_property or decline_property
- If you own properties with monopolies: upgrade_property
- If you need cash: mortgage_property
- When ready to end turn: end_turn
` : ''}
${turnPhase === 'end' ? `- You should end_turn now` : ''}
${player.inJail ? `- If in Quarantine and have £50: pay_jail_fee (or wait to roll doubles)` : ''}

Make your decision now. Choose ONE action to take.
`;
}

// Generate fallback commentary if Claude doesn't provide text
function generateFallbackCommentary(action, strategy, gameState) {
  const commentaries = {
    aggressive: {
      roll_dice: "Time to roll! Let's see what we get! 🎲",
      buy_property: "Claiming this asset! Full send! 💪",
      decline_property: "Passing on this one, bigger targets ahead!",
      upgrade_property: "Upgrading my empire! More power! 🔥",
      mortgage_property: "Quick cash grab to fuel my strategy!",
      pay_jail_fee: "Paying out to get back in the game!",
      end_turn: "Move complete. Next target acquired!"
    },
    balanced: {
      roll_dice: "Rolling dice. Let's assess the board position.",
      buy_property: "This property aligns with my strategy. Acquiring.",
      decline_property: "Not optimal for my current position. Declining.",
      upgrade_property: "Upgrading this asset to increase returns.",
      mortgage_property: "Leveraging this property for liquidity.",
      pay_jail_fee: "Paying to maintain operational tempo.",
      end_turn: "Turn complete. Maintaining steady progress."
    },
    defensive: {
      roll_dice: "Rolling carefully... need to protect my position. 🛡️",
      buy_property: "This fits my defensive strategy. Securing it.",
      decline_property: "Too risky for my cash reserves. Passing.",
      upgrade_property: "Strengthening my defenses on this property.",
      mortgage_property: "Need emergency funds to stay secure.",
      pay_jail_fee: "Better to pay and stay safe.",
      end_turn: "Turn done. Staying vigilant."
    }
  };

  const strategyComments = commentaries[strategy] || commentaries.balanced;
  return strategyComments[action] || "Making my move...";
}

// Get AI decision
export async function getAIDecision(gameState, player, strategy = 'balanced') {
  try {
    const systemPrompt = getSystemPrompt(strategy);
    const gameStatePrompt = formatGameState(gameState, player);

    console.log(`Calling Claude API with strategy: ${strategy}`);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: gameStatePrompt
        }
      ],
      tools: GAME_TOOLS,
      tool_choice: { type: 'auto' } // Allow Claude to think first, then use tool
    });

    // Extract tool use from response
    const toolUse = response.content.find(block => block.type === 'tool_use');

    if (!toolUse) {
      // Fallback: if no tool use, default to ending turn
      console.warn('No tool use in response, defaulting to end_turn');
      return {
        action: 'end_turn',
        reasoning: 'No specific action determined'
      };
    }

    console.log(`Tool selected: ${toolUse.name}`);

    // Extract commentary text (Claude's personality-driven comment)
    const textBlock = response.content.find(block => block.type === 'text');
    let commentary = textBlock?.text || '';

    // If no commentary provided, generate a fallback based on action and strategy
    if (!commentary || commentary.trim().length === 0) {
      console.warn('No commentary from Claude, using fallback');
      commentary = generateFallbackCommentary(toolUse.name, strategy, gameState);
    }

    console.log(`AI Commentary: ${commentary.substring(0, 150)}${commentary.length > 150 ? '...' : ''}`);

    // Parse the tool call into an action object
    const decision = {
      action: toolUse.name,
      params: toolUse.input || {},
      reasoning: commentary,
      commentary: commentary
    };

    return decision;

  } catch (error) {
    console.error('Error calling Anthropic API:', error);

    // Fallback decision
    if (gameState.turnPhase === 'roll') {
      return { action: 'roll_dice', reasoning: 'Fallback: Must roll' };
    } else {
      return { action: 'end_turn', reasoning: 'Fallback: Error occurred' };
    }
  }
}
