import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ to = '/dashboard' }: { to?: string }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="flex items-center gap-2 text-gray-600 font-medium py-2 px-4 mb-4"
    >
      <ArrowLeft size={20} />
      Back
    </button>
  );
}
