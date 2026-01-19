import apiClient from "./apiClient";
import { toAlunoDomain, toPsicologoDomain } from "./mappers/userMappers";

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

// Interface para a resposta do novo endpoint
interface UserRoleResponse {
  role: 'student' | 'psychologist' | null;
}

const API_TIMEOUT = 10000;

export const userService = {
  // --- Métodos de Listagem (Mantidos) ---
  
  async getAlunos(): Promise<Aluno[]> {
    try {
      const response = await apiClient.get<unknown[]>('/alunos', { timeout: API_TIMEOUT });
      return Array.isArray(response.data) ? response.data.map(toAlunoDomain) : [];
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
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
  },

  // --- Método Refatorado (Clean Architecture) ---

  /**
   * Consulta a API Core (Go) para obter o papel do usuário.
   * Não acessa mais o Firestore diretamente no navegador.
   */
  async getUserRole(uid: string): Promise<'student' | 'psychologist' | null> {
    try {
      // Chama o endpoint recém-criado no backend
      const response = await apiClient.get<UserRoleResponse>(`/users/${uid}/role`, {
        timeout: API_TIMEOUT
      });
      
      return response.data.role;
    } catch (error) {
      console.error('[userService] Erro ao verificar role via API:', error);
      // Se a API falhar ou retornar 404, assumimos que o usuário não tem papel definido
      return null;
    }
  }
};

export const getAlunos = userService.getAlunos;
export const getPsicologos = userService.getPsicologos;
export const getUserRole = userService.getUserRole;