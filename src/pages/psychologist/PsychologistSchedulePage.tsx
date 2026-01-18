import React, { useRef, useState } from 'react';
import PsychologistLayout from '../../layouts/PsychologistLayout';
import ScheduleManager from '../../features/schedule/components/ScheduleManager';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { usePsychologistSchedule } from '../../features/psychologist/hooks/usePsychologistSchedule';
import { Toast } from '../../components/ui/Toast';

export default function PsychologistSchedulePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  
  // Toda lógica complexa está isolada no Hook
  const { 
    consultas, 
    availability, 
    isLoading: isDataLoading, 
    error, 
    saveAvailability, 
    blockDay 
  } = usePsychologistSchedule(user?.uid);

  // Gestão local do Toast (Feedback Visual)
  const [toast, setToast] = useState({ isVisible: false, message: '' });
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ isVisible: true, message });
    toastTimerRef.current = setTimeout(() => {
      setToast({ isVisible: false, message: '' });
    }, 3000);
  };

  // Wrappers para conectar as ações do Hook com o Feedback (Toast)
  const handleSave = async (data: Record<string, string[]>) => {
    const result = await saveAvailability(data);
    showToast(result.message);
  };

  const handleBlock = async (date: Date) => {
    const result = await blockDay(date);
    showToast(result.message);
  };

  const isLoading = isAuthLoading || isDataLoading;

  return (
    <PsychologistLayout>
      <div className="h-full w-full relative">
        {isLoading && <p className="text-center p-8">A carregar agenda...</p>}
        {error && <p className="text-center p-8 text-red-500">{error}</p>}
        
        {!isLoading && !error && user && (
          <ScheduleManager
            userRole="psicologo"
            currentUserId={user.uid}
            consultas={consultas}
            availability={availability}
            onSaveAvailability={handleSave}
            onBlockDay={handleBlock}
            onShowToast={showToast}
          />
        )}
        <Toast message={toast.message} isVisible={toast.isVisible} />
      </div>
    </PsychologistLayout>
  );
}