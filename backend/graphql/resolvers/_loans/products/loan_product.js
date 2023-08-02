import { aql, db } from "../../../../db/arangodb.js";
import { getCompanyDoc, getProjectDoc } from "../../../../helpers/joindocs.js";
import { getLoanCategoryDoc } from "../../../../helpers/joindocs_loan.js";

const loanProductsResolver = {
  loanProductCreate: async ({
    projectKey,
    companyKey,
    isActive,
    productName,
    productReference,
    productCible,
    productObjets,
    autresGaranties,
    autresConditions,
    montantMinIndividuel,
    montantMaxIndividuel,
    montantMinGroupe,
    montantMaxGroupe,
    montantMaxGroupeParPersonne,
    dureeMax,
    productTypes,
    personnesMin,
    personnesMax,
    periodeCapitalisation,
    ratioNantissement,
    periodiciteRemboursement,
    differePossible,
    differeMax,
    tauxInteret,
    tauxInteretType,
    tauxAssurance,
    tauxAssuranceType,
    fraisDossier,
    fraisDossierType,
    autresFrais,
    autresFraisType,
    loanCategoryKey,
    gages,
    cautions,
    interestFrequency,
    kapitalFrenquency,
    personTypes,
  }) => {
    const obj = {
      timeStamp: Date.now(),
      projectKey,
      companyKey,
      loanCategoryKey,
      isActive,
      productName,
      productReference,
      productCible,
      productObjets,
      autresGaranties,
      autresConditions,
      montantMinIndividuel,
      montantMaxIndividuel,
      montantMinGroupe,
      montantMaxGroupe,
      montantMaxGroupeParPersonne,
      dureeMax,
      productTypes,
      personnesMin,
      personnesMax,
      periodeCapitalisation,
      ratioNantissement,
      periodiciteRemboursement,
      personTypes,
      differePossible,
      differeMax,
      tauxInteret,
      tauxInteretType,
      tauxAssurance,
      tauxAssuranceType,
      fraisDossier,
      fraisDossierType,
      autresFrais,
      autresFraisType,
      gages,
      cautions,
      interestFrequency,
      kapitalFrenquency,
    };

    const doc_cursor = await db.query(aql`INSERT ${obj} 
    INTO loan_products RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Erreur lors de la création du produit`;
    }
  },

  loanProductUpdate: async ({
    key,
    isActive,
    loanCategoryKey,
    productName,
    productReference,
    productCible,
    productObjets,
    autresGaranties,
    autresConditions,
    montantMinIndividuel,
    montantMaxIndividuel,
    montantMinGroupe,
    montantMaxGroupe,
    montantMaxGroupeParPersonne,
    dureeMax,
    productTypes,
    personnesMin,
    personnesMax,
    periodeCapitalisation,
    ratioNantissement,
    periodiciteRemboursement,
    differePossible,
    differeMax,
    tauxInteret,
    tauxInteretType,
    tauxAssurance,
    tauxAssuranceType,
    fraisDossier,
    fraisDossierType,
    autresFrais,
    autresFraisType,
    gages,
    cautions,
    interestFrequency,
    kapitalFrenquency,
    personTypes,
  }) => {
    const obj = {
      isActive,
      productName,
      loanCategoryKey,
      productReference,
      productCible,
      productObjets,
      autresGaranties,
      autresConditions,
      montantMinIndividuel,
      montantMaxIndividuel,
      montantMinGroupe,
      montantMaxGroupe,
      montantMaxGroupeParPersonne,
      dureeMax,
      productTypes,
      personTypes,
      personnesMin,
      personnesMax,
      periodeCapitalisation,
      ratioNantissement,
      periodiciteRemboursement,
      differePossible,
      differeMax,
      tauxInteret,
      tauxInteretType,
      tauxAssurance,
      tauxAssuranceType,
      fraisDossier,
      fraisDossierType,
      autresFrais,
      autresFraisType,
      gages,
      cautions,
      interestFrequency,
      kapitalFrenquency,
    };

    const doc_cursor = await db.query(aql`FOR p IN loan_products
    FILTER p._key == ${key} UPDATE ${key} WITH ${obj} 
    IN loan_products RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      return `Erreur lors de la mise à jour du produit`;
    }
  },

  loanProductsAll: async ({ skip, perPage }) => {
    const docs_cursor = await db.query(
      aql`FOR p IN loan_products  
      SORT p.productName ASC LIMIT ${skip}, ${perPage} RETURN p`,
      { fullCount: true },
      { count: true }
    );
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return {
          ...(doc.loanCategoryKey = await getLoanCategoryDoc({
            categoryKey: doc.loanCategoryKey,
          })),
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

  loanProductsByCompany: async ({ companyKey, projectKey, includeOnly }) => {
    if (includeOnly.length == 0) {
      const docs_cursor = await db.query(aql`FOR p IN loan_products
      FILTER p.companyKey == ${companyKey} AND p.projectKey == ${projectKey}
      AND p.isActive == true SORT p.productName ASC RETURN p`);

      if (docs_cursor.hasNext) {
        const docs = await docs_cursor.all();
        return docs.map(async (doc) => {
          return {
            ...(doc.loanCategoryKey = await getLoanCategoryDoc({
              categoryKey: doc.loanCategoryKey,
            })),
            ...(doc.companyKey = await getCompanyDoc({
              companyKey: doc.companyKey,
            })),
            ...(doc.projectKey = await getProjectDoc({
              projectKey: doc.projectKey,
            })),
            ...(doc.fullCount = 1),
            ...doc,
          };
        });
      } else {
        return [];
      }
    } else {
      // retreive only included product keys
      const docs_cursor = await db.query(aql`FOR p IN loan_products
      FILTER p.companyKey == ${companyKey} AND p.projectKey == ${projectKey} 
      AND p._key IN ${includeOnly}
      AND p.isActive == true SORT p.productName ASC RETURN p`);

      if (docs_cursor.hasNext) {
        const docs = await docs_cursor.all();
        return docs.map(async (doc) => {
          return {
            ...(doc.loanCategoryKey = await getLoanCategoryDoc({
              categoryKey: doc.loanCategoryKey,
            })),
            ...(doc.companyKey = await getCompanyDoc({
              companyKey: doc.companyKey,
            })),
            ...(doc.projectKey = await getProjectDoc({
              projectKey: doc.projectKey,
            })),
            ...(doc.fullCount = 1),
            ...doc,
          };
        });
      } else {
        return [];
      }
    }
  },
};

export default loanProductsResolver;
