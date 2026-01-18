import React, { useState } from "react";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useUserData } from "../../contexts/UserDataProvider";
import { useStudentHome } from "../../features/student/hooks/useStudentHome"; // Novo Hook

import StudentLayout from "../../layouts/StudentLayout";
import { WelcomeBanner } from "../../features/home/components/WelcomeBanner";
import { AppointmentsSection } from "../../features/home/components/AppointmentsSection";
import { AppointmentRequestFlow } from "../../features/appointments/components/AppointmentRequestFlow";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/Modal";
import { Plus } from "lucide-react";
import type { NewConsulta } from "../../features/appointments/types";

export default function StudentHome() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { isLoading: isUserDataLoading } = useUserData();
  
  // Toda a lógica complexa delegada ao Hook
  const { 
    upcomingAppointments, 
    pendingRequests, 
    targetPsicologo, 
    isLoading: isHomeLoading, 
    error,
    createRequest,
    cancelAppointment 
  } = useStudentHome(user?.uid);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Wrapper simples para conectar a UI ao Hook
  const onConfirmRequest = async (data: NewConsulta) => {
    const success = await createRequest(data);
    if (success) setIsModalOpen(false);
  };

  const isLoading = isAuthLoading || isUserDataLoading || isHomeLoading;

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="flex justify-center items-center h-64"><p>Carregando...</p></div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <WelcomeBanner userName={user?.displayName || user?.email || "Aluno"} />

      {/* Modal de Nova Solicitação */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {targetPsicologo && user?.uid && (
          <AppointmentRequestFlow
            onConfirm={onConfirmRequest}
            onClose={() => setIsModalOpen(false)}
            alunoId={user.uid}
            psicologoId={targetPsicologo.id}
            psicologoNome={targetPsicologo.nome}
          />
        )}
      </Modal>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Meus Atendimentos</h2>
        <Button onClick={() => setIsModalOpen(true)} disabled={!targetPsicologo}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Solicitação
        </Button>
      </div>
      
      {error && (
        <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-8">
        <AppointmentsSection
          title="Solicitações Pendentes"
          appointments={pendingRequests}
          emptyMessage="Nenhuma solicitação pendente no momento."
          cardType="appointment"
          userRole="student"
          onCancel={cancelAppointment}
        />
        <AppointmentsSection
          title="Próximos Atendimentos"
          appointments={upcomingAppointments}
          emptyMessage="Você não possui atendimentos agendados."
          cardType="appointment"
          userRole="student"
          onCancel={cancelAppointment}
        />
      </div>
    </StudentLayout>
  );
}