import { aql, db } from "../../../../db/arangodb.js";
import {
  getCompanyDoc,
  getOfficeDoc,
  getProjectDoc,
  getRoleDocs,
} from "../../../../helpers/joindocs.js";

const sessionLevelResolver = {
  sessionLevelCreate: async ({
    levelName,
    projectKey,
    companyKey,
    maxAmount,
    roleKeys,
    roleNames,
    isActive,
    minAmount,
    levelId,
  }) => {
    const obj = {
      timeStamp: Date.now(),
      levelName: levelName,
      projectKey: projectKey,
      companyKey: companyKey,
      levelId: levelId,
      minAmount: minAmount,
      maxAmount: maxAmount,
      roleKeys: roleKeys,
      roleNames: roleNames,
      isActive: isActive,
    };
    // check if there is any session level with the supplied levelId
    const check_cursor = await db.query(aql`FOR i IN loan_session_levels 
    FILTER i.levelId == ${levelId} RETURN i`);
    if (!check_cursor.hasNext) {
      const doc_cursor = await db.query(aql`INSERT ${obj} 
      INTO loan_session_levels RETURN NEW`);
      if (doc_cursor.hasNext) {
        const doc = await doc_cursor.next();
        return {
          ...doc,
        };
      } else {
        throw new Error(`Erreur lors de la création du niveau de session`);
      }
    } else {
      throw new Error(
        `Désolé, un niveau de session existe déjà avec la référence ${levelId}`
      );
    }
  },

  sessionLevelUpdate: async ({
    levelKey,
    levelName,
    levelId,
    minAmount,
    maxAmount,
    roleKeys,
    roleNames,
    isActive,
  }) => {
    const obj = {
      levelName: levelName,
      minAmount: minAmount,
      maxAmount: maxAmount,
      roleKeys: roleKeys,
      roleNames: roleNames,
      isActive: isActive,
      levelId: levelId,
    };

    const doc_cursor = await db.query(aql`FOR p IN loan_session_levels
    FILTER p._key == ${levelKey} UPDATE ${levelKey} WITH ${obj} 
    IN loan_session_levels RETURN NEW`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return {
        ...doc,
      };
    } else {
      throw new Error(`Erreur lors de la mise à jour du niveau de session`);
    }
  },

  sessionLevelDelete: async ({ levelKey }) => {
    const doc_cursor = await db.query(aql`FOR p IN loan_session_levels
    FILTER p._key == ${levelKey}
    REMOVE ${levelKey} IN loan_session_levels RETURN OLD`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return {
        ...doc,
      };
    } else {
      throw new Error(
        `Erreur lors de la suppression du niveau de session ${levelKey}`
      );
    }
  },

  sessionLevels: async ({ companyKey, projectKey, levelsIds, roleKey }) => {
    //console.log(levelsIds);
    const docs_cursor = await db.query(aql`FOR sl IN loan_session_levels 
        FILTER sl.companyKey == ${companyKey}
        AND sl.projectKey == ${projectKey} 
        AND sl.levelId IN ${levelsIds} 
        OR 
        sl.companyKey == ${companyKey}
        AND sl.projectKey == ${projectKey} 
        AND sl._key IN ${levelsIds} 
        SORT sl.maxAmount ASC RETURN sl`);
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return {
          //...(doc.officeKey = await getOfficeDoc({ officeKey: doc.officeKey })),
          ...(doc.roleKeys = await getRoleDocs({ roleKeys: doc.roleKeys })),
          ...(doc.companyKey = await getCompanyDoc({
            companyKey: doc.companyKey,
          })),
          ...(doc.projectKey = await getProjectDoc({
            projectKey: doc.projectKey,
          })),
          ...doc,
        };
      });
    } else {
      return [];
    }
  },
};

export default sessionLevelResolver;
