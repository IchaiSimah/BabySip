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

// Add a new bottle
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { id, amount, time, color } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!id || !amount || !time) {
      return res.status(400).json({ 
        error: 'ID, amount and time are required' 
      });
    }

    // Add bottle with provided ID
    const newBottle = await executeQuery(
      'INSERT INTO bottles (id, user_id, amount, time, color) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, userId, amount, new Date(time), color || '#6366F1']
    );

    res.status(201).json({
      message: 'Bottle added successfully',
      bottle: newBottle.rows[0]
    });

  } catch (error) {
    console.error('Add bottle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get bottles for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0, since } = req.query;
    const userId = req.user.userId;

    // Build query with optional since parameter
    let query = `
      SELECT b.*, u.username as user_name
      FROM bottles b
      JOIN users u ON b.user_id = u.id
      WHERE b.user_id = $1
    `;
    let params = [userId];
    let paramIndex = 2;

    if (since) {
      query += ` AND b.time >= $${paramIndex}`;
      params.push(since);
      paramIndex++;
    }

    query += `
      ORDER BY b.time DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(parseInt(limit), parseInt(offset));

    // Get bottles
    const bottles = await executeQuery(query, params);

    // Get total count (with since filter if provided)
    let countQuery = 'SELECT COUNT(*) as total FROM bottles WHERE user_id = $1';
    let countParams = [userId];
    
    if (since) {
      countQuery += ' AND time >= $2';
      countParams.push(since);
    }
    
    const countResult = await executeQuery(countQuery, countParams);

    res.json({
      bottles: bottles.rows,
      total: parseInt(countResult.rows[0].total),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Get bottles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get today's bottles for user
router.get('/today', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get today's bottles
    const bottles = await executeQuery(`
      SELECT b.*, u.username as user_name
      FROM bottles b
      JOIN users u ON b.user_id = u.id
      WHERE b.user_id = $1 
      AND DATE(b.time) = CURRENT_DATE
      ORDER BY b.time DESC
    `, [userId]);

    // Calculate total amount
    const totalAmount = bottles.rows.reduce((sum, bottle) => sum + bottle.amount, 0);

    res.json({
      bottles: bottles.rows,
      totalAmount,
      count: bottles.rows.length
    });

  } catch (error) {
    console.error('Get today bottles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a bottle
router.put('/:bottleId', authenticateToken, async (req, res) => {
  try {
    const { bottleId } = req.params;
    const { amount, time, color } = req.body;
    const userId = req.user.userId;

    // Check if bottle exists and belongs to user
    const bottle = await executeQuery(
      'SELECT * FROM bottles WHERE id = $1 AND user_id = $2',
      [bottleId, userId]
    );

    if (bottle.rows.length === 0) {
      return res.status(404).json({ error: 'Bottle not found or access denied' });
    }

    // Update bottle
    const updatedBottle = await executeQuery(
      'UPDATE bottles SET amount = $1, time = $2, color = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [amount, new Date(time), color, bottleId]
    );

    res.json({
      message: 'Bottle updated successfully',
      bottle: updatedBottle.rows[0]
    });

  } catch (error) {
    console.error('Update bottle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a bottle
router.delete('/:bottleId', authenticateToken, async (req, res) => {
  try {
    const { bottleId } = req.params;
    const userId = req.user.userId;

    // Check if bottle exists and belongs to user
    const bottle = await executeQuery(
      'SELECT * FROM bottles WHERE id = $1 AND user_id = $2',
      [bottleId, userId]
    );

    if (bottle.rows.length === 0) {
      return res.status(404).json({ error: 'Bottle not found or access denied' });
    }

    // Delete bottle
    await executeQuery('DELETE FROM bottles WHERE id = $1', [bottleId]);

    res.json({
      message: 'Bottle deleted successfully'
    });

  } catch (error) {
    console.error('Delete bottle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get bottles by time range for statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { period = '24h' } = req.query; // 24h, 7d, 30d
    const userId = req.user.userId;

    let dateFilter;
    let groupByClause;
    let orderByClause;

    switch (period) {
      case '24h':
        dateFilter = 'AND b.time >= NOW() - INTERVAL \'24 hours\'';
        groupByClause = 'b.time'; // Individual bottles, not grouped
        orderByClause = 'ORDER BY time_period ASC';
        break;
      case '7d':
        dateFilter = 'AND b.time >= NOW() - INTERVAL \'7 days\'';
        groupByClause = 'DATE(b.time)';
        orderByClause = 'ORDER BY time_period ASC';
        break;
      case '30d':
        dateFilter = 'AND b.time >= NOW() - INTERVAL \'30 days\'';
        groupByClause = 'DATE(b.time)';
        orderByClause = 'ORDER BY time_period ASC';
        break;
      default:
        dateFilter = 'AND b.time >= NOW() - INTERVAL \'24 hours\'';
        groupByClause = 'b.time'; // Individual bottles, not grouped
        orderByClause = 'ORDER BY time_period ASC';
    }

    let stats;
    
    if (period === '24h') {
      // For 24h, get individual bottles (not grouped)
      stats = await executeQuery(`
        SELECT 
          b.time as time_period,
          1 as bottles_count,
          b.amount as total_amount,
          b.amount as average_amount
        FROM bottles b
        WHERE b.user_id = $1 ${dateFilter}
        ORDER BY b.time ASC
      `, [userId]);
    } else {
      // For 7d and 30d, get aggregated data
      stats = await executeQuery(`
        SELECT 
          ${groupByClause} as time_period,
          COUNT(*) as bottles_count,
          SUM(amount) as total_amount,
          AVG(amount) as average_amount
        FROM bottles b
        WHERE b.user_id = $1 ${dateFilter}
        GROUP BY ${groupByClause}
        ${orderByClause}
      `, [userId]);
    }

    res.json({
      period,
      data: stats.rows
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get statistics for a group
router.get('/group/:groupId/stats', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { period = '7d' } = req.query; // 7d, 30d, 90d
    const userId = req.user.userId;

    // Check if user is member of this group
    const membership = await executeQuery(
      'SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, userId]
    );

    if (membership.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let dateFilter;
    switch (period) {
      case '7d':
        dateFilter = 'AND b.time >= CURRENT_DATE - INTERVAL \'7 days\'';
        break;
      case '30d':
        dateFilter = 'AND b.time >= CURRENT_DATE - INTERVAL \'30 days\'';
        break;
      case '90d':
        dateFilter = 'AND b.time >= CURRENT_DATE - INTERVAL \'90 days\'';
        break;
      default:
        dateFilter = 'AND b.time >= CURRENT_DATE - INTERVAL \'7 days\'';
    }

    // Get statistics
    const stats = await executeQuery(`
      SELECT 
        COUNT(*) as total_bottles,
        SUM(amount) as total_amount,
        AVG(amount) as average_amount,
        COUNT(DISTINCT DATE(time)) as active_days,
        COUNT(DISTINCT user_id) as active_users
      FROM bottles b
      WHERE group_id = $1 ${dateFilter}
    `, [groupId]);

    // Get daily breakdown
    const dailyStats = await executeQuery(`
      SELECT 
        DATE(time) as date,
        COUNT(*) as bottles_count,
        SUM(amount) as total_amount
      FROM bottles 
      WHERE group_id = $1 ${dateFilter}
      GROUP BY DATE(time)
      ORDER BY date DESC
    `, [groupId]);

    res.json({
      period,
      statistics: stats.rows[0],
      dailyBreakdown: dailyStats.rows
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 