import { aql, db } from "../../../../db/arangodb.js";

const cautionResolver = {
  cautionCreate: async ({
    loanFileKey,
    companyKey,
    projectKey,
    fullName,
    naissanceLieu,
    nationalite,
    profession,
    employeur,
    renvenuNet,
    revenuAutres,
    revenuAutresProvenance,
    adressePerso,
    adresseWork,
    phonePerso,
    phoneWork,
    pieceNumero,
    pieceLocation,
    membreImf,
    numeroCompteImf,
    naissanceDate,
    pieceType,
    pieceDateDebut,
    pieceDateFin,
    filiation,
  }) => {
    const obj = {
      timeStamp: Date.now(),
      loanFileKey,
      companyKey,
      projectKey,
      fullName,
      naissanceLieu,
      nationalite,
      profession,
      employeur,
      renvenuNet,
      revenuAutres,
      revenuAutresProvenance,
      adressePerso,
      adresseWork,
      phonePerso,
      phoneWork,
      pieceNumero,
      pieceLocation,
      membreImf,
      numeroCompteImf,
      naissanceDate,
      pieceType,
      pieceDateDebut,
      pieceDateFin,
      filiation,
      signature: null,
      bonPourCaution: null,
      photo: "camera_avatar.png",
      photo1: "camera_avatar.png",
      photo2: "camera_avatar.png",
      legende: null,
      legende1: null,
      legende2: null,
    };

    const doc_cursor = await db.query(aql`INSERT ${obj} 
    INTO loan_cautions RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Erreur lors de la création de la caution`;
    }
  },

  cautionUpdate: async ({
    cautionKey,
    fullName,
    naissanceLieu,
    nationalite,
    profession,
    employeur,
    renvenuNet,
    revenuAutres,
    revenuAutresProvenance,
    adressePerso,
    adresseWork,
    phonePerso,
    phoneWork,
    pieceNumero,
    pieceLocation,
    membreImf,
    numeroCompteImf,
    naissanceDate,
    pieceType,
    pieceDateDebut,
    pieceDateFin,
    filiation,
  }) => {
    const obj = {
      fullName,
      naissanceLieu,
      nationalite,
      profession,
      employeur,
      renvenuNet,
      revenuAutres,
      revenuAutresProvenance,
      adressePerso,
      adresseWork,
      phonePerso,
      phoneWork,
      pieceNumero,
      pieceLocation,
      membreImf,
      numeroCompteImf,
      naissanceDate,
      pieceType,
      pieceDateDebut,
      pieceDateFin,
      filiation,
    };

    const doc_cursor = await db.query(aql`UPDATE ${cautionKey} WITH ${obj} 
    IN loan_cautions RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Erreur lors de la modification de la caution`;
    }
  },

  cautionDelete: async ({ cautionKey }) => {
    const session_cursor = await db.query(aql`FOR s IN loan_cautions 
      FILTER s._key == ${cautionKey} RETURN s`);
    if (session_cursor.hasNext) {
      const upSession_cursor = await db.query(aql`REMOVE ${cautionKey} 
            IN loan_cautions RETURN OLD`);
      if (upSession_cursor.hasNext) {
        return "SUCCESS";
      } else {
        return `Une erreur s\'est produite lors de la suppression de la caution`;
      }
    } else {
      return `Impossible de sélectionner la caution: ${cautionKey}`;
    }
  },
};

export default cautionResolver;
