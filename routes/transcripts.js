var express = require('express');
var router = express.Router();
const db = require('../db');

/* GET transcript details. */
router.get('/:id', async function(req, res, next) {
    try {
        const result = await db.query(
            'SELECT * FROM transcript_snippets WHERE id = $1',
            [req.params.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Transcript not found' });
        }

        const row = result.rows[0];
        res.json({
            id: row.id,
            webex_meeting_id: row.webex_meeting_id,
            jira_ticket_id: row.jira_ticket_id,
            original_transcript: row.original_transcript,
            summary: row.summary,
            one_liner: row.one_liner,
            resource_links: JSON.parse(row.resource_links),
            created_at: row.created_at
        });
    } catch (error) {
        console.error('Error fetching transcript:', error);
        res.status(500).json({ error: 'Error fetching transcript' });
    }
});

module.exports = router; 