import AdmZip from "adm-zip";
import fs, { link } from "fs";
import path, { resolve } from "path";
//import emptyDir from "empty-dir";
// extract zip file : https://www.codegrepper.com/code-examples/javascript/adm-zip+npm
import { db, aql, serverAppUrl } from "../db/arangodb.js";
import dotenv from "dotenv";
dotenv.config();

// function to list all zipped files from a directory and sub directories
var listZippedImageFiles = async function (dir, done) {
  var results = [];
  fs.readdir(dir, function (err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = path.resolve(dir, file);
      fs.stat(file, async function (err, stat) {
        if (stat && stat.isDirectory()) {
          listZippedImageFiles(file, function (err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          if (file.endsWith(".zip")) {
            results.push(file);
          }
          next();
        }
      });
    })();
  });
};

const zipResolver = {
  // https://callmyapp.com/
  // https://console.cron-job.org/
  // kick off with the command : yarn start and NOT yarn dev
  // fileType | IMAGES | DB | PDF_CLIENTS, PDF_CREDITS, PDF_PV
  backupFolder: async ({ folderName, fileType }) => {
    // define date
    const date = new Date();
    const folderPath = `${folderName}/${date.getFullYear()}/${
      date.getMonth() + 1
    }/${date.getDate()}/__${folderName}__${date.getFullYear()}__${
      date.getMonth() + 1
    }__${date.getDate()}__${Date.now()}.zip`;

    // construct a new zip object
    var zip = new AdmZip();

    // select files from the db
    const docs_cursor = await db.query(
      aql`FOR f IN backup_files 
      FILTER f.type == ${fileType} RETURN f`,
      { fullCount: true },
      { count: true }
    );
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      for (let index = 0; index < docs.length; index++) {
        const doc = docs[index];
        if (fs.existsSync(`./${folderName}/${doc.fileName}`)) {
          zip.addLocalFile(`./${folderName}/${doc.fileName}`);
        }
      }
      // get everything as a buffer
      zip.toBuffer();
      // or write everything to disk
      zip.writeZip(`./BACKUPS/${folderPath}`);
      // save to db
      const bkObj = {
        timeStamp: Date.now(),
        description: `Sauvegarde du dossier /${folderName}`,
        link: `${serverAppUrl}/BACKUPS/${folderPath}`,
        type: fileType,
        downloadedBy: [],
      };
      const doc_cursor = await db.query(
        aql`INSERT ${bkObj} INTO backup_links RETURN NEW`
      );
      if (doc_cursor.hasNext) {
        // truncate folder if is different from IMAGES
        if (fileType != "IMAGES") {
          // PDF_CLIENTS, PDF_CREDITS, PDF_PV
          fs.readdir(`./${folderName}`, async (err, files) => {
            files.forEach((file) => {
              fs.unlinkSync(`./${folderName}/${file}`);
            });
          });
        }

        // delete the files from the backup_files collection
        await db.query(aql`FOR fx IN backup_files 
        FILTER fx.type == ${fileType} 
        REMOVE { _key: fx._key } IN backup_files RETURN OLD`);
        // return the url
        return `${serverAppUrl}/BACKUPS/${folderPath}`;
      } else {
        return null;
      }
    } else {
      return null;
    }
  },

  backupDb: async ({ dbName }) => {
    // define date
    const date = new Date();
    //const dateRef = `${date.getMonth() + 1}/${date.getDate()}/${Date.now()}`;
    const folderPath = `${dbName}/${date.getFullYear()}/${
      date.getMonth() + 1
    }/${date.getDate()}/__${dbName}__${date.getFullYear()}__${
      date.getMonth() + 1
    }__${date.getDate()}__${Date.now()}.zip`;

    const collections = await db.collections();
    if (collections.length > 0) {
      // initialize the zip plugin
      var zip = new AdmZip();

      for (let index = 0; index < collections.length; index++) {
        const collection = collections[index];
        const collName = collection.name;
        // get the collection object
        const coll = db.collection(collName);
        // select the documents
        const coll_cursor = await db.query(
          aql`FOR doc IN ${coll}
          SORT doc._key DESC RETURN doc`,
          { fullCount: true },
          { count: true }
        );

        const docs = await coll_cursor.all();
        // loop through the documents and update the latest keys
        if (docs.length > 0) {
          const chunkSize = 1000;
          if (docs.length > chunkSize) {
            for (let i = 0; i < docs.length; i += chunkSize) {
              const chunkArr = docs.slice(i, i + chunkSize);
              zip.addFile(
                `${collName}___${i + chunkSize}___.json`,
                Buffer.from(JSON.stringify(chunkArr, null, 2), "utf8"),
                ""
              );
            }
          } else {
            // zip the document
            zip.addFile(
              `${collName}.json`,
              Buffer.from(JSON.stringify(docs, null, 2), "utf8"),
              ""
            );
          }
        } else {
          zip.addFile(
            `${collName}.json`,
            Buffer.from(JSON.stringify([], null, 2), "utf8"),
            ""
          );
        }
      } // end for loop

      // get everything as a buffer
      zip.toBuffer();
      // or write everything to disk
      zip.writeZip(`./BACKUPS/${folderPath}`);
      // save to db
      const bkObj = {
        timeStamp: Date.now(),
        description: `Sauvegarde de la base de donnée`,
        link: `${serverAppUrl}/BACKUPS/${folderPath}`,
        type: "DB",
        downloadedBy: [],
      };
      const doc_cursor = await db.query(
        aql`INSERT ${bkObj} INTO backup_links RETURN NEW`
      );
      if (doc_cursor.hasNext) {
        return `Backup succesful with ${collections.length} collections`;
      } else {
        return `ERROR 1: No collection backed up`;
      }
    } else {
      return `ERROR 2: No collection backed up`;
    }
  },

  // bulkd Download
  backupRequestDownloadLinks: async ({ userKey, downloadType }) => {
    //console.log(`userKey: ${userKey} > downloadType: ${downloadType}`);
    // select the user
    const user_doc = await db.query(
      aql`FOR u IN user FILTER u._key == ${userKey} AND u.isAdmin == true 
      OR u._key == ${userKey} AND u.isSuperAdmin == true RETURN u`
    );
    if (user_doc.hasNext) {
      // select all available backup files
      if (downloadType == "ALL") {
        const backups_cursor = await db.query(aql`FOR b IN backup_links 
        FILTER ${userKey} NOT IN b.downloadedBy
        SORT b.timeStamp DESC LIMIT 2 RETURN b`);
        if (backups_cursor.hasNext) {
          const backups = await backups_cursor.all();
          return backups.map((link) => {
            return {
              ...(link.type = null),
              ...link,
            };
          });
        } else {
          return [];
        }
      } else if (downloadType == "ALL_BUT_DB") {
        const backups_cursor = await db.query(aql`FOR b IN backup_links 
        FILTER ${userKey} NOT IN b.downloadedBy 
        AND b.type != 'DB'
        SORT b.timeStamp DESC LIMIT 2 RETURN b`);
        if (backups_cursor.hasNext) {
          const backups = await backups_cursor.all();
          return backups.map((link) => {
            return {
              ...(link.type = null),
              ...link,
            };
          });
        } else {
          return [];
        }
      } else {
        return [];
      }
    } else {
      return `Désolé, vous n\'avez pas les autorisations pour télécharger les sauvegardes`;
    }
  },

  // bulkd Download update
  backupUpdateDownloadLink: async ({ userKey, linkKey }) => {
    const backup_cursor = await db.query(aql`FOR b IN backup_links 
    FILTER b._key == ${linkKey} RETURN b`);
    if (backup_cursor.hasNext) {
      const backup = await backup_cursor.next();
      let usersArr = backup.downloadedBy;
      usersArr.push(userKey);
      await db.query(aql`UPDATE ${linkKey} WITH 
      { downloadedBy: ${usersArr} } IN backup_links RETURN NEW`);
      return "OK";
    } else {
      return "ERROR";
    }
  },

  // direct download from the app
  backupDirectDownload: async ({ userKey, linkKey }) => {
    // select the user
    const user_doc = await db.query(
      aql`FOR u IN user FILTER u._key == ${userKey} 
      AND u.isAdmin == true OR 
      u._key == ${userKey} AND u.isSuperAdmin == true RETURN u`
    );
    if (user_doc.hasNext) {
      // select all available backup files
      const backup_cursor = await db.query(aql`FOR b IN backup_links 
        FILTER b._key == ${linkKey}  RETURN b`);
      if (backup_cursor.hasNext) {
        const backup = await backup_cursor.next();
        return {
          ...(backup.type = null),
          ...backup,
        };
      } else {
        return null;
      }
    } else {
      return `Désolé, vous n\'avez pas les autorisations pour télécharger les sauvegardes`;
    }
  },

  truncateFolders: async () => {
    // truncate the folder [ public_docs ]
    fs.readdir("./public_docs", async (err, files) => {
      if (!err && files.length > 0) {
        files.forEach((file) => {
          fs.unlinkSync(`./public_docs/${file}`);
        });
      }
    });
    // truncate the folder [ public_download ]
    fs.readdir("./public_download", async (err, files) => {
      if (!err && files.length > 0) {
        files.forEach((file) => {
          fs.unlinkSync(`./public_download/${file}`);
        });
      }
    });
    // truncate the folder [ sync/images ]
    fs.readdir("./sync/images", async (err, files) => {
      if (!err && files.length > 0) {
        files.forEach((file) => {
          fs.unlinkSync(`./sync/images/${file}`);
        });
      }
    });

    // truncate the folder [ sync/user ]
    fs.readdir("./sync/user", async (err, folders) => {
      if (!err && folders.length > 0) {
        folders.forEach((folder) => {
          fs.readdir(`./sync/user/${folder}`, async (errx, files) => {
            if (!errx && files.length > 0) {
              files.forEach((file) => {
                fs.unlinkSync(`./sync/user/${folder}/${file}`);
              });
            }
          });
        });
      }
    });
  },

  restoreImages: async () => {
    //2. copy and paste the < year > folder with month subfolders into the ./RESTORE_IMAGES folder
    //3. visit the url /http://localhost:5665/api/restore/images
    // get all zipped files array list
    await listZippedImageFiles("./RESTORE_IMAGES", function (err, results) {
      if (err) throw err;
      if (results.length > 0) {
        // loop through the result
        for (let index = 0; index < results.length; index++) {
          const file = results[index];
          const zipFileToMove = `./RESTORE_IMAGES/${file.slice(-17)}`; // 1651968041311.zip
          // move the zipped file to the ./RESTORE_IMAGES folder
          fs.rename(file, zipFileToMove, function (err) {
            if (err) throw err;
          });
        }
      }
    });

    // process the images restoration
    fs.readdir("./RESTORE_IMAGES", async (err, zipFiles) => {
      if (!err && zipFiles.length >= 0) {
        // wipe out all previous images in the ./public_upload folder
        fs.readdir("./public_upload", async (err, files) => {
          if (!err && files.length > 0) {
            files.forEach((file) => {
              // exclude
              if (file != "no_signature.png" && file != "camera_avatar.png") {
                fs.unlinkSync(`./public_upload/${file}`);
              }
            });
          }
        });
        // loop through the zip files
        zipFiles.forEach((zipFile) => {
          if (zipFile.endsWith(".zip")) {
            var zip = new AdmZip(`./RESTORE_IMAGES/${zipFile}`);
            zip.extractAllTo("./public_upload", true);
          }
        });
        // delete all the zipped files from the ./RESTORE_IMAGES.png folder
      }
    });
  },

  createCollectionsAndImportData: async ({ password }) => {
    //const colx = await db.collection("sms_suivis_data").exists();
    //console.log(`sms_suivis_data: ${colx}`);
    // 1. put all .json collections in the /RESTORE_DB folder
    // 2. visit http://localhost:5665/api/restore/db

    if (password == process.env.ADMIN_PWD) {
      return new Promise(async (resolve, reject) => {
        // truncate all collections
        const collections = await db.collections();
        if (collections.length > 0) {
          for (let index = 0; index < collections.length; index++) {
            console.log(`[x] Deleting > ${collections[index].name}`);
            await collections[index].drop();
            // create collections
            if (index == collections.length - 1) {
              fs.readdir("./RESTORE_DB", async (err, jsonFiles) => {
                if (!err && jsonFiles.length > 0) {
                  for (let index = 0; index < jsonFiles.length; index++) {
                    const jsonFile = jsonFiles[index];

                    if (jsonFile.endsWith(".json")) {
                      const docName = jsonFile.includes("___")
                        ? jsonFile.split("___")[0]
                        : jsonFile.split(".json")[0];
                      // create collections
                      const collExists = await db.collection(docName).exists();
                      if (collExists == false) {
                        console.log(`[++] Creating : ${docName}`);
                        await db.collection(docName).create();
                      }
                    }
                  }
                }
                resolve();
              });
            }
          } // end for
        } else {
          fs.readdir("./RESTORE_DB", async (err, jsonFiles) => {
            if (!err && jsonFiles.length > 0) {
              for (let index = 0; index < jsonFiles.length; index++) {
                const jsonFile = jsonFiles[index];

                if (jsonFile.endsWith(".json")) {
                  const docName = jsonFile.includes("___")
                    ? jsonFile.split("___")[0]
                    : jsonFile.split(".json")[0];
                  // create collections
                  const collExists = await db.collection(docName).exists();
                  if (collExists == false) {
                    console.log(`[--] Creating : ${docName}`);
                    await db.collection(docName).create();
                  }
                }
              }
            }
            resolve();
          });
        }
      }).then(async () => {
        console.log(`.... Processing`);
        fs.readdir("./RESTORE_DB", async (err, jsonFiles) => {
          if (!err && jsonFiles.length > 0) {
            for (let index = 0; index < jsonFiles.length; index++) {
              const jsonFile = jsonFiles[index];

              if (jsonFile.endsWith(".json")) {
                const docName = jsonFile.includes("___")
                  ? jsonFile.split("___")[0]
                  : jsonFile.split(".json")[0];

                // save data
                fs.readFile(
                  `./RESTORE_DB/${jsonFile}`,
                  "utf8",
                  async (err, jsonString) => {
                    if (err) {
                      console.log("Error reading file from disk:", err);
                      return;
                    }
                    const jsonArr = JSON.parse(jsonString);
                    if (jsonArr.length > 0) {
                      const collExists = await db.collection(docName).exists();
                      if (collExists == true) {
                        await db.collection(docName).save(jsonArr);
                        console.log(`... saved > ${docName}`);
                      }
                    } else {
                      console.log(`??? no data > ${docName}`);
                    }
                    // delete file
                    fs.unlinkSync(
                      process.platform == "win32"
                        ? `.\\RESTORE_DB\\${jsonFile}`
                        : `./RESTORE_DB/${jsonFile}`
                    );
                  }
                );
              }
            }
          }
        });
      });
    } else {
      console.log(`Wrong password`);
      return "Wrong password";
    }
  },

  /*
  unzipImages: async () => {
    // put all the ziped image files into the ./RESTORE_IMAGES folder
    fs.readdir("./RESTORE_IMAGES", async (err, zipFiles) => {
      if (!err && zipFiles.length >= 0) {
        // truncate the public_upload folder
        fs.readdir("./public_upload", async (err, files) => {
          if (!err && files.length > 0) {
            files.forEach((file) => {
              // exclude 
              fs.unlinkSync(`./public_upload/${file}`);
            });
          }
        });

        // loop through the zip files
        zipFiles.forEach((zipFile) => {
          if (zipFile.endsWith(".zip")) {
            var zip = new AdmZip(`./RESTORE_IMAGES/${zipFile}`);
            zip.extractAllTo("./public_upload", true);
          }
        });
      }
    });
  },*/
};

export default zipResolver;
