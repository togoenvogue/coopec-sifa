import { aql, db } from "../../../../db/arangodb.js";

const smsActivityTypesResolver = {
  smsActivityTypesCreate: async ({
    projectKey,
    companyKey,
    activity,
    accessLevel,
  }) => {
    const obj = {
      timeStamp: Date.now(),
      projectKey: projectKey,
      companyKey: companyKey,
      activity: activity,
      accessLevel: accessLevel,
    };

    const doc_cursor = await db.query(aql`INSERT ${obj} 
    INTO sms_activity_types RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Erreur lors de la création de la catégorie d'activité`;
    }
  },

  smsActivityTypesUpdate: async ({ docKey, activity, accessLevel }) => {
    const obj = {
      activity: activity,
      accessLevel: accessLevel,
    };
    const doc_cursor = await db.query(aql`UPDATE ${docKey} 
    WITH ${obj} IN sms_activity_types RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Erreur lors de la mise à jour de la catégorie d'activité`;
    }
  },

  smsActivityTypes: async ({ companyKey, projectKey, skip, perPage }) => {
    const docs_cursor = await db.query(
      aql`FOR p IN sms_activity_types  
      FILTER p.companyKey == ${companyKey} 
      AND p.projectKey == ${projectKey}
      SORT p.activity ASC LIMIT ${skip}, ${perPage} RETURN p`,
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
  smsActivityTypesByLevel: async ({
    companyKey,
    projectKey,
    skip,
    perPage,
    accessLevel,
  }) => {
    const docs_cursor = await db.query(
      aql`FOR p IN sms_activity_types  
      FILTER p.companyKey == ${companyKey} 
      AND p.projectKey == ${projectKey} 
      AND p.accessLevel <= ${accessLevel}
      SORT p.activity ASC LIMIT ${skip}, ${perPage} RETURN p`,
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

  smsActivityTypesDelete: async ({ docKey }) => {
    // make sure the block does not contain any option before deleting
    const options_cursor = await db.query(aql`FOR b IN sms_activity_themes 
    FILTER b.activityTypeKey == ${docKey} RETURN b`);
    if (options_cursor.hasNext) {
      // cannot delete
      return `Impossible de supprimer cette catégorie d'activité car elle est liée à une ou plusieurs données`;
    } else {
      // can delete
      const doc_cursor = await db.query(aql`REMOVE ${docKey} IN 
      sms_activity_types RETURN OLD`);
      if (doc_cursor.hasNext) {
        return "SUCCESS";
      } else {
        return `Une erreur s'est produite lors de la suppression de la catégorie d'activité`;
      }
    }
  },
};

export default smsActivityTypesResolver;
