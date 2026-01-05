import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import type { LoginFormInputs } from '../types';

export function useLoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (data: LoginFormInputs) => {
    setError(null);
    try {
      await login(data.email, data.password);
      navigate('/after-login'); 
    } catch { 
      setError("Email ou senha inválidos.");
    }
  };

  return { handleLogin, error };
}