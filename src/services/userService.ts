import apiClient from "./apiClient";
import { toAlunoDomain, toPsicologoDomain } from "./mappers/userMappers";
// Adicionamos as dependências do Firebase aqui, removendo-as do AuthProvider
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

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
  // --- Métodos Existentes (via API Backend) ---
  
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

  // --- Novo Método (Lógica movida do AuthProvider) ---

  /**
   * Verifica no Firestore se o ID pertence a um Psicólogo ou Aluno.
   * Centraliza a regra de "quem é quem" no sistema.
   */
  async getUserRole(uid: string): Promise<'student' | 'psychologist' | null> {
    try {
      // Verifica primeiro na coleção de Psicólogos
      const psicologoRef = doc(db, 'Psicologos', uid);
      const psicologoSnap = await getDoc(psicologoRef);
      if (psicologoSnap.exists()) return 'psychologist';

      // Verifica depois na coleção de Alunos
      const alunoRef = doc(db, 'Alunos', uid);
      const alunoSnap = await getDoc(alunoRef);
      if (alunoSnap.exists()) return 'student';

      return null;
    } catch (error) {
      console.error('[userService] Erro ao verificar role do usuário:', error);
      return null;
    }
  }
};

// Exports mantidos
export const getAlunos = userService.getAlunos;
export const getPsicologos = userService.getPsicologos;
export const getUserRole = userService.getUserRole;