import { aql, db, serverSigUrl } from "../../../db/arangodb.js";
import axios from "axios";
import os from "os";

import {
  getUserDoc,
  getCompanyDoc,
  getOfficeDoc,
  getCountryDoc,
  getCityDoc,
  getProjectDoc,
  getOfficeName,
  getRegionDoc,
  getPrefectureDoc,
  getCantonDoc,
} from "../../../helpers/joindocs.js";
import { _clientPerfectDownload } from "./client_pdf.js";

const clientSIGResolver = {
  clientUpdate: async ({
    clientKey,
    animateurKey,
    phone,
    phoneAlt,
    idType,
    idNumber,
    idDateStart,
    idDateEnd,
    personneRessourceFullName,
    personneRessourceFiliation,
    personneRessourcePhone,
    personneRessourcePhoneAlt,
    countryKey,
    cityKey,
    quartier,
    address,
    addressSinceWhen,
    addressFiliation,
    activities,
    activitiesSinceWhen,
    activitiesAutres,
    geoLieux,
    geoLats,
    geoLongs,
    gender,
    naissanceDate,
    naissanceLieu,
    fatherFullName,
    motherFullName,
    maritalStatus,
    numberOfChildren,
    peopleInCharge,
    regionKey,
    prefectureKey,
    cantonKey,
    intituleDuCompte,
  }) => {
    // build the geolocs
    let geoLocations = [];
    if (geoLieux.length > 0) {
      for (let index = 0; index < geoLieux.length; index++) {
        const lieu = geoLieux[index];
        const lat = geoLats[index];
        const long = geoLongs[index];
        geoLocations.push({ lieu: lieu, lat: lat, long: long });
      }
    }
    // select client
    const obj = {
      animateurKey,
      phone: phone != "" ? phone : null,
      phoneAlt: phoneAlt != "" ? phoneAlt : null,
      idType: idType != "" ? idType : null,
      idNumber: idNumber != "" ? idNumber : null,
      intituleDuCompte: intituleDuCompte != "" ? intituleDuCompte : null,
      idDateStart,
      idDateEnd,
      personneRessourceFullName:
        personneRessourceFullName != "" ? personneRessourceFullName : null,
      personneRessourceFiliation:
        personneRessourceFiliation != "" ? personneRessourceFiliation : null,
      personneRessourcePhone:
        personneRessourcePhone != "" ? personneRessourcePhone : null,
      personneRessourcePhoneAlt:
        personneRessourcePhoneAlt != "" ? personneRessourcePhoneAlt : null,
      countryKey,
      cityKey,
      regionKey,
      prefectureKey,
      cantonKey,
      quartier: quartier != "" ? quartier : null,
      address: address != "" ? address : null,
      addressSinceWhen: addressSinceWhen != "" ? addressSinceWhen : null,
      addressFiliation: addressFiliation != "" ? addressFiliation : null,
      activities: activities != "" ? activities : null,
      activitiesAutres: activitiesAutres != "" ? activitiesAutres : null,
      geoLocations: geoLocations,
      gender,
      naissanceDate,
      activitiesSinceWhen:
        activitiesSinceWhen != "" ? activitiesSinceWhen : null,
      naissanceLieu: naissanceLieu != "" ? naissanceLieu : null,
      fatherFullName: fatherFullName != "" ? fatherFullName : null,
      motherFullName: motherFullName != "" ? motherFullName : null,
      maritalStatus: maritalStatus != "" ? maritalStatus : null,
      numberOfChildren,
      peopleInCharge,
    };

    const doc_cursor = await db.query(aql`UPDATE ${clientKey} 
      WITH ${obj} IN clients_sig RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Erreur lors de la mise à jour du bénéficiaire`;
    }
  },

  clientDelete: async ({ clientKey }) => {
    const doc_cursor = await db.query(aql`FOR o IN clients_sig 
      FILTER o._key == ${clientKey} REMOVE o._key IN clients_sig RETURN OLD`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Erreur de suppression du client ${clientKey}`;
    }
  },

  // get client by key or code sig
  clientByKey: async ({ clientKey }) => {
    const sel_cursor = await db.query(aql`FOR c IN clients_sig 
    FILTER c._key == ${clientKey} 
    OR c.code == ${clientKey} RETURN c`);
    if (sel_cursor.hasNext) {
      const sel = await sel_cursor.next();

      // select office
      const _office = await getOfficeDoc({ officeKey: sel.officeKey });

      // request new data from the SIG
      var result = await axios.post(`${serverSigUrl}/client-by-code-sig`, {
        codeSig: sel.codeSig,
        dbIp: _office.sigDBIp,
        dbName: _office.sigDBName,
        dbUser: _office.sigDBUser,
        dbPass: _office.sigDBPass,
        dbPort: _office.sigDBPort,
      });

      var resultData = result.data;
      /**
       [
          {
            fullName: 'BIANLA  DAMETOTI',
            groupName: null,
            groupRef: '00',
            codeSig: '20100514',
            codeAgence: 1,
            personne: 'Physique',
            sexe: 'Homme',
            poste: null,
            groupUsers: [],
            soldeEpargne: 67,
            prevSigLoans: []
          }
       ]
       */

      if (resultData.length > 0) {
        // update the client
        const obj = {
          soldeEpargne: resultData[0].soldeEpargne,
          soldeDate: Date.now(),
        };
        // update the client
        const update_cursor = await db.query(aql`UPDATE ${clientKey} 
        WITH ${obj} IN clients_sig RETURN NEW`);
        if (update_cursor.hasNext) {
          const doc = await update_cursor.next();

          return {
            ...(doc.projectKey = await getProjectDoc({
              projectKey: doc.projectKey,
            })),
            ...(doc.animateurKey = await getUserDoc({
              userKey: doc.animateurKey,
            })),
            ...(doc.companyKey = await getCompanyDoc({
              companyKey: doc.companyKey,
            })),
            ...(doc.officeKey = await getOfficeDoc({
              officeKey: doc.officeKey,
            })),
            ...(doc.countryKey = await getCountryDoc({ key: doc.countryKey })),
            ...(doc.regionKey =
              doc.regionKey != null
                ? await getRegionDoc({ key: doc.regionKey })
                : null),
            ...(doc.prefectureKey =
              doc.prefectureKey != null
                ? await getPrefectureDoc({ key: doc.prefectureKey })
                : null),
            ...(doc.cantonKey =
              doc.cantonKey != null
                ? await getCantonDoc({ key: doc.cantonKey })
                : null),
            ...(doc.cityKey = await getCityDoc({ key: doc.cityKey })),
            ...(doc.fullCount = 1),
            ...doc,
          };
        } else {
          return {};
        }
      } else {
        return {
          ...(sel.fullCount = 1),
          ...(sel.projectKey = await getProjectDoc({
            projectKey: sel.projectKey,
          })),
          ...(sel.animateurKey = await getUserDoc({
            userKey: sel.animateurKey,
          })),
          ...(sel.companyKey = await getCompanyDoc({
            companyKey: sel.companyKey,
          })),
          ...(sel.officeKey = await getOfficeDoc({
            officeKey: sel.officeKey,
          })),
          ...(sel.countryKey = await getCountryDoc({ key: sel.countryKey })),
          ...(sel.cityKey = await getCityDoc({ key: sel.cityKey })),
          ...sel,
        };
      }

      // no client found
    } else {
      return {};
    }
  },

  // get clients based on a group Code or individual clients with groupe code "00"
  clientsSIG: async ({
    projectKey,
    companyKey,
    officeKey,
    animateurKey,
    groupCode,
    accessLevel,
    skip,
    perPage,
    extend,
  }) => {
    if (accessLevel == 1) {
      const docs_cursor =
        groupCode != "00"
          ? await db.query(
              aql`FOR c IN clients_sig 
              FILTER c.projectKey == ${projectKey} 
              AND c.companyKey == ${companyKey}    
              AND c.groupRef == ${groupCode} 
              AND c.animateurKey == ${animateurKey}
              SORT c.fullName ASC LIMIT ${skip}, ${perPage} RETURN c`,
              { fullCount: true },
              { count: true }
            )
          : await db.query(
              aql`FOR c IN clients_sig 
              FILTER c.projectKey == ${projectKey} 
              AND c.companyKey == ${companyKey}   
              AND c.groupRef == "00" 
              AND c.animateurKey == ${animateurKey}
              SORT c.fullName ASC LIMIT ${skip}, ${perPage} RETURN c`,
              { fullCount: true },
              { count: true }
            );
      if (docs_cursor.hasNext) {
        //console.log(docs_cursor.extra);
        const docs = await docs_cursor.all();
        return docs.map(async (doc) => {
          return {
            ...(doc.projectKey = await getProjectDoc({
              projectKey: doc.projectKey,
            })),
            ...(doc.animateurKey = await getUserDoc({
              userKey: doc.animateurKey,
            })),
            ...(doc.companyKey = await getCompanyDoc({
              companyKey: doc.companyKey,
            })),
            ...(doc.officeKey = await getOfficeDoc({
              officeKey: doc.officeKey,
            })),
            ...(doc.countryKey = await getCountryDoc({ key: doc.countryKey })),
            ...(doc.cityKey = await getCityDoc({ key: doc.cityKey })),
            ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
            ...(doc.regionKey =
              doc.regionKey != null
                ? await getRegionDoc({ key: doc.regionKey })
                : null),
            ...(doc.prefectureKey =
              doc.prefectureKey != null
                ? await getPrefectureDoc({ key: doc.prefectureKey })
                : null),
            ...(doc.cantonKey =
              doc.cantonKey != null
                ? await getCantonDoc({ key: doc.cantonKey })
                : null),
            ...doc,
          };
        });
      } else {
        return [];
      }
    } else if (accessLevel == 2) {
      const docs_cursor =
        groupCode != "00"
          ? await db.query(
              aql`FOR c IN clients_sig 
              FILTER c.projectKey == ${projectKey} 
              AND c.companyKey == ${companyKey} 
              AND c.officeKey == ${officeKey} 
              AND c.groupRef == ${groupCode}
              SORT c.fullName ASC LIMIT ${skip}, ${perPage} RETURN c`,
              { fullCount: true },
              { count: true }
            )
          : await db.query(
              aql`FOR c IN clients_sig 
            FILTER c.projectKey == ${projectKey} 
            AND c.companyKey == ${companyKey} 
            AND c.officeKey == ${officeKey}  
            AND c.groupRef == "00"
            SORT c.fullName ASC LIMIT ${skip}, ${perPage} RETURN c`,
              { fullCount: true },
              { count: true }
            );
      if (docs_cursor.hasNext) {
        //console.log(docs_cursor.extra);
        //console.log(docs_cursor.hasNext);
        const docs = await docs_cursor.all();
        return docs.map(async (doc) => {
          return {
            ...(doc.projectKey = await getProjectDoc({
              projectKey: doc.projectKey,
            })),
            ...(doc.animateurKey = await getUserDoc({
              userKey: doc.animateurKey,
            })),
            ...(doc.companyKey = await getCompanyDoc({
              companyKey: doc.companyKey,
            })),
            ...(doc.officeKey = await getOfficeDoc({
              officeKey: doc.officeKey,
            })),
            ...(doc.countryKey = await getCountryDoc({ key: doc.countryKey })),
            ...(doc.cityKey = await getCityDoc({ key: doc.cityKey })),
            ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
            ...(doc.regionKey =
              doc.regionKey != null
                ? await getRegionDoc({ key: doc.regionKey })
                : null),
            ...(doc.prefectureKey =
              doc.prefectureKey != null
                ? await getPrefectureDoc({ key: doc.prefectureKey })
                : null),
            ...(doc.cantonKey =
              doc.cantonKey != null
                ? await getCantonDoc({ key: doc.cantonKey })
                : null),
            ...doc,
          };
        });
      } else {
        return [];
      }
    } else if (accessLevel == 3) {
      if (groupCode != "00") {
        const docs_cursor =
          extend == "Globale"
            ? await db.query(
                aql`FOR c IN clients_sig 
              FILTER c.projectKey == ${projectKey} 
              AND c.companyKey == ${companyKey} 
              AND c.groupRef == ${groupCode}
              SORT c.fullName ASC LIMIT ${skip}, ${perPage} RETURN c`,
                { fullCount: true },
                { count: true }
              )
            : await db.query(
                aql`FOR c IN clients_sig 
              FILTER c.projectKey == ${projectKey} 
              AND c.companyKey == ${companyKey}
              AND c.officeKey == ${officeKey} 
              AND c.groupRef == ${groupCode}
              SORT c.fullName ASC LIMIT ${skip}, ${perPage} RETURN c`,
                { fullCount: true },
                { count: true }
              );
        if (docs_cursor.hasNext) {
          //console.log(docs_cursor.extra);
          //console.log(docs_cursor.hasNext);
          const docs = await docs_cursor.all();
          return docs.map(async (doc) => {
            return {
              ...(doc.projectKey = await getProjectDoc({
                projectKey: doc.projectKey,
              })),
              ...(doc.animateurKey = await getUserDoc({
                userKey: doc.animateurKey,
              })),
              ...(doc.companyKey = await getCompanyDoc({
                companyKey: doc.companyKey,
              })),
              ...(doc.officeKey = await getOfficeDoc({
                officeKey: doc.officeKey,
              })),
              ...(doc.countryKey = await getCountryDoc({
                key: doc.countryKey,
              })),
              ...(doc.cityKey = await getCityDoc({ key: doc.cityKey })),
              ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
              ...(doc.regionKey =
                doc.regionKey != null
                  ? await getRegionDoc({ key: doc.regionKey })
                  : null),
              ...(doc.prefectureKey =
                doc.prefectureKey != null
                  ? await getPrefectureDoc({ key: doc.prefectureKey })
                  : null),
              ...(doc.cantonKey =
                doc.cantonKey != null
                  ? await getCantonDoc({ key: doc.cantonKey })
                  : null),
              ...doc,
            };
          });
        } else {
          return [];
        }
      } else {
        // individuals
        const docs_cursor =
          extend == "Globale"
            ? await db.query(
                aql`FOR c IN clients_sig 
                FILTER c.projectKey == ${projectKey} 
                AND c.companyKey == ${companyKey} 
                AND c.groupRef == "00"
                SORT c.fullName ASC LIMIT ${skip}, ${perPage} RETURN c`,
                { fullCount: true },
                { count: true }
              )
            : await db.query(
                aql`FOR c IN clients_sig 
                FILTER c.projectKey == ${projectKey} 
                AND c.companyKey == ${companyKey}
                AND c.officeKey == ${officeKey} 
                AND c.groupRef == "00"
                SORT c.fullName ASC LIMIT ${skip}, ${perPage} RETURN c`,
                { fullCount: true },
                { count: true }
              );
        if (docs_cursor.hasNext) {
          //console.log(docs_cursor.extra);
          //console.log(docs_cursor.hasNext);
          const docs = await docs_cursor.all();
          return docs.map(async (doc) => {
            return {
              ...(doc.projectKey = await getProjectDoc({
                projectKey: doc.projectKey,
              })),
              ...(doc.animateurKey = await getUserDoc({
                userKey: doc.animateurKey,
              })),
              ...(doc.companyKey = await getCompanyDoc({
                companyKey: doc.companyKey,
              })),
              ...(doc.officeKey = await getOfficeDoc({
                officeKey: doc.officeKey,
              })),
              ...(doc.countryKey = await getCountryDoc({
                key: doc.countryKey,
              })),
              ...(doc.cityKey = await getCityDoc({ key: doc.cityKey })),
              ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
              ...(doc.regionKey =
                doc.regionKey != null
                  ? await getRegionDoc({ key: doc.regionKey })
                  : null),
              ...(doc.prefectureKey =
                doc.prefectureKey != null
                  ? await getPrefectureDoc({ key: doc.prefectureKey })
                  : null),
              ...(doc.cantonKey =
                doc.cantonKey != null
                  ? await getCantonDoc({ key: doc.cantonKey })
                  : null),
              ...doc,
            };
          });
        } else {
          return [];
        }
      }
    }
  },

  clientsByGroupByProfile: async ({
    companyKey,
    projectKey,
    profile, // All, Comite, Membre
    groupRef,
  }) => {
    //console.log(`profile: ${profile}`);
    //console.log(`groupRef: ${groupRef}`);

    let docs = [];
    let _fullCount = 0;

    if (profile == "All") {
      const docs_cursor = await db.query(
        aql`FOR c IN clients_sig 
            FILTER c.projectKey == ${projectKey} 
            AND c.companyKey == ${companyKey}  
            AND c.groupRef == ${groupRef} SORT c.fullName RETURN c`,
        { fullCount: true },
        { count: true }
      );
      if (docs_cursor.hasNext) {
        docs = await docs_cursor.all();
        _fullCount = await docs_cursor.extra.stats.fullCount;
      }
    } else if (profile == "Comite") {
      const docs_cursor = await db.query(
        aql`FOR c IN clients_sig 
            FILTER c.projectKey == ${projectKey} 
            AND c.companyKey == ${companyKey}  
            AND c.groupRef == ${groupRef} 
            AND c.poste != "Membre"
            SORT c.fullName RETURN c`,
        { fullCount: true },
        { count: true }
      );
      if (docs_cursor.hasNext) {
        docs = await docs_cursor.all();
        _fullCount = await docs_cursor.extra.stats.fullCount;
      }
    } else if (profile == "Membre") {
      const docs_cursor = await db.query(
        aql`FOR c IN clients_sig 
            FILTER c.projectKey == ${projectKey} 
            AND c.companyKey == ${companyKey}  
            AND c.groupRef == ${groupRef} 
            AND c.poste == "Membre"
            SORT c.fullName RETURN c`,
        { fullCount: true },
        { count: true }
      );
      if (docs_cursor.hasNext) {
        docs = await docs_cursor.all();
        _fullCount = await docs_cursor.extra.stats.fullCount;
      }
    }

    if (docs.length > 0) {
      return docs.map(async (doc) => {
        return {
          ...(doc.projectKey = await getProjectDoc({
            projectKey: doc.projectKey,
          })),
          ...(doc.animateurKey = await getUserDoc({
            userKey: doc.animateurKey,
          })),
          ...(doc.companyKey = await getCompanyDoc({
            companyKey: doc.companyKey,
          })),
          ...(doc.officeKey = await getOfficeDoc({
            officeKey: doc.officeKey,
          })),
          ...(doc.countryKey = await getCountryDoc({ key: doc.countryKey })),
          ...(doc.cityKey = await getCityDoc({ key: doc.cityKey })),
          ...(doc.fullCount = _fullCount),
          ...doc,
        };
      });
    } else {
      return [];
    }
  },

  clientsSearch: async ({
    projectKey,
    companyKey,
    officeKey,
    searchCoverage,
    searchString,
    animateurKey,
    skip,
    perPage,
  }) => {
    const toSearch = searchString.toLowerCase();
    //console.log(`toSearch: ${toSearch}`);
    //console.log(`searchCoverage: ${searchCoverage}`);
    //console.log(`animateurKey: ${animateurKey}`);
    if (searchCoverage == "Utilisateur") {
      const docs_cursor = await db.query(
        aql`FOR c IN clients_sig 
        FILTER c.projectKey == ${projectKey} 
        AND c.companyKey == ${companyKey} 
        AND c.officeKey == ${officeKey}  
        AND LOWER(c.fullName) LIKE ${toSearch}
        OR
        c.projectKey == ${projectKey} 
        AND c.companyKey == ${companyKey} 
        AND c.officeKey == ${officeKey}  
        AND LOWER(c.codeSig) LIKE ${toSearch}
        
        SORT c.fullName ASC LIMIT ${skip}, ${perPage} RETURN c`,
        { fullCount: true },
        { count: true }
      );
      if (docs_cursor.hasNext) {
        const docs = await docs_cursor.all();
        return docs.map(async (doc) => {
          return {
            ...(doc.projectKey = await getProjectDoc({
              projectKey: doc.projectKey,
            })),
            ...(doc.animateurKey = await getUserDoc({
              userKey: doc.animateurKey,
            })),
            ...(doc.companyKey = await getCompanyDoc({
              companyKey: doc.companyKey,
            })),
            ...(doc.officeKey = await getOfficeDoc({
              officeKey: doc.officeKey,
            })),
            ...(doc.countryKey = await getCountryDoc({ key: doc.countryKey })),
            ...(doc.cityKey = await getCityDoc({ key: doc.cityKey })),
            ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
            ...(doc.regionKey =
              doc.regionKey != null
                ? await getRegionDoc({ key: doc.regionKey })
                : null),
            ...(doc.prefectureKey =
              doc.prefectureKey != null
                ? await getPrefectureDoc({ key: doc.prefectureKey })
                : null),
            ...(doc.cantonKey =
              doc.cantonKey != null
                ? await getCantonDoc({ key: doc.cantonKey })
                : null),
            ...doc,
          };
        });
      } else {
        return [];
      }
    } else if (searchCoverage == "Antenne") {
      const docs_cursor = await db.query(
        aql`FOR c IN clients_sig 
        FILTER c.projectKey == ${projectKey} 
        AND c.companyKey == ${companyKey} 
        AND c.officeKey == ${officeKey} 
        AND LOWER(c.fullName) LIKE ${toSearch}
        OR
        c.projectKey == ${projectKey} 
        AND c.companyKey == ${companyKey} 
        AND c.officeKey == ${officeKey} 
        AND LOWER(c.codeSig) LIKE ${toSearch}

        SORT c.fullName ASC LIMIT ${skip}, ${perPage} RETURN c`,
        { fullCount: true },
        { count: true }
      );
      if (docs_cursor.hasNext) {
        const docs = await docs_cursor.all();
        return docs.map(async (doc) => {
          return {
            ...(doc.projectKey = await getProjectDoc({
              projectKey: doc.projectKey,
            })),
            ...(doc.animateurKey = await getUserDoc({
              userKey: doc.animateurKey,
            })),
            ...(doc.companyKey = await getCompanyDoc({
              companyKey: doc.companyKey,
            })),
            ...(doc.officeKey = await getOfficeDoc({
              officeKey: doc.officeKey,
            })),
            ...(doc.countryKey = await getCountryDoc({ key: doc.countryKey })),
            ...(doc.cityKey = await getCityDoc({ key: doc.cityKey })),
            ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
            ...(doc.regionKey =
              doc.regionKey != null
                ? await getRegionDoc({ key: doc.regionKey })
                : null),
            ...(doc.prefectureKey =
              doc.prefectureKey != null
                ? await getPrefectureDoc({ key: doc.prefectureKey })
                : null),
            ...(doc.cantonKey =
              doc.cantonKey != null
                ? await getCantonDoc({ key: doc.cantonKey })
                : null),
            ...doc,
          };
        });
      } else {
        return [];
      }
    } else if (searchCoverage == "Globale") {
      const docs_cursor = await db.query(
        aql`FOR c IN clients_sig 
        FILTER c.projectKey == ${projectKey} 
        AND c.companyKey == ${companyKey} 
        AND LOWER(c.fullName) LIKE ${toSearch}  
        OR 
        c.projectKey == ${projectKey} 
        AND c.companyKey == ${companyKey} 
        AND LOWER(c.codeSig) LIKE ${toSearch} 
        SORT c.fullName ASC LIMIT ${skip}, ${perPage} RETURN c`,
        { fullCount: true },
        { count: true }
      );
      if (docs_cursor.hasNext) {
        const docs = await docs_cursor.all();
        return docs.map(async (doc) => {
          return {
            ...(doc.projectKey = await getProjectDoc({
              projectKey: doc.projectKey,
            })),
            ...(doc.animateurKey = await getUserDoc({
              userKey: doc.animateurKey,
            })),
            ...(doc.companyKey = await getCompanyDoc({
              companyKey: doc.companyKey,
            })),
            ...(doc.officeKey = await getOfficeDoc({
              officeKey: doc.officeKey,
            })),
            ...(doc.countryKey = await getCountryDoc({ key: doc.countryKey })),
            ...(doc.cityKey = await getCityDoc({ key: doc.cityKey })),
            ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
            ...(doc.regionKey =
              doc.regionKey != null
                ? await getRegionDoc({ key: doc.regionKey })
                : null),
            ...(doc.prefectureKey =
              doc.prefectureKey != null
                ? await getPrefectureDoc({ key: doc.prefectureKey })
                : null),
            ...(doc.cantonKey =
              doc.cantonKey != null
                ? await getCantonDoc({ key: doc.cantonKey })
                : null),
            ...doc,
          };
        });
      } else {
        return [];
      }
    }
  },

  clientsGPSMap: async ({
    companyKey,
    projectKey,
    perPage,
    skip,
    coverage,
    userKey,
  }) => {
    if (coverage == "Utilisateur") {
      const docs_cursor = await db.query(
        aql`FOR c IN clients_sig 
        FILTER c.projectKey == ${projectKey} AND c.companyKey == ${companyKey} 
        AND c.animateurKey == ${userKey} 
        AND c.gpsAltitude != 0 && c.gpsLongitude != 0
        SORT c.fullName ASC LIMIT ${skip}, ${perPage} RETURN c`,
        { fullCount: true },
        { count: true }
      );
      if (docs_cursor.hasNext) {
        const docs = await docs_cursor.all();
        return docs.map(async (doc) => {
          return {
            ...(doc.animateurKey = await getUserDoc({
              userKey: doc.animateurKey,
            })),
            ...(doc.companyKey = await getCompanyDoc({
              companyKey: doc.companyKey,
            })),
            ...(doc.officeKey = await getOfficeDoc({
              officeKey: doc.officeKey,
            })),
            ...(doc.countryKey = await getCountryDoc({ key: doc.countryKey })),
            ...(doc.cityKey = await getCityDoc({ key: doc.cityKey })),
            ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
            ...doc,
          };
        });
      } else {
        return [];
      }
    } else if (coverage == "Globale") {
      const docs_cursor = await db.query(
        aql`FOR c IN clients_sig 
      FILTER c.projectKey == ${projectKey} AND c.companyKey == ${companyKey} 
      AND c.gpsAltitude != 0 && c.gpsLongitude != 0
      SORT c.fullName ASC LIMIT ${skip}, ${perPage} RETURN c`,
        { fullCount: true },
        { count: true }
      );
      if (docs_cursor.hasNext) {
        const docs = await docs_cursor.all();
        return docs.map(async (doc) => {
          return {
            ...(doc.animateurKey = await getUserDoc({
              userKey: doc.animateurKey,
            })),
            ...(doc.companyKey = await getCompanyDoc({
              companyKey: doc.companyKey,
            })),
            ...(doc.officeKey = await getOfficeDoc({
              officeKey: doc.officeKey,
            })),
            ...(doc.countryKey = await getCountryDoc({ key: doc.countryKey })),
            ...(doc.cityKey = await getCityDoc({ key: doc.cityKey })),
            ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
            ...doc,
          };
        });
      } else {
        return [];
      }
    }
  },

  // reset client data in the db
  clientReset: async ({ userKey, clientKey, projectKey, companyKey }) => {
    const obj = {
      codeSig: data.codeSig,
      animateurKey: null,
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
      cityKey: null,
      quartier: null,
      address: null,
      addressSinceWhen: null, // depuis quand habitez-vous ce lieu ?
      addressFiliation: null, // Locataire, Proprietaire
      activities: null, // actiites regulieres
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
      gender: null,
      poste: null,
      groupName: null,
      groupRef: null,
      status: "Imported",
      signature: null,
      signatureCredit: null,
      fingerPrint: null,
      fingerPrintCredit: null,
      updatedAt: Date.now(),
      isActive: false,
      soldeEpargne: null,
      soldeDate: null,
      maritalStatus: null,
      numberOfChildren: null,
      peopleInCharge: null,
      naissanceDate: null,
      naissanceLieu: null,
      fatherFullName: null,
      motherFullName: null,
      prevSigLoans: [],
    };
    const doc_cursor = await db.query(aql`FOR c IN clients_sig 
    FILTER c.companyKey == ${companyKey} 
    AND c.projectKey == ${projectKey}
    AND c.animateurKey == ${userKey} 
    AND c._key == ${clientKey}
    UPDATE ${clientKey} WITH ${obj} 
    IN clients_sig RETURN c `);
    if (doc_cursor.hasNext) {
      return "TRUE";
    } else {
      return `Désolé, nous n\'avons pas pu réinitialiser les données du bénéficiaire`;
    }
  },

  // recuperer les details d'un client individuel du SIG
  // + la liste des credits + le solde
  importClientByCodeSig: async ({
    companyKey,
    projectKey,
    officeKey,
    codeSig,
    userKey,
  }) => {
    // select the office
    const office_cursor = await db.query(aql`FOR o IN office FILTER 
    o._key == ${officeKey} RETURN o`);
    if (office_cursor.hasNext) {
      const office = await office_cursor.next();

      const exist_cursor = await db.query(aql`FOR c IN clients_sig 
      FILTER c.codeSig == ${codeSig} RETURN c`);
      const exist = await exist_cursor.next();

      // make sure the client is either not previously imported,
      // or is already imported by the same agent
      console.log(exist_cursor.hasNext);
      if (exist_cursor.hasNext == false || exist.animateurKey === userKey) {
        // send request
        var result = await axios.post(`${serverSigUrl}/client-by-code-sig`, {
          codeSig: codeSig,
          dbIp: office.sigDBIp,
          dbName: office.sigDBName,
          dbUser: office.sigDBUser,
          dbPass: office.sigDBPass,
          dbPort: office.sigDBPort,
        });

        if (result.data.length > 0) {
          for (let index = 0; index < result.data.length; index++) {
            const data = result.data[index];

            // check if the user already exists
            const already_doc = await db.query(aql`FOR c IN clients_sig 
            FILTER c.codeSig == ${data.codeSig} RETURN c`);
            if (already_doc.hasNext) {
              const already = await already_doc.next();
              // update the existing client
              // build object
              const exObj = {
                fullName: data.fullName,
                gender: data.sexe,
                personne: data.personne, // Physique, Morale, Entreprise
                poste: data.poste,
                groupName: data.groupName,
                groupRef: data.groupRef,
                codeTiers: data.codeTiers,
                idPersonne: data.idPersonne,
                soldeEpargne: data.soldeEpargne,
                soldeDate: Date.now(),
                prevSigLoans: data.prevSigLoans,
                updatedAt: Date.now(),
              };
              // update client
              await db.query(aql`UPDATE ${already._key} 
              WITH ${exObj} IN clients_sig RETURN NEW`);
            } else {
              // new import
              const clientObj = {
                codeSig: data.codeSig,
                codeTiers: data.codeTiers,
                idPersonne: data.idPersonne,
                fullName: data.fullName,
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
                countryKey: "59952752", // 228
                cityKey: null,
                companyKey: office.companyKey,
                officeKey: officeKey,
                codeAgence: office.externalId,
                projectKey: office.projectKey,
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
                gender: data.sexe,
                personne: data.personne, // Physique, Morale
                poste: data.poste,
                groupName: data.groupName,
                groupRef: data.groupRef,
                status: "Imported",
                signature: null,
                signatureCredit: null,
                fingerPrint: null,
                fingerPrintCredit: null,
                updatedAt: Date.now(),
                isActive: true,
                soldeEpargne: data.soldeEpargne,
                soldeDate: Date.now(),
                maritalStatus: null,
                numberOfChildren: null,
                peopleInCharge: null,
                naissanceDate: null,
                naissanceLieu: null,
                fatherFullName: null,
                motherFullName: null,
                prevSigLoans: data.prevSigLoans,
              };
              // insert
              await db.query(aql`INSERT ${clientObj} 
              INTO clients_sig RETURN NEW`);
            }
          } // end for loop

          return "SUCCESS";
        } else {
          return `Aucun bénéficiaire trouvé sous le code SIG ${codeSig}`;
        }
      } else {
        throw new Error(
          `${exist.fullName} (${exist.codeSig}) est déjà dans le portefeuille d'un autre agent de crédit. Contactez le service informatique pour une éventuelle mutation`
        );
      }
    } else {
      throw new Error(`Erreur de sélection de l'agence ${officeKey}`);
    }
  },

  clientFicheDownload: async ({ clientKey, folder }) => {
    const doc_cursor = await db.query(aql`FOR df IN clients_sig
      FILTER df._key == ${clientKey} RETURN df`);

    if (doc_cursor.hasNext) {
      let doc = await doc_cursor.next();
      doc.animateurKey = await getUserDoc({
        userKey: doc.animateurKey,
      });
      doc.companyKey = await getCompanyDoc({
        companyKey: doc.companyKey,
      });
      doc.officeKey = await getOfficeDoc({
        officeKey: doc.officeKey,
      });
      doc.countryKey = await getCountryDoc({ key: doc.countryKey });
      doc.cityKey =
        doc.cityKey != null ? await getCityDoc({ key: doc.cityKey }) : null;

      const pdfx = await _clientPerfectDownload({
        pdfName: `${doc.codeSig}_fiche_client_${clientKey}.pdf`,
        pdfFolder:
          folder != null && folder != undefined ? folder : "public_docs",
        data: doc,
      });
      return pdfx;
    } else {
      return `Erreur de sélection du bénéficiaire ${clientKey}`;
    }
  },

  clientSetActiveOrInactive: async ({ clientKey, status }) => {
    const client_doc = await db.query(aql`FOR c IN clients_sig 
    FILTER c._key == ${clientKey} RETURN c`);
    if (client_doc.hasNext) {
      const obj = {
        isActive: status,
        updatedAt: Date.now(),
      };
      const doc_cursor = await db.query(aql`UPDATE ${clientKey} 
      WITH ${obj} IN clients_sig RETURN NEW`);
      if (doc_cursor.hasNext) {
        return "TRUE";
      } else {
        return "FALSE";
      }
    } else {
      throw new Error(`Erreur de sélectionner le bénéficiaire ${clientKey}`);
    }
  },

  // search for a client or group while creating a new loan file
  getClientsOrGroups: async ({
    toSearch,
    creditType,
    animateurKey,
    officeKeys,
  }) => {
    // Future<dynamic>
    const ts = `%${toSearch.toLowerCase()}%`;
    if (creditType == "Crédit individuel") {
      let labels = [];
      let keys = [];
      let refs = [];
      let oKeys = [];
      let oNames = [];
      let soldes = [];
      let soldeDates = [];
      let prevLoanCounts = [];
      let okays = [];
      let personneTypes = [];

      /*console.log(`officeKeys: ${officeKeys}`);
      console.log(`animateurKey: ${animateurKey}`);
      console.log(`creditType: ${creditType}`);
      console.log(`toSearch: ${ts}`);*/
      const docs_cursor = await db.query(aql`
      FOR c IN clients_sig 
      FILTER LOWER(c.fullName) LIKE ${ts}  
      AND c.groupRef == "00"
      OR LOWER(c.codeSig) LIKE ${ts}  
      AND c.groupRef == "00"
      SORT c.fullName ASC RETURN c`);

      if (docs_cursor.hasNext) {
        const docs = await docs_cursor.all();

        for (let index = 0; index < docs.length; index++) {
          const doc = docs[index];
          const isOkay =
            doc.idType != null &&
            doc.idNumber != null &&
            doc.animateurKey != null &&
            doc.idDateStart != null &&
            doc.cityKey != null &&
            doc.quartier != null &&
            doc.maritalStatus != null &&
            doc.numberOfChildren != null &&
            doc.peopleInCharge != null &&
            doc.naissanceDate != null &&
            doc.photo != "camera_avatar.png"
              ? true
              : false;
          labels.push(
            doc.intituleDuCompte != null &&
              doc.intituleDuCompte != undefined &&
              doc.intituleDuCompte != ""
              ? doc.intituleDuCompte
              : doc.fullName
          );
          keys.push(doc._key);
          refs.push(doc.codeSig);
          oKeys.push(doc.officeKey);
          soldes.push(doc.soldeEpargne);
          soldeDates.push(doc.soldeDate);
          prevLoanCounts.push(doc.prevSigLoans.length);
          personneTypes.push(doc.personne);
          okays.push(isOkay);
          oNames.push(await getOfficeName({ officeKey: doc.officeKey }));
        }
        return {
          labels: labels,
          keys: keys,
          refs: refs,
          officeKeys: oKeys,
          officeNames: oNames,
          soldes: soldes,
          soldeDates: soldeDates,
          prevLoanCounts: prevLoanCounts,
          okays: okays,
          personneTypes: personneTypes,
        };
      } else {
        return {
          labels: [],
          keys: [],
          refs: [],
          officeKeys: [],
          officeNames: [],
          soldes: [],
          soldeDates: [],
          prevLoanCounts: [],
          okays: [],
          personneTypes: [],
        };
      }
    } else {
      // groupe
      let labels = [];
      let keys = [];
      let refs = [];
      let oKeys = [];
      let oNames = [];
      let soldes = [];
      let soldeDates = [];
      let prevLoanCounts = [];
      let okays = [];
      let personneTypes = [];

      const docs_cursor = await db.query(aql`
      FOR c IN groupes_sig 
      FILTER LOWER(c.groupName) LIKE ${ts} 
      AND c.officeKey IN ${officeKeys}
      OR LOWER(c.groupCode) LIKE ${ts}  
      SORT c.groupName ASC RETURN c`);

      if (docs_cursor.hasNext) {
        const docs = await docs_cursor.all();
        for (let index = 0; index < docs.length; index++) {
          const doc = docs[index];
          /*const isOkay =
            doc.idType != null &&
            doc.idNumber != null &&
            doc.animateurKey != null &&
            doc.idDateStart != null &&
            doc.idDateEnd != null &&
            doc.cityKey != null &&
            doc.quartier != null &&
            doc.maritalStatus != null &&
            doc.numberOfChildren != null &&
            doc.peopleInCharge != null &&
            doc.naissanceDate != null &&
            doc.photo != "camera_avatar.png"
              ? true
              : false;*/
          labels.push(doc.groupName);
          keys.push(doc._key);
          refs.push(doc.groupCode);
          oKeys.push(doc.officeKey);
          soldes.push(doc.soldeEpargne);
          soldeDates.push(doc.soldeDate);
          prevLoanCounts.push(doc.prevSigLoans.length);
          okays.push(true);
          personneTypes.push("Morale");
          oNames.push(await getOfficeName({ officeKey: doc.officeKey }));
        }
        return {
          labels: labels,
          keys: keys,
          refs: refs,
          officeKeys: oKeys,
          officeNames: oNames,
          soldes: soldes,
          soldeDates: soldeDates,
          prevLoanCounts: prevLoanCounts,
          okays: okays,
          personneTypes: personneTypes,
        };
      } else {
        return {
          labels: [],
          keys: [],
          refs: [],
          officeKeys: [],
          officeNames: [],
          soldes: [],
          soldeDates: [],
          prevLoanCounts: [],
          okays: [],
          personneTypes: [],
        };
      }
    }
  },

  getClientsByCodeSig: async ({
    projectKey,
    companyKey,
    codeSig,
    creditIsIndividuel,
  }) => {
    const docs_cursor =
      creditIsIndividuel == true
        ? await db.query(
            aql`FOR c IN clients_sig 
              FILTER c.projectKey == ${projectKey} 
              AND c.companyKey == ${companyKey} 
              AND c.codeSig == ${codeSig} 
              SORT c.fullName ASC RETURN c`,
            { fullCount: true },
            { count: true }
          )
        : await db.query(
            aql`FOR c IN clients_sig 
              FILTER c.projectKey == ${projectKey} 
              AND c.companyKey == ${companyKey} 
              AND c.groupRef == ${codeSig}  
              SORT c.fullName ASC RETURN c`,
            { fullCount: true },
            { count: true }
          );
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return {
          ...(doc.countryKey = await getCountryDoc({ key: doc.countryKey })),
          ...(doc.cityKey = await getCityDoc({ key: doc.cityKey })),
          ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
          ...doc,
        };
      });
    } else {
      return [];
    }
  },

  clientIntegrer: async ({
    poste,
    clientKey,
    groupName,
    groupRef,
    groupKey,
  }) => {
    // select the group
    const group_cursor = await db.query(aql`FOR g IN groupes_sig 
    FILTER g._key == ${groupKey} RETURN g`);
    if (group_cursor.hasNext) {
      // select the client and make sure he is not in another group
      const client_cursor = await db.query(aql`FOR c IN clients_sig 
      FILTER c._key == ${clientKey} RETURN c`);
      if (client_cursor.hasNext) {
        const client = await client_cursor.next();
        // make sure the client is not in another group
        if (client.groupRef == "00" && client.groupName == null) {
          const obj = {
            groupRef: groupRef,
            groupName: groupName,
            poste: poste,
          };
          // update client
          const update_cursor = await db.query(aql`UPDATE ${clientKey} 
          WITH ${obj} IN clients_sig RETURN NEW`);
          if (update_cursor.hasNext) {
            return "SUCCESS";
          } else {
            throw new Error(
              `Erreur lors de l'intégration du membre au groupe ${groupName}`
            );
          }
        } else {
          throw new Error(
            `Désolé, ce membre est déja intégré à un autre groupe. Veuillez le dissocier d'abord de son groupe existant`
          );
        }
      } else {
        throw new Error(`Erreur de sélection du membre`);
      }
    } else {
      throw new Error(`Erreur de sélection du groupe`);
    }
  },

  clientDissocier: async ({ clientKey, groupCode }) => {
    // select group
    const group_cursor = await db.query(aql`FOR g IN groupes_sig 
    FILTER g.groupCode == ${groupCode} RETURN g`);
    if (group_cursor.hasNext) {
      const group = await group_cursor.next();
      if (group.isFromTheSig == false) {
        const obj = {
          groupRef: "00",
          groupName: null,
          poste: null,
        };
        const update_cursor = await db.query(aql`UPDATE ${clientKey} 
        WITH ${obj} IN clients_sig RETURN NEW`);
        if (update_cursor.hasNext) {
          return "SUCCESS";
        } else {
          throw new Error(`Erreur lors de la dissociation du membre`);
        }
      } else {
        throw new Error(
          `Impossible de dissocier le membre d'un groupe importé du SIG`
        );
      }
    } else {
      throw new Error(`Erreur lors de la sélection du groupe`);
    }
  },
};

export default clientSIGResolver;
