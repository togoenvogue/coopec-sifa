import { aql, db } from "../../../../db/arangodb.js";
import { getSMSActivityTypeDoc } from "../../../../helpers/joindocs_sms.js";

const smsActivityThemesResolver = {
  smsActivityThemesCreate: async ({
    projectKey,
    companyKey,
    theme,
    activityTypeKey,
  }) => {
    const obj = {
      timeStamp: Date.now(),
      projectKey: projectKey,
      companyKey: companyKey,
      theme: theme,
      activityTypeKey: activityTypeKey,
    };

    const doc_cursor = await db.query(aql`INSERT ${obj} 
    INTO sms_activity_themes RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "TRUE";
    } else {
      throw new Error(`Erreur lors de la création de la thématique`);
    }
  },

  smsActivityThemesUpdate: async ({ docKey, theme, activityTypeKey }) => {
    const obj = {
      theme: theme,
      activityTypeKey: activityTypeKey,
    };
    const doc_cursor = await db.query(aql`UPDATE ${docKey} 
    WITH ${obj} IN sms_activity_themes RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "TRUE";
    } else {
      throw new Error(`Erreur lors de la mise à jour de la thématique`);
    }
  },

  smsActivityThemes: async ({
    companyKey,
    projectKey,
    activityTypeKey,
    skip,
    perPage,
  }) => {
    const docs_cursor =
      activityTypeKey == "ALL"
        ? await db.query(
            aql`FOR p IN sms_activity_themes  
      FILTER p.companyKey == ${companyKey} 
      AND p.projectKey == ${projectKey}
      SORT p.theme ASC LIMIT ${skip}, ${perPage} RETURN p`,
            { fullCount: true },
            { count: true }
          )
        : await db.query(
            aql`FOR p IN sms_activity_themes  
      FILTER p.companyKey == ${companyKey} 
      AND p.projectKey == ${projectKey} 
      AND p.activityTypeKey == ${activityTypeKey}
      SORT p.theme ASC LIMIT ${skip}, ${perPage} RETURN p`,
            { fullCount: true },
            { count: true }
          );
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return {
          ...(doc.activityTypeKey = await getSMSActivityTypeDoc({
            docKey: doc.activityTypeKey,
          })),
          ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
          ...doc,
        };
      });
    } else {
      return [];
    }
  },

  smsActivityThemesByTypeKey: async ({
    companyKey,
    projectKey,
    skip,
    perPage,
    typeKey,
  }) => {
    const docs_cursor = await db.query(
      aql`FOR p IN sms_activity_themes  
      FILTER p.companyKey == ${companyKey} 
      AND p.projectKey == ${projectKey} 
      AND p.activityTypeKey == ${typeKey}
      SORT p.theme ASC LIMIT ${skip}, ${perPage} RETURN p`,
      { fullCount: true },
      { count: true }
    );
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return {
          ...(doc.activityTypeKey = await getSMSActivityTypeDoc({
            docKey: doc.activityTypeKey,
          })),
          ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
          ...doc,
        };
      });
    } else {
      return [];
    }
  },

  smsActivityThemesDelete: async ({ docKey }) => {
    // make sure the block does not contain any option before deleting
    const options_cursor = await db.query(
      aql`FOR b IN sms_formations_clients RETURN b`
    );
    if (options_cursor.hasNext) {
      // cannot delete
      return `Impossible de supprimer cette thématique car elle est liée à une ou plusieurs données`;
    } else {
      // can delete
      const doc_cursor = await db.query(aql`REMOVE ${docKey} IN 
      sms_activity_themes RETURN OLD`);
      if (doc_cursor.hasNext) {
        return "SUCCESS";
      } else {
        return `Une erreur s'est produite lors de la suppression de la thématique`;
      }
    }
  },
};

export default smsActivityThemesResolver;
