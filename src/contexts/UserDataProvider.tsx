import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
// Importamos os tipos e funções do serviço, eliminando duplicação
import { userService, type Aluno, type Psicologo } from "../services/userService";

interface UserDataContextType {
  alunos: Aluno[];
  psicologos: Psicologo[];
  isLoading: boolean;
  findAlunoById: (id: string) => Aluno;
  findPsicologoById: (id: string) => Psicologo;
  refreshData: () => Promise<void>; // Adicionamos capacidade de recarregar manualmente
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [psicologos, setPsicologos] = useState<Psicologo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    // setIsLoading(true); // Opcional: dependerá da UX desejada ao recarregar
    try {
      // O Provider delega a infraestrutura para o Service
      const [alunosData, psicologosData] = await Promise.all([
        userService.getAlunos(),
        userService.getPsicologos(),
      ]);
      setAlunos(alunosData);
      setPsicologos(psicologosData);
    } catch (error) {
      console.error("Falha crítica ao carregar dados no Provider:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const findAlunoById = (id: string): Aluno => {
    const aluno = alunos.find((a) => a.id === id);
    return aluno || { id, nome: "Aluno Desconhecido", avatarUrl: "" };
  };

  const findPsicologoById = (id: string): Psicologo => {
    const psicologo = psicologos.find((p) => p.id === id);
    return psicologo || { id, nome: "Psicólogo Desconhecido", avatarUrl: "" };
  };

  const value = {
    alunos,
    psicologos,
    isLoading,
    findAlunoById,
    findPsicologoById,
    refreshData: fetchData,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUserData = (): UserDataContextType => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
};
// Re-exportamos tipos para facilitar imports nos componentes
export type { Aluno, Psicologo };