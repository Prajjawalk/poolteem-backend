const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const db = require('../db');

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Authentication Middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await db.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    const user = result.rows[0];
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Google OAuth Sign Up
router.post('/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    
    const result = await db.query('SELECT * FROM users WHERE google_id = $1', [payload.sub]);
    const user = result.rows[0];

    if (!user) {
      // Create new user
      const insertResult = await db.query(
        'INSERT INTO users (name, email, google_id) VALUES ($1, $2, $3) RETURNING *',
        [payload.name, payload.email, payload.sub]
      );
      
      const newUser = insertResult.rows[0];
      const jwtToken = jwt.sign(
        { userId: newUser.id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ 
        token: jwtToken, 
        user: newUser
      });
    } else {
      // Existing user
      const jwtToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ token: jwtToken, user });
    }
  } catch (error) {
    res.status(401).json({ error: 'Invalid Google token' });
  }
});

// Create/Update User Profile
router.post('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, username } = req.body;
    
    await db.query(
      'UPDATE users SET name = $1, username = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [name, username, req.user.id]
    );

    const result = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error updating profile' });
  }
});

// Update Jira OAuth Tokens
router.post('/jira-tokens', authenticateToken, async (req, res) => {
  try {
    const { accessToken, refreshToken, expiry } = req.body;
    
    // Validate all required fields are present
    if (!accessToken || !refreshToken || !expiry) {
      return res.status(400).json({ error: 'All token fields are required' });
    }

    // Check current tokens and expiry
    const result = await db.query(
      'SELECT jira_access_token, jira_refresh_token, jira_token_expiry FROM users WHERE id = $1',
      [req.user.id]
    );
    const user = result.rows[0];

    // Check if current tokens exist and are not expired
    const currentExpiry = user?.jira_token_expiry ? new Date(user.jira_token_expiry) : null;
    const isExpired = currentExpiry ? currentExpiry < new Date() : true;

    if (!user?.jira_access_token || !user?.jira_refresh_token || isExpired) {
      // Update tokens if current ones are missing or expired
      await db.query(
        `UPDATE users 
         SET jira_access_token = $1,
             jira_refresh_token = $2,
             jira_token_expiry = $3,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4`,
        [accessToken, refreshToken, expiry, req.user.id]
      );
      res.json({ message: 'Jira tokens updated successfully' });
    } else {
      res.status(400).json({ error: 'Current tokens are still valid' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error updating Jira tokens' });
  }
});

// Update Webex OAuth Tokens
router.post('/webex-tokens', authenticateToken, async (req, res) => {
  try {
    const { accessToken, refreshToken, expiry } = req.body;
    
    // Validate all required fields are present
    if (!accessToken || !refreshToken || !expiry) {
      return res.status(400).json({ error: 'All token fields are required' });
    }

    // Check current tokens and expiry
    const result = await db.query(
      'SELECT webex_access_token, webex_refresh_token, webex_token_expiry FROM users WHERE id = $1',
      [req.user.id]
    );
    const user = result.rows[0];

    // Check if current tokens exist and are not expired
    const currentExpiry = user?.webex_token_expiry ? new Date(user.webex_token_expiry) : null;
    const isExpired = currentExpiry ? currentExpiry < new Date() : true;

    if (!user?.webex_access_token || !user?.webex_refresh_token || isExpired) {
      // Update tokens if current ones are missing or expired
      await db.query(
        `UPDATE users 
         SET webex_access_token = $1,
             webex_refresh_token = $2,
             webex_token_expiry = $3,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4`,
        [accessToken, refreshToken, expiry, req.user.id]
      );
      res.json({ message: 'Webex tokens updated successfully' });
    } else {
      res.status(400).json({ error: 'Current tokens are still valid' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error updating Webex tokens' });
  }
});

// Refresh Jira Token
router.post('/refresh-jira-token', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT jira_refresh_token FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];
    
    if (!user || !user.jira_refresh_token) {
      return res.status(404).json({ error: 'User or refresh token not found' });
    }

    // Implement Jira token refresh logic here
    // This would typically involve making a request to Jira's token endpoint
    // const newTokens = await refreshJiraToken(user.jira_refresh_token);
    
    // await db.query(
    //   `UPDATE users 
    //    SET jira_access_token = $1,
    //        jira_refresh_token = $2,
    //        jira_token_expiry = $3,
    //        updated_at = CURRENT_TIMESTAMP
    //    WHERE id = $4`,
    //   [newTokens.access_token, newTokens.refresh_token, new Date(Date.now() + newTokens.expires_in * 1000), req.user.id]
    // );

    res.json({ message: 'Jira token refresh endpoint' });
  } catch (error) {
    res.status(500).json({ error: 'Error refreshing Jira token' });
  }
});

// Refresh Webex Token
router.post('/refresh-webex-token', authenticateToken, async (req, res) => {
  try {
    db.get('SELECT webex_refresh_token FROM users WHERE id = ?', [req.user.id], (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!user || !user.webex_refresh_token) {
        return res.status(404).json({ error: 'User or refresh token not found' });
      }

      // Implement Webex token refresh logic here
      // This would typically involve making a request to Webex's token endpoint
      // const newTokens = await refreshWebexToken(user.webex_refresh_token);
      
      // const stmt = db.prepare(`
      //   UPDATE users 
      //   SET webex_access_token = ?,
      //       webex_refresh_token = ?,
      //       webex_token_expiry = ?,
      //       updated_at = CURRENT_TIMESTAMP
      //   WHERE id = ?
      // `);
      
      // stmt.run([newTokens.access_token, newTokens.refresh_token, new Date(Date.now() + newTokens.expires_in * 1000), req.user.id]);
      // stmt.finalize();

      res.json({ message: 'Webex token refresh endpoint' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error refreshing Webex token' });
  }
});

// Create Webex Meeting Transcripts Webhook
router.post('/webex-webhook', authenticateToken, async (req, res) => {
  try {
    const targetUrl = process.env.WEBEX_WEBHOOK_URL;
    
    // Get user's Webex access token
    db.get('SELECT webex_access_token FROM users WHERE id = ?', [req.user.id], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!user || !user.webex_access_token) {
        return res.status(404).json({ error: 'Webex access token not found' });
      }

      try {
        // Create webhook in Webex
        const webexResponse = await axios.post(
          'https://webexapis.com/v1/webhooks',
          {
            name: 'Meeting Transcripts Webhook',
            targetUrl: targetUrl,
            resource: 'meetingTranscripts',
            event: 'created',
          },
          {
            headers: {
              'Authorization': `Bearer ${user.webex_access_token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        // Store webhook information in database
        const stmt = db.prepare(`
          INSERT INTO webex_webhooks (user_id, webhook_id, target_url)
          VALUES (?, ?, ?)
        `);
        
        stmt.run([req.user.id, webexResponse.data.id, targetUrl], function(err) {
          if (err) {
            return res.status(500).json({ error: 'Error storing webhook information' });
          }
          res.json({
            message: 'Webhook created successfully',
            webhookId: webexResponse.data.id
          });
        });
        stmt.finalize();
      } catch (webexError) {
        res.status(500).json({ error: 'Error creating Webex webhook', details: webexError.message });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error processing webhook creation' });
  }
});

// Delete Webex Meeting Transcripts Webhook
router.delete('/webex-webhook', authenticateToken, async (req, res) => {
  try {
    // Get webhook information from database
    db.get('SELECT webex_webhooks.webhook_id, users.webex_access_token FROM webex_webhooks JOIN users ON webex_webhooks.user_id = users.id WHERE webex_webhooks.user_id = ?', [req.user.id], async (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!result || !result.webhook_id || !result.webex_access_token) {
        return res.status(404).json({ error: 'Webhook or access token not found' });
      }

      try {
        // Delete webhook from Webex
        await axios.delete(
          `https://webexapis.com/v1/webhooks/${result.webhook_id}`,
          {
            headers: {
              'Authorization': `Bearer ${result.webex_access_token}`
            }
          }
        );

        // Delete webhook from database
        const stmt = db.prepare('DELETE FROM webex_webhooks WHERE user_id = ?');
        stmt.run([req.user.id], function(err) {
          if (err) {
            return res.status(500).json({ error: 'Error deleting webhook from database' });
          }
          res.json({ message: 'Webhook deleted successfully' });
        });
        stmt.finalize();
      } catch (webexError) {
        res.status(500).json({ error: 'Error deleting Webex webhook', details: webexError.message });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error processing webhook deletion' });
  }
});

// Check Jira Connection Status
router.get('/jira/status', authenticateToken, async (req, res) => {
  try {
    db.get(
      'SELECT jira_access_token, jira_refresh_token, jira_token_expiry FROM users WHERE id = ?',
      [req.user.id],
      (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        const isConnected = user && 
          user.jira_access_token && 
          user.jira_refresh_token && 
          user.jira_token_expiry;
        
        res.json({ connected: !!isConnected });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Error checking Jira connection status' });
  }
});

// Check Webex Connection Status
router.get('/webex/status', authenticateToken, async (req, res) => {
  try {
    db.get(
      'SELECT webex_access_token, webex_refresh_token, webex_token_expiry FROM users WHERE id = ?',
      [req.user.id],
      (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        const isConnected = user && 
          user.webex_access_token && 
          user.webex_refresh_token && 
          user.webex_token_expiry;
        
        res.json({ connected: !!isConnected });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Error checking Webex connection status' });
  }
});

// Check Webex Webhook Status
router.get('/webex/webhook/status', authenticateToken, async (req, res) => {
  try {
    db.get('SELECT webhook_id FROM webex_webhooks WHERE user_id = ?', [req.user.id], (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ webhookEnabled: !!user?.webhook_id });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error checking Webex webhook status' });
  }
});

module.exports = router;
