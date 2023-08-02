import { aql, db } from "../../../../../db/arangodb.js";

const smsSuivisStatutPartenaireResolver = {
  smsSuivisStatutPartenaireCreate: async ({
    projectKey,
    companyKey,
    status,
  }) => {
    const obj = {
      timeStamp: Date.now(),
      projectKey: projectKey,
      companyKey: companyKey,
      status: status,
    };

    const doc_cursor = await db.query(aql`INSERT ${obj} 
    INTO sms_suivis_status RETURN NEW`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return {
        ...(doc.fullCount = 1),
        ...doc,
      };
    } else {
      throw new Error(`Erreur lors de la création du statut partenaire`);
    }
  },

  smsSuivisStatutPartenaireUpdate: async ({ docKey, status }) => {
    const obj = {
      status: status,
    };
    const doc_cursor = await db.query(aql`UPDATE ${docKey} 
    WITH ${obj} IN sms_suivis_status RETURN NEW`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return {
        ...(doc.fullCount = 1),
        ...doc,
      };
    } else {
      throw new Error(`Erreur lors de la mise à jour du statut partenaire`);
    }
  },

  smsSuivisStatutPartenaire: async ({
    companyKey,
    projectKey,
    skip,
    perPage,
  }) => {
    const docs_cursor = await db.query(
      aql`FOR p IN sms_suivis_status  
      FILTER p.companyKey == ${companyKey} 
      AND p.projectKey == ${projectKey}
      SORT p.status ASC LIMIT ${skip}, ${perPage} RETURN p`,
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

  smsSuivisStatutPartenaireDelete: async ({ docKey }) => {
    // make sure the block does not contain any option before deleting
    const options_cursor = await db.query(aql`FOR b IN sms_suivis_data 
    FILTER b.statusKey == ${docKey} RETURN b`);
    if (options_cursor.hasNext) {
      // cannot delete
      return `Impossible de supprimer ce statut partenaire car il est lié à une ou plusieurs données`;
    } else {
      // can delete
      const doc_cursor = await db.query(aql`REMOVE ${docKey} IN 
      sms_suivis_status RETURN OLD`);
      if (doc_cursor.hasNext) {
        return "OK";
      } else {
        return `Une erreur s'est produite lors de la suppression du statut partenaire`;
      }
    }
  },
};

export default smsSuivisStatutPartenaireResolver;
