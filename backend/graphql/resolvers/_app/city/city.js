import { aql, db } from "../../../../db/arangodb.js";
import {
  getCantonDoc,
  getCountryDoc,
  getPrefectureDoc,
  getRegionDoc,
} from "../../../../helpers/joindocs.js";
//import { getCountryDoc } from "../../../../helpers/joindocs.js";

const cityResolver = {
  getCities: async ({ cantonKey, perPage, skip }) => {
    const docs_cursor =
      cantonKey != "null"
        ? await db.query(
            aql`FOR c IN city FILTER c.cantonKey == ${cantonKey} 
            SORT c.cityName ASC LIMIT ${skip}, ${perPage} RETURN c`,
            { fullCount: true },
            { count: true }
          )
        : await db.query(
            aql`FOR c IN city SORT c.cityName ASC 
            LIMIT ${skip}, ${perPage} RETURN c`,
            { fullCount: true },
            { count: true }
          );
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return {
          ...(doc.countryKey = await getCountryDoc({ key: doc.countryKey })),
          ...(doc.regionKey = await getRegionDoc({ key: doc.regionKey })),
          ...(doc.prefectureKey = await getPrefectureDoc({
            key: doc.prefectureKey,
          })),
          ...(doc.cantonKey = await getCantonDoc({ key: doc.cantonKey })),
          ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
          ...doc,
        };
      });
    } else {
      return [];
    }
  },

  getRegions: async ({ countryKey, perPage, skip }) => {
    const docs_cursor = await db.query(
      aql`FOR c IN location_region 
      FILTER c.countryKey == ${countryKey} 
        SORT c.region ASC LIMIT ${skip}, ${perPage} RETURN c`,
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

  getPrefectures: async ({ regionKey, skip, perPage }) => {
    const docs_cursor = await db.query(
      aql`FOR c IN location_prefecture 
      FILTER c.regionKey == ${regionKey} 
        SORT c.prefecture ASC LIMIT ${skip}, ${perPage} RETURN c`,
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

  getCantons: async ({ prefectureKey, skip, perPage }) => {
    const docs_cursor = await db.query(
      aql`FOR c IN location_canton 
      FILTER c.prefectureKey == ${prefectureKey} 
        SORT c.canton ASC LIMIT ${skip}, ${perPage} RETURN c`,
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

  cityCreate: async ({
    cityName,
    countryKey,
    regionKey,
    prefectureKey,
    cantonKey,
  }) => {
    const obj = {
      cityName,
      countryKey,
      regionKey,
      prefectureKey,
      cantonKey,
    };
    // check if country already exists
    const already_doc = await db.query(aql`FOR c IN city 
    FILTER c.cityName == ${cityName} RETURN c`);
    if (!already_doc.hasNext) {
      const doc_cursor = await db.query(aql`INSERT ${obj} 
      INTO city RETURN NEW`);
      if (doc_cursor.hasNext) {
        return "SUCCESS";
      } else {
        throw new Error(`Erreur lors de la création de la localite`);
      }
    } else {
      throw new Error(
        `Désolé, la localité < ${cityName} > existe déjà dans la base`
      );
    }
  },

  cityUpdate: async ({
    cityKey,
    cityName,
    countryKey,
    regionKey,
    prefectureKey,
    cantonKey,
  }) => {
    const obj = {
      cityName,
      countryKey,
      regionKey,
      prefectureKey,
      cantonKey,
    };
    // check if country already exists
    const already_doc = await db.query(aql`FOR c IN city 
    FILTER c._key == ${cityKey} RETURN c`);
    if (already_doc.hasNext) {
      const doc_cursor = await db.query(aql`UPDATE ${cityKey} 
      WITH ${obj} IN city RETURN NEW`);
      if (doc_cursor.hasNext) {
        return "SUCCESS";
      } else {
        throw new Error(`Erreur lors de la création de la localité`);
      }
    } else {
      throw new Error(
        `Désolé, la localité ${cityKey} est introuvable dans la base`
      );
    }
  },
};

export default cityResolver;
