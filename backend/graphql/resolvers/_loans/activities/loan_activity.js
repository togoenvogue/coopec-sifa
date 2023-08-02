import { aql, db } from "../../../../db/arangodb.js";

const loanActivitiesResolver = {
  loanActivityCreate: async ({
    loanFileKey,
    activityName,
    stage,
    age,
    frequency,
    periode,
    commerceType,
    commerceMode,
    commerceEmplacement,
    commerceEmplacementType,
    commerceAddress,
    moyenDeTransport,
    autresInfos,
    materielsActuels,
    materielsBesoin,
    stockActuel,
    stockACompleter,
    approLieu,
    approTransport,
    reglementFrequence,
    workingDays,
    saisonning,
    commerceEmplacementAutre,
    moyenDeTransportAutre,
    approTransportAutre,
    reglementFrequenceAutre,
    exploitationDateStart,
    exploitationDateEnd,
    activityDesc1,
    activityDesc2,
    activityDesc3,
    activityDesc4,
  }) => {
    const obj = {
      timeStamp: Date.now(),
      loanFileKey: loanFileKey,
      activityName: activityName,
      stage: stage,
      age: age,
      frequency: frequency,
      periode: periode,
      exploitationDateStart,
      exploitationDateEnd,
      commerceType: commerceType,
      commerceMode: commerceMode,
      commerceEmplacement: commerceEmplacement,
      commerceEmplacementType: commerceEmplacementType,
      commerceAddress: commerceAddress,
      moyenDeTransport: moyenDeTransport,
      autresInfos: autresInfos,
      materielsActuels: materielsActuels,
      materielsBesoin: materielsBesoin,
      stockActuel: stockActuel,
      stockACompleter: stockACompleter,
      approLieu: approLieu,
      approTransport: approTransport,
      reglementFrequence: reglementFrequence,
      workingDays: workingDays,
      saisonning: saisonning,
      exploitationChargesKeys: [],
      exploitationRecettesKeys: [],
      commerceEmplacementAutre: commerceEmplacementAutre,
      moyenDeTransportAutre: moyenDeTransportAutre,
      approTransportAutre: approTransportAutre,
      reglementFrequenceAutre: reglementFrequenceAutre,
      activityDesc1,
      activityDesc2,
      activityDesc3,
      activityDesc4,
    };

    const doc_cursor = await db.query(aql`INSERT ${obj} 
    INTO loan_activite_agr RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      throw new Error(`Erreur lors de la création de l'activité`);
    }
  },

  loanActivityUpdate: async ({
    activityKey,
    activityName,
    stage,
    age,
    frequency,
    periode,
    commerceType,
    commerceMode,
    commerceEmplacement,
    commerceEmplacementType,
    commerceAddress,
    moyenDeTransport,
    autresInfos,
    materielsActuels,
    materielsBesoin,
    stockActuel,
    stockACompleter,
    approLieu,
    approTransport,
    reglementFrequence,
    workingDays,
    saisonning,
    commerceEmplacementAutre,
    moyenDeTransportAutre,
    approTransportAutre,
    reglementFrequenceAutre,
    exploitationDateStart,
    exploitationDateEnd,
    activityDesc1,
    activityDesc2,
    activityDesc3,
    activityDesc4,
  }) => {
    const obj = {
      activityName: activityName,
      stage: stage,
      age: age,
      exploitationDateStart,
      exploitationDateEnd,
      frequency: frequency,
      periode: periode,
      commerceType: commerceType,
      commerceMode: commerceMode,
      commerceEmplacement: commerceEmplacement,
      commerceEmplacementType: commerceEmplacementType,
      commerceAddress: commerceAddress,
      moyenDeTransport: moyenDeTransport,
      autresInfos: autresInfos,
      materielsActuels: materielsActuels,
      materielsBesoin: materielsBesoin,
      stockActuel: stockActuel,
      stockACompleter: stockACompleter,
      approLieu: approLieu,
      approTransport: approTransport,
      reglementFrequence: reglementFrequence,
      workingDays: workingDays,
      saisonning: saisonning,
      commerceEmplacementAutre: commerceEmplacementAutre,
      moyenDeTransportAutre: moyenDeTransportAutre,
      approTransportAutre: approTransportAutre,
      reglementFrequenceAutre: reglementFrequenceAutre,
      activityDesc1,
      activityDesc2,
      activityDesc3,
      activityDesc4,
    };

    const doc_cursor = await db.query(aql`UPDATE ${activityKey} 
    WITH ${obj} IN loan_activite_agr RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      throw new Error(`Erreur lors de la mise à jour de l'activité`);
    }
  },

  /*loanActivityEditDesc: async ({
    activityKey,
    activityDesc1,
    activityDesc2,
    activityDesc3,
    activityDesc4,
  }) => {
    const obj = {
      activityDesc1,
      activityDesc2,
      activityDesc3,
      activityDesc4,
    };

    const doc_cursor = await db.query(aql`UPDATE ${activityKey} 
    WITH ${obj} IN loan_activite_agr RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      throw new Error(
        `Erreur lors la sauvegarde de la description de l'activité`
      );
    }
  },*/

  loanActivityDelete: async ({ loanFileKey, activityKey }) => {
    // select the loan file key
    const activity_doc = await db.query(aql`FOR o IN loan_activite_agr 
      FILTER o._key == ${activityKey} AND o.loanFileKey == ${loanFileKey}
      REMOVE o._key IN loan_activite_agr RETURN OLD`);
    if (activity_doc.hasNext) {
      // delete all epxloitations
      await db.query(aql`FOR ex IN loan_exploitation 
      FILTER ex.activityKey == ${activityKey} 
      REMOVE ex._key IN loan_exploitation RETURN OLD`);
      // return
      return "SUCCESS";
    } else {
      throw new Error(
        `Erreur lors de la suppression de l'activité ${activityKey}`
      );
    }
  },

  loanActivitiesByFileKey: async ({ loanFileKey }) => {
    const doc_cursor = await db.query(aql`FOR a IN loan_activite_agr 
      FILTER a.loanFileKey == ${loanFileKey} RETURN a`);
    if (doc_cursor.hasNext) {
      const docs = await doc_cursor.all();
      return docs.map(async (doc) => {
        return {
          ...(fullCount = 1),
          ...doc,
        };
      });
    } else {
      return [];
    }
  },
};

export default loanActivitiesResolver;
