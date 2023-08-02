import { aql, db } from "../../../../db/arangodb.js";
import { getCompanyDoc, getProjectDoc } from "../../../../helpers/joindocs.js";

const loanFiliereResolver = {
  loanFiliereCreate: async ({ projectKey, companyKey, filiereName }) => {
    const obj = {
      timeStamp: Date.now(),
      projectKey,
      companyKey,
      filiereName,
    };

    const doc_cursor = await db.query(aql`INSERT ${obj} 
    INTO loan_filieres RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Erreur lors de la création de la filière`;
    }
  },

  loanFiliereUpdate: async ({ docKey, filiereName }) => {
    const obj = {
      filiereName,
    };

    const doc_cursor = await db.query(aql`FOR p IN loan_filieres
    FILTER p._key == ${docKey} UPDATE ${docKey} WITH ${obj} 
    IN loan_filieres RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Erreur lors de la mise à jour de la filière`;
    }
  },

  loanFilieres: async ({ skip, perPage, companyKey, projectKey }) => {
    const docs_cursor = await db.query(
      aql`FOR p IN loan_filieres FILTER p.companyKey == ${companyKey}
      AND p.projectKey == ${projectKey}
      SORT p.filiereName ASC LIMIT ${skip}, ${perPage} RETURN p`,
      { fullCount: true },
      { count: true }
    );
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return {
          ...(doc.companyKey = await getCompanyDoc({
            companyKey: doc.companyKey,
          })),
          ...(doc.projectKey = await getProjectDoc({
            projectKey: doc.projectKey,
          })),
          ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
          ...doc,
        };
      });
    } else {
      return [];
    }
  },
};

export default loanFiliereResolver;
