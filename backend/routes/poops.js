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
    await executeQuery(
      'INSERT INTO poops (id, user_id, time, info, color) VALUES (?, ?, ?, ?, ?)',
      [id, userId, new Date(time), info || null, color || '#8B4513']
    );
    const newPoop = await executeQuery(
      'SELECT * FROM poops WHERE id = ?',
      [id]
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
    const limitNum = Math.max(0, Number.parseInt(limit));
    const offsetNum = Math.max(0, Number.parseInt(offset));
    const userId = req.user.userId;

    // Build query with optional since parameter
    let query = `
      SELECT p.*, u.username as user_name
      FROM poops p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
    `;
    let params = [userId];

    if (since) {
      query += ` AND p.time >= ?`;
      params.push(since);
    }

    query += `
      ORDER BY p.time DESC
      LIMIT ${offsetNum}, ${limitNum}
    `;

    // Get poops
    const poops = await executeQuery(query, params);

    // Get total count (with since filter if provided)
    let countQuery = 'SELECT COUNT(*) as total FROM poops WHERE user_id = ?';
    let countParams = [userId];
    
    if (since) {
      countQuery += ' AND time >= ?';
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
      WHERE p.user_id = ? 
      AND DATE(p.time) = CURDATE()
      ORDER BY p.time DESC
    `, [userId]);

    // Get total count for today
    const countResult = await executeQuery(`
      SELECT COUNT(*) as count 
      FROM poops 
      WHERE user_id = ? 
      AND DATE(time) = CURDATE()
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
      'SELECT * FROM poops WHERE id = ? AND user_id = ?',
      [poopId, userId]
    );

    if (existingPoop.rows.length === 0) {
      return res.status(404).json({ error: 'Poop not found or access denied' });
    }

    // Update poop
    await executeQuery(
      'UPDATE poops SET time = ?, info = ?, color = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [new Date(time), info || null, color || '#8B4513', poopId]
    );
    const updatedPoop = await executeQuery(
      'SELECT * FROM poops WHERE id = ?',
      [poopId]
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
      'SELECT * FROM poops WHERE id = ? AND user_id = ?',
      [poopId, userId]
    );

    if (poop.rows.length === 0) {
      return res.status(404).json({ error: 'Poop not found or access denied' });
    }

    // Delete poop
    await executeQuery('DELETE FROM poops WHERE id = ?', [poopId]);

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
        dateFilter = 'AND p.time >= CURRENT_DATE - INTERVAL 7 DAY';
        break;
      case '30d':
        dateFilter = 'AND p.time >= CURRENT_DATE - INTERVAL 30 DAY';
        break;
      case '90d':
        dateFilter = 'AND p.time >= CURRENT_DATE - INTERVAL 90 DAY';
        break;
      default:
        dateFilter = 'AND p.time >= CURRENT_DATE - INTERVAL 7 DAY';
    }

    // Get statistics
    const stats = await executeQuery(`
      SELECT 
        COUNT(*) as total_poops,
        COUNT(DISTINCT DATE(time)) as active_days,
        COUNT(DISTINCT user_id) as active_users
      FROM poops p
      WHERE user_id = ? ${dateFilter}
    `, [userId]);

    // Get daily breakdown
    const dailyStats = await executeQuery(`
      SELECT 
        DATE(time) as date,
        COUNT(*) as poops_count
      FROM poops 
      WHERE user_id = ? ${dateFilter}
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
