import { aql, db } from "../../../../../db/arangodb.js";

const smsSuivisActionsResolver = {
  smsSuivisActionsCreate: async ({ projectKey, companyKey, action }) => {
    const obj = {
      timeStamp: Date.now(),
      projectKey: projectKey,
      companyKey: companyKey,
      action: action,
    };

    const doc_cursor = await db.query(aql`INSERT ${obj} 
    INTO sms_suivis_actions RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Erreur lors de la création du statut partenaire`;
    }
  },

  smsSuivisActionsUpdate: async ({ docKey, action }) => {
    const obj = {
      action: action,
    };
    const doc_cursor = await db.query(aql`UPDATE ${docKey} 
    WITH ${obj} IN sms_suivis_actions RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Erreur lors de la mise à jour du statut partenaire`;
    }
  },

  smsSuivisActions: async ({ companyKey, projectKey, skip, perPage }) => {
    const docs_cursor = await db.query(
      aql`FOR p IN sms_suivis_actions  
      FILTER p.companyKey == ${companyKey} 
      AND p.projectKey == ${projectKey}
      SORT p.action ASC LIMIT ${skip}, ${perPage} RETURN p`,
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

  smsSuivisActionsDelete: async ({ docKey }) => {
    // make sure the block does not contain any option before deleting
    const options_cursor = await db.query(aql`FOR b IN sms_suivis_data 
    FILTER b.actionKey == ${docKey} RETURN b`);
    if (options_cursor.hasNext) {
      // cannot delete
      return `Impossible de supprimer ce objet de suivi car il est lié à une ou plusieurs données`;
    } else {
      // can delete
      const doc_cursor = await db.query(aql`REMOVE ${docKey} IN 
      sms_suivis_actions RETURN OLD`);
      if (doc_cursor.hasNext) {
        return "SUCCESS";
      } else {
        return `Une erreur s'est produite lors de la suppression de ce objet de suivi`;
      }
    }
  },
};

export default smsSuivisActionsResolver;
