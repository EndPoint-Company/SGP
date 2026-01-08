import React, { useMemo } from 'react';
import PsychologistLayout from '../../layouts/PsychologistLayout';
import ScheduleManager from '../../features/schedule/components/ScheduleManager';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useSchedule } from '../../features/schedule/hooks/useSchedule';
import { useProcessedAppointments } from '../../features/appointments/hooks/useProcessedAppointments';
import { useNotification } from '../../contexts/NotificationContext';

// Interface para o objeto de criação de horários
interface NewHorarioDTO {
  psicologoId: string;
  inicio: string;
  fim: string;
}

export default function PsychologistSchedulePage() {
  const { user } = useAuth();
  const { showToast } = useNotification(); // Usando o contexto global de notificações
  
  const { horarios, saveAvailability, blockDay, isLoading: isScheduleLoading } = useSchedule(user?.uid);
  const { consultas, isLoading: isAppointmentsLoading } = useProcessedAppointments(user?.uid || '', 'psicologo');

  // Transforma horários para o formato de record da agenda (RNF002 - Baixa Latência na renderização)
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

  if (isScheduleLoading || isAppointmentsLoading) {
    return (
      <PsychologistLayout>
        <p className="p-10 text-center text-gray-500">A carregar a sua agenda...</p>
      </PsychologistLayout>
    );
  }

  return (
    <PsychologistLayout>
      <ScheduleManager
        userRole="psicologo"
        currentUserId={user?.uid || ''}
        consultas={consultas}
        availability={availabilityRecord}
        onSaveAvailability={async (added) => {
          try {
            await saveAvailability(transformToNewHorarios(added, user!.uid));
            showToast("Disponibilidade salva com sucesso!");
          } catch {
            showToast("Erro ao salvar disponibilidade.");
          }
        }}
        onBlockDay={async (day) => {
          try {
            await blockDay(day.toISOString().split("T")[0]);
            showToast("Dia bloqueado com sucesso!");
          } catch {
            showToast("Erro ao bloquear dia.");
          }
        }}
      />
    </PsychologistLayout>
  );
}

/**
 * Helper tipado para converter o formato da UI para o modelo de dados.
 * Remove o erro de 'any' ao definir explicitamente o retorno como NewHorarioDTO[].
 */
function transformToNewHorarios(availability: Record<string, string[]>, psicologoId: string): NewHorarioDTO[] {
  const novos: NewHorarioDTO[] = [];
  
  Object.entries(availability).forEach(([date, times]) => {
    times.forEach(time => {
      // Criação segura de datas para evitar discrepâncias de fuso horário (RNF002)
      const start = new Date(`${date}T${time}:00Z`);
      const end = new Date(start);
      end.setHours(start.getHours() + 1);
      
      novos.push({ 
        psicologoId, 
        inicio: start.toISOString(), 
        fim: end.toISOString() 
      });
    });
  });
  
  return novos;
}