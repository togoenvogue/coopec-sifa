import { Database, aql } from "arangojs";
import dotenv from "dotenv";
import os from "os";

dotenv.config();

// local db
const db = new Database({
  url: process.env.DB_HOST,
  databaseName: process.env.DB_NAME,
  headers: {
    connection: "keep-alive",
  },
  auth: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  },
});

const emailServer = "https://v2.letaviapp.com/api/email/send";

const serverAppUrl = `${process.env.SERVER_APP_URL}:${process.env.PORT_SERVER_APP}`;
const serverAppUrlNoPort = `${process.env.SERVER_APP_URL}`;
const serverSigUrl = `${process.env.SERVER_SIG_URL}`;
const serverBackupUrl = `${process.env.SERVER_BACKUP_URL}`;
//console.log(`os.hostname(): ${os.hostname()} > serverAppUrl: ${serverAppUrl}`);

export {
  db,
  aql,
  emailServer,
  serverAppUrl,
  serverAppUrlNoPort,
  serverBackupUrl,
  serverSigUrl,
};
