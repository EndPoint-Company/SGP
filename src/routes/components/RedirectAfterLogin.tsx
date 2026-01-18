import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import LoadingScreen from '../../components/LoadingScreen';

export function RedirectAfterLogin() {
  const { user, role, isLoading } = useAuth();

  if (isLoading || role === undefined) return <LoadingScreen />;
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (role === "student") return <Navigate to="/student/home" replace />;
  if (role === "psychologist") return <Navigate to="/psychologist/home" replace />;
  
  return <Navigate to="/unauthorized" replace />;
}