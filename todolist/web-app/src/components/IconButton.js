export default function IconButton({ title, onClick, children }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="rounded-md border border-slate-600/70 bg-slate-800/60 p-1.5 text-slate-200 hover:bg-slate-700/60"
    >
      {children}
    </button>
  );
}