import React from 'react';
import PsychologistLayout from '../../layouts/PsychologistLayout';
import ScheduleManager from '../../features/schedule/components/ScheduleManager';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { usePsychologistSchedule } from '../../features/psychologist/hooks/usePsychologistSchedule';
import { useToast } from '../../contexts/ToastProvider';

export default function PsychologistSchedulePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { showToast } = useToast(); // CORREÇÃO: addToast -> showToast
  
  const { 
    consultas, 
    availability, 
    isLoading: isDataLoading, 
    error, 
    saveAvailability, 
    blockDay 
  } = usePsychologistSchedule(user?.uid);

  // Ação: Salvar Disponibilidade (VERDE)
  const handleSave = async (data: Record<string, string[]>) => {
    const result = await saveAvailability(data);
    showToast(result.message, result.success ? 'success' : 'error'); // CORREÇÃO
  };

  // Ação: Bloquear Dia
  const handleBlock = async (date: Date) => {
    const result = await blockDay(date);
    
    // CORREÇÃO: Se o bloqueio foi um sucesso, usamos 'success' (verde) ou 'info' (azul).
    // Usar 'error' (vermelho) em caso de sucesso pode confundir o usuário.
    const toastType = result.success ? 'success' : 'error'; 
    showToast(result.message, toastType); 
  };

  const isLoading = isAuthLoading || isDataLoading;

  return (
    <PsychologistLayout>
      <div className="h-full w-full relative">
        {isLoading && <p className="text-center p-8">Carregando agenda...</p>}
        {error && <p className="text-center p-8 text-red-500">{error}</p>}
        
        {!isLoading && !error && user && (
          <ScheduleManager
            userRole="psicologo"
            currentUserId={user.uid}
            consultas={consultas}
            availability={availability}
            onSaveAvailability={handleSave}
            onBlockDay={handleBlock}
          />
        )}
      </div>
    </PsychologistLayout>
  );
}