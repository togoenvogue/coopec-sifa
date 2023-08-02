import { aql, db } from "../../../../db/arangodb.js";
import {
  getUserDoc,
  getCompanyDoc,
  getProjectDoc,
} from "../../../../helpers/joindocs.js";

const roleResolver = {
  rolesByProject: async ({ companyKey, projectKey, skip, perPage }) => {
    const docs_cursor = await db.query(
      aql`FOR r IN role FILTER 
    r.companyKey == ${companyKey} AND r.projectKey == ${projectKey} 
    SORT r.label ASC LIMIT ${skip}, ${perPage} RETURN r`,
      { fullCount: true },
      { count: true }
    );
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return {
          ...(doc.adminKey = await getUserDoc({ userKey: doc.adminKey })),
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

  roleCreate: async ({
    label,
    adminKey,
    projectKey,
    companyKey,
    isActive,
    custom1,
    custom2,
  }) => {
    // select user
    const user_doc = await db.query(aql`FOR u IN user FILTER 
      u._key == ${adminKey} RETURN u`);
    // select project
    const project_doc = await db.query(aql`FOR p IN project FILTER 
      p._key == ${projectKey} RETURN p`);

    if (user_doc.hasNext && project_doc.hasNext) {
      // select all modules
      const modules_docs = await db.query(aql`FOR m IN module 
      FILTER ${companyKey} IN m.companies AND m.isActive == true RETURN m`);
      let modulesArr = [];
      if (modules_docs.hasNext) {
        const modules = await modules_docs.all();

        for (let index = 0; index < modules.length; index++) {
          const module = modules[index];
          // bulid object
          let moduleObj = {
            moduleKey: module._key,
            moduleName: module.moduleName,
            moduleDesc: module.moduleDesc,
            moduleRef: module.moduleRef,
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
          modulesArr.push(moduleObj);
        }
      }

      const roleObj = {
        companyKey: companyKey,
        projectKey: projectKey,
        adminKey: adminKey,
        label: label,
        isActive: isActive,
        modules: modulesArr,
        custom1: custom1.length >= 3 ? custom1 : null,
        custom2: custom2.length >= 3 ? custom2 : null,
      };
      const role_doc = await db.query(
        aql`INSERT ${roleObj} INTO role RETURN NEW`
      );
      if (role_doc.hasNext) {
        const role = await role_doc.next();
        return { ...role };
      } else {
        throw new Error(
          `Erreur de création du rôle ou du poste. Contactez l'administrateur`
        );
      }
    } else {
      throw new Error(`Erreur de sélection de l'entreprise et du projet`);
    }
  },

  roleDelete: async ({ companyKey, projectKey, roleKey }) => {
    const role_cursor = await db.query(aql`FOR r IN role FILTER 
    r.companyKey == ${companyKey} AND r.projectKey == ${projectKey} 
    AND r._key == ${roleKey} RETURN r`);
    if (role_cursor.hasNext) {
      const doc_cursor = await db.query(aql`REMOVE ${roleKey} 
      IN role RETURN OLD`);
      if (doc_cursor.hasNext) {
        const doc = await doc_cursor.next();
        return { ...doc };
      } else {
        throw new Error(`Erreur de suppression du rôle : ${roleKey}`);
      }
    } else {
      throw new Error(`Erreur de sélection du rôle`);
    }
  },

  roleUpdate: async ({
    label,
    adminKey,
    roleKey,
    isActive,
    companyKey,
    projectKey,
    custom1,
    custom2,
    resetModules,
  }) => {
    // select user
    const rolex_doc = await db.query(aql`FOR r IN role FILTER 
      r._key == ${roleKey}  RETURN r`);

    if (rolex_doc.hasNext) {
      const rolex = await rolex_doc.next();
      if (resetModules == false) {
        const roleObj = {
          label: label,
          companyKey: companyKey,
          projectKey: projectKey,
          custom1: custom1.length >= 3 ? custom1 : null,
          custom2: custom2.length >= 3 ? custom2 : null,
          isActive: isActive,
        };
        const role_doc = await db.query(
          aql`UPDATE ${rolex._key} WITH ${roleObj} IN role RETURN NEW`
        );
        if (role_doc.hasNext) {
          const role = await role_doc.next();
          return { ...role };
        } else {
          throw new Error(
            `Erreur de création du rôle ou du poste. Contactez l'administrateur`
          );
        }
      } else {
        // select all modules
        const modules_docs = await db.query(aql`FOR m IN module 
        FILTER ${companyKey} IN m.companies AND m.isActive == true RETURN m`);
        if (modules_docs.hasNext) {
          const modules = await modules_docs.all();
          let modulesArr = [];

          for (let index = 0; index < modules.length; index++) {
            const module = modules[index];
            // bulid object
            let moduleObj = {
              moduleKey: module._key,
              moduleName: module.moduleName,
              moduleDesc: module.moduleDesc,
              moduleRef: module.moduleRef,
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
            modulesArr.push(moduleObj);
          }

          // update
          const role_doc = await db.query(aql`UPDATE ${rolex._key} 
          WITH {modules: ${modulesArr}} IN role RETURN NEW`);
          if (role_doc.hasNext) {
            const role = await role_doc.next();
            return { ...role };
          } else {
            throw new Error(
              `Erreur de création du rôle ou du poste. Contactez l'administrateur`
            );
          }
        }
      }
    } else {
      throw new Error(`Erreur de sélection de l'entreprise et du projet`);
    }
  },

  roleSetModuleSingle: async ({ roleKey, moduleKey, action, trueOrFalse }) => {
    // select the role
    const role_doc = await db.query(aql`FOR r IN role 
      FILTER r._key == ${roleKey} RETURN r`);
    if (role_doc.hasNext) {
      const role = await role_doc.next();
      // select module
      const module_doc = await db.query(aql`FOR m IN module FILTER 
      m._key == ${moduleKey} RETURN m`);
      if (module_doc.hasNext) {
        const module = await module_doc.next();

        const modules = role.modules;
        // extract the module to update
        let moduleObj = modules.find((el) => el.moduleKey === moduleKey);
        if (moduleObj != null) {
          if (action == "canRead") {
            moduleObj.canRead = trueOrFalse;
          } else if (action == "canWrite") {
            moduleObj.canWrite = trueOrFalse;
          } else if (action == "canUpdate") {
            moduleObj.canUpdate = trueOrFalse;
          } else if (action == "canDelete") {
            moduleObj.canDelete = trueOrFalse;
          } else if (action == "canApprove") {
            moduleObj.canApprove = trueOrFalse;
          } else if (action == "canCollect") {
            moduleObj.canCollect = trueOrFalse;
          } else if (action == "canComment") {
            moduleObj.canComment = trueOrFalse;
          } else if (action == "canDispatch") {
            moduleObj.canDispatch = trueOrFalse;
          } else if (action == "canCharge") {
            moduleObj.canCharge = trueOrFalse;
          } else if (action == "canAnalyse") {
            moduleObj.canAnalyse = trueOrFalse;
          } else if (action == "canDeliver") {
            moduleObj.canDeliver = trueOrFalse;
          } else if (action == "canLoad") {
            moduleObj.canLoad = trueOrFalse;
          } else if (action == "canDecide") {
            moduleObj.canDecide = trueOrFalse;
          }
          //console.log(obj);
          // remove the object from the array
          let newModules = modules.filter((el) => el.moduleKey !== moduleKey);
          // push back the object in the array
          newModules.push(moduleObj);
          //console.log(newModules);
          // update record
          // update
          const update_doc = await db.query(aql`UPDATE ${role._key} 
          WITH { modules: ${newModules} } IN role RETURN NEW`);
          if (update_doc.hasNext) {
            const update = await update_doc.next();
            return { ...update };
          } else {
            throw new Error(`Erreur de mise à jour du rôle ou du poste`);
          }
        } else {
          // add the new obj
          let moduleObj = {
            moduleKey: moduleKey,
            moduleName: module.moduleName,
            moduleDesc: module.moduleDesc,
            moduleRef: module.moduleRef,
          };
          if (action == "canRead") {
            moduleObj.canRead = trueOrFalse;
          } else if (action == "canWrite") {
            moduleObj.canWrite = trueOrFalse;
          } else if (action == "canUpdate") {
            moduleObj.canUpdate = trueOrFalse;
          } else if (action == "canDelete") {
            moduleObj.canDelete = trueOrFalse;
          } else if (action == "canApprove") {
            moduleObj.canApprove = trueOrFalse;
          } else if (action == "canCollect") {
            moduleObj.canCollect = trueOrFalse;
          } else if (action == "canComment") {
            moduleObj.canComment = trueOrFalse;
          } else if (action == "canDispatch") {
            moduleObj.canDispatch = trueOrFalse;
          } else if (action == "canCharge") {
            moduleObj.canCharge = trueOrFalse;
          } else if (action == "canAnalyse") {
            moduleObj.canAnalyse = trueOrFalse;
          } else if (action == "canDeliver") {
            moduleObj.canDeliver = trueOrFalse;
          } else if (action == "canLoad") {
            moduleObj.canLoad = trueOrFalse;
          } else if (action == "canDecide") {
            moduleObj.canDecide = trueOrFalse;
          }
          modules.push(moduleObj);
          //console.log(modules);
          const update_doc = await db.query(aql`UPDATE ${role._key} 
          WITH { modules: ${modules} } IN role RETURN NEW`);
          if (update_doc.hasNext) {
            const update = await update_doc.next();
            return { ...update };
          } else {
            throw new Error(`Erreur de mise à jour du rôle ou du poste`);
          }
        }
      } else {
        throw new Error(`Erreur de sélection du module ${moduleKey}`);
      }
    } else {
      throw new Error(`Erreur de sélection du rôle ou du poste`);
    }
  },

  roleRuleUpdate: async ({
    key,
    canRead,
    canWrite,
    canUpdate,
    canDelete,
    canApprove,
    canCollect,
    canComment,
    canDispatch,
    canCharge,
    canAnalyse,
    canDeliver,
    canLoad,
    canDecide,
  }) => {
    const obj = {
      canRead: canRead,
      canWrite: canWrite,
      canUpdate: canUpdate,
      canDelete: canDelete,
      canApprove: canApprove,
      canCollect: canCollect,
      canComment: canComment,
      canDispatch: canDispatch,
      canCharge: canCharge,
      canAnalyse: canAnalyse,
      canDeliver: canDeliver,
      canLoad: canLoad,
      canDecide: canDecide,
    };

    const doc_cursor = await db.query(
      aql`UPDATE ${key} WITH ${obj} IN role_rules RETURN NEW`
    );
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      //console.log(doc);
      return { ...doc };
    }
  },

  roleRulesByProject: async ({ status, companyKey, projectKey }) => {
    //console.log(status);
    if (status == "All") {
      const docs_cursor = await db.query(aql`FOR rr IN role_rules RETURN rr`);
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
            ...doc,
          };
        });
      } else {
        return [];
      }
    } else {
      // retur only true
      const docs_cursor = await db.query(aql`FOR rr IN role_rules 
        FILTER rr.companyKey == ${companyKey}
         AND rr.projectKey == ${projectKey} RETURN rr`);
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
            ...doc,
          };
        });
      } else {
        return [];
      }
    }
  },
};

export default roleResolver;
