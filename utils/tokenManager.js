const axios = require('axios');
const db = require('../db');

// Helper function to check if token is expired
const isTokenExpired = (expiryDate) => {
    if (!expiryDate) return true;
    // Add 5 minute buffer to ensure token doesn't expire during use
    return new Date(expiryDate) < new Date(Date.now() + 5 * 60 * 1000);
};

// Helper function to update tokens in database
const updateTokens = async (userId, service, tokens) => {
    try {
        const fields = service === 'jira' 
            ? ['jira_access_token', 'jira_refresh_token', 'jira_token_expiry']
            : ['webex_access_token', 'webex_refresh_token', 'webex_token_expiry'];

        await db.query(
            `UPDATE users 
             SET ${fields[0]} = $1,
                 ${fields[1]} = $2,
                 ${fields[2]} = $3,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $4`,
            [tokens.access_token, tokens.refresh_token, tokens.expiry, userId]
        );
    } catch (error) {
        console.error('Error updating tokens:', error);
        throw error;
    }
};

// Jira token refresh function
const refreshJiraToken = async (userId) => {
    try {
        // Get current tokens from database
        const result = await db.query(
            'SELECT jira_refresh_token, jira_token_expiry FROM users WHERE id = $1',
            [userId]
        );
        const user = result.rows[0];

        if (!user || !user.jira_refresh_token) {
            throw new Error('No refresh token found');
        }

        // Check if token is expired
        if (!isTokenExpired(user.jira_token_expiry)) {
            return user.jira_access_token;
        }

        // Refresh token using Jira OAuth endpoint
        const response = await axios.post('https://auth.atlassian.com/oauth/token', {
            grant_type: 'refresh_token',
            client_id: process.env.JIRA_CLIENT_ID,
            client_secret: process.env.JIRA_CLIENT_SECRET,
            refresh_token: user.jira_refresh_token
        });

        const newTokens = {
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token,
            expiry: new Date(Date.now() + response.data.expires_in * 1000).toISOString()
        };

        // Update tokens in database
        await updateTokens(userId, 'jira', newTokens);

        return newTokens.access_token;
    } catch (error) {
        console.error('Error refreshing Jira token:', error);
        throw error;
    }
};

// Webex token refresh function
const refreshWebexToken = async (userId) => {
    try {
        // Get current tokens from database
        const result = await db.query(
            'SELECT webex_refresh_token, webex_token_expiry, webex_user_id FROM users WHERE id = $1',
            [userId]
        );
        const user = result.rows[0];

        if (!user || !user.webex_refresh_token) {
            throw new Error('No refresh token found');
        }

        // Check if token is expired
        if (!isTokenExpired(user.webex_token_expiry)) {
            return user.webex_access_token;
        }

        // Refresh token using Webex OAuth endpoint
        const response = await axios.post('https://webexapis.com/v1/access_token', {
            grant_type: 'refresh_token',
            client_id: process.env.WEBEX_CLIENT_ID,
            client_secret: process.env.WEBEX_CLIENT_SECRET,
            refresh_token: user.webex_refresh_token
        });

        const newTokens = {
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token,
            expiry: new Date(Date.now() + response.data.expires_in * 1000).toISOString()
        };

        // If we don't have the Webex user ID, fetch it
        if (!user.webex_user_id) {
            try {
                const userResponse = await axios.get('https://webexapis.com/v1/people/me', {
                    headers: {
                        'Authorization': `Bearer ${newTokens.access_token}`
                    }
                });
                newTokens.webex_user_id = userResponse.data.id;
            } catch (error) {
                console.error('Error fetching Webex user ID:', error);
                // Continue without the user ID if we can't fetch it
            }
        }

        // Update tokens in database
        await db.query(
            `UPDATE users 
             SET webex_access_token = $1,
                 webex_refresh_token = $2,
                 webex_token_expiry = $3,
                 webex_user_id = COALESCE($4, webex_user_id),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $5`,
            [
                newTokens.access_token,
                newTokens.refresh_token,
                newTokens.expiry,
                newTokens.webex_user_id,
                userId
            ]
        );

        return newTokens.access_token;
    } catch (error) {
        console.error('Error refreshing Webex token:', error);
        throw error;
    }
};

// Middleware factory for token refresh
const createTokenRefreshMiddleware = (service) => {
    return async (req, res, next) => {
        try {
            const refreshFunction = service === 'jira' ? refreshJiraToken : refreshWebexToken;
            const accessToken = await refreshFunction(req.user.id);
            
            // Attach the fresh token to the request for use in the route handler
            req[`${service}AccessToken`] = accessToken;
            next();
        } catch (error) {
            console.error(`Error in ${service} token refresh middleware:`, error);
            res.status(401).json({ 
                error: `${service} authentication failed`,
                details: error.message 
            });
        }
    };
};

module.exports = {
    refreshJiraToken,
    refreshWebexToken,
    createTokenRefreshMiddleware
}; 