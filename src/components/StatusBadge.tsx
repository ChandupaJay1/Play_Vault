interface StatusBadgeProps {
  status: string;
}

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
  payment_submitted: "bg-blue-600/20 text-blue-400 border-blue-600/30",
  verified: "bg-orange-600/20 text-orange-400 border-orange-600/30",
  approved: "bg-green-600/20 text-green-400 border-green-600/30",
  rejected: "bg-red-600/20 text-red-400 border-red-600/30",
  completed: "bg-emerald-600/20 text-emerald-400 border-emerald-600/30",
  available: "bg-green-600/20 text-green-400 border-green-600/30",
  assigned: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
  used: "bg-slate-600/20 text-slate-400 border-slate-600/30",
};

const fallbackStyle = "bg-slate-600/20 text-slate-400 border-slate-600/30";

export default function StatusBadge({ status }: StatusBadgeProps) {
  const style = statusStyles[status] ?? fallbackStyle;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${style}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
