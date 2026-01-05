// src/pages/student/ScheduleStudent.tsx

import React, { useMemo } from 'react';
import StudentLayout from '../../layouts/StudentLayout';
import ScheduleManager from '../../features/schedule/components/ScheduleManager';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useSchedule } from '../../features/schedule/hooks/useSchedule';
import { useProcessedAppointments } from '../../features/appointments/hooks/useProcessedAppointments';

const FIXED_PSICOLOGO_ID = "KVPBp1zK9KX1xZGvF54bxNHD10r2";

export default function StudentSchedulePage() {
  const { user } = useAuth();
  
  // Busca horários do psicólogo alvo e as consultas do aluno logado
  const { horarios, isLoading: isScheduleLoading } = useSchedule(FIXED_PSICOLOGO_ID);
  const { consultas, isLoading: isAppointmentsLoading } = useProcessedAppointments(user?.uid || '', 'aluno');

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

  if (isScheduleLoading || isAppointmentsLoading) return <StudentLayout><p className="p-10 text-center">Carregando agenda...</p></StudentLayout>;

  return (
    <StudentLayout>
      <ScheduleManager
        userRole="aluno"
        currentUserId={user?.uid || ''}
        consultas={consultas}
        availability={availabilityRecord}
      />
    </StudentLayout>
  );
}