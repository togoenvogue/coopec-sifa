import { aql, db } from "../../../../db/arangodb.js";
import { getUserDoc } from "../../../../helpers/joindocs.js";
//const axios = require("axios");

const companyResolver = {
  getCompanies: async () => {
    const docs_cursor = await db.query(
      aql`FOR c IN company 
      SORT c.companyName ASC RETURN c`,
      { fullCount: true },
      { count: true }
    );
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return {
          ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
          ...doc,
        };
      });
    } else {
      return [];
    }
  },

  getCompaniesByAccessLevel: async ({ isSuperAdmin, companyKey }) => {
    const docs_cursor =
      isSuperAdmin == true
        ? await db.query(
            aql`FOR c IN company 
      SORT c.companyName ASC RETURN c`,
            { fullCount: true },
            { count: true }
          )
        : await db.query(
            aql`FOR c IN company FILTER c._key == ${companyKey}
      SORT c.companyName ASC RETURN c`,
            { fullCount: true },
            { count: true }
          );
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return {
          ...(doc.adminKey = await getUserDoc({ userKey: doc.adminKey })),
          ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
          ...doc,
        };
      });
    } else {
      return [];
    }
  },

  companyCreate: async ({
    expiry,
    adminKey,
    companyName,
    companyEmail,
    companyPhone,
    website,
    address,
    countryFlag,
    countryCode,
    packag,
    projectMaxCount,
    userMaxCount,
    officeMaxCount,
    smsSenderId,
    smsApiKey,
    smsUsername,
    themeColor,
    logo,
  }) => {
    const obj = {
      timeStamp: Date.now(),
      expiry: expiry,
      adminKey: adminKey,
      companyName: companyName,
      companyEmail: companyEmail,
      companyPhone: companyPhone,
      website: website,
      address: address,
      countryFlag: countryFlag,
      countryCode: countryCode,
      package: packag,
      projectMaxCount: projectMaxCount,
      userMaxCount: userMaxCount,
      officeMaxCount: officeMaxCount,
      smsSenderId: smsSenderId,
      smsApiKey: smsApiKey,
      smsUsername: smsUsername,
      themeColor: themeColor,
      logo: logo,
      isActive: true,
    };

    // create company
    const doc_cursor = await db.query(
      aql`INSERT ${obj} INTO company RETURN NEW`
    );
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return { ...doc };
    } else {
      throw new Error(`Erreur lors de la création de l'entreprise`);
    }
  },

  companyUpdate: async ({
    key,
    companyName,
    companyEmail,
    companyPhone,
    website,
    address,
    smsSenderId,
    smsApiKey,
    smsUsername,
    themeColor,
    logo,
    adminKey,
  }) => {
    // select the company
    const select_cursor = await db.query(aql`FOR c IN company 
    FILTER c._key == ${key} RETURN c`);
    if (select_cursor.hasNext) {
      //const select = await select_cursor.next();
      // update the company record
      const obj = {
        adminKey: adminKey,
        companyName: companyName,
        companyEmail: companyEmail,
        companyPhone: companyPhone,
        website: website,
        address: address,
        smsSenderId: smsSenderId,
        smsApiKey: smsApiKey,
        smsUsername: smsUsername,
        themeColor: themeColor,
        logo: logo,
      };

      const update_cursor = await db.query(aql`UPDATE ${key} 
      WITH ${obj} IN company RETURN NEW`);
      if (update_cursor.hasNext) {
        const doc = await update_cursor.next();
        return {
          ...(doc.fullCount = 1),
          ...doc,
        };
      } else {
        throw new Error(
          `Erreur lors de la mise à jour du compte de l'entreprise`
        );
      }
    }
  },
};

export default companyResolver;
