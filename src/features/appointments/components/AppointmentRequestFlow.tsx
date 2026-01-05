import React, { useState, useEffect } from "react";
import { useAppointments } from "../hooks/useAppointments";
import { horarioService, HorarioDisponivel } from "../../horarios/services/horarioService";
import { Button } from "../../../components/ui/button";
import { Calendar, Clock, CheckCircle2 } from "lucide-react";

interface Props {
  alunoId: string;
  psicologoId: string;
  psicologoNome: string;
  onClose: () => void;
}

export function AppointmentRequestFlow({ alunoId, psicologoId, psicologoNome, onClose }: Props) {
  const { createAppointment } = useAppointments();
  const [horarios, setHorarios] = useState<HorarioDisponivel[]>([]);
  const [selectedHorario, setSelectedHorario] = useState<HorarioDisponivel | null>(null);
  const [step, setStep] = useState<'selecting' | 'confirming' | 'success'>('selecting');

  useEffect(() => {
    // Busca horários disponíveis reais do psicólogo
    horarioService.getByPsicologoId(psicologoId).then(data => {
      setHorarios(data.filter(h => h.status === 'disponivel'));
    });
  }, [psicologoId]);

  const handleConfirm = async () => {
    if (!selectedHorario) return;
    try {
      await createAppointment({
        alunoId,
        psicologoId,
        horarioId: selectedHorario.id,
      });
      setStep('success');
    } catch (err) {
      alert("Erro ao solicitar agendamento.");
    }
  };

  if (step === 'success') {
    return (
      <div className="text-center p-6 space-y-4">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
        <h3 className="text-xl font-bold">Solicitação Enviada!</h3>
        <p className="text-gray-600">O psicólogo {psicologoNome} receberá sua solicitação para aprovação.</p>
        <Button onClick={onClose} className="w-full">Fechar</Button>
      </div>
    );
  }

  return (
    <div className="p-1 space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-xl font-bold">Agendar com {psicologoNome}</h2>
        <p className="text-sm text-gray-500">Selecione um horário disponível abaixo.</p>
      </div>

      <div className="max-h-64 overflow-y-auto grid grid-cols-1 gap-2">
        {horarios.map(h => (
          <button
            key={h.id}
            onClick={() => setSelectedHorario(h)}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
              selectedHorario?.id === h.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              {new Date(h.inicio).toLocaleDateString('pt-BR')}
            </div>
            <div className="flex items-center gap-2 font-medium">
              <Clock className="w-4 h-4 text-blue-500" />
              {new Date(h.inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
        <Button 
          disabled={!selectedHorario} 
          onClick={handleConfirm}
          className="flex-1"
        >
          Confirmar Solicitação
        </Button>
      </div>
    </div>
  );
}