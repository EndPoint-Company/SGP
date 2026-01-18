import { useState, useEffect, useMemo } from 'react';
import { 
  getConsultasByAlunoId, 
  createConsulta, 
  updateConsultaStatus 
} from '../../appointments/services/appointmentService';
import { useUserData } from '../../../contexts/UserDataProvider';
import { formatAppointmentDate } from '../../../utils/dataHelpers';
import type { Consulta, NewConsulta } from '../../appointments/types';
import type { Psicologo } from '../../../services/userService';

const FIXED_PSICOLOGO_ID = "KVPBp1zK9KX1xZGvF54bxNHD10r2";

export function useStudentHome(studentId: string | undefined) {
  const { psicologos, findPsicologoById } = useUserData();
  
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [targetPsicologo, setTargetPsicologo] = useState<Psicologo | null>(null);

  // 1. Carregar Consultas
  useEffect(() => {
    if (!studentId) return;
    
    setIsLoading(true);
    getConsultasByAlunoId(studentId)
      .then(setConsultas)
      .catch((err) => { // Aqui usamos 'err' no console, então mantemos
        console.error("Erro ao carregar consultas:", err);
        setError("Não foi possível carregar seus atendimentos.");
      })
      .finally(() => setIsLoading(false));
  }, [studentId]);

  // 2. Definir Psicólogo Alvo
  useEffect(() => {
    if (psicologos.length > 0) {
      const alvo = findPsicologoById(FIXED_PSICOLOGO_ID);
      if (alvo.id === FIXED_PSICOLOGO_ID) {
        setTargetPsicologo(alvo);
      } else {
        setError("O psicólogo configurado para agendamento não foi encontrado.");
      }
    }
  }, [psicologos, findPsicologoById]);

  // 3. Ações
  const handleCreateRequest = async (data: NewConsulta) => {
    if (!studentId) return;
    try {
      await createConsulta(data);
      const updated = await getConsultasByAlunoId(studentId);
      setConsultas(updated);
      return true;
    } catch (err) { // Aqui usamos 'err' para pegar a mensagem, mantemos
      const message = err instanceof Error ? err.message : "Erro ao agendar consulta";
      setError(message);
      return false;
    }
  };

  const handleCancelAppointment = async (consultaId: string) => {
    try {
      await updateConsultaStatus(consultaId, "cancelada");
      setConsultas((prev) =>
        prev.map((c) => (c.id === consultaId ? { ...c, status: "cancelada" } : c))
      );
    } catch { 
      setError("Não foi possível cancelar o agendamento.");
    }
  };

  // 4. ViewModel
  const { upcomingAppointments, pendingRequests } = useMemo(() => {
    const processed = consultas.map((consulta) => {
      const psicologo = findPsicologoById(consulta.psicologoId);
      const schedule = formatAppointmentDate(consulta.inicio);
      return {
        ...consulta,
        participantName: psicologo.nome,
        participantAvatarUrl: psicologo.avatarUrl || "",
        ...schedule,
      };
    });

    return {
      upcomingAppointments: processed.filter((item) => item.status === "confirmada"),
      pendingRequests: processed.filter((item) => item.status.toLowerCase().includes("aguardando")),
    };
  }, [consultas, findPsicologoById]);

  return {
    upcomingAppointments,
    pendingRequests,
    targetPsicologo,
    isLoading,
    error,
    createRequest: handleCreateRequest,
    cancelAppointment: handleCancelAppointment,
    clearError: () => setError(null)
  };
}