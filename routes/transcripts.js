var express = require('express');
var router = express.Router();
const db = require('../db');

/* GET transcript details. */
router.get('/:id', function(req, res, next) {
    db.get(
        `SELECT * FROM transcript_snippets WHERE id = ?`,
        [req.params.id],
        (err, row) => {
            if (err) {
                console.error('Error fetching transcript:', err);
                return res.status(500).json({ error: 'Error fetching transcript' });
            }
            
            if (!row) {
                return res.status(404).json({ error: 'Transcript not found' });
            }

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
        }
    );
});

module.exports = router; 