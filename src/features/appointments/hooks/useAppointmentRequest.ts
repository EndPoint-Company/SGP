import { useState, useEffect, useMemo } from 'react';
import { getHorariosByPsicologoId } from '../../horarios/services/horarioService';
import type { HorarioDisponivel } from '../../horarios/services/horarioService';
import type { NewConsulta } from '../types';

export interface AvailableSlot {
  id: string;
  time: string;
}

const formatDateKey = (date: Date) => date.toISOString().split("T")[0];

export function useAppointmentRequest(
  psicologoId: string, 
  alunoId: string, 
  onConfirm: (data: NewConsulta) => Promise<void>
) {
  const [step, setStep] = useState<"selection" | "success">("selection");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [availableTimes, setAvailableTimes] = useState<AvailableSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<AvailableSlot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dados brutos
  const [allSlots, setAllSlots] = useState<HorarioDisponivel[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  // 1. Busca Horários
  useEffect(() => {
    async function fetchSlots() {
      if (!psicologoId) return;
      setIsLoadingSlots(true);
      setSlotsError(null);
      try {
        const slots = await getHorariosByPsicologoId(psicologoId);
        setAllSlots(slots);
      } catch (error) {
        console.error("Erro ao buscar horários:", error);
        setSlotsError("Não foi possível carregar os horários disponíveis.");
      } finally {
        setIsLoadingSlots(false);
      }
    }
    fetchSlots();
  }, [psicologoId]);

  // 2. Lógica de Seleção de Dia
  const handleDaySelect = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    setSelectedTimeSlot(null);

    const dayKey = formatDateKey(date);
    
    // Filtra e formata os horários do dia selecionado
    const timesForDay = allSlots
      .filter(slot => slot.inicio.startsWith(dayKey) && slot.status === 'disponivel')
      .map(slot => ({
        id: slot.id,
        time: new Date(slot.inicio).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'America/Sao_Paulo'
        })
      }))
      .sort((a, b) => a.time.localeCompare(b.time));
    
    setAvailableTimes(timesForDay);
  };

  // 3. Enviar Solicitação
  const handleSubmit = async () => {
    if (selectedDate && selectedTimeSlot) {
      setIsSubmitting(true);
      try {
        await onConfirm({
          alunoId: alunoId,
          psicologoId: psicologoId,
          horarioId: selectedTimeSlot.id,
          status: 'aguardando aprovacao'
        });
        setStep("success");
      } catch (error) {
        console.error("Erro no hook de agendamento:", error);
        // O erro deve ser tratado visualmente no componente pai ou via toast se necessário
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // 4. Dias Disponíveis (Memoizado para performance do calendário)
  const availableDaysSet = useMemo(() => {
    const daySet = new Set<string>();
    allSlots.forEach(slot => {
      if (slot.status === 'disponivel') {
        daySet.add(formatDateKey(new Date(slot.inicio)));
      }
    });
    return daySet;
  }, [allSlots]);

  return {
    step,
    selectedDate,
    availableTimes,
    selectedTimeSlot,
    setSelectedTimeSlot, // Exposto para a UI selecionar
    isSubmitting,
    isLoadingSlots,
    slotsError,
    availableDaysSet,
    handleDaySelect,
    handleSubmit,
    formatDateKey // Útil para o DayPicker
  };
}