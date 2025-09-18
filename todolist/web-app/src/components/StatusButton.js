export default function StatusButton({ variant, active, onClick, children }) {
  const base =
    "inline-flex h-9 w-full items-center justify-center rounded-lg border text-xs transition-colors duration-150";

  const styles = {
    todo: {
      normal:
        "border-blue-500/70 bg-blue-900/60 text-blue-100 hover:bg-blue-800/70 hover:border-blue-400",
      active:
        "border-blue-300 bg-blue-600 text-white cursor-not-allowed shadow-inner",
    },
    in_progress: {
      normal:
        "border-yellow-500/70 bg-yellow-900/60 text-yellow-100 hover:bg-yellow-800/70 hover:border-yellow-400",
      active:
        "border-yellow-300 bg-yellow-500 text-black cursor-not-allowed shadow-inner",
    },
    done: {
      normal:
        "border-red-500/70 bg-red-900/60 text-red-100 hover:bg-red-800/70 hover:border-red-400",
      active:
        "border-red-300 bg-red-600 text-white cursor-not-allowed shadow-inner",
    },
  }[variant];

  return (
    <button
      type="button"
      disabled={active}
      aria-pressed={active}
      onClick={active ? undefined : onClick}
      className={`${base} ${active ? styles.active : styles.normal}`}
    >
      {children}
    </button>
  );
}