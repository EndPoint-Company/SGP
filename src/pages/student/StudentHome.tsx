import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../features/auth/hooks/useAuth";
// Importação corrigida para o arquivo consolidado
import { useUserData } from "../../contexts/UserDataProvider";
import {
  getConsultasByAlunoId,
  updateConsultaStatus,
  createConsulta,
} from "../../features/appointments/services/appointmentService";

import StudentLayout from "../../layouts/StudentLayout";
import { WelcomeBanner } from "../../features/home/components/WelcomeBanner";
import { AppointmentsSection } from "../../features/home/components/AppointmentsSection";
import { AppointmentRequestFlow } from "../../features/appointments/components/AppointmentRequestFlow";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/Modal";
import { Plus } from "lucide-react";

import type { Consulta, NewConsulta } from "../../features/appointments/types";
import type { Psicologo } from "../../services/userService";
import { formatAppointmentDate } from "../../utils/dataHelpers";

const FIXED_PSICOLOGO_ID = "KVPBp1zK9KX1xZGvF54bxNHD10r2";

export default function StudentHomePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { psicologos, findPsicologoById, isLoading: isUserDataLoading } = useUserData();

  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [isConsultasLoading, setIsConsultasLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [targetPsicologo, setTargetPsicologo] = useState<Psicologo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      setIsConsultasLoading(true);
      getConsultasByAlunoId(user.uid)
        .then(setConsultas)
        .catch(() => setError("Não foi possível carregar seus atendimentos."))
        .finally(() => setIsConsultasLoading(false));
    }
  }, [user]);

  useEffect(() => {
    if (psicologos.length > 0) {
      const psicologoAlvo = findPsicologoById(FIXED_PSICOLOGO_ID);
      if (psicologoAlvo.nome !== "Psicólogo Desconhecido") {
        setTargetPsicologo(psicologoAlvo);
      }
    }
  }, [psicologos, findPsicologoById]);

  const handleCreateRequest = async (data: NewConsulta) => {
    if (!user?.uid) return;
    try {
      await createConsulta(data);
      const updated = await getConsultasByAlunoId(user.uid);
      setConsultas(updated);
      setIsModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao agendar consulta");
    }
  };

  const handleCancelAppointment = async (consultaId: string) => {
    try {
      await updateConsultaStatus(consultaId, "cancelada");
      setConsultas((prev) =>
        prev.map((c) => (c.id === consultaId ? { ...c, status: "cancelada" } : c))
      );
    } catch {
      setError("Não foi possível cancelar o agendamento.");
    }
  };

  const { upcomingAppointments, pendingRequests } = useMemo(() => {
    const processed = consultas.map((consulta) => ({
      ...consulta,
      participantName: findPsicologoById(consulta.psicologoId).nome,
      participantAvatarUrl: findPsicologoById(consulta.psicologoId).avatarUrl || "",
      ...formatAppointmentDate(consulta.inicio),
    }));

    return {
      upcomingAppointments: processed.filter((item) => item.status === "confirmada"),
      pendingRequests: processed.filter((item) => item.status.toLowerCase().includes("aguardando")),
    };
  }, [consultas, findPsicologoById]);

  if (isAuthLoading || isUserDataLoading || isConsultasLoading) {
    return <StudentLayout><div className="flex justify-center items-center h-64"><p>Carregando...</p></div></StudentLayout>;
  }

  return (
    <StudentLayout>
      <WelcomeBanner userName={user?.displayName || "Aluno"} />
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {targetPsicologo && user?.uid && (
          <AppointmentRequestFlow
            onConfirm={handleCreateRequest}
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
          <Plus className="w-4 h-4 mr-2" /> Nova Solicitação
        </Button>
      </div>
      
      {error && <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded"><p>{error}</p></div>}

      <div className="space-y-8">
        <AppointmentsSection
          title="Solicitações Pendentes"
          appointments={pendingRequests}
          emptyMessage="Nenhuma solicitação pendente no momento."
          cardType="appointment"
          userRole="student"
          onCancel={handleCancelAppointment}
        />
        <AppointmentsSection
          title="Próximos Atendimentos"
          appointments={upcomingAppointments}
          emptyMessage="Você não possui atendimentos agendados."
          cardType="appointment"
          userRole="student"
          onCancel={handleCancelAppointment}
        />
      </div>
    </StudentLayout>
  );
}