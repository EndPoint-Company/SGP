// src/features/schedule/components/ScheduleManager.tsx

import React, { useState, useMemo } from "react";
import { ContinuousCalendar } from "../../../components/ui/calender/ContinuousCalendar";
import { TimeSelectionPanel } from "../../../components/ui/calender/TimeSelectionPanel";
import { DayDetailPanel } from "../../../components/ui/calender/DayDetailPanel";
import { CalendarCheck, X, Check, ArrowRightLeft } from "lucide-react";
import type { Consulta, ConsultaStatus } from "../../appointments/types";

type ProcessedConsulta = Consulta & {
  participantName: string;
};

type ChildComponentStatus = 'aguardando aprovacao' | 'confirmada' | 'cancelada' | 'passada';

interface ScheduleManagerProps {
  userRole: "aluno" | "psicologo";
  currentUserId: string;
  consultas: ProcessedConsulta[];
  availability: Record<string, string[]>;
  onSaveAvailability?: (newlyAdded: Record<string, string[]>) => Promise<void>;
  onBlockDay?: (dayToBlock: Date) => Promise<void>;
  onShowToast?: (message: string) => void;
}

export default function ScheduleManager({
  userRole,
  currentUserId,
  consultas,
  availability,
  onSaveAvailability,
  onBlockDay,
  onShowToast,
}: ScheduleManagerProps) {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [pendingSelectedDays, setPendingSelectedDays] = useState<Date[]>([]);
  const [isTimePanelOpen, setIsTimePanelOpen] = useState(false);
  const [selectedDayForDetail, setSelectedDayForDetail] = useState<Date | null>(null);
  const [selectionType, setSelectionType] = useState<"single" | "interval">("single");
  const [intervalPhase, setIntervalPhase] = useState<"none" | "selecting-start" | "selecting-end">("none");
  const [startDate, setStartDate] = useState<Date | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ✅ CORREÇÃO 1: A chave da data agora é formatada usando a data local.
  // Isso impede que a data mude para o dia anterior devido ao fuso horário.
  const formatDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleDayClick = (day: Date) => {
    if (isSelectionMode) return;
    const dayKey = formatDateKey(day);
    const isAvailable = (availability[dayKey] || []).length > 0;
    const hasEvents = consultas.some(
      (event) => formatDateKey(new Date(event.inicio)) === dayKey
    );
    if (isAvailable || hasEvents) {
      setSelectedDayForDetail(day);
    }
  };

  const handlePendingDaySelect = (day: Date) => {
    if (day < today) return;
    const dayKey = formatDateKey(day);
    if ((availability[dayKey] || []).length > 0) return;

    if (selectionType === "single") {
      const existingIndex = pendingSelectedDays.findIndex((d) => d.getTime() === day.getTime());
      if (existingIndex > -1) {
        setPendingSelectedDays(pendingSelectedDays.filter((_, index) => index !== existingIndex));
      } else {
        setPendingSelectedDays([...pendingSelectedDays, day]);
      }
    } else if (selectionType === "interval") {
      if (intervalPhase === "selecting-start") {
        setStartDate(day);
        setPendingSelectedDays([day]);
        setIntervalPhase("selecting-end");
      } else if (intervalPhase === "selecting-end" && startDate) {
        const start = startDate.getTime();
        const end = day.getTime();
        const newSelectedDays: Date[] = [];
        const minDate = new Date(Math.min(start, end));
        const maxDate = new Date(Math.max(start, end));

        for (let d = new Date(minDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
          const dayOfWeek = d.getDay();
          const currentDayKey = formatDateKey(d);
          const isAlreadyAvailable = (availability[currentDayKey] || []).length > 0;
          if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isAlreadyAvailable) {
            newSelectedDays.push(new Date(d));
          }
        }
        setPendingSelectedDays(newSelectedDays);
        setIntervalPhase("none");
      }
    }
  };

  // ✅ CORREÇÃO 2: Ajusta cada horário para frente em 3 horas antes de salvar.
  // Isso converte o horário local para UTC, mantendo a data correta.
  const handleFinalSave = async (newlyAddedAvailability: Record<string, string[]>) => {
    const availabilityToSave: Record<string, string[]> = {};

    for (const dateKey in newlyAddedAvailability) {
      availabilityToSave[dateKey] = newlyAddedAvailability[dateKey].map(time => {
        const [hours, minutes] = time.split(':').map(Number);
        
        // Cria um objeto Date com a data e hora locais corretas
        const localDate = new Date(dateKey);
        localDate.setHours(hours, minutes);

        // Adiciona 3 horas para converter para UTC
        localDate.setHours(localDate.getHours() + 3);

        // Formata o novo horário de volta para o formato HH:mm
        const newHours = localDate.getHours().toString().padStart(2, '0');
        const newMinutes = localDate.getMinutes().toString().padStart(2, '0');
        
        return `${newHours}:${newMinutes}`;
      });
    }

    if (onSaveAvailability) {
      await onSaveAvailability(availabilityToSave);
      onShowToast?.("Novos horários disponibilizados!");
    }
    setPendingSelectedDays([]);
    setIsTimePanelOpen(false);
  };

  const handleBlockDay = async (dayToBlock: Date) => {
    if (onBlockDay) {
      await onBlockDay(dayToBlock);
      onShowToast?.("Dia bloqueado com sucesso!");
    }
    setSelectedDayForDetail(null);
  };

  const handleEditDay = () => {
    if (!selectedDayForDetail) return;
    setPendingSelectedDays([selectedDayForDetail]);
    setSelectedDayForDetail(null);
    setIsTimePanelOpen(true);
  };
  
  const handleCloseTimePanel = () => {
    setIsTimePanelOpen(false);
    setPendingSelectedDays([]);
    setStartDate(null);
    setIntervalPhase("none");
  };

  const getInstructionText = () => {
    if (selectionType === "interval") {
      if (intervalPhase === "selecting-start") return "Selecione o dia de início";
      if (intervalPhase === "selecting-end") return "Selecione o dia de fim";
    }
    return `${pendingSelectedDays.length} dias selecionados`;
  };

  const isSidebarOpen = isTimePanelOpen || !!selectedDayForDetail;
  const calendarRole = userRole === 'aluno' ? 'aluno' : 'psicologo';

  const calendarEvents = useMemo(() => {
    return consultas.map(c => ({ 
        ...c,
        horario: c.inicio,
        pacienteId: c.alunoId, 
        status: c.status,
      }));
  }, [consultas]);

  const detailPanelEvents = useMemo(() => {
    if (!selectedDayForDetail) return [];
    
    const mapStatus = (status: ConsultaStatus): ChildComponentStatus => {
        if (status === 'concluida') return 'passada';
        if (status === 'aguardando aprovacao') return 'aguardando aprovacao';
        return status as ChildComponentStatus;
    }

    return consultas
      .filter(c => formatDateKey(new Date(c.inicio)) === formatDateKey(selectedDayForDetail))
      .map(c => ({
        ...c,
        title: `Consulta com ${c.participantName}`,
        start: c.inicio,
        status: mapStatus(c.status),
      }));
  }, [consultas, selectedDayForDetail]);

  return (
    <div className="relative h-full w-full flex flex-row overflow-hidden rounded-2xl">
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <div className="flex-1 min-h-0">
          <ContinuousCalendar
            role={calendarRole}
            events={calendarEvents}
            availability={availability}
            isSelectionMode={isSelectionMode}
            selectedPendingDays={pendingSelectedDays}
            viewingDay={selectedDayForDetail}
            onDayClick={handleDayClick}
            onPendingDaySelect={handlePendingDaySelect}
            className={isSidebarOpen ? "rounded-tr-none" : "rounded-tr-2xl"}
            currentUserId={currentUserId}
          />
        </div>

        {userRole === "psicologo" && (
          <div className={`flex-shrink-0 bg-white p-4 border-t border-gray-200 flex justify-between items-center rounded-bl-2xl ${isSidebarOpen ? "rounded-br-none" : "rounded-br-2xl"}`}>
            {isSelectionMode ? (
              <>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-600">{getInstructionText()}</span>
                  <button onClick={() => { setSelectionType((prev) => prev === "single" ? "interval" : "single"); setIntervalPhase("selecting-start"); setPendingSelectedDays([]); setStartDate(null); }} className="inline-flex items-center justify-center h-10 px-4 rounded-md bg-white text-gray-800 border border-gray-300 text-sm font-medium hover:bg-gray-50">
                    <ArrowRightLeft size={14} className="mr-2" />
                    {selectionType === "single" ? "Selecionar Intervalo" : "Selecionar um a um"}
                  </button>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setIsSelectionMode(false); setPendingSelectedDays([]); setStartDate(null); setIntervalPhase("none"); }} className="inline-flex items-center justify-center h-10 px-4 py-2 rounded-md bg-white text-gray-800 border border-gray-300 text-sm font-medium hover:bg-gray-50">
                    <X className="w-4 h-4 mr-2" /> Cancelar
                  </button>
                  <button onClick={() => { if (pendingSelectedDays.length > 0) setIsTimePanelOpen(true); setIsSelectionMode(false); }} disabled={pendingSelectedDays.length === 0} className="inline-flex items-center justify-center h-10 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300">
                    <Check className="w-4 h-4 mr-2" /> Próximo
                  </button>
                </div>
              </>
            ) : (
              <div className="w-full flex justify-end">
                <button onClick={() => setIsSelectionMode(true)} className="inline-flex items-center justify-center h-10 px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
                  <CalendarCheck className="w-4 h-4 mr-2" /> Disponibilizar Datas
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isTimePanelOpen && (
        <TimeSelectionPanel
          selectedDays={pendingSelectedDays}
          onClose={handleCloseTimePanel}
          onSave={handleFinalSave}
          initialAvailability={availability}
        />
      )}

      {selectedDayForDetail && (
        <DayDetailPanel
          userRole={userRole}
          day={selectedDayForDetail}
          availabilityForDay={availability[formatDateKey(selectedDayForDetail)] || []}
          eventsForDay={detailPanelEvents}
          onClose={() => setSelectedDayForDetail(null)}
          onEdit={handleEditDay}
          onBlockDay={handleBlockDay}
        />
      )}
    </div>
  );
}