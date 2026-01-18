export const formatAppointmentDate = (isoString: string) => {
  if (!isoString) return { date: '--/--/--', time: '--:--' };
  
  const dateObj = new Date(isoString);
  return {
    date: dateObj.toLocaleDateString('pt-BR'),
    time: dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  };
};

// Funções auxiliares de data, se houver outras, ficam aqui.