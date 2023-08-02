import { aql, db } from "../../../../db/arangodb.js";
import {
  getOfficeDoc,
  getPerfectClientDoc,
  getUserDoc,
} from "../../../../helpers/joindocs.js";
import {
  getSMSActivityThemeDoc,
  getSMSSocialPartnerDoc,
} from "../../../../helpers/joindocs_sms.js";

const smsReferencementsResolver = {
  smsReferencementsCreate: async ({
    referStamp,
    referLat,
    referLong,
    projectKey,
    companyKey,
    officeKey,
    socialUserKey,
    socialUserRef,
    clientKey,
    motifThemeKey,
    motifThemeAutre,
    socialPartnerKey,
    meetingStamp,
    meetingPartnerAssistantFullName,
    meetingPartnerAssistantContact,
    meetingActions,
    meetingDecisions,
  }) => {
    const obj = {
      timeStamp: Date.now(),
      referStamp: referStamp,
      referLat: referLat,
      referLong: referLong,
      projectKey: projectKey,
      companyKey: companyKey,
      officeKey: officeKey,
      socialUserKey: socialUserKey,
      socialUserRef: socialUserRef,
      clientKey: clientKey,
      motifThemeKey: motifThemeKey,
      motifThemeAutre: motifThemeAutre,
      socialPartnerKey: socialPartnerKey,
      meetingStamp: meetingStamp,
      meetingPartnerAssistantFullName: meetingPartnerAssistantFullName,
      meetingPartnerAssistantContact: meetingPartnerAssistantContact,
      meetingActions: meetingActions,
      meetingDecisions: meetingDecisions,
      signatureClient: null,
      signatureSocialUser: null,
      signatureSocialPartner: null,
      adminKey: null,
      status: "Pending",
      photo: "camera_avatar.png",
      photo1: "camera_avatar.png",
      photo2: "camera_avatar.png",
      photo3: "camera_avatar.png",
      legende: null,
      legende1: null,
      legende2: null,
      legende3: null,
      adminComments: [],
    };

    const doc_cursor = await db.query(aql`INSERT ${obj} 
    INTO sms_referencements RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Erreur lors de la création du référencement`;
    }
  },

  smsReferencementsUpdate: async ({
    docKey,
    referStamp,
    officeKey,
    clientKey,
    motifThemeKey,
    motifThemeAutre,
    socialPartnerKey,
    meetingStamp,
    meetingPartnerAssistantFullName,
    meetingPartnerAssistantContact,
    meetingActions,
    meetingDecisions,
  }) => {
    const obj = {
      referStamp: referStamp,
      officeKey: officeKey,
      clientKey: clientKey,
      motifThemeKey: motifThemeKey,
      motifThemeAutre: motifThemeAutre,
      socialPartnerKey: socialPartnerKey,
      meetingStamp: meetingStamp,
      meetingPartnerAssistantFullName: meetingPartnerAssistantFullName,
      meetingPartnerAssistantContact: meetingPartnerAssistantContact,
      meetingActions: meetingActions,
      meetingDecisions: meetingDecisions,
    };
    const doc_cursor = await db.query(aql`UPDATE ${docKey} 
    WITH ${obj} IN sms_referencements RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Erreur lors de la mise à jour du référencement`;
    }
  },

  smsReferencements: async ({
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
        aql`FOR p IN sms_referencements  
            FILTER p.companyKey == ${companyKey} 
            AND p.projectKey == ${projectKey} 
            AND p.socialUserKey == ${socialUserKey} 
            AND p.referStamp >= ${dateFrom} AND p.referStamp <= ${dateTo}
            SORT p.referStamp DESC LIMIT ${skip}, ${perPage} RETURN p`,
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
            ...(doc.motifThemeKey = await getSMSActivityThemeDoc({
              docKey: doc.motifThemeKey,
            })),
            ...(doc.clientKey = await getPerfectClientDoc({
              clientKey: doc.clientKey,
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
            ...(doc.socialPartnerKey = await getSMSSocialPartnerDoc({
              docKey: doc.socialPartnerKey,
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
        aql`FOR p IN sms_referencements  
          FILTER p.companyKey == ${companyKey} 
          AND p.projectKey == ${projectKey} 
          AND p.officeKey == ${officeKey} 
          AND p.referStamp >= ${dateFrom} AND p.referStamp <= ${dateTo}
          SORT p.referStamp DESC LIMIT ${skip}, ${perPage} RETURN p`,
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
            ...(doc.motifThemeKey = await getSMSActivityThemeDoc({
              docKey: doc.motifThemeKey,
            })),
            ...(doc.clientKey = await getPerfectClientDoc({
              clientKey: doc.clientKey,
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
            ...(doc.socialPartnerKey = await getSMSSocialPartnerDoc({
              docKey: doc.socialPartnerKey,
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
        aql`FOR p IN sms_referencements  
      FILTER p.companyKey == ${companyKey} 
      AND p.projectKey == ${projectKey} 
      AND p.referStamp >= ${dateFrom} AND p.referStamp <= ${dateTo}
      SORT p.referStamp DESC LIMIT ${skip}, ${perPage} RETURN p`,
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
            ...(doc.motifThemeKey = await getSMSActivityThemeDoc({
              docKey: doc.motifThemeKey,
            })),
            ...(doc.clientKey = await getPerfectClientDoc({
              clientKey: doc.clientKey,
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
            ...(doc.socialPartnerKey = await getSMSSocialPartnerDoc({
              docKey: doc.socialPartnerKey,
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

  smsReferencementsDelete: async ({ docKey }) => {
    // can delete
    const doc_cursor = await db.query(aql`REMOVE ${docKey} IN 
      sms_referencements RETURN OLD`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Une erreur s'est produite lors de la suppression du référencement`;
    }
  },

  smsReferencementsApproveOrReject: async ({
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
     WITH ${obj} IN sms_referencements RETURN NEW`);
      if (doc_cursor.hasNext) {
        return "SUCCESS";
      } else {
        return `Une erreur s'est produite lors de l\'approbation du référencement`;
      }
    } else {
      const data_cursor = await db.query(aql`FOR d IN sms_referencements 
      FILTER d._key == ${docKey} RETURN d`);
      if (data_cursor.hasNext) {
        const data = await data_cursor.next();
        let commentArr = data.adminComments;
        commentArr.push(comment);

        const doc_cursor = await db.query(aql`UPDATE ${docKey} 
        WITH { status: "Rejected", rejectStamp: ${Date.now()},
        adminKey: ${adminKey}, adminComments: ${commentArr} }
        IN sms_referencements RETURN NEW`);
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

export default smsReferencementsResolver;
