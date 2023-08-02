import { aql, db } from "../../../../../db/arangodb.js";
import {
  getOfficeDoc,
  getPerfectClientDoc,
  getUserDoc,
} from "../../../../../helpers/joindocs.js";
import {
  getSMSSocialPartnerDoc,
  getSMSSuivisActionDoc,
  getSMSSuivisClientStatusDoc,
  getSMSSuivisObjetDoc,
} from "../../../../../helpers/joindocs_sms.js";

const smsSuivisDataResolver = {
  smsSuivisDataCreate: async ({
    suiviStamp,
    suiviLat,
    suiviLong,
    projectKey,
    companyKey,
    officeKey,
    socialUserKey,
    socialUserRef,
    animateurKey,
    clientKey,
    clientSocialMaritus,
    clientCreditStatus,
    suiviNumber,
    suiviLocation,
    suiviLocationAutre,
    suiviObjetKey,
    suiviObjetAutre,
    suiviComment,
    suiviLastRef,
    suiviLastRefSocialPartnerKey,
    suiviLastRefDate,
    suiviLastRefQualif,
    suiviLastRefComment,
    suiviClientStatusKey,
    suiviNextActionKey,
    suiviNextActionDate,
    suiviNextActionSocialPartnerKey,
    suiviNextActionLocation,
    suiviNextActionComment,
  }) => {
    const obj = {
      timeStamp: Date.now(),
      suiviStamp: suiviStamp,
      suiviLat: suiviLat,
      suiviLong: suiviLong,
      projectKey: projectKey,
      companyKey: companyKey,
      officeKey: officeKey,
      socialUserKey: socialUserKey,
      socialUserRef: socialUserRef,
      animateurKey: animateurKey,
      clientKey: clientKey,
      clientSocialMaritus: clientSocialMaritus,
      clientCreditStatus: clientCreditStatus,
      suiviNumber: suiviNumber,
      suiviLocation: suiviLocation,
      suiviLocationAutre: suiviLocationAutre,
      suiviObjetKey: suiviObjetKey,
      suiviObjetAutre: suiviObjetAutre,
      suiviComment: suiviComment,
      suiviLastRef: suiviLastRef,
      suiviLastRefSocialPartnerKey: suiviLastRefSocialPartnerKey,
      suiviLastRefDate: suiviLastRefDate,
      suiviLastRefQualif: suiviLastRefQualif,
      suiviLastRefComment: suiviLastRefComment,
      suiviClientStatusKey: suiviClientStatusKey,
      suiviNextActionKey: suiviNextActionKey,
      suiviNextActionDate: suiviNextActionDate,
      suiviNextActionSocialPartnerKey: suiviNextActionSocialPartnerKey,
      suiviNextActionLocation: suiviNextActionLocation,
      suiviNextActionComment: suiviNextActionComment,
      signatureClient: null,
      signatureSocialUser: null,
      adminKey: null,
      adminComments: [],
      status: "Pending",
    };

    const doc_cursor = await db.query(aql`INSERT ${obj} 
    INTO sms_suivis_data RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Erreur lors de la création du statut partenaire`;
    }
  },

  smsSuivisDataUpdate: async ({
    docKey,
    suiviStamp,
    officeKey,
    clientKey,
    clientSocialMaritus,
    clientCreditStatus,
    suiviNumber,
    suiviLocation,
    suiviLocationAutre,
    suiviObjetKey,
    suiviObjetAutre,
    suiviComment,
    suiviLastRef,
    suiviLastRefSocialPartnerKey,
    suiviLastRefDate,
    suiviLastRefQualif,
    suiviLastRefComment,
    suiviClientStatusKey,
    suiviNextActionKey,
    suiviNextActionDate,
    suiviNextActionSocialPartnerKey,
    suiviNextActionLocation,
    suiviNextActionComment,
  }) => {
    const obj = {
      suiviStamp: suiviStamp,
      officeKey: officeKey,
      clientKey: clientKey,
      clientSocialMaritus: clientSocialMaritus,
      clientCreditStatus: clientCreditStatus,
      suiviNumber: suiviNumber,
      suiviLocation: suiviLocation,
      suiviLocationAutre: suiviLocationAutre,
      suiviObjetKey: suiviObjetKey,
      suiviObjetAutre: suiviObjetAutre,
      suiviComment: suiviComment,
      suiviLastRef: suiviLastRef,
      suiviLastRefSocialPartnerKey: suiviLastRefSocialPartnerKey,
      suiviLastRefDate: suiviLastRefDate,
      suiviLastRefQualif: suiviLastRefQualif,
      suiviLastRefComment: suiviLastRefComment,
      suiviClientStatusKey: suiviClientStatusKey,
      suiviNextActionKey: suiviNextActionKey,
      suiviNextActionDate: suiviNextActionDate,
      suiviNextActionSocialPartnerKey: suiviNextActionSocialPartnerKey,
      suiviNextActionLocation: suiviNextActionLocation,
      suiviNextActionComment: suiviNextActionComment,
    };
    const doc_cursor = await db.query(aql`UPDATE ${docKey} 
    WITH ${obj} IN sms_suivis_data RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Erreur lors de la mise à jour du suivi`;
    }
  },

  smsSuivisData: async ({
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
        aql`FOR p IN sms_suivis_data  
            FILTER p.companyKey == ${companyKey} 
            AND p.projectKey == ${projectKey} 
            AND p.socialUserKey == ${socialUserKey} 
            AND p.suiviStamp >= ${dateFrom} AND p.suiviStamp <= ${dateTo}
            SORT p.suiviStamp DESC LIMIT ${skip}, ${perPage} RETURN p`,
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
            ...(doc.suiviNextActionKey = await getSMSSuivisActionDoc({
              docKey: doc.suiviNextActionKey,
            })),
            ...(doc.suiviClientStatusKey = await getSMSSuivisClientStatusDoc({
              docKey: doc.suiviClientStatusKey,
            })),
            ...(doc.clientKey = await getPerfectClientDoc({
              clientKey: doc.clientKey,
            })),
            ...(doc.animateurKey = await getUserDoc({
              userKey: doc.animateurKey,
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
            ...(doc.suiviObjetKey = await getSMSSuivisObjetDoc({
              docKey: doc.suiviObjetKey,
            })),
            ...(doc.suiviLastRefSocialPartnerKey = await getSMSSocialPartnerDoc(
              {
                docKey: doc.suiviLastRefSocialPartnerKey,
              }
            )),
            ...(doc.suiviNextActionSocialPartnerKey =
              await getSMSSocialPartnerDoc({
                docKey: doc.suiviNextActionSocialPartnerKey,
              })),
            ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
            ...doc,
          };
        });
      } else {
        return [];
      }
    } else if (coverage == "Antenne") {
      const docs_cursor = await db.query(
        aql`FOR p IN sms_suivis_data  
          FILTER p.companyKey == ${companyKey} 
          AND p.projectKey == ${projectKey} 
          AND p.officeKey == ${officeKey} 
          AND p.suiviStamp >= ${dateFrom} AND p.suiviStamp <= ${dateTo}
          SORT p.suiviStamp DESC LIMIT ${skip}, ${perPage} RETURN p`,
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
            ...(doc.suiviNextActionKey = await getSMSSuivisActionDoc({
              docKey: doc.suiviNextActionKey,
            })),
            ...(doc.suiviClientStatusKey = await getSMSSuivisClientStatusDoc({
              docKey: doc.suiviClientStatusKey,
            })),
            ...(doc.clientKey = await getPerfectClientDoc({
              clientKey: doc.clientKey,
            })),
            ...(doc.animateurKey = await getUserDoc({
              userKey: doc.animateurKey,
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
            ...(doc.suiviObjetKey = await getSMSSuivisObjetDoc({
              docKey: doc.suiviObjetKey,
            })),
            ...(doc.suiviLastRefSocialPartnerKey = await getSMSSocialPartnerDoc(
              {
                docKey: doc.suiviLastRefSocialPartnerKey,
              }
            )),
            ...(doc.suiviNextActionSocialPartnerKey =
              await getSMSSocialPartnerDoc({
                docKey: doc.suiviNextActionSocialPartnerKey,
              })),
            ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
            ...doc,
          };
        });
      } else {
        return [];
      }
    } else if (coverage == "Globale") {
      const docs_cursor = await db.query(
        aql`FOR p IN sms_suivis_data  
          FILTER p.companyKey == ${companyKey} 
          AND p.projectKey == ${projectKey} 
          AND p.suiviStamp >= ${dateFrom} AND p.suiviStamp <= ${dateTo}
          SORT p.suiviStamp DESC LIMIT ${skip}, ${perPage} RETURN p`,
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
            ...(doc.suiviNextActionKey = await getSMSSuivisActionDoc({
              docKey: doc.suiviNextActionKey,
            })),
            ...(doc.suiviClientStatusKey = await getSMSSuivisClientStatusDoc({
              docKey: doc.suiviClientStatusKey,
            })),
            ...(doc.clientKey = await getPerfectClientDoc({
              clientKey: doc.clientKey,
            })),
            ...(doc.animateurKey = await getUserDoc({
              userKey: doc.animateurKey,
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
            ...(doc.suiviObjetKey = await getSMSSuivisObjetDoc({
              docKey: doc.suiviObjetKey,
            })),
            ...(doc.suiviLastRefSocialPartnerKey = await getSMSSocialPartnerDoc(
              {
                docKey: doc.suiviLastRefSocialPartnerKey,
              }
            )),
            ...(doc.suiviNextActionSocialPartnerKey =
              await getSMSSocialPartnerDoc({
                docKey: doc.suiviNextActionSocialPartnerKey,
              })),
            ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
            ...doc,
          };
        });
      } else {
        return [];
      }
    } // end Globale
  },

  smsSuivisDataDelete: async ({ docKey }) => {
    // can delete
    const doc_cursor = await db.query(aql`REMOVE ${docKey} IN 
      sms_suivis_data RETURN OLD`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Une erreur s'est produite lors de la suppression du suivi`;
    }
  },

  smsSuivisDataApproveOrReject: async ({
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
     WITH ${obj} IN sms_suivis_data RETURN NEW`);
      if (doc_cursor.hasNext) {
        return "SUCCESS";
      } else {
        return `Une erreur s'est produite lors de l\'approbation du suivi`;
      }
    } else {
      const data_cursor = await db.query(aql`FOR d IN sms_suivis_data 
      FILTER d._key == ${docKey} RETURN d`);
      if (data_cursor.hasNext) {
        const data = await data_cursor.next();
        let commentArr = data.adminComments;
        commentArr.push(comment);

        const doc_cursor = await db.query(aql`UPDATE ${docKey} 
        WITH { status: "Rejected", rejectStamp: ${Date.now()},
        adminKey: ${adminKey}, adminComments: ${commentArr} }
        IN sms_suivis_data RETURN NEW`);
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

export default smsSuivisDataResolver;
