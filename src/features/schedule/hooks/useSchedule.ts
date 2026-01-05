// src/features/schedule/hooks/useSchedule.ts

import { useState, useCallback, useEffect } from 'react';
import { horarioService, type HorarioDisponivel, type NewHorario } from '../../horarios/services/horarioService';

export function useSchedule(psicologoId: string | undefined) {
  const [horarios, setHorarios] = useState<HorarioDisponivel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHorarios = useCallback(async () => {
    if (!psicologoId) return;
    setIsLoading(true);
    try {
      const data = await horarioService.getByPsicologoId(psicologoId);
      setHorarios(data);
    } catch (err) {
      setError("Falha ao carregar horários.");
    } finally {
      setIsLoading(false);
    }
  }, [psicologoId]);

  useEffect(() => {
    fetchHorarios();
  }, [fetchHorarios]);

  const saveAvailability = async (novosHorarios: NewHorario[]) => {
    await Promise.all(novosHorarios.map(h => horarioService.createHorario(h)));
    await fetchHorarios();
  };

  const blockDay = async (dateKey: string) => {
    const slotsToDelete = horarios.filter(h => h.inicio.startsWith(dateKey) && h.status === 'disponivel');
    await Promise.all(slotsToDelete.map(slot => horarioService.deleteHorario(slot.id)));
    await fetchHorarios();
  };

  return { horarios, isLoading, error, saveAvailability, blockDay, refresh: fetchHorarios };
}