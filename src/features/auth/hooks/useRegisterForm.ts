import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RegisterFormData } from '../types';

export function useRegisterForm() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * handleRegister agora ignora explicitamente o aviso de variável não utilizada
   * apenas para este parâmetro específico, até que a integração com o serviço seja reativada.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleRegister = async (_data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulação de delay de rede para testar o estado de isLoading na UI
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // O redirecionamento ocorre após o "sucesso" da operação placeholder
      navigate('/login');
    } catch (err) { 
      const errorMessage = err instanceof Error ? err.message : "Erro ao criar conta.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { handleRegister, error, isLoading };
}