import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import LoadingScreen from '../../components/LoadingScreen';
import type { UserRole } from '../../features/auth/contexts/AuthContextDefinition';

interface RoleRouteProps {
  allowedRole: UserRole;
}

export function RoleRoute({ allowedRole }: RoleRouteProps) {
  const { user, role, isLoading } = useAuth();

  if (isLoading || role === undefined) return <LoadingScreen />;
  
  if (!user) return <Navigate to="/login" replace />;
  
  // Se o papel do usuário não for o permitido, manda para não autorizado
  if (role !== allowedRole) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
}