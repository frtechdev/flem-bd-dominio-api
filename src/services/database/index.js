import Sybase from "sybase-promised";

// PARÂMETROS DE CONEXÃO AO SYBASE
const connOptions = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dbname: process.env.DB_DBNAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
};

/**
 * Inicializa o Serviço de Conexão ao Sybase.
 */
export const sybaseConnector = new Sybase(connOptions);
