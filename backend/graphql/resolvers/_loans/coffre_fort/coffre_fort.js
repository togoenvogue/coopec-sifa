import { aql, db } from "../../../../db/arangodb.js";
import {
  getCompanyDoc,
  getOfficeDoc,
  getProjectDoc,
  getUserDoc,
} from "../../../../helpers/joindocs.js";

const loanCoffreFortResolver = {
  coffreFortCreate: async ({
    dateStamp,
    day,
    month,
    year,
    adminKey,
    amount,
    companyKey,
    officeKey,
    projectKey,
  }) => {
    const obj = {
      timeStamp: Date.now(),
      dateStamp: dateStamp,
      day: day,
      month: month,
      year: year,
      adminKey: adminKey,
      amount: amount,
      companyKey: companyKey,
      officeKey: officeKey,
      projectKey: projectKey,
    };

    const sel_cursor = await db.query(aql`FOR c IN coffre_fort 
    FILTER c.projectKey == ${projectKey} 
    AND c.companyKey == ${companyKey}
    ANd c.officeKey == ${officeKey} 
    ANd c.year == ${year} AND c.month == ${month} 
    AND c.day == ${day} RETURN c`);
    if (!sel_cursor.hasNext) {
      const doc_cursor = await db.query(aql`INSERT ${obj} 
        INTO coffre_fort RETURN NEW`);
      if (doc_cursor.hasNext) {
        const doc = await doc_cursor.next();
        return {
          ...(doc.fullCount = 1),
          ...doc,
        };
      } else {
        throw new Error(
          `Erreur lors de l'enregistrement du solde de votre coffre`
        );
      }
    } else {
      throw new Error(
        `Vous avez déjà enregistré le solde du coffre pour ${day}/${month}/${year}`
      );
    }
  },

  coffreFortUpdate: async ({ key, amount }) => {
    const obj = {
      amount: amount,
    };

    const doc_cursor = await db.query(aql`
    FOR c IN coffre_fort FILTER c._key == ${key}
    UPDATE {_key: c._key} WITH ${obj} 
    IN coffre_fort RETURN NEW`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return {
        ...(doc.fullCount = 1),
        ...doc,
      };
    } else {
      throw new Error(`Erreur lors de la mise à jour du solde de votre coffre`);
    }
  },

  coffreFortList: async ({
    companyKey,
    projectKey,
    officeKey,
    skip,
    perPage,
  }) => {
    /*console.log(`companyKey: ${companyKey}`);
    console.log(`projectKey: ${projectKey}`);
    console.log(`officeKey: ${officeKey}`);
    console.log(`skip: ${skip}`);
    console.log(`perPage: ${perPage}`);*/
    const docs_cursor = await db.query(
      aql`FOR cf IN coffre_fort 
        FILTER cf.companyKey == ${companyKey} 
        AND cf.projectKey == ${projectKey}
        AND cf.officeKey == ${officeKey}
        SORT cf.dateStamp DESC LIMIT ${skip}, ${perPage} RETURN cf`,
      { fullCount: true },
      { count: true }
    );
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        doc.companyKey = await getCompanyDoc({
          companyKey: doc.companyKey,
        });
        doc.projectKey = await getProjectDoc({
          projectKey: doc.projectKey,
        });
        doc.officeKey = await getOfficeDoc({
          officeKey: doc.officeKey,
        });
        doc.adminKey = await getUserDoc({
          userKey: doc.adminKey,
        });
        doc.fullCount = await docs_cursor.extra.stats.fullCount;
        return { ...doc };
      });
    } else {
      return [];
    }
  },
};

export default loanCoffreFortResolver;
