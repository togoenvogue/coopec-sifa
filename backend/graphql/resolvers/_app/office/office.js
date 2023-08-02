import { aql, db } from "../../../../db/arangodb.js";
import {
  getUserDoc,
  getCompanyDoc,
  getProjectDoc,
} from "../../../../helpers/joindocs.js";

const officeResolver = {
  offices: async ({ adminKey, companyKey, projectKey }) => {
    const docs_cursor = await db.query(
      aql`FOR c IN office 
    FILTER c.adminKey == ${adminKey} AND c.companyKey == ${companyKey} 
    AND c.projectKey == ${projectKey} SORT c.projectName ASC RETURN c`,
      { fullCount: true },
      { count: true }
    );
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return {
          ...(doc.adminKey = await getUserDoc({ userKey: doc.adminKey })),
          ...(doc.projectKey = await getProjectDoc({
            projectKey: doc.projectKey,
          })),
          ...(doc.companyKey = await getCompanyDoc({
            companyKey: doc.companyKey,
          })),
          ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
          ...doc,
        };
      });
    } else {
      return [];
    }
  },

  officeByKey: async ({ officeKey }) => {
    const doc_cursor = await db.query(aql`FOR c IN office 
    FILTER c._key == ${officeKey} RETURN c`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return {
        ...(doc.adminKey = await getUserDoc({ userKey: doc.adminKey })),
        ...(doc.projectKey = await getProjectDoc({
          projectKey: doc.projectKey,
        })),
        ...(doc.companyKey = await getCompanyDoc({
          companyKey: doc.companyKey,
        })),
        ...(doc.fullCount = 1),
        ...doc,
      };
    } else {
      throw new Error(`Erreur de sélection de l'antenne ${officeKey}`);
    }
  },

  officeCreate: async ({
    adminKey,
    companyKey,
    projectKey,
    isActive,
    plafond,
    officeName,
    externalId,
    sigDBName,
    sigDBUser,
    sigDBPass,
    sigDBPort,
    sigDBIp,
    requestSkip,
    requestBatch,
    dbtestUrl,
  }) => {
    // select project
    const project_doc = await db.query(aql`FOR p IN project FILTER 
        p.companyKey == ${companyKey}
        AND p._key == ${projectKey} RETURN p`);
    // select company
    const company_doc = await db.query(aql`FOR c IN company FILTER 
        c._key == ${companyKey} RETURN c`);

    const offices_doc = await db.query(aql`FOR o IN office FILTER 
        o.companyKey == ${companyKey} 
        AND o.projectKey == ${projectKey} RETURN o`);
    const offices = await offices_doc.all();

    if (project_doc.hasNext && company_doc.hasNext) {
      const project = await project_doc.next();
      if (offices.length + 1 < project.maxOffice) {
        // make sure there no other office with the same name (Agence Master for instance)

        const officeObj = {
          timeStamp: Date.now(),
          adminKey,
          companyKey,
          projectKey,
          isActive,
          plafond,
          officeName,
          externalId,
          enableLoanSubmition: true,
          sigDBName,
          sigDBUser,
          sigDBPass,
          sigDBPort,
          sigDBIp,
          requestSkip,
          requestBatch,
          dbtestUrl,
        };
        const doc_cursor = await db.query(
          aql`INSERT ${officeObj} INTO office RETURN NEW`
        );
        if (doc_cursor.hasNext) {
          const doc = await doc_cursor.next();
          return "SUCCESS";
        } else {
          throw new Error(
            `Erreur lors de la création de l'agence. Essayez de nouveau`
          );
        }
      } else {
        throw new Error(
          `Désolé, vous ne pouvez pas créer plus de ${project.maxOffice} agences.`
        );
      }
    } else {
      throw new Error(`Erreur de sélection du projet et de l'entreprise`);
    }
  },

  officeUpdate: async ({
    officeKey,
    isActive,
    officeName,
    plafond,
    externalId,
    sigDBName,
    sigDBUser,
    sigDBPass,
    sigDBPort,
    sigDBIp,
    requestSkip,
    requestBatch,
    dbtestUrl,
  }) => {
    // select project
    const office_doc = await db.query(aql`FOR o IN office FILTER 
        o._key == ${officeKey} RETURN o`);

    if (office_doc.hasNext) {
      const office = await office_doc.next();
      //TODO
      // make sure there no other office with the same name (Agence Master for instance)
      const officeObj = {
        isActive,
        officeName,
        plafond,
        externalId,
        sigDBName,
        sigDBUser,
        sigDBPass,
        sigDBPort,
        sigDBIp,
        requestSkip,
        requestBatch,
        dbtestUrl,
      };
      const doc_cursor = await db.query(aql`UPDATE ${office._key} 
      WITH ${officeObj} IN office RETURN NEW`);
      if (doc_cursor.hasNext) {
        const doc = await doc_cursor.next();
        return "SUCCESS";
      } else {
        return `Erreur de mise à jour de l'antenne. Essayez de nouveau`;
      }
    } else {
      return `Erreur de sélection de l'antenne`;
    }
  },

  officesByProject: async ({
    companyKey,
    projectKey,
    accessLevel,
    userOfficeKey,
    coverage,
  }) => {
    //console.log(accessLevel);
    //console.log(coverage);
    if (accessLevel > 2) {
      const docs_cursor = await db.query(
        aql`FOR o IN office FILTER 
      o.companyKey == ${companyKey} AND o.projectKey == ${projectKey} 
      SORT o.officeName ASC RETURN o`,
        { fullCount: true },
        { count: true }
      );
      if (docs_cursor.hasNext) {
        const docs = await docs_cursor.all();
        return docs.map(async (doc) => {
          return {
            ...(doc.adminKey = await getUserDoc({ userKey: doc.adminKey })),
            ...(doc.projectKey = await getProjectDoc({
              projectKey: doc.projectKey,
            })),
            ...(doc.companyKey = await getCompanyDoc({
              companyKey: doc.companyKey,
            })),
            ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
            ...doc,
          };
        });
      } else {
        return [];
      }
    } else if (accessLevel <= 2 || coverage == "Utilisateur") {
      const docs_cursor = await db.query(
        aql`FOR o IN office FILTER 
      o.companyKey == ${companyKey} AND o.projectKey == ${projectKey} 
      AND o._key == ${userOfficeKey} SORT o.officeName ASC RETURN o`,
        { fullCount: true },
        { count: true }
      );
      if (docs_cursor.hasNext) {
        const docs = await docs_cursor.all();
        return docs.map(async (doc) => {
          return {
            ...(doc.adminKey = await getUserDoc({ userKey: doc.adminKey })),
            ...(doc.projectKey = await getProjectDoc({
              projectKey: doc.projectKey,
            })),
            ...(doc.companyKey = await getCompanyDoc({
              companyKey: doc.companyKey,
            })),
            ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
            ...doc,
          };
        });
      } else {
        return [];
      }
    }
  },

  officeDelete: async ({ officeKey, projectKey }) => {
    // select the office
    const office_doc = await db.query(aql`FOR o IN office FILTER 
    o._key == ${officeKey} AND o.projectKey == ${projectKey} RETURN o`);
    // check if offic is in use
    if (office_doc.hasNext) {
      const doc_cursor = await db.query(aql`FOR o IN office 
      FILTER o._key == ${officeKey} REMOVE o._key IN office RETURN OLD`);
      if (doc_cursor.hasNext) {
        const doc = await doc_cursor.next();
        return "SUCCESS";
      } else {
        return `Erreur de suppression de l'antenne ${officeKey}`;
      }
    } else {
      return `Désolé, vous n'êtes pas autorisé à supprimer cette antenne`;
    }
  },

  officeSetLoanSubmition: async ({
    officeKey,
    userKey,
    companyKey,
    projectKey,
    canSubmit,
  }) => {
    // select the group
    const office_custor = await db.query(aql`FOR o IN office 
        FILTER o._key == ${officeKey}
        AND o.companyKey == ${companyKey}
        AND o.projectKey == ${projectKey} RETURN o`);
    if (office_custor.hasNext) {
      const update_cursor = await db.query(aql`UPDATE ${officeKey} 
      WITH { enableLoanSubmition: ${canSubmit} } IN office RETURN NEW`);
      if (update_cursor.hasNext) {
        return "TRUE";
      } else {
        return `Désolé, une erreur s\'est produite lors de la configuration de la soumission des dossiers par les animateurs`;
      }
    }
  },
};

export default officeResolver;
