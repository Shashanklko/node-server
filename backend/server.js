
const express = require('express');
const mysql = require('mysql2/promise');

const app = express();

app.use(express.json());

// Connect to MySQL
const db = mysql.createPool({
    host: 'database',
    user: 'root',
    password: 'root123',
    database: 'testdb'
});

// Create table
async function startServer() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            message VARCHAR(255) NOT NULL
        )
    `);

    app.listen(3000, () => {
        console.log('Backend running on port 3000');
    });
}

// Save message
app.post('/api/messages', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                error: 'Message cannot be empty'
            });
        }

        await db.query(
            'INSERT INTO messages (message) VALUES (?)',
            [message.trim()]
        );

        res.json({ message: 'Message saved successfully!' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch messages
app.get('/api/messages', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM messages ORDER BY id DESC'
        );

        res.json(rows);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

startServer().catch(error => {
    console.error('Database initialization failed:', error);
    process.exit(1);
});
