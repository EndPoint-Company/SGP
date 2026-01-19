import React from "react";
import RequestCard from "./RequestCard";
import AppointmentCard from "./AppointmentCard";
import { Input } from "../../../components/ui/input";
import { useAppointmentsManager } from "../hooks/useAppointmentsManager"; // Novo Hook

interface AppointmentsManagerProps {
  userId: string;
  userRole: "aluno" | "psicologo";
}

export default function AppointmentsManager({ userId, userRole }: AppointmentsManagerProps) {
  // Lógica delegada ao Hook
  const {
    search,
    setSearch,
    activeTab,
    setActiveTab,
    tabs,
    filteredData,
    isLoading,
    error,
    updateStatus
  } = useAppointmentsManager(userId, userRole);

  if (isLoading) {
    return <div className="text-center p-8 text-gray-500">A carregar agendamentos...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">{error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Agendamentos</h1>

      <div className="flex items-center gap-6 border-b border-gray-200 mb-4 text-sm">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 pb-2 transition-colors ${
              activeTab === id
                ? "text-blue-600 font-medium border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap md:flex-nowrap md:items-center justify-between gap-4 mb-6">
        <Input
          placeholder={`Pesquisar por nome do ${userRole === "psicologo" ? "aluno" : "psicólogo"}`}
          className="max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-4 flex-wrap">
        {filteredData.length > 0 ? (
          filteredData.map((item) =>
            activeTab === "solicitacoes" && userRole === "psicologo" ? (
              <RequestCard
                key={item.id}
                name={item.participantName}
                role={'Paciente'}
                date={item.date}
                time={item.time}
                avatarUrl={item.participantAvatarUrl}
                onAccept={() => updateStatus(item.id, "confirmada")}
                onReject={() => updateStatus(item.id, "cancelada")}
              />
            ) : (
              <AppointmentCard
                key={item.id}
                name={item.participantName}
                role={userRole === 'aluno' ? 'Psicólogo(a)' : 'Paciente'}
                date={item.date}
                time={item.time}
                status={item.status}
                avatarUrl={item.participantAvatarUrl || ""}
                onCancel={
                  (activeTab === "agendados" || (activeTab === "solicitacoes" && userRole === "aluno"))
                    ? () => updateStatus(item.id, "cancelada")
                    : undefined
                }
              />
            )
          )
        ) : (
          <div className="w-full text-center py-8">
            <p className="text-gray-500">Nenhum item encontrado nesta categoria.</p>
          </div>
        )}
      </div>
    </div>
  );
}