"use client";

import React from "react";
import { X } from "lucide-react";

const availableHours = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "13:30",
  "14:30",
  "15:30",
  "16:30",
];

interface TimeSelectionPanelProps {
  selectedDays: Date[];
  onClose: () => void;
  onSave: (availability: Record<string, string[]>) => void;
  initialAvailability?: Record<string, string[]>;
}

// ✅ NOVA FUNÇÃO AUXILIAR
const formatDateToYYYYMMDD = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function TimeSelectionPanel({
  selectedDays,
  onClose,
  onSave,
  initialAvailability,
}: TimeSelectionPanelProps) {
  const [selectedTimes, setSelectedTimes] = React.useState<
    Record<string, Set<string>>
  >(() => {
    const initialState: Record<string, Set<string>> = {};
    const isEditMode = selectedDays.length === 1 && initialAvailability;

    if (isEditMode) {
      // ✅ CORREÇÃO APLICADA AQUI
      const dayToEditString = formatDateToYYYYMMDD(selectedDays[0]);
      const existingTimes = initialAvailability[dayToEditString] || [];
      initialState[dayToEditString] = new Set(existingTimes);
    } else {
      selectedDays.forEach((day) => {
        // ✅ CORREÇÃO APLICADA AQUI
        const dateString = formatDateToYYYYMMDD(day);
        initialState[dateString] = new Set(availableHours);
      });
    }

    return initialState;
  });

  const [activeDay, setActiveDay] = React.useState<string | "all">(() => {
    // ✅ CORREÇÃO APLICADA AQUI
    return selectedDays.length === 1
      ? formatDateToYYYYMMDD(selectedDays[0])
      : "all";
  });

  const handleTimeToggle = (time: string) => {
    const activeTimes =
      selectedTimes[
        activeDay === "all" ? Object.keys(selectedTimes)[0] : activeDay
      ];
    const isTryingToDeselectLast =
      activeTimes?.has(time) && activeTimes.size === 1;
    const newTimes = { ...selectedTimes };

    if (isTryingToDeselectLast) {
      return;
    }

    if (activeDay === "all") {
      const isCurrentlySelected = Array.from(
        newTimes[Object.keys(newTimes)[0]] || []
      ).includes(time);
      Object.keys(newTimes).forEach((dateString) => {
        if (isCurrentlySelected) {
          newTimes[dateString].delete(time);
        } else {
          newTimes[dateString].add(time);
        }
      });
    } else {
      if (newTimes[activeDay]?.has(time)) {
        newTimes[activeDay].delete(time);
      } else {
        newTimes[activeDay]?.add(time);
      }
    }
    setSelectedTimes(newTimes);
  };

  const handleSaveClick = () => {
    const availabilityToSave: Record<string, string[]> = {};
    for (const date in selectedTimes) {
      availabilityToSave[date] = Array.from(selectedTimes[date]).sort();
    }
    onSave(availabilityToSave);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
    }).format(date);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">
            Definir Horários Disponíveis
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Edite os horários para:
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedDays.length > 1 && (
                <button
                  onClick={() => setActiveDay("all")}
                  className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    activeDay === "all"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  Todos os dias
                </button>
              )}
              {selectedDays.map((day) => {
                // ✅ CORREÇÃO APLICADA AQUI
                const dateString = formatDateToYYYYMMDD(day);
                return (
                  <button
                    key={dateString}
                    onClick={() => setActiveDay(dateString)}
                    className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                      activeDay === dateString
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    {formatDate(day)}
                  </button>
                );
              })}
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Clique para{" "}
            {activeDay === "all"
              ? "adicionar ou remover um horário de todos os dias selecionados."
              : "desmarcar um horário."}
          </p>
          <div className="grid grid-cols-4 gap-3">
            {availableHours.map((time) => {
              const dateKey =
                activeDay === "all" ? Object.keys(selectedTimes)[0] : activeDay;
              const isSelected = selectedTimes[dateKey]?.has(time) || false;

              return (
                <button
                  key={time}
                  onClick={() => handleTimeToggle(time)}
                  className={`p-2 rounded-md border text-sm transition-colors ${
                    isSelected
                      ? "bg-blue-100 text-blue-800 border-blue-200"
                      : "bg-gray-50 text-gray-500 hover:border-gray-400"
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 rounded-b-xl">
          <button
            onClick={onClose}
            className="h-10 px-4 py-2 bg-white text-gray-800 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveClick}
            className="h-10 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Confirmar e Salvar
          </button>
        </div>
      </div>
    </div>
  );
}