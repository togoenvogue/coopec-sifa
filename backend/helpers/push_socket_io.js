import { db, aql } from "../db/arangodb.js";
import io from "socket.io-client";
import os from "os";

const SERVER_URL =
  os.hostname() === "Komlas-MBP" || os.hostname() === "Komlas-MacBook-Pro.local"
    ? "http://192.168.0.111:5665"
    : "https://dogakaba-demo.net";

const socket = io(SERVER_URL);
export async function pushSocketIo({ data }) {
  // emit
  socket.emit("chat_notification", data);
}
