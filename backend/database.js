const mysql = require('mysql2/promise');
const config = require('./config');

// Create MySQL connection pool
const pool = mysql.createPool({
  host: config.DB_HOST,
  port: config.DB_PORT || 3306,
  database: config.DB_NAME,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
});

// Test database connection once on startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database');
    connection.release();
  } catch (err) {
    console.error('❌ Database connection error:', err);
  }
})();

// Initialize database tables
async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database tables...');

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create bottles table (entries)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bottles (
        id VARCHAR(191) PRIMARY KEY,
        user_id INT,
        amount INT NOT NULL,
        time DATETIME NOT NULL,
        color VARCHAR(7) DEFAULT '#6366F1',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_bottles_user FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create poops table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS poops (
        id VARCHAR(191) PRIMARY KEY,
        user_id INT,
        time DATETIME NOT NULL,
        info TEXT,
        color VARCHAR(7) DEFAULT '#8B4513',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_poops_user FOREIGN KEY (user_id) REFERENCES users(id)
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
    const [rows] = await pool.execute(text, params);
    return { rows };
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