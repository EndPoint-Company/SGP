import React, { createContext, useContext, useState, useCallback } from "react";
import { userService, Aluno, Psicologo } from "../services/userService";

interface UserDataContextType {
  alunos: Aluno[];
  psicologos: Psicologo[];
  isLoading: boolean;
  fetchAlunos: () => Promise<void>;
  fetchPsicologos: () => Promise<void>;
  findAlunoById: (id: string) => Aluno;
  findPsicologoById: (id: string) => Psicologo;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [psicologos, setPsicologos] = useState<Psicologo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Busca a lista de alunos apenas se ainda não estiver no estado (Cache).
   * Melhora o RNF002 (Baixa Latência) ao evitar carregamentos desnecessários.
   */
  const fetchAlunos = useCallback(async () => {
    if (alunos.length > 0) return;
    setIsLoading(true);
    try {
      // Nota: Certifique-se de que getAlunos() está implementado no userService
      const response = await userService.getAlunos(); 
      setAlunos(response);
    } catch (error) {
      console.error("Falha ao carregar alunos:", error);
    } finally {
      setIsLoading(false);
    }
  }, [alunos.length]);

  /**
   * Busca a lista de psicólogos apenas sob demanda.
   */
  const fetchPsicologos = useCallback(async () => {
    if (psicologos.length > 0) return;
    setIsLoading(true);
    try {
      const response = await userService.getPsicologos();
      setPsicologos(response);
    } catch (error) {
      console.error("Falha ao carregar psicólogos:", error);
    } finally {
      setIsLoading(false);
    }
  }, [psicologos.length]);

  /**
   * Procura um aluno no estado atual ou retorna um objeto fallback.
   * Garante a estabilidade da UI caso o dado ainda esteja a carregar.
   */
  const findAlunoById = useCallback((id: string): Aluno => {
    const aluno = alunos.find((a) => a.id === id);
    return aluno || { id, nome: "Aluno Desconhecido", avatarUrl: "" };
  }, [alunos]);

  /**
   * Procura um psicólogo no estado atual ou retorna um objeto fallback.
   */
  const findPsicologoById = useCallback((id: string): Psicologo => {
    const psicologo = psicologos.find((p) => p.id === id);
    return psicologo || { id, nome: "Psicólogo Desconhecido", avatarUrl: "" };
  }, [psicologos]);

  const value = {
    alunos,
    psicologos,
    isLoading,
    fetchAlunos,
    fetchPsicologos,
    findAlunoById,
    findPsicologoById,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};

/**
 * Hook customizado para acesso simplificado aos dados de utilizadores.
 */
export const useUserData = (): UserDataContextType => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
};