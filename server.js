const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jwt-simple');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Optimized MySQL Connection Pool for Vercel + Aiven
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS, // <-- YAHAN SE HARDCODED PASSWORD HATA DEIN
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 23405,
  ssl: { rejectUnauthorized: false },
  connectTimeout: 30000,
  waitForConnections: true,
  connectionLimit: 1,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Registration Endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)',
      [full_name, email, hashedPassword]
    );

    const token = jwt.encode({ userId: result.insertId }, process.env.JWT_SECRET || 'secret');

    res.json({ success: true, token, userId: result.insertId });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Login Endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.encode({ userId: user.user_id }, process.env.JWT_SECRET || 'secret');

    res.json({ success: true, token, userId: user.user_id });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});