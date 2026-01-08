import apiClient from "./apiClient";

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

export const userService = {
  // Centraliza as chamadas para a API Go/Serverless
  async getPsicologos(): Promise<Psicologo[]> {
    const response = await apiClient.get<Psicologo[]>('/psicologos');
    return response.data;
  },

  async getAlunos(): Promise<Aluno[]> {
    const response = await apiClient.get<Aluno[]>('/alunos');
    return response.data;
  }
};