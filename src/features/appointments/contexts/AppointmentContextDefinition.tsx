import { createContext, useContext } from 'react';
import type { Consulta, NewConsulta } from '../types';

export interface AppointmentContextType {
  appointments: Consulta[];
  isLoading: boolean;
  fetchAppointments: (userId: string, role: 'student' | 'psychologist') => Promise<void>;
  createAppointment: (data: NewConsulta) => Promise<void>;
  updateStatus: (id: string, status: 'confirmada' | 'cancelada') => Promise<void>;
}

export const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export const useAppointmentsContext = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error("useAppointmentsContext deve ser usado dentro de um AppointmentProvider");
  }
  return context;
};