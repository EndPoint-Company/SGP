import { useState, useEffect, useMemo } from 'react';
import { 
  getConsultasByPsicologoId, 
  updateConsultaStatus 
} from '../../appointments/services/appointmentService';
import { useUserData } from '../../../contexts/UserDataProvider';
import { formatAppointmentDate } from '../../../utils/dataHelpers';
import type { Consulta } from '../../appointments/types';

export function usePsychologistHome(psychologistId: string | undefined) {
  const { findAlunoById } = useUserData();
  
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!psychologistId) return;

    setIsLoading(true);
    getConsultasByPsicologoId(psychologistId)
      .then(setConsultas)
      .catch((err) => { // Aqui é usado no console.error
        console.error(err);
        setError("Não foi possível carregar seus atendimentos.");
      })
      .finally(() => setIsLoading(false));
  }, [psychologistId]);

  const handleUpdateStatus = async (id: string, status: "confirmada" | "cancelada") => {
    try {
      await updateConsultaStatus(id, status);
      setConsultas((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c))
      );
    } catch { 
      setError("Falha ao atualizar o status da consulta.");
    }
  };

  const { upcomingAppointments, pendingRequests } = useMemo(() => {
    const processed = consultas.map((consulta) => {
      const aluno = findAlunoById(consulta.alunoId);
      const schedule = formatAppointmentDate(consulta.inicio);

      return {
        ...consulta,
        participantName: aluno.nome,
        participantAvatarUrl: aluno.avatarUrl || "",
        ...schedule,
      };
    });

    return {
      upcomingAppointments: processed.filter((c) => c.status === "confirmada"),
      pendingRequests: processed.filter((c) => c.status.toLowerCase().includes("aguardando")),
    };
  }, [consultas, findAlunoById]);

  return {
    upcomingAppointments,
    pendingRequests,
    isLoading,
    error,
    updateStatus: handleUpdateStatus
  };
}