import { aql, db, serverSigUrl } from "../../../db/arangodb.js";
import axios from "axios";

import {
  getUserDoc,
  getCompanyDoc,
  getOfficeDoc,
  getProjectDoc,
  getPerfectClientCount,
} from "../../../helpers/joindocs.js";

const groupPerfectResolver = {
  groupSIGList: async ({
    companyKey,
    projectKey,
    userKey,
    coverage,
    officeKey,
    skip,
    perPage,
  }) => {
    if (coverage == "Utilisateur") {
      const docs_cursor = await db.query(
        aql`FOR g IN groupes_sig 
        FILTER g.companyKey == ${companyKey} 
        AND g.projectKey == ${projectKey} 
        AND g.officeKey == ${officeKey} 
        AND g.userKey == ${userKey}
        SORT g.groupName ASC LIMIT ${skip}, ${perPage} RETURN g`,
        { fullCount: true },
        { count: true }
      );
      if (docs_cursor.hasNext) {
        const docs = await docs_cursor.all();
        return docs.map(async (doc) => {
          return {
            ...(doc.companyKey = await getCompanyDoc({
              companyKey: companyKey,
            })),
            ...(doc.projectKey = await getProjectDoc({
              projectKey: projectKey,
            })),
            ...(doc.officeKey = await getOfficeDoc({
              officeKey: doc.officeKey,
            })),
            ...(doc.groupCount = await getPerfectClientCount({
              groupCode: doc.groupCode,
              companyKey: companyKey,
              projectKey: projectKey,
            })),
            ...(doc.userKey = await getUserDoc({ userKey: userKey })),
            ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
            ...doc,
          };
        });
      } else {
        return [];
      }
    } else if (coverage == "Antenne") {
      const docs_cursor = await db.query(
        aql`FOR g IN groupes_sig 
        FILTER g.companyKey == ${companyKey} 
        AND g.projectKey == ${projectKey} 
        AND g.officeKey == ${officeKey}  
        SORT g.groupName ASC LIMIT ${skip}, ${perPage} RETURN g`,
        { fullCount: true },
        { count: true }
      );
      if (docs_cursor.hasNext) {
        const docs = await docs_cursor.all();
        return docs.map(async (doc) => {
          return {
            ...(doc.companyKey = await getCompanyDoc({
              companyKey: companyKey,
            })),
            ...(doc.projectKey = await getProjectDoc({
              projectKey: projectKey,
            })),
            ...(doc.officeKey = await getOfficeDoc({
              officeKey: doc.officeKey,
            })),
            ...(doc.groupCount = await getPerfectClientCount({
              groupCode: doc.groupCode,
              companyKey: companyKey,
              projectKey: projectKey,
            })),
            ...(doc.userKey = await getUserDoc({ userKey: userKey })),
            ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
            ...doc,
          };
        });
      } else {
        return [];
      }
    } else if (coverage == "Globale") {
      const docs_cursor = await db.query(
        aql`FOR g IN groupes_sig 
        FILTER g.companyKey == ${companyKey} 
        AND g.projectKey == ${projectKey} 
        SORT g.groupName ASC LIMIT ${skip}, ${perPage} RETURN g`,
        { fullCount: true },
        { count: true }
      );
      if (docs_cursor.hasNext) {
        const docs = await docs_cursor.all();
        return docs.map(async (doc) => {
          return {
            ...(doc.companyKey = await getCompanyDoc({
              companyKey: companyKey,
            })),
            ...(doc.projectKey = await getProjectDoc({
              projectKey: projectKey,
            })),
            ...(doc.officeKey = await getOfficeDoc({
              officeKey: doc.officeKey,
            })),
            ...(doc.groupCount = await getPerfectClientCount({
              groupCode: doc.groupCode,
              companyKey: companyKey,
              projectKey: projectKey,
            })),
            ...(doc.userKey = await getUserDoc({ userKey: userKey })),
            ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
            ...doc,
          };
        });
      } else {
        return [];
      }
    }
  },

  groupSIGSearch: async ({ companyKey, projectKey, searchString }) => {
    //const toSearch = `_${searchString.toLowerCase()}`;
    const toSearch = `"${searchString.toLowerCase()}%"`;
    //console.log(toSearch);
    const docs_cursor = await db.query(
      aql`FOR g IN groupes_sig 
      FILTER g.companyKey == ${companyKey} 
      AND g.projectKey == ${projectKey} 
      AND LOWER(g.groupCode) LIKE ${toSearch}
      OR 
      g.companyKey == ${companyKey} 
      AND g.projectKey == ${projectKey} 
      AND LOWER(g.groupName) LIKE ${toSearch}
      SORT g.groupName ASC RETURN g`,
      { fullCount: true },
      { count: true }
    );
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return {
          ...(doc.companyKey = await getCompanyDoc({ companyKey: companyKey })),
          ...(doc.projectKey = await getProjectDoc({ projectKey: projectKey })),
          ...(doc.officeKey = await getOfficeDoc({ officeKey: doc.officeKey })),
          ...(doc.groupCount = await getPerfectClientCount({
            groupCode: doc.groupCode,
            companyKey: companyKey,
            projectKey: projectKey,
          })),
          ...(doc.userKey = await getUserDoc({ userKey: doc.userKey })),
          ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
          ...doc,
        };
      });
    } else {
      return [];
    }
  },

  // import groups and clients from the SIG
  importGroupByCodeSig: async ({
    companyKey,
    projectKey,
    officeKey,
    coverage,
    codeSig,
    userKey,
  }) => {
    //console.log(officeKey);
    // select the office
    const office_cursor = await db.query(aql`FOR o IN office FILTER 
    o._key == ${officeKey} RETURN o`);
    if (office_cursor.hasNext) {
      const office = await office_cursor.next();

      const exist_cursor = await db.query(aql`FOR g IN groupes_sig 
      FILTER g.groupCode == ${codeSig} RETURN g`);

      const exist = await exist_cursor.next();
      const groupOwnerKey = exist != undefined ? exist.userKey : null;

      // s'assurer que l'importation se fait par l'animateur precedent
      if (exist == undefined || groupOwnerKey === userKey) {
        // send request
        var result = await axios.post(`${serverSigUrl}/group-by-code-sig`, {
          codeSig: codeSig,
          dbIp: office.sigDBIp,
          dbName: office.sigDBName,
          dbUser: office.sigDBUser,
          dbPass: office.sigDBPass,
          dbPort: office.sigDBPort,
        });

        if (result.data.length > 0) {
          // loop through the data
          for (let index = 0; index < result.data.length; index++) {
            const data = result.data[index];

            const groupeObj = {
              timeStamp: Date.now(),
              userKey: userKey,
              codeAnimateur: null,
              codeAgence: office.externalId,
              groupCode: data.groupRef,
              groupName: data.groupName,
              companyKey: companyKey,
              officeKey: officeKey,
              projectKey: projectKey,
              groupCount: data.groupUsers.length,
              soldeEpargne: data.soldeEpargne,
              soldeDate: Date.now(),
              prevSigLoans: data.prevSigLoans,
              isFromTheSig: true,
              internalId: 0,
            };

            // the group is new to create
            if (exist == undefined || exist == false) {
              // insert group obj
              await db.query(
                aql`INSERT ${groupeObj} INTO groupes_sig RETURN NEW`
              );
            } else {
              // group already exists
              // update group
              const grouUpdateObj = {
                updatedAt: Date.now(),
                codeAgence: office.externalId,
                groupCode: data.groupRef,
                groupName: data.groupName,
                groupCount: data.groupUsers.length,
                soldeEpargne: data.soldeEpargne,
                soldeDate: Date.now(),
                userKey: userKey,
                prevSigLoans: data.prevSigLoans,
              };
              await db.query(aql`UPDATE ${exist._key} 
              WITH ${grouUpdateObj} IN groupes_sig RETURN NEW`);

              // reset group members
              await db.query(aql`FOR b IN clients_sig 
              FILTER b.groupRef == ${codeSig} UPDATE {_key: b._key} 
              WITH { groupRef: "" } IN clients_sig RETURN NEW`);
              // insert new members
            }

            // if the group has clients
            if (data.groupUsers.length > 0) {
              for (let gi = 0; gi < data.groupUsers.length; gi++) {
                const gr = data.groupUsers[gi];
                // create the group users object
                const grUserObj = {
                  codeSig: gr.codeSig,
                  codeTiers: gr.codeTiers,
                  idPersonne: gr.idPersonne,
                  fullName: gr.fullName,
                  gender: gr.sexe,
                  personne: gr.personne, // Morale
                  poste: gr.poste,
                  groupName: gr.groupName,
                  groupRef: gr.groupRef,
                  prevSigLoans: gr.prevSigLoans,
                  soldeEpargne: gr.soldeEpargne,
                  soldeDate: Date.now(),
                  animateurKey: userKey,
                  phone: null,
                  phoneAlt: null,
                  idType: null, // N/A, CNI, Passeport, VoteId,
                  idNumber: null,
                  idDateStart: null,
                  idDateEnd: null,
                  personneRessourceFullName: null,
                  personneRessourceFiliation: null, // Conjoint(e), Enfant, Ami(e) ...
                  personneRessourcePhone: null,
                  personneRessourcePhoneAlt: null,
                  countryKey: "59952752", // TOGO > "59952752"
                  cityKey: null,
                  regionKey: null,
                  prefectureKey: null,
                  cantonKey: null,
                  companyKey: companyKey,
                  officeKey: officeKey,
                  codeAgence: office.externalId,
                  projectKey: projectKey,
                  quartier: null,
                  address: null,
                  addressSinceWhen: null, // depuis quand habitez-vous ce lieu ?
                  addressFiliation: null, // Locataire, Proprietaire
                  activities: null, // actiites regulieres
                  activitiesSinceWhen: null,
                  geoLocations: [],
                  photo: "camera_avatar.png",
                  photo1: "camera_avatar.png",
                  photo2: "camera_avatar.png",
                  photo3: "camera_avatar.png",
                  photo4: "camera_avatar.png",
                  legende: null,
                  legende1: null,
                  legende2: null,
                  legende3: null,
                  legende4: null,
                  status: "Imported",
                  signature: null,
                  signatureCredit: null,
                  fingerPrint: null,
                  fingerPrintCredit: null,
                  updatedAt: Date.now(),
                  isActive: true,
                  maritalStatus: null,
                  numberOfChildren: null,
                  peopleInCharge: null,
                  naissanceDate: null,
                  naissanceLieu: null,
                  fatherFullName: null,
                  motherFullName: null,
                };
                // check if the the client already exists
                const client_exist = await db.query(aql`FOR c IN clients_sig 
                  FILTER c.codeSig == ${gr.codeSig} RETURN c`);
                if (client_exist.hasNext == false) {
                  // insert the client
                  await db.query(aql`INSERT ${grUserObj} 
                    INTO clients_sig RETURN NEW`);
                } else {
                  // update
                  const client = await client_exist.next();
                  const updateUserObj = {
                    fullName: gr.fullName,
                    companyKey: companyKey,
                    officeKey: officeKey,
                    codeAgence: office.externalId,
                    gender: gr.sexe,
                    poste: gr.poste,
                    idPersonne: gr.idPersonne,
                    groupName: gr.groupName,
                    groupRef: gr.groupRef,
                    soldeEpargne: gr.soldeEpargne,
                    soldeDate: Date.now(),
                    prevSigLoans: gr.prevSigLoans,
                  };
                  await db.query(aql`UPDATE ${client._key} 
                    WITH ${updateUserObj} IN clients_sig RETURN NEW`);
                }
              } // end for loop
            } // end if the group has clients
          } // end for loop

          return "SUCCESS";
        } else {
          throw new Error(
            `Aucune donnée n'a été importée. Assurez-vous d'avoir fourni un code SIG valide`
          );
        }
      } else {
        throw new Error(
          `Le groupement ${exist.groupName} (${exist.groupCode}) est déjà dans le portefeuille d'un autre agent de crédit. Contactez le service informatique pour une éventuelle mutation`
        );
      }
    } else {
      return `Erreur de sélection de l'antenne`;
    }
  },

  sigMuterClientOrGroup: async ({
    officeKey,
    codeSig,
    userKey,
    clientOrGroup,
  }) => {
    // select group or client
    const data_cursor =
      clientOrGroup == "Client"
        ? await db.query(aql`FOR c IN clients_sig 
      FILTER c.codeSig == ${codeSig} RETURN c`)
        : await db.query(aql`FOR g IN groupes_sig 
        FILTER g.groupCode == ${codeSig} RETURN g`);

    if (data_cursor.hasNext == true) {
      const data = await data_cursor.next();
      // update
      const update_cursor =
        clientOrGroup == "Client"
          ? await db.query(aql`UPDATE ${data._key} 
          WITH { officeKey: ${officeKey}, animateurKey: ${userKey} } 
          IN clients_sig RETURN NEW`)
          : await db.query(aql`UPDATE ${data._key} 
          WITH { officeKey: ${officeKey}, userKey: ${userKey} } 
          IN groupes_sig RETURN NEW`);

      if (update_cursor.hasNext) {
        return "SUCCESS";
      } else {
        throw new Error(`Une erreur s'est produite lors de la migration`);
      }
    } else {
      throw new Error(
        `Aucun ${
          clientOrGroup == "Group" ? "groupement" : "bénéficiaire"
        } trouvé avec la référence ${codeSig}`
      );
    }
  },

  sigChangeOfficeClientOrGroup: async ({
    officeKey,
    docKey,
    clientOrGroup,
  }) => {
    // select group or client
    const data_cursor =
      clientOrGroup == "Client"
        ? await db.query(aql`FOR c IN clients_sig 
      FILTER c._key == ${docKey} RETURN c`)
        : await db.query(aql`FOR g IN groupes_sig 
        FILTER g._key == ${docKey} RETURN g`);

    if (data_cursor.hasNext == true) {
      const data = await data_cursor.next();
      // update
      const update_cursor =
        clientOrGroup == "Client"
          ? await db.query(aql`UPDATE ${data._key} 
          WITH { officeKey: ${officeKey} } 
          IN clients_sig RETURN NEW`)
          : await db.query(aql`UPDATE ${data._key} 
          WITH { officeKey: ${officeKey} } 
          IN groupes_sig RETURN NEW`);

      if (update_cursor.hasNext) {
        return "SUCCESS";
      } else {
        throw new Error(`Une erreur s'est produite lors de la migration`);
      }
    } else {
      throw new Error(
        `Aucun ${
          clientOrGroup == "Group" ? "groupement" : "bénéficiaire"
        } trouvé avec la référence ${docKey}`
      );
    }
  },

  groupCreate: async ({
    groupName,
    companyKey,
    projectKey,
    officeKey,
    codeAgence,
    codeAnimateur,
    userKey,
  }) => {
    const date = new Date();
    // make sure the name does not exist
    const already_cursor = await db.query(aql`FOR g IN groupes_sig FILTER 
    g.groupName == ${groupName} AND g.officeKey == ${officeKey} RETURN g`);
    if (already_cursor.hasNext == false) {
      // select previous internel group
      const prev_cursor = await db.query(aql`FOR gx IN groupes_sig 
      FILTER gx.isFromTheSig == false SORT gx._key DESC LIMIT 1 RETURN gx`);
      if (prev_cursor.hasNext) {
        const prev = await prev_cursor.next();
        const obj = {
          timeStamp: Date.now(),
          groupName,
          groupCode: `${codeAgence}${date.getFullYear()}${prev.internalId + 1}`,
          internalId: prev.internalId + 1,
          companyKey,
          projectKey,
          officeKey,
          codeAgence,
          codeAnimateur: codeAnimateur[1],
          userKey,
          groupCount: 0,
          soldeEpargne: 0,
          soldeDate: Date.now(),
          prevSigLoans: [],
          isFromTheSig: false,
        };
        // create group
        const cr_cursor = await db.query(
          aql`INSERT ${obj} INTO groupes_sig RETURN NEW`
        );
        if (cr_cursor.hasNext) {
          return "SUCCESS";
        } else {
          throw new Error(
            `Une erreur s'est produire lors de la création du groupe`
          );
        }
      } else {
        // fist internal group to create
        const obj = {
          timeStamp: Date.now(),
          groupName,
          groupCode: `${codeAgence}-${codeAnimateur[1]}-${1}`,
          internalId: 1,
          companyKey,
          projectKey,
          officeKey,
          codeAgence,
          codeAnimateur: codeAnimateur[1],
          userKey,
          groupCount: 0,
          soldeEpargne: 0,
          soldeDate: Date.now(),
          prevSigLoans: [],
          isFromTheSig: false,
        };
        // create group
        const cr_cursor = await db.query(
          aql`INSERT ${obj} INTO groupes_sig RETURN NEW`
        );
        if (cr_cursor.hasNext) {
          return "SUCCESS";
        } else {
          throw new Error(
            `Une erreur s'est produire lors de la création du groupe`
          );
        }
      }
    } else {
      throw new Error(`Un autre groupe au nom de ${groupName} existe déjà`);
    }
  },

  groupDelete: async ({ groupKey, groupRef, userKey }) => {
    // make sure the group was created by the user
    const owner = await db.query(aql`FOR g IN groupes_sig FILTER 
    g.userKey == ${userKey} AND g._key == ${groupKey} RETURN g`);

    if (owner.hasNext == true) {
      // check if any client is linked to this group
      const clients_cursor = await db.query(aql`FOR c IN clients_sig FILTER 
      c.groupRef == ${groupRef} RETURN c`);
      if (clients_cursor.hasNext == false) {
        // make sure the group is not linked to any loan
        const loans_cursor = await db.query(aql`FOR l IN loan_files FILTER 
        l.groupKey == ${groupKey} RETURN l`);
        if (loans_cursor.hasNext == false) {
          // delete
          const del = await db.query(
            aql`REMOVE ${groupKey} IN groupes_sig RETURN OLD`
          );
          if (del.hasNext) {
            return "SUCCESS";
          } else {
            throw new Error(
              `Une erreur s'est produite lors de la suppression du groupe`
            );
          }
        } else {
          throw new Error(
            `Impossible de supprimer ce groupe car un ou plusieurs dossiers de crédit lui sont liés`
          );
        }
      } else {
        throw new Error(
          `Impossible de supprimer ce groupe car un ou plusieurs bénéficiaires lui sont liés`
        );
      }
    } else {
      throw new Error(
        `Vous ne pouvez supprimer que des groupes que vous avez créés`
      );
    }
  },
};

export default groupPerfectResolver;
