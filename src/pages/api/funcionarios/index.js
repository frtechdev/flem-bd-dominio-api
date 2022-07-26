import { getFunc, getFuncByFilter } from "controller/funcionarios";
import { allowCors } from "services/apiAllowCors";
import { unmaskCPF } from "utils/masks";
import { parseArrayToQueryString, parseArrayToString } from "utils/parsers";


/**
 * Função para compor o filtro da query. Caso a requisição faça uma solicitação
 * ao BD utilizando critérios de pesquisa ("condition") e um objeto de filtro,
 * aplica a alteração a um objeto de filtro para realizar a pesquisa corretamente.
 * @param {Object} req HTTP request.
 * @returns Objeto contendo o fragmento da Query String para requisitar ao BD.
 */
const composeFilter = (req) => {
  const { condition, ativo, ...query } = req.query;
  const keys = Object.keys(query);
  const filter = [];
  if(ativo){
    filter.push(`${getAtivo(ativo)}`);
  }
  keys.forEach((key, idx) => {
    switch (key) {
      case "nome":
      case "matricula":
        filter.push(
          `${
            idx > 0 ? ` ${condition} ` : " AND "
          }${key} LIKE ${parseArrayToQueryString(query[key], key)}`
        );
        break;
      case "cpf":
        filter.push(
          `${
            idx > 0 ? ` ${condition} ` : " AND "
          }${key} LIKE ${parseArrayToQueryString(unmaskCPF(query[key]), key)}`
        );
        break;
      default:
        filter[condition] = parseArrayToString(query[key], key);
        break;
    }
  });
  return filter;
};

/**
 * Função que retorna um trecho de Query String 
 * @param {Object} ativo se o funcionário é ativo ou não.
 * Aceita String ou Booleano.
 * @returns Fragmento de Query String.
 */
const getAtivo = (ativo) => {
  if (ativo === "true") {
    return " AND data_fim IS NULL";
  } else if (ativo === "false") {
    return " AND data_fim IS NOT NULL";
  } else {
    return "";
  }
};

/**
 * Fornece Funcionários e lista de Funcionários, conforme critérios.
 * Recebe um request HTTP com os seguintes parâmetros:
 * condition - condição para determinar as opções da filtragem. É um parâmetro
 * mandatório na query string da requisição se realizada com critérios de pesquisa.
 * params - demais parâmetros não mencionados, os quais caem no critério de
 * filtragem dependendo das colunas da tabela requisitada pela query.
 * Requer ao menos "condition" (ex. condition=OR) e um objeto de filtro (ex. nome="Fulano")
 * para realizar a pesquisa com o BD se utilizado critérios de filtragem.
 * @param {Object} req HTTP request. Apenas GET é aceito
 * @param {Object} res HTTP response
 * @returns HTTP response como JSON contendo a resposta da query consultada
 */
async function handler(req, res) {
  try {
    const { ativo, ...params } = req.query;
    if (req.method === "GET") {
      // SOLICITAÇÕES SEM CRITÉRIOS DE PESQUISA RETORNAM
      // UMA LISTA COMPLETA DE FUNCIONÁRIOS
      if (Object.keys(params).length === 0) {
        const query = await getFunc(getAtivo(ativo));
        return res.status(200).json({ status: "ok", query });
      } else {
        if(Object.keys(params).length === 1 || req.query.condition){
          const output = [];
          const queryResult = await getFuncByFilter(composeFilter(req));
          output.push(queryResult);
          const query = output[0];
          // RETORNA A PESQUISA SEGUINDO CRITÉRIOS ESTABELECIDOS NO FILTRO
          return res.status(200).json({ status: "ok", query });
        }
        else{
          // SE UM CRITÉRIO FOR INCLUÍDO MAS NÃO A CONDIÇÃO DE PESQUISA, RETORNA ERRO
          return res
              .status(400)
              .json({
                status: 400,
                message: "ERRO DE API - A chamada requer 'CONDITION'."
              });
        }
      }
    } else {
      // SE FOI FEITO OUTRO MÉTODO ALÉM DE GET
      return res
        .status(403)
        .json({ status: 403, message: "METHOD NOT ALLOWED" });
    }
  } catch (error) {
    // ERRO GERAL DE REQUEST
    return res
      .status(500)
      .json({ status: 500, message: "API ERROR", error: error.message });
  }
}

export default allowCors(handler);
