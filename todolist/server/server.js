// server.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise'); // ใช้ promise API

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// ใช้ ENV หรือค่า default
const DB_HOST = process.env.DB_HOST || 'db';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'rootpassword';
const DB_NAME = process.env.DB_NAME || 'todos';

// ฟังก์ชันช่วยหน่วงเวลา
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let pool;

// พยายามเชื่อมต่อซ้ำๆ จนได้
async function initDbWithRetry() {
  const maxAttempts = 20;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // สร้าง connection ชั่วคราวเพื่อ init
      const conn = await mysql.createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
      });

      // สร้าง DB ถ้ายังไม่มี (จริงๆ docker-compose ก็สร้างให้แล้ว แต่ทำไว้ให้ชัวร์)
      await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
      await conn.end();

      // สร้าง pool ใช้จริง
      pool = mysql.createPool({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

      // สร้างตารางถ้ายังไม่มี
      await pool.query(`
        CREATE TABLE IF NOT EXISTS todo (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL
        );
      `);

      console.log('Connected to database & ensured schema');
      return;
    } catch (err) {
      console.log(
        `DB not ready yet (attempt ${attempt}/${maxAttempts}): ${err.code || err.message}`
      );
      await sleep(1500);
    }
  }
  console.error('❌ Could not connect to MySQL after multiple attempts. Exiting.');
  process.exit(1);
}

// Routes ใช้ pool ที่เตรียมไว้
app.get('/api/todos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM todo');
    res.json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post('/api/todos', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).send('Title is required');
    const [result] = await pool.query('INSERT INTO todo (title) VALUES (?)', [title]);
    res.status(201).json({ id: result.insertId, title });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM todo WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).send('Todo not found');
    res.status(200).send(`Todo with id ${id} deleted`);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    if (!title) return res.status(400).send('Title is required');
    const [result] = await pool.query('UPDATE todo SET title = ? WHERE id = ?', [title, id]);
    if (result.affectedRows === 0) return res.status(404).send('Todo not found');
    res.status(200).json({ id, title });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// เริ่มแอปหลัง init DB เสร็จ
initDbWithRetry().then(() => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
});