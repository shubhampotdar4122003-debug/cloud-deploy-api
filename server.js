const express = require('express');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'inventory_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10
});

// Health check endpoint used by deployment probes
app.get('/healthz', (req, res) => {
  db.query('SELECT 1', (err) => {
    if (err) return res.status(500).json({ status: 'unhealthy', error: err.message });
    res.status(200).json({ status: 'healthy', database: 'connected' });
  });
});

// GET all products
app.get('/api/products', (req, res) => {
  db.query('SELECT * FROM products', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST new product
app.post('/api/products', (req, res) => {
  const { name, quantity, price } = req.body;
  db.query(
    'INSERT INTO products (name, quantity, price) VALUES (?, ?, ?)',
    [name, quantity, price],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: result.insertId, name, quantity, price });
    }
  );
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Application running on port ${PORT}`));