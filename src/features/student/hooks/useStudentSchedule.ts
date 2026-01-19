import { useState, useEffect, useMemo } from 'react';
import { getConsultasByAlunoId } from '../../appointments/services/appointmentService';
import { getHorariosByPsicologoId } from '../../horarios/services/horarioService';
import { useUserData } from '../../../contexts/UserDataProvider';
import type { Consulta } from '../../appointments/types';
import type { HorarioDisponivel } from '../../horarios/services/horarioService';

// TODO: Remover ID hardcoded quando houver fluxo de seleção de psicólogo
const FIXED_PSICOLOGO_ID = "KVPBp1zK9KX1xZGvF54bxNHD10r2";

export function useStudentSchedule(studentId: string | undefined) {
  const { findPsicologoById } = useUserData();
  
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [horarios, setHorarios] = useState<HorarioDisponivel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [consultasData, horariosData] = await Promise.all([
          getConsultasByAlunoId(studentId),
          getHorariosByPsicologoId(FIXED_PSICOLOGO_ID)
        ]);
        setConsultas(consultasData);
        setHorarios(horariosData);
      } catch (err) { 
        console.error("Erro ao carregar dados da agenda:", err);
        setError('Não foi possível carregar a agenda.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [studentId]);

  // Lógica de Apresentação (ViewModel)
  const processedConsultas = useMemo(() => {
    return consultas.map((c) => ({
      ...c,
      participantName: findPsicologoById(c.psicologoId)?.nome || 'Psicólogo'
    }));
  }, [consultas, findPsicologoById]);

  const availability = useMemo(() => {
    const record: Record<string, string[]> = {};
    horarios.forEach((h) => {
      if (h.status === 'disponivel') {
        const dateKey = h.inicio.split('T')[0];
        const time = new Date(h.inicio).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' 
        });
        
        if (!record[dateKey]) record[dateKey] = [];
        record[dateKey].push(time);
      }
    });
    return record;
  }, [horarios]);

  return {
    consultas: processedConsultas,
    availability,
    isLoading,
    error
  };
}