import { aql, db } from "../../../../db/arangodb.js";

const countryResolver = {
  getCountries: async () => {
    const docs_cursor = await db.query(
      aql`FOR c IN country SORT c.countryName ASC RETURN c`,
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

  countryCreate: async ({
    countryName,
    countryFlag,
    countryCode,
    isActive,
  }) => {
    const obj = {
      countryName: countryName,
      countryFlag: countryFlag.toUpperCase(),
      countryCode: countryCode,
      isActive: isActive,
    };
    // check if country already exists
    const already_doc = await db.query(aql`FOR c IN country 
    FILTER c.countryCode == ${countryCode} 
    OR c.countryFlag == ${countryFlag} RETURN c`);
    if (!already_doc.hasNext) {
      const doc_cursor = await db.query(aql`INSERT ${obj} 
      INTO country RETURN NEW`);
      if (doc_cursor.hasNext) {
        const doc = await doc_cursor.next();
        return { ...doc };
      } else {
        throw new Error(`Erreur lors de la création du pays`);
      }
    } else {
      throw new Error(
        `Désolé, le pays < ${countryName} > existe déjà dans la base`
      );
    }
  },

  countryUpdate: async ({
    countryKey,
    countryName,
    countryFlag,
    countryCode,
    isActive,
  }) => {
    const obj = {
      countryName: countryName,
      countryFlag: countryFlag.toUpperCase(),
      countryCode: countryCode,
      isActive: isActive,
    };
    // check if country already exists
    const already_doc = await db.query(aql`FOR c IN country 
    FILTER c._key == ${countryKey} RETURN c`);
    if (already_doc.hasNext) {
      const doc_cursor = await db.query(aql`UPDATE ${countryKey} 
      WITH ${obj} IN country RETURN NEW`);
      if (doc_cursor.hasNext) {
        const doc = await doc_cursor.next();
        return { ...doc };
      } else {
        throw new Error(`Erreur lors de la création du pays`);
      }
    } else {
      throw new Error(
        `Désolé, le pays ${countryKey} est introuvable dans la base`
      );
    }
  },
};

export default countryResolver;
