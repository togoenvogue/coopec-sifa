import { aql, db } from "../../../../db/arangodb.js";
import { getCompanyDoc, getProjectDoc } from "../../../../helpers/joindocs.js";

const loanGroupRoleResolver = {
  loanGroupRoleCreate: async ({ projectKey, companyKey, roleName }) => {
    const obj = {
      timeStamp: Date.now(),
      projectKey,
      companyKey,
      roleName,
    };

    const doc_cursor = await db.query(aql`INSERT ${obj} 
    INTO loan_group_roles RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Erreur lors de la création du rôle`;
    }
  },

  loanGroupRoleUpdate: async ({ key, roleName }) => {
    const obj = {
      roleName,
    };

    const doc_cursor = await db.query(aql`FOR p IN loan_group_roles
    FILTER p._key == ${key} UPDATE ${key} WITH ${obj} 
    IN loan_group_roles RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Erreur lors de la mise à jour du rôle`;
    }
  },

  loanGroupRoles: async ({ skip, perPage }) => {
    const docs_cursor = await db.query(
      aql`FOR p IN loan_group_roles  
      SORT p.roleName ASC LIMIT ${skip}, ${perPage} RETURN p`,
      { fullCount: true },
      { count: true }
    );
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return {
          ...(doc.companyKey = await getCompanyDoc({
            companyKey: doc.companyKey,
          })),
          ...(doc.projectKey = await getProjectDoc({
            projectKey: doc.projectKey,
          })),
          ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
          ...doc,
        };
      });
    } else {
      return [];
    }
  },
};

export default loanGroupRoleResolver;
