// src/pages/psychologist/PsychologistSchedulePage.tsx

import React, { useMemo, useState } from 'react';
import PsychologistLayout from '../../layouts/PsychologistLayout';
import ScheduleManager from '../../features/schedule/components/ScheduleManager';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useSchedule } from '../../features/schedule/hooks/useSchedule';
import { useProcessedAppointments } from '../../features/appointments/hooks/useProcessedAppointments';
import { Toast } from '../../components/ui/Toast';

export default function PsychologistSchedulePage() {
  const { user } = useAuth();
  const [toast, setToast] = useState({ isVisible: false, message: '' });
  
  const { horarios, saveAvailability, blockDay, isLoading: isScheduleLoading } = useSchedule(user?.uid);
  const { consultas, isLoading: isAppointmentsLoading } = useProcessedAppointments(user?.uid || '', 'psicologo');

  const showToast = (message: string) => {
    setToast({ isVisible: true, message });
    setTimeout(() => setToast({ isVisible: false, message: '' }), 3000);
  };

  // Transforma horários para o formato de record da agenda
  const availabilityRecord = useMemo(() => {
    const record: Record<string, string[]> = {};
    horarios.filter(h => h.status === 'disponivel').forEach(h => {
      const dateKey = h.inicio.split('T')[0];
      const time = new Date(h.inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      if (!record[dateKey]) record[dateKey] = [];
      record[dateKey].push(time);
    });
    return record;
  }, [horarios]);

  if (isScheduleLoading || isAppointmentsLoading) return <PsychologistLayout><p className="p-10 text-center">Carregando agenda...</p></PsychologistLayout>;

  return (
    <PsychologistLayout>
      <ScheduleManager
        userRole="psicologo"
        currentUserId={user?.uid || ''}
        consultas={consultas}
        availability={availabilityRecord}
        onSaveAvailability={async (added) => {
          // Lógica de transformação delegada para manter o ScheduleManager limpo
          await saveAvailability(transformToNewHorarios(added, user!.uid));
          showToast("Disponibilidade salva!");
        }}
        onBlockDay={async (day) => {
          await blockDay(day.toISOString().split("T")[0]);
          showToast("Dia bloqueado!");
        }}
      />
      <Toast message={toast.message} isVisible={toast.isVisible} />
    </PsychologistLayout>
  );
}

// Helper para converter o formato da UI para o modelo de dados
function transformToNewHorarios(availability: Record<string, string[]>, psicologoId: string) {
  const novos: any[] = [];
  Object.entries(availability).forEach(([date, times]) => {
    times.forEach(time => {
      const start = new Date(`${date}T${time}:00Z`);
      const end = new Date(start);
      end.setHours(start.getHours() + 1);
      novos.push({ psicologoId, inicio: start.toISOString(), fim: end.toISOString() });
    });
  });
  return novos;
}