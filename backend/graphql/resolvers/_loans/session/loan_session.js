import { aql, db, serverAppUrl } from "../../../../db/arangodb.js";
import uid from "easy-uid";
import string from "string-sanitizer";
import {
  getOfficeDoc,
  getUserDoc,
  getUserDocs,
} from "../../../../helpers/joindocs.js";
import {
  getLoanFileDoc,
  getLoanFileDocs,
  getCOffreSoldeByDay,
  getSessionLevelDoc,
  getSumLoanFondsByDate,
  getSumLoanPV,
  getLoanProductDoc,
  getLoanVisiteKeysAsStringArr,
} from "../../../../helpers/joindocs_loan.js";

import { _loanSessionFondsPdf } from "./loan_session_fonds_pdf.js";
import { _loanSessionPvPdf } from "./loan_session_pv_pdf.js";
import clientSIGResolver from "../../_client/client.js";
import loanFilesResolver from "../loan_files/loan_file.js";

// session backup config
import AdmZip from "adm-zip";
import fs from "fs";

const loanSessionResolver = {
  loanSessionCreate: async ({
    createdBy,
    sessionStamp,
    timeSpan,
    projectKey,
    companyKey,
    officeKey,
    sessionLevelKey,
    sessionLabel,
    participantKeys,
  }) => {
    const obj = {
      timeStamp: Date.now(),
      createdBy: createdBy,
      sessionStamp: sessionStamp,
      timeSpan: timeSpan,
      projectKey: projectKey,
      companyKey: companyKey,
      officeKey: officeKey,
      sessionLevelKey: sessionLevelKey,
      sessionLabel: sessionLabel,
      participantKeys: participantKeys,
      joinedUsers: [],
      onlineUsers: [],
      fileKeys: [],
      status: "EN ATTENTE",
      totalMontantAccorde: 0,
      totalMontantAnaylse: 0,
      totalMontantRejete: 0,
      totalMontantAjourne: 0,
      currentFileKey: null,
      sessionRoomUUID:
        uid().toUpperCase() +
        "" +
        uid().toUpperCase() +
        "" +
        uid().toUpperCase(),
    };
    // make sure there is no pending session
    const check_cursor = await db.query(aql`FOR s IN loan_session 
     FILTEr s.status != 'CLOS' AND s.createdBy == ${createdBy} RETURN s`);
    if (!check_cursor.hasNext) {
      const doc_cursor = await db.query(aql`INSERT ${obj} 
      INTO loan_session RETURN NEW`);
      if (doc_cursor.hasNext) {
        const doc = await doc_cursor.next();
        return {
          ...(doc.fullCount = 0),
          ...doc,
        };
      } else {
        throw new Error(`Erreur lors de la création de la session`);
      }
    } else {
      throw new Error(
        `Vous devez fermer toutes vos sessions avant de pouvoir créer une nouvelle`
      );
    }
  },

  loanSessionUpdate: async ({
    sessionKey,
    sessionStamp,
    timeSpan,
    officeKey,
    sessionLevelKey,
    sessionLabel,
    participantKeys,
  }) => {
    const obj = {
      sessionStamp: sessionStamp,
      timeSpan: timeSpan,
      officeKey: officeKey,
      sessionLevelKey: sessionLevelKey,
      sessionLabel: sessionLabel,
      participantKeys: participantKeys,
    };
    // make sure there is no pending session
    const check_cursor = await db.query(aql`FOR s IN loan_session 
     FILTER s.status == 'EN ATTENTE' AND s._key == ${sessionKey} RETURN s`);
    if (check_cursor.hasNext) {
      const doc_cursor = await db.query(aql`UPDATE ${sessionKey}
      WITH ${obj} IN loan_session RETURN NEW`);
      if (doc_cursor.hasNext) {
        const doc = await doc_cursor.next();
        return {
          ...(doc.fullCount = 0),
          ...doc,
        };
      } else {
        throw new Error(`Erreur lors de la modification de la session`);
      }
    } else {
      throw new Error(
        `Vous devez fermer toutes vos sessions afin d'en créer une nouvelle`
      );
    }
  },

  loanSessionOpen: async ({ adminKey, sessionKey }) => {
    // select the session
    const session_doc = await db.query(aql`FOR s IN loan_session 
    FILTER s._key == ${sessionKey} RETURN s`);
    if (session_doc.hasNext) {
      const session = await session_doc.next();
      if (session.status == "EN ATTENTE") {
        if (session.createdBy == adminKey) {
          const ssObj = {
            status: "OUVERT",
          };
          const upSession_cursor = await db.query(aql`UPDATE ${sessionKey} 
          WITH ${ssObj} IN loan_session RETURN NEW`);
          if (upSession_cursor.hasNext) {
            //const sess = await upSession_cursor.next();
            return "SUCCESS";
          } else {
            throw new Error(
              `Erreur lors de l'ouverture de la session : ${sessionKey}`
            );
          }
          // user not found, add it to the session
        } else {
          throw new Error(
            `Désolé, vous n'êtes pas autorisé à ouvrir cette session`
          );
        }
      } else {
        throw new Error(`Désolé, la session ${sessionKey} est déjà ouverte`);
      }
    } else {
      throw new Error(`Erreur de sélection de la session ${sessionKey}`);
    }
  },

  /*loanSessionJoin: async ({
    companyKey,
    projectKey,
    userKey,
    userFullName,
    sessionKey,
    loanFileKey,
    message,
    action,
  }) => {
    //console.log("JOIN");
    // select the session
    const session_doc = await db.query(aql`FOR s IN loan_session 
    FILTER s._key == ${sessionKey} RETURN s`);
    if (session_doc.hasNext) {
      const session = await session_doc.next();
      if (session.status == "OUVERT") {
        // make sure the user has not already joined
        const already_doc = await db.query(aql`FOR sc IN loan_session_chat 
        FILTER sc.sessionKey == ${sessionKey} AND sc.userKey == ${userKey} 
        ANd sc.action == 'CHAT_WELCOME' RETURN sc`);

        if (!already_doc.hasNext) {
          if (session.participantKeys.includes(userKey)) {
            // add to the joinedUsers
            let userKeysArr = session.joinedUsers;
            userKeysArr.push(userKey);
            const userKeysArrU = [...new Set(userKeysArr)]; // remove duplicates

            const ssObj = {
              joinedUsers: userKeysArrU,
            };
            const upSession_cursor = await db.query(aql`UPDATE ${sessionKey} 
            WITH ${ssObj} IN loan_session RETURN NEW`);
            if (upSession_cursor.hasNext) {
              const sess = await upSession_cursor.next();

              return {
                ...(sess.fullCount = 1),
                ...sess,
              };
            } else {
              return `Erreur de mise à jour de la session`;
              //throw new Error(`Erreur de mise à jour de la session`);
            }
            // user not found, add it to the session
          } else {
            return `Désolé, vous n'êtes pas autorisé à prendre part à cette session`;
            //throw new Error(`Désolé, vous n'êtes pas autorisé à prendre part à cette session`);
          }
        } else {
          // no move, already joined
          return {};
        }
      } else {
        return `Désolé, la session ${sessionKey} n'est pas ouverte`;
        //throw new Error(`Désolé, la session ${sessionKey} n'est pas ouverte`);
      }
    } else {
      return `Erreur de sélection de la session ${sessionKey}`;
      //throw new Error(`Erreur de sélection de la session ${sessionKey}`);
    }
  },*/

  loanSessionAddFile: async ({
    sessionKey,
    loanFileKey,
    companyKey,
    projectKey,
    adminKey,
  }) => {
    // select the session
    const session_cursor = await db.query(aql`FOR s IN loan_session 
      FILTER s._key == ${sessionKey} RETURN s`);
    if (session_cursor.hasNext) {
      const session = await session_cursor.next();
      //console.log(session);
      // make sure the session is active
      if (session.status != "CLOS") {
        // make sure there is no prev file opened
        const file_cursor = await db.query(aql`FOR fs IN loan_files 
          FILTER fs.isInSession == true AND fs.companyKey == ${companyKey} 
          AND fs.projectKey == ${projectKey} 
          AND fs.sessionSetBy == ${adminKey} RETURN fs`);
        if (!file_cursor.hasNext) {
          // make sure this very loan file is not in session
          const already_cursor = await db.query(aql`FOR al IN loan_files 
          FILTER al._key == ${loanFileKey} RETURN al`);

          if (already_cursor.hasNext) {
            const already = await already_cursor.next();
            if (already.isInSession == false) {
              let fileKeysArr = session.fileKeys;
              fileKeysArr.push(loanFileKey);
              const fileKeysArrU = [...new Set(fileKeysArr)]; // remove duplicates

              const ssObj = {
                fileKeys: fileKeysArrU,
                currentFileKey: loanFileKey,
                status: "OUVERT",
              };
              const upSession_cursor = await db.query(aql`UPDATE ${sessionKey} 
              WITH ${ssObj} IN loan_session RETURN NEW`);
              if (upSession_cursor.hasNext) {
                const sess = await upSession_cursor.next();
                // update loanFile
                const fileObj = {
                  wasInSession: true,
                  isInSession: true,
                  sessionSetBy: adminKey,
                  sessionKey: sessionKey,
                };
                await db.query(aql`UPDATE ${loanFileKey} 
                WITH ${fileObj} IN loan_files RETURN NEW`);

                return {
                  ...(sess.sessionLevelKey = await getSessionLevelDoc({
                    docKey: sess.sessionLevelKey,
                  })),
                  ...(sess.fullCount = 0),
                  ...sess,
                };
              } else {
                throw new Error(`Erreur de mise à jour de la session`);
              }
            } else {
              throw new Error(`Désolé, ce dossier est déjà mis en session`);
            }
          } else {
            throw new Error(
              `Impossible de sélectionner le dossier que vous essayez de mettre en session`
            );
          }
        } else {
          throw new Error(
            `Désolé, vous avez déjà un dossier en session que vous devez valider d'abord`
          );
        }
      } else {
        throw new Error(
          `Désolé, cette session (#${sessionKey}) a été déjà close. Impossible d'y ajouter un dossier`
        );
      }
    } else {
      throw new Error(`Impossible de sélectionner la session: ${sessionKey}`);
    }
  },

  loanSessionList: async ({
    companyKey,
    projectKey,
    officeKey,
    perPage,
    skip,
    accessLevel,
    userKey,
    coverage,
    dateFrom,
    dateTo,
    status,
  }) => {
    // admin / DE
    if (accessLevel > 2) {
      if (coverage == "Statuts") {
        const docs_cursor = await db.query(
          aql`FOR s IN loan_session 
              FILTER s.companyKey == ${companyKey}
               AND s.projectKey == ${projectKey} 
               AND s.status == ${status}
               AND s.sessionStamp >= ${dateFrom} AND s.sessionStamp <= ${dateTo}
              SORT s.sessionStamp DESC LIMIT ${skip}, ${perPage} RETURN s`,
          { fullCount: true },
          { count: true }
        );
        if (docs_cursor.hasNext) {
          const docs = await docs_cursor.all();
          return docs.map(async (doc) => {
            return {
              //"totalMontantAccorde": 0,
              //"totalMontantAnaylse": 1600320,
              //"totalMontantRejete": 0,
              //"totalMontantAjourne": 0,
              ...(doc.totalMontantAccorde = await getSumLoanPV({
                sessionKey: doc._key,
                type: "ACCORDÉ",
              })),
              ...(doc.totalMontantAnaylse = await getSumLoanPV({
                sessionKey: doc._key,
                type: "ANALYSÉ",
              })),
              ...(doc.totalMontantRejete = await getSumLoanPV({
                sessionKey: doc._key,
                type: "REJETÉ",
              })),
              ...(doc.totalMontantAjourne = await getSumLoanPV({
                sessionKey: doc._key,
                type: "AJOURNÉ",
              })),
              ...(doc.sessionLevelKey = await getSessionLevelDoc({
                docKey: doc.sessionLevelKey,
              })),
              ...(doc.createdBy = await getUserDoc({ userKey: doc.createdBy })),
              ...(doc.officeKey = await getOfficeDoc({
                officeKey: doc.officeKey,
              })),
              ...(doc.participantKeys = await getUserDocs({
                userKeyArr: doc.participantKeys,
              })),
              ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
              ...doc,
            };
          });
        } else {
          return [];
        }
      } else if (coverage == "Agences") {
        const docs_cursor = await db.query(
          aql`FOR s IN loan_session 
              FILTER s.companyKey == ${companyKey}
               AND s.projectKey == ${projectKey} 
               AND s.officeKey >= ${officeKey}
               AND s.sessionStamp >= ${dateFrom} AND s.sessionStamp <= ${dateTo}
              SORT s.sessionStamp DESC LIMIT ${skip}, ${perPage} RETURN s`,
          { fullCount: true },
          { count: true }
        );
        if (docs_cursor.hasNext) {
          const docs = await docs_cursor.all();
          return docs.map(async (doc) => {
            return {
              ...(doc.sessionLevelKey = await getSessionLevelDoc({
                docKey: doc.sessionLevelKey,
              })),
              ...(doc.participantKeys = await getUserDocs({
                userKeyArr: doc.participantKeys,
              })),
              ...(doc.createdBy = await getUserDoc({ userKey: doc.createdBy })),
              ...(doc.officeKey = await getOfficeDoc({
                officeKey: doc.officeKey,
              })),
              ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
              ...doc,
            };
          });
        } else {
          return [];
        }
      } else {
        // all
        const docs_cursor = await db.query(
          aql`FOR s IN loan_session 
              FILTER s.companyKey == ${companyKey}
               AND s.projectKey == ${projectKey} 
              SORT s.sessionStamp DESC LIMIT ${skip}, ${perPage} RETURN s`,
          { fullCount: true },
          { count: true }
        );
        if (docs_cursor.hasNext) {
          const docs = await docs_cursor.all();
          return docs.map(async (doc) => {
            return {
              ...(doc.participantKeys = await getUserDocs({
                userKeyArr: doc.participantKeys,
              })),
              ...(doc.sessionLevelKey = await getSessionLevelDoc({
                docKey: doc.sessionLevelKey,
              })),
              ...(doc.createdBy = await getUserDoc({ userKey: doc.createdBy })),
              ...(doc.officeKey = await getOfficeDoc({
                officeKey: doc.officeKey,
              })),
              ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
              ...doc,
            };
          });
        } else {
          return [];
        }
      }
    } else if (accessLevel == 2) {
      if (coverage == "Statuts") {
        const docs_cursor = await db.query(
          aql`FOR s IN loan_session 
            FILTER s.companyKey == ${companyKey}
             AND s.projectKey == ${projectKey} 
             AND s.officeKey == ${officeKey} 
             AND s.status == ${status} 
             AND s.sessionStamp >= ${dateFrom} AND s.sessionStamp <= ${dateTo}
             OR 
             s.companyKey == ${companyKey}
             AND s.projectKey == ${projectKey} 
             AND ${userKey} IN s.participantKeys 
             AND s.status == ${status} 
             AND s.sessionStamp >= ${dateFrom} AND s.sessionStamp <= ${dateTo}
             SORT s.sessionStamp DESC LIMIT ${skip}, ${perPage} RETURN s`,
          { fullCount: true },
          { count: true }
        );

        if (docs_cursor.hasNext) {
          const docs = await docs_cursor.all();
          return docs.map(async (doc) => {
            return {
              ...(doc.participantKeys = await getUserDocs({
                userKeyArr: doc.participantKeys,
              })),
              ...(doc.sessionLevelKey = await getSessionLevelDoc({
                docKey: doc.sessionLevelKey,
              })),
              ...(doc.createdBy = await getUserDoc({ userKey: doc.createdBy })),
              ...(doc.officeKey = await getOfficeDoc({
                officeKey: doc.officeKey,
              })),
              ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
              ...doc,
            };
          });
        } else {
          return [];
        }
      } else if (coverage == "Agences") {
        const docs_cursor = await db.query(
          aql`FOR s IN loan_session 
            FILTER s.companyKey == ${companyKey}
             AND s.projectKey == ${projectKey} 
             AND s.officeKey == ${officeKey}  
             AND s.sessionStamp >= ${dateFrom} AND s.sessionStamp <= ${dateTo}
             OR 
             s.companyKey == ${companyKey}
             AND s.projectKey == ${projectKey} 
             AND ${userKey} IN s.participantKeys  
             AND s.sessionStamp >= ${dateFrom} AND s.sessionStamp <= ${dateTo}
             SORT s.sessionStamp DESC LIMIT ${skip}, ${perPage} RETURN s`,
          { fullCount: true },
          { count: true }
        );

        if (docs_cursor.hasNext) {
          const docs = await docs_cursor.all();
          return docs.map(async (doc) => {
            return {
              ...(doc.participantKeys = await getUserDocs({
                userKeyArr: doc.participantKeys,
              })),
              ...(doc.sessionLevelKey = await getSessionLevelDoc({
                docKey: doc.sessionLevelKey,
              })),
              ...(doc.createdBy = await getUserDoc({ userKey: doc.createdBy })),
              ...(doc.officeKey = await getOfficeDoc({
                officeKey: doc.officeKey,
              })),
              ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
              ...doc,
            };
          });
        } else {
          return [];
        }
      } else {
        // all
        const docs_cursor = await db.query(
          aql`FOR s IN loan_session 
            FILTER s.companyKey == ${companyKey}
             AND s.projectKey == ${projectKey} 
             AND s.officeKey == ${officeKey} 
             OR 
             s.companyKey == ${companyKey}
             AND s.projectKey == ${projectKey} 
             AND ${userKey} IN s.participantKeys
             SORT s.sessionStamp DESC LIMIT ${skip}, ${perPage} RETURN s`,
          { fullCount: true },
          { count: true }
        );

        if (docs_cursor.hasNext) {
          const docs = await docs_cursor.all();
          return docs.map(async (doc) => {
            return {
              ...(doc.participantKeys = await getUserDocs({
                userKeyArr: doc.participantKeys,
              })),
              ...(doc.sessionLevelKey = await getSessionLevelDoc({
                docKey: doc.sessionLevelKey,
              })),
              ...(doc.createdBy = await getUserDoc({ userKey: doc.createdBy })),
              ...(doc.officeKey = await getOfficeDoc({
                officeKey: doc.officeKey,
              })),
              ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
              ...doc,
            };
          });
        } else {
          return [];
        }
      }
    } else if (accessLevel == 1) {
      if (coverage == "Statuts") {
        const docs_cursor = await db.query(
          aql`FOR s IN loan_session 
            FILTER s.companyKey == ${companyKey} 
            AND s.projectKey == ${projectKey} 
            AND ${userKey} IN s.participantKeys 
            AND s.status == ${status} 
            AND s.sessionStamp >= ${dateFrom} AND s.sessionStamp <= ${dateTo}
            SORT s.sessionStamp DESC LIMIT ${skip}, ${perPage} RETURN s`,
          { fullCount: true },
          { count: true }
        );
        if (docs_cursor.hasNext) {
          const docs = await docs_cursor.all();
          return docs.map(async (doc) => {
            return {
              ...(doc.participantKeys = await getUserDocs({
                userKeyArr: doc.participantKeys,
              })),
              ...(doc.sessionLevelKey = await getSessionLevelDoc({
                docKey: doc.sessionLevelKey,
              })),
              ...(doc.createdBy = await getUserDoc({ userKey: doc.createdBy })),
              ...(doc.officeKey = await getOfficeDoc({
                officeKey: doc.officeKey,
              })),
              ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
              ...doc,
            };
          });
        } else {
          return [];
        }
      } else if (coverage == "Agences") {
        const docs_cursor = await db.query(
          aql`FOR s IN loan_session 
            FILTER s.companyKey == ${companyKey} 
            AND s.projectKey == ${projectKey} 
            AND ${userKey} IN s.participantKeys 
            AND s.officeKey == ${officeKey} 
            AND s.sessionStamp >= ${dateFrom} AND s.sessionStamp <= ${dateTo}
            SORT s.sessionStamp DESC LIMIT ${skip}, ${perPage} RETURN s`,
          { fullCount: true },
          { count: true }
        );
        if (docs_cursor.hasNext) {
          const docs = await docs_cursor.all();
          return docs.map(async (doc) => {
            return {
              ...(doc.participantKeys = await getUserDocs({
                userKeyArr: doc.participantKeys,
              })),
              ...(doc.sessionLevelKey = await getSessionLevelDoc({
                docKey: doc.sessionLevelKey,
              })),
              ...(doc.createdBy = await getUserDoc({ userKey: doc.createdBy })),
              ...(doc.officeKey = await getOfficeDoc({
                officeKey: doc.officeKey,
              })),
              ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
              ...doc,
            };
          });
        } else {
          return [];
        }
      } else {
        // all
        const docs_cursor = await db.query(
          aql`FOR s IN loan_session 
            FILTER s.companyKey == ${companyKey} 
            AND s.projectKey == ${projectKey} 
            AND ${userKey} IN s.participantKeys  
            SORT s.sessionStamp DESC LIMIT ${skip}, ${perPage} RETURN s`,
          { fullCount: true },
          { count: true }
        );
        if (docs_cursor.hasNext) {
          const docs = await docs_cursor.all();
          return docs.map(async (doc) => {
            return {
              ...(doc.participantKeys = await getUserDocs({
                userKeyArr: doc.participantKeys,
              })),
              ...(doc.sessionLevelKey = await getSessionLevelDoc({
                docKey: doc.sessionLevelKey,
              })),
              ...(doc.createdBy = await getUserDoc({ userKey: doc.createdBy })),
              ...(doc.officeKey = await getOfficeDoc({
                officeKey: doc.officeKey,
              })),
              ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
              ...doc,
            };
          });
        } else {
          return [];
        }
      }
    }
  },

  loanSessionClose: async ({ sessionKey }) => {
    // select the session
    const session_cursor = await db.query(aql`FOR s IN loan_session 
      FILTER s._key == ${sessionKey} RETURN s`);
    if (session_cursor.hasNext) {
      const session = await session_cursor.next();
      //console.log(session);
      // make sure the session is active
      if (session.status == "OUVERT") {
        // make sure there is no file in the session
        if (session.currentFileKey == null) {
          // make sure there is no file in session
          const file_cursor = await db.query(aql`FOR fs IN loan_files 
            FILTER fs.isInSession == true 
            AND fs.sessionKey == ${sessionKey} RETURN fs`);
          if (!file_cursor.hasNext || session.currentFileKey != null) {
            // stats for this session
            const sessStatObj = {
              status: "CLOS",
            };
            const upSession_cursor = await db.query(aql`UPDATE ${sessionKey} 
              WITH ${sessStatObj} IN loan_session RETURN NEW`);
            if (upSession_cursor.hasNext) {
              const sess = await upSession_cursor.next();
              // generate loan PDF to (pdf_session_pv)
              var urlPv = await loanSessionResolver.loanSessionPvDownload({
                folder: "pdf_sessions_pv",
                companyKey: sess.companyKey,
                projectKey: sess.projectKey,
                sessionKey: sess._key,
              });
              const urlObj = {
                timeStamp: Date.now(),
                fileName: urlPv,
                type: "PDF_PV",
              };
              // save to backup_files
              await db.query(
                aql`INSERT ${urlObj} INTO backup_files RETURN NEW`
              );
              return "SUCCESS";
            } else {
              throw new Error(`Erreur lors de la fermeture de la session`);
            }
          } else {
            throw new Error(
              `Vous avez mis un ou plusieurs dossiers dans cette session. Traitez-les avant de fermer la session`
            );
          }
        } else {
          throw new Error(
            `Il existe actuellement un dossier dans cette session. Impossible de la fermer`
          );
        }
      } else {
        throw new Error(
          `Désolé, la session que vous essayez de fermer n'est pas ouverte`
        );
      }
    } else {
      throw new Error(`Impossible de sélectionner la session: ${sessionKey}`);
    }
  },

  loanSessionDelete: async ({ sessionKey }) => {
    // delete a session while not closed
    // NB: Make sure the was no file in the session
    const session_cursor = await db.query(aql`FOR s IN loan_session 
      FILTER s._key == ${sessionKey} RETURN s`);
    if (session_cursor.hasNext) {
      const session = await session_cursor.next();
      // make sure there was no file in the session
      if (session.fileKeys.length == 0 && session.currentFileKey == null) {
        const upSession_cursor = await db.query(aql`REMOVE ${sessionKey} 
            IN loan_session RETURN OLD`);
        if (upSession_cursor.hasNext) {
          return "TRUE";
        } else {
          return `Une erreur s\'est produite lors de la suppression de la session`;
        }
      } else {
        return `Un ou plusieurs dossiers ont été traités dans cette session. Impossible de la supprimer`;
      }
    } else {
      return `Impossible de sélectionner la session: ${sessionKey}`;
    }
  },

  loanSessionByKey: async ({ sessionKey }) => {
    const session_cursor = await db.query(aql`FOR s IN loan_session 
      FILTER s._key == ${sessionKey} RETURN s`);
    if (session_cursor.hasNext) {
      const doc = await session_cursor.next();
      // make sure the session is active
      return {
        ...(doc.sessionLevelKey = await getSessionLevelDoc({
          docKey: doc.sessionLevelKey,
        })),
        ...(doc.createdBy = await getUserDoc({ userKey: doc.createdBy })),
        ...(doc.participantKeys =
          doc.participantKeys.length > 0
            ? await getUserDocs({
                userKeyArr: doc.participantKeys,
              })
            : []),
        ...(doc.joinedUsers =
          doc.joinedUsers.length > 0
            ? await getUserDocs({
                userKeyArr: doc.joinedUsers,
              })
            : []),
        ...(doc.currentFileKey =
          doc.currentFileKey != null
            ? await getLoanFileDoc({ fileKey: doc.currentFileKey })
            : null),
        ...(doc.fileKeys =
          doc.fileKeys.length > 0
            ? await getLoanFileDocs({ fileKeysArr: doc.fileKeys })
            : []),
        ...(doc.officeKey = await getOfficeDoc({ officeKey: doc.officeKey })),
        ...(doc.fullCount = 1),
        ...doc,
      };
    } else {
      throw new Error(`Impossible de sélectionner la session: ${sessionKey}`);
    }
  },

  // returns an array of userFullNames
  /*
  loanSessionUsersOnline: async ({ sessionKey, userKey, action }) => {
    if (action == "CHAT_WELCOME") {
      const doc_cursor = await db.query(aql`FOR s IN loan_session 
      FILTER s._key == ${sessionKey} AND s.status == 'OUVERT' RETURN s`);
      if (doc_cursor.hasNext) {
        const doc = await doc_cursor.next();
        // add only if the user full name is not DOGA KABA
        if (userKey != "") {
          let onlineUsers = doc.onlineUsers;
          onlineUsers.push(userKey);
          // remove duplicate
          const onlineUsersArr = [...new Set(onlineUsers)];
          // update online users
          await db.query(aql`UPDATE ${doc._key} 
          WITH {onlineUsers: ${onlineUsersArr}} 
          IN loan_session RETURN NEW`);

          return [...onlineUsersArr];
        } else {
          return [...doc.onlineUsers];
        }
      } else {
        return [];
      }
    } else {
      // EXIT
      const doc_cursor = await db.query(aql`FOR s IN loan_session 
      FILTER s._key == ${sessionKey} AND s.status == 'OUVERT' RETURN s`);
      if (doc_cursor.hasNext) {
        const doc = await doc_cursor.next();

        let onlineUsers = doc.onlineUsers;
        const onlineUsersArr = onlineUsers.filter((el) => {
          return el !== userKey;
        });
        // update online users
        await db.query(aql`UPDATE ${doc._key} 
        WITH {onlineUsers: ${onlineUsersArr}} 
        IN loan_session RETURN NEW`);

        return [...onlineUsersArr];
      } else {
        return [];
      }
    }
  },*/

  loanSessionPvDownload: async ({
    sessionKey,
    companyKey,
    projectKey,
    folder,
  }) => {
    //console.log(sessionKey);
    const session_cursor = await db.query(aql`FOR s IN loan_session 
    FILTER s._key == ${sessionKey} AND s.projectKey == ${projectKey} 
    AND s.status != 'OUVERT' AND s.status != 'EN ATTENTE'
    AND s.companyKey == ${companyKey} RETURN s`);
    if (session_cursor.hasNext) {
      const doc = await session_cursor.next();
      // make sure the session is active

      doc.totalMontantAnaylse = await getSumLoanPV({
        sessionKey: doc._key,
        type: "ANALYSÉ",
      });
      doc.totalMontantAccorde = await getSumLoanPV({
        sessionKey: doc._key,
        type: "ACCORDÉ",
      });
      doc.totalMontantRejete = await getSumLoanPV({
        sessionKey: doc._key,
        type: "REJETÉ",
      });
      doc.totalMontantAjourne = await getSumLoanPV({
        sessionKey: doc._key,
        type: "AJOURNÉ",
      });

      doc.participantKeys =
        doc.participantKeys.length > 0
          ? await getUserDocs({
              userKeyArr: doc.participantKeys,
            })
          : [];
      doc.fileKeys =
        doc.fileKeys.length > 0
          ? await getLoanFileDocs({ fileKeysArr: doc.fileKeys })
          : [];
      doc.officeKey = await getOfficeDoc({ officeKey: doc.officeKey });

      /*const d = new Date(doc.sessionStamp);
      const day = d.getDate();
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      const fullDate = day + "/" + month + "/" + year;*/
      const date = new Date(doc.sessionStamp).toLocaleString("fr-FR", {
        month: "long",
        day: "numeric",
        year: "numeric",
        weekday: "long",
      });

      const pdf = await _loanSessionPvPdf({
        date: date,
        pdfName: `proces_verbal_${doc._key}.pdf`,
        pdfFolder:
          folder != null && folder != undefined ? folder : "public_docs",
        data: doc,
      });
      if (pdf != null) {
        return pdf;
      } else {
        throw new Error(`Erreur lors de la génération du fichier PDF`);
      }
    } else {
      throw new Error(`Impossible de sélectionner la session: ${sessionKey}`);
    }
  },

  loanSessionFondsByType: async ({
    sessionKey,
    companyKey,
    projectKey,
    officeKey,
    type,
  }) => {
    if (type == "SESSION") {
      // select session
      const session_cursor = await db.query(aql`FOR s IN loan_session 
      FILTER s._key == ${sessionKey} AND s.projectKey == ${projectKey} 
      AND s.companyKey == ${companyKey} AND s.officeKey == ${officeKey} 
      SORT s.dateDecaissement ASC RETURN s`);
      if (session_cursor.hasNext) {
        const session = await session_cursor.next();
        const sessionDate = new Date(session.sessionStamp).toLocaleString(
          "fr-FR",
          {
            month: "long",
            day: "numeric",
            year: "numeric",
            weekday: "long",
          }
        );
        const agence = await getOfficeDoc({ officeKey: session.officeKey });
        // select the loans
        const docs_cursor = await db.query(aql`FOR df IN loan_files
        FILTER df.sessionKey == ${sessionKey} 
        AND df.status == 'ACCORDÉ' SORT df.dateDecaissement ASC RETURN df`);

        if (docs_cursor.hasNext) {
          const docs = await docs_cursor.all();
          let timeStamps = [];
          let datesArr = [];

          docs.map(async (doc) => {
            //console.log(`docKey: ${doc._key} > ${doc.montantCreditAccorde}`);
            timeStamps.push(doc.dateDecaissement);
            const date = new Date(doc.dateDecaissement);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const dateCons = `${year}-${month}-${day}`;
            if (!datesArr.includes(dateCons)) {
              datesArr.push(dateCons);
            }
          });
          if (datesArr.length > 0) {
            // select regords by date
            let fondsArr = [];
            let total = 0;
            //sessionLabel = session.sessionLabel;
            //sessionStamp = session.sessionStamp;
            //agence = agence["officeName"];

            for (let index = 0; index < datesArr.length; index++) {
              const fdate = datesArr[index];
              const fday = parseInt(fdate.split(["-"])[2]);
              const fmonth = parseInt(fdate.split(["-"])[1]);
              const fyear = parseInt(fdate.split(["-"])[0]);
              //console.log(fdate);
              let amount = await getSumLoanFondsByDate({
                sessionKey: sessionKey,
                day: fday,
                month: fmonth,
                year: fyear,
                officeKey: officeKey,
                type: "SESSION",
              });
              total = total + amount;

              const paymentDate = new Date(
                Math.floor(new Date(fdate))
              ).toLocaleString("fr-FR", {
                month: "long",
                day: "numeric",
                year: "numeric",
                weekday: "long",
              });
              const fondsObj = {
                //timeStamp: new Date(fdate), // 2021-09-18T14:13:54.470Z
                //timeStamp: Math.floor(new Date(fdate)), // 1637193600000
                date: paymentDate, // vendredi 4 mars 2022
                amount: amount,
                coffreAmount: await getCOffreSoldeByDay({
                  companyKey: companyKey,
                  projectKey: projectKey,
                  officeKey: officeKey,
                  date: fdate,
                }),
              };

              fondsArr.push(fondsObj);
            }
            const data = {
              payments: fondsArr,
              sessionLabel: session.sessionLabel,
              sessionDate: sessionDate,
              agence: agence["officeName"],
              total: total,
            };
            return { ...data };
          }
        }
      } else {
        throw new Error(`Impossible de sélectionner la session ${sessionKey}`);
      }
    } else {
      // CUMUL
      const agence = await getOfficeDoc({ officeKey: officeKey });
      // select the loans
      const docs_cursor = await db.query(aql`FOR df IN loan_files
        FILTER df.officeKey == ${officeKey} 
        AND df.status == 'ACCORDÉ' 
        SORT df.dateDecaissement ASC RETURN df`);

      if (docs_cursor.hasNext) {
        const docs = await docs_cursor.all();
        let timeStamps = [];
        let datesArr = [];
        const sessionDate = new Date(Date.now()).toLocaleString("fr-FR", {
          month: "long",
          day: "numeric",
          year: "numeric",
          weekday: "long",
        });

        docs.map(async (doc) => {
          timeStamps.push(doc.dateDecaissement);
          const date = new Date(doc.dateDecaissement);
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          const day = date.getDate();
          const dateCons = `${year}-${month}-${day}`;
          if (!datesArr.includes(dateCons)) {
            datesArr.push(dateCons);
          }
        });
        if (datesArr.length > 0) {
          // select regords by date
          let fondsArr = [];
          let total = 0;

          for (let index = 0; index < datesArr.length; index++) {
            const fdate = datesArr[index];
            const fday = parseInt(fdate.split(["-"])[2]);
            const fmonth = parseInt(fdate.split(["-"])[1]);
            const fyear = parseInt(fdate.split(["-"])[0]);
            //console.log(fdate);
            let amount = await getSumLoanFondsByDate({
              sessionKey: sessionKey,
              day: fday,
              month: fmonth,
              year: fyear,
              officeKey: officeKey,
              type: "CUMUL",
            });
            total = total + amount;

            const paymentDate = new Date(
              Math.floor(new Date(fdate))
            ).toLocaleString("fr-FR", {
              month: "long",
              day: "numeric",
              year: "numeric",
              weekday: "long",
            });
            const fondsObj = {
              //timeStamp: new Date(fdate), // 2021-09-18T14:13:54.470Z
              //timeStamp: Math.floor(new Date(fdate)), // 1637193600000
              date: paymentDate, // 1637193600000
              amount: amount,
              coffreAmount: await getCOffreSoldeByDay({
                companyKey: companyKey,
                projectKey: projectKey,
                officeKey: officeKey,
                date: fdate,
              }),
            };

            fondsArr.push(fondsObj);
          }
          const data = {
            payments: fondsArr,
            sessionLabel: "",
            sessionDate: sessionDate,
            agence: agence["officeName"],
            total: total,
          };
          return { ...data };
        }
      }
    }
  },

  loanSessionFondsDownload: async ({
    sessionKey,
    companyKey,
    projectKey,
    officeKey,
    type,
  }) => {
    if (type == "SESSION") {
      // select session
      const session_cursor = await db.query(aql`FOR s IN loan_session 
      FILTER s._key == ${sessionKey} AND s.projectKey == ${projectKey} 
      AND s.companyKey == ${companyKey} RETURN s`);
      if (session_cursor.hasNext) {
        const session = await session_cursor.next();
        const sessionDate = new Date(session.sessionStamp).toLocaleString(
          "fr-FR",
          {
            month: "long",
            day: "numeric",
            year: "numeric",
            weekday: "long",
          }
        );
        const agence = await getOfficeDoc({ officeKey: session.officeKey });
        // select the loans
        const docs_cursor = await db.query(aql`FOR df IN loan_files
        FILTER df.sessionKey == ${sessionKey} 
        AND df.status == 'ACCORDÉ' SORT df.dateDecaissement RETURN df`);

        if (docs_cursor.hasNext) {
          const docs = await docs_cursor.all();
          let timeStamps = [];
          let datesArr = [];

          docs.map(async (doc) => {
            //console.log(`docKey: ${doc._key} > ${doc.montantCreditAccorde}`);
            timeStamps.push(doc.dateDecaissement);
            const date = new Date(doc.dateDecaissement);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const dateCons = `${year}-${month}-${day}`;
            if (!datesArr.includes(dateCons)) {
              datesArr.push(dateCons);
            }
          });
          if (datesArr.length > 0) {
            // select regords by date
            let fondsArr = [];
            let total = 0;

            for (let index = 0; index < datesArr.length; index++) {
              const fdate = datesArr[index];
              const fday = parseInt(fdate.split(["-"])[2]);
              const fmonth = parseInt(fdate.split(["-"])[1]);
              const fyear = parseInt(fdate.split(["-"])[0]);
              //console.log(fdate);
              let amount = await getSumLoanFondsByDate({
                sessionKey: sessionKey,
                day: fday,
                month: fmonth,
                year: fyear,
                officeKey: officeKey,
                type: "SESSION",
              });
              total = total + amount;

              const paymentDate = new Date(
                Math.floor(new Date(fdate))
              ).toLocaleString("fr-FR", {
                month: "long",
                day: "numeric",
                year: "numeric",
                weekday: "long",
              });
              const fondsObj = {
                //timeStamp: new Date(fdate), // 2021-09-18T14:13:54.470Z
                //timeStamp: Math.floor(new Date(fdate)), // 1637193600000
                date: paymentDate, // 1637193600000
                amount: amount,
                coffreAmount: await getCOffreSoldeByDay({
                  companyKey: companyKey,
                  projectKey: projectKey,
                  officeKey: officeKey,
                  date: fdate,
                }),
              };

              fondsArr.push(fondsObj);
            }
            const data = {
              payments: fondsArr,
              sessionLabel: session.sessionLabel,
              sessionDate: sessionDate,
              agence: agence["officeName"],
              total: total,
            };
            //console.log(data);
            const pdf = await _loanSessionFondsPdf({
              pdfName: `demande_de_fonds_session_${session._key}.pdf`,
              data: data,
            });
            return pdf;
          }
        }
      } else {
        throw new Error(`Impossible de sélectionner la session ${sessionKey}`);
      }
      // SUMUL
    } else {
      // select session
      const agence = await getOfficeDoc({ officeKey: officeKey });
      // select the loans
      const docs_cursor = await db.query(aql`FOR df IN loan_files
      FILTER df.officeKey == ${officeKey} 
      AND df.status == 'ACCORDÉ' SORT df.dateDecaissement RETURN df`);

      if (docs_cursor.hasNext) {
        const docs = await docs_cursor.all();
        let timeStamps = [];
        let datesArr = [];

        docs.map(async (doc) => {
          //console.log(`docKey: ${doc._key} > ${doc.montantCreditAccorde}`);
          timeStamps.push(doc.dateDecaissement);
          const date = new Date(doc.dateDecaissement);
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          const day = date.getDate();
          const dateCons = `${year}-${month}-${day}`;
          if (!datesArr.includes(dateCons)) {
            datesArr.push(dateCons);
          }
        });
        if (datesArr.length > 0) {
          // select regords by date
          let fondsArr = [];
          let total = 0;

          for (let index = 0; index < datesArr.length; index++) {
            const fdate = datesArr[index];
            const fday = parseInt(fdate.split(["-"])[2]);
            const fmonth = parseInt(fdate.split(["-"])[1]);
            const fyear = parseInt(fdate.split(["-"])[0]);
            //console.log(fdate);
            let amount = await getSumLoanFondsByDate({
              sessionKey: sessionKey,
              day: fday,
              month: fmonth,
              year: fyear,
              officeKey: officeKey,
              type: "CUMUL",
            });
            total = total + amount;

            const paymentDate = new Date(
              Math.floor(new Date(fdate))
            ).toLocaleString("fr-FR", {
              month: "long",
              day: "numeric",
              year: "numeric",
              weekday: "long",
            });
            const fondsObj = {
              date: paymentDate, // 1637193600000
              amount: amount,
              coffreAmount: await getCOffreSoldeByDay({
                companyKey: companyKey,
                projectKey: projectKey,
                officeKey: officeKey,
                date: fdate,
              }),
            };
            fondsArr.push(fondsObj);
          }
          const data = {
            sessionLabel: null,
            sessionDate: null,
            payments: fondsArr,
            agence: agence["officeName"],
            total: total,
          };
          //console.log(data);
          const pdf = await _loanSessionFondsPdf({
            pdfName: `demande_de_fonds_cumul_${officeKey}.pdf`,
            data: data,
          });
          return pdf;
        }
      }
    }
  },

  loanSessionDownloadZip: async ({ sessionKey, sessionName, officeName }) => {
    // check first if there is a previous backup
    const sessBackup_cursor = await db.query(aql`FOR bk IN loan_session_zip 
    FILTER bk.sessionKey == ${sessionKey} AND bk.type == 'ZIP' RETURN bk`);
    // no previous zip file found, proceed to generated
    if (!sessBackup_cursor.hasNext) {
      // select the session
      const session_cursor = await db.query(aql`FOR s IN loan_session 
      FILTER s._key == ${sessionKey} AND s.status == 'CLOS' RETURN s`);
      if (session_cursor.hasNext) {
        const session = await session_cursor.next();
        let objs = [];

        // loop through the studied file keys
        for (let findx = 0; findx < session.fileKeys.length; findx++) {
          const sessfileKey = session.fileKeys[findx];

          // select loan files
          const loan_file_doc = await db.query(
            aql`FOR lf IN loan_files 
          FILTER lf._key == ${sessfileKey} RETURN lf`
          );

          if (loan_file_doc.hasNext) {
            const doc = await loan_file_doc.next();

            const prod = await getLoanProductDoc({ key: doc.loanProductKey });
            const url = await loanFilesResolver.loanFileDownload({
              loanFileKey: doc._key,
              loanProductRef: prod.productType,
              mode: "FULL",
              folder: "sessions_pdf",
            });
            //console.log(url);
            objs.push({
              timeStamp: Date.now(),
              fileName: url,
              type: "PDF_CREDITS",
              sessionKey: sessionKey,
            });

            // select the client
            if (doc.clientKey != null) {
              // client_perfect
              const client_perfect_doc = await db.query(
                aql`FOR c IN clients_sig FILTER 
              c._key == ${doc.clientKey} RETURN c`
              );
              if (client_perfect_doc.hasNext) {
                const doc = await client_perfect_doc.next();
                const url = await clientSIGResolver.clientFicheDownload({
                  clientKey: doc._key,
                  folder: "sessions_pdf",
                });
                objs.push({
                  timeStamp: Date.now(),
                  fileName: url,
                  type: "PDF_CLIENTS",
                  sessionKey: sessionKey,
                });
              }
            }
          } // loan files
        }

        // get the proces verbal
        const url = await loanSessionResolver.loanSessionPvDownload({
          folder: "sessions_pdf",
          companyKey: session.companyKey,
          projectKey: session.projectKey,
          sessionKey: session._key,
        });
        objs.push({
          timeStamp: Date.now(),
          fileName: url,
          type: "PDF_PV",
          sessionKey: sessionKey,
        });

        // save to the backup table
        if (objs.length > 0) {
          await db.query(aql`FOR fn IN ${objs}
          INSERT fn INTO loan_session_zip RETURN NEW`);
        } // end pv

        const sNameStr = sessionName.replace(RegExp(/[^A-Za-z0-9]/g), "_");
        const oNameStr = officeName.replace(RegExp(/[^A-Za-z0-9]/g), "_");

        // zip the files
        const folderPath = `${sNameStr}_${oNameStr}_${sessionKey}.zip`;
        // construct a new zip object
        var zip = new AdmZip();
        // select files from the db
        const docsz_cursor = await db.query(
          aql`FOR f IN loan_session_zip 
          FILTER f.sessionKey == ${sessionKey} 
          AND f.type != 'ZIP' RETURN f`,
          { fullCount: true },
          { count: true }
        );
        if (docsz_cursor.hasNext) {
          const docsz = await docsz_cursor.all();
          for (let index = 0; index < docsz.length; index++) {
            const docz = docsz[index];
            if (fs.existsSync(`./sessions_pdf/${docz.fileName}`)) {
              zip.addLocalFile(`./sessions_pdf/${docz.fileName}`);
            }
          }
          // get everything as a buffer
          zip.toBuffer();
          // or write everything to disk
          zip.writeZip(`./BACKUPS/sessions_zip/${folderPath}`);
          // save to db
          const bkObj = {
            timeStamp: Date.now(),
            sessionKey: sessionKey,
            description: `Sauvegarde des dossiers de la session du ${sessionName}`,
            link: `${serverAppUrl}/BACKUPS/sessions_zip/${folderPath}`,
            type: "ZIP",
          };
          const doc_cursor = await db.query(
            aql`INSERT ${bkObj} INTO loan_session_zip RETURN NEW`
          );
          if (doc_cursor.hasNext) {
            // truncate sessions_pdf folder
            fs.readdir(`./sessions_pdf`, async (err, files) => {
              files.forEach((file) => {
                fs.unlinkSync(`./sessions_pdf/${file}`);
              });
            });

            // delete the files from the loan_session_zip collection
            // except the zip files
            await db.query(aql`FOR fx IN loan_session_zip 
            FILTER fx.sessionKey == ${sessionKey} AND fx.type != 'ZIP'
            REMOVE { _key: fx._key } IN loan_session_zip RETURN OLD`);

            // return the url
            return `${serverAppUrl}/BACKUPS/sessions_zip/${folderPath}`;
          } else {
            return null;
          }
        } else {
          return null;
        }
        // previous zip file found
      } else {
        return null;
      }
    } else {
      // previous zip file found, simply return it
      const sessBackup = await sessBackup_cursor.next();
      return sessBackup.link;
    }
  },
};

export default loanSessionResolver;
