import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import type { LoginFormInputs } from '../types';

export function useLoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Adicionado

  const handleLogin = async (data: LoginFormInputs) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await login(data.email, data.password);
      navigate('/psychologist/home'); // Ajuste conforme a lógica de destino
    } catch {
      setError("Email ou senha inválidos.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Agora retorna isSubmitting para satisfazer o ts(2339)
  return { handleLogin, error, isSubmitting };
}