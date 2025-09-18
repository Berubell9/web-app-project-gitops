import { useState } from 'react';
import { PencilIcon, TrashIcon, CheckIcon, XIcon } from './Icons';
import IconButton from './IconButton';
import StatusGroup from './StatusGroup';

export default function TaskCard({ t, onMove, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [etitle, setETitle] = useState(t.title);
  const [edesc, setEDesc] = useState(t.description || "");

  const startEdit = () => {
    setETitle(t.title);
    setEDesc(t.description || "");
    setEditing(true);
  };
  const cancelEdit = () => {
    setEditing(false);
    setETitle(t.title);
    setEDesc(t.description || "");
  };
  const saveEdit = async () => {
    const title = (etitle || "").trim();
    if (!title) return;
    await onUpdate?.(t.id, { title, description: edesc });
    setEditing(false);
  };
  const onKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) saveEdit();
    else if (e.key === "Escape") cancelEdit();
  };

  return (
    <div className="relative rounded-2xl border border-slate-700/60 bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="absolute right-2 top-2 flex gap-1 opacity-80 hover:opacity-100">
        {editing ? (
          <>
            <IconButton title="Save" onClick={saveEdit}><CheckIcon /></IconButton>
            <IconButton title="Cancel" onClick={cancelEdit}><XIcon /></IconButton>
          </>
        ) : (
          <>
            <IconButton title="Edit" onClick={startEdit}><PencilIcon /></IconButton>
            <IconButton title="Delete" onClick={() => onDelete(t.id)}><TrashIcon /></IconButton>
          </>
        )}
      </div>

      {!editing ? (
        <>
          <div className="font-medium">{t.title}</div>
          {t.description && <div className="mt-1 text-sm text-slate-300/80">{t.description}</div>}
          <div className="mt-2 flex flex-wrap gap-2">
            <div className="bg-slate-800/70 border-slate-600 text-slate-100">👤 {t.assignee || "ไม่ระบุ"}</div>
            {t.due_date && (
              <div className="bg-slate-800/70 border-slate-600 text-slate-100">📅 {t.due_date}</div>
            )}
          </div>
          <div className="mt-3">
            <StatusGroup value={t.status} onChange={(s) => onMove(t.id, s)} />
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <input
            value={etitle}
            onChange={(e) => setETitle(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Title"
            className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2"
            autoFocus
          />
          <textarea
            rows={3}
            value={edesc}
            onChange={(e) => setEDesc(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Description"
            className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2"
          />
        </div>
      )}
    </div>
  );
}