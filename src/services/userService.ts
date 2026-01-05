// src/services/userService.ts
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { UserRole } from '../features/auth/contexts/AuthContextDefinition';
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
  /**
   * Identifica se o UID pertence a um Psicólogo ou Aluno no Firestore.
   * Atende aos requisitos RF01-RF03.
   */
  async getUserRole(uid: string): Promise<UserRole> {
    try {
      const psicologoRef = doc(db, 'Psicologos', uid);
      const psicologoSnap = await getDoc(psicologoRef);
      if (psicologoSnap.exists()) return 'psychologist';

      const alunoRef = doc(db, 'Alunos', uid);
      const alunoSnap = await getDoc(alunoRef);
      if (alunoSnap.exists()) return 'student';

      return null;
    } catch (error) {
      console.error('Erro ao buscar papel do usuário:', error);
      return null;
    }
  },

  async getPsicologos(): Promise<Psicologo[]> {
    const response = await apiClient.get<Psicologo[]>('/psicologos');
    return response.data;
  }
};