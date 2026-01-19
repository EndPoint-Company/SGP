import apiClient from "../../../services/apiClient";
import type { Consulta, NewConsulta, ConsultaStatus } from "../types";
import { toDomain } from "../mappers/appointmentMappers"; // Importa o Mapper centralizado
import { AxiosError } from "axios";

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

const API_TIMEOUT = 10000;

export const appointmentService = {
  async getByPsicologoId(psicologoId: string): Promise<Consulta[]> {
    try {
      const response = await apiClient.get<Consulta[]>('/consultas/psicologo', { 
        params: { psicologoId }, 
        timeout: API_TIMEOUT 
      });
      
      // Usa toDomain em vez de normalizeConsultaDates
      if (Array.isArray(response.data)) {
        return response.data.map(toDomain);
      }
      return [];

    } catch (error) {
      if (appointmentService.isAxiosError(error) && error.response?.status === 404) {
        return [];
      }
      throw appointmentService.handleError(error, "Erro ao buscar as consultas do psicólogo.");
    }
  },

  async getByAlunoId(alunoId: string): Promise<Consulta[]> {
    try {
      const response = await apiClient.get<Consulta[]>('/consultas/aluno', {
        params: { alunoId },
        timeout: API_TIMEOUT
      });

      if (Array.isArray(response.data)) {
        return response.data.map(toDomain);
      }
      return [];

    } catch (error) {
      if (appointmentService.isAxiosError(error) && error.response?.status === 404) {
        return [];
      }
      throw appointmentService.handleError(error, "Erro ao buscar as consultas do aluno.");
    }
  },

  async create(consultaData: NewConsulta): Promise<Consulta> {
    try {
      // Removemos validateConsultaData (deve ser feito no form/schema)
      const response = await apiClient.post<Consulta>("/consultas", consultaData, { 
        timeout: API_TIMEOUT 
      });
      return toDomain(response.data);
    } catch (error) {
      throw appointmentService.handleError(error, "Erro ao criar a consulta.");
    }
  },

  async updateStatus(id: string, status: Extract<ConsultaStatus, "confirmada" | "cancelada">): Promise<Consulta> {
    try {
      const response = await apiClient.patch<Consulta>(`/consultas/${id}/status`, { status }, { 
        timeout: API_TIMEOUT 
      });
      return toDomain(response.data);
    } catch (error) {
      throw appointmentService.handleError(error, "Erro ao atualizar o status da consulta.");
    }
  },

  async cancel(id: string): Promise<void> {
    try {
      await apiClient.delete(`/consultas/${id}`, { timeout: API_TIMEOUT });
    } catch (error) {
      throw appointmentService.handleError(error, "Erro ao cancelar a consulta.");
    }
  },

  async getById(id: string): Promise<Consulta | null> {
    try {
      const response = await apiClient.get<Consulta>(`/consultas/${id}`, { timeout: API_TIMEOUT });
      return toDomain(response.data);
    } catch (error) {
      if (appointmentService.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw appointmentService.handleError(error, "Erro ao buscar a consulta.");
    }
  },
  
  handleError(error: unknown, defaultMessage: string): Error {
    if (appointmentService.isAxiosError(error)) {
      const errorData = error.response?.data as ApiErrorResponse;
      const status = error.response?.status;
      const errorMessage = errorData?.message || errorData?.error || (error as Error).message;

      switch (status) {
        case 400: return new Error(errorMessage || "Dados inválidos enviados.");
        case 401: return new Error("Sessão expirada. Faça login novamente.");
        case 403: return new Error("Você não tem permissão para realizar esta ação.");
        case 404: return new Error("Recurso não encontrado.");
        case 500: return new Error("Erro interno no servidor.");
        default: return new Error(errorMessage || defaultMessage);
      }
    }
    return error instanceof Error ? error : new Error(defaultMessage);
  },

  isAxiosError(error: unknown): error is AxiosError {
    return typeof error === "object" && error !== null && "isAxiosError" in error;
  },
};

export const getConsultasByPsicologoId = appointmentService.getByPsicologoId;
export const getConsultasByAlunoId = appointmentService.getByAlunoId;
export const createConsulta = appointmentService.create;
export const updateConsultaStatus = appointmentService.updateStatus;
export const cancelConsulta = appointmentService.cancel;
export const getConsultaById = appointmentService.getById;