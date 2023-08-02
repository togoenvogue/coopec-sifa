import { aql, db } from "../../../../../db/arangodb.js";
import {
  getCityDoc,
  getCountryDoc,
  getOfficeDocs,
} from "../../../../../helpers/joindocs.js";
import { getSMSActivityThemeDoc } from "../../../../../helpers/joindocs_sms.js";

const smsFormationsThemesResolver = {
  smsFormationsThemesCreate: async ({
    projectKey,
    companyKey,
    offices,
    periode,
    dateFrom,
    dateTo,
    thematiqueKey,
    reference,
    titre,
    objectifs,
    status,
    comment,
    isActive,
  }) => {
    const obj = {
      timeStamp: Date.now(),
      projectKey,
      companyKey,
      offices,
      periode,
      dateFrom,
      dateTo,
      thematiqueKey,
      reference,
      titre,
      objectifs,
      status,
      comment,
      isActive,
    };

    const doc_cursor = await db.query(aql`INSERT ${obj} 
    INTO sms_formations_themes RETURN NEW`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return "SUCCESS";
    } else {
      return `Erreur lors de la création du thème de formation`;
    }
  },

  smsFormationsThemesUpdate: async ({
    docKey,
    offices,
    periode,
    dateFrom,
    dateTo,
    thematiqueKey,
    reference,
    titre,
    objectifs,
    status,
    comment,
    isActive,
  }) => {
    const obj = {
      offices,
      periode,
      dateFrom,
      dateTo,
      thematiqueKey,
      reference,
      titre,
      objectifs,
      status,
      comment,
      isActive,
    };
    const doc_cursor = await db.query(aql`UPDATE ${docKey} 
    WITH ${obj} IN sms_formations_themes RETURN NEW`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return "SUCCESS";
    } else {
      return `Erreur lors de la mise à jour du thème de formation`;
    }
  },

  smsFormationsThemes: async ({
    companyKey,
    projectKey,
    skip,
    perPage,
    offices,
    dateFrom,
    dateTo,
  }) => {
    if (offices.length == 0) {
      const docs_cursor = await db.query(
        aql`FOR p IN sms_formations_themes  
          FILTER p.companyKey == ${companyKey} 
          AND p.projectKey == ${projectKey} 
          AND p.dateFrom >= ${dateFrom} AND p.dateTo <= ${dateTo}
          SORT p.dateFrom ASC LIMIT ${skip}, ${perPage} RETURN p`,
        { fullCount: true },
        { count: true }
      );
      if (docs_cursor.hasNext) {
        const docs = await docs_cursor.all();
        return docs.map(async (doc) => {
          return {
            ...(doc.offices = await getOfficeDocs({
              officeKeyArr: doc.offices,
            })),
            ...(doc.countryKey = await getCountryDoc({ key: doc.countryKey })),
            ...(doc.cityKey = await getCityDoc({ key: doc.cityKey })),
            ...(doc.thematiqueKey = await getSMSActivityThemeDoc({
              docKey: doc.thematiqueKey,
            })),
            ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
            ...doc,
          };
        });
      } else {
        return [];
      }
      // offices array is not empty
    } else {
      const docs_cursor = await db.query(
        aql`FOR p IN sms_formations_themes  
        FILTER p.companyKey == ${companyKey} 
        AND p.projectKey == ${projectKey} 
        AND p.dateFrom >= ${dateFrom} AND p.dateTo <= ${dateTo}
        SORT p.dateFrom ASC LIMIT ${skip}, ${perPage} RETURN p`,
        { fullCount: true },
        { count: true }
      );
      if (docs_cursor.hasNext) {
        const docs = await docs_cursor.all();
        let data = [];
        for (let index = 0; index < docs.length; index++) {
          const rec = await docs[index];
          for (let i = 0; i < rec.offices.length; i++) {
            const b = rec.offices[i];
            if (offices.includes(b)) {
              data.push(rec);
            }
          }
        }

        if (data.length > 0) {
          return data.map(async (doc) => {
            return {
              ...(doc.offices = await getOfficeDocs({
                officeKeyArr: doc.offices,
              })),
              ...(doc.countryKey = await getCountryDoc({
                key: doc.countryKey,
              })),
              ...(doc.cityKey = await getCityDoc({ key: doc.cityKey })),
              ...(doc.thematiqueKey = await getSMSActivityThemeDoc({
                docKey: doc.thematiqueKey,
              })),
              ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
              ...doc,
            };
          });
        } else {
          return [];
        }
      } else {
        return [];
      }
    }
  },

  smsFormationsThemesDelete: async ({ docKey }) => {
    // make sure the block does not contain any option before deleting
    const options_cursor = await db.query(aql`FOR b IN sms_formations_anims 
    FILTER b.trainingThemeKey == ${docKey} RETURN b`);
    if (options_cursor.hasNext) {
      // cannot delete
      return `Impossible de supprimer ce thème de formation car il est lié à une ou plusieurs données`;
    } else {
      // can delete
      const doc_cursor = await db.query(aql`REMOVE ${docKey} IN 
      sms_formations_themes RETURN OLD`);
      if (doc_cursor.hasNext) {
        return "SUCCESS";
      } else {
        return `Une erreur s'est produite lors de la suppression du thème de formation`;
      }
    }
  },
};

export default smsFormationsThemesResolver;
