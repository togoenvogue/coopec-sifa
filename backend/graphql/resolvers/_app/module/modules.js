import { aql, db } from "../../../../db/arangodb.js";
import { getCompaniesByKeys } from "../../../../helpers/joindocs.js";

const moduleResolver = {
  modules: async ({ skip, perPage }) => {
    const docs_cursor = await db.query(
      aql`FOR m IN module SORT m.moduleName 
      ASC LIMIT ${skip}, ${perPage} RETURN m`,
      { fullCount: true },
      { count: true }
    );
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return {
          ...(doc.companies = getCompaniesByKeys({ keysArr: doc.companies })),
          ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
          ...doc,
        };
      });
    } else {
      return [];
    }
  },

  modulesByCompanyKey: async ({ companyKey }) => {
    // add projectKey later
    // projects []
    const docs_cursor = await db.query(
      aql`FOR m IN module 
      FILTER ${companyKey} IN m.companies
       SORT m.moduleName ASC RETURN m`,
      { fullCount: true },
      { count: true }
    );
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      //console.log(`MODULES: ${docs.length}`);
      return docs.map(async (doc) => {
        return {
          ...(doc.companies = getCompaniesByKeys({ keysArr: doc.companies })),
          ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
          ...doc,
        };
      });
    } else {
      return [];
    }
  },

  moduleCreate: async ({ moduleName, moduleRef, moduleDesc }) => {
    const obj = {
      moduleName: moduleName,
      moduleRef: moduleRef,
      moduleDesc: moduleDesc,
      companies: [],
      isActive: true,
    };
    const doc_cursor = await db.query(
      aql`INSERT ${obj} INTO module RETURN NEW`
    );
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return {
        ...(doc.companies = getCompaniesByKeys({ keysArr: doc.companies })),
        ...(doc.fullCount = 1),
        ...doc,
      };
    } else {
      throw new Error(`Erreur lors de la création du module`);
    }
  },

  moduleUpdate: async ({ moduleKey, moduleName, moduleRef, moduleDesc }) => {
    // select module
    const obj = {
      moduleName: moduleName,
      moduleRef: moduleRef,
      moduleDesc: moduleDesc,
      companies: [],
      isActive: true,
    };
    const doc_cursor = await db.query(
      aql`UPDATE ${moduleKey} WITH ${obj} IN module RETURN NEW`
    );
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return {
        ...(doc.companies = getCompaniesByKeys({ keysArr: doc.companies })),
        ...(doc.fullCount = 1),
        ...doc,
      };
    } else {
      throw new Error(`Erreur lors de la mise à jour du module`);
    }
  },

  moduleAddCompany: async ({ moduleKey, companyKey }) => {
    // select module
    const module_doc = await db.query(aql`FOR m IN module FILTER 
    m._key == ${moduleKey} RETURN m`);
    if (module_doc.hasNext) {
      const module = await module_doc.next();
      let companiesArr = module.companies;
      if (companiesArr.some((elmt) => elmt == companyKey)) {
        return {
          ...(module.companies = getCompaniesByKeys({
            keysArr: module.companies,
          })),
          ...(module.fullCount = 1),
          ...module,
        };
      } else {
        companiesArr.push(companyKey);
        // update module
        const doc_cursor = await db.query(aql`UPDATE ${moduleKey} 
        WITH { companies: ${companiesArr} } IN module RETURN NEW`);
        const doc = await doc_cursor.next();
        return {
          ...(doc.companies = getCompaniesByKeys({ keysArr: doc.companies })),
          ...(doc.fullCount = 1),
          ...doc,
        };
      }
    } else {
      throw new Error(`Erreur de sélection du module : ${moduleKey}`);
    }
  },

  moduleRemoveCompany: async ({ moduleKey, companyKey }) => {
    // select module
    const module_doc = await db.query(aql`FOR m IN module FILTER 
    m._key == ${moduleKey} RETURN m`);
    if (module_doc.hasNext) {
      const module = await module_doc.next();
      const companiesArr = module.companies;
      // if company is found in the array
      if (companiesArr.some((elmt) => elmt == companyKey)) {
        // remove company from list
        const newCompaniesArr = companiesArr.filter((comp) => {
          return comp !== companyKey;
        });
        // update module
        const doc_cursor = await db.query(aql`UPDATE ${moduleKey} 
        WITH { companies: ${newCompaniesArr} } IN module RETURN NEW`);
        const doc = await doc_cursor.next();
        return {
          ...(doc.companies = getCompaniesByKeys({ keysArr: doc.companies })),
          ...(doc.fullCount = 1),
          ...doc,
        };
      } else {
        // nothing to do
        return {
          ...(module.companies = getCompaniesByKeys({
            keysArr: module.companies,
          })),
          ...(module.fullCount = 1),
          ...module,
        };
      }
    } else {
      throw new Error(`Erreur de sélection du module : ${moduleKey}`);
    }
  },
};

export default moduleResolver; // DEFAULT only for bundle functions
