import { aql, db } from "../../../../db/arangodb.js";

const loanProductEnergieResolver = {
  loanProductEnergieCreate: async ({
    productName,
    projectKey,
    companyKey,
    price,
  }) => {
    const obj = {
      productName: productName,
      projectKey: projectKey,
      companyKey: companyKey,
      price: price,
    };

    const doc_cursor = await db.query(aql`INSERT ${obj} 
    INTO loan_products_energie RETURN NEW`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return {
        ...doc,
      };
    } else {
      throw new Error(`Erreur lors de la création du produit`);
    }
  },

  loanProductEnergieUpdate: async ({ docKey, productName, price }) => {
    const obj = {
      productName: productName,
      price: price,
    };

    const doc_cursor = await db.query(aql`FOR p IN loan_products_energie
    FILTER p._key == ${docKey} UPDATE ${docKey} WITH ${obj} 
    IN loan_products_energie RETURN NEW`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return {
        ...doc,
      };
    } else {
      throw new Error(`Erreur lors de la mise à jour du produit`);
    }
  },

  loanProductEnergieDelete: async ({ docKey }) => {
    const doc_cursor = await db.query(aql`FOR p IN loan_products_energie
    FILTER p._key == ${docKey} REMOVE ${docKey}
    IN loan_products_energie RETURN OLD`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return {
        ...doc,
      };
    } else {
      throw new Error(`Erreur lors de la mise à jour du produit`);
    }
  },

  loanProductsEnergieAll: async ({ companyKey }) => {
    const docs_cursor = await db.query(aql`FOR p IN loan_products_energie 
    SORT p.productName ASC LIMIT 100 RETURN p`);
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return {
          ...doc,
        };
      });
    } else {
      return [];
    }
  },
};

export default loanProductEnergieResolver;
