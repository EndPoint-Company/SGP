import React from 'react';
import PsychologistLayout from '../../layouts/PsychologistLayout';
import ScheduleManager from '../../features/schedule/components/ScheduleManager';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { usePsychologistSchedule } from '../../features/psychologist/hooks/usePsychologistSchedule';
import { useToast } from '../../contexts/ToastProvider';

export default function PsychologistSchedulePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { addToast } = useToast();
  
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
    addToast(result.message, result.success ? 'success' : 'error');
  };

  // Ação: Bloquear Dia (VERMELHO)
  const handleBlock = async (date: Date) => {
    const result = await blockDay(date);
    
    const toastType = result.success ? 'error' : 'error'; 
    addToast(result.message, toastType);
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