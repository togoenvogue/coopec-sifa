import { aql, db } from "../../../../db/arangodb.js";
import {
  getCityDoc,
  getCountryDoc,
  getOfficeDocs,
} from "../../../../helpers/joindocs.js";

const smsSocialPartnersResolver = {
  smsSocialPartnersCreate: async ({
    projectKey,
    companyKey,
    partnerName,
    partnershipNature,
    concernedOffices,
    activitySector,
    activityDetails,
    address,
    countryKey,
    cityKey,
    partnerPhone,
    partnerMail,
    partnerWebsite,
    contactPerson1Name,
    contactPerson1Fonction,
    contactPerson1Phone,
    contactPerson1Mail,
    contactPerson2Name,
    contactPerson2Fonction,
    contactPerson2Phone,
    contactPerson2Mail,
  }) => {
    const obj = {
      timeStamp: Date.now(),
      projectKey: projectKey,
      companyKey: companyKey,
      partnerName: partnerName,
      partnershipNature: partnershipNature,
      concernedOffices: concernedOffices,
      activitySector: activitySector,
      activityDetails: activityDetails,
      address: address,
      countryKey: countryKey,
      cityKey: cityKey,
      partnerPhone: partnerPhone,
      partnerMail: partnerMail,
      partnerWebsite: partnerWebsite,
      contactPerson1Name: contactPerson1Name,
      contactPerson1Fonction: contactPerson1Fonction,
      contactPerson1Phone: contactPerson1Phone,
      contactPerson1Mail: contactPerson1Mail,
      contactPerson2Name: contactPerson2Name,
      contactPerson2Fonction: contactPerson2Fonction,
      contactPerson2Phone: contactPerson2Phone,
      contactPerson2Mail: contactPerson2Mail,
    };

    const doc_cursor = await db.query(aql`INSERT ${obj} 
    INTO sms_social_partners RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Erreur lors de la création du partenaire social`;
    }
  },

  smsSocialPartnersUpdate: async ({
    docKey,
    partnerName,
    partnershipNature,
    concernedOffices,
    activitySector,
    activityDetails,
    address,
    countryKey,
    cityKey,
    partnerPhone,
    partnerMail,
    partnerWebsite,
    contactPerson1Name,
    contactPerson1Fonction,
    contactPerson1Phone,
    contactPerson1Mail,
    contactPerson2Name,
    contactPerson2Fonction,
    contactPerson2Phone,
    contactPerson2Mail,
  }) => {
    const obj = {
      partnerName: partnerName,
      partnershipNature: partnershipNature,
      concernedOffices: concernedOffices,
      activitySector: activitySector,
      activityDetails: activityDetails,
      address: address,
      countryKey: countryKey,
      cityKey: cityKey,
      partnerPhone: partnerPhone,
      partnerMail: partnerMail,
      partnerWebsite: partnerWebsite,
      contactPerson1Name: contactPerson1Name,
      contactPerson1Fonction: contactPerson1Fonction,
      contactPerson1Phone: contactPerson1Phone,
      contactPerson1Mail: contactPerson1Mail,
      contactPerson2Name: contactPerson2Name,
      contactPerson2Fonction: contactPerson2Fonction,
      contactPerson2Phone: contactPerson2Phone,
      contactPerson2Mail: contactPerson2Mail,
    };
    const doc_cursor = await db.query(aql`UPDATE ${docKey} 
    WITH ${obj} IN sms_social_partners RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Erreur lors de la mise à jour du partenaire social`;
    }
  },

  smsSocialPartners: async ({ companyKey, projectKey, skip, perPage }) => {
    const docs_cursor = await db.query(
      aql`FOR p IN sms_social_partners  
      FILTER p.companyKey == ${companyKey} 
      AND p.projectKey == ${projectKey}
      SORT p.partnerName ASC LIMIT ${skip}, ${perPage} RETURN p`,
      { fullCount: true },
      { count: true }
    );
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return {
          ...(doc.concernedOffices = await getOfficeDocs({
            officeKeyArr: doc.concernedOffices,
          })),
          ...(doc.countryKey = await getCountryDoc({ key: doc.countryKey })),
          ...(doc.cityKey = await getCityDoc({ key: doc.cityKey })),
          ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
          ...doc,
        };
      });
    } else {
      return [];
    }
  },

  smsSocialPartnersDelete: async ({ docKey }) => {
    // make sure the block does not contain any option before deleting
    const options_cursor = await db.query(aql`FOR b IN sms_activity_data 
    FILTER b.socialPartnerKey == ${docKey} RETURN b`);
    if (options_cursor.hasNext) {
      // cannot delete
      return `Impossible de supprimer ce partenaire car il est lié à une ou plusieurs données`;
    } else {
      // can delete
      const doc_cursor = await db.query(aql`REMOVE ${docKey} IN 
      sms_social_partners RETURN OLD`);
      if (doc_cursor.hasNext) {
        return "SUCCESS";
      } else {
        return `Une erreur s'est produite lors de la suppression du partenaire social`;
      }
    }
  },
};

export default smsSocialPartnersResolver;
