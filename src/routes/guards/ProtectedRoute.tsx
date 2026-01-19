import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import LoadingScreen from '../../components/LoadingScreen';

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  
  // Se não houver usuário, manda para o login
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}