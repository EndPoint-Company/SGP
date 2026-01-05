// src/features/appointments/components/AppointmentCard.tsx

import React, { useState } from 'react';
import type { ConsultaStatus } from '../../../features/appointments/types';
import ConfirmationModal from '../../../components/ui/confirmartion/ConfirmationModal'; // Verifique o caminho

type AppointmentCardProps = {
  name: string;
  role?: string;
  date: string;
  time: string;
  status: ConsultaStatus;
  avatarUrl?: string;
  onCancel?: () => void;
};

export default function AppointmentCard({
  name,
  role,
  date,
  time,
  status,
  avatarUrl,
  onCancel,
}: AppointmentCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusStyles = () => {
    const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_');
    switch (normalizedStatus) {
      case 'confirmada':
        return 'bg-green-100 text-green-800';
      case 'aguardando_aprovacao':
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Função para formatar o texto do status para exibição
  const getDisplayStatus = (currentStatus: ConsultaStatus): string => {
    if (currentStatus.toLowerCase().includes('aguardando')) {
      return 'Pendente';
    }
    // Capitaliza a primeira letra para outros status
    return currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1);
  };

  const handleConfirmCancel = () => {
    onCancel?.();
    setIsModalOpen(false);
  };

  // Fallback para avatar
  const initials = name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?';

  // Função para formatar o intervalo de tempo
  const getDisplayTime = (startTime: string): string => {
    if (!startTime || !startTime.includes(':')) {
      return startTime;
    }
    try {
      const [hours, minutes] = startTime.split(':').map(Number);
      const dateObj = new Date();
      dateObj.setHours(hours, minutes, 0, 0);
      dateObj.setHours(dateObj.getHours() + 1);

      const endHours = String(dateObj.getHours()).padStart(2, '0');
      const endMinutes = String(dateObj.getMinutes()).padStart(2, '0');
      
      return `${startTime} às ${endHours}:${endMinutes}`;
    } catch (e) {
      console.error("Error formatting time:", e);
      return startTime;
    }
  };

  // Função para formatar a data
  const getDisplayDate = (dateString: string): string => {
    if (!dateString || !dateString.includes('/')) {
      return dateString;
    }
    try {
      const [day, month, year] = dateString.split('/').map(Number);
      const dateObj = new Date(year, month - 1, day);

      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      
      const formattedDate = new Intl.DateTimeFormat('pt-BR', options).format(dateObj);
      return formattedDate.replace(/\b\w/g, char => char.toUpperCase());
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm w-full max-w-xs">
        <div className="flex justify-between items-center">
          <span className="text-base text-gray-600">{getDisplayTime(time)}</span>
          <span className={`text-sm font-semibold px-3 py-1 rounded-md ${getStatusStyles()}`}>
            {getDisplayStatus(status)}
          </span>
        </div>

        <div className="mt-3">
          <h3 className="text-xl font-bold text-gray-900">{getDisplayDate(date)}</h3>
        </div>

        <div className="flex items-center gap-3 mt-4">
          {avatarUrl ? (
            <img
              className="w-10 h-10 rounded-full object-cover"
              src={avatarUrl}
              alt={`Foto de ${name}`}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
              {initials}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-800">{name}</p>
            {role && <p className="text-xs text-gray-500">{role}</p>}
          </div>
        </div>

        <hr className="my-4 border-gray-200" />

        <div className="mt-4 flex justify-between items-center">
          <button className="text-blue-600 font-semibold text-base hover:underline">
            Ver mais
          </button>
          {onCancel && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-white border border-gray-300 rounded-lg px-6 py-2 shadow-sm text-gray-800 font-semibold text-base hover:bg-gray-50"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        title="Cancelar consulta"
        description={`Tem certeza que deseja cancelar a consulta com ${name}? Esta ação não poderá ser desfeita.`}
        onConfirm={handleConfirmCancel}
        onCancel={() => setIsModalOpen(false)}
      />
    </>
  );
}
