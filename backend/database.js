const { Pool } = require('pg');
const config = require('./config');

// Create PostgreSQL connection pool
const pool = new Pool({
  host: config.DB_HOST,
  port: config.DB_PORT,
  database: config.DB_NAME,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

// Initialize database tables
async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database tables...');
    
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create bottles table (entries) - SIMPLIFIED without groups
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bottles (
        id TEXT PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        amount INTEGER NOT NULL,
        time TIMESTAMP NOT NULL,
        color VARCHAR(7) DEFAULT '#6366F1',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create poops table - SIMPLIFIED without groups
    await pool.query(`
      CREATE TABLE IF NOT EXISTS poops (
        id TEXT PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        time TIMESTAMP NOT NULL,
        info TEXT,
        color VARCHAR(7) DEFAULT '#8B4513',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

// Helper function to execute queries
async function executeQuery(text, params = []) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('❌ Database query error:', error);
    throw error;
  }
}

module.exports = {
  pool,
  initializeDatabase,
  executeQuery
}; 