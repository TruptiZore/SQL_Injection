const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// In-memory array to store login/attack activity for the dashboard
let systemLogs = [];

function addLog(type, message) {
    const timestamp = new Date().toLocaleTimeString();
    systemLogs.unshift({ id: Date.now(), timestamp, type, message });
    // Keep only last 50 logs to prevent memory leak
    if (systemLogs.length > 50) systemLogs.pop();
}

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // Change if your MySQL user is different
    password: 'trupti',      // Add your MySQL password here if you have one
    database: 'security_IDS'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        addLog('error', 'Database connection failed');
    } else {
        console.log('Connected to MySQL database "security_IDS"');
        addLog('info', 'System initialized. Database connected.');
    }
});

// Ignore favicon
app.get('/favicon.ico', (req, res) => res.status(204).end());

// -----------------------------------------------------------------------------
// VULNERABLE LOGIN ROUTE (SQL INJECTION DEMO)
// -----------------------------------------------------------------------------
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Check if input looks like an injection attempt for logging purposes
    const isAttack = username.includes("'") || username.includes("--") || username.includes("#");

    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    console.log('\n[VULNERABLE QUERY EXECUTED]:', query);

    db.query(query, (err, results) => {
        if (err) {
            addLog('error', `Database Error during vulnerable query: ${err.message}`);
            return res.status(200).json({ success: false, message: `SQL Error: ${err.message}` });
        }

        if (results.length > 0) {
            if (isAttack) {
                addLog('attack', `CRITICAL: SQL Injection Bypass Successful! Payload: ${username}`);
            } else {
                addLog('success', `User '${username}' logged in successfully via vulnerable route.`);
            }
            res.json({ success: true, message: 'Authentication Successful', user: results[0] });
        } else {
            addLog('info', `Failed login attempt for username: ${username}`);
            res.status(200).json({ success: false, message: 'Authentication Failed' });
        }
    });
});

// -----------------------------------------------------------------------------
// SECURE LOGIN ROUTE (PREVENTING SQL INJECTION)
// -----------------------------------------------------------------------------
app.post('/secure-login', (req, res) => {
    const { username, password } = req.body;

    const isAttack = username.includes("'") || username.includes("--") || username.includes("#");

    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    console.log('\n[SECURE QUERY EXECUTED]:', query, [username, password]);

    db.query(query, [username, password], (err, results) => {
        if (err) {
            addLog('error', `Database Error during secure query: ${err.message}`);
            return res.status(200).json({ success: false, message: `SQL Error: ${err.message}` });
        }

        if (results.length > 0) {
            addLog('success', `User '${username}' logged in securely.`);
            res.json({ success: true, message: 'Authentication Successful', user: results[0] });
        } else {
            if (isAttack) {
                addLog('blocked', `SECURED: Blocked SQL Injection attempt. Payload: ${username}`);
            } else {
                addLog('info', `Failed secure login attempt for username: ${username}`);
            }
            res.status(200).json({ success: false, message: 'Authentication Failed' });
        }
    });
});

// -----------------------------------------------------------------------------
// DASHBOARD LOGS ROUTE
// -----------------------------------------------------------------------------
app.get('/api/logs', (req, res) => {
    // Calculate stats
    const totalLogins = systemLogs.filter(log => log.type === 'success').length;
    const attacksBypassed = systemLogs.filter(log => log.type === 'attack').length;
    const attacksBlocked = systemLogs.filter(log => log.type === 'blocked').length;

    res.json({
        stats: { totalLogins, attacksBypassed, attacksBlocked },
        logs: systemLogs
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
