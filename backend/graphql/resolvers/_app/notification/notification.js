import { aql, db } from "../../../../db/arangodb.js";

const notificationResolver = {
  notificationsGetAll: async ({ companyKey, projectKey }) => {
    const docs_cursor = await db.query(aql`FOR ntf IN notification 
    FILTER ntf.companyKey == ${companyKey} 
    AND ntf.projectKey == ${projectKey}
    OR ntf.companyKey == null
    SORT ntf.timeStamp DESC LIMIT 25 RETURN ntf`);
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

export default notificationResolver;
