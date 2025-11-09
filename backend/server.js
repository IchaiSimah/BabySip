const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables FIRST
dotenv.config();

const { initializeDatabase } = require('./database');
const WebSocket = require('ws');
const http = require('http');
const jwt = require('jsonwebtoken');
const config = require('./config');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Map();

// JWT verification function for WebSocket connections
const verifyWebSocketToken = (token, userId) => {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // Check if the token belongs to the claimed user
    if (decoded.userId !== parseInt(userId)) {
      return { valid: false, error: 'User ID mismatch' };
    }
    
    return { valid: true, user: decoded };
  } catch (error) {
    return { valid: false, error: 'Invalid token' };
  }
};

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database on startup
initializeDatabase()
  .then(() => {
    console.log('Database initialized successfully');
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });

// Import routes
const authRoutes = require('./routes/auth');
const bottleRoutes = require('./routes/bottles');
const poopRoutes = require('./routes/poops');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/bottles', bottleRoutes);
app.use('/api/poops', poopRoutes);

// WebSocket connection handling
wss.on('connection', (ws, req) => {
  // Parse query parameters
  
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get('token');
  const userId = url.searchParams.get('userId');
  const deviceId = url.searchParams.get('deviceId') || `device_${Date.now()}`;
  
  // Validate required parameters
  if (!token || !userId) {
    ws.close(1008, 'Missing token or userId');
    return;
  }
  
  // 🔥 NEW: Verify JWT token
  const authResult = verifyWebSocketToken(token, userId);
  if (!authResult.valid) {
    ws.close(1008, authResult.error);
    return;
  }
  clients.forEach((existingClient, existingWs) => {
    if (existingClient.deviceId === deviceId && existingWs !== ws) {
      console.log(`Removing old connection for device ${deviceId}`);
      existingWs.close(1000, 'New connection from same device');
      clients.delete(existingWs);
    }
  });
  // Store authenticated client information
  const clientInfo = {
    ws,
    userId: parseInt(userId),
    token,
    deviceId,
    user: authResult.user,
    connectedAt: Date.now()
  };
  
  clients.set(ws, clientInfo);
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'CONNECTED',
    data: { userId: parseInt(userId) },
    userId: parseInt(userId),
    groupId: 1,
    timestamp: Date.now()
  }));
  
  // Handle incoming messages
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      
      // Broadcast message to all other clients
      clients.forEach((client, clientWs) => {
        // Debug WebSocket connection
        if (clientWs !== ws 
          && clientWs.readyState === WebSocket.OPEN
          && client.deviceId !== deviceId
          && client.userId === parseInt(userId)) {
          console.log('Broadcasting message');
          clientWs.send(JSON.stringify(message));
        }
      });
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });
  
  // Handle client disconnect
  ws.on('close', (code, reason) => {
    clients.delete(ws);
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'BBT Backend API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      groups: '/api/groups',
      bottles: '/api/bottles',
      poops: '/api/poops'
    },
    websocket: {
      status: 'Active',
      connectedClients: clients.size
    }
  });
});

// Health check route
app.get('/health', async (req, res) => {
  try {
    const { pool } = require('./database');
    await pool.query('SELECT 1');
    res.json({ 
      status: 'OK',
      database: 'Connected',
      websocket: {
        status: 'Active',
        connectedClients: clients.size,
        authentication: 'Enabled'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR',
      database: 'Disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  const host = process.env.HOST || 'localhost';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const wsProtocol = process.env.NODE_ENV === 'production' ? 'wss' : 'ws';
  
  console.log(`BBT Backend server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API available at ${protocol}://${host}:${PORT}`);
  console.log(`WebSocket available at ${wsProtocol}://${host}:${PORT}`);
  console.log(`Health check at ${protocol}://${host}:${PORT}/health`);
});

module.exports = app; 