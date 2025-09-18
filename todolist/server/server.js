const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// เชื่อมต่อกับฐานข้อมูล MySQL
const db = mysql.createConnection({
  host: "db", // ชื่อ service ของ MySQL ใน docker-compose.yml
  user: "root",
  password: "rootpassword",
  database: "todos",
});

// เชื่อมต่อฐานข้อมูล
db.connect((err) => {
  if (err) throw err;
  console.log("Connected to database");
  // สร้างตาราง todo ถ้ายังไม่มี
  db.query(
    `CREATE TABLE IF NOT EXISTS todo (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      assignee VARCHAR(255),
      due_date DATE,
      status ENUM('todo', 'in_progress', 'done') DEFAULT 'todo'
    );`,
    (err, result) => {
      if (err) throw err;
    }
  );
});

// 1. GET /api/tasks: ดึงข้อมูล Task ทั้งหมด
app.get("/api/tasks", (req, res) => {
  const { status, assignee, q } = req.query;

  let query = "SELECT * FROM todo WHERE 1=1";
  const params = [];

  if (status && status !== "all") {
    query += " AND status = ?";
    params.push(status);
  }

  if (assignee && assignee !== "all") {
    query += " AND assignee = ?";
    params.push(assignee);
  }

  if (q) {
    query += " AND title LIKE ?";
    params.push(`%${q}%`);
  }

  db.query(query, params, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// 2. POST /api/tasks: เพิ่ม Task ใหม่
app.post("/api/tasks", (req, res) => {
  const { title, description, assignee, due_date } = req.body;

  if (!title) {
    return res.status(400).send("Title is required");
  }

  const sql = "INSERT INTO todo (title, description, assignee, due_date) VALUES (?, ?, ?, ?)";
  const values = [title, description, assignee, due_date];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).send(err);
    res.status(201).json({ id: result.insertId, title, description, assignee, due_date });
  });
});

// 3. PUT /api/tasks/:id: แก้ไข Task
app.put("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const { title, description, assignee, due_date, status } = req.body;

  if (!title) {
    return res.status(400).send("Title is required");
  }

  const sql =
    "UPDATE todo SET title = ?, description = ?, assignee = ?, due_date = ?, status = ? WHERE id = ?";
  const values = [title, description, assignee, due_date, status, id];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.affectedRows === 0) {
      return res.status(404).send("Task not found");
    }
    res.status(200).json({ id, title, description, assignee, due_date, status });
  });
});

// 4. DELETE /api/tasks/:id: ลบ Task
app.delete("/api/tasks/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM todo WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.affectedRows === 0) {
      return res.status(404).send("Task not found");
    }
    res.status(200).send(`Task with id ${id} deleted`);
  });
});

// เริ่มต้นเซิร์ฟเวอร์
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});