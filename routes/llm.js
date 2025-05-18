const express = require('express');
const { OpenAI } = require('openai');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/process', authenticateToken, async (req, res) => {
  try {
    const { prompt, systemPrompt } = req.body;

    // Validate request body
    if (!prompt || !systemPrompt) {
      return res.status(400).json({
        error: 'Invalid request format',
        details: 'Both prompt and systemPrompt are required',
      });
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    // Return the response
    res.json({
      response: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error('Error processing LLM request:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

module.exports = router; 