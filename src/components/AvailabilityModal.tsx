// src/components/AvailabilityModal.tsx
"use client";

import { useState } from "react"; 
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { ptBR } from "date-fns/locale";
import { X, Info } from "lucide-react"; 
import { useToast } from "../contexts/ToastProvider";

// Horários que o psicólogo pode disponibilizar
const availableHours = [
  "08:00", "09:00", "10:00", "11:00",
  "13:30", "14:30", "15:30", "16:30",
];

interface AvailabilityModalProps {
  onClose: () => void;
  onSave: (availability: Record<string, string[]>) => void;
  initialAvailability?: Record<string, string[]>;
}

export function AvailabilityModal({ onClose, onSave, initialAvailability = {} }: AvailabilityModalProps) {
  const { showToast } = useToast();
  const [selectedDays, setSelectedDays] = useState<Date[]>([]);

  // Inicializa o estado com a disponibilidade existente
  const [selectedTimes, setSelectedTimes] = useState<Record<string, Set<string>>>(() => {
    const initialState: Record<string, Set<string>> = {};
    for (const date in initialAvailability) {
      initialState[date] = new Set(initialAvailability[date]);
    }
    return initialState;
  });

  const handleDaySelect = (days: Date[] | undefined) => {
    setSelectedDays(days || []);
  };

  const handleTimeToggle = (day: Date, time: string) => {
    const dateString = day.toISOString().split('T')[0];
    const newTimes = { ...selectedTimes };
    
    if (!newTimes[dateString]) {
      newTimes[dateString] = new Set();
    }

    if (newTimes[dateString].has(time)) {
      newTimes[dateString].delete(time);
    } else {
      newTimes[dateString].add(time);
    }
    
    setSelectedTimes(newTimes);
  };

  const handleSaveClick = () => {
    try {
      const availabilityToSave: Record<string, string[]> = {};
      let hasSlots = false;

      for (const date in selectedTimes) {
        if (selectedTimes[date].size > 0) {
          availabilityToSave[date] = Array.from(selectedTimes[date]);
          hasSlots = true;
        }
      }

      onSave(availabilityToSave);
      
      // Feedback visual
      if (hasSlots) {
        showToast("Horários de disponibilidade salvos com sucesso!", "success");
      } else {
        showToast("Agenda limpa. Nenhum horário disponível definido.", "info");
      }
      
      onClose();
    } catch (error) {
      console.error(error);
      showToast("Erro ao salvar disponibilidade.", "error");
    }
  };
  
  const dayPickerStyles = `
    .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #eff6ff; }
    .rdp-day_selected { background-color: #2563eb !important; color: white !important; border-radius: 8px; }
    .rdp-button { border-radius: 8px; }
  `;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-in fade-in">
      <style>{dayPickerStyles}</style>
      <div className="bg-white rounded-xl shadow-2xl p-6 w-auto max-w-3xl transform transition-all scale-100">
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Gerenciar Agenda</h2>
            <p className="text-sm text-gray-500">Selecione os dias e horários que você atenderá.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Coluna 1: Calendário */}
          <div className="flex items-start justify-center">
            <DayPicker
              mode="multiple"
              min={0}
              selected={selectedDays}
              onSelect={handleDaySelect}
              locale={ptBR}
              disabled={[
                { before: new Date() }, 
                (date) => date.getDay() === 0 || date.getDay() === 6
              ]}
              className="border border-gray-100 rounded-lg p-4 bg-gray-50/50"
            />
          </div>
          
          {/* Coluna 2: Horários */}
          <div className="w-full md:w-64 border-l border-gray-200 pl-0 md:pl-8 pt-4 md:pt-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-700">Horários do dia</h3>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                {selectedDays.length} dia(s) selecionado(s)
              </span>
            </div>

            {selectedDays.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-center border-2 border-dashed border-gray-200 rounded-lg p-4">
                <Info size={24} className="mb-2 opacity-50" />
                <p className="text-sm">Selecione um ou mais dias no calendário para editar os horários.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-left-2 duration-300">
                {availableHours.map(time => {
                  const isSelectedInSome = selectedDays.some(day => 
                    selectedTimes[day.toISOString().split('T')[0]]?.has(time)
                  );
                  
                  return (
                    <button
                      key={time}
                      onClick={() => selectedDays.forEach(day => handleTimeToggle(day, time))}
                      className={`
                        p-2 rounded-md border text-sm transition-all duration-200
                        ${isSelectedInSome 
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm" 
                          : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"}
                      `}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="h-10 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveClick}
            className="h-10 px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 shadow-sm hover:shadow transition-all"
          >
            Salvar Disponibilidade
          </button>
        </div>
      </div>
    </div>
  );
}