const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// ตั้งค่าการเชื่อมต่อฐานข้อมูล MySQL
const db = mysql.createConnection({
  host: 'db', // ชื่อ service ของ MySQL ใน docker-compose.yml
  user: 'root',
  password: 'rootpassword',
  database: 'todos'
});

// เชื่อมต่อฐานข้อมูล
db.connect(err => {
  if (err) throw err;
  console.log('Connected to database');
  db.query(`CREATE DATABASE IF NOT EXISTS todos;`, (err, result) => {
    if (err) throw err;
    db.query(`CREATE TABLE IF NOT EXISTS todo (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL);`, (err, result) => {
      if (err) throw err;
    });
  });
});

// 1. GET /api/todos: ดึงข้อมูล Todo ทั้งหมด
app.get('/api/todos', (req, res) => {
  db.query('SELECT * FROM todo', (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// 2. POST /api/todos: เพิ่ม Todo ใหม่
app.post('/api/todos', (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).send("Title is required");
  }

  db.query('INSERT INTO todo (title) VALUES (?)', [title], (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(201).json({ id: result.insertId, title });
  });
});

// 3. DELETE /api/todos/:id: ลบ Todo โดยการส่ง id
app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM todo WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.affectedRows === 0) {
      return res.status(404).send("Todo not found");
    }
    res.status(200).send(`Todo with id ${id} deleted`);
  });
});

// 4. PUT /api/todos/:id: แก้ไข Todo โดยการส่ง id และข้อมูลที่ต้องการแก้ไข
app.put('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  if (!title) {
    return res.status(400).send("Title is required");
  }

  db.query('UPDATE todo SET title = ? WHERE id = ?', [title, id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.affectedRows === 0) {
      return res.status(404).send("Todo not found");
    }
    res.status(200).json({ id, title });
  });
});

// เริ่มต้นเซิร์ฟเวอร์
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});