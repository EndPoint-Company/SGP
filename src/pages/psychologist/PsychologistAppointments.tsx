import React from "react";
import PsychologistLayout from "../../layouts/PsychologistLayout";
import AppointmentsManager from "../../features/appointments/components/AppointmentsManager";
import { useAuth } from "../../features/auth/hooks/useAuth";

export default function Appointments() {
  const { user, isLoading: isAuthLoading } = useAuth();

  return (
    <PsychologistLayout>
      <div className="h-full w-full relative">
        {/* Estado de Carregamento */}
        {isAuthLoading && (
          <div className="text-center py-10 text-gray-500">
            Carregando identificação...
          </div>
        )}

        {/* Estado de Erro (Sem usuário) */}
        {!isAuthLoading && !user && (
          <div className="text-center py-10 text-red-600">
            Erro de autenticação. Tente recarregar a página.
          </div>
        )}

        {/* Gerenciador de Agendamentos (Reutilizável) */}
        {!isAuthLoading && user?.uid && (
          <AppointmentsManager 
            userId={user.uid} 
            userRole="psicologo" 
          />
        )}
      </div>
    </PsychologistLayout>
  );
}