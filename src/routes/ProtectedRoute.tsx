// src/routes/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import LoadingScreen from '../components/LoadingScreen';
// Corrigido: Uso de 'import type' para o tipo UserRole
import type { UserRole } from '../features/auth/contexts/AuthContextDefinition';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, role, isLoading } = useAuth();

  // 1. Enquanto carrega a sessão do Firebase ou o Role do Firestore
  if (isLoading) return <LoadingScreen />;

  // 2. Se não houver usuário autenticado
  if (!user) return <Navigate to="/login" replace />;

  // 3. Se houver restrição de Role e o usuário não a possuir
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Se tudo estiver OK, renderiza as rotas filhas
  return <Outlet />;
}