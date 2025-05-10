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
    console.log('Authentication failed: No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await db.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    const user = result.rows[0];
    
    if (!user) {
      console.log(`Authentication failed: User not found for ID ${decoded.userId}`);
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication failed: Invalid token', error);
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
      console.log(`Creating new user for Google ID ${payload.sub}`);
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

      console.log(`New user created successfully: ${newUser.email}`);
      res.json({ 
        token: jwtToken, 
        user: newUser
      });
    } else {
      console.log(`Existing user logged in: ${user.email}`);
      // Existing user
      const jwtToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ token: jwtToken, user });
    }
  } catch (error) {
    console.error('Google authentication failed:', error);
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
    console.log(`Profile updated for user ${req.user.id}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Error updating profile' });
  }
});

// Update Jira OAuth Tokens
router.post('/jira-tokens', authenticateToken, async (req, res) => {
  try {
    const { accessToken, refreshToken, expiry } = req.body;
    
    // Validate all required fields are present
    if (!accessToken || !refreshToken || !expiry) {
      console.log('Jira token update failed: Missing required fields', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        hasExpiry: !!expiry
      });
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
        [accessToken, refreshToken, parseInt(expiry), req.user.id]
      );
      console.log(`Jira tokens updated for user ${req.user.id}`);
      res.json({ message: 'Jira tokens updated successfully' });
    } else {
      console.log(`Jira tokens still valid for user ${req.user.id}`);
      res.status(400).json({ error: 'Current tokens are still valid' });
    }
  } catch (error) {
    console.error('Error updating Jira tokens:', error);
    res.status(500).json({ error: 'Error updating Jira tokens' });
  }
});

// Update Webex OAuth Tokens
router.post('/webex-tokens', authenticateToken, async (req, res) => {
  try {
    const { accessToken, refreshToken, expiry } = req.body;
    
    // Validate all required fields are present
    if (!accessToken || !refreshToken || !expiry) {
      console.log('Webex token update failed: Missing required fields', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        hasExpiry: !!expiry
      });
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
        [accessToken, refreshToken, parseInt(expiry), req.user.id]
      );
      console.log(`Webex tokens updated for user ${req.user.id}`);
      res.json({ message: 'Webex tokens updated successfully' });
    } else {
      console.log(`Webex tokens still valid for user ${req.user.id}`);
      res.status(400).json({ error: 'Current tokens are still valid' });
    }
  } catch (error) {
    console.error('Error updating Webex tokens:', error);
    res.status(500).json({ error: 'Error updating Webex tokens' });
  }
});

// Refresh Jira Token
router.post('/refresh-jira-token', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT jira_refresh_token FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];
    
    if (!user || !user.jira_refresh_token) {
      console.log(`Jira refresh token not found for user ${req.user.id}`);
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

    console.log(`Jira token refresh endpoint called for user ${req.user.id}`);
    res.json({ message: 'Jira token refresh endpoint' });
  } catch (error) {
    console.error('Error refreshing Jira token:', error);
    res.status(500).json({ error: 'Error refreshing Jira token' });
  }
});

// Refresh Webex Token
router.post('/refresh-webex-token', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT webex_refresh_token FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];
    
    if (!user || !user.webex_refresh_token) {
      console.log(`Webex refresh token not found for user ${req.user.id}`);
      return res.status(404).json({ error: 'User or refresh token not found' });
    }

    // Implement Webex token refresh logic here
    // This would typically involve making a request to Webex's token endpoint
    // const newTokens = await refreshWebexToken(user.webex_refresh_token);
    
    // await db.query(
    //   `UPDATE users 
    //    SET webex_access_token = $1,
    //        webex_refresh_token = $2,
    //        webex_token_expiry = $3,
    //        updated_at = CURRENT_TIMESTAMP
    //    WHERE id = $4`,
    //   [newTokens.access_token, newTokens.refresh_token, new Date(Date.now() + newTokens.expires_in * 1000), req.user.id]
    // );

    console.log(`Webex token refresh endpoint called for user ${req.user.id}`);
    res.json({ message: 'Webex token refresh endpoint' });
  } catch (error) {
    console.error('Error refreshing Webex token:', error);
    res.status(500).json({ error: 'Error refreshing Webex token' });
  }
});

// Create Webex Meeting Transcripts Webhook
router.post('/webex-webhook', authenticateToken, async (req, res) => {
  try {
    const targetUrl = process.env.WEBEX_WEBHOOK_URL;
    
    // Get user's Webex access token
    const result = await db.query('SELECT webex_access_token FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];
    
    if (!user || !user.webex_access_token) {
      console.log(`Webex access token not found for user ${req.user.id}`);
      return res.status(404).json({ error: 'Webex access token not found' });
    }

    try {
      console.log(`Creating Webex webhook for user ${req.user.id} with target URL: ${targetUrl}`);
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
      await db.query(
        `INSERT INTO webex_webhooks (user_id, webhook_id, target_url)
         VALUES ($1, $2, $3)`,
        [req.user.id, webexResponse.data.id, targetUrl]
      );
      
      console.log(`Webhook created successfully for user ${req.user.id}`);
      res.json({
        message: 'Webhook created successfully',
        webhookId: webexResponse.data.id
      });
    } catch (webexError) {
      console.error('Error creating Webex webhook:', webexError);
      res.status(500).json({ error: 'Error creating Webex webhook', details: webexError.message });
    }
  } catch (error) {
    console.error('Error processing webhook creation:', error);
    res.status(500).json({ error: 'Error processing webhook creation' });
  }
});

// Delete Webex Meeting Transcripts Webhook
router.delete('/webex-webhook', authenticateToken, async (req, res) => {
  try {
    // Get webhook information from database
    const result = await db.query(
      `SELECT webex_webhooks.webhook_id, users.webex_access_token 
       FROM webex_webhooks 
       JOIN users ON webex_webhooks.user_id = users.id 
       WHERE webex_webhooks.user_id = $1`,
      [req.user.id]
    );
    const webhookInfo = result.rows[0];
    
    if (!webhookInfo || !webhookInfo.webhook_id || !webhookInfo.webex_access_token) {
      console.log(`Webhook or access token not found for user ${req.user.id}`);
      return res.status(404).json({ error: 'Webhook or access token not found' });
    }

    try {
      console.log(`Deleting Webex webhook ${webhookInfo.webhook_id} for user ${req.user.id}`);
      // Delete webhook from Webex
      await axios.delete(
        `https://webexapis.com/v1/webhooks/${webhookInfo.webhook_id}`,
        {
          headers: {
            'Authorization': `Bearer ${webhookInfo.webex_access_token}`
          }
        }
      );

      // Delete webhook from database
      await db.query('DELETE FROM webex_webhooks WHERE user_id = $1', [req.user.id]);
      
      console.log(`Webhook deleted successfully for user ${req.user.id}`);
      res.json({ message: 'Webhook deleted successfully' });
    } catch (webexError) {
      console.error('Error deleting Webex webhook:', webexError);
      res.status(500).json({ error: 'Error deleting Webex webhook', details: webexError.message });
    }
  } catch (error) {
    console.error('Error processing webhook deletion:', error);
    res.status(500).json({ error: 'Error processing webhook deletion' });
  }
});

// Check Jira Connection Status
router.get('/jira/status', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT jira_access_token, jira_refresh_token, jira_token_expiry FROM users WHERE id = $1',
      [req.user.id]
    );
    const user = result.rows[0];
    
    if (!user) {
      console.error('Database error checking Jira status');
      return res.status(500).json({ error: 'Database error' });
    }
    
    const isConnected = user && 
      user.jira_access_token && 
      user.jira_refresh_token && 
      user.jira_token_expiry;
    
    console.log(`Jira connection status for user ${req.user.id}: ${isConnected ? 'connected' : 'disconnected'}`);
    res.json({ connected: !!isConnected });
  } catch (error) {
    console.error('Error checking Jira connection status:', error);
    res.status(500).json({ error: 'Error checking Jira connection status' });
  }
});

// Check Webex Connection Status
router.get('/webex/status', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT webex_access_token, webex_refresh_token, webex_token_expiry FROM users WHERE id = $1',
      [req.user.id]
    );
    const user = result.rows[0];
    
    if (!user) {
      console.error('Database error checking Webex status');
      return res.status(500).json({ error: 'Database error' });
    }
    
    const isConnected = user && 
      user.webex_access_token && 
      user.webex_refresh_token && 
      user.webex_token_expiry;
    
    console.log(`Webex connection status for user ${req.user.id}: ${isConnected ? 'connected' : 'disconnected'}`);
    res.json({ connected: !!isConnected });
  } catch (error) {
    console.error('Error checking Webex connection status:', error);
    res.status(500).json({ error: 'Error checking Webex connection status' });
  }
});

// Check Webex Webhook Status
router.get('/webex/webhook/status', authenticateToken, async (req, res) => {
  try {
    const result = await db.query('SELECT webhook_id FROM webex_webhooks WHERE user_id = $1', [req.user.id]);
    const webhook = result.rows[0];
    const webhookEnabled = !!webhook?.webhook_id;
    console.log(`Webex webhook status for user ${req.user.id}: ${webhookEnabled ? 'enabled' : 'disabled'}`);
    res.json({ webhookEnabled });
  } catch (error) {
    console.error('Error checking Webex webhook status:', error);
    res.status(500).json({ error: 'Error checking Webex webhook status' });
  }
});

module.exports = router;
