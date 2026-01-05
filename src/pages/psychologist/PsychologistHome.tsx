// src/pages/psychologist/PsychologistHome.tsx

import React, { useMemo } from "react";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useAppointments } from "../../features/appointments/hooks/useAppointments";
import { useProcessedAppointments } from "../../features/appointments/hooks/useProcessedAppointments";
import { AppointmentsSection } from "../../features/home/components/AppointmentsSection";
import PsychologistLayout from "../../layouts/PsychologistLayout";
import { WelcomeBanner } from "../../features/home/components/WelcomeBanner";

export default function PsychologistHomePage() {
  const { user } = useAuth();
  const { updateStatus, isLoading: isActionLoading } = useAppointments();
  
  // Hook que busca e já processa os nomes dos alunos via Contexto de Usuários
  const { consultas, isLoading, error } = useProcessedAppointments(user?.uid || '', 'psicologo');

  // Filtros de interface
  const { proximasConsultas, solicitacoesPendentes } = useMemo(() => ({
    proximasConsultas: consultas.filter((c) => c.status === "confirmada"),
    solicitacoesPendentes: consultas.filter((c) => c.status.toLowerCase().includes("aguardando")),
  }), [consultas]);

  if (isLoading) return <PsychologistLayout><p className="p-10 text-center">Carregando...</p></PsychologistLayout>;

  return (
    <PsychologistLayout>
      <WelcomeBanner userName={user?.displayName || "Psicólogo"} />
      
      {error && <div className="p-4 mb-6 bg-red-100 text-red-700 rounded">{error}</div>}

      <div className="space-y-8">
        <AppointmentsSection
          title="Solicitações Pendentes"
          appointments={solicitacoesPendentes}
          emptyMessage="Nenhuma solicitação pendente."
          cardType="request"
          userRole="psychologist"
          onAccept={(id) => updateStatus(id, "confirmada")}
          onReject={(id) => updateStatus(id, "cancelada")}
        />
        <AppointmentsSection
          title="Próximas Consultas"
          appointments={proximasConsultas}
          emptyMessage="Sem consultas agendadas."
          cardType="appointment"
          userRole="psychologist"
          onCancel={(id) => updateStatus(id, "cancelada")}
        />
      </div>
    </PsychologistLayout>
  );
}