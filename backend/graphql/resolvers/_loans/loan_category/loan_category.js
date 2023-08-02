import { aql, db } from "../../../../db/arangodb.js";
import { getCompanyDoc, getProjectDoc } from "../../../../helpers/joindocs.js";

const loanCategoryResolver = {
  loanCategoryCreate: async ({
    projectKey,
    companyKey,
    categoryDescription,
    categoryName,
  }) => {
    const obj = {
      timeStamp: Date.now(),
      projectKey,
      companyKey,
      categoryDescription,
      categoryName,
    };

    const doc_cursor = await db.query(aql`INSERT ${obj} 
    INTO loan_categories RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Erreur lors de la création de la catégorie de produit`;
    }
  },

  loanCategoryUpdate: async ({ key, categoryDescription, categoryName }) => {
    const obj = {
      categoryDescription,
      categoryName,
    };

    const doc_cursor = await db.query(aql`FOR p IN loan_categories
    FILTER p._key == ${key} UPDATE ${key} WITH ${obj} 
    IN loan_categories RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Erreur lors de la mise à jour de la catégorie de produit`;
    }
  },

  loanCategories: async ({ skip, perPage }) => {
    const docs_cursor = await db.query(
      aql`FOR p IN loan_categories  
      SORT p.categoryName ASC LIMIT ${skip}, ${perPage} RETURN p`,
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

export default loanCategoryResolver;
