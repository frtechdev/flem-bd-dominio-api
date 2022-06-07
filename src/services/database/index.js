import Sybase from "sybase-promised";

const connOptions = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dbname: process.env.DB_DBNAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
};

export const db = new Sybase(connOptions);
