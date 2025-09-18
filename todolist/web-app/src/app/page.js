"use client";

import { useState, useEffect, useMemo } from "react";
import TaskCard from "../components/TaskCard";
import StatusGroup from "../components/StatusGroup";

export default function Page() {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({ status: "all", assignee: "all", q: "" });

  // ดึงข้อมูลจาก API
  useEffect(() => {
    async function load() {
      const queryString = new URLSearchParams(filters).toString();
      const response = await fetch(`/api/tasks?${queryString}`);
      const data = await response.json();
      setTasks(data);
    }

    load();
  }, [filters]);

  // ฟังก์ชันจัดการกรอง status, assignee, q
  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  // ดึง Assignees ที่ไม่ซ้ำ
  const assignees = useMemo(() => {
    const uniqueAssignees = new Set(tasks.map((task) => task.assignee).filter(Boolean));
    return Array.from(uniqueAssignees);
  }, [tasks]);

  return (
    <main className="task-page">
      <div className="filters">
        {/* กรองตามสถานะ */}
        <StatusGroup
          value={filters.status}
          onChange={(status) => handleFilterChange("status", status)}
        />
        
        {/* กรองตาม assignee */}
        <select
          value={filters.assignee}
          onChange={(e) => handleFilterChange("assignee", e.target.value)}
          className="filter-select"
        >
          <option value="all">All Assignees</option>
          {assignees.map((assignee) => (
            <option key={assignee} value={assignee}>
              {assignee}
            </option>
          ))}
        </select>

        {/* ค้นหาตามชื่อ Task */}
        <input
          type="text"
          value={filters.q}
          onChange={(e) => handleFilterChange("q", e.target.value)}
          placeholder="Search by title..."
          className="filter-input"
        />
      </div>

      <div className="task-list">
        {/* แสดง Tasks */}
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard key={task.id} t={task} />
          ))
        ) : (
          <div>No tasks found</div>
        )}
      </div>
    </main>
  );
}