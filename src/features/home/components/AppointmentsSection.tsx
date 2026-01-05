// src/features/home/components/AppointmentsSection.tsx

import React from 'react';
import AppointmentCard from '../../../features/appointments/components/AppointmentCard';
import RequestCard from '../../../features/appointments/components/RequestCard';
import type { ProcessedConsulta } from '../../../features/appointments/types';

interface AppointmentsSectionProps {
  title: string;
  appointments: ProcessedConsulta[];
  emptyMessage: string;
  cardType: 'appointment' | 'request'; // Para decidir qual card renderizar
  userRole: 'psychologist' | 'student';
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
}

export const AppointmentsSection: React.FC<AppointmentsSectionProps> = ({
  title,
  appointments,
  emptyMessage,
  cardType,
  userRole,
  onAccept,
  onReject,
  onCancel,
}) => {
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="flex gap-4 flex-wrap">
        {appointments.length > 0 ? (
          appointments.map((appt) => (
            cardType === 'request' && userRole === 'psychologist' ? (
              <RequestCard
                key={appt.id}
                name={appt.participantName}
                role="Paciente"
                date={appt.date}
                time={appt.time}
                avatarUrl={appt.participantAvatarUrl}
                onAccept={() => onAccept?.(appt.id)}
                onReject={() => onReject?.(appt.id)}
              />
            ) : (
              <AppointmentCard
                key={appt.id}
                name={appt.participantName}
                role={userRole === 'psychologist' ? 'Paciente' : 'Psicólogo(a)'}
                date={appt.date}
                time={appt.time}
                status={appt.status}
                avatarUrl={appt.participantAvatarUrl}
                onCancel={onCancel ? () => onCancel(appt.id) : undefined}
              />
            )
          ))
        ) : (
          <p className="text-gray-500">{emptyMessage}</p>
        )}
      </div>
    </div>
  );
};