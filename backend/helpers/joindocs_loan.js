import { aql, db } from "../db/arangodb.js";
import {
  getCityDoc,
  getCompanyDoc,
  getCountryDoc,
  getOfficeDoc,
  getPerfectClientDoc,
  getProjectDoc,
  getUserDoc,
  getUserDocs,
} from "./joindocs.js";
import { getSMSQuestionnaireDataKeyByLoanFileKey } from "./joindocs_sms.js";

export async function getLoanProductDoc({ key }) {
  if (key != null) {
    const doc_cursor = await db.query(aql`FOR lonpdk IN loan_products 
      FILTER lonpdk._key == ${key} RETURN lonpdk`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return { ...doc };
    } else {
      return {};
    }
  } else {
    return null;
  }
}

export async function getLoanProductDocs({ productKeysArr }) {
  if (productKeysArr != null && productKeysArr.length > 0) {
    const docs_cursor = await db.query(aql`FOR p IN loan_products 
        FILTER p._key IN ${productKeysArr} 
        SORT p.productName DESC RETURN p`);
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return { ...doc };
      });
    } else {
      return [];
    }
  } else {
    return [];
  }
}

export async function getLoanActivityAgrDocs({ loanFileKey }) {
  if (loanFileKey != null) {
    const activities = [];

    const docs_cursor = await db.query(aql`FOR la IN loan_activite_agr 
        FILTER la.loanFileKey == ${loanFileKey} 
        SORT la._key DESC RETURN la`);
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();

      for (let docsi = 0; docsi < docs.length; docsi++) {
        const doc = await docs[docsi];

        let chargesArray = [];
        let recettesArray = [];

        // charges
        const charges_cursor = await db.query(aql`FOR chrj IN loan_exploitation 
          FILTER chrj.exploitationType == "CHARGES"
          AND chrj.activityKey == ${doc._key} 
          SORT chrj._key DESC RETURN chrj`);
        if (charges_cursor.hasNext) {
          const charges = await charges_cursor.all();
          for (let ci = 0; ci < charges.length; ci++) {
            const charge = charges[ci];
            chargesArray.push(charge);
          }
        }

        // recettes
        const recettes_cursor =
          await db.query(aql`FOR resset IN loan_exploitation 
          FILTER resset.exploitationType == "RECETTES"
          AND resset.activityKey == ${doc._key} 
          SORT resset._key DESC RETURN resset`);
        if (recettes_cursor.hasNext) {
          const recettes = await recettes_cursor.all();
          for (let ri = 0; ri < recettes.length; ri++) {
            const recette = recettes[ri];
            recettesArray.push(recette);
          }
        }

        doc.charges = chargesArray;
        doc.recettes = recettesArray;

        activities.push(doc);
      }
      return activities;

      /*
      return docs.map(async (doc) => {
        //console.log(doc);
        return { ...doc };
      });*/
    } else {
      return [];
    }
  } else {
    return [];
  }
}

export async function getLoanActivityStockageDocs({ loanFileKey }) {
  if (loanFileKey != null) {
    const docs_cursor = await db.query(aql`FOR la IN loan_activite_stockage 
        FILTER la.loanFileKey == ${loanFileKey} 
        SORT la._key DESC RETURN la`);
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return { ...doc };
      });
    } else {
      return [];
    }
  } else {
    return [];
  }
}

export async function getLoanExploitationDocs({ loanFileKey, type }) {
  if (loanFileKey != null) {
    const docs_cursor = await db.query(aql`FOR explt IN loan_exploitation 
        FILTER explt.loanFileKey == ${loanFileKey} 
        AND explt.exploitationType == ${type} 
        SORT explt._key DESC RETURN explt`);
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      /*console.log(
            `loanFileKey: ${loanFileKey} > type: ${type} > total: ${docs.length}`
          );*/
      return docs.map(async (doc) => {
        return {
          //...(doc.activityKey = doc.activityKey),
          ...doc,
        };
      });
    } else {
      return [];
    }
  } else {
    return [];
  }
}

export async function getLoanExploitationSum({ type, loanFileKey }) {
  //console.log(type);
  const doc_cursor = await db.query(aql`FOR i IN loan_exploitation 
        FILTER i.exploitationType == ${type} AND i.loanFileKey == ${loanFileKey}
        COLLECT year = DATE_YEAR(i.timeStamp) INTO sumx
        RETURN { "total": 
        SUM(FLATTEN((RETURN sumx[*].i.total))) 
        }`);
  if (doc_cursor.hasNext) {
    const doc = await doc_cursor.next();
    return doc.total;
  } else {
    return 0;
  }
}

// budget familial (DEPENSES ou REVENUS)
export async function getLoanBudgetDocs({ loanFileKey, type }) {
  //console.log(loanFileKey);
  if (loanFileKey != null && loanFileKey != undefined) {
    if (type != undefined) {
      const docs_cursor = await db.query(aql`FOR budgj IN loan_budget_familial 
      FILTER budgj.loanFileKey == ${loanFileKey} 
      AND budgj.type == ${type} SORT budgj._key DESC RETURN budgj`);
      if (docs_cursor.hasNext) {
        const docs = await docs_cursor.all();
        return docs;
      } else {
        return [];
      }
    } else {
      const docs_cursor = await db.query(aql`FOR budgj IN loan_budget_familial 
      FILTER budgj.loanFileKey == ${loanFileKey} SORT budgj._key DESC RETURN budgj`);
      if (docs_cursor.hasNext) {
        const docs = await docs_cursor.all();
        return docs;
      } else {
        return [];
      }
    }
  } else {
    return [];
  }
}

// garanties
export async function getLoanGaranties({ loanFileKey }) {
  if (loanFileKey != null) {
    const docs_cursor = await db.query(aql`FOR gaj IN loan_gages 
        FILTER gaj.loanFileKey == ${loanFileKey} 
        SORT gaj._key DESC RETURN gaj`);
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs;
    } else {
      return [];
    }
  } else {
    return [];
  }
}

// patrimoine docs based on type
export async function getLoanPatrimoineDocs({ loanFileKey, type }) {
  if (loanFileKey != null) {
    const docs_cursor = await db.query(aql`FOR patrim IN loan_patrimoine 
        FILTER patrim.loanFileKey == ${loanFileKey} 
        AND patrim.type == ${type}
        SORT patrim._key DESC RETURN patrim`);
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs;
    } else {
      return [];
    }
  } else {
    return [];
  }
}

// patrimoine
export async function getLoanPatrimoines({ loanFileKey }) {
  if (loanFileKey != null) {
    const docs_cursor = await db.query(aql`FOR patrim IN loan_patrimoine 
        FILTER patrim.loanFileKey == ${loanFileKey} 
        SORT patrim._key DESC RETURN patrim`);
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return {
          ...doc,
        };
      });
    } else {
      return [];
    }
  } else {
    return [];
  }
}

export async function getLoanAvisDocs({ loanFileKey }) {
  //console.log(loanFileKey);
  if (loanFileKey != null) {
    const docs_cursor = await db.query(aql`FOR av IN loan_avis 
        FILTER av.loanFileKey == ${loanFileKey} 
        SORT av.timeStamp DESC RETURN av`);
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return {
          ...(doc.userKey = await getUserDoc({ userKey: doc.userKey })),
          ...doc,
        };
      });
    } else {
      return [];
    }
  } else {
    return [];
  }
}

// suivi ou visites de terrain
export async function getLoanVisiteKeysAsStringArr({ loanFileKey }) {
  //console.log(loanFileKey);
  if (loanFileKey != null) {
    const docs_cursor = await db.query(aql`FOR av IN loan_suivi 
        FILTER av.loanFileKey == ${loanFileKey} 
        SORT av.timeStamp DESC RETURN av`);
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return {
          ...(doc.clientKey = await getPerfectClientDoc({
            clientKey: doc.clientKey,
          })),
          ...(doc.adminKey = await getUserDoc({ userKey: doc.adminKey })),
          ...doc,
        };
      });
    } else {
      return [];
    }
  } else {
    return [];
  }
}

export async function getLoanVisiteDocs({ loanFileKey }) {
  //console.log(loanFileKey);
  if (loanFileKey != null) {
    const docs_cursor = await db.query(aql`FOR av IN loan_suivi 
        FILTER av.loanFileKey == ${loanFileKey} 
        SORT av.timeStamp DESC RETURN av`);
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        // embed the adminKey
        const user_doc = await db.query(aql`FOR ud IN user 
            FILTER ud._key == ${doc.adminKey} RETURN ud`);
        const user = await user_doc.next();
        return {
          ...(doc.adminKey = await user),
          ...doc,
        };
      });
    } else {
      return [];
    }
  } else {
    return [];
  }
}

export async function getLoanBesoinsDocs({ loanFileKey }) {
  //console.log(loanFileKey);
  if (loanFileKey != null) {
    const docs_cursor = await db.query(aql`FOR av IN loan_besoin
        FILTER av.loanFileKey == ${loanFileKey} 
        SORT av._key DESC RETURN av`);
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return {
          ...doc,
        };
      });
    } else {
      return [];
    }
  } else {
    return [];
  }
}

// get loan file by key
export async function getLoanFileDoc({ fileKey }) {
  const doc_cursor = await db.query(aql`FOR lfk IN loan_files 
      FILTER lfk._key == ${fileKey} RETURN lfk`);
  if (doc_cursor.hasNext) {
    const doc = await doc_cursor.next();
    return {
      ...(doc.loanCredibilityKey =
        await getSMSQuestionnaireDataKeyByLoanFileKey({
          loanKey: doc._key,
        })),
      ...(doc.projectKey = await getProjectDoc({
        projectKey: doc.projectKey,
      })),
      ...(doc.companyKey = await getCompanyDoc({
        companyKey: doc.companyKey,
      })),
      ...(doc.officeKey = await getOfficeDoc({
        officeKey: doc.officeKey,
      })),
      ...(doc.animateurKey = await getUserDoc({
        userKey: doc.animateurKey,
      })),
      ...(doc.revisedBy = await getUserDoc({ userKey: doc.revisedBy })),
      ...(doc.loanProductKey = await getLoanProductDoc({
        key: doc.loanProductKey,
      })),
      ...(doc.clientKey = await getPerfectClientDoc({
        clientKey: doc.clientKey,
      })),
      ...(doc.clientKey["officeKey"] = await getOfficeDoc({
        officeKey: doc.clientKey["officeKey"],
      })),
      ...(doc.clientKey["countryKey"] = await getCountryDoc({
        key: doc.clientKey["countryKey"],
      })),
      ...(doc.clientKey["cityKey"] = await getCityDoc({
        key: doc.clientKey["cityKey"],
      })),
      ...(doc.activityAgrKeys = await getLoanActivityAgrDocs({
        loanFileKey: doc._key,
      })),
      ...(doc.activityStockageKeys = await getLoanActivityStockageDocs({
        loanFileKey: doc._key,
      })),
      ...(doc.exploitationChargesKeys = await getLoanExploitationDocs({
        loanFileKey: doc._key,
        type: "CHARGES",
      })),
      ...(doc.exploitationRecettesKeys = await getLoanExploitationDocs({
        loanFileKey: doc._key,
        type: "RECETTES",
      })),
      ...(doc.totalCharges = await getLoanExploitationSum({
        loanFileKey: doc._key,
        type: "CHARGES",
      })),
      ...(doc.totalRecettes = await getLoanExploitationSum({
        loanFileKey: doc._key,
        type: "RECETTES",
      })),
      ...(doc.budgetChargesKeys = await getLoanBudgetDocs({
        loanFileKey: doc._key,
        type: "DÉPENSES",
      })),
      ...(doc.budgetRevenusKeys = await getLoanBudgetDocs({
        loanFileKey: doc._key,
        type: "REVENUS",
      })),
      ...(doc.avis = await getLoanAvisDocs({ loanFileKey: doc._key })),
      ...(doc.besoinsKeys = await getLoanBesoinsDocs({
        loanFileKey: doc._key,
      })),
      ...(doc.resultatNetAGR = 0),
      ...(doc.montantAchatEnergie = doc.montantCreditDemande * 0.5),
      ...(doc.fullCount = 1),
      ...doc,
    };
  } else {
    return null;
  }
}

export async function getLoanFileDocs({ fileKeysArr }) {
  if (fileKeysArr.length > 0) {
    const docs_cursor = await db.query(aql`FOR lfk IN loan_files 
      FILTER lfk._key IN ${fileKeysArr} RETURN lfk`);
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return {
          /*...(doc.sessionKey = await getSessionDoc({
            sessionKey: doc.sessionKey,
          })),*/
          ...(doc.animateurKey = await getUserDoc({
            userKey: doc.animateurKey,
          })),
          ...(doc.clientKey = await getPerfectClientDoc({
            clientKey: doc.clientKey,
          })),
          ...(doc.loanProductKey = await getLoanProductDoc({
            key: doc.loanProductKey,
          })),
          ...doc,
        };
      });
    } else {
      return [];
    }
  } else {
    return [];
  }
}

export async function getSumLoanFondsByDate({
  day,
  month,
  year,
  sessionKey,
  officeKey,
  type,
}) {
  if (type == "SESSION") {
    const doc_cursor = await db.query(aql`FOR df IN loan_files 
      FILTER df.sessionKey == ${sessionKey} 
      AND df.status == 'ACCORDÉ'
      AND DATE_DAY(df.dateDecaissement) == ${day} 
      AND DATE_MONTH(df.dateDecaissement) == ${month}
      AND DATE_YEAR(df.dateDecaissement) == ${year}
      COLLECT year = DATE_YEAR(df.timeStamp) INTO sumx
      RETURN { "total": 
      SUM(FLATTEN((RETURN sumx[*].df.montantCreditAccorde))) 
      }`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return doc.total;
    } else {
      return 0;
    }
  } else {
    // CUMUL
    const doc_cursor = await db.query(aql`FOR df IN loan_files 
        FILTER df.officeKey == ${officeKey} 
        AND df.status == 'ACCORDÉ'
        AND DATE_DAY(df.dateDecaissement) == ${day} 
        AND DATE_MONTH(df.dateDecaissement) == ${month}
        AND DATE_YEAR(df.dateDecaissement) == ${year}
        COLLECT year = DATE_YEAR(df.timeStamp) INTO sumx
        RETURN { "total": 
        SUM(FLATTEN((RETURN sumx[*].df.montantCreditAccorde))) 
        }`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return doc.total;
    } else {
      return 0;
    }
  }
}

export async function getSumLoanPV({ sessionKey, type }) {
  if (type == "ACCORDÉ") {
    const doc_cursor = await db.query(aql`FOR df IN loan_files 
      FILTER df.sessionKey == ${sessionKey} 
      AND df.status == 'ACCORDÉ' 
      OR df.sessionKey == ${sessionKey} AND df.status == 'DÉCAISSÉ'
      COLLECT year = DATE_YEAR(df.timeStamp) INTO sumx RETURN { "total": 
      SUM(FLATTEN((RETURN sumx[*].df.montantCreditAccorde))) 
      }`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return doc.total;
    } else {
      return 0;
    }
  } else if (type != "ACCORDÉ") {
    const doc_cursor =
      type == "ANALYSÉ"
        ? await db.query(aql`FOR df IN loan_files 
          FILTER df.sessionKey == ${sessionKey} 
          COLLECT year = DATE_YEAR(df.timeStamp) INTO sumx RETURN { "total": 
          SUM(FLATTEN((RETURN sumx[*].df.montantCreditDemande))) 
          }`)
        : await db.query(aql`FOR df IN loan_files 
          FILTER df.sessionKey == ${sessionKey} 
          AND df.status == ${type}
          COLLECT year = DATE_YEAR(df.timeStamp) INTO sumx RETURN { "total": 
          SUM(FLATTEN((RETURN sumx[*].df.montantCreditDemande))) 
          }`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return doc.total;
    } else {
      return 0;
    }
  } else {
    return 0;
  }
}

export async function getSessionLevelDoc({ docKey }) {
  //console.log(`${day}|${month}|${year}`);
  const doc_cursor = await db.query(aql`FOR sl IN 
    loan_session_levels FILTER sl._key == ${docKey} RETURN sl`);
  if (doc_cursor.hasNext) {
    const doc = await doc_cursor.next();
    return { ...doc };
  } else {
    return {};
  }
}

export async function getSessionLevelDocs({ keysArr }) {
  //console.log(`${day}|${month}|${year}`);
  const docs_cursor = await db.query(aql`FOR sl IN 
    loan_session_levels FILTER sl._key IN ${keysArr} RETURN sl`);
  if (docs_cursor.hasNext) {
    const docs = await docs_cursor.all();
    return docs.map(async (doc) => {
      return { ...doc };
    });
  } else {
    return [];
  }
}

export async function getSessionDoc({ sessionKey }) {
  const doc_cursor = await db.query(aql`FOR sl IN 
    loan_session FILTER sl._key == ${sessionKey} RETURN sl`);
  if (doc_cursor.hasNext) {
    const doc = await doc_cursor.next();
    return {
      ...(doc.sessionLevelKey = await getSessionLevelDoc({
        docKey: doc.sessionLevelKey,
      })),
      ...(doc.createdBy = await getUserDoc({ userKey: doc.createdBy })),
      ...(doc.participantKeys =
        doc.participantKeys.length > 0
          ? await getUserDocs({
              userKeyArr: doc.participantKeys,
            })
          : []),
      ...(doc.joinedUsers =
        doc.joinedUsers.length > 0
          ? await getUserDocs({
              userKeyArr: doc.joinedUsers,
            })
          : []),
      ...(doc.fileKeys =
        doc.fileKeys.length > 0
          ? await getLoanFileDocs({ fileKeysArr: doc.fileKeys })
          : []),
      ...(doc.officeKey = await getOfficeDoc({ officeKey: doc.officeKey })),
      ...doc,
    };
  } else {
    return null;
  }
}

export async function getCOffreSoldeByDay({
  projectKey,
  companyKey,
  officeKey,
  date,
}) {
  const doc_cursor = await db.query(aql`FOR cf IN coffre_fort 
    FILTER cf.projectKey == ${projectKey} 
    AND cf.companyKey == ${companyKey}
    AND cf.officeKey == ${officeKey}
    AND DATE_DAY(${date}) == cf.day
    AND DATE_MONTH(${date}) == cf.month
    AND DATE_YEAR(${date}) == cf.year RETURN cf`);
  if (doc_cursor.hasNext) {
    const doc = await doc_cursor.next();
    return doc.amount;
  } else {
    return 0;
  }
}

export async function getClientGroupDocs({ keysArr }) {
  const docs_cursor = await db.query(aql`FOR g IN group_perfect 
    FILTER g._key IN ${keysArr}
    SORT g.groupName ASC RETURN g`);
  if (docs_cursor.hasNext) {
    const docs = await docs_cursor.all();
    return docs.map(async (doc) => {
      return { ...doc };
    });
  } else {
    return [];
  }
}

export async function getLoanCategoryDoc({ categoryKey }) {
  const doc_cursor = await db.query(aql`FOR sl IN 
    loan_categories FILTER sl._key == ${categoryKey} RETURN sl`);
  if (doc_cursor.hasNext) {
    const doc = await doc_cursor.next();
    return { ...doc };
  } else {
    return null;
  }
}
