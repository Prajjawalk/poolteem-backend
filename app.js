const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Enable CORS
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Import routes
const webexRouter = require('./routes/webex');
const transcriptsRouter = require('./routes/transcripts');
const usersRouter = require('./routes/users');
const llmRouter = require('./routes/llm');
const feedbackRouter = require('./routes/feedback');
// Use routes
app.use('/users', usersRouter);
app.use('/webex', webexRouter);
app.use('/transcripts', transcriptsRouter);
app.use('/llm', llmRouter);
app.use('/feedback', feedbackRouter);

// Error handler
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Clean up on server shutdown
process.on('SIGINT', () => {
    extensionMessenger.stop();
    process.exit();
});

module.exports = app;

// Start the server if this file is run directly
if (require.main === module) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}
