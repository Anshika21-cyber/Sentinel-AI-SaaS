import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/hooks/useAuth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageSkeleton />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

export default ProtectedRoute;
