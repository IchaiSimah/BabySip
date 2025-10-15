const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { executeQuery } = require('../database');
const config = require('../config');
const emailService = require('../emailService');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Username, email and password are required' 
      });
    }

    // Check if user already exists
    const existingUser = await executeQuery(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ 
        error: 'Username or email already exists' 
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const insertResult = await executeQuery(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, passwordHash]
    );
    const newUserId = insertResult.rows.insertId;
    const newUser = await executeQuery(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [newUserId]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.rows[0].id, username: newUser.rows[0].username },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    // Send welcome email (optional)
    try {
      await emailService.sendWelcomeEmail(newUser.rows[0].email, newUser.rows[0].username);
      console.log(`✅ Welcome email sent to ${newUser.rows[0].email}`);
    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError);
      // Don't fail registration if email fails
    }

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.rows[0].id,
        username: newUser.rows[0].username,
        email: newUser.rows[0].email
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required' 
      });
    }

    // Find user
    const user = await executeQuery(
      'SELECT id, username, email, password_hash FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.rows[0].id, username: user.rows[0].username },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.rows[0].id,
        username: user.rows[0].username,
        email: user.rows[0].email
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    const user = await executeQuery(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: user.rows[0]
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Store reset codes temporarily (in production, use Redis or database)
const resetCodes = new Map();

// Send reset code
router.post('/send-reset-code', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({ 
        error: 'Email is required' 
      });
    }

    // Find user by email
    const user = await executeQuery(
      'SELECT id, email FROM users WHERE email = ?',
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Email not found' 
      });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store code with expiration (10 minutes)
    resetCodes.set(email, {
      code,
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
      attempts: 0
    });

    // Send email with code
    try {
      await emailService.sendResetCode(email, code);
      console.log(`✅ Reset code email sent to ${email}: ${code}`);
    } catch (emailError) {
      console.error('❌ Failed to send email:', emailError);
      // Still return success to user, but log the error
      console.log(`🔐 Reset code for ${email}: ${code} (email failed)`);
    }

    res.json({ 
      message: 'Reset code sent to your email',
      // Remove this in production - only for testing
      debugCode: process.env.NODE_ENV === 'development' ? code : undefined
    });

  } catch (error) {
    console.error('Send reset code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify reset code only
router.post('/verify-reset-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    // Validate input
    if (!email || !code) {
      return res.status(400).json({ 
        error: 'Email and code are required' 
      });
    }

    // Check if code exists and is valid
    const storedData = resetCodes.get(email);
    if (!storedData) {
      return res.status(400).json({ 
        error: 'No reset code found for this email' 
      });
    }

    // Check if code is expired
    if (Date.now() > storedData.expires) {
      resetCodes.delete(email);
      return res.status(400).json({ 
        error: 'Reset code has expired' 
      });
    }

    // Check if code matches
    if (storedData.code !== code) {
      storedData.attempts++;
      
      // Delete code after 3 failed attempts
      if (storedData.attempts >= 3) {
        resetCodes.delete(email);
        return res.status(400).json({ 
          error: 'Too many failed attempts. Please request a new code.' 
        });
      }
      
      return res.status(400).json({ 
        error: `Invalid code. ${3 - storedData.attempts} attempts remaining.` 
      });
    }

    res.json({
      message: 'Code verified successfully'
    });

  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify reset code and reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    // Validate input
    if (!email || !code || !newPassword) {
      return res.status(400).json({ 
        error: 'Email, code and new password are required' 
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Check if code exists and is valid
    const storedData = resetCodes.get(email);
    if (!storedData) {
      return res.status(400).json({ 
        error: 'No reset code found for this email' 
      });
    }

    // Check if code is expired
    if (Date.now() > storedData.expires) {
      resetCodes.delete(email);
      return res.status(400).json({ 
        error: 'Reset code has expired' 
      });
    }

    // Check if code matches
    if (storedData.code !== code) {
      storedData.attempts++;
      
      // Delete code after 3 failed attempts
      if (storedData.attempts >= 3) {
        resetCodes.delete(email);
        return res.status(400).json({ 
          error: 'Too many failed attempts. Please request a new code.' 
        });
      }
      
      return res.status(400).json({ 
        error: `Invalid code. ${3 - storedData.attempts} attempts remaining.` 
      });
    }

    // Hash new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    await executeQuery(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [passwordHash, email]
    );

    // Delete used code
    resetCodes.delete(email);

    console.log(`✅ Password reset successful for ${email}`);

    res.json({
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 