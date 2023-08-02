import dotenv from "dotenv";

// connect the .env file
dotenv.config();

// configure the mssql settings
const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
  debug: true,
  server: process.env.DB_HOST,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    trustedConnection: true,
    enableArithAbort: true,
    encrypt: false,
  },
  port: 1433,
  //port: 49172,
};

export { sqlConfig };
