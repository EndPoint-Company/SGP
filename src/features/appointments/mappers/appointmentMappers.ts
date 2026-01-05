// src/features/appointments/mappers/appointmentMappers.ts


import type { Consulta } from "../types";

/**
 * ATUALIZADO: Como a API já retorna os dados no formato esperado (camelCase, 
 * correspondendo à interface `Consulta`), uma função de mapeamento complexa 
 * não é mais necessária.
 *
 * Se em algum momento a API e o modelo do frontend divergirem, a lógica de 
 * mapeamento pode ser adicionada aqui. Por enquanto, esta função apenas 
 * garante a consistência do fluxo de dados.
 */
export function mapApiDataToConsulta(apiData: Consulta): Consulta {
  // Nenhuma conversão de nome de campo (snake_case para camelCase) é necessária.
  // Os dados da API já correspondem à interface `Consulta`.
  // Apenas retornamos os dados para manter a estrutura do código.
  return apiData;
}