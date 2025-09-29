import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';

type Props = { children: React.ReactElement };

export default function ProtectedRoute({ children }: Props) {
  const { isAuthed, isLoading } = useAuth();
  if (isLoading) return <div className="p-6">Loading…</div>;
  if (!isAuthed) return <Navigate to="/login" replace />;
  return children;
}


