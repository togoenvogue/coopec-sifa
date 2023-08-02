import { aql, db } from "../../../../db/arangodb.js";

const gageResolver = {
  gageCreate: async ({
    companyKey,
    projectKey,
    loanFileKey,
    fullName,
    profession,
    quartier,
    phone,
    documents,
    gTypes,
    gDescs,
    gValeursA,
    gValeursB,
    evalNatures,
    evalDimensions,
    evalReferences,
    evalMarques,
    autresDetails,
    evalZones,
    evalValeursA,
    evalValeursB,
    evalValeursC,
    evalObservations,
  }) => {
    // construire les garanties
    let garanties = [];
    // construire les evaluations
    let evaluations = [];

    for (let index = 0; index < gTypes.length; index++) {
      const type = gTypes.length > 0 ? gTypes[index] : "-"; // type de garantie
      const desc = gDescs.length > 0 ? gDescs[index] : "-"; // nature ou description
      const valeurA = gValeursA.length > 0 ? gValeursA[index] : "-"; // valeur de la garantie
      const valeurB = gValeursB.length > 0 ? gValeursB[index] : "-"; // valeur retenue

      const gObj = {
        type: type,
        description: desc,
        valeurA: valeurA,
        valeurB: valeurB,
      };
      garanties.push(gObj);
    }

    for (let evai = 0; evai < evalNatures.length; evai++) {
      const evalObj = {
        nature: evalNatures.length > 0 ? evalNatures[evai] : "-",
        dimensions: evalDimensions.length > 0 ? evalDimensions[evai] : "-",
        references: evalReferences.length > 0 ? evalReferences[evai] : "-",
        marque: evalMarques.length > 0 ? evalMarques[evai] : "-",
        autresDetails: autresDetails.length > 0 ? autresDetails[evai] : "-",
        zone: evalZones.length > 0 ? evalZones[evai] : "-",
        valeurA: evalValeursA.length > 0 ? evalValeursA[evai] : "-",
        valeurB: evalValeursB.length > 0 ? evalValeursB[evai] : "-",
        valeurC: evalValeursC.length > 0 ? evalValeursC[evai] : "-",
        observations:
          evalObservations.length > 0 ? evalObservations[evai] : "-",
      };
      evaluations.push(evalObj);
    }

    const obj = {
      timeStamp: Date.now(),
      companyKey,
      projectKey,
      loanFileKey,
      fullName,
      profession,
      quartier,
      phone,
      documents,
      garanties: garanties,
      evaluations: evaluations,
      signatureClient: null,
      signatureAgent: null,
    };

    const doc_cursor = await db.query(aql`INSERT ${obj} 
    INTO loan_gages RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Erreur lors de la création du gage`;
    }
  },

  gageUpdate: async ({
    gageKey,
    fullName,
    profession,
    quartier,
    phone,
    documents,
    gTypes,
    gDescs,
    gValeursA,
    gValeursB,
    evalNatures,
    evalDimensions,
    evalReferences,
    evalMarques,
    autresDetails,
    evalZones,
    evalValeursA,
    evalValeursB,
    evalValeursC,
    evalObservations,
  }) => {
    // construire les garanties
    let garanties = [];
    // construire les evaluations
    let evaluations = [];

    for (let index = 0; index < gTypes.length; index++) {
      const type = gTypes.length > 0 ? gTypes[index] : "-"; // type de garantie
      const desc = gDescs.length > 0 ? gDescs[index] : "-"; // nature ou description
      const valeurA = gValeursA.length > 0 ? gValeursA[index] : "-"; // valeur de la garantie
      const valeurB = gValeursB.length > 0 ? gValeursB[index] : "-"; // valeur retenue

      const gObj = {
        type: type,
        description: desc,
        valeurA: valeurA,
        valeurB: valeurB,
      };
      garanties.push(gObj);
    }

    for (let evai = 0; evai < evalNatures.length; evai++) {
      const evalObj = {
        nature: evalNatures.length > 0 ? evalNatures[evai] : "-",
        dimensions: evalDimensions.length > 0 ? evalDimensions[evai] : "-",
        references: evalReferences.length > 0 ? evalReferences[evai] : "-",
        marque: evalMarques.length > 0 ? evalMarques[evai] : "-",
        autresDetails: autresDetails.length > 0 ? autresDetails[evai] : "-",
        zone: evalZones.length > 0 ? evalZones[evai] : "-",
        valeurA: evalValeursA.length > 0 ? evalValeursA[evai] : "-",
        valeurB: evalValeursB.length > 0 ? evalValeursB[evai] : "-",
        valeurC: evalValeursC.length > 0 ? evalValeursC[evai] : "-",
        observations:
          evalObservations.length > 0 ? evalObservations[evai] : "-",
      };
      evaluations.push(evalObj);
    }

    const obj = {
      fullName,
      profession,
      quartier,
      phone,
      documents,
      garanties: garanties,
      evaluations: evaluations,
    };

    const doc_cursor = await db.query(aql`UPDATE ${gageKey} WITH ${obj} 
    IN loan_gages RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Erreur lors de la modification du gage`;
    }
  },

  gageDelete: async ({ gageKey }) => {
    const session_cursor = await db.query(aql`FOR s IN loan_gages 
      FILTER s._key == ${gageKey} RETURN s`);
    if (session_cursor.hasNext) {
      const upSession_cursor = await db.query(aql`REMOVE ${gageKey} 
            IN loan_gages RETURN OLD`);
      if (upSession_cursor.hasNext) {
        return "SUCCESS";
      } else {
        return `Une erreur s\'est produite lors de la suppression du gage`;
      }
    } else {
      return `Impossible de sélectionner la caution: ${cautionKey}`;
    }
  },
};

export default gageResolver;
