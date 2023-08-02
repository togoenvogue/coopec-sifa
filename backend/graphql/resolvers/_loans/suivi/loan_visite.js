import { aql, db } from "../../../../db/arangodb.js";
import {
  getUserDoc,
  getOfficeDoc,
  getPerfectClientDoc,
} from "../../../../helpers/joindocs.js";

const loanSuiviResolver = {
  loanVisiteCreate: async ({
    loanFileKey,
    adminKey,
    clientKey,
    officeKey,
    groupName,
    lieu,
    motif,
    currentPretCycle,
    currentPretMontant,
    currentPretDateDecaissement,
    currentPretDuree,
    nextPretCycle,
    nextPretMontant,
    nextPretDateDecaissement,
    nextPretDuree,
    commentaireCompteRendu,
    suiteSuivite,
    accompagnateur,
    dateConvocation,
    commentaireAutre,
    gpsLat,
    gpsLong,
  }) => {
    const obj = {
      timeStamp: Date.now(),
      loanFileKey: loanFileKey,
      adminKey: adminKey,
      clientKey: clientKey,
      officeKey: officeKey,
      groupName: groupName,
      lieu: lieu,
      motif: motif,
      currentPretCycle: currentPretCycle,
      currentPretMontant: currentPretMontant,
      currentPretDateDecaissement: currentPretDateDecaissement,
      currentPretDuree: currentPretDuree,
      nextPretCycle: nextPretCycle,
      nextPretMontant: nextPretMontant,
      nextPretDateDecaissement: nextPretDateDecaissement,
      nextPretDuree: nextPretDuree,
      commentaireCompteRendu: commentaireCompteRendu,
      suiteSuivite: suiteSuivite,
      accompagnateur: accompagnateur,
      dateConvocation: dateConvocation,
      commentaireAutre: commentaireAutre,
      gpsLat: gpsLat,
      gpsLong: gpsLong,
      photo: "camera_avatar.png",
      photo1: "camera_avatar.png",
      legende: null,
      legende1: null,
    };

    const doc_cursor = await db.query(aql`INSERT ${obj} 
    INTO loan_suivi RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      throw new Error(`Erreur lors de la création du produit`);
    }
  },

  loanVisiteUpdate: async ({
    docKey,
    lieu,
    motif,
    commentaireCompteRendu,
    suiteSuivite,
    accompagnateur,
    dateConvocation,
    commentaireAutre,
  }) => {
    const obj = {
      lieu: lieu,
      motif: motif,
      commentaireCompteRendu: commentaireCompteRendu,
      suiteSuivite: suiteSuivite,
      accompagnateur: accompagnateur,
      dateConvocation: dateConvocation,
      commentaireAutre: commentaireAutre,
    };

    const doc_cursor = await db.query(aql`FOR p IN loan_suivi
    FILTER p._key == ${docKey} UPDATE ${docKey} WITH ${obj} 
    IN loan_suivi RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      throw new Error(`Erreur lors de la mise à jour du suivi`);
    }
  },

  loanVisiteDelete: async ({ docKey, loanFileKey }) => {
    const doc_cursor = await db.query(aql`FOR p IN loan_suivi
    FILTER p._key == ${docKey} AND p.loanFileKey == ${loanFileKey}
    REMOVE ${docKey} IN loan_suivi RETURN OLD`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      throw new Error(`Erreur lors de la mise à jour du suivi`);
    }
  },

  loanVisitesByLoanFileKey: async ({ loanFileKey }) => {
    const docs_cursor = await db.query(aql`FOR p IN loan_suivi 
    FILTER p.loanFileKey == ${loanFileKey}
    SORT p.timeStamp DESC LIMIT 50 RETURN p`);
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return {
          ...(doc.adminKey = await getUserDoc({ userKey: doc.adminKey })),
          ...(doc.clientKey = await getPerfectClientDoc({
            clientKey: doc.clientKey,
          })),
          ...(doc.officeKey = await getOfficeDoc({
            officeKey: doc.officeKey,
          })),
          ...doc,
        };
      });
    } else {
      return [];
    }
  },
};

export default loanSuiviResolver;
