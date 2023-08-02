import { Database, aql } from "arangojs";
import dotenv from "dotenv";

dotenv.config();

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

const serverUrlWithPort = `${process.env.SERVER_URL}:${process.env.SERVER_PORT}`;
const serverUrlNoPort = `${process.env.SERVER_URL}`;

export { db, aql, serverUrlWithPort, serverUrlNoPort };
