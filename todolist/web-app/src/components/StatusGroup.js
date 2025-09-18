export default function StatusGroup({ value, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <StatusButton
        variant="todo"
        active={value === "todo"}
        onClick={() => onChange("todo")}
      >
        To Do
      </StatusButton>
      <StatusButton
        variant="in_progress"
        active={value === "in_progress"}
        onClick={() => onChange("in_progress")}
      >
        In Progress
      </StatusButton>
      <StatusButton
        variant="done"
        active={value === "done"}
        onClick={() => onChange("done")}
      >
        Done
      </StatusButton>
    </div>
  );
}