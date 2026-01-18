import apiClient from "../../../services/apiClient";
import { AxiosError } from "axios";

// Definição de Tipos (Idealmente mover para src/features/horarios/types.ts)
export interface HorarioDisponivel {
  id: string;
  psicologoId: string;
  inicio: string;
  fim: string;
  status: 'disponivel' | 'agendado' | 'bloqueado';
}

export interface NewHorario {
  psicologoId: string;
  inicio: string;
  fim: string;
}

const API_TIMEOUT = 15000;

const handleHorarioError = (error: unknown, defaultMessage: string): never => {
  // Simplificação: Reutiliza lógica similar ou importa um handler global se houver
  if (error instanceof AxiosError && error.response?.data?.message) {
    throw new Error(error.response.data.message);
  }
  throw new Error(defaultMessage);
};

export const horarioService = {
  async getByPsicologoId(psicologoId: string): Promise<HorarioDisponivel[]> {
    try {
      const response = await apiClient.get<HorarioDisponivel[]>('/horarios', {
        params: { psicologoId },
        timeout: API_TIMEOUT,
      });
      // Aqui não temos mapper complexo pois é apenas repasse de dados, mas validamos array
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      throw handleHorarioError(error, "Não foi possível carregar os horários.");
    }
  },

  async createHorario(novoHorario: NewHorario): Promise<void> {
    try {
      await apiClient.post('/horarios', novoHorario, {
        timeout: API_TIMEOUT
      });
    } catch (error) {
      throw handleHorarioError(error, "Não foi possível salvar o horário. Verifique se há conflitos.");
    }
  },

  async deleteHorario(horarioId: string): Promise<void> {
    try {
      await apiClient.delete(`/horarios/${horarioId}`, {
        timeout: API_TIMEOUT
      });
    } catch (error) {
      throw handleHorarioError(error, "Não foi possível remover o horário.");
    }
  }
};

export const getHorariosByPsicologoId = horarioService.getByPsicologoId;
export const createHorario = horarioService.createHorario;
export const deleteHorario = horarioService.deleteHorario;