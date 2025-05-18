const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Submit feedback
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { rating, feedback_text, integration_suggestion } = req.body;
    const userId = req.user.id;

    if (!rating) {
      return res.status(400).json({ error: 'Rating is required' });
    }

    const result = await db.query(
      `INSERT INTO feedback (user_id, rating, feedback_text, integration_suggestion)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, rating, feedback_text, integration_suggestion]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Get user's feedback history
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      'SELECT * FROM feedback WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

module.exports = router; 