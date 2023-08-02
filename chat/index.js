import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { Server } from "socket.io"; // "socket.io": "2.3.0",
import http from "http";

import { db, aql } from "./db/arangodb.js";
dotenv.config();
const PORT = process.env.SERVER_PORT;

let app = express();
let server = http.createServer(app);

// SOCKET
const io = new Server(server, {
  pingTimeout: 600000 * 1, // 1 minutes x 60
  pingInterval: 60000, // 1 minute,
  connectTimeout: 600000 * 3,
});

io.on("error", (error) => {
  console.log(`SOCKET ERROR: ${error}`);
});

process.on("uncaughtException", function (err) {
  console.error(err.stack);
  console.log("Node Exiting...");
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(bodyParser.text());

// socket clients array
let clients = [];

io.on("connection", (socket) => {
  /*console.log(`socket.id: ${socket.id}`);
  console.log(`userKey: ${socket.handshake.query["userKey"]}`);
  console.log(`sessionKey: ${socket.handshake.query["sessionKey"]}`);
  console.log("- - - - - - - -");*/
  //
  socket.on("ping", () => {
    //console.log("ping ...");
    socket.emit("pong");
  });

  socket.on("pong", () => {
    //console.log("pong ...");
    socket.emit("ping");
  });

  if (clients.length > 0) {
    const socKlient = clients.filter(
      (c) =>
        c.userKey === socket.handshake.query["userKey"] &&
        c.sessionKey === socket.handshake.query["sessionKey"]
    );
    //console.log(clients);
    //console.log(socKlient[0]["userKey"]);
    if (socKlient.length == 1) {
      //console.log(`Rejoining with socket id: ${socket.id}`);
      socket.join(socKlient[0]["sessionKey"]);
    }
  }

  socket.on("join-room", async (joinData) => {
    if (
      joinData != null &&
      joinData != undefined &&
      joinData.sessionKey != null
    ) {
      // socket.join(joinData.sessionKey);

      // select the session
      const session_doc = await db.query(aql`FOR s IN loan_session 
      FILTER s._key == ${joinData.sessionKey} RETURN s`);
      if (session_doc.hasNext) {
        const session = await session_doc.next();
        if (session.status == "OUVERT") {
          // make sure the user has not already joined
          const already_doc = await db.query(aql`FOR sc IN loan_session_chat 
          FILTER sc.sessionKey == ${joinData.sessionKey} 
          AND sc.userKey == ${joinData.userKey} 
          ANd sc.action == 'CHAT_WELCOME' RETURN sc`);

          if (!already_doc.hasNext) {
            if (session.participantKeys.includes(joinData.userKey)) {
              // add to the joinedUsers
              let userKeysArr = session.joinedUsers;
              userKeysArr.push(joinData.userKey);
              const userKeysArrU = [...new Set(userKeysArr)]; // remove duplicates

              const ssObj = {
                joinedUsers: userKeysArrU,
              };
              const upSession_cursor =
                await db.query(aql`UPDATE ${joinData.sessionKey} 
              WITH ${ssObj} IN loan_session RETURN NEW`);
              if (upSession_cursor.hasNext) {
                const upSession = await upSession_cursor.next();
                // joinded successfully, alert other users
                // get online users
                let onlineUsers = upSession.onlineUsers;
                onlineUsers.push(joinData.userKey);
                // remove duplicate
                const onlineUsersArr = [...new Set(onlineUsers)];
                // update online users
                await db.query(aql`UPDATE ${upSession._key} 
                WITH {onlineUsers: ${onlineUsersArr}} 
                IN loan_session RETURN NEW`);

                const userJoinedMessage = {
                  key: "",
                  timeStamp: Date.now(),
                  companyKey: joinData.companyKey,
                  projectKey: joinData.projectKey,
                  userKey: joinData.userKey,
                  userFullName: joinData.userFullName,
                  sessionKey: joinData.sessionKey,
                  loanFileKey: joinData.loanFileKey,
                  message: joinData.message,
                  action: joinData.action,
                  audioFile: joinData.audioFile,
                  messageType: joinData.messageType,
                  childAudioFile: joinData.childAudioFile,
                  childMessage: joinData.childMessage,
                  childMessageType: joinData.childMessageType,
                  childStamp: joinData.childStamp,
                  childUser: joinData.childUser,
                  save: false,
                  onlineUsers: onlineUsers,
                };

                socket.join(joinData.sessionKey); // join the sessionKey channel
                // save the client session
                var clientInfo = new Object();
                clientInfo.userKey = socket.handshake.query["userKey"];
                clientInfo.sessionKey = socket.handshake.query["sessionKey"];
                clientInfo.clientId = socket.id;
                clients.push(clientInfo);
                // emit
                io.to(joinData.sessionKey).emit(
                  "user-connected",
                  JSON.stringify(userJoinedMessage)
                );

                //socket.emit("PONG");

                // save to history
                const welcomeObj = {
                  timeStamp: Date.now(),
                  companyKey: joinData.companyKey,
                  projectKey: joinData.projectKey,
                  userKey: joinData.userKey,
                  userFullName: joinData.userFullName,
                  sessionKey: joinData.sessionKey,
                  loanFileKey: joinData.loanFileKey,
                  message: joinData.message,
                  action: joinData.action,
                  messageType: joinData.messageType,
                  audioFile: joinData.audioFile,
                  childUser: joinData.childUser,
                  childStamp: joinData.childStamp,
                  childMessageType: joinData.childMessageType,
                  childMessage: joinData.childMessage,
                  childAudioFile: joinData.childAudioFile,
                };

                await db.query(aql`INSERT ${welcomeObj} 
                INTO loan_session_chat RETURN NEW`);
              }
            } // user not invided
          } else {
            // user already joined
            socket.join(joinData.sessionKey);
            const userJoinedMessage = {
              key: "",
              timeStamp: Date.now(),
              companyKey: joinData.companyKey,
              projectKey: joinData.projectKey,
              userKey: joinData.userKey,
              userFullName: joinData.userFullName,
              sessionKey: joinData.sessionKey,
              loanFileKey: joinData.loanFileKey,
              message: joinData.message,
              action: joinData.action,
              audioFile: joinData.audioFile,
              messageType: joinData.messageType,
              childAudioFile: joinData.childAudioFile,
              childMessage: joinData.childMessage,
              childMessageType: joinData.childMessageType,
              childStamp: joinData.childStamp,
              childUser: joinData.childUser,
              save: false,
              onlineUsers: [],
            };

            io.to(joinData.sessionKey).emit(
              "user-connected",
              JSON.stringify(userJoinedMessage)
            );
          } // already joined
        }
      }

      // select the socket channel
      //const client = await io.in(joinData.sessionKey).allSockets();
      //console.log(client);
    }
  });

  // receive message from user input (the front end)
  socket.on("chat-message", async (inMess) => {
    const inMessObj = {
      key: `${inMess.userKey}_${Date.now()}`,
      timeStamp: Date.now(),
      companyKey: inMess.companyKey,
      projectKey: inMess.projectKey,
      userKey: inMess.userKey,
      userFullName: inMess.userFullName,
      sessionKey: inMess.sessionKey,
      loanFileKey: inMess.loanFileKey,
      message: inMess.message,
      action: inMess.action,
      audioFile: inMess.audioFile,
      messageType: inMess.messageType,
      childAudioFile: inMess.childAudioFile,
      childMessage: inMess.childMessage,
      childMessageType: inMess.childMessageType,
      childStamp: inMess.childStamp,
      childUser: inMess.childUser,
      save: true,
    };

    // save to db
    await db.query(aql`INSERT ${inMessObj} 
    INTO loan_session_chat RETURN NEW`);

    // broadcast to the chat room
    io.to(inMess.sessionKey).emit(
      "chat-new-message",
      JSON.stringify(inMessObj)
    );
  });

  // listen for user dis onnection
  socket.on("session-leave", async (outMess) => {
    const obj = {
      timeStamp: Date.now(),
      companyKey: outMess.companyKey,
      projectKey: outMess.projectKey,
      userKey: outMess.userKey,
      userFullName: "DOGA KABA",
      sessionKey: outMess.sessionKey,
      loanFileKey: outMess.loanFileKey,
      message: outMess.message,
      action: outMess.action,
      messageType: outMess.messageType,
      audioFile: outMess.audioFile,
      childUser: outMess.childUser,
      childStamp: outMess.childStamp,
      childMessageType: outMess.childMessageType,
      childMessage: outMess.childMessage,
      childAudioFile: outMess.childAudioFile,
    };

    const doc_cursor = await db.query(
      aql`INSERT ${obj} INTO loan_session_chat RETURN NEW`
    );
    if (doc_cursor.hasNext) {
      const disconnectMessageObj = {
        key: "",
        timeStamp: Date.now(),
        companyKey: outMess.companyKey,
        projectKey: outMess.projectKey,
        userKey: outMess.userKey,
        userFullName: "DOGA KABA",
        sessionKey: outMess.sessionKey,
        loanFileKey: outMess.loanFileKey,
        message: `${outMess.userFullName} vient de quitter la session`,
        action: outMess.action,
        audioFile: outMess.audioFile,
        messageType: outMess.messageType,
        childAudioFile: outMess.childAudioFile,
        childMessage: outMess.childMessage,
        childMessageType: outMess.childMessageType,
        childStamp: outMess.childStamp,
        childUser: outMess.childUser,
        save: false,
        onlineUsers: [],
      };
      // broadcast
      io.to(outMess.sessionKey).emit(
        "chat-new-message",
        JSON.stringify(disconnectMessageObj)
      );

      // leave the room
      await socket.leave(outMess.sessionKey);
      socket.disconnect(true); // close the underlying connection
      socket.removeAllListeners();
    }
  });

  socket.on("session-close", async (data) => {
    const clientSockets = await io.in(data.sessionKey).fetchSockets();
    for (let index = 0; index < clientSockets.length; index++) {
      const cltsk = clientSockets[index];
      cltsk.leave(data.sessionKey);
      cltsk.disconnect(true);
      cltsk.removeAllListeners();
    }
    //
    io.to(data.sessionKey).emit("disconnect-user", JSON.stringify(data));
  });
});

// default
app.get("/", cors(), (req, res) => {
  res.status(200).send({
    status: 200,
    message: "DOGA KABA / COOPEC-SIFA : COMITE",
    update: "11 Mars 2023",
  });
});

server.listen(PORT, () =>
  console.log(`Server running on port (${PORT}) > [PID: ${process.pid}]`)
);
