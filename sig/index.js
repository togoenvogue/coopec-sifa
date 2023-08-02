import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

import groupResolver from "./services/groups.js";
import clientResolver from "./services/clients.js";
import testResolver from "./services/test.js";
import loanResolver from "./services/loan.js";

dotenv.config();
const app = express();
const PORT = process.env.APP_PORT;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(cors());

// http://192.168.0.111:5556/test/192.168.0.102/SIFA_DAPAONG/dogakaba/doga@DBpass2023
app.use("/dbtest", cors(), async (req, res) => {
  var result = await testResolver.dbtest({
    dbIp: req.body.host,
    dbName: req.body.db,
    dbUser: req.body.user,
    dbPass: req.body.pass,
  });
  res.send(result);
});

// group + members + solde + credits
app.use("/group-by-code-sig", cors(), async (req, res) => {
  var result = await groupResolver.groupByCodeSig({
    dbIp: req.body.dbIp,
    dbName: req.body.dbName,
    dbUser: req.body.dbUser,
    dbPass: req.body.dbPass,
    dbPort: req.body.dbPort,
    codeSig: req.body.codeSig,
  });
  //console.log(result);
  res.send(result);
});

// individual client + solde + credits
app.use("/client-by-code-sig", cors(), async (req, res) => {
  var result = await clientResolver.clientByCodeSig({
    codeSig: req.body.codeSig,
    dbIp: req.body.dbIp,
    dbName: req.body.dbName,
    dbUser: req.body.dbUser,
    dbPass: req.body.dbPass,
    dbPort: req.body.dbPort,
  });
  res.send(result);
});

// latest loan to a client or a group
app.use("/latest-loan-by-code-sig", cors(), async (req, res) => {
  var result = await loanResolver.getLatestLoan({
    dbIp: req.body.dbIp,
    dbName: req.body.dbName,
    dbUser: req.body.dbUser,
    dbPass: req.body.dbPass,
    dbPort: req.body.dbPort,
    codeSig: req.body.codeSig,
    isCreditIndividuel: req.body.isCreditIndividuel,
  });
  //console.log(result);
  res.send(result);
});

// run the server
app.listen(PORT, "0.0.0.0");
console.log(`The server is running on the port ${PORT}`);
