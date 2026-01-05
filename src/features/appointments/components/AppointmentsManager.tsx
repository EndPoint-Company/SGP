// src/features/appointments/components/AppointmentsManager.tsx

import React, { useState, useMemo } from "react";
import RequestCard from "./RequestCard";
import AppointmentCard from "./AppointmentCard";
import { Input } from "../../../components/ui/input";
import { CalendarDays, RefreshCw, X, Check } from "lucide-react";
import { useAppointments } from "../hooks/useAppointments";
import { useProcessedAppointments } from "../hooks/useProcessedAppointments";

interface AppointmentsManagerProps {
  userId: string;
  userRole: "aluno" | "psicologo";
}

export default function AppointmentsManager({ userId, userRole }: AppointmentsManagerProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>(
    userRole === "psicologo" ? "solicitacoes" : "agendados"
  );

  // Utilizamos o hook de ações globais e o de processamento de UI
  const { updateStatus } = useAppointments();
  const { consultas, isLoading, error } = useProcessedAppointments(userId, userRole);

  const tabs = [
    { id: "solicitacoes", label: "Solicitações", icon: RefreshCw },
    { id: "agendados", label: "Agendados", icon: Check },
    { id: "cancelados", label: "Cancelados", icon: X },
    { id: "passados", label: "Passados", icon: CalendarDays },
  ];

  const filteredData = useMemo(() => {
    if (!Array.isArray(consultas)) return [];
    const now = new Date();

    let filtered = consultas.filter(item => {
      switch (activeTab) {
        case 'solicitacoes': return item.status === 'aguardando aprovacao';
        case 'agendados': return item.status === 'confirmada';
        case 'cancelados': return item.status === 'cancelada';
        case 'passados': return new Date(item.inicio) < now && item.status !== 'cancelada';
        default: return false;
      }
    });

    if (search) {
      filtered = filtered.filter(item =>
        item.participantName.toLowerCase().includes(search.toLowerCase())
      );
    }
    return filtered;
  }, [activeTab, search, consultas]);

  if (isLoading) return <div className="text-center p-8 text-gray-500">A carregar agendamentos...</div>;
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Meus Agendamentos</h1>

      {/* Tabs de Navegação */}
      <div className="flex items-center gap-6 border-b border-gray-200 mb-6 text-sm">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 pb-3 transition-all ${
              activeTab === id
                ? "text-blue-600 font-semibold border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <Input
          placeholder={`Pesquisar por ${userRole === "psicologo" ? "aluno" : "psicólogo"}...`}
          className="max-w-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
            activeTab === "solicitacoes" && userRole === "psicologo" ? (
              <RequestCard
                key={item.id}
                {...item}
                name={item.participantName}
                role="Paciente"
                avatarUrl={item.participantAvatarUrl}
                onAccept={() => updateStatus(item.id, "confirmada")}
                onReject={() => updateStatus(item.id, "cancelada")}
              />
            ) : (
              <AppointmentCard
                key={item.id}
                {...item}
                name={item.participantName}
                role={userRole === 'aluno' ? 'Psicólogo(a)' : 'Paciente'}
                avatarUrl={item.participantAvatarUrl}
                onCancel={
                  (activeTab === "agendados" || (activeTab === "solicitacoes" && userRole === "aluno"))
                    ? () => updateStatus(item.id, "cancelada")
                    : undefined
                }
              />
            )
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500">Nenhum agendamento encontrado nesta categoria.</p>
          </div>
        )}
      </div>
    </div>
  );
}