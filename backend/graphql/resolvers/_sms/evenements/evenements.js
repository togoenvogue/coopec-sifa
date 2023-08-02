import { aql, db } from "../../../../db/arangodb.js";
import { getOfficeDoc, getUserDoc } from "../../../../helpers/joindocs.js";
import {
  getSMSActivityThemeDoc,
  getSMSSocialPartnerDocs,
} from "../../../../helpers/joindocs_sms.js";

const smsEvenementsResolver = {
  smsEvenementsCreate: async ({
    projectKey,
    companyKey,
    officeKey,
    eventStamp,
    eventThemeKey,
    eventThemeDetail,
    socialUserKey,
    socialUserRef,
    socialPartnerKeys,
    socialPartnerNames,
    eventLat,
    eventLong,
  }) => {
    const obj = {
      timeStamp: Date.now(),
      projectKey: projectKey,
      companyKey: companyKey,
      officeKey: officeKey,
      eventStamp: eventStamp,
      eventThemeKey: eventThemeKey,
      eventThemeDetail: eventThemeDetail,
      socialUserKey: socialUserKey,
      socialUserRef: socialUserRef,
      socialPartnerKeys: socialPartnerKeys,
      socialPartnerNames: socialPartnerNames,
      totalParticipantDirect: 0,
      totalParticipantInDirect: 0,
      comment: null,
      eventLat: eventLat,
      eventLong: eventLong,
      status: "Pending",
      adminKey: null,
      approveStamp: null,
      rejectStamp: null,
      closeStamp: null,
      photo: null,
      photo1: null,
      photo2: null,
      photo3: null,
      adminComments: [],
    };

    const doc_cursor = await db.query(aql`INSERT ${obj} 
    INTO sms_evenements RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Erreur lors de la création de l'événement`;
    }
  },

  smsEvenementsUpdate: async ({
    docKey,
    officeKey,
    eventStamp,
    eventThemeDetail,
    socialPartnerKeys,
    socialPartnerNames,
    totalParticipantDirect,
    totalParticipantInDirect,
    comment,
  }) => {
    const obj = {
      docKey: docKey,
      officeKey: officeKey,
      eventStamp: eventStamp,
      eventThemeDetail: eventThemeDetail,
      socialPartnerKeys: socialPartnerKeys,
      socialPartnerNames: socialPartnerNames,
      totalParticipantDirect: totalParticipantDirect,
      totalParticipantInDirect: totalParticipantInDirect,
      comment: comment,
    };
    const doc_cursor = await db.query(aql`UPDATE ${docKey} 
    WITH ${obj} IN sms_evenements RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Erreur lors de la mise à jour de l'événement`;
    }
  },

  smsEvenements: async ({
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
        aql`FOR p IN sms_evenements  
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
            ...(doc.eventThemeKey = await getSMSActivityThemeDoc({
              docKey: doc.eventThemeKey,
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
        aql`FOR p IN sms_evenements  
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
            ...(doc.eventThemeKey = await getSMSActivityThemeDoc({
              docKey: doc.eventThemeKey,
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
        aql`FOR p IN sms_evenements  
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
            ...(doc.eventThemeKey = await getSMSActivityThemeDoc({
              docKey: doc.eventThemeKey,
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

  smsEvenementsDelete: async ({ docKey }) => {
    // can delete
    const doc_cursor = await db.query(aql`REMOVE ${docKey} IN 
    sms_evenements RETURN OLD`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Une erreur s'est produite lors de la suppression de l'événement`;
    }
  },

  smsEvenementsApproveOrReject: async ({
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
      case "Clôturer la session":
        obj = {
          status: "Closed",
          closeStamp: Date.now(),
        };
        break;

      default:
        break;
    }

    if (action != "Rejeter") {
      const doc_cursor = await db.query(aql`UPDATE ${docKey} 
     WITH ${obj} IN sms_evenements RETURN NEW`);
      if (doc_cursor.hasNext) {
        return "SUCCESS";
      } else {
        return `Une erreur s'est produite lors de l'approbation de l'événement`;
      }
    } else {
      // reject
      const data_cursor = await db.query(aql`FOR d IN sms_evenements 
      FILTER d._key == ${docKey} RETURN d`);
      if (data_cursor.hasNext) {
        const data = await data_cursor.next();
        let commentArr = data.adminComments;
        commentArr.push(comment);

        const doc_cursor = await db.query(aql`UPDATE ${docKey} 
        WITH { status: "Rejected", rejectStamp: ${Date.now()},
        adminKey: ${adminKey}, adminComments: ${commentArr} }
        IN sms_evenements RETURN NEW`);
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
};

export default smsEvenementsResolver;
