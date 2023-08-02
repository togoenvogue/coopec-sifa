import { aql, db } from "../../../../db/arangodb.js";
import { getUserDoc, getCompanyDoc } from "../../../../helpers/joindocs.js";

const projectResolver = {
  projects: async ({ adminKey, companyKey, isSuperAdmin }) => {
    const docs_cursor =
      isSuperAdmin == true
        ? await db.query(aql`FOR c IN project  
        SORT c.projectName ASC RETURN c`)
        : await db.query(aql`FOR c IN project 
        FILTER c.adminKey == ${adminKey} AND c.companyKey == ${companyKey}
        SORT c.projectName ASC RETURN c`);

    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return {
          ...(doc.adminKey = await getUserDoc({ userKey: doc.adminKey })),
          ...(doc.companyKey = await getCompanyDoc({
            companyKey: doc.companyKey,
          })),
          ...(doc.fullCount = 1),
          ...doc,
        };
      });
    } else {
      return [];
    }
  },

  projectsByCompanyKey: async ({ companyKey }) => {
    const docs_cursor = await db.query(aql`FOR p IN project 
    FILTER p.companyKey == ${companyKey} RETURN p`);
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return {
          ...(doc.fullCount = 1),
          ...doc,
        };
      });
    } else {
      return [];
    }
  },

  projectCreate: async ({
    adminKey,
    companyKey,
    projectName,
    isActive,
    appId,
    appLabel,
    appLogo,
    appName,
    appSenderId,
    appThemeColor,
    appWebsite,
    appCustom1,
    appCustom2,
    appCustom3,
    appCustom4,
    appCustom5,
    maxOffice,
    loanQuestionnaireKey,
  }) => {
    // select the company
    const company_doc = await db.query(aql`FOR c IN company FILTER 
      c._key == ${companyKey} RETURN c`);
    if (company_doc.hasNext) {
      const company = await company_doc.next();
      // select projects
      const projects_doc = await db.query(aql`FOR p IN project FILTER 
        p.adminKey == ${adminKey} AND p.companyKey == ${companyKey} RETURN p`);
      const projects = await projects_doc.all();

      if (company.projectMaxCount - projects.length > 0) {
        const projObj = {
          timeStamp: Date.now(),
          adminKey: adminKey,
          companyKey: companyKey,
          projectName: projectName,
          isActive: isActive,
          appId: appId,
          appLabel: appLabel,
          appLogo: appLogo,
          appName: appName,
          appSenderId: appSenderId,
          appThemeColor: appThemeColor,
          appWebsite: appWebsite,
          appCustom1: appCustom1,
          appCustom2: appCustom2,
          appCustom3: appCustom3,
          appCustom4: appCustom4,
          appCustom5: appCustom5,
          maxOffice: maxOffice,
          loanQuestionnaireKey: loanQuestionnaireKey,
        };

        const doc_cursor = await db.query(
          aql`INSERT ${projObj} INTO project RETURN NEW`
        );
        if (doc_cursor.hasNext) {
          const doc = await doc_cursor.next();

          // roleRules
          const roleRuleObj = {
            projectKey: doc._key,
            companyKey: companyKey,
            canRead: false,
            canWrite: false,
            canUpdate: false,
            canDelete: false,
            canApprove: false,
            canCollect: false,
            canComment: false,
            canDispatch: false,
            canCharge: false,
            canAnalyse: false,
            canDeliver: false,
            canLoad: false,
            canDecide: false,
          };
          // create roleRules
          await db.query(aql`INSERT ${roleRuleObj} INTO role_rules RETURN NEW`);

          return {
            ...(doc.fullCount = 1),
            ...doc,
          };
        } else {
          throw new Error(`Erreur lors de la creation du projet`);
        }
      } else {
        throw new Error(
          `Vous ne pouvez pas créer plus de ${company.projectMaxCount} project(s). Contactez l'administrateur pour augmenter les caractéristiques de votre compte`
        );
      }
      // select
    } else {
      throw new Error(`Erreur de sélection de votre organisation`);
    }
  },

  projectUpdate: async ({
    adminKey,
    companyKey,
    projectName,
    projectKey,
    isActive,
    appId,
    appLabel,
    appLogo,
    appName,
    appSenderId,
    appThemeColor,
    appWebsite,
    appCustom1,
    appCustom2,
    appCustom3,
    appCustom4,
    appCustom5,
    maxOffice,
    loanQuestionnaireKey,
  }) => {
    // select the project
    const project_doc = await db.query(aql`FOR p IN project FILTER 
    p.adminKey == ${adminKey} AND p._key == ${projectKey} RETURN p`);
    if (project_doc.hasNext) {
      const project = await project_doc.next();
      const projObj = {
        projectName: projectName,
        companyKey: companyKey,
        isActive: isActive,
        appId: appId,
        appLabel: appLabel,
        appLogo: appLogo,
        appName: appName,
        appSenderId: appSenderId,
        appThemeColor: appThemeColor,
        appWebsite: appWebsite,
        appCustom1: appCustom1,
        appCustom2: appCustom2,
        appCustom3: appCustom3,
        appCustom4: appCustom4,
        appCustom5: appCustom5,
        maxOffice: maxOffice,
        loanQuestionnaireKey: loanQuestionnaireKey,
      };
      const doc_cursor = await db.query(aql`UPDATE ${project._key} WITH 
      ${projObj} IN project RETURN NEW`);
      const doc = await doc_cursor.next();
      return {
        ...(doc.fullCount = 1),
        ...doc,
      };
    }
  },

  projectByKey: async ({ projectKey }) => {
    const doc_cursor = await db.query(aql`FOR p IN project 
    FILTER p._key == ${projectKey} RETURN p`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return {
        ...(doc.fullCount = 1),
        ...doc,
      };
    } else {
      throw new Error(`Erreur de selection du projet`);
    }
  },
};

export default projectResolver;
