import apiClient from "./apiClient";
import { toAlunoDomain, toPsicologoDomain } from "./mappers/userMappers";

// Definição ÚNICA dos tipos (Single Source of Truth)
export interface Aluno {
  id: string;
  nome: string;
  email?: string;
  avatarUrl?: string;
}

export interface Psicologo {
  id: string;
  nome: string;
  email?: string;
  avatarUrl?: string;
  crp?: string;
}

const API_TIMEOUT = 10000;

export const userService = {
  async getAlunos(): Promise<Aluno[]> {
    try {
      const response = await apiClient.get<unknown[]>('/alunos', { timeout: API_TIMEOUT });
      return Array.isArray(response.data) ? response.data.map(toAlunoDomain) : [];
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
      // Retorna array vazio em caso de erro para não quebrar o Contexto
      return [];
    }
  },

  async getPsicologos(): Promise<Psicologo[]> {
    try {
      const response = await apiClient.get<unknown[]>('/psicologos', { timeout: API_TIMEOUT });
      return Array.isArray(response.data) ? response.data.map(toPsicologoDomain) : [];
    } catch (error) {
      console.error("Erro ao buscar psicólogos:", error);
      return [];
    }
  }
};

// Exports para compatibilidade
export const getAlunos = userService.getAlunos;
export const getPsicologos = userService.getPsicologos;