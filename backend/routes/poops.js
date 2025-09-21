const express = require('express');
const jwt = require('jsonwebtoken');
const { executeQuery } = require('../database');
const config = require('../config');

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Add a new poop
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { id, time, info, color } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!id || !time) {
      return res.status(400).json({ 
        error: 'ID and time are required' 
      });
    }

    // Add poop with provided ID
    const newPoop = await executeQuery(
      'INSERT INTO poops (id, user_id, time, info, color) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, userId, new Date(time), info || null, color || '#8B4513']
    );

    res.status(201).json({
      message: 'Poop added successfully',
      poop: newPoop.rows[0]
    });

  } catch (error) {
    console.error('Add poop error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get poops for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0, since } = req.query;
    const userId = req.user.userId;

    // Build query with optional since parameter
    let query = `
      SELECT p.*, u.username as user_name
      FROM poops p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = $1
    `;
    let params = [userId];
    let paramIndex = 2;

    if (since) {
      query += ` AND p.time >= $${paramIndex}`;
      params.push(since);
      paramIndex++;
    }

    query += `
      ORDER BY p.time DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(parseInt(limit), parseInt(offset));

    // Get poops
    const poops = await executeQuery(query, params);

    // Get total count (with since filter if provided)
    let countQuery = 'SELECT COUNT(*) as total FROM poops WHERE user_id = $1';
    let countParams = [userId];
    
    if (since) {
      countQuery += ' AND time >= $2';
      countParams.push(since);
    }
    
    const countResult = await executeQuery(countQuery, countParams);

    res.json({
      poops: poops.rows,
      total: parseInt(countResult.rows[0].total),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Get poops error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get today's poops for user
router.get('/today', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get today's poops
    const poops = await executeQuery(`
      SELECT p.*, u.username as user_name
      FROM poops p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = $1 
      AND DATE(p.time) = CURRENT_DATE
      ORDER BY p.time DESC
    `, [userId]);

    // Get total count for today
    const countResult = await executeQuery(`
      SELECT COUNT(*) as count 
      FROM poops 
      WHERE user_id = $1 
      AND DATE(time) = CURRENT_DATE
    `, [userId]);

    res.json({
      poops: poops.rows,
      count: parseInt(countResult.rows[0].count)
    });

  } catch (error) {
    console.error('Get today poops error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a poop
router.put('/:poopId', authenticateToken, async (req, res) => {
  try {
    const { poopId } = req.params;
    const { time, info, color } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!time) {
      return res.status(400).json({ 
        error: 'Time is required' 
      });
    }

    // Check if poop exists and belongs to user
    const existingPoop = await executeQuery(
      'SELECT * FROM poops WHERE id = $1 AND user_id = $2',
      [poopId, userId]
    );

    if (existingPoop.rows.length === 0) {
      return res.status(404).json({ error: 'Poop not found or access denied' });
    }

    // Update poop
    const updatedPoop = await executeQuery(
      'UPDATE poops SET time = $1, info = $2, color = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [new Date(time), info || null, color || '#8B4513', poopId]
    );

    res.json({
      message: 'Poop updated successfully',
      poop: updatedPoop.rows[0]
    });

  } catch (error) {
    console.error('Update poop error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a poop
router.delete('/:poopId', authenticateToken, async (req, res) => {
  try {
    const { poopId } = req.params;
    const userId = req.user.userId;

    // Check if poop exists and belongs to user
    const poop = await executeQuery(
      'SELECT * FROM poops WHERE id = $1 AND user_id = $2',
      [poopId, userId]
    );

    if (poop.rows.length === 0) {
      return res.status(404).json({ error: 'Poop not found or access denied' });
    }

    // Delete poop
    await executeQuery('DELETE FROM poops WHERE id = $1', [poopId]);

    res.json({
      message: 'Poop deleted successfully'
    });

  } catch (error) {
    console.error('Delete poop error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get statistics for poops
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { period = '7d' } = req.query; // 7d, 30d, 90d
    const userId = req.user.userId;

    let dateFilter;
    switch (period) {
      case '7d':
        dateFilter = 'AND p.time >= CURRENT_DATE - INTERVAL \'7 days\'';
        break;
      case '30d':
        dateFilter = 'AND p.time >= CURRENT_DATE - INTERVAL \'30 days\'';
        break;
      case '90d':
        dateFilter = 'AND p.time >= CURRENT_DATE - INTERVAL \'90 days\'';
        break;
      default:
        dateFilter = 'AND p.time >= CURRENT_DATE - INTERVAL \'7 days\'';
    }

    // Get statistics
    const stats = await executeQuery(`
      SELECT 
        COUNT(*) as total_poops,
        COUNT(DISTINCT DATE(time)) as active_days,
        COUNT(DISTINCT user_id) as active_users
      FROM poops p
      WHERE user_id = $1 ${dateFilter}
    `, [userId]);

    // Get daily breakdown
    const dailyStats = await executeQuery(`
      SELECT 
        DATE(time) as date,
        COUNT(*) as poops_count
      FROM poops 
      WHERE user_id = $1 ${dateFilter}
      GROUP BY DATE(time)
      ORDER BY date DESC
    `, [userId]);

    res.json({
      period,
      statistics: stats.rows[0],
      dailyBreakdown: dailyStats.rows
    });

  } catch (error) {
    console.error('Get poop stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
