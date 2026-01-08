import React, { useMemo } from "react";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useAppointments } from "../../features/appointments/hooks/useAppointments";
import { useProcessedAppointments } from "../../features/appointments/hooks/useProcessedAppointments";
import { AppointmentsSection } from "../../features/home/components/AppointmentsSection";
import PsychologistLayout from "../../layouts/PsychologistLayout";
import { WelcomeBanner } from "../../features/home/components/WelcomeBanner";
import { AlertCircle } from "lucide-react"; // Importado para consistência visual

export default function PsychologistHomePage() {
  const { user } = useAuth();
  const { updateStatus } = useAppointments();
  
  // Hook que busca e processa os nomes dos alunos via Contexto de Usuários
  const { consultas, isLoading, error } = useProcessedAppointments(user?.uid || '', 'psicologo');

  // Filtros de interface memorizados para performance (RNF002)
  const { proximasConsultas, solicitacoesPendentes } = useMemo(() => ({
    proximasConsultas: consultas.filter((c) => c.status === "confirmada"),
    solicitacoesPendentes: consultas.filter((c) => c.status.toLowerCase().includes("aguardando")),
  }), [consultas]);

  if (isLoading) {
    return (
      <PsychologistLayout>
        <p className="p-10 text-center text-gray-500">A carregar os seus atendimentos...</p>
      </PsychologistLayout>
    );
  }

  return (
    <PsychologistLayout>
      <WelcomeBanner userName={user?.displayName || "Psicólogo"} />
      
      {/* Banner de Erro padronizado com a Home do Aluno */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      <div className="space-y-8">
        <AppointmentsSection
          title="Solicitações Pendentes"
          appointments={solicitacoesPendentes}
          emptyMessage="Nenhuma solicitação pendente no momento."
          cardType="request"
          userRole="psychologist"
          onAccept={(id) => updateStatus(id, "confirmada")}
          onReject={(id) => updateStatus(id, "cancelada")}
        />
        
        <AppointmentsSection
          title="Próximas Consultas"
          appointments={proximasConsultas}
          emptyMessage="Não existem consultas agendadas para os próximos dias."
          cardType="appointment"
          userRole="psychologist"
          onCancel={(id) => updateStatus(id, "cancelada")}
        />
      </div>
    </PsychologistLayout>
  );
}