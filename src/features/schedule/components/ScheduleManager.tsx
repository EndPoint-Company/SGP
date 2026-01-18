import React, { useMemo } from "react";
import { ContinuousCalendar } from "../../../components/ui/calender/ContinuousCalendar";
import { TimeSelectionPanel } from "../../../components/ui/calender/TimeSelectionPanel";
import { DayDetailPanel } from "../../../components/ui/calender/DayDetailPanel";
import { CalendarCheck, X, Check, ArrowRightLeft } from "lucide-react";
import type { Consulta, ConsultaStatus } from "../../appointments/types";
import { useScheduleFlow } from "../hooks/useScheduleFlow";

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
  
  const {
    isSelectionMode,
    isTimePanelOpen,
    selectedDayForDetail,
    pendingSelectedDays,
    selectionType,
    intervalPhase,
    previewDays,
    setIsTimePanelOpen,
    setSelectedDayForDetail,
    setSelectionType,
    setStartDate,
    setPendingSelectedDays,
    setIntervalPhase,
    handleDayClick,
    handlePendingDaySelect,
    handleDayHover,
    handleFinalSave,
    handleBlockDay,
    handleEditDay,
    resetSelection,
    toggleSelectionMode,
    closePanels
  } = useScheduleFlow({ availability, onSaveAvailability, onBlockDay, onShowToast });

  const formatDateKey = (date: Date) => date.toISOString().split("T")[0];
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

  const getInstructionText = () => {
    if (selectionType === "interval") {
      if (intervalPhase === "selecting-start") return "Clique no dia de início";
      if (intervalPhase === "selecting-end") return "Clique no dia de fim";
    }
    return `${pendingSelectedDays.length} dias selecionados`;
  };

  const isModalOpen = isTimePanelOpen || !!selectedDayForDetail;

  return (
    <div className="relative h-full w-full bg-gray-50 overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
      
      {/* 1. CALENDÁRIO */}
      <div className="w-full h-full">
        <ContinuousCalendar
          role={calendarRole}
          events={calendarEvents}
          availability={availability}
          isSelectionMode={isSelectionMode}
          selectedPendingDays={pendingSelectedDays}
          previewDays={previewDays} 
          viewingDay={selectedDayForDetail}
          onDayClick={handleDayClick}
          onPendingDaySelect={handlePendingDaySelect}
          onDayHover={handleDayHover} 
          className="h-full w-full !rounded-2xl"
          currentUserId={currentUserId}
        />
      </div>

      {/* 2. BARRA DE AÇÕES FLUTUANTE */}
      {userRole === "psicologo" && !isModalOpen && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-xl rounded-full px-2 py-2 flex items-center gap-3 transition-all duration-300">
            
            {!isSelectionMode ? (
               <button 
                 onClick={toggleSelectionMode} 
                 className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors shadow-md"
               >
                 <CalendarCheck className="w-5 h-5" />
                 <span>Disponibilizar Datas</span>
               </button>
            ) : (
              <>
                <div className="px-4 text-sm font-semibold text-gray-700 border-r border-gray-300 pr-4">
                  {getInstructionText()}
                </div>

                <button 
                  onClick={() => { 
                      setSelectionType((prev) => prev === "single" ? "interval" : "single"); 
                      setIntervalPhase("selecting-start"); 
                      setPendingSelectedDays([]); 
                      setStartDate(null); 
                  }} 
                  className="p-3 text-gray-600 hover:bg-gray-100 rounded-full tooltip-trigger"
                  title={selectionType === "single" ? "Mudar para Seleção de Intervalo" : "Mudar para Seleção Única"}
                >
                  <ArrowRightLeft size={20} />
                </button>

                <button 
                  onClick={resetSelection} 
                  className="p-3 text-red-600 hover:bg-red-50 rounded-full"
                  title="Cancelar"
                >
                  <X size={20} />
                </button>

                <button 
                  onClick={() => { if (pendingSelectedDays.length > 0) setIsTimePanelOpen(true); }} 
                  disabled={pendingSelectedDays.length === 0} 
                  className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-full font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Check className="w-5 h-5" />
                  <span>Confirmar</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 3. BACKDROP */}
      {isModalOpen && (
        <div 
            className="absolute inset-0 bg-white/30 backdrop-blur-sm z-[60] transition-opacity animate-in fade-in"
            onClick={closePanels}
        />
      )}

      {/* 4. MODAL DE SELEÇÃO DE HORAS */}
      {isTimePanelOpen && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center pointer-events-none p-4">
          {/* CORREÇÃO: 'w-fit' para ajustar ao tamanho do conteúdo e evitar barra branca */}
          <div className="w-fit max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
            <TimeSelectionPanel
              selectedDays={pendingSelectedDays}
              onClose={() => setIsTimePanelOpen(false)}
              onSave={handleFinalSave}
              initialAvailability={availability}
            />
          </div>
        </div>
      )}

      {/* 5. MODAL DE DETALHES DO DIA */}
      {selectedDayForDetail && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center pointer-events-none p-4">
          {/* CORREÇÃO: 'w-fit' aqui também */}
          <div className="w-fit max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
            <DayDetailPanel
              userRole={userRole}
              day={selectedDayForDetail}
              availabilityForDay={availability[formatDateKey(selectedDayForDetail)] || []}
              eventsForDay={detailPanelEvents}
              onClose={() => setSelectedDayForDetail(null)}
              onEdit={handleEditDay}
              onBlockDay={handleBlockDay}
            />
          </div>
        </div>
      )}

    </div>
  );
}