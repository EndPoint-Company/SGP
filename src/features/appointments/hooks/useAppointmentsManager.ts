import { useState, useMemo } from "react";
import { useProcessedAppointments } from "./useProcessedAppointments";
import { updateConsultaStatus } from "../services/appointmentService";
import { CalendarDays, RefreshCw, X, Check } from "lucide-react";

export function useAppointmentsManager(userId: string, userRole: "aluno" | "psicologo") {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>(
    userRole === "psicologo" ? "solicitacoes" : "agendados"
  );

  const { consultas, isLoading, error, refetch } = useProcessedAppointments(userId, userRole);

  const handleUpdateStatus = async (id: string, status: "confirmada" | "cancelada") => {
    try {
      await updateConsultaStatus(id, status);
      refetch();
    } catch (updateError) {
      console.error("Falha ao atualizar status:", updateError);
    }
  };

  const tabs = useMemo(() => {
    const commonTabs = [
        { id: "solicitacoes", label: "Solicitações", icon: RefreshCw },
        { id: "agendados", label: "Agendados", icon: Check },
        { id: "cancelados", label: "Cancelados", icon: X },
        { id: "passados", label: "Passados", icon: CalendarDays },
    ];
    return commonTabs; // Neste caso são iguais, mas poderiam ser diferentes por role
  }, []);

  const filteredData = useMemo(() => {
    if (!Array.isArray(consultas)) return [];
    
    const now = new Date();
    let dataToFilter = consultas;

    switch (activeTab) {
      case 'solicitacoes':
        dataToFilter = consultas.filter(item => item.status === 'aguardando aprovacao');
        break;
      case 'agendados':
        dataToFilter = consultas.filter(item => item.status === 'confirmada');
        break;
      case 'cancelados':
        dataToFilter = consultas.filter(item => item.status === 'cancelada');
        break;
      case 'passados':
        dataToFilter = consultas.filter(item => new Date(item.inicio) < now && item.status !== 'cancelada');
        break;
      default:
        dataToFilter = [];
        break;
    }

    if (search) {
      return dataToFilter.filter(item =>
        item.participantName.toLowerCase().includes(search.toLowerCase())
      );
    }

    return dataToFilter;
  }, [activeTab, search, consultas]);

  return {
    search,
    setSearch,
    activeTab,
    setActiveTab,
    tabs,
    filteredData,
    isLoading,
    error,
    updateStatus: handleUpdateStatus
  };
}