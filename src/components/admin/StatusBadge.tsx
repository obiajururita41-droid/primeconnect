interface StatusBadgeProps {
  status: string;
}

const STYLES: Record<string, string> = {
  success: 'bg-green-100 text-green-700',
  active: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
  inactive: 'bg-red-100 text-red-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const style = STYLES[status] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${style}`}>
      {status}
    </span>
  );
}
