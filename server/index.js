import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getAIDecision, testAIConnection } from './ai-agent.js';

// Load environment variables
dotenv.config();

// Validate critical environment variables
const validateEnvironment = () => {
  const errors = [];

  // Check for API key (required for AI functionality)
  if (!process.env.ANTHROPIC_API_KEY) {
    errors.push('ANTHROPIC_API_KEY is not set');
  } else if (!process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-')) {
    errors.push('ANTHROPIC_API_KEY appears to be invalid (should start with "sk-ant-")');
  }

  // Warn if port is in use range that might conflict
  const port = parseInt(process.env.PORT || '3001');
  if (isNaN(port) || port < 1024 || port > 65535) {
    errors.push(`PORT must be a valid number between 1024 and 65535 (current: ${process.env.PORT})`);
  }

  return errors;
};

// Run validation
const envErrors = validateEnvironment();
if (envErrors.length > 0) {
  console.error('\n❌ Environment Configuration Errors:');
  envErrors.forEach(error => console.error(`   - ${error}`));
  console.error('\n💡 Please check your .env file in the server directory');
  console.error('   Example: ANTHROPIC_API_KEY=sk-ant-your-key-here\n');

  // Exit with error code if API key is completely missing
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('⚠️  Server cannot start without ANTHROPIC_API_KEY');
    console.error('   AI players will not work!\n');
    process.exit(1);
  } else {
    console.warn('⚠️  Server starting with configuration warnings...\n');
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'cyberopoly-ai',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// AI decision endpoint
app.post('/api/ai-decision', async (req, res) => {
  try {
    const { gameState, player, strategy } = req.body;

    // Validate request body exists
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Request body must be a valid JSON object'
      });
    }

    // Validate required fields
    if (!gameState || !player) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'gameState and player are required'
      });
    }

    // Validate gameState structure
    if (typeof gameState !== 'object' || !Array.isArray(gameState.players)) {
      return res.status(400).json({
        error: 'Invalid gameState',
        message: 'gameState must be an object with a players array'
      });
    }

    // Validate player structure
    if (typeof player !== 'object' || !player.name || typeof player.money !== 'number') {
      return res.status(400).json({
        error: 'Invalid player',
        message: 'player must be an object with name and money properties'
      });
    }

    // Validate strategy if provided
    const validStrategies = ['aggressive', 'balanced', 'defensive'];
    if (strategy && !validStrategies.includes(strategy)) {
      return res.status(400).json({
        error: 'Invalid strategy',
        message: `strategy must be one of: ${validStrategies.join(', ')}`
      });
    }

    // Validate API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not configured');
      return res.status(500).json({
        error: 'Server misconfigured',
        message: 'AI service not properly configured'
      });
    }

    console.log(`Processing AI decision for player: ${player.name} (Strategy: ${strategy || 'balanced'})`);

    // Get AI decision
    const decision = await getAIDecision(gameState, player, strategy);

    console.log(`AI decision: ${decision.action} ${decision.reasoning ? '- ' + decision.reasoning : ''}`);

    res.json({
      success: true,
      decision,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error processing AI decision:', error);

    // Handle specific error types
    if (error.name === 'APIError') {
      return res.status(502).json({
        error: 'AI service error',
        message: 'Failed to communicate with AI service',
        details: error.message
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint does not exist'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

// Start server
app.listen(PORT, async () => {
  console.log('═══════════════════════════════════════════');
  console.log('  🎮 CyberOpoly AI Server');
  console.log('═══════════════════════════════════════════');
  console.log(`  📡 Server running on port ${PORT}`);
  console.log(`  🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`  🤖 AI endpoint: http://localhost:${PORT}/api/ai-decision`);
  console.log(`  🔑 API Key: ${process.env.ANTHROPIC_API_KEY ? '✓ Configured' : '✗ Missing'}`);
  console.log('═══════════════════════════════════════════');

  // Test AI connection
  if (process.env.ANTHROPIC_API_KEY) {
    console.log('\n  🔍 Testing AI model connection...');
    const testResult = await testAIConnection();

    if (testResult.success) {
      console.log(`  ✅ AI Model: ${testResult.model}`);
      console.log('  ✅ Status: Connected and working');
    } else {
      console.log('  ❌ AI Model: Connection FAILED');
      console.log(`  ❌ Error: ${testResult.error}`);
      console.log('  ⚠️  AI players will NOT work!');
      console.log('  💡 Check your ANTHROPIC_API_KEY in server/.env');
    }
    console.log('═══════════════════════════════════════════\n');
  } else {
    console.log('\n  ⚠️  No API key configured - AI players will not work');
    console.log('  💡 Add ANTHROPIC_API_KEY to server/.env');
    console.log('═══════════════════════════════════════════\n');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  process.exit(0);
});
