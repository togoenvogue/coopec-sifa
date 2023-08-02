import { aql, db } from "../../../../db/arangodb.js";

const backupResolver = {
  getBackupLinks: async ({ skip, perPage, accessLevel, isSuperAdmin }) => {
    const docs_cursor =
      isSuperAdmin == true
        ? await db.query(
            aql`FOR bkl IN backup_links  
            SORT bkl.timeStamp DESC LIMIT ${skip}, ${perPage} RETURN bkl`,
            { fullCount: true },
            { count: true }
          )
        : await db.query(
            aql`FOR bkl IN backup_links  FILTER bkl.type == 'PDF_PV' 
            OR bkl.type == 'PDF_CLIENTS' OR bkl.type == 'PDF_CREDITS'
            SORT bkl.timeStamp DESC LIMIT ${skip}, ${perPage} RETURN bkl`,
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
};

export default backupResolver;
