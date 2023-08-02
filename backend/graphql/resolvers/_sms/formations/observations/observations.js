import { aql, db } from "../../../../../db/arangodb.js";
import { getOfficeDoc, getUserDoc } from "../../../../../helpers/joindocs.js";
import { getClientGroupDocs } from "../../../../../helpers/joindocs_loan.js";
import { getSMSFormationDoc } from "../../../../../helpers/joindocs_sms.js";

const smsFormationsObsResolver = {
  smsFormationsObsCreate: async ({
    obsLat,
    obsLong,
    obsStamp,
    projectKey,
    companyKey,
    officeKey,
    trainingKey,
    socialUserKey,
    socialUserRef,
    animateurKey,
    animateurRef,
    groupKeys,
    groupNames,
    comment,
  }) => {
    const obj = {
      timeStamp: Date.now(),
      obsLat: obsLat,
      obsLong: obsLong,
      obsStamp: obsStamp,
      projectKey: projectKey,
      companyKey: companyKey,
      officeKey: officeKey,
      trainingKey: trainingKey,
      socialUserKey: socialUserKey,
      socialUserRef: socialUserRef,
      animateurKey: animateurKey,
      animateurRef: animateurRef,
      groupKeys: groupKeys,
      groupNames: groupNames,
      comment: comment,
      adminKey: null,
      signatureSocialUser: null,
      signatureAnimateur: null,
      adminComments: [],
      status: "Pending",
    };

    const doc_cursor = await db.query(aql`INSERT ${obj} 
    INTO sms_formations_obs RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Erreur lors de la création de l'observation`;
    }
  },

  smsFormationsObsUpdate: async ({
    docKey,
    obsStamp,
    officeKey,
    trainingKey,
    groupKeys,
    groupNames,
    comment,
  }) => {
    const obj = {
      obsStamp: obsStamp,
      officeKey: officeKey,
      trainingKey: trainingKey,
      groupKeys: groupKeys,
      groupNames: groupNames,
      comment: comment,
    };
    const doc_cursor = await db.query(aql`UPDATE ${docKey} 
    WITH ${obj} IN sms_formations_obs RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Erreur lors de la mise à jour de l'observation`;
    }
  },

  getSmsFormationsObs: async ({
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
        aql`FOR p IN sms_formations_obs  
            FILTER p.companyKey == ${companyKey} 
            AND p.projectKey == ${projectKey} 
            AND p.socialUserKey == ${socialUserKey} 
            AND p.obsStamp >= ${dateFrom} AND p.obsStamp <= ${dateTo}
            SORT p.obsStamp DESC LIMIT ${skip}, ${perPage} RETURN p`,
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
            ...(doc.groupKeys = await getClientGroupDocs({
              keysArr: doc.groupKeys,
            })),
            ...(doc.trainingKey = await getSMSFormationDoc({
              docKey: doc.trainingKey,
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

            ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
            ...doc,
          };
        });
      } else {
        return [];
      }
    } else if (coverage == "Antenne") {
      const docs_cursor = await db.query(
        aql`FOR p IN sms_formations_obs  
          FILTER p.companyKey == ${companyKey} 
          AND p.projectKey == ${projectKey} 
          AND p.officeKey == ${officeKey} 
          AND p.obsStamp >= ${dateFrom} AND p.obsStamp <= ${dateTo}
          SORT p.obsStamp DESC LIMIT ${skip}, ${perPage} RETURN p`,
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
            ...(doc.groupKeys = await getClientGroupDocs({
              keysArr: doc.groupKeys,
            })),
            ...(doc.trainingKey = await getSMSFormationDoc({
              docKey: doc.trainingKey,
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

            ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
            ...doc,
          };
        });
      } else {
        return [];
      }
    } else if (coverage == "Globale") {
      const docs_cursor = await db.query(
        aql`FOR p IN sms_formations_obs  
      FILTER p.companyKey == ${companyKey} 
      AND p.projectKey == ${projectKey} 
      AND p.obsStamp >= ${dateFrom} AND p.obsStamp <= ${dateTo}
      SORT p.obsStamp DESC LIMIT ${skip}, ${perPage} RETURN p`,
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
            ...(doc.groupKeys = await getClientGroupDocs({
              keysArr: doc.groupKeys,
            })),
            ...(doc.trainingKey = await getSMSFormationDoc({
              docKey: doc.trainingKey,
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

            ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
            ...doc,
          };
        });
      } else {
        return [];
      }
    } // end Globale
  },

  smsFormationsObsDelete: async ({ docKey }) => {
    // can delete
    const doc_cursor = await db.query(aql`REMOVE ${docKey} IN 
      sms_formations_obs RETURN OLD`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Une erreur s'est produite lors de la suppression de l'observation`;
    }
  },

  smsFormationsObsApproveOrReject: async ({
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
     WITH ${obj} IN sms_formations_obs RETURN NEW`);
      if (doc_cursor.hasNext) {
        return "SUCCESS";
      } else {
        return `Une erreur s'est produite lors de l'approbation de l'observation`;
      }
    } else {
      const data_cursor = await db.query(aql`FOR d IN sms_formations_obs 
      FILTER d._key == ${docKey} RETURN d`);
      if (data_cursor.hasNext) {
        const data = await data_cursor.next();
        let commentArr = data.adminComments;
        commentArr.push(comment);

        const doc_cursor = await db.query(aql`UPDATE ${docKey} 
        WITH { status: "Rejected", rejectStamp: ${Date.now()},
        adminKey: ${adminKey}, adminComments: ${commentArr} }
        IN sms_formations_obs RETURN NEW`);
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

export default smsFormationsObsResolver;
