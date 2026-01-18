import { useState, useMemo } from 'react';

// Tipos auxiliares
type SelectionType = "single" | "interval";
type IntervalPhase = "none" | "selecting-start" | "selecting-end";

interface UseScheduleFlowProps {
  availability: Record<string, string[]>;
  onSaveAvailability?: (newlyAdded: Record<string, string[]>) => Promise<void>;
  onBlockDay?: (dayToBlock: Date) => Promise<void>;
  onShowToast?: (message: string) => void;
}

export function useScheduleFlow({
  availability,
  onSaveAvailability,
  onBlockDay,
  onShowToast
}: UseScheduleFlowProps) {
  // Estados de Interface
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isTimePanelOpen, setIsTimePanelOpen] = useState(false);
  const [selectedDayForDetail, setSelectedDayForDetail] = useState<Date | null>(null);

  // Estados de Seleção
  const [pendingSelectedDays, setPendingSelectedDays] = useState<Date[]>([]);
  const [selectionType, setSelectionType] = useState<SelectionType>("single");
  const [intervalPhase, setIntervalPhase] = useState<IntervalPhase>("none");
  const [startDate, setStartDate] = useState<Date | null>(null);
  
  // Novo Estado para Feedback Visual (Hover)
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const formatDateKey = (date: Date) => date.toISOString().split("T")[0];

  // --- Lógica de Intervalo ---
  const calculateInterval = (start: Date, end: Date) => {
    const s = start.getTime();
    const e = end.getTime();
    const days: Date[] = [];
    const minDate = new Date(Math.min(s, e));
    const maxDate = new Date(Math.max(s, e));

    for (let d = new Date(minDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      const currentDayKey = formatDateKey(d);
      const isAlreadyAvailable = (availability[currentDayKey] || []).length > 0;
      
      // Ignora FDS e dias já disponíveis
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isAlreadyAvailable) {
        days.push(new Date(d));
      }
    }
    return days;
  };

  // --- Handlers ---

  const handleDayClick = (day: Date) => {
    if (isSelectionMode) return;
    
    // Abre detalhe se tiver disponibilidade ou eventos (lógica mantida)
    // Nota: A verificação de eventos deve ser feita na UI ou passada pra cá se necessário
    // Por simplificação, assumimos que o clique abre o detalhe se o dia for válido
    const dayKey = formatDateKey(day);
    const isAvailable = (availability[dayKey] || []).length > 0;
    
    // Permitimos abrir para bloquear mesmo sem horário, ou apenas se tiver horário
    // Ajuste conforme sua regra de negócio. Aqui mantive a lógica original de "checar disponibilidade"
    if (isAvailable) {
        setSelectedDayForDetail(day);
    } else {
        // Se for para bloquear dia vazio, talvez precise abrir também? 
        // Mantendo comportamento original:
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
        const newSelectedDays = calculateInterval(startDate, day);
        setPendingSelectedDays(newSelectedDays);
        setIntervalPhase("none");
        setStartDate(null); // Reseta start após selecionar
      }
    }
  };

  // Calcula dias "preview" enquanto passa o mouse
  const previewDays = useMemo(() => {
    if (selectionType === "interval" && intervalPhase === "selecting-end" && startDate && hoveredDay) {
      return calculateInterval(startDate, hoveredDay);
    }
    return [];
  }, [selectionType, intervalPhase, startDate, hoveredDay, availability]); // Dependência de availability para filtrar corretamente

  const handleDayHover = (day: Date) => {
    if (isSelectionMode && intervalPhase === "selecting-end") {
        setHoveredDay(day);
    }
  };

  const handleFinalSave = async (newlyAddedAvailability: Record<string, string[]>) => {
    if (onSaveAvailability) {
      await onSaveAvailability(newlyAddedAvailability);
      onShowToast?.("Novos horários disponibilizados!");
    }
    setPendingSelectedDays([]);
    setIsTimePanelOpen(false);
    setIsSelectionMode(false); // Sai do modo seleção ao salvar
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
  
  const resetSelection = () => {
    setIsSelectionMode(false);
    setPendingSelectedDays([]);
    setStartDate(null);
    setIntervalPhase("none");
    setHoveredDay(null);
  };

  const toggleSelectionMode = () => {
      if (isSelectionMode) {
          resetSelection();
      } else {
          setIsSelectionMode(true);
      }
  };

  return {
    // State
    isSelectionMode,
    isTimePanelOpen,
    selectedDayForDetail,
    pendingSelectedDays,
    selectionType,
    intervalPhase,
    previewDays, // Array de dias para pintar de "Azul Claro" no hover
    
    // Setters diretos (quando necessário)
    setIsTimePanelOpen,
    setSelectedDayForDetail,
    setSelectionType,
    setStartDate,
    setPendingSelectedDays,
    setIntervalPhase,

    // Actions
    handleDayClick,
    handlePendingDaySelect,
    handleDayHover, // Novo handler para o componente de calendário
    handleFinalSave,
    handleBlockDay,
    handleEditDay,
    resetSelection,
    toggleSelectionMode,
    closePanels: () => {
        setIsTimePanelOpen(false);
        setSelectedDayForDetail(null);
        resetSelection();
    }
  };
}