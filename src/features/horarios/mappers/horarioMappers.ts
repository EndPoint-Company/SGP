import type { HorarioDisponivel } from "../services/horarioService";

// DTO: Como o dado chega da API (pode ser incerto)
interface HorarioDTO {
  id?: string;
  psicologoId?: string;
  inicio?: string;
  fim?: string;
  status?: string;
  [key: string]: unknown;
}

/**
 * Converte os dados brutos da API para o Domínio da Aplicação.
 * Garante que datas sejam strings ISO válidas e status tenham valor conhecido.
 */
export const toDomain = (data: unknown): HorarioDisponivel => {
  const dto = data as HorarioDTO;

  const safeDate = (dateString: unknown): string => {
    if (typeof dateString !== 'string' || !dateString) return new Date().toISOString(); // Fallback seguro
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.toISOString();
  };

  return {
    id: String(dto.id || ''),
    psicologoId: String(dto.psicologoId || ''),
    inicio: safeDate(dto.inicio),
    fim: safeDate(dto.fim),
    // Força o status para um dos valores permitidos ou 'bloqueado' como fallback seguro
    status: (['disponivel', 'agendado', 'bloqueado'].includes(dto.status as string) 
      ? dto.status 
      : 'bloqueado') as HorarioDisponivel['status']
  };
};