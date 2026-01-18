'use client';

import React, { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { ptBR } from "date-fns/locale";
import { CalendarPlus, CheckCircle, Loader2 } from "lucide-react";
import type { NewConsulta } from "../types";
import { useAppointmentRequest } from "../hooks/useAppointmentRequest"; // Novo Hook

interface AppointmentRequestFlowProps {
  onConfirm: (data: NewConsulta) => Promise<void>;
  onClose: () => void;
  alunoId: string;
  psicologoId: string;
  psicologoNome: string;
}

export function AppointmentRequestFlow({
  onConfirm,
  onClose,
  alunoId,
  psicologoId,
}: AppointmentRequestFlowProps) {
  // Estado local apenas para o calendário visual
  const [month, setMonth] = useState<Date>(new Date());

  // Lógica complexa delegada ao Hook
  const {
    step,
    selectedDate,
    availableTimes,
    selectedTimeSlot,
    setSelectedTimeSlot,
    isSubmitting,
    isLoadingSlots,
    slotsError,
    availableDaysSet,
    handleDaySelect,
    handleSubmit,
    formatDateKey
  } = useAppointmentRequest(psicologoId, alunoId, onConfirm);

  const dayPickerStyles = `
    .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #eff6ff; }
    .rdp-day_selected { background-color: #2563eb !important; color: white !important; border-radius: 8px; }
    .rdp-button { border-radius: 8px; }
    .rdp-head_cell { font-weight: 500; color: #6b7280; }
  `;

  return (
    <div>
      <style>{dayPickerStyles}</style>

      {step === "selection" && (
        <>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 mr-4">
              <div className="bg-blue-100 p-2 rounded-full">
                <CalendarPlus className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Nova Solicitação de Atendimento</h2>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:gap-8">
            <div className="flex items-start justify-center h-[360px]">
              {isLoadingSlots ? (
                <div className="flex items-center justify-center w-full h-full">
                  <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                </div>
              ) : slotsError ? (
                <div className="flex items-center justify-center w-full h-full text-red-600 text-sm p-4 text-center">{slotsError}</div>
              ) : (
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDaySelect}
                  month={month}
                  onMonthChange={setMonth}
                  locale={ptBR}
                  disabled={[
                    { before: new Date() },
                    (date) => date.getDay() === 0 || date.getDay() === 6,
                    (date) => !availableDaysSet.has(formatDateKey(date))
                  ]}
                />
              )}
            </div>
            <div className="w-full sm:w-48 flex flex-col h-[360px] mt-4 sm:mt-0 sm:border-l border-gray-200 sm:pl-8">
              <h3 className="font-semibold text-gray-700 mb-4 flex-shrink-0">
                {selectedDate ? `Horários disponíveis` : "Selecione um dia"}
              </h3>
              <div className="flex-1 min-h-0 overflow-y-auto pr-2">
                {selectedDate && (
                  <div className="grid grid-cols-3 sm:grid-cols-2 gap-2">
                    {availableTimes.length > 0 ? availableTimes.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`p-2 rounded-md border text-sm transition-colors ${
                          selectedTimeSlot?.id === slot.id
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        {slot.time}
                      </button>
                    )) : <p className="col-span-full text-sm text-gray-500">Nenhum horário disponível para este dia.</p>}
                  </div>
                )}
              </div>
              <div className="mt-auto pt-4 flex-shrink-0">
                <button
                  onClick={handleSubmit}
                  disabled={!selectedTimeSlot || isSubmitting}
                  className="w-full h-10 py-2 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {isSubmitting ? "Enviando..." : "Enviar Solicitação"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {step === "success" && (
        <div className="max-w-sm text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 text-green-600 p-3 rounded-full">
              <CheckCircle size={32} />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Solicitação Enviada!</h2>
          <p className="text-gray-600 my-4 text-sm">
            O psicólogo irá analisar seu pedido. Você será notificado sobre a confirmação em "Meus Atendimentos".
          </p>
          <button
            onClick={onClose}
            className="mt-2 h-10 px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Entendido
          </button>
        </div>
      )}
    </div>
  );
}