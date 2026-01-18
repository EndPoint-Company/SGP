import type { Consulta } from "../types";

// Interface que define a "forma" esperada dos dados brutos vindos da API.
// Usamos 'unknown' ou tipos opcionais para campos que podem variar ou não existir.
interface ConsultaDTO {
  inicio?: string;
  fim?: string;
  dataAgendamento?: string;
  status?: string;
  [key: string]: unknown; // Permite outras propriedades que virão via spread operator
}

/**
 * Normaliza datas vindas da API para o formato ISO string seguro para o Frontend.
 * Segue o princípio de robustez: "Seja liberal no que aceita e conservador no que envia".
 */
export const toDomain = (consulta: unknown): Consulta => {
  // Fazemos o cast do 'unknown' para nosso DTO para poder acessar as propriedades com segurança
  const dto = consulta as ConsultaDTO;

  const safeFormat = (dateString: unknown): string => {
    if (typeof dateString !== 'string' || !dateString) return "";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn(`[Mapper] Data inválida recebida: "${dateString}"`);
      return String(dateString); // Retorna original em caso de erro
    }
    return date.toISOString();
  };

  return {
    // Espalhamos as propriedades originais. O cast duplo (as unknown as Consulta) 
    // é usado aqui para garantir que propriedades extras compatíveis sejam passadas,
    // mas os campos que sobrescrevemos abaixo terão prioridade.
    ...(dto as unknown as Consulta),
    
    inicio: safeFormat(dto.inicio),
    fim: safeFormat(dto.fim),
    dataAgendamento: safeFormat(dto.dataAgendamento),
    
    // Garante que o status seja tipado corretamente, prevenindo erros se vier null/undefined
    status: (dto.status as Consulta['status']) 
  };
};

/**
 * Se precisarmos enviar dados para a API em um formato específico no futuro,
 * criaríamos um método `toDTO` aqui.
 */