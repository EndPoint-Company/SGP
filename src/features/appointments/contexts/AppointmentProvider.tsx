import React, { useState, useCallback } from 'react';
import { appointmentService } from '../services/appointmentService';
import { AppointmentContext } from './AppointmentContextDefinition';
import type { Consulta, NewConsulta } from '../types';

export const AppointmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Consulta[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAppointments = useCallback(async (userId: string, role: 'student' | 'psychologist') => {
    setIsLoading(true);
    try {
      const data = role === 'psychologist' 
        ? await appointmentService.getByPsicologoId(userId)
        : await appointmentService.getByAlunoId(userId);
      setAppointments(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createAppointment = async (data: NewConsulta) => {
    const newAppointment = await appointmentService.create(data);
    setAppointments(prev => [...prev, newAppointment]);
  };

  const updateStatus = async (id: string, status: 'confirmada' | 'cancelada') => {
    const updated = await appointmentService.updateStatus(id, status);
    setAppointments(prev => prev.map(a => a.id === id ? updated : a));
  };

  return (
    <AppointmentContext.Provider value={{ appointments, isLoading, fetchAppointments, createAppointment, updateStatus }}>
      {children}
    </AppointmentContext.Provider>
  );
};