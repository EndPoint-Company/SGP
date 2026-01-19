import React from 'react';
import StudentLayout from '../../layouts/StudentLayout';
import ScheduleManager from '../../features/schedule/components/ScheduleManager';
import { useAuth } from '../../features/auth/hooks/useAuth';
// ATUALIZADO: Importando do local correto na feature
import { useStudentSchedule } from '../../features/student/hooks/useStudentSchedule';

export default function StudentSchedulePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const { consultas, availability, isLoading: isDataLoading, error } = useStudentSchedule(user?.uid);

  const isLoading = isAuthLoading || isDataLoading;

  return (
    <StudentLayout>
      <div className="h-full w-full relative">
        {isLoading && <p className="text-center p-8">Carregando agenda...</p>}
        {error && <p className="text-red-500 text-center p-8">{error}</p>}
        
        {!isLoading && !error && user && (
          <ScheduleManager
            userRole="aluno"
            currentUserId={user.uid}
            consultas={consultas}
            availability={availability}
          />
        )}
      </div>
    </StudentLayout>
  );
}