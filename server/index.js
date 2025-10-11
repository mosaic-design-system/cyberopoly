import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getAIDecision } from './ai-agent.js';

// Load environment variables
dotenv.config();

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

    // Validate request
    if (!gameState || !player) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'gameState and player are required'
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
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════');
  console.log('  🎮 CyberOpoly AI Server');
  console.log('═══════════════════════════════════════════');
  console.log(`  📡 Server running on port ${PORT}`);
  console.log(`  🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`  🤖 AI endpoint: http://localhost:${PORT}/api/ai-decision`);
  console.log(`  🔑 API Key: ${process.env.ANTHROPIC_API_KEY ? '✓ Configured' : '✗ Missing'}`);
  console.log('═══════════════════════════════════════════');
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
