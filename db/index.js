const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

// Get database connection URL from environment variable
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize schema
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

// Connect and initialize schema
pool.connect()
    .then(client => {
        console.log('Connected to PostgreSQL database');
        return client.query(schema)
            .then(() => {
                console.log('Schema initialized successfully');
                client.release();
            })
            .catch(err => {
                console.error('Error initializing schema:', err);
                client.release();
            });
    })
    .catch(err => {
        console.error('Error connecting to database:', err);
    });

module.exports = pool; 