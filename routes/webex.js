var express = require('express');
var router = express.Router();
const transcriptProcessor = require('../services/transcriptProcessor');
const axios = require('axios');
require('dotenv').config();
const db = require('../db');
/* POST webex page. */
router.post('/', async function(req, res, next) {
    try {
      
        // Verify this is a meetingTranscripts created event
        if (req.body.resource !== 'meetingTranscripts') {
            return res.status(200).send('Event type not supported');
        }

        const webhook_id = req.body.id;

        // Get the webhook from the database
        const webhook = await db.get('SELECT * FROM webex_webhooks WHERE webhook_id = ?', [webhook_id]);

        if (!webhook) {
            return res.status(200).send('Webhook not found');
        }

        // Get the user from the database
        const user = await db.get('SELECT * FROM users WHERE id = ?', [webhook.user_id]);

        if (!user) {
            return res.status(200).send('User not found');
        }

        // Check and update Jira access token if expired
        const jiraTokenExpiry = new Date(user.jira_token_expiry);
        if (jiraTokenExpiry < new Date()) {
            const newJiraTokens = await refreshJiraToken(user.id);
            await db.run('UPDATE users SET jira_access_token = ?, jira_token_expiry = ? WHERE id = ?', [newJiraTokens.access_token, new Date(newJiraTokens.expires_in * 1000), user.id]);
        }

        // Check and update Webex access token if expired
        const webexTokenExpiry = new Date(user.webex_token_expiry);
        if (webexTokenExpiry < new Date()) {
            const newWebexTokens = await refreshWebexToken(user.id);
            await db.run('UPDATE users SET webex_access_token = ?, webex_token_expiry = ? WHERE id = ?', [newWebexTokens.access_token, new Date(newWebexTokens.expires_in * 1000), user.id]);
        }

        // Get the transcript from Webex API
        const transcript = await fetchTranscript(req.body.data.id, user.webex_access_token);
        const meetingId = req.body.data.meetingId;

       // Get the Jira cloud id from Jira access token
       const jiraCloudId = await getJiraCloudId(user.jira_access_token);

       if (!jiraCloudId) {
        return res.status(200).send('Jira cloud id not found');
       } 

       const JiraHost = `https://api.atlassian.com/ex/jira/${jiraCloudId}`

        // Process the transcript and get ticket recommendations
        const { result, recommendations } = await transcriptProcessor.processTranscript(transcript, meetingId, {
            host: JiraHost,
            accessToken: user.jira_access_token,
            email: user.email
        });

        res.status(200).send('Transcript processed successfully');
    } catch (error) {
        console.log('Error processing webhook:', error);
        res.status(500).send('Error processing webhook');
    }
});

async function getJiraCloudId(accessToken) {
    const response = await axios.get('https://api.atlassian.com/oauth/token/accessible-resources', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return response.data[0].cloudId;
}

async function fetchTranscript(transcriptId, accessToken) {
    try {
        const response = await axios.get(`https://webexapis.com/v1/meetingTranscripts/${transcriptId}/download`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching transcript:', error);
        throw error;
    }
}

async function storeRecommendations(meetingId, recommendations) {
    // TODO: Implement storing recommendations in database
    // This would allow the extension to fetch them later
    console.log('Storing recommendations for meeting:', meetingId);
}

module.exports = router;
