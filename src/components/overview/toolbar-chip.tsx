function ToolbarChip({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 backdrop-blur transition ${
        active
          ? "bg-white/20 text-white"
          : "bg-white/10 text-white/80"
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </span>
  );
}
