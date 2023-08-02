import { aql, db } from "../../../../db/arangodb.js";
import {
  getOfficeDoc,
  getPerfectClientDoc,
  getUserDoc,
} from "../../../../helpers/joindocs.js";
import {
  getSMSActivityThemeDoc,
  getSMSSocialPartnerDocs,
} from "../../../../helpers/joindocs_sms.js";

const smsCauseriesResolver = {
  smsCauseriesCreate: async ({
    eventStamp,
    companyKey,
    projectKey,
    officeKey,
    timeSpan,
    trainingThemeKey,
    trainingThemeDetail,
    socialPartnerKeys,
    socialPartnerNames,
    eventLat,
    eventLong,
    socialUserKey,
    socialUserRef,
  }) => {
    const obj = {
      timeStamp: Date.now(),
      eventStamp: eventStamp,
      companyKey: companyKey,
      projectKey: projectKey,
      officeKey: officeKey,
      timeSpan: timeSpan,
      trainingThemeKey: trainingThemeKey,
      trainingThemeDetail: trainingThemeDetail,
      eventLat: eventLat,
      eventLong: eventLong,
      socialUserKey: socialUserKey,
      socialUserRef: socialUserRef,
      socialPartnerKeys: socialPartnerKeys,
      socialPartnerNames: socialPartnerNames,
      benefCountDirect: 0,
      benefCountIndirect: 0,
      presenceList: [],
      adminKey: null,
      comment: null,
      photo: null,
      photo1: null,
      photo2: null,
      photo3: null,
      approveStamp: null,
      lockStamp: null,
      rejectStamp: null,
      startStamp: null,
      adminComments: [],
      status: "Pending",
    };

    const doc_cursor = await db.query(aql`INSERT ${obj} 
    INTO sms_causeries RETURN NEW`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return "SUCCESS";
    } else {
      return `Erreur lors de la création de la causerie`;
    }
  },

  smsCauseriesUpdate: async ({
    docKey,
    eventStamp,
    officeKey,
    timeSpan,
    trainingThemeDetail,
    socialPartnerKeys,
    socialPartnerNames,
  }) => {
    const obj = {
      docKey: docKey,
      eventStamp: eventStamp,
      officeKey: officeKey,
      timeSpan: timeSpan,
      trainingThemeDetail: trainingThemeDetail,
      socialPartnerKeys: socialPartnerKeys,
      socialPartnerNames: socialPartnerNames,
    };
    const doc_cursor = await db.query(aql`UPDATE ${docKey} 
    WITH ${obj} IN sms_causeries RETURN NEW`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return "SUCCESS";
    } else {
      return `Erreur lors de la mise à jour de la causerie`;
    }
  },

  SMSCauseries: async ({
    companyKey,
    projectKey,
    officeKey,
    skip,
    perPage,
    socialUserKey,
    coverage,
    dateFrom,
    dateTo,
  }) => {
    if (coverage == "Utilisateur") {
      const docs_cursor = await db.query(
        aql`FOR p IN sms_causeries  
            FILTER p.companyKey == ${companyKey} 
            AND p.projectKey == ${projectKey} 
            AND p.socialUserKey == ${socialUserKey} 
            AND p.eventStamp >= ${dateFrom} 
            AND p.eventStamp <= ${dateTo}
            SORT p.eventStamp DESC LIMIT ${skip}, ${perPage} RETURN p`,
        { fullCount: true },
        { count: true }
      );
      if (docs_cursor.hasNext) {
        const docs = await docs_cursor.all();
        return docs.map(async (doc) => {
          return {
            ...(doc.officeKey = await getOfficeDoc({
              officeKey: doc.officeKey,
            })),
            ...(doc.trainingThemeKey = await getSMSActivityThemeDoc({
              docKey: doc.trainingThemeKey,
            })),
            ...(doc.socialPartnerKeys = await getSMSSocialPartnerDocs({
              docKeyArr: doc.socialPartnerKeys,
            })),
            ...(doc.socialUserKey = await getUserDoc({
              userKey: doc.socialUserKey,
            })),
            ...(doc.adminKey =
              doc.adminKey != null
                ? await getUserDoc({
                    userKey: doc.adminKey,
                  })
                : null),
            ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
            ...doc,
          };
        });
      } else {
        return [];
      }
    } else if (coverage == "Antenne") {
      const docs_cursor = await db.query(
        aql`FOR p IN sms_causeries  
          FILTER p.companyKey == ${companyKey} 
          AND p.projectKey == ${projectKey} 
          AND p.officeKey == ${officeKey} 
          AND p.eventStamp >= ${dateFrom} AND p.eventStamp <= ${dateTo}
          SORT p.eventStamp DESC LIMIT ${skip}, ${perPage} RETURN p`,
        { fullCount: true },
        { count: true }
      );
      if (docs_cursor.hasNext) {
        const docs = await docs_cursor.all();
        return docs.map(async (doc) => {
          return {
            ...(doc.officeKey = await getOfficeDoc({
              officeKey: doc.officeKey,
            })),
            ...(doc.trainingThemeKey = await getSMSActivityThemeDoc({
              docKey: doc.trainingThemeKey,
            })),
            ...(doc.socialPartnerKeys = await getSMSSocialPartnerDocs({
              docKeyArr: doc.socialPartnerKeys,
            })),
            ...(doc.socialUserKey = await getUserDoc({
              userKey: doc.socialUserKey,
            })),
            ...(doc.adminKey =
              doc.adminKey != null
                ? await getUserDoc({
                    userKey: doc.adminKey,
                  })
                : null),
            ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
            ...doc,
          };
        });
      } else {
        return [];
      }
    } else if (coverage == "Globale") {
      const docs_cursor = await db.query(
        aql`FOR p IN sms_causeries  
      FILTER p.companyKey == ${companyKey} 
      AND p.projectKey == ${projectKey} 
      AND p.eventStamp >= ${dateFrom} AND p.eventStamp <= ${dateTo}
      SORT p.eventStamp DESC LIMIT ${skip}, ${perPage} RETURN p`,
        { fullCount: true },
        { count: true }
      );
      if (docs_cursor.hasNext) {
        const docs = await docs_cursor.all();
        return docs.map(async (doc) => {
          return {
            ...(doc.officeKey = await getOfficeDoc({
              officeKey: doc.officeKey,
            })),
            ...(doc.trainingThemeKey = await getSMSActivityThemeDoc({
              docKey: doc.trainingThemeKey,
            })),
            ...(doc.socialPartnerKeys = await getSMSSocialPartnerDocs({
              docKeyArr: doc.socialPartnerKeys,
            })),
            ...(doc.socialUserKey = await getUserDoc({
              userKey: doc.socialUserKey,
            })),
            ...(doc.adminKey =
              doc.adminKey != null
                ? await getUserDoc({
                    userKey: doc.adminKey,
                  })
                : null),
            ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
            ...doc,
          };
        });
      } else {
        return [];
      }
    } // end Globale
  },

  smsCauseriesDelete: async ({ docKey }) => {
    // can delete
    const doc_cursor = await db.query(aql`REMOVE ${docKey} IN 
    sms_causeries RETURN OLD`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Une erreur s'est produite lors de la suppression de la causerie`;
    }
  },

  smsCauseriesApproveOrReject: async ({
    docKey,
    action,
    adminKey,
    comment,
  }) => {
    let obj;
    switch (action) {
      case "Approuver":
        obj = {
          status: "Approved",
          approveStamp: Date.now(),
          adminKey: adminKey,
        };
        break;
      case "Rejeter":
        obj = {
          status: "Rejected",
          rejectStamp: Date.now(),
          adminKey: adminKey,
        };
        break;
      case "Boucler la participation":
        obj = {
          status: "Locked",
          lockStamp: Date.now(),
        };
        break;
      case "Démarrer la session":
        obj = {
          status: "Ongoing",
          startStamp: Date.now(),
        };
        break;

      default:
        break;
    }

    if (action != "Rejeter") {
      const doc_cursor = await db.query(aql`UPDATE ${docKey} 
      WITH ${obj} IN sms_causeries RETURN NEW`);
      if (doc_cursor.hasNext) {
        return "SUCCESS";
      } else {
        return `Une erreur s'est produite lors de l'approbation de la causerie`;
      }
    } else {
      // reject
      const data_cursor = await db.query(aql`FOR d IN sms_causeries 
      FILTER d._key == ${docKey} RETURN d`);
      if (data_cursor.hasNext) {
        const data = await data_cursor.next();
        let commentArr = data.adminComments;
        commentArr.push(comment);

        const doc_cursor = await db.query(aql`UPDATE ${docKey} 
        WITH { status: "Rejected", rejectStamp: ${Date.now()},
        adminKey: ${adminKey}, adminComments: ${commentArr} }
        IN sms_causeries RETURN NEW`);
        if (doc_cursor.hasNext) {
          return "SUCCESS";
        } else {
          return `Une erreur s'est produite lors de l'approbation`;
        }
      } else {
        return `Désolé, une erreur s'est produite. Essayez de nouveau ou contactez l'administrateur`;
      }
    }
  },

  smsCauseriesClose: async ({
    docKey,
    comment,
    benefCountDirect,
    benefCountIndirect,
  }) => {
    const obj = {
      status: "Closed",
      closeStamp: Date.now(),
      comment: comment,
      benefCountDirect: benefCountDirect,
      benefCountIndirect: benefCountIndirect,
    };
    const doc_cursor = await db.query(aql`UPDATE ${docKey} 
     WITH ${obj} IN sms_causeries RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Une erreur s'est produite lors de la clôture de la causerie`;
    }
  },

  smsCauseriesSetPresence: async ({
    docKey,
    clientKey,
    round,
    isPresent,
    presenceStamp,
  }) => {
    // select the existing causerie
    const causerie_cursor = await db.query(aql`FOR c IN sms_causeries 
     FILTER c._key == ${docKey} RETURN c`);
    if (causerie_cursor.hasNext) {
      const causerie = await causerie_cursor.next();
      let otherParticipants = [];
      // grab the existing participants list
      otherParticipants = causerie.presenceList.filter(
        (el) => el.clientKey !== clientKey
      );
      let thisParticipant = causerie.presenceList.find(
        (el) => el.clientKey === clientKey
      );
      // if the participant if found
      if (thisParticipant !== undefined && otherParticipants.length > 0) {
        if (round == "Début") {
          thisParticipant["stampStart"] = presenceStamp;
          thisParticipant["isPresentAtStart"] = isPresent;
        } else if (round == "Fin") {
          thisParticipant["stampEnd"] = presenceStamp;
          thisParticipant["isPresentAtEnd"] = isPresent;
        }
        // add the new participant to the list
        otherParticipants.push(thisParticipant);
        // update the participants list
        const update_doc = await db.query(aql`UPDATE ${causerie._key} 
        WITH { presenceList: ${otherParticipants} } 
        IN sms_causeries RETURN NEW`);
        if (update_doc.hasNext) {
          return "SUCCESS";
        } else {
          return `Une erreur s'est produite lors de la mise à jour de la liste des présences`;
        }
      } else {
        return `Une erreur s'est produite dans le traitement de la liste des participants`;
      }
    } else {
      return `Une erreur s'est produite lors de la sélection de la causerie`;
    }
  },

  smsCauseriesAddOrRemoveParticipant: async ({
    docKey,
    action,
    clientKeys,
  }) => {
    // add participant
    if (action == "Add") {
      // select the existing causerie
      const causerie_cursor = await db.query(aql`FOR c IN sms_causeries 
      FILTER c._key == ${docKey} RETURN c`);
      if (causerie_cursor.hasNext) {
        const causerie = await causerie_cursor.next();
        // grab the existing participants list
        let participantsList = causerie.presenceList;
        // loop through the client keys
        for (let index = 0; index < clientKeys.length; index++) {
          const clientKey = clientKeys[index];
          const client = await getPerfectClientDoc({
            clientKey: clientKeys[index],
          });
          // build the participant obj
          const participantObj = {
            clientKey: clientKey,
            codeSig: client.code,
            clientFullName: client.fullName,
            clientPhone: client.phone,
            groupName: client.groupName,
            isPresentAtStart: false,
            isPresentAtEnd: false,
            stampStart: null,
            stampEnd: null,
          };
          // check if the clientKey is already in the existing participant list
          let exists = participantsList.find(
            (el) => el.clientKey === clientKey
          );
          //console.log(`${clientKey} exists ? : ${exists}`);
          if (exists === undefined) {
            // client is not in the existing list, add it
            participantsList.push(participantObj);
          }
        } // end for loop
        // update the participants list
        const update_doc = await db.query(aql`UPDATE ${causerie._key} 
        WITH { presenceList: ${participantsList} } 
        IN sms_causeries RETURN NEW`);
        if (update_doc.hasNext) {
          return "SUCCESS";
        } else {
          return `Erreur lors de la mise à jour de la liste des participants`;
        }
      } else {
        return `Une erreur s'est produite lors de l'ajout du ou des participant(s)`;
      }
      // remove participant from the list
    } else if (action == "Remove") {
      // select the existing causerie
      const causerie_cursor = await db.query(aql`FOR c IN sms_causeries 
      FILTER c._key == ${docKey} RETURN c`);
      if (causerie_cursor.hasNext) {
        const causerie = await causerie_cursor.next();
        // grab the existing participants list
        let participantsList = causerie.presenceList;
        let newParticipants = [];
        // loop through the client keys
        const clientKey = clientKeys[0];
        // filter the existing participants list
        newParticipants = participantsList.filter(
          (el) => el.clientKey !== clientKey
        );

        // update the participants list
        const update_doc = await db.query(aql`UPDATE ${causerie._key} 
        WITH { presenceList: ${newParticipants} } 
        IN sms_causeries RETURN NEW`);
        if (update_doc.hasNext) {
          return "OK";
        } else {
          throw new Error(
            `Erreur lors de la mise à jour de la liste des participants`
          );
        }
      } else {
        return `Une erreur s'est produite lors de l'ajout du ou des participant(s)`;
      }
    }
  },
};

export default smsCauseriesResolver;
