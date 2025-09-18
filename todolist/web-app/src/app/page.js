"use client";
import { useEffect, useState, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// นำเข้า Components ที่แยกไว้
import TaskCard from "../components/TaskCard";
import StatusGroup from "../components/StatusGroup";

// ส่วนของ Label สถานะ
const statusLabel = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export default function Page() {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ status: "all", assignee: "all", q: "" });
  const [view, setView] = useState("board");
  const [form, setForm] = useState({ title: "", description: "", assignee: "", due_date: "" });

  // ฟังก์ชันดึงข้อมูลจาก API
  const load = async () => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v && v !== "all"))
    ).toString();

    const url = `/api/tasks${qs ? `?${qs}` : ""}`;
    const r = await fetch(url, { cache: "no-store" });

    const txt = await r.text();
    if (!r.ok) {
      console.error("GET /api/tasks failed:", r.status, txt);
      setItems([]);
      return;
    }
    try {
      const j = txt ? JSON.parse(txt) : [];
      setItems(Array.isArray(j) ? j : []);
    } catch (e) {
      console.error("Invalid JSON from /api/tasks:", txt);
      setItems([]);
    }
  };

  useEffect(() => { load(); }, [filters]);

  const createTask = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ title: "", description: "", assignee: "", due_date: "" });
    await load();
  };

  const updateTask = async (id, payload) => {
    await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    await load();
  };

  const move = async (id, status) => {
    await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  };

  const remove = async (id) => {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    await load();
  };

  const assignees = useMemo(() => {
    const s = new Set(items.map((i) => i.assignee).filter(Boolean));
    return Array.from(s);
  }, [items]);

  const group = (status) => items.filter((i) => i.status === status);
  const counts = {
    todo: group("todo").length,
    in_progress: group("in_progress").length,
    done: group("done").length,
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result || {};
    if (!destination) return;
    if (destination.droppableId !== source.droppableId) {
      move(Number(draggableId), destination.droppableId);
    }
  };

  return (
    <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 p-4 sm:p-6 shadow-2xl">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold truncate">Todo List App</h1>
          <p className="text-slate-300 text-sm sm:text-base">Simplifies tasks for individuals and teams</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2"
        >
          <option value="all">All statuses</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <select
          value={filters.assignee}
          onChange={(e) => setFilters((f) => ({ ...f, assignee: e.target.value }))}
          className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2"
        >
          <option value="all">All assignees</option>
          {assignees.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <input
          value={filters.q}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
          placeholder="Find…"
          className="w-52 rounded-xl border border-slate-600 bg-slate-900 px-3 py-2"
        />

        <button
          onClick={() => setFilters({ status: "all", assignee: "all", q: "" })}
          className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2"
        >
          Clear
        </button>

        <div className="ml-auto flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-900 p-1">
          <button
            onClick={() => setView("board")}
            className={`rounded-lg px-3 py-1 ${view === "board" ? "bg-slate-700" : ""}`}
          >
            Board
          </button>
          <button
            onClick={() => setView("list")}
            className={`rounded-lg px-3 py-1 ${view === "list" ? "bg-slate-700" : ""}`}
          >
            List
          </button>
        </div>
      </div>

      <form id="new" onSubmit={createTask} className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <input
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Title"
            className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2"
          />
          <input
            value={form.assignee}
            onChange={(e) => setForm((f) => ({ ...f, assignee: e.target.value }))}
            placeholder="Assignee"
            className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2"
          />
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr,180px,auto]">
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Description"
            className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2"
          />
          <input
            type="date"
            value={form.due_date}
            onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
            className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2"
          />
          <button className="rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-500">
            Add Task
          </button>
        </div>
      </form>

      {view === "board" ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {["todo", "in_progress", "done"].map((col) => (
              <Droppable droppableId={col} key={col}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="font-semibold">{statusLabel[col]}</div>
                      <div className="rounded-full border border-slate-600 bg-slate-800/60 px-2 py-0.5 text-xs">
                        {counts[col]}
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      {group(col).map((t, idx) => (
                        <Draggable draggableId={String(t.id)} index={idx} key={t.id}>
                          {(p) => (
                            <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps}>
                              <TaskCard t={t} onMove={move} onDelete={remove} onUpdate={updateTask} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      ) : (
        <ul className="grid gap-3">
          {items.map((t) => (
            <li key={t.id}>
              <TaskCard t={t} onMove={move} onDelete={remove} onUpdate={updateTask} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}