import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import apiClient from "../services/apiClient";

export interface Aluno {
  id: string;
  nome: string;
  avatarUrl?: string;
}

export interface Psicologo {
  id: string;
  nome: string;
  avatarUrl?: string;
}

interface UserDataContextType {
  alunos: Aluno[];
  psicologos: Psicologo[];
  isLoading: boolean;
  findAlunoById: (id: string) => Aluno;
  findPsicologoById: (id: string) => Psicologo;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [psicologos, setPsicologos] = useState<Psicologo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get<Aluno[]>("/alunos"),
      apiClient.get<Psicologo[]>("/psicologos"),
    ])
      .then(([alunosResponse, psicologosResponse]) => {
        setAlunos(alunosResponse.data);
        setPsicologos(psicologosResponse.data);
      })
      .catch((error) => console.error("Falha ao carregar dados:", error))
      .finally(() => setIsLoading(false));
  }, []);

  const findAlunoById = (id: string): Aluno => {
    const aluno = alunos.find((a) => a.id === id);
    return aluno || { id, nome: "Aluno Desconhecido", avatarUrl: "" };
  };

  const findPsicologoById = (id: string): Psicologo => {
    const psicologo = psicologos.find((p) => p.id === id);
    return psicologo || { id, nome: "Psicólogo Desconhecido", avatarUrl: "" };
  };

  return (
    <UserDataContext.Provider value={{ alunos, psicologos, isLoading, findAlunoById, findPsicologoById }}>
      {children}
    </UserDataContext.Provider>
  );
};

// Hook customizado com silenciador para o Vite Refresh
// eslint-disable-next-line react-refresh/only-export-components
export const useUserData = (): UserDataContextType => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
};