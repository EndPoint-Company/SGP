import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RegisterFormData } from '../types';

export function useRegisterForm() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Corrigido: Adicionado underscore (_) ao 'data' para indicar variável 
   * intencionalmente não utilizada no momento (placeholder para integração).
   * Isso resolve o erro 'no-unused-vars' do ESLint.
   */
  const handleRegister = async (_data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      // Aqui integraria com o seu serviço de registo (Firebase + Backend)
      // await authService.register(_data); 
      navigate('/login');
    } catch (err) { 
      /**
       * Corrigido: Removido ': any' para evitar o erro de 'explicit-any'.
       * Tratamos o erro de forma segura verificando se é uma instância de Error.
       */
      const errorMessage = err instanceof Error ? err.message : "Erro ao criar conta.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { handleRegister, error, isLoading };
}