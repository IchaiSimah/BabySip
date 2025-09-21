const { Pool } = require('pg');
const config = require('./config');

// Create PostgreSQL connection pool
const pool = new Pool({
  host: config.DB_HOST,
  port: config.DB_PORT,
  database: config.DB_NAME,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function migrateToUnifiedIdSystem() {
  try {
    console.log('🔄 Starting migration to unified ID system...');
    
    // 1. Backup existing data (optional)
    console.log('📋 Creating backup of existing data...');
    const bottlesBackup = await pool.query('SELECT * FROM bottles');
    const poopsBackup = await pool.query('SELECT * FROM poops');
    
    console.log(`📦 Backup created: ${bottlesBackup.rows.length} bottles, ${poopsBackup.rows.length} poops`);
    
    // 2. Drop existing tables
    console.log('🗑️ Dropping existing tables...');
    await pool.query('DROP TABLE IF EXISTS bottles CASCADE');
    await pool.query('DROP TABLE IF EXISTS poops CASCADE');
    
    // 3. Create new tables with TEXT PRIMARY KEY
    console.log('🔧 Creating new tables with TEXT PRIMARY KEY...');
    
    await pool.query(`
      CREATE TABLE bottles (
        id TEXT PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        amount INTEGER NOT NULL,
        time TIMESTAMP NOT NULL,
        color VARCHAR(7) DEFAULT '#6366F1',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE poops (
        id TEXT PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        time TIMESTAMP NOT NULL,
        info TEXT,
        color VARCHAR(7) DEFAULT '#8B4513',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ New tables created successfully');
    
    // 4. Restore data with new ID format (if needed)
    if (bottlesBackup.rows.length > 0 || poopsBackup.rows.length > 0) {
      console.log('🔄 Restoring data with new ID format...');
      
      // For bottles: generate new TEXT IDs
      for (const bottle of bottlesBackup.rows) {
        const newId = `migrated_bottle_${bottle.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await pool.query(
          'INSERT INTO bottles (id, user_id, amount, time, color, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [newId, bottle.user_id, bottle.amount, bottle.time, bottle.color, bottle.created_at, bottle.updated_at]
        );
      }
      
      // For poops: generate new TEXT IDs
      for (const poop of poopsBackup.rows) {
        const newId = `migrated_poop_${poop.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await pool.query(
          'INSERT INTO poops (id, user_id, time, info, color, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [newId, poop.user_id, poop.time, poop.info, poop.color, poop.created_at, poop.updated_at]
        );
      }
      
      console.log(`✅ Data restored: ${bottlesBackup.rows.length} bottles, ${poopsBackup.rows.length} poops`);
    }
    
    console.log('🎉 Migration completed successfully!');
    console.log('📝 Note: All existing data has been migrated with new TEXT IDs');
    console.log('🚀 The backend is now ready for the unified ID system');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateToUnifiedIdSystem()
    .then(() => {
      console.log('✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateToUnifiedIdSystem };
