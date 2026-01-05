// src/features/appointments/components/RequestCard.tsx

import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import ConfirmationModalAccept from '../../../components/ui/confirmartion/ConfirmationModalAccept';
import ConfirmationModal from '../../../components/ui/confirmartion/ConfirmationModal';

type RequestCardProps = {
  name: string;
  role?: string;
  date: string;
  time: string;
  onAccept: () => void;
  onReject: () => void;
  avatarUrl?: string;
};

export default function RequestCard({
  name,
  role,
  date,
  time,
  onAccept,
  onReject,
  avatarUrl,
}: RequestCardProps) {
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const handleConfirmAccept = () => {
    onAccept();
    setIsAcceptModalOpen(false);
  };

  const handleConfirmReject = () => {
    onReject();
    setIsRejectModalOpen(false);
  };

  // Fallback para avatar caso a URL não exista
  const initials = name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'P';

  const getDisplayTime = (startTime: string): string => {
    if (!startTime || !startTime.includes(':')) {
      return startTime;
    }
    try {
      const [hours, minutes] = startTime.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      date.setHours(date.getHours() + 1);

      const endHours = String(date.getHours()).padStart(2, '0');
      const endMinutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${startTime} às ${endHours}:${endMinutes}`;
    } catch (e) {
      console.error("Erro ao formatar a hora:", e);
      return startTime;
    }
  };

  const getDisplayDate = (dateString: string): string => {
    if (!dateString || !dateString.includes('/')) {
      return dateString; // Retorna o original se o formato for inválido
    }
    try {
      const [day, month, year] = dateString.split('/').map(Number);
      // O mês no objeto Date do JavaScript é baseado em zero (0-11)
      const dateObj = new Date(year, month - 1, day);

      // Usa a API Intl.DateTimeFormat para uma formatação localizada e robusta
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      
      let formattedDate = new Intl.DateTimeFormat('pt-BR', options).format(dateObj);
      
      // Capitaliza a primeira letra do dia da semana e do mês
      formattedDate = formattedDate.replace(/\b\w/g, char => char.toUpperCase());
      
      return formattedDate;
    } catch (e) {
      console.error("Erro ao formatar a data:", e);
      return dateString; // Retorna o original em caso de erro
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm w-full max-w-xs">
        <div className="flex justify-between items-center">
          <span className="text-base text-gray-600">{getDisplayTime(time)}</span>
          <span className="text-sm font-semibold px-3 py-1 rounded-md bg-yellow-100 text-yellow-800">
            Pendente
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
          {/* ALTERADO: Lógica corrigida para exibir o nome e a função separadamente */}
          <div>
            <p className="font-semibold text-gray-800">{name}</p>
            {role && <p className="text-xs text-gray-500">{role}</p>}
          </div>
        </div>

        <hr className="my-4 border-gray-200" />

        <div className="flex justify-between items-center">
          <button className="text-blue-600 font-semibold text-base hover:underline">
            Ver mais
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => setIsAcceptModalOpen(true)}
              className="bg-green-100 text-green-700 rounded-xl p-2 text-xl hover:bg-green-200 transition-colors"
              aria-label="Aceitar solicitação"
            >
              <Check />
            </button>
            <button
              onClick={() => setIsRejectModalOpen(true)}
              className="bg-red-100 text-red-700 rounded-xl p-2 text-xl hover:bg-red-200 transition-colors"
              aria-label="Rejeitar solicitação"
            >
              <X />
            </button>
          </div>
        </div>
      </div>

      <ConfirmationModalAccept
        isOpen={isAcceptModalOpen}
        title="Aceitar solicitação"
        description={`Deseja aceitar a solicitação de ${name}? Essa ação confirmará o agendamento.`}
        onConfirm={handleConfirmAccept}
        onCancel={() => setIsAcceptModalOpen(false)}
      />

      <ConfirmationModal
        isOpen={isRejectModalOpen}
        title="Rejeitar solicitação"
        description={`Tem certeza que deseja rejeitar a solicitação de ${name}? Esta ação não poderá ser desfeita.`}
        onConfirm={handleConfirmReject}
        onCancel={() => setIsRejectModalOpen(false)}
      />
    </>
  );
}
