import { aql, db } from "../../../../../db/arangodb.js";
import { filterStampsArray } from "../../../../../helpers/date.js";
import {
  getCompanyDoc,
  getOfficeDoc,
  getProjectDoc,
  getUserDoc,
} from "../../../../../helpers/joindocs.js";
import { formationsAnimateursPercent } from "../../../../../helpers/joindocs_sms.js";

const smsMonthlyStatsResolver = {
  smsMonthlyStats: async ({
    companyKey,
    projectKey,
    officeKey,
    socialUserKey,
    coverage,
    year,
    dateFrom,
    dateTo,
  }) => {
    /*console.log(`companyKey: ${companyKey}`);
    console.log(`projectKey: ${projectKey}`);
    console.log(`officeKey: ${officeKey}`);
    console.log(`socialUserKey: ${socialUserKey}`);
    console.log(`coverage: ${coverage}`);
    console.log(`year: ${year}`);
    console.log(`dateFrom: ${dateFrom}`);
    console.log(`dateTo: ${dateTo}`);*/

    if (coverage == "Utilisateur") {
      let data = [];
      let ecoute_A = [];
      let ecoute_B = [];
      let ref_A = [];
      let ref_B = [];
      let cauz_A = [];
      let cauz_B = [];
      let cauz_C = [];
      let ev_A = [];
      let ev_B = [];
      let ev_C = [];
      let fanm_A = [];
      let fanm_B = [];
      let obs_A = [];
      let obs_B = [];

      // ECOUTES
      const ecoute_A_cursor = await db.query(
        aql`FOR e IN sms_suivis_data 
      FILTER e.companyKey == ${companyKey} AND e.projectKey == ${projectKey} 
      AND e.suiviStamp >= ${dateFrom} AND e.suiviStamp <= ${dateTo} 
      AND e.status == "Approved" 
      AND e.socialUserKey == ${socialUserKey} RETURN e`,
        { fullCount: true },
        { count: true }
      );
      const ecoute_A_data = await ecoute_A_cursor.all();
      if (ecoute_A_data.length > 0) {
        for (let index = 0; index < ecoute_A_data.length; index++) {
          ecoute_A.push(ecoute_A_data[index].suiviStamp);
        }
      }

      const ecoute_B_cursor = await db.query(
        aql`FOR e IN sms_suivis_data 
        FILTER e.companyKey == ${companyKey} AND e.projectKey == ${projectKey} 
        AND e.suiviStamp >= ${dateFrom} 
        AND e.suiviStamp <= ${dateTo}  
        AND e.socialUserKey == ${socialUserKey}
        AND e.status == "Approved" RETURN DISTINCT e`,
        { fullCount: true },
        { count: true }
      );
      const ecoute_B_data = await ecoute_B_cursor.all();
      if (ecoute_B_data.length > 0) {
        for (let index = 0; index < ecoute_B_data.length; index++) {
          ecoute_B.push(ecoute_B_data[index].suiviStamp);
        }
      }

      // REFERENCEMENT
      const ref_A_cursor = await db.query(
        aql`FOR e IN sms_referencements 
      FILTER e.companyKey == ${companyKey} AND e.projectKey == ${projectKey} 
      AND e.referStamp >= ${dateFrom} AND e.referStamp <= ${dateTo} 
      AND e.status == "Approved"   
      AND e.socialUserKey == ${socialUserKey} RETURN e`,
        { fullCount: true },
        { count: true }
      );
      const ref_A_data = await ref_A_cursor.all();
      if (ref_A_data.length > 0) {
        for (let index = 0; index < ref_A_data.length; index++) {
          ref_A.push(ref_A_data[index].referStamp);
        }
      }

      const ref_B_cursor = await db.query(
        aql`FOR e IN sms_referencements 
        FILTER e.companyKey == ${companyKey} AND e.projectKey == ${projectKey} 
        AND e.referStamp >= ${dateFrom} 
        AND e.referStamp <= ${dateTo}  
        AND e.socialUserKey == ${socialUserKey}
        AND e.status == "Approved" RETURN DISTINCT e`,
        { fullCount: true },
        { count: true }
      );
      const ref_B_data = await ref_B_cursor.all();
      if (ref_B_data.length > 0) {
        for (let index = 0; index < ref_B_data.length; index++) {
          ref_B.push(ref_B_data[index].referStamp);
        }
      }

      // FORMATION ANIMATEURS
      const formations_anim_A_cursor = await db.query(
        aql`FOR e IN sms_formations_anims 
      FILTER e.companyKey == ${companyKey} AND e.projectKey == ${projectKey} 
      AND e.trainingStamp >= ${dateFrom} AND e.trainingStamp <= ${dateTo} 
      AND e.status == "Approved"  
      AND e.socialUserKey == ${socialUserKey} RETURN e`,
        { fullCount: true },
        { count: true }
      );
      const formations_anim_A_data = await formations_anim_A_cursor.all();
      if (formations_anim_A_data.length > 0) {
        for (let index = 0; index < formations_anim_A_data.length; index++) {
          fanm_A.push(formations_anim_A_data[index].trainingStamp);
        }
      }
      fanm_B = await formationsAnimateursPercent({
        companyKey: companyKey,
        projectKey: projectKey,
        officeKey: officeKey,
        coverage: coverage,
        userKey: socialUserKey,
        year: year,
      });

      // OBSERVATIONS DES ANIMATEURS
      const obs_A_cursor = await db.query(
        aql`FOR e IN sms_formations_obs 
      FILTER e.companyKey == ${companyKey} AND e.projectKey == ${projectKey} 
      AND e.obsStamp >= ${dateFrom} AND e.obsStamp <= ${dateTo} 
      AND e.status == "Approved"  
      AND e.socialUserKey == ${socialUserKey} RETURN e`,
        { fullCount: true },
        { count: true }
      );
      const obs_A_Data = await obs_A_cursor.all();
      if (obs_A_Data.length > 0) {
        for (let index = 0; index < obs_A_Data.length; index++) {
          obs_A.push(obs_A_Data[index].obsStamp);
        }
      }

      const obs_B_cursor = await db.query(
        aql`FOR e IN sms_formations_obs 
        FILTER e.companyKey == ${companyKey} AND e.projectKey == ${projectKey} 
        AND e.obsStamp >= ${dateFrom} 
        AND e.obsStamp <= ${dateTo}  
        AND e.socialUserKey == ${socialUserKey}
        AND e.status == "Approved" RETURN DISTINCT e`,
        { fullCount: true },
        { count: true }
      );
      const obs_B_Data = await obs_B_cursor.all();
      if (obs_B_Data.length > 0) {
        for (let index = 0; index < obs_B_Data.length; index++) {
          obs_B.push(obs_B_Data[index].obsStamp);
        }
      }

      // CAUSERIES
      const cauz_A_cursor = await db.query(
        aql`FOR e IN sms_causeries 
      FILTER e.companyKey == ${companyKey} AND e.projectKey == ${projectKey} 
      AND e.eventStamp >= ${dateFrom} AND e.eventStamp <= ${dateTo} 
      AND e.status == "Approved"  
      AND e.socialUserKey == ${socialUserKey} RETURN e`,
        { fullCount: true },
        { count: true }
      );
      const cauz_A_Data = await cauz_A_cursor.all();
      if (cauz_A_Data.length > 0) {
        for (let index = 0; index < cauz_A_Data.length; index++) {
          cauz_A.push(cauz_A_Data[index].eventStamp);
        }
      }

      const cauz_B_cursor = await db.query(
        aql`FOR e IN sms_causeries 
        FILTER e.companyKey == ${companyKey} AND e.projectKey == ${projectKey} 
        AND e.eventStamp >= ${dateFrom} 
        AND e.eventStamp <= ${dateTo} AND e.status == "Approved" 
        AND e.socialUserKey == ${socialUserKey} RETURN DISTINCT e`,
        { fullCount: true },
        { count: true }
      );
      const cauz_B_Data = await cauz_B_cursor.all();
      if (cauz_B_Data.length > 0) {
        for (let index = 0; index < cauz_B_Data.length; index++) {
          cauz_B.push(cauz_B_Data[index].eventStamp);
        }
      }

      const cauz_C_cursor = await db.query(
        aql`FOR e IN sms_causeries 
        FILTER e.companyKey == ${companyKey} AND e.projectKey == ${projectKey} 
        AND e.eventStamp >= ${dateFrom} 
        AND e.eventStamp <= ${dateTo} AND e.status == "Approved" 
        AND e.socialUserKey == ${socialUserKey} RETURN DISTINCT e`,
        { fullCount: true },
        { count: true }
      );
      const cauz_C_Data = await cauz_C_cursor.all();
      if (cauz_C_Data.length > 0) {
        for (let index = 0; index < cauz_C_Data.length; index++) {
          cauz_C.push(cauz_C_Data[index].eventStamp);
        }
      }

      // EVENEMENTS

      const obj = {
        projectKey: null,
        companyKey: null,
        officeKey: null,
        socialUserKey: null,
        ecoute_A: [
          filterStampsArray({ timeStampArray: ecoute_A, monthInt: 1 }).length,
          filterStampsArray({ timeStampArray: ecoute_A, monthInt: 2 }).length,
          filterStampsArray({ timeStampArray: ecoute_A, monthInt: 3 }).length,
          filterStampsArray({ timeStampArray: ecoute_A, monthInt: 4 }).length,
          filterStampsArray({ timeStampArray: ecoute_A, monthInt: 5 }).length,
          filterStampsArray({ timeStampArray: ecoute_A, monthInt: 6 }).length,
          filterStampsArray({ timeStampArray: ecoute_A, monthInt: 7 }).length,
          filterStampsArray({ timeStampArray: ecoute_A, monthInt: 8 }).length,
          filterStampsArray({ timeStampArray: ecoute_A, monthInt: 9 }).length,
          filterStampsArray({ timeStampArray: ecoute_A, monthInt: 10 }).length,
          filterStampsArray({ timeStampArray: ecoute_A, monthInt: 11 }).length,
          filterStampsArray({ timeStampArray: ecoute_A, monthInt: 12 }).length,
        ], // total de Janvier a Decembre
        ecoute_B: [
          filterStampsArray({ timeStampArray: ecoute_B, monthInt: 1 }).length,
          filterStampsArray({ timeStampArray: ecoute_B, monthInt: 2 }).length,
          filterStampsArray({ timeStampArray: ecoute_B, monthInt: 3 }).length,
          filterStampsArray({ timeStampArray: ecoute_B, monthInt: 4 }).length,
          filterStampsArray({ timeStampArray: ecoute_B, monthInt: 5 }).length,
          filterStampsArray({ timeStampArray: ecoute_B, monthInt: 6 }).length,
          filterStampsArray({ timeStampArray: ecoute_B, monthInt: 7 }).length,
          filterStampsArray({ timeStampArray: ecoute_B, monthInt: 7 }).length,
          filterStampsArray({ timeStampArray: ecoute_B, monthInt: 8 }).length,
          filterStampsArray({ timeStampArray: ecoute_B, monthInt: 10 }).length,
          filterStampsArray({ timeStampArray: ecoute_B, monthInt: 11 }).length,
          filterStampsArray({ timeStampArray: ecoute_B, monthInt: 12 }).length,
        ], // beneficiaires uniques de Janvier a Decembre
        referencement_A: [
          filterStampsArray({ timeStampArray: ref_A, monthInt: 1 }).length,
          filterStampsArray({ timeStampArray: ref_A, monthInt: 2 }).length,
          filterStampsArray({ timeStampArray: ref_A, monthInt: 3 }).length,
          filterStampsArray({ timeStampArray: ref_A, monthInt: 4 }).length,
          filterStampsArray({ timeStampArray: ref_A, monthInt: 5 }).length,
          filterStampsArray({ timeStampArray: ref_A, monthInt: 6 }).length,
          filterStampsArray({ timeStampArray: ref_A, monthInt: 7 }).length,
          filterStampsArray({ timeStampArray: ref_A, monthInt: 8 }).length,
          filterStampsArray({ timeStampArray: ref_A, monthInt: 9 }).length,
          filterStampsArray({ timeStampArray: ref_A, monthInt: 10 }).length,
          filterStampsArray({ timeStampArray: ref_A, monthInt: 11 }).length,
          filterStampsArray({ timeStampArray: ref_A, monthInt: 12 }).length,
        ],
        referencement_B: [
          filterStampsArray({ timeStampArray: ref_B, monthInt: 1 }).length,
          filterStampsArray({ timeStampArray: ref_B, monthInt: 2 }).length,
          filterStampsArray({ timeStampArray: ref_B, monthInt: 3 }).length,
          filterStampsArray({ timeStampArray: ref_B, monthInt: 4 }).length,
          filterStampsArray({ timeStampArray: ref_B, monthInt: 5 }).length,
          filterStampsArray({ timeStampArray: ref_B, monthInt: 6 }).length,
          filterStampsArray({ timeStampArray: ref_B, monthInt: 7 }).length,
          filterStampsArray({ timeStampArray: ref_B, monthInt: 8 }).length,
          filterStampsArray({ timeStampArray: ref_B, monthInt: 9 }).length,
          filterStampsArray({ timeStampArray: ref_B, monthInt: 10 }).length,
          filterStampsArray({ timeStampArray: ref_B, monthInt: 11 }).length,
          filterStampsArray({ timeStampArray: ref_B, monthInt: 12 }).length,
        ],
        causerie_A: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        causerie_B: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        causerie_C: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        evenement_A: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        evenement_B: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        evenement_C: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        formations_anim_A: [
          filterStampsArray({ timeStampArray: fanm_A, monthInt: 1 }).length,
          filterStampsArray({ timeStampArray: fanm_A, monthInt: 2 }).length,
          filterStampsArray({ timeStampArray: fanm_A, monthInt: 3 }).length,
          filterStampsArray({ timeStampArray: fanm_A, monthInt: 4 }).length,
          filterStampsArray({ timeStampArray: fanm_A, monthInt: 5 }).length,
          filterStampsArray({ timeStampArray: fanm_A, monthInt: 6 }).length,
          filterStampsArray({ timeStampArray: fanm_A, monthInt: 7 }).length,
          filterStampsArray({ timeStampArray: fanm_A, monthInt: 8 }).length,
          filterStampsArray({ timeStampArray: fanm_A, monthInt: 9 }).length,
          filterStampsArray({ timeStampArray: fanm_A, monthInt: 10 }).length,
          filterStampsArray({ timeStampArray: fanm_A, monthInt: 11 }).length,
          filterStampsArray({ timeStampArray: fanm_A, monthInt: 12 }).length,
        ],
        formations_anim_B: [
          fanm_B[0],
          fanm_B[1],
          fanm_B[2],
          fanm_B[3],
          fanm_B[4],
          fanm_B[5],
          fanm_B[6],
          fanm_B[7],
          fanm_B[8],
          fanm_B[9],
          fanm_B[10],
          fanm_B[11],
        ],
        observations_A: [
          filterStampsArray({ timeStampArray: obs_A, monthInt: 1 }).length,
          filterStampsArray({ timeStampArray: obs_A, monthInt: 2 }).length,
          filterStampsArray({ timeStampArray: obs_A, monthInt: 3 }).length,
          filterStampsArray({ timeStampArray: obs_A, monthInt: 4 }).length,
          filterStampsArray({ timeStampArray: obs_A, monthInt: 5 }).length,
          filterStampsArray({ timeStampArray: obs_A, monthInt: 6 }).length,
          filterStampsArray({ timeStampArray: obs_A, monthInt: 7 }).length,
          filterStampsArray({ timeStampArray: obs_A, monthInt: 8 }).length,
          filterStampsArray({ timeStampArray: obs_A, monthInt: 9 }).length,
          filterStampsArray({ timeStampArray: obs_A, monthInt: 10 }).length,
          filterStampsArray({ timeStampArray: obs_A, monthInt: 11 }).length,
          filterStampsArray({ timeStampArray: obs_A, monthInt: 12 }).length,
        ],
        observations_B: [
          filterStampsArray({ timeStampArray: obs_B, monthInt: 1 }).length,
          filterStampsArray({ timeStampArray: obs_B, monthInt: 2 }).length,
          filterStampsArray({ timeStampArray: obs_B, monthInt: 3 }).length,
          filterStampsArray({ timeStampArray: obs_B, monthInt: 4 }).length,
          filterStampsArray({ timeStampArray: obs_B, monthInt: 5 }).length,
          filterStampsArray({ timeStampArray: obs_B, monthInt: 6 }).length,
          filterStampsArray({ timeStampArray: obs_B, monthInt: 7 }).length,
          filterStampsArray({ timeStampArray: obs_B, monthInt: 8 }).length,
          filterStampsArray({ timeStampArray: obs_B, monthInt: 9 }).length,
          filterStampsArray({ timeStampArray: obs_B, monthInt: 10 }).length,
          filterStampsArray({ timeStampArray: obs_B, monthInt: 11 }).length,
          filterStampsArray({ timeStampArray: obs_B, monthInt: 12 }).length,
        ],
      };
      data.push(obj);
      return data.map(async (doc) => {
        return {
          ...(doc.socialUserKey = await getUserDoc({ userKey: socialUserKey })),
          ...(doc.companyKey = await getCompanyDoc({ companyKey: companyKey })),
          ...(doc.officeKey = await getOfficeDoc({ officeKey: officeKey })),
          ...(doc.projectKey = await getProjectDoc({ projectKey: projectKey })),
          ...doc,
        };
      });
    } else if (coverage == "Antenne") {
      let data = [];
      let ecoute_A = [];
      let ecoute_B = [];
      let ref_A = [];
      let ref_B = [];
      let cauz_A = [];
      let cauz_B = [];
      let cauz_C = [];
      let ev_A = [];
      let ev_B = [];
      let ev_C = [];
      let fanm_A = [];
      let fanm_B = [];
      let obs_A = [];
      let obs_B = [];

      // ECOUTES
      const ecoute_A_cursor = await db.query(
        aql`FOR e IN sms_suivis_data 
      FILTER e.companyKey == ${companyKey} AND e.projectKey == ${projectKey} 
      AND e.suiviStamp >= ${dateFrom} AND e.suiviStamp <= ${dateTo} 
      AND e.status == "Approved" AND e.officeKey == ${officeKey} RETURN e`,
        { fullCount: true },
        { count: true }
      );
      const ecoute_A_data = await ecoute_A_cursor.all();
      if (ecoute_A_data.length > 0) {
        for (let index = 0; index < ecoute_A_data.length; index++) {
          ecoute_A.push(ecoute_A_data[index].suiviStamp);
        }
      }

      const ecoute_B_cursor = await db.query(
        aql`FOR e IN sms_suivis_data 
        FILTER e.companyKey == ${companyKey} AND e.projectKey == ${projectKey} 
        AND e.suiviStamp >= ${dateFrom} 
        AND e.suiviStamp <= ${dateTo} AND e.officeKey == ${officeKey}
        AND e.status == "Approved" RETURN DISTINCT e`,
        { fullCount: true },
        { count: true }
      );
      const ecoute_B_data = await ecoute_B_cursor.all();
      if (ecoute_B_data.length > 0) {
        for (let index = 0; index < ecoute_B_data.length; index++) {
          ecoute_B.push(ecoute_B_data[index].suiviStamp);
        }
      }

      // REFERENCEMENT
      const ref_A_cursor = await db.query(
        aql`FOR e IN sms_referencements 
      FILTER e.companyKey == ${companyKey} AND e.projectKey == ${projectKey} 
      AND e.referStamp >= ${dateFrom} AND e.referStamp <= ${dateTo} 
      AND e.status == "Approved" AND e.officeKey == ${officeKey} RETURN e`,
        { fullCount: true },
        { count: true }
      );
      const ref_A_data = await ref_A_cursor.all();
      if (ref_A_data.length > 0) {
        for (let index = 0; index < ref_A_data.length; index++) {
          ref_A.push(ref_A_data[index].referStamp);
        }
      }

      const ref_B_cursor = await db.query(
        aql`FOR e IN sms_referencements 
        FILTER e.companyKey == ${companyKey} AND e.projectKey == ${projectKey} 
        AND e.referStamp >= ${dateFrom} 
        AND e.referStamp <= ${dateTo} AND e.officeKey == ${officeKey}
        AND e.status == "Approved" RETURN DISTINCT e`,
        { fullCount: true },
        { count: true }
      );
      const ref_B_data = await ref_B_cursor.all();
      if (ref_B_data.length > 0) {
        for (let index = 0; index < ref_B_data.length; index++) {
          ref_B.push(ref_B_data[index].referStamp);
        }
      }

      // FORMATION ANIMATEURS
      const formations_anim_A_cursor = await db.query(
        aql`FOR e IN sms_formations_anims 
      FILTER e.companyKey == ${companyKey} AND e.projectKey == ${projectKey} 
      AND e.trainingStamp >= ${dateFrom} AND e.trainingStamp <= ${dateTo} 
      AND e.status == "Approved" AND e.officeKey == ${officeKey} RETURN e`,
        { fullCount: true },
        { count: true }
      );
      const formations_anim_A_data = await formations_anim_A_cursor.all();
      if (formations_anim_A_data.length > 0) {
        for (let index = 0; index < formations_anim_A_data.length; index++) {
          fanm_A.push(formations_anim_A_data[index].trainingStamp);
        }
      }
      fanm_B = await formationsAnimateursPercent({
        companyKey: companyKey,
        projectKey: projectKey,
        officeKey: officeKey,
        coverage: coverage,
        userKey: socialUserKey,
        year: year,
      });

      // OBSERVATIONS DES ANIMATEURS
      const obs_A_cursor = await db.query(
        aql`FOR e IN sms_formations_obs 
      FILTER e.companyKey == ${companyKey} AND e.projectKey == ${projectKey} 
      AND e.obsStamp >= ${dateFrom} AND e.obsStamp <= ${dateTo} 
      AND e.status == "Approved" AND e.officeKey == ${officeKey} RETURN e`,
        { fullCount: true },
        { count: true }
      );
      const obs_A_Data = await obs_A_cursor.all();
      if (obs_A_Data.length > 0) {
        for (let index = 0; index < obs_A_Data.length; index++) {
          obs_A.push(obs_A_Data[index].obsStamp);
        }
      }

      const obs_B_cursor = await db.query(
        aql`FOR e IN sms_formations_obs 
        FILTER e.companyKey == ${companyKey} AND e.projectKey == ${projectKey} 
        AND e.obsStamp >= ${dateFrom} 
        AND e.obsStamp <= ${dateTo} AND e.officeKey == ${officeKey}
        AND e.status == "Approved" RETURN DISTINCT e`,
        { fullCount: true },
        { count: true }
      );
      const obs_B_Data = await obs_B_cursor.all();
      if (obs_B_Data.length > 0) {
        for (let index = 0; index < obs_B_Data.length; index++) {
          obs_B.push(obs_B_Data[index].obsStamp);
        }
      }

      // CAUSERIES
      const cauz_A_cursor = await db.query(
        aql`FOR e IN sms_causeries 
      FILTER e.companyKey == ${companyKey} AND e.projectKey == ${projectKey} 
      AND e.eventStamp >= ${dateFrom} AND e.eventStamp <= ${dateTo} 
      AND e.status == "Approved" AND e.officeKey == ${officeKey} RETURN e`,
        { fullCount: true },
        { count: true }
      );
      const cauz_A_Data = await cauz_A_cursor.all();
      if (cauz_A_Data.length > 0) {
        for (let index = 0; index < cauz_A_Data.length; index++) {
          cauz_A.push(cauz_A_Data[index].eventStamp);
        }
      }

      const cauz_B_cursor = await db.query(
        aql`FOR e IN sms_causeries 
        FILTER e.companyKey == ${companyKey} AND e.projectKey == ${projectKey} 
        AND e.eventStamp >= ${dateFrom} 
        AND e.eventStamp <= ${dateTo} AND e.officeKey == ${officeKey}
        AND e.status == "Approved" RETURN DISTINCT e`,
        { fullCount: true },
        { count: true }
      );
      const cauz_B_Data = await cauz_B_cursor.all();
      if (cauz_B_Data.length > 0) {
        for (let index = 0; index < cauz_B_Data.length; index++) {
          cauz_B.push(cauz_B_Data[index].eventStamp);
        }
      }

      const cauz_C_cursor = await db.query(
        aql`FOR e IN sms_causeries 
        FILTER e.companyKey == ${companyKey} AND e.projectKey == ${projectKey} 
        AND e.eventStamp >= ${dateFrom} 
        AND e.eventStamp <= ${dateTo} AND e.officeKey == ${officeKey}
        AND e.status == "Approved" RETURN DISTINCT e`,
        { fullCount: true },
        { count: true }
      );
      const cauz_C_Data = await cauz_C_cursor.all();
      if (cauz_C_Data.length > 0) {
        for (let index = 0; index < cauz_C_Data.length; index++) {
          cauz_C.push(cauz_C_Data[index].eventStamp);
        }
      }

      // EVENEMENTS

      const obj = {
        projectKey: null,
        companyKey: null,
        officeKey: null,
        socialUserKey: null,
        ecoute_A: [
          filterStampsArray({ timeStampArray: ecoute_A, monthInt: 1 }).length,
          filterStampsArray({ timeStampArray: ecoute_A, monthInt: 2 }).length,
          filterStampsArray({ timeStampArray: ecoute_A, monthInt: 3 }).length,
          filterStampsArray({ timeStampArray: ecoute_A, monthInt: 4 }).length,
          filterStampsArray({ timeStampArray: ecoute_A, monthInt: 5 }).length,
          filterStampsArray({ timeStampArray: ecoute_A, monthInt: 6 }).length,
          filterStampsArray({ timeStampArray: ecoute_A, monthInt: 7 }).length,
          filterStampsArray({ timeStampArray: ecoute_A, monthInt: 8 }).length,
          filterStampsArray({ timeStampArray: ecoute_A, monthInt: 9 }).length,
          filterStampsArray({ timeStampArray: ecoute_A, monthInt: 10 }).length,
          filterStampsArray({ timeStampArray: ecoute_A, monthInt: 11 }).length,
          filterStampsArray({ timeStampArray: ecoute_A, monthInt: 12 }).length,
        ], // total de Janvier a Decembre
        ecoute_B: [
          filterStampsArray({ timeStampArray: ecoute_B, monthInt: 1 }).length,
          filterStampsArray({ timeStampArray: ecoute_B, monthInt: 2 }).length,
          filterStampsArray({ timeStampArray: ecoute_B, monthInt: 3 }).length,
          filterStampsArray({ timeStampArray: ecoute_B, monthInt: 4 }).length,
          filterStampsArray({ timeStampArray: ecoute_B, monthInt: 5 }).length,
          filterStampsArray({ timeStampArray: ecoute_B, monthInt: 6 }).length,
          filterStampsArray({ timeStampArray: ecoute_B, monthInt: 7 }).length,
          filterStampsArray({ timeStampArray: ecoute_B, monthInt: 7 }).length,
          filterStampsArray({ timeStampArray: ecoute_B, monthInt: 8 }).length,
          filterStampsArray({ timeStampArray: ecoute_B, monthInt: 10 }).length,
          filterStampsArray({ timeStampArray: ecoute_B, monthInt: 11 }).length,
          filterStampsArray({ timeStampArray: ecoute_B, monthInt: 12 }).length,
        ], // beneficiaires uniques de Janvier a Decembre
        referencement_A: [
          filterStampsArray({ timeStampArray: ref_A, monthInt: 1 }).length,
          filterStampsArray({ timeStampArray: ref_A, monthInt: 2 }).length,
          filterStampsArray({ timeStampArray: ref_A, monthInt: 3 }).length,
          filterStampsArray({ timeStampArray: ref_A, monthInt: 4 }).length,
          filterStampsArray({ timeStampArray: ref_A, monthInt: 5 }).length,
          filterStampsArray({ timeStampArray: ref_A, monthInt: 6 }).length,
          filterStampsArray({ timeStampArray: ref_A, monthInt: 7 }).length,
          filterStampsArray({ timeStampArray: ref_A, monthInt: 8 }).length,
          filterStampsArray({ timeStampArray: ref_A, monthInt: 9 }).length,
          filterStampsArray({ timeStampArray: ref_A, monthInt: 10 }).length,
          filterStampsArray({ timeStampArray: ref_A, monthInt: 11 }).length,
          filterStampsArray({ timeStampArray: ref_A, monthInt: 12 }).length,
        ],
        referencement_B: [
          filterStampsArray({ timeStampArray: ref_B, monthInt: 1 }).length,
          filterStampsArray({ timeStampArray: ref_B, monthInt: 2 }).length,
          filterStampsArray({ timeStampArray: ref_B, monthInt: 3 }).length,
          filterStampsArray({ timeStampArray: ref_B, monthInt: 4 }).length,
          filterStampsArray({ timeStampArray: ref_B, monthInt: 5 }).length,
          filterStampsArray({ timeStampArray: ref_B, monthInt: 6 }).length,
          filterStampsArray({ timeStampArray: ref_B, monthInt: 7 }).length,
          filterStampsArray({ timeStampArray: ref_B, monthInt: 8 }).length,
          filterStampsArray({ timeStampArray: ref_B, monthInt: 9 }).length,
          filterStampsArray({ timeStampArray: ref_B, monthInt: 10 }).length,
          filterStampsArray({ timeStampArray: ref_B, monthInt: 11 }).length,
          filterStampsArray({ timeStampArray: ref_B, monthInt: 12 }).length,
        ],
        causerie_A: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        causerie_B: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        causerie_C: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        evenement_A: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        evenement_B: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        evenement_C: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        formations_anim_A: [
          filterStampsArray({ timeStampArray: fanm_A, monthInt: 1 }).length,
          filterStampsArray({ timeStampArray: fanm_A, monthInt: 2 }).length,
          filterStampsArray({ timeStampArray: fanm_A, monthInt: 3 }).length,
          filterStampsArray({ timeStampArray: fanm_A, monthInt: 4 }).length,
          filterStampsArray({ timeStampArray: fanm_A, monthInt: 5 }).length,
          filterStampsArray({ timeStampArray: fanm_A, monthInt: 6 }).length,
          filterStampsArray({ timeStampArray: fanm_A, monthInt: 7 }).length,
          filterStampsArray({ timeStampArray: fanm_A, monthInt: 8 }).length,
          filterStampsArray({ timeStampArray: fanm_A, monthInt: 9 }).length,
          filterStampsArray({ timeStampArray: fanm_A, monthInt: 10 }).length,
          filterStampsArray({ timeStampArray: fanm_A, monthInt: 11 }).length,
          filterStampsArray({ timeStampArray: fanm_A, monthInt: 12 }).length,
        ],
        formations_anim_B: [
          fanm_B[0],
          fanm_B[1],
          fanm_B[2],
          fanm_B[3],
          fanm_B[4],
          fanm_B[5],
          fanm_B[6],
          fanm_B[7],
          fanm_B[8],
          fanm_B[9],
          fanm_B[10],
          fanm_B[11],
        ],
        observations_A: [
          filterStampsArray({ timeStampArray: obs_A, monthInt: 1 }).length,
          filterStampsArray({ timeStampArray: obs_A, monthInt: 2 }).length,
          filterStampsArray({ timeStampArray: obs_A, monthInt: 3 }).length,
          filterStampsArray({ timeStampArray: obs_A, monthInt: 4 }).length,
          filterStampsArray({ timeStampArray: obs_A, monthInt: 5 }).length,
          filterStampsArray({ timeStampArray: obs_A, monthInt: 6 }).length,
          filterStampsArray({ timeStampArray: obs_A, monthInt: 7 }).length,
          filterStampsArray({ timeStampArray: obs_A, monthInt: 8 }).length,
          filterStampsArray({ timeStampArray: obs_A, monthInt: 9 }).length,
          filterStampsArray({ timeStampArray: obs_A, monthInt: 10 }).length,
          filterStampsArray({ timeStampArray: obs_A, monthInt: 11 }).length,
          filterStampsArray({ timeStampArray: obs_A, monthInt: 12 }).length,
        ],
        observations_B: [
          filterStampsArray({ timeStampArray: obs_B, monthInt: 1 }).length,
          filterStampsArray({ timeStampArray: obs_B, monthInt: 2 }).length,
          filterStampsArray({ timeStampArray: obs_B, monthInt: 3 }).length,
          filterStampsArray({ timeStampArray: obs_B, monthInt: 4 }).length,
          filterStampsArray({ timeStampArray: obs_B, monthInt: 5 }).length,
          filterStampsArray({ timeStampArray: obs_B, monthInt: 6 }).length,
          filterStampsArray({ timeStampArray: obs_B, monthInt: 7 }).length,
          filterStampsArray({ timeStampArray: obs_B, monthInt: 8 }).length,
          filterStampsArray({ timeStampArray: obs_B, monthInt: 9 }).length,
          filterStampsArray({ timeStampArray: obs_B, monthInt: 10 }).length,
          filterStampsArray({ timeStampArray: obs_B, monthInt: 11 }).length,
          filterStampsArray({ timeStampArray: obs_B, monthInt: 12 }).length,
        ],
      };
      data.push(obj);
      return data.map(async (doc) => {
        return {
          ...(doc.socialUserKey = await getUserDoc({ userKey: socialUserKey })),
          ...(doc.companyKey = await getCompanyDoc({ companyKey: companyKey })),
          ...(doc.officeKey = await getOfficeDoc({ officeKey: officeKey })),
          ...(doc.projectKey = await getProjectDoc({ projectKey: projectKey })),
          ...doc,
        };
      });
    } else if (coverage == "Globale") {
      let data = [];
      let ecoute_A = [];
      let ecoute_B = [];
      let ref_A = [];
      let ref_B = [];
      let cauz_A = [];
      let cauz_B = [];
      let cauz_C = [];
      let ev_A = [];
      let ev_B = [];
      let ev_C = [];
      let fanm_A = [];
      let fanm_B = [];
      let obs_A = [];
      let obs_B = [];

      // ECOUTES
      const ecoute_A_cursor = await db.query(
        aql`FOR e IN sms_suivis_data 
      FILTER e.companyKey == ${companyKey} AND e.projectKey == ${projectKey} 
      AND e.suiviStamp >= ${dateFrom} AND e.suiviStamp <= ${dateTo} 
      AND e.status == "Approved" RETURN e`,
        { fullCount: true },
        { count: true }
      );
      const ecoute_A_data = await ecoute_A_cursor.all();
      if (ecoute_A_data.length > 0) {
        for (let index = 0; index < ecoute_A_data.length; index++) {
          ecoute_A.push(ecoute_A_data[index].suiviStamp);
        }
      }

      const ecoute_B_cursor = await db.query(
        aql`FOR e IN sms_suivis_data 
        FILTER e.companyKey == ${companyKey} AND e.projectKey == ${projectKey} 
        AND e.suiviStamp >= ${dateFrom} 
        AND e.suiviStamp <= ${dateTo} 
        AND e.status == "Approved" RETURN DISTINCT e`,
        { fullCount: true },
        { count: true }
      );
      const ecoute_B_data = await ecoute_B_cursor.all();
      if (ecoute_B_data.length > 0) {
        for (let index = 0; index < ecoute_B_data.length; index++) {
          ecoute_B.push(ecoute_B_data[index].suiviStamp);
        }
      }

      // REFERENCEMENT
      const ref_A_cursor = await db.query(
        aql`FOR e IN sms_referencements 
      FILTER e.companyKey == ${companyKey} AND e.projectKey == ${projectKey} 
      AND e.referStamp >= ${dateFrom} AND e.referStamp <= ${dateTo} 
      AND e.status == "Approved" RETURN e`,
        { fullCount: true },
        { count: true }
      );
      const ref_A_data = await ref_A_cursor.all();
      if (ref_A_data.length > 0) {
        for (let index = 0; index < ref_A_data.length; index++) {
          ref_A.push(ref_A_data[index].referStamp);
        }
      }

      const ref_B_cursor = await db.query(
        aql`FOR e IN sms_referencements 
        FILTER e.companyKey == ${companyKey} AND e.projectKey == ${projectKey} 
        AND e.referStamp >= ${dateFrom} 
        AND e.referStamp <= ${dateTo} 
        AND e.status == "Approved" RETURN DISTINCT e`,
        { fullCount: true },
        { count: true }
      );
      const ref_B_data = await ref_B_cursor.all();
      if (ref_B_data.length > 0) {
        for (let index = 0; index < ref_B_data.length; index++) {
          ref_B.push(ref_B_data[index].referStamp);
        }
      }

      // FORMATION ANIMATEURS
      const formations_anim_A_cursor = await db.query(
        aql`FOR e IN sms_formations_anims 
      FILTER e.companyKey == ${companyKey} AND e.projectKey == ${projectKey} 
      AND e.trainingStamp >= ${dateFrom} AND e.trainingStamp <= ${dateTo} 
      AND e.status == "Approved" RETURN e`,
        { fullCount: true },
        { count: true }
      );
      const formations_anim_A_data = await formations_anim_A_cursor.all();
      if (formations_anim_A_data.length > 0) {
        for (let index = 0; index < formations_anim_A_data.length; index++) {
          fanm_A.push(formations_anim_A_data[index].trainingStamp);
        }
      }
      fanm_B = await formationsAnimateursPercent({
        companyKey: companyKey,
        projectKey: projectKey,
        officeKey: officeKey,
        coverage: coverage,
        userKey: socialUserKey,
        year: year,
      });

      // OBSERVATIONS DES ANIMATEURS
      const obs_A_cursor = await db.query(
        aql`FOR e IN sms_formations_obs 
      FILTER e.companyKey == ${companyKey} AND e.projectKey == ${projectKey} 
      AND e.obsStamp >= ${dateFrom} AND e.obsStamp <= ${dateTo} 
      AND e.status == "Approved" RETURN e`,
        { fullCount: true },
        { count: true }
      );
      const obs_A_Data = await obs_A_cursor.all();
      if (obs_A_Data.length > 0) {
        for (let index = 0; index < obs_A_Data.length; index++) {
          obs_A.push(obs_A_Data[index].obsStamp);
        }
      }

      const obs_B_cursor = await db.query(
        aql`FOR e IN sms_formations_obs 
        FILTER e.companyKey == ${companyKey} AND e.projectKey == ${projectKey} 
        AND e.obsStamp >= ${dateFrom} 
        AND e.obsStamp <= ${dateTo} 
        AND e.status == "Approved" RETURN DISTINCT e`,
        { fullCount: true },
        { count: true }
      );
      const obs_B_Data = await obs_B_cursor.all();
      if (obs_B_Data.length > 0) {
        for (let index = 0; index < obs_B_Data.length; index++) {
          obs_B.push(obs_B_Data[index].obsStamp);
        }
      }

      // CAUSERIES
      const cauz_A_cursor = await db.query(
        aql`FOR e IN sms_causeries 
      FILTER e.companyKey == ${companyKey} AND e.projectKey == ${projectKey} 
      AND e.eventStamp >= ${dateFrom} AND e.eventStamp <= ${dateTo} 
      AND e.status == "Approved" RETURN e`,
        { fullCount: true },
        { count: true }
      );
      const cauz_A_Data = await cauz_A_cursor.all();
      if (cauz_A_Data.length > 0) {
        for (let index = 0; index < cauz_A_Data.length; index++) {
          cauz_A.push(cauz_A_Data[index].eventStamp);
        }
      }

      const cauz_B_cursor = await db.query(
        aql`FOR e IN sms_causeries 
        FILTER e.companyKey == ${companyKey} AND e.projectKey == ${projectKey} 
        AND e.eventStamp >= ${dateFrom} 
        AND e.eventStamp <= ${dateTo} 
        AND e.status == "Approved" RETURN DISTINCT e`,
        { fullCount: true },
        { count: true }
      );
      const cauz_B_Data = await cauz_B_cursor.all();
      if (cauz_B_Data.length > 0) {
        for (let index = 0; index < cauz_B_Data.length; index++) {
          cauz_B.push(cauz_B_Data[index].eventStamp);
        }
      }

      const cauz_C_cursor = await db.query(
        aql`FOR e IN sms_causeries 
        FILTER e.companyKey == ${companyKey} AND e.projectKey == ${projectKey} 
        AND e.eventStamp >= ${dateFrom} 
        AND e.eventStamp <= ${dateTo} 
        AND e.status == "Approved" RETURN DISTINCT e`,
        { fullCount: true },
        { count: true }
      );
      const cauz_C_Data = await cauz_C_cursor.all();
      if (cauz_C_Data.length > 0) {
        for (let index = 0; index < cauz_C_Data.length; index++) {
          cauz_C.push(cauz_C_Data[index].eventStamp);
        }
      }

      // EVENEMENTS

      const obj = {
        projectKey: null,
        companyKey: null,
        officeKey: null,
        socialUserKey: null,
        ecoute_A: [
          filterStampsArray({ timeStampArray: ecoute_A, monthInt: 1 }).length,
          filterStampsArray({ timeStampArray: ecoute_A, monthInt: 2 }).length,
          filterStampsArray({ timeStampArray: ecoute_A, monthInt: 3 }).length,
          filterStampsArray({ timeStampArray: ecoute_A, monthInt: 4 }).length,
          filterStampsArray({ timeStampArray: ecoute_A, monthInt: 5 }).length,
          filterStampsArray({ timeStampArray: ecoute_A, monthInt: 6 }).length,
          filterStampsArray({ timeStampArray: ecoute_A, monthInt: 7 }).length,
          filterStampsArray({ timeStampArray: ecoute_A, monthInt: 8 }).length,
          filterStampsArray({ timeStampArray: ecoute_A, monthInt: 9 }).length,
          filterStampsArray({ timeStampArray: ecoute_A, monthInt: 10 }).length,
          filterStampsArray({ timeStampArray: ecoute_A, monthInt: 11 }).length,
          filterStampsArray({ timeStampArray: ecoute_A, monthInt: 12 }).length,
        ], // total de Janvier a Decembre
        ecoute_B: [
          filterStampsArray({ timeStampArray: ecoute_B, monthInt: 1 }).length,
          filterStampsArray({ timeStampArray: ecoute_B, monthInt: 2 }).length,
          filterStampsArray({ timeStampArray: ecoute_B, monthInt: 3 }).length,
          filterStampsArray({ timeStampArray: ecoute_B, monthInt: 4 }).length,
          filterStampsArray({ timeStampArray: ecoute_B, monthInt: 5 }).length,
          filterStampsArray({ timeStampArray: ecoute_B, monthInt: 6 }).length,
          filterStampsArray({ timeStampArray: ecoute_B, monthInt: 7 }).length,
          filterStampsArray({ timeStampArray: ecoute_B, monthInt: 7 }).length,
          filterStampsArray({ timeStampArray: ecoute_B, monthInt: 8 }).length,
          filterStampsArray({ timeStampArray: ecoute_B, monthInt: 10 }).length,
          filterStampsArray({ timeStampArray: ecoute_B, monthInt: 11 }).length,
          filterStampsArray({ timeStampArray: ecoute_B, monthInt: 12 }).length,
        ], // beneficiaires uniques de Janvier a Decembre
        referencement_A: [
          filterStampsArray({ timeStampArray: ref_A, monthInt: 1 }).length,
          filterStampsArray({ timeStampArray: ref_A, monthInt: 2 }).length,
          filterStampsArray({ timeStampArray: ref_A, monthInt: 3 }).length,
          filterStampsArray({ timeStampArray: ref_A, monthInt: 4 }).length,
          filterStampsArray({ timeStampArray: ref_A, monthInt: 5 }).length,
          filterStampsArray({ timeStampArray: ref_A, monthInt: 6 }).length,
          filterStampsArray({ timeStampArray: ref_A, monthInt: 7 }).length,
          filterStampsArray({ timeStampArray: ref_A, monthInt: 8 }).length,
          filterStampsArray({ timeStampArray: ref_A, monthInt: 9 }).length,
          filterStampsArray({ timeStampArray: ref_A, monthInt: 10 }).length,
          filterStampsArray({ timeStampArray: ref_A, monthInt: 11 }).length,
          filterStampsArray({ timeStampArray: ref_A, monthInt: 12 }).length,
        ],
        referencement_B: [
          filterStampsArray({ timeStampArray: ref_B, monthInt: 1 }).length,
          filterStampsArray({ timeStampArray: ref_B, monthInt: 2 }).length,
          filterStampsArray({ timeStampArray: ref_B, monthInt: 3 }).length,
          filterStampsArray({ timeStampArray: ref_B, monthInt: 4 }).length,
          filterStampsArray({ timeStampArray: ref_B, monthInt: 5 }).length,
          filterStampsArray({ timeStampArray: ref_B, monthInt: 6 }).length,
          filterStampsArray({ timeStampArray: ref_B, monthInt: 7 }).length,
          filterStampsArray({ timeStampArray: ref_B, monthInt: 8 }).length,
          filterStampsArray({ timeStampArray: ref_B, monthInt: 9 }).length,
          filterStampsArray({ timeStampArray: ref_B, monthInt: 10 }).length,
          filterStampsArray({ timeStampArray: ref_B, monthInt: 11 }).length,
          filterStampsArray({ timeStampArray: ref_B, monthInt: 12 }).length,
        ],
        causerie_A: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        causerie_B: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        causerie_C: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        evenement_A: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        evenement_B: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        evenement_C: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        formations_anim_A: [
          filterStampsArray({ timeStampArray: fanm_A, monthInt: 1 }).length,
          filterStampsArray({ timeStampArray: fanm_A, monthInt: 2 }).length,
          filterStampsArray({ timeStampArray: fanm_A, monthInt: 3 }).length,
          filterStampsArray({ timeStampArray: fanm_A, monthInt: 4 }).length,
          filterStampsArray({ timeStampArray: fanm_A, monthInt: 5 }).length,
          filterStampsArray({ timeStampArray: fanm_A, monthInt: 6 }).length,
          filterStampsArray({ timeStampArray: fanm_A, monthInt: 7 }).length,
          filterStampsArray({ timeStampArray: fanm_A, monthInt: 8 }).length,
          filterStampsArray({ timeStampArray: fanm_A, monthInt: 9 }).length,
          filterStampsArray({ timeStampArray: fanm_A, monthInt: 10 }).length,
          filterStampsArray({ timeStampArray: fanm_A, monthInt: 11 }).length,
          filterStampsArray({ timeStampArray: fanm_A, monthInt: 12 }).length,
        ],
        formations_anim_B: [
          fanm_B[0],
          fanm_B[1],
          fanm_B[2],
          fanm_B[3],
          fanm_B[4],
          fanm_B[5],
          fanm_B[6],
          fanm_B[7],
          fanm_B[8],
          fanm_B[9],
          fanm_B[10],
          fanm_B[11],
        ],
        observations_A: [
          filterStampsArray({ timeStampArray: obs_A, monthInt: 1 }).length,
          filterStampsArray({ timeStampArray: obs_A, monthInt: 2 }).length,
          filterStampsArray({ timeStampArray: obs_A, monthInt: 3 }).length,
          filterStampsArray({ timeStampArray: obs_A, monthInt: 4 }).length,
          filterStampsArray({ timeStampArray: obs_A, monthInt: 5 }).length,
          filterStampsArray({ timeStampArray: obs_A, monthInt: 6 }).length,
          filterStampsArray({ timeStampArray: obs_A, monthInt: 7 }).length,
          filterStampsArray({ timeStampArray: obs_A, monthInt: 8 }).length,
          filterStampsArray({ timeStampArray: obs_A, monthInt: 9 }).length,
          filterStampsArray({ timeStampArray: obs_A, monthInt: 10 }).length,
          filterStampsArray({ timeStampArray: obs_A, monthInt: 11 }).length,
          filterStampsArray({ timeStampArray: obs_A, monthInt: 12 }).length,
        ],
        observations_B: [
          filterStampsArray({ timeStampArray: obs_B, monthInt: 1 }).length,
          filterStampsArray({ timeStampArray: obs_B, monthInt: 2 }).length,
          filterStampsArray({ timeStampArray: obs_B, monthInt: 3 }).length,
          filterStampsArray({ timeStampArray: obs_B, monthInt: 4 }).length,
          filterStampsArray({ timeStampArray: obs_B, monthInt: 5 }).length,
          filterStampsArray({ timeStampArray: obs_B, monthInt: 6 }).length,
          filterStampsArray({ timeStampArray: obs_B, monthInt: 7 }).length,
          filterStampsArray({ timeStampArray: obs_B, monthInt: 8 }).length,
          filterStampsArray({ timeStampArray: obs_B, monthInt: 9 }).length,
          filterStampsArray({ timeStampArray: obs_B, monthInt: 10 }).length,
          filterStampsArray({ timeStampArray: obs_B, monthInt: 11 }).length,
          filterStampsArray({ timeStampArray: obs_B, monthInt: 12 }).length,
        ],
      };
      data.push(obj);
      return data.map(async (doc) => {
        return {
          ...(doc.socialUserKey = await getUserDoc({ userKey: socialUserKey })),
          ...(doc.companyKey = await getCompanyDoc({ companyKey: companyKey })),
          ...(doc.officeKey = await getOfficeDoc({ officeKey: officeKey })),
          ...(doc.projectKey = await getProjectDoc({ projectKey: projectKey })),
          ...doc,
        };
      });
    } // end Globale
  },
};

export default smsMonthlyStatsResolver;
