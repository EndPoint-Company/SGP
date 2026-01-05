import React, { useState, useMemo } from "react";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useAppointments } from "../../features/appointments/hooks/useAppointments";
import { useProcessedAppointments } from "../../features/appointments/hooks/useProcessedAppointments";
import { useUserData } from "../../contexts/UserDataProvider";
import StudentLayout from "../../layouts/StudentLayout";
import { WelcomeBanner } from "../../features/home/components/WelcomeBanner";
import { AppointmentsSection } from "../../features/home/components/AppointmentsSection";
import { AppointmentRequestFlow } from "../../features/appointments/components/AppointmentRequestFlow";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/Modal";
import { Plus, AlertCircle } from "lucide-react"; // Adicionado AlertCircle para o erro

const FIXED_PSICOLOGO_ID = "KVPBp1zK9KX1xZGvF54bxNHD10r2";

export default function StudentHomePage() {
  const { user } = useAuth();
  const { createAppointment, updateStatus } = useAppointments();
  const { findPsicologoById } = useUserData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { consultas, isLoading, error } = useProcessedAppointments(user?.uid || '', 'aluno');
  const targetPsicologo = useMemo(() => findPsicologoById(FIXED_PSICOLOGO_ID), [findPsicologoById]);

  const { upcomingAppointments, pendingRequests } = useMemo(() => ({
    upcomingAppointments: consultas.filter((c) => c.status === "confirmada"),
    pendingRequests: consultas.filter((c) => c.status.toLowerCase().includes("aguardando")),
  }), [consultas]);

  if (isLoading) return <StudentLayout><p className="p-10 text-center">Carregando...</p></StudentLayout>;

  return (
    <StudentLayout>
      <WelcomeBanner userName={user?.displayName || "Aluno"} />

      {/* Renderização do Erro: Resolve o problema do ESLint e melhora a UX */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {targetPsicologo && user?.uid && (
          <AppointmentRequestFlow
            onConfirm={async (data) => { await createAppointment(data); setIsModalOpen(false); }}
            onClose={() => setIsModalOpen(false)}
            alunoId={user.uid}
            psicologoId={targetPsicologo.id}
            psicologoNome={targetPsicologo.nome}
          />
        )}
      </Modal>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Meus Atendimentos</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Solicitação
        </Button>
      </div>

      <div className="space-y-8">
        <AppointmentsSection
          title="Solicitações Pendentes"
          appointments={pendingRequests}
          emptyMessage="Nenhuma solicitação pendente."
          cardType="appointment"
          userRole="student"
          onCancel={(id) => updateStatus(id, "cancelada")}
        />
        <AppointmentsSection
          title="Próximos Atendimentos"
          appointments={upcomingAppointments}
          emptyMessage="Sem atendimentos agendados."
          cardType="appointment"
          userRole="student"
          onCancel={(id) => updateStatus(id, "cancelada")}
        />
      </div>
    </StudentLayout>
  );
}