import { useState, useEffect, useMemo, useCallback } from 'react';
import { getConsultasByPsicologoId } from '../../appointments/services/appointmentService';
import { 
  getHorariosByPsicologoId, 
  createHorario, 
  deleteHorario 
} from '../../horarios/services/horarioService';
import { useUserData } from '../../../contexts/UserDataProvider';
import type { Consulta } from '../../appointments/types';
import type { HorarioDisponivel, NewHorario } from '../../horarios/services/horarioService';

export function usePsychologistSchedule(psychologistId: string | undefined) {
  const { findAlunoById } = useUserData();
  
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [horarios, setHorarios] = useState<HorarioDisponivel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função de busca memorizada para poder ser reutilizada após salvar/deletar
  const fetchData = useCallback(async () => {
    if (!psychologistId) return;
    setIsLoading(true);
    try {
      const [consultasData, horariosData] = await Promise.all([
        getConsultasByPsicologoId(psychologistId),
        getHorariosByPsicologoId(psychologistId)
      ]);
      setConsultas(consultasData);
      setHorarios(horariosData);
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar os dados da agenda.');
    } finally {
      setIsLoading(false);
    }
  }, [psychologistId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Ação: Salvar Disponibilidade
  const saveAvailability = async (newlyAddedAvailability: Record<string, string[]>) => {
    if (!psychologistId) return { success: false, message: "ID inválido" };
    
    const novosHorarios: NewHorario[] = [];
    Object.entries(newlyAddedAvailability).forEach(([date, times]) => {
      times.forEach(time => {
        const [hour, minute] = time.split(':');
        // Cria data UTC para evitar problemas de fuso
        const startDate = new Date(`${date}T00:00:00.000Z`);
        startDate.setUTCHours(Number(hour), Number(minute));
        
        const endDate = new Date(startDate);
        endDate.setUTCHours(startDate.getUTCHours() + 1);

        novosHorarios.push({
          psicologoId: psychologistId,
          inicio: startDate.toISOString(),
          fim: endDate.toISOString(),
        });
      });
    });

    try {
      await Promise.all(novosHorarios.map(horario => createHorario(horario)));
      await fetchData(); // Recarrega para mostrar atualizado
      return { success: true, message: "Disponibilidade salva com sucesso!" };
    } catch (err) {
       const msg = err instanceof Error ? err.message : "Erro desconhecido.";
       return { success: false, message: msg };
    }
  };

  // Ação: Bloquear Dia
  const blockDay = async (dayToBlock: Date) => {
    const dateKey = dayToBlock.toISOString().split("T")[0];
    const slotsToDelete = horarios.filter(h => h.inicio.startsWith(dateKey) && h.status === 'disponivel');

    if (slotsToDelete.length === 0) {
        return { success: false, message: "Este dia não possui horários disponíveis para bloquear." };
    }

    try {
      await Promise.all(slotsToDelete.map(slot => deleteHorario(slot.id)));
      await fetchData();
      return { success: true, message: "Dia bloqueado com sucesso!" };
    } catch (err) {
       const msg = err instanceof Error ? err.message : "Erro ao bloquear o dia.";
       return { success: false, message: msg };
    }
  };

  // View Models
  const processedConsultas = useMemo(() => {
    return consultas.map(item => {
      const aluno = findAlunoById(item.alunoId);
      const participantName = aluno.nome || 'Desconhecido';
      return { ...item, participantName };
    });
  }, [consultas, findAlunoById]);

  const availabilityRecord = useMemo(() => {
    const record: Record<string, string[]> = {};
    horarios.forEach(h => {
      if (h.status === 'disponivel') {
        const dateKey = h.inicio.split('T')[0];
        const time = new Date(h.inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
        if (!record[dateKey]) {
          record[dateKey] = [];
        }
        record[dateKey].push(time);
      }
    });
    return record;
  }, [horarios]);

  return {
    consultas: processedConsultas,
    availability: availabilityRecord,
    isLoading,
    error,
    saveAvailability,
    blockDay
  };
}