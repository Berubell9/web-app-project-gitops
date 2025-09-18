import StatusButton from './StatusButton'; 

function StatusGroup({ value, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <StatusButton
        variant="todo"
        active={value === "todo"}
        onClick={() => onChange("todo")}
      >
        {statusLabel.todo}
      </StatusButton>
      <StatusButton
        variant="in_progress"
        active={value === "in_progress"}
        onClick={() => onChange("in_progress")}
      >
        {statusLabel.in_progress}
      </StatusButton>
      <StatusButton
        variant="done"
        active={value === "done"}
        onClick={() => onChange("done")}
      >
        {statusLabel.done}
      </StatusButton>
    </div>
  );
}

export default StatusGroup;