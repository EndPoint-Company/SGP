import type { Aluno, Psicologo } from "../userService";

// DTO: Representação flexível da resposta da API
interface UserDTO {
  id?: string;
  nome?: string;
  name?: string; // API pode retornar 'name' ou 'nome' dependendo do backend
  email?: string;
  avatarUrl?: string;
  avatar_url?: string; // Caso o backend use snake_case
  [key: string]: unknown;
}

const DEFAULT_AVATAR = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

/**
 * Normaliza dados de Aluno
 */
export const toAlunoDomain = (data: unknown): Aluno => {
  const dto = data as UserDTO;
  return {
    id: String(dto.id || ''),
    nome: String(dto.nome || dto.name || 'Aluno Desconhecido'),
    email: String(dto.email || ''),
    avatarUrl: String(dto.avatarUrl || dto.avatar_url || DEFAULT_AVATAR),
  };
};

/**
 * Normaliza dados de Psicólogo
 */
export const toPsicologoDomain = (data: unknown): Psicologo => {
  const dto = data as UserDTO;
  return {
    id: String(dto.id || ''),
    nome: String(dto.nome || dto.name || 'Psicólogo Desconhecido'),
    email: String(dto.email || ''),
    avatarUrl: String(dto.avatarUrl || dto.avatar_url || DEFAULT_AVATAR),
    crp: String(dto['crp'] || ''), // Campo específico de psicólogo
  };
};