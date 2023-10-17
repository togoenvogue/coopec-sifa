import os from "os";
import fs from "fs";
import dotenv from "dotenv";
import express from "express";
import multer from "multer";
import bodyParser from "body-parser";
import graphqlHttp from "express-graphql";
import cors from "cors";
import http from "http";
import isAuth from "./middleware/is-auth.js";
import path from "path";
import * as UploadUtil from "./helpers/upload.js";
import zipResolver from "./helpers/backup.js";
import compression from "compression";

// GraphQL
import graphQlSchema from "./graphql/schema/index.js";
import graphQlResolvers from "./graphql/resolvers/index.js";

import appResolver from "./graphql/resolvers/_app/system/system.js";

import pdfFileResolver from "./graphql/resolvers/_pdf/pdfFile.js";
import importsResolver from "./imports/imports.js";
import importUsersResolver from "./imports/users.js";
import labResolver from "./_lab/db.js";
import updaterResolver from "./helpers/microfinapp.js";

const __dirname =
  process.platform == "win32"
    ? path.dirname(new URL(import.meta.url).pathname).slice(1)
    : path.dirname(new URL(import.meta.url).pathname);

dotenv.config();
const PORT = process.env.PORT_SERVER_APP;

let app = express();
let server = http.createServer(app);

//implement the peer server
//const peerServer = ExpressPeerServer(server, { debug: true });
// specify the peer server url
//app.use("/peerjs", peerServer);
app.use(cors());
app.use(
  compression({
    level: 6,
  })
);
app.use(isAuth);

process.on("uncaughtException", function (err) {
  //console.error(err);
  //console.log("Node Exiting...");
  //throw new Error(err.message);
});

//app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(bodyParser.text());

app.use("/", express.static(path.join(__dirname, "/")));
app.use("/public_upload", express.static(__dirname + "/public_upload"));
// run a cron to clear the /public_download every midnight
app.use("/public_download", express.static(__dirname + "/public_download"));
app.use("/public_docs", express.static(__dirname + "/public_docs"));
app.use("/public_files", express.static(__dirname + "/public_files"));
app.use("/public_audio", express.static(__dirname + "/public_audio"));
app.use("/sync", express.static(__dirname + "/sync")); // offline sync dir

app.use("/pdf_clients", express.static(__dirname + "/pdf_clients"));
app.use("/pdf_credits", express.static(__dirname + "/pdf_credits"));
app.use("/pdf_sessions_pv", express.static(__dirname + "/pdf_sessions_pv"));
app.use("/sessions_pdf", express.static(__dirname + "/sessions_pdf"));
//app.use("/sessions_zip", express.static(__dirname + "/sessions_zip"));

app.use("/BACKUPS", express.static(__dirname + "/BACKUPS")); // system backup dir
app.use("/RESTORE_DB", express.static(__dirname + "/RESTORE_DB")); // system backup dir
app.use("/RESTORE_IMAGES", express.static(__dirname + "/RESTORE_IMAGES")); // system backup dir
app.use("/public", express.static(__dirname + "/public"));
app.use("/imports", express.static(__dirname + "/imports"));

const _filePrefix = Date.now();

// to upload images to the public_upload folder
function imageUploadFnc({ rename }) {
  var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public_upload");
    },
    filename: (req, file, cb) => {
      if (rename == true) {
        cb(null, Date.now() + file.originalname);
      } else {
        cb(null, file.originalname);
      }
    },
  });
  const upload = multer({
    storage,
    limits: {
      fileSize: 1024 * 1024 * 6,
    },
  });
  return upload;
}

// to upload json files to the public_download folder
// clear [ public_download ] folder every midnight
function jsonUploadFnc({ rename }) {
  var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public_download");
    },
    filename: (req, file, cb) => {
      if (rename == true) {
        cb(null, Date.now() + file.originalname);
      } else {
        cb(null, file.originalname);
      }
    },
  });
  const upload = multer({
    storage,
    limits: {
      fileSize: 1024 * 1024 * 6,
    },
  });
  return upload;
}

function audioUploadFnc({ rename }) {
  var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public_audio");
    },
    filename: (req, file, cb) => {
      if (rename == true) {
        cb(null, Date.now() + file.originalname);
      } else {
        cb(null, file.originalname);
      }
    },
  });
  const upload = multer({
    storage,
    limits: {
      fileSize: 1024 * 1024 * 6,
    },
  });
  return upload;
}

// pdf uploader
function pdfUploadFnc({ rename }) {
  var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public_pdf");
    },
    filename: (req, file, cb) => {
      if (rename == true) {
        cb(null, _filePrefix + "_" + file.originalname);
      } else {
        cb(null, file.originalname);
      }
    },
  });
  const upload = multer({
    storage,
  });
  return upload;
}

// /api/upload-picture-and-update-doc
app.post(
  "/api/upload-picture-and-update-doc",
  cors(),
  imageUploadFnc({ rename: true }).single("file"),
  async (req, res) => {
    if (req.file) {
      //console.log(`req.file: ${req.file.path}`);
      //console.log(`file Stringify: ${JSON.stringify(req.file)}`);
      //res.status(result.status).json({ uploadResult: req.file.path });
      //console.log(`req.file.filename: ${req.file.filename}`);
      // console.log(`req.file.size: ${req.file.size}`);
      //console.log(`req.file.mimetype: ${req.file.mimetype}`);
      //console.log(`req.file.buffer: ${req.file.buffer}`);

      const result = await UploadUtil.default.uploadPhotoAndUpdateDocument({
        uploadedFile:
          process.platform == "win32"
            ? req.file.path.split("public_upload\\")[1]
            : req.file.path.split("public_upload/")[1],
        index: req.body.fileIndex, // ex: "3" // STRING
        docKey: req.body.docKey,
        docName: req.body.docName,
        legende: req.body.legende,
      });

      if (result.status == 200) {
        res.status(result.status).json({ uploadResult: result });
      } else {
        //console.log(result.message);
        res.status(result.status).json({ uploadResult: result });
        try {
        } catch (err) {
          console.error(err);
          res.status(409).send(err);
        }
      }
    } else {
      res.status(409).json("No File uploaded.");
    }
  }
);

// api/upload-audio
app.post(
  "/api/upload-audio",
  cors(),
  audioUploadFnc({ rename: false }).single("file"),
  async (req, res) => {
    // req.file.path.split("public_audio/")[1] > 1648078397778.aac
    if (req.file) {
      res.status(200).json({ uploadResult: "OK" });
    } else {
      res.status(409).json("No File uploaded.");
    }
  }
);

// /api/upload-signature
app.post(
  "/api/upload-signature",
  cors(),
  imageUploadFnc({ rename: true }).single("file"),
  async (req, res) => {
    if (req.file) {
      const result = await UploadUtil.default.uploadPhotoAndUpdateDocument({
        uploadedFile:
          process.platform == "win32"
            ? req.file.path.split("public_upload\\")[1]
            : req.file.path.split("public_upload/")[1],
        index: "0", // ex: "3" // STRING
        docKey: req.body.docKey,
        docName: req.body.docName,
        docField: req.body.docField,
        legende: "",
      });

      //console.log(result);
      if (result.status == 200) {
        res.status(result.status).json({ uploadResult: result });
      } else {
        //console.log(result.message);
        res.status(result.status).json({ uploadResult: result });
        try {
        } catch (err) {
          console.error(err);
          res.status(409).send(err);
        }
      }
    } else {
      res.status(409).json("No File uploaded.");
    }
  }
);

// /api/upload-pdf
app.post(
  "/api/upload-pdf",
  cors(),
  pdfUploadFnc({ rename: false }).single("file"),
  async (req, res) => {
    if (req.file) {
      const result = await pdfFileResolver.pdfFileCreate({
        description: req.body.description,
        loanKey: req.body.loanKey,
        uploadedFile: _filePrefix + "_" + req.body.fileName,
      });

      if (result == "SUCCESS") {
        res.status(200).json({ uploadResult: result });
      } else {
        res.status(404).json({ uploadResult: result });
      }
    } else {
      res.status(409).json("No File uploaded.");
    }
  }
);

// api/deleteFile
app.use("/api/deleteFile", cors(), async (req, res) => {
  //console.log(`TO DELETE : ${req.body.file}`);
  if (req.body.file) {
    try {
      if (
        fs.existsSync(
          process.platform == "win32"
            ? ".\\public_upload\\" + req.body.file
            : "./public_upload/" + req.body.file
        )
      ) {
        fs.unlinkSync(
          process.platform == "win32"
            ? ".\\public_upload\\" + req.body.file
            : "./public_upload/" + req.body.file
        );
        res.send("OK");
      } else {
        res.send("OK");
      }
    } catch (err) {
      //console.error(err);
      res.status(409).send(err);
    }
  } else {
    res.status(409).send("No or wrong file provided to delete.");
  }
});

// import images from the user local device
// api/sync-upload-image
app.post(
  "/api/sync-upload-image",
  cors(),
  imageUploadFnc({ rename: false }).single("file"),
  async (req, res) => {
    if (req.file) {
      res.status(200).json({ result: "SUCCESS" });
    } else {
      res.status(409).json({ result: "ERROR" });
    }
  }
);

// import sync json files from the user local device
// api/sync-upload-json
app.post(
  "/api/sync-upload-json",
  cors(),
  jsonUploadFnc({
    rename: false,
  }).single("file"),
  async (req, res) => {
    if (req.file) {
      //console.log(req.file.path);
      const result = await appResolver.syncUploadToTheServer({
        fileName: req.file.path.split(
          process.platform == "win32" ? "public_download\\" : "public_download/"
        )[1],
        companyKey: req.body.companyKey,
        projectKey: req.body.projectKey,
        officeKey: req.body.officeKey,
        userKey: req.body.userKey,
        docName: req.body.docName,
        accessLevel: req.body.accessLevel,
      });
      res.status(200).json({ result: "SUCCESS" });
    } else {
      res.status(409).json("No File uploaded.");
    }
  }
);
/// / / / / ///
/// BACKUP ///
// backup folder | CRON
app.use("/api/backup-folders", cors(), async (req, res) => {
  let zipUrls = [];
  // url 1
  const url1 = await zipResolver.backupFolder({
    folderName: "public_upload",
    fileType: "IMAGES",
  });
  zipUrls.push(url1);
  // url 2
  const url2 = await zipResolver.backupFolder({
    folderName: "pdf_clients",
    fileType: "PDF_CLIENTS",
  });
  zipUrls.push(url2);

  // url 3
  const url3 = await zipResolver.backupFolder({
    folderName: "pdf_credits",
    fileType: "PDF_CREDITS",
  });
  zipUrls.push(url3);

  // url 4
  const url4 = await zipResolver.backupFolder({
    folderName: "pdf_sessions_pv",
    fileType: "PDF_PV",
  });
  zipUrls.push(url4);

  res.send(zipUrls);
});

// api/backup-db | CRON
app.use("/api/backup-db", cors(), async (req, res) => {
  const result = await zipResolver.backupDb({
    //dbName: req.body.dbName,
    dbName: "dogakaba_coopec_sifa",
  });
  res.send(result);
});

// /api/backup-request-download (bulk)
// request to download backup zip files (array list of zip files)
app.use("/api/backup-request-download-links", cors(), async (req, res) => {
  // return an array of download urls
  const links = await zipResolver.backupRequestDownloadLinks({
    userKey: req.body.userKey,
    downloadType: req.body.downloadType, // IMAGES | DB | PDF_CLIENTS, PDF_CREDITS, PDF_PV
  });
  res.send(links);
});

// api/backup-download-update (from the previous bulk)
app.use("/api/backup-download-update-link", cors(), async (req, res) => {
  var result = await zipResolver.backupUpdateDownloadLink({
    userKey: req.body.userKey,
    linkKey: req.body.linkKey,
  });
  res.send(result);
});

// api/backup-direct-download (from the app)
app.use("/api/backup-direct-download", cors(), async (req, res) => {
  // return an array of download urls
  const links = await zipResolver.backupDirectDownload({
    userKey: req.body.userKey,
    linkKey: req.body.linkKey,
  });
  res.send(links);
});

// api/truncate-folders
app.use("/api/truncate-public-folders", cors(), async (req, res) => {
  await zipResolver.truncateFolders();
  res.send("Public Folders Truncated");
});

// delete all existing docs
// and restore tables by creating new ones
app.use("/api/restore/db-full/:password", cors(), async (req, res) => {
  // truncate all tables
  await zipResolver.createCollectionsAndImportData({
    password: req.params.password,
  });
  res.send("Full DB Restored");
  //res.send("Please uncomment the script");
});

app.use("/api/restore/images", cors(), async (req, res) => {
  // truncate all tables
  //await zipResolver.restoreImages();
  //res.send("/public_upload/ images restored");
  res.send("Please uncomment the script");
});

// reset db
app.use("/api/reset/full/:password", cors(), async (req, res) => {
  // truncate all tables
  /*await zipResolver.createCollectionsAndImportData({
    password: req.params.password,
  });
  res.send("Full DB Restored");*/
  res.send("Please uncomment the script");
});

// default images generation
/*app.use("/api/backup-generate", cors(), async (req, res) => {
  await resetResolver.backupGenerateImages();
  await resetResolver.backupGeneratePdfClients();
  await resetResolver.backupGenerateLoans();
  await resetResolver.backupGeneratePvs();
  res.send("Default images and PDFs Generated");
});*/
// END BACKUP //

// imports of CSV files
app.use("/api/imports/csv/localites/:action", cors(), async (req, res) => {
  //const result = await importsResolver.localites({ action: req.params.action });
  // http://192.168.0.111:5555/api/imports/csv/localites/reset
  //res.send(result);
  res.send("Please uncomment the script");
});

// restore users names
app.use("/api/lab/testdb", cors(), async (req, res) => {
  const cols = await labResolver.testDb();
  res.send(`${cols} collections`);
});

// reset completely the app
app.use("/api/lab/resetapp/:password", cors(), async (req, res) => {
  //await labResolver.resetApp({ password: req.params.password });
  //res.send(`Application Reset Successfully`);
});

/*app.use("/api/restore/users", cors(), async (req, res) => {
  const result = await importUsersResolver.setName(); 
  res.send(result);
});*/

app.use("/api/updates/microfinapp", cors(), async (req, res) => {
  // truncate all tables
  //await updaterResolver.appendOfficeIds();
  res.send("Please uncomment the script");
});

// default
app.get("/", cors(), (req, res) => {
  res.status(200).send({
    status: 200,
    message: "DOGA KABA (COOPEC-SIFA) - PopOS",
    platform: process.platform,
    date: "2 Aout 2023",
  });
});

// main
app.use(
  "/api/graphql",
  cors(),
  graphqlHttp({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true,
  })
);

// ifconfig |grep inet
server.listen(PORT, "0.0.0.0"); // this serve the app on the IP address (ex: 192.168.0.111)
console.log("DOGA KABA is running on [" + PORT + "] > " + os.hostname());
