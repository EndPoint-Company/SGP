import React from "react";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useUserData } from "../../contexts/UserDataProvider";
import { usePsychologistHome } from "../../features/psychologist/hooks/usePsychologistHome";

import PsychologistLayout from "../../layouts/PsychologistLayout";
import { WelcomeBanner } from "../../features/home/components/WelcomeBanner";
import { AppointmentsSection } from "../../features/home/components/AppointmentsSection";

export default function PsychologistHome() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { isLoading: isUserDataLoading, findPsicologoById } = useUserData();
  
  const { 
    upcomingAppointments, 
    pendingRequests, 
    isLoading: isHomeLoading, 
    error, 
    updateStatus 
  } = usePsychologistHome(user?.uid);

  const psychProfile = user ? findPsicologoById(user.uid) : null;
  const displayName = psychProfile?.nome || user?.displayName || "Psicólogo";

  const isLoading = isAuthLoading || isUserDataLoading || isHomeLoading;

  if (isLoading) {
    return (
      <PsychologistLayout>
        <div className="flex justify-center items-center h-64"><p>Carregando...</p></div>
      </PsychologistLayout>
    );
  }

  if (error) {
    return (
      <PsychologistLayout>
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>{error}</p>
          <button className="mt-2 underline" onClick={() => window.location.reload()}>
            Tentar novamente
          </button>
        </div>
      </PsychologistLayout>
    );
  }

  return (
    <PsychologistLayout>
      <WelcomeBanner userName={displayName} />
      
      <div className="space-y-8">
        <AppointmentsSection
          title="Solicitações Pendentes"
          appointments={pendingRequests}
          emptyMessage="Nenhuma solicitação pendente no momento."
          cardType="request"
          userRole="psychologist"
          onAccept={(id) => updateStatus(id, "confirmada")}
          onReject={(id) => updateStatus(id, "cancelada")}
        />
        <AppointmentsSection
          title="Próximas Consultas"
          appointments={upcomingAppointments}
          emptyMessage="Você não possui consultas agendadas."
          cardType="appointment"
          userRole="psychologist"
          onCancel={(id) => updateStatus(id, "cancelada")}
        />
      </div>
    </PsychologistLayout>
  );
}