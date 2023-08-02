import { aql, db } from "../../../../../db/arangodb.js";
import { getOfficeDoc, getUserDoc } from "../../../../../helpers/joindocs.js";

const smsMonthlyReportResolver = {
  smsMonthlyReportsCreate: async ({
    companyKey,
    projectKey,
    officeKey,
    socialUserKey,
    socialUserRef,
    month,
    year,
    ecoute_1,
    ecoute_2,
    ecoute_3,
    ecoute_4,
    referencement_1,
    referencement_2,
    referencement_3,
    referencement_4,
    causerie_1,
    causerie_2,
    causerie_3,
    causerie_4,
    causerie_5,
    evenement_1,
    evenement_2,
    evenement_3,
    formation_oper_1,
    formation_oper_2,
    observation_1,
    observation_2,
    observation_3,
  }) => {
    const obj = {
      timeStamp: Date.now(),
      companyKey: companyKey,
      projectKey: projectKey,
      officeKey: officeKey,
      socialUserKey: socialUserKey,
      socialUserRef: socialUserRef,
      month: month,
      year: year,
      ecoute_1: ecoute_1,
      ecoute_2: ecoute_2,
      ecoute_3: ecoute_3,
      ecoute_4: ecoute_4,
      referencement_1: referencement_1,
      referencement_2: referencement_2,
      referencement_3: referencement_3,
      referencement_4: referencement_4,
      causerie_1: causerie_1,
      causerie_2: causerie_2,
      causerie_3: causerie_3,
      causerie_4: causerie_4,
      causerie_5: causerie_5,
      evenement_1: evenement_1,
      evenement_2: evenement_2,
      evenement_3: evenement_3,
      formation_oper_1: formation_oper_1,
      formation_oper_2: formation_oper_2,
      observation_1: observation_1,
      observation_2: observation_2,
      observation_3: observation_3,
      adminStamp: null,
      adminKey: null,
      adminComments: [],
      status: "Pending",
    };

    const doc_cursor = await db.query(aql`INSERT ${obj} 
    INTO sms_monthly_reports RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Erreur lors de la création de la formation`;
    }
  },

  smsMonthlyReportsUpdate: async ({
    docKey,
    month,
    year,
    ecoute_1,
    ecoute_2,
    ecoute_3,
    ecoute_4,
    referencement_1,
    referencement_2,
    referencement_3,
    referencement_4,
    causerie_1,
    causerie_2,
    causerie_3,
    causerie_4,
    causerie_5,
    evenement_1,
    evenement_2,
    evenement_3,
    formation_oper_1,
    formation_oper_2,
    observation_1,
    observation_2,
    observation_3,
  }) => {
    const obj = {
      docKey: docKey,
      month: month,
      year: year,
      ecoute_1: ecoute_1,
      ecoute_2: ecoute_2,
      ecoute_3: ecoute_3,
      ecoute_4: ecoute_4,
      referencement_1: referencement_1,
      referencement_2: referencement_2,
      referencement_3: referencement_3,
      referencement_4: referencement_4,
      causerie_1: causerie_1,
      causerie_2: causerie_2,
      causerie_3: causerie_3,
      causerie_4: causerie_4,
      causerie_5: causerie_5,
      evenement_1: evenement_1,
      evenement_2: evenement_2,
      evenement_3: evenement_3,
      formation_oper_1: formation_oper_1,
      formation_oper_2: formation_oper_2,
      observation_1: observation_1,
      observation_2: observation_2,
      observation_3: observation_3,
    };
    const doc_cursor = await db.query(aql`UPDATE ${docKey} 
    WITH ${obj} IN sms_monthly_reports RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Erreur lors de la mise à jour de la formation`;
    }
  },

  smsMonthlyReports: async ({
    companyKey,
    projectKey,
    officeKey,
    skip,
    perPage,
    socialUserKey,
    coverage,
    month,
    year,
  }) => {
    if (coverage == "Utilisateur") {
      const docs_cursor = await db.query(
        aql`FOR p IN sms_monthly_reports  
            FILTER p.companyKey == ${companyKey} 
            AND p.projectKey == ${projectKey} 
            AND p.socialUserKey == ${socialUserKey} 
            AND p.month == ${month} AND p.year == ${year}
            SORT p.timeStamp DESC LIMIT ${skip}, ${perPage} RETURN p`,
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
        aql`FOR p IN sms_monthly_reports  
          FILTER p.companyKey == ${companyKey} 
          AND p.projectKey == ${projectKey} 
          AND p.officeKey == ${officeKey} 
          AND p.month == ${month} AND p.year == ${year}
          SORT p.timeStamp DESC LIMIT ${skip}, ${perPage} RETURN p`,
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
        aql`FOR p IN sms_monthly_reports  
      FILTER p.companyKey == ${companyKey} 
      AND p.projectKey == ${projectKey} 
      AND p.month == ${month} AND p.year == ${year}
      SORT p.timeStamp DESC LIMIT ${skip}, ${perPage} RETURN p`,
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

  smsMonthlyReportsDelete: async ({ docKey }) => {
    // can delete
    const doc_cursor = await db.query(aql`REMOVE ${docKey} IN 
    sms_monthly_reports RETURN OLD`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Une erreur s'est produite lors de la suppression du rapport`;
    }
  },

  smsMonthlyReportsApproveOrReject: async ({
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
          adminStamp: Date.now(),
          adminKey: adminKey,
        };
        break;
      case "Rejeter":
        obj = {
          status: "Rejected",
          adminStamp: Date.now(),
          adminKey: adminKey,
        };
        break;
      case "Clôturer le rapport":
        obj = {
          status: "Closed",
        };
        break;

      default:
        break;
    }

    if (action != "Rejeter") {
      const doc_cursor = await db.query(aql`UPDATE ${docKey} 
     WITH ${obj} IN sms_monthly_reports RETURN NEW`);
      if (doc_cursor.hasNext) {
        return "SUCCESS";
      } else {
        return `Une erreur s'est produite lors de l'approbation du rapport`;
      }
    } else {
      const data_cursor = await db.query(aql`FOR d IN sms_monthly_reports 
      FILTER d._key == ${docKey} RETURN d`);
      if (data_cursor.hasNext) {
        const data = await data_cursor.next();
        let commentArr = data.adminComments;
        commentArr.push(comment);

        const doc_cursor = await db.query(aql`UPDATE ${docKey} 
        WITH { status: "Rejected", rejectStamp: ${Date.now()},
        adminKey: ${adminKey}, adminComments: ${commentArr} }
        IN sms_monthly_reports RETURN NEW`);
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

export default smsMonthlyReportResolver;
