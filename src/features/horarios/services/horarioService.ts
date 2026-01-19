import apiClient from "../../../services/apiClient";
import { AxiosError } from "axios";
import { toDomain } from "../mappers/horarioMappers";

// Mantemos as interfaces aqui ou movemos para um types/index.ts (sugestão futura)
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

// Helper de erro padronizado (idealmente extraído para um utils/apiUtils.ts)
const handleServiceError = (error: unknown, defaultMessage: string): never => {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const msg = error.response?.data?.message || error.message;
    
    if (status === 401) throw new Error("Sessão expirada.");
    if (status === 403) throw new Error("Sem permissão.");
    if (status === 409) throw new Error("Conflito de horário."); // Específico para horários
    
    throw new Error(msg || defaultMessage);
  }
  throw new Error(defaultMessage);
};

export const horarioService = {
  async getByPsicologoId(psicologoId: string): Promise<HorarioDisponivel[]> {
    try {
      const response = await apiClient.get<unknown[]>('/horarios', {
        params: { psicologoId },
        timeout: API_TIMEOUT,
      });
      // Aplica o Mapper
      return Array.isArray(response.data) ? response.data.map(toDomain) : [];
    } catch (error) {
      // Retorna array vazio em caso de 404 para não quebrar a tela
      if (error instanceof AxiosError && error.response?.status === 404) return [];
      throw handleServiceError(error, "Não foi possível carregar os horários.");
    }
  },

  async createHorario(novoHorario: NewHorario): Promise<void> {
    try {
      await apiClient.post('/horarios', novoHorario, {
        timeout: API_TIMEOUT
      });
    } catch (error) {
      throw handleServiceError(error, "Não foi possível salvar o horário.");
    }
  },

  async deleteHorario(horarioId: string): Promise<void> {
    try {
      await apiClient.delete(`/horarios/${horarioId}`, {
        timeout: API_TIMEOUT
      });
    } catch (error) {
      throw handleServiceError(error, "Não foi possível remover o horário.");
    }
  }
};

export const getHorariosByPsicologoId = horarioService.getByPsicologoId;
export const createHorario = horarioService.createHorario;
export const deleteHorario = horarioService.deleteHorario;