import { aql, db } from "../db/arangodb.js";

export async function getSMSQuestionnaire({ key }) {
  if (key != null) {
    const doc_cursor = await db.query(aql`FOR s IN sms_questionnaires 
        FILTER s._key == ${key} RETURN s`);
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

export async function getSMSQuestionnaireBlock({ key }) {
  if (key != null) {
    const doc_cursor = await db.query(aql`FOR s IN sms_questionnaire_blocks 
        FILTER s._key == ${key} RETURN s`);
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

export async function getSMSQuestionnaireOptionsByBlockKey({ blockKey }) {
  if (blockKey != null) {
    const docs_cursor = await db.query(aql`FOR s IN sms_questionnaire_options 
        FILTER s.blockKey == ${blockKey} 
        SORT s.optionOrder ASC RETURN s`);
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return {
          ...(doc.blockKey = await getSMSQuestionnaireBlock({
            key: doc.blockKey,
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

export async function getSMSQuestionnaireOptionStatsByBlockKey({
  blockKey,
  companyKey,
  officeKey,
  projectKey,
  coverage,
  dateFrom,
  dateTo,
}) {
  /*console.log(`Coverage: ${coverage}`);
  console.log(`CompanyKey: ${companyKey}`);
  console.log(`OfficeKey: ${officeKey}`);
  console.log(`ProjectKey: ${projectKey}`);
  console.log(`BlockKey: ${blockKey}`);
  console.log(`dateFrom: ${dateFrom}`);
  console.log(`dateTo: ${dateTo}`);*/

  if (coverage == "Globale") {
    let optionsArr = [];
    let optionResultsArr = [];
    // get the options
    const options_cursor =
      await db.query(aql`FOR s IN sms_questionnaire_options 
        FILTER s.blockKey == ${blockKey}
        SORT s.optionOrder ASC RETURN s`);
    if (options_cursor.hasNext) {
      const options = await options_cursor.all();
      for (let index = 0; index < options.length; index++) {
        let option = options[index];
        option.blockKey = await getSMSQuestionnaireBlock({
          key: option.blockKey,
        });
        // add the option to the array
        optionsArr.push(option);

        let optionValues = [];
        for (let v = 0; v < option.optionItems.length; v++) {
          const val = option.optionItems[v][1];
          optionValues.push(val);
          //console.log(`optionValue: ${val}`);
        }

        // loop through the optionValues
        if (optionValues.length > 0) {
          for (let iv = 0; iv < optionValues.length; iv++) {
            let optionValue = optionValues[iv];
            //console.log(`OPTIN VAL: ${opitonValue}`);
            // select the option
            const stats_cursor =
              await db.query(aql`FOR d IN sms_questionnaire_data 
            FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
            FILTER CURRENT.optionKey ==  ${option._key}
            AND CURRENT.blockKey == ${blockKey} 
            AND CURRENT.optionValues[0] == ${optionValue} 
            AND d.companyKey == ${companyKey}
            AND d.timeStamp >= ${dateFrom} 
            AND d.timeStamp <= ${dateTo} 
          ] ) RETURN d`);

            if (stats_cursor.hasNext) {
              const stats = await stats_cursor.all();

              const resultObj = {
                optionKey: option._key,
                resultValue: optionValue,
                optionType: option.optionType,
                resultCount: stats.length,
              };
              // inert
              optionResultsArr.push(resultObj);
            } else {
              const resultObj = {
                optionKey: option._key,
                resultValue: optionValue,
                optionType: option.optionType,
                resultCount: 0,
              };
              optionResultsArr.push(resultObj);
            }
          } // end for loop
        } // end if
      }
    }
    // return the result
    return optionsArr.map((res) => {
      return {
        ...(res.optionResults = optionResultsArr),
        ...res,
      };
    });
  } else if (coverage == "Agence") {
    let optionsArr = [];
    let optionResultsArr = [];
    // get the options
    const options_cursor =
      await db.query(aql`FOR s IN sms_questionnaire_options 
        FILTER s.blockKey == ${blockKey}
        SORT s.optionOrder ASC RETURN s`);
    if (options_cursor.hasNext) {
      const options = await options_cursor.all();
      for (let index = 0; index < options.length; index++) {
        let option = options[index];
        option.blockKey = await getSMSQuestionnaireBlock({
          key: option.blockKey,
        });
        // add the option to the array
        optionsArr.push(option);

        let optionValues = [];
        for (let v = 0; v < option.optionItems.length; v++) {
          const val = option.optionItems[v][1];
          optionValues.push(val);
          //console.log(`optionValue: ${val}`);
        }

        // loop through the optionValues
        if (optionValues.length > 0) {
          for (let iv = 0; iv < optionValues.length; iv++) {
            let optionValue = optionValues[iv];
            //console.log(`OPTIN VAL: ${opitonValue}`);
            // select the option
            const stats_cursor =
              await db.query(aql`FOR d IN sms_questionnaire_data 
              FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
              FILTER CURRENT.optionKey ==  ${option._key}
              AND CURRENT.blockKey == ${blockKey} 
              AND CURRENT.optionValues[0] == ${optionValue} 
              AND d.companyKey == ${companyKey} 
              AND d.officeKey == ${officeKey} 
              AND d.timeStamp >= ${dateFrom} 
              AND d.timeStamp <= ${dateTo}
            ] ) RETURN d`);

            if (stats_cursor.hasNext) {
              const stats = await stats_cursor.all();

              const resultObj = {
                optionKey: option._key,
                resultValue: optionValue,
                optionType: option.optionType,
                resultCount: stats.length,
              };
              // inert
              optionResultsArr.push(resultObj);
            } else {
              const resultObj = {
                optionKey: option._key,
                resultValue: optionValue,
                optionType: option.optionType,
                resultCount: 0,
              };
              optionResultsArr.push(resultObj);
            }
          } // end for loop
        } // end if
      }
    }
    // return the result
    return optionsArr.map((res) => {
      return {
        ...(res.optionResults = optionResultsArr),
        ...res,
      };
    });
  } else {
    return [];
  }
}

export async function getSMSQuestionnaireOptionStatsByBlockKey_BACKUP({
  blockKey,
  companyKey,
  officeKey,
  projectKey,
  coverage,
  cycle,
  dateFrom,
  dateTo,
}) {
  /*console.log(`Coverage: ${coverage}`);
  console.log(`CompanyKey: ${companyKey}`);
  console.log(`OfficeKey: ${officeKey}`);
  console.log(`ProjectKey: ${projectKey}`);
  console.log(`Cycle: ${cycle}`);
  console.log(`BlockKey: ${blockKey}`);
  console.log(`dateFrom: ${dateFrom}`);
  console.log(`dateTo: ${dateTo}`);*/

  if (coverage == "Globale") {
    let optionsArr = [];
    let optionResultsArr = [];
    // get the options
    const options_cursor =
      await db.query(aql`FOR s IN sms_questionnaire_options 
        FILTER s.blockKey == ${blockKey}
        SORT s.optionOrder ASC RETURN s`);
    if (options_cursor.hasNext) {
      const options = await options_cursor.all();
      for (let index = 0; index < options.length; index++) {
        let option = options[index];
        option.blockKey = await getSMSQuestionnaireBlock({
          key: option.blockKey,
        });
        // add the option to the array
        optionsArr.push(option);

        let optionValues = [];
        for (let v = 0; v < option.optionItems.length; v++) {
          const val = option.optionItems[v][1];
          optionValues.push(val);
          //console.log(`optionValue: ${val}`);
        }

        // loop through the optionValues
        if (optionValues.length > 0) {
          for (let iv = 0; iv < optionValues.length; iv++) {
            let optionValue = optionValues[iv];
            //console.log(`OPTIN VAL: ${opitonValue}`);
            // select the option
            const stats_cursor =
              cycle == 0
                ? await db.query(aql`FOR d IN sms_questionnaire_data 
              FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
              FILTER CURRENT.optionKey ==  ${option._key}
              AND CURRENT.blockKey == ${blockKey} 
              AND CURRENT.optionValues[0] == ${optionValue} 
              AND d.companyKey == ${companyKey} 
              AND d.timeStamp >= ${dateFrom} 
              AND d.timeStamp <= ${dateTo}
            ] ) RETURN d`)
                : await db.query(aql`FOR d IN sms_questionnaire_data 
            FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
            FILTER CURRENT.optionKey ==  ${option._key}
            AND CURRENT.blockKey == ${blockKey} 
            AND CURRENT.optionValues[0] == ${optionValue} 
            AND d.companyKey == ${companyKey}
            AND d.timeStamp >= ${dateFrom} 
            AND d.timeStamp <= ${dateTo}
            AND d.loanCycle == ${cycle}
          ] ) RETURN d`);

            if (stats_cursor.hasNext) {
              const stats = await stats_cursor.all();

              const resultObj = {
                optionKey: option._key,
                resultValue: optionValue,
                optionType: option.optionType,
                resultCount: stats.length,
              };
              // inert
              optionResultsArr.push(resultObj);
            } else {
              const resultObj = {
                optionKey: option._key,
                resultValue: optionValue,
                optionType: option.optionType,
                resultCount: 0,
              };
              optionResultsArr.push(resultObj);
            }
          } // end for loop
        } // end if
      }
    }
    // return the result
    return optionsArr.map((res) => {
      return {
        ...(res.optionResults = optionResultsArr),
        ...res,
      };
    });
  } else if (coverage == "Antenne") {
    let optionsArr = [];
    let optionResultsArr = [];
    // get the options
    const options_cursor =
      await db.query(aql`FOR s IN sms_questionnaire_options 
        FILTER s.blockKey == ${blockKey}
        SORT s.optionOrder ASC RETURN s`);
    if (options_cursor.hasNext) {
      const options = await options_cursor.all();
      for (let index = 0; index < options.length; index++) {
        let option = options[index];
        option.blockKey = await getSMSQuestionnaireBlock({
          key: option.blockKey,
        });
        // add the option to the array
        optionsArr.push(option);

        let optionValues = [];
        for (let v = 0; v < option.optionItems.length; v++) {
          const val = option.optionItems[v][1];
          optionValues.push(val);
          //console.log(`optionValue: ${val}`);
        }

        // loop through the optionValues
        if (optionValues.length > 0) {
          for (let iv = 0; iv < optionValues.length; iv++) {
            let optionValue = optionValues[iv];
            //console.log(`OPTIN VAL: ${opitonValue}`);
            // select the option
            const stats_cursor =
              cycle == 0
                ? await db.query(aql`FOR d IN sms_questionnaire_data 
              FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
              FILTER CURRENT.optionKey ==  ${option._key}
              AND CURRENT.blockKey == ${blockKey} 
              AND CURRENT.optionValues[0] == ${optionValue} 
              AND d.companyKey == ${companyKey} 
              AND d.officeKey == ${officeKey} 
              AND d.timeStamp >= ${dateFrom} 
              AND d.timeStamp <= ${dateTo}
            ] ) RETURN d`)
                : await db.query(aql`FOR d IN sms_questionnaire_data 
            FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
            FILTER CURRENT.optionKey ==  ${option._key}
            AND CURRENT.blockKey == ${blockKey} 
            AND CURRENT.optionValues[0] == ${optionValue} 
            AND d.companyKey == ${companyKey}
            AND d.officeKey == ${officeKey} 
            AND d.timeStamp >= ${dateFrom} 
            AND d.timeStamp <= ${dateTo}
            AND d.loanCycle == ${cycle}
          ] ) RETURN d`);

            if (stats_cursor.hasNext) {
              const stats = await stats_cursor.all();

              const resultObj = {
                optionKey: option._key,
                resultValue: optionValue,
                optionType: option.optionType,
                resultCount: stats.length,
              };
              // inert
              optionResultsArr.push(resultObj);
            } else {
              const resultObj = {
                optionKey: option._key,
                resultValue: optionValue,
                optionType: option.optionType,
                resultCount: 0,
              };
              optionResultsArr.push(resultObj);
            }
          } // end for loop
        } // end if
      }
    }
    // return the result
    return optionsArr.map((res) => {
      return {
        ...(res.optionResults = optionResultsArr),
        ...res,
      };
    });
  } else {
    return [];
  }
}

export async function getSMSQuestionnaireDataByClientKey({ clientKey }) {
  const doc_cursor = await db.query(aql`FOR d IN sms_questionnaire_data 
    FILTER d.status == 'Pending' AND d.clientKey == ${clientKey} 
    SORT d._key DESC LIMIT 1 RETURN d`);
  if (doc_cursor.hasNext) {
    const doc = await doc_cursor.next();
    return {
      ...(doc.fullCount = 1),
      ...doc,
    };
  } else {
    return null;
  }
}

export async function getSMSQuestionnaireDataKeyByLoanFileKey({ loanKey }) {
  if (loanKey != null) {
    const doc_cursor = await db.query(aql`FOR d IN sms_questionnaire_data 
    FILTER d.loanFileKey == ${loanKey} RETURN d`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return doc._key;
    } else {
      return null;
    }
  } else {
    return null;
  }
}

// sms activity type by key
export async function getSMSActivityTypeDoc({ docKey }) {
  if (docKey != null) {
    const doc_cursor = await db.query(aql`FOR d IN sms_activity_types 
    FILTER d._key == ${docKey} RETURN d`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return doc;
    } else {
      return null;
    }
  } else {
    return null;
  }
}

// get sms activity theme by key
export async function getSMSActivityThemeDoc({ docKey }) {
  if (docKey != null) {
    const doc_cursor = await db.query(aql`FOR d IN sms_activity_themes 
      FILTER d._key == ${docKey} RETURN d`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return {
        ...(doc.activityTypeKey = await getSMSActivityTypeDoc({
          docKey: doc.activityTypeKey,
        })),
        ...doc,
      };
    } else {
      return null;
    }
  } else {
    return null;
  }
}

export async function getSMSSuivisObjetDoc({ docKey }) {
  if (docKey != null) {
    const doc_cursor = await db.query(aql`FOR d IN sms_suivis_objets 
      FILTER d._key == ${docKey} RETURN d`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return { ...doc };
    } else {
      return null;
    }
  } else {
    return null;
  }
}

export async function getSMSSuivisActionDoc({ docKey }) {
  if (docKey != null) {
    const doc_cursor = await db.query(aql`FOR d IN sms_suivis_actions 
      FILTER d._key == ${docKey} RETURN d`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return { ...doc };
    } else {
      return null;
    }
  } else {
    return null;
  }
}

export async function getSMSSuivisClientStatusDoc({ docKey }) {
  if (docKey != null) {
    const doc_cursor = await db.query(aql`FOR d IN sms_suivis_status 
      FILTER d._key == ${docKey} RETURN d`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return { ...doc };
    } else {
      return null;
    }
  } else {
    return null;
  }
}

export async function getSMSSocialPartnerDoc({ docKey }) {
  if (docKey != null) {
    const doc_cursor = await db.query(aql`FOR d IN sms_social_partners 
      FILTER d._key == ${docKey} RETURN d`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return { ...doc };
    } else {
      return null;
    }
  } else {
    return null;
  }
}

export async function getSMSSocialPartnerDocs({ docKeyArr }) {
  if (docKeyArr != null && docKeyArr.length > 0) {
    const docs_cursor = await db.query(aql`FOR d IN sms_social_partners 
      FILTER d._key IN ${docKeyArr} RETURN d`);
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return { ...doc };
      });
    } else {
      return null;
    }
  } else {
    return [];
  }
}

export async function getSMSFormationDoc({ docKey }) {
  if (docKey != null) {
    const doc_cursor = await db.query(aql`FOR d IN sms_formations_themes 
      FILTER d._key == ${docKey} RETURN d`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return {
        ...(doc.thematiqueKey = await getSMSActivityThemeDoc({
          docKey: doc.thematiqueKey,
        })),
        ...doc,
      };
    } else {
      return null;
    }
  } else {
    return null;
  }
}

export async function smsQuestionnaireOptionStatsByOptionKeyCycles({
  blockKey,
  companyKey,
  officeKey,
  projectKey,
  optionKey,
  cycleFrom,
  cycleTo,
  dateFrom,
  dateTo,
  coverage,
}) {
  /*console.log(`Coverage: ${coverage}`);
  console.log(`CompanyKey: ${companyKey}`);
  console.log(`OfficeKey: ${officeKey}`);
  console.log(`ProjectKey: ${projectKey}`);
  console.log(`Cycle: ${cycle}`);
  console.log(`BlockKey: ${blockKey}`);
  console.log(`dateFrom: ${dateFrom}`);
  console.log(`dateTo: ${dateTo}`);*/

  // construire le array des cycles
  let cycles = [];
  for (let i = 1; i < cycleTo + 1; i++) {
    if (i % 2 !== 0 && i >= cycleFrom) {
      // si seulement il s'agit d'un cycle impair
      cycles.push(i);
    }
  }

  let optionResultsArr = [];
  let optionItemsArr = [];
  let optionObjectsArr = [];

  // select the option key
  const option_cursor = await db.query(aql`FOR o IN sms_questionnaire_options 
  FILTER o._key == ${optionKey} RETURN o`);
  if (option_cursor.hasNext) {
    const option = await option_cursor.next();
    for (let op = 0; op < option.optionItems.length; op++) {
      const opItm = option.optionItems[op];
      optionItemsArr.push(opItm[0]);
    } // end option items
  } else {
    optionItm;
    return [];
  }

  for (let ov = 0; ov < optionItemsArr.length; ov++) {
    const optionValue = optionItemsArr[ov];
    for (let ixx = 0; ixx < cycles.length; ixx++) {
      // continue
      const cycle = cycles[ixx];

      // get total records
      const ttr_cursor = await db.query(aql`FOR d IN sms_questionnaire_data 
        FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
        FILTER CURRENT.optionKey ==  ${optionKey}
        AND CURRENT.blockKey == ${blockKey} 
        AND d.companyKey == ${companyKey}
        AND d.timeStamp >= ${dateFrom} 
        AND d.timeStamp <= ${dateTo} 
        AND d.loanCycle == ${cycle}
      ] ) RETURN d`);
      const ttr = (await ttr_cursor.all()).length;

      // the the stats
      const stats_cursor = await db.query(aql`FOR d IN sms_questionnaire_data 
            FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
            FILTER CURRENT.optionKey ==  ${optionKey}
            AND CURRENT.blockKey == ${blockKey} 
            AND CURRENT.optionValues[0] == ${optionValue}
            AND d.companyKey == ${companyKey}
            AND d.timeStamp >= ${dateFrom} 
            AND d.timeStamp <= ${dateTo}
            AND d.loanCycle == ${cycle}  
          ] ) RETURN d`);

      if (stats_cursor.hasNext) {
        const stats = await stats_cursor.all();
        const resultObj = {
          optionValue: optionValue,
          cycle: cycle,
          total: ttr,
          quota: stats.length,
          percent: parseFloat(((stats.length * 100) / ttr).toFixed(2)),
        };
        // inert
        optionObjectsArr.push(resultObj);
      } else {
        const resultObj = {
          optionValue: optionValue,
          cycle: cycle,
          total: ttr,
          quota: 0,
          percent: 0,
        };
        optionObjectsArr.push(resultObj);
      }
    } // end for loop cyles

    const fObj = {
      optionValue: optionValue,
      cycles: optionObjectsArr,
    };
    optionResultsArr.push(fObj);
  } // end for optionItemsArr

  let subBlocks = [];

  for (let opv = 0; opv < optionItemsArr.length; opv++) {
    const opItm = optionItemsArr[opv];
    let option = { optionValue: opItm, cycles: [] };

    for (let sub = 0; sub < optionObjectsArr.length; sub++) {
      const el = optionObjectsArr[sub];
      if (el["optionValue"] == opItm) {
        const opSubObj = {
          cycle: el["cycle"],
          total: el["total"],
          quota: el["quota"],
          percent: el["percent"],
        };
        option.cycles.push(opSubObj);
      }
    }
    subBlocks.push(option);
  }
  // return the result
  return subBlocks;
}

export async function formationsAnimateursPercent({
  projectKey,
  companyKey,
  officeKey,
  userKey,
  coverage,
  year,
}) {
  let data = [];

  let m1_a = 0;
  let m1_b = 0;

  let m2_a = 0;
  let m2_b = 0;

  let m3_a = 0;
  let m3_b = 0;

  let m4_a = 0;
  let m4_b = 0;

  let m5_a = 0;
  let m5_b = 0;

  let m6_a = 0;
  let m6_b = 0;

  let m7_a = 0;
  let m7_b = 0;

  let m8_a = 0;
  let m8_b = 0;

  let m9_a = 0;
  let m9_b = 0;

  let m10_a = 0;
  let m10_b = 0;

  let m11_a = 0;
  let m11_b = 0;

  let m12_a = 0;
  let m12_b = 0;

  if (coverage == "Globale") {
    // janvier
    const m1_cursor = await db.query(
      aql`FOR e IN sms_formations_anims 
          FILTER e.companyKey == ${companyKey} 
          AND e.projectKey == ${projectKey} 
          AND DATE_YEAR(e.trainingStamp) == ${year}  
          AND DATE_MONTH(e.trainingStamp) == 1
          AND e.status == "Approved" RETURN e`,
      { fullCount: true },
      { count: true }
    );
    const m1_data = await m1_cursor.all();
    if (m1_data.length > 0) {
      for (let i = 0; i < m1_data.length; i++) {
        m1_a = m1_a + m1_data[i].animCountAttendu;
        m1_b = m1_b + m1_data[i].animCountPresent;
      }
    }
    // fevrier
    const m2_cursor = await db.query(
      aql`FOR e IN sms_formations_anims 
          FILTER e.companyKey == ${companyKey} 
          AND e.projectKey == ${projectKey} 
          AND DATE_YEAR(e.trainingStamp) == ${year}  
          AND DATE_MONTH(e.trainingStamp) == 2
          AND e.status == "Approved" RETURN e`,
      { fullCount: true },
      { count: true }
    );
    const m2_data = await m2_cursor.all();
    if (m2_data.length > 0) {
      for (let i = 0; i < m2_data.length; i++) {
        m2_a = m2_a + m2_data[i].animCountAttendu;
        m2_b = m2_b + m2_data[i].animCountPresent;
      }
    }
    // mars
    const m3_cursor = await db.query(
      aql`FOR e IN sms_formations_anims 
          FILTER e.companyKey == ${companyKey} 
          AND e.projectKey == ${projectKey} 
          AND DATE_YEAR(e.trainingStamp) == ${year}  
          AND DATE_MONTH(e.trainingStamp) == 3
          AND e.status == "Approved" RETURN e`,
      { fullCount: true },
      { count: true }
    );
    const m3_data = await m3_cursor.all();
    if (m3_data.length > 0) {
      for (let i = 0; i < m3_data.length; i++) {
        m3_a = m3_a + m3_data[i].animCountAttendu;
        m3_b = m3_b + m3_data[i].animCountPresent;
      }
    }

    // avril
    const m4_cursor = await db.query(
      aql`FOR e IN sms_formations_anims 
          FILTER e.companyKey == ${companyKey} 
          AND e.projectKey == ${projectKey} 
          AND DATE_YEAR(e.trainingStamp) == ${year}  
          AND DATE_MONTH(e.trainingStamp) == 4
          AND e.status == "Approved" RETURN e`,
      { fullCount: true },
      { count: true }
    );
    const m4_data = await m4_cursor.all();
    if (m4_data.length > 0) {
      for (let i = 0; i < m4_data.length; i++) {
        m4_a = m4_a + m4_data[i].animCountAttendu;
        m4_b = m4_b + m4_data[i].animCountPresent;
      }
    }

    // mai
    const m5_cursor = await db.query(
      aql`FOR e IN sms_formations_anims 
          FILTER e.companyKey == ${companyKey} 
          AND e.projectKey == ${projectKey} 
          AND DATE_YEAR(e.trainingStamp) == ${year}  
          AND DATE_MONTH(e.trainingStamp) == 5
          AND e.status == "Approved" RETURN e`,
      { fullCount: true },
      { count: true }
    );
    const m5_data = await m5_cursor.all();
    if (m5_data.length > 0) {
      for (let i = 0; i < m5_data.length; i++) {
        m5_a = m5_a + m5_data[i].animCountAttendu;
        m5_b = m5_b + m5_data[i].animCountPresent;
      }
    }

    // juin
    const m6_cursor = await db.query(
      aql`FOR e IN sms_formations_anims 
          FILTER e.companyKey == ${companyKey} 
          AND e.projectKey == ${projectKey} 
          AND DATE_YEAR(e.trainingStamp) == ${year}  
          AND DATE_MONTH(e.trainingStamp) == 6
          AND e.status == "Approved" RETURN e`,
      { fullCount: true },
      { count: true }
    );
    const m6_data = await m6_cursor.all();
    if (m6_data.length > 0) {
      for (let i = 0; i < m6_data.length; i++) {
        m6_a = m6_a + m6_data[i].animCountAttendu;
        m6_b = m6_b + m6_data[i].animCountPresent;
      }
    }

    // juillet
    const m7_cursor = await db.query(
      aql`FOR e IN sms_formations_anims 
          FILTER e.companyKey == ${companyKey} 
          AND e.projectKey == ${projectKey} 
          AND DATE_YEAR(e.trainingStamp) == ${year}  
          AND DATE_MONTH(e.trainingStamp) == 7
          AND e.status == "Approved" RETURN e`,
      { fullCount: true },
      { count: true }
    );
    const m7_data = await m7_cursor.all();
    if (m7_data.length > 0) {
      for (let i = 0; i < m7_data.length; i++) {
        m7_a = m7_a + m7_data[i].animCountAttendu;
        m7_b = m7_b + m7_data[i].animCountPresent;
      }
    }

    // aout
    const m8_cursor = await db.query(
      aql`FOR e IN sms_formations_anims 
          FILTER e.companyKey == ${companyKey} 
          AND e.projectKey == ${projectKey} 
          AND DATE_YEAR(e.trainingStamp) == ${year}  
          AND DATE_MONTH(e.trainingStamp) == 8
          AND e.status == "Approved" RETURN e`,
      { fullCount: true },
      { count: true }
    );
    const m8_data = await m8_cursor.all();
    if (m8_data.length > 0) {
      for (let i = 0; i < m8_data.length; i++) {
        m8_a = m8_a + m8_data[i].animCountAttendu;
        m8_b = m8_b + m8_data[i].animCountPresent;
      }
    }

    // septembre
    const m9_cursor = await db.query(
      aql`FOR e IN sms_formations_anims 
          FILTER e.companyKey == ${companyKey} 
          AND e.projectKey == ${projectKey} 
          AND DATE_YEAR(e.trainingStamp) == ${year}  
          AND DATE_MONTH(e.trainingStamp) == 9
          AND e.status == "Approved" RETURN e`,
      { fullCount: true },
      { count: true }
    );
    const m9_data = await m9_cursor.all();
    if (m9_data.length > 0) {
      for (let i = 0; i < m9_data.length; i++) {
        m9_a = m9_a + m9_data[i].animCountAttendu;
        m9_b = m9_b + m9_data[i].animCountPresent;
      }
    }

    // octobre
    const m10_cursor = await db.query(
      aql`FOR e IN sms_formations_anims 
          FILTER e.companyKey == ${companyKey} 
          AND e.projectKey == ${projectKey} 
          AND DATE_YEAR(e.trainingStamp) == ${year}  
          AND DATE_MONTH(e.trainingStamp) == 10
          AND e.status == "Approved" RETURN e`,
      { fullCount: true },
      { count: true }
    );
    const m10_data = await m10_cursor.all();
    if (m10_data.length > 0) {
      for (let i = 0; i < m10_data.length; i++) {
        m10_a = m10_a + m10_data[i].animCountAttendu;
        m10_b = m10_b + m10_data[i].animCountPresent;
      }
    }

    // novembre
    const m11_cursor = await db.query(
      aql`FOR e IN sms_formations_anims 
          FILTER e.companyKey == ${companyKey} 
          AND e.projectKey == ${projectKey} 
          AND DATE_YEAR(e.trainingStamp) == ${year}  
          AND DATE_MONTH(e.trainingStamp) == 11
          AND e.status == "Approved" RETURN e`,
      { fullCount: true },
      { count: true }
    );
    const m11_data = await m11_cursor.all();
    if (m11_data.length > 0) {
      for (let i = 0; i < m11_data.length; i++) {
        m11_a = m11_a + m11_data[i].animCountAttendu;
        m11_b = m11_b + m11_data[i].animCountPresent;
      }
    }

    // decembre
    const m12_cursor = await db.query(
      aql`FOR e IN sms_formations_anims 
          FILTER e.companyKey == ${companyKey} 
          AND e.projectKey == ${projectKey} 
          AND DATE_YEAR(e.trainingStamp) == ${year}  
          AND DATE_MONTH(e.trainingStamp) == 12
          AND e.status == "Approved" RETURN e`,
      { fullCount: true },
      { count: true }
    );
    const m12_data = await m12_cursor.all();
    if (m12_data.length > 0) {
      for (let i = 0; i < m12_data.length; i++) {
        m12_a = m12_a + m12_data[i].animCountAttendu;
        m12_b = m12_b + m12_data[i].animCountPresent;
      }
    }
    // build the array
    data.push(
      m1_b > 0 ? parseFloat(((m1_b * 100) / m1_a).toFixed(0)) : 0,
      m2_b > 0 ? parseFloat(((m2_b * 100) / m2_a).toFixed(0)) : 0,
      m3_b > 0 ? parseFloat(((m3_b * 100) / m3_a).toFixed(0)) : 0,
      m4_b > 0 ? parseFloat(((m4_b * 100) / m4_a).toFixed(0)) : 0,
      m5_b > 0 ? parseFloat(((m5_b * 100) / m5_a).toFixed(0)) : 0,
      m6_b > 0 ? parseFloat(((m6_b * 100) / m6_a).toFixed(0)) : 0,
      m7_b > 0 ? parseFloat(((m7_b * 100) / m7_a).toFixed(0)) : 0,
      m8_b > 0 ? parseFloat(((m8_b * 100) / m8_a).toFixed(0)) : 0,
      m9_b > 0 ? parseFloat(((m9_b * 100) / m9_a).toFixed(0)) : 0,
      m10_b > 0 ? parseFloat(((m10_b * 100) / m10_a).toFixed(0)) : 0,
      m11_b > 0 ? parseFloat(((m11_b * 100) / m11_a).toFixed(0)) : 0,
      m12_b > 0 ? parseFloat(((m12_b * 100) / m12_a).toFixed(0)) : 0
    );
    return data;
  } else if (coverage == "Antenne") {
    // janvier
    const m1_cursor = await db.query(
      aql`FOR e IN sms_formations_anims 
          FILTER e.companyKey == ${companyKey} 
          AND e.projectKey == ${projectKey} 
          AND e.officeKey == ${officeKey}
          AND DATE_YEAR(e.trainingStamp) == ${year}  
          AND DATE_MONTH(e.trainingStamp) == 1
          AND e.status == "Approved" RETURN e`,
      { fullCount: true },
      { count: true }
    );
    const m1_data = await m1_cursor.all();
    if (m1_data.length > 0) {
      for (let i = 0; i < m1_data.length; i++) {
        m1_a = m1_a + m1_data[i].animCountAttendu;
        m1_b = m1_b + m1_data[i].animCountPresent;
      }
    }
    // fevrier
    const m2_cursor = await db.query(
      aql`FOR e IN sms_formations_anims 
          FILTER e.companyKey == ${companyKey} 
          AND e.projectKey == ${projectKey} 
          AND e.officeKey == ${officeKey}
          AND DATE_YEAR(e.trainingStamp) == ${year}  
          AND DATE_MONTH(e.trainingStamp) == 2
          AND e.status == "Approved" RETURN e`,
      { fullCount: true },
      { count: true }
    );
    const m2_data = await m2_cursor.all();
    if (m2_data.length > 0) {
      for (let i = 0; i < m2_data.length; i++) {
        m2_a = m2_a + m2_data[i].animCountAttendu;
        m2_b = m2_b + m2_data[i].animCountPresent;
      }
    }
    // mars
    const m3_cursor = await db.query(
      aql`FOR e IN sms_formations_anims 
          FILTER e.companyKey == ${companyKey} 
          AND e.projectKey == ${projectKey} 
          AND e.officeKey == ${officeKey}
          AND DATE_YEAR(e.trainingStamp) == ${year}  
          AND DATE_MONTH(e.trainingStamp) == 3
          AND e.status == "Approved" RETURN e`,
      { fullCount: true },
      { count: true }
    );
    const m3_data = await m3_cursor.all();
    if (m3_data.length > 0) {
      for (let i = 0; i < m3_data.length; i++) {
        m3_a = m3_a + m3_data[i].animCountAttendu;
        m3_b = m3_b + m3_data[i].animCountPresent;
      }
    }

    // avril
    const m4_cursor = await db.query(
      aql`FOR e IN sms_formations_anims 
          FILTER e.companyKey == ${companyKey} 
          AND e.projectKey == ${projectKey} 
          AND e.officeKey == ${officeKey}
          AND DATE_YEAR(e.trainingStamp) == ${year}  
          AND DATE_MONTH(e.trainingStamp) == 4
          AND e.status == "Approved" RETURN e`,
      { fullCount: true },
      { count: true }
    );
    const m4_data = await m4_cursor.all();
    if (m4_data.length > 0) {
      for (let i = 0; i < m4_data.length; i++) {
        m4_a = m4_a + m4_data[i].animCountAttendu;
        m4_b = m4_b + m4_data[i].animCountPresent;
      }
    }

    // mai
    const m5_cursor = await db.query(
      aql`FOR e IN sms_formations_anims 
          FILTER e.companyKey == ${companyKey} 
          AND e.projectKey == ${projectKey} 
          AND e.officeKey == ${officeKey}
          AND DATE_YEAR(e.trainingStamp) == ${year}  
          AND DATE_MONTH(e.trainingStamp) == 5
          AND e.status == "Approved" RETURN e`,
      { fullCount: true },
      { count: true }
    );
    const m5_data = await m5_cursor.all();
    if (m5_data.length > 0) {
      for (let i = 0; i < m5_data.length; i++) {
        m5_a = m5_a + m5_data[i].animCountAttendu;
        m5_b = m5_b + m5_data[i].animCountPresent;
      }
    }

    // juin
    const m6_cursor = await db.query(
      aql`FOR e IN sms_formations_anims 
          FILTER e.companyKey == ${companyKey} 
          AND e.projectKey == ${projectKey} 
          AND e.officeKey == ${officeKey}
          AND DATE_YEAR(e.trainingStamp) == ${year}  
          AND DATE_MONTH(e.trainingStamp) == 6
          AND e.status == "Approved" RETURN e`,
      { fullCount: true },
      { count: true }
    );
    const m6_data = await m6_cursor.all();
    if (m6_data.length > 0) {
      for (let i = 0; i < m6_data.length; i++) {
        m6_a = m6_a + m6_data[i].animCountAttendu;
        m6_b = m6_b + m6_data[i].animCountPresent;
      }
    }

    // juillet
    const m7_cursor = await db.query(
      aql`FOR e IN sms_formations_anims 
          FILTER e.companyKey == ${companyKey} 
          AND e.projectKey == ${projectKey} 
          AND e.officeKey == ${officeKey}
          AND DATE_YEAR(e.trainingStamp) == ${year}  
          AND DATE_MONTH(e.trainingStamp) == 7
          AND e.status == "Approved" RETURN e`,
      { fullCount: true },
      { count: true }
    );
    const m7_data = await m7_cursor.all();
    if (m7_data.length > 0) {
      for (let i = 0; i < m7_data.length; i++) {
        m7_a = m7_a + m7_data[i].animCountAttendu;
        m7_b = m7_b + m7_data[i].animCountPresent;
      }
    }

    // aout
    const m8_cursor = await db.query(
      aql`FOR e IN sms_formations_anims 
          FILTER e.companyKey == ${companyKey} 
          AND e.projectKey == ${projectKey} 
          AND e.officeKey == ${officeKey}
          AND DATE_YEAR(e.trainingStamp) == ${year}  
          AND DATE_MONTH(e.trainingStamp) == 8
          AND e.status == "Approved" RETURN e`,
      { fullCount: true },
      { count: true }
    );
    const m8_data = await m8_cursor.all();
    if (m8_data.length > 0) {
      for (let i = 0; i < m8_data.length; i++) {
        m8_a = m8_a + m8_data[i].animCountAttendu;
        m8_b = m8_b + m8_data[i].animCountPresent;
      }
    }

    // septembre
    const m9_cursor = await db.query(
      aql`FOR e IN sms_formations_anims 
          FILTER e.companyKey == ${companyKey} 
          AND e.projectKey == ${projectKey} 
          AND e.officeKey == ${officeKey}
          AND DATE_YEAR(e.trainingStamp) == ${year}  
          AND DATE_MONTH(e.trainingStamp) == 9
          AND e.status == "Approved" RETURN e`,
      { fullCount: true },
      { count: true }
    );
    const m9_data = await m9_cursor.all();
    if (m9_data.length > 0) {
      for (let i = 0; i < m9_data.length; i++) {
        m9_a = m9_a + m9_data[i].animCountAttendu;
        m9_b = m9_b + m9_data[i].animCountPresent;
      }
    }

    // octobre
    const m10_cursor = await db.query(
      aql`FOR e IN sms_formations_anims 
          FILTER e.companyKey == ${companyKey} 
          AND e.projectKey == ${projectKey} 
          AND e.officeKey == ${officeKey}
          AND DATE_YEAR(e.trainingStamp) == ${year}  
          AND DATE_MONTH(e.trainingStamp) == 10
          AND e.status == "Approved" RETURN e`,
      { fullCount: true },
      { count: true }
    );
    const m10_data = await m10_cursor.all();
    if (m10_data.length > 0) {
      for (let i = 0; i < m10_data.length; i++) {
        m10_a = m10_a + m10_data[i].animCountAttendu;
        m10_b = m10_b + m10_data[i].animCountPresent;
      }
    }

    // novembre
    const m11_cursor = await db.query(
      aql`FOR e IN sms_formations_anims 
          FILTER e.companyKey == ${companyKey} 
          AND e.projectKey == ${projectKey} 
          AND e.officeKey == ${officeKey}
          AND DATE_YEAR(e.trainingStamp) == ${year}  
          AND DATE_MONTH(e.trainingStamp) == 11
          AND e.status == "Approved" RETURN e`,
      { fullCount: true },
      { count: true }
    );
    const m11_data = await m11_cursor.all();
    if (m11_data.length > 0) {
      for (let i = 0; i < m11_data.length; i++) {
        m11_a = m11_a + m11_data[i].animCountAttendu;
        m11_b = m11_b + m11_data[i].animCountPresent;
      }
    }

    // decembre
    const m12_cursor = await db.query(
      aql`FOR e IN sms_formations_anims 
          FILTER e.companyKey == ${companyKey} 
          AND e.projectKey == ${projectKey} 
          AND e.officeKey == ${officeKey}
          AND DATE_YEAR(e.trainingStamp) == ${year}  
          AND DATE_MONTH(e.trainingStamp) == 12
          AND e.status == "Approved" RETURN e`,
      { fullCount: true },
      { count: true }
    );
    const m12_data = await m12_cursor.all();
    if (m12_data.length > 0) {
      for (let i = 0; i < m12_data.length; i++) {
        m12_a = m12_a + m12_data[i].animCountAttendu;
        m12_b = m12_b + m12_data[i].animCountPresent;
      }
    }
    // build the array
    data.push(
      m1_b > 0 ? parseFloat(((m1_b * 100) / m1_a).toFixed(0)) : 0,
      m2_b > 0 ? parseFloat(((m2_b * 100) / m2_a).toFixed(0)) : 0,
      m3_b > 0 ? parseFloat(((m3_b * 100) / m3_a).toFixed(0)) : 0,
      m4_b > 0 ? parseFloat(((m4_b * 100) / m4_a).toFixed(0)) : 0,
      m5_b > 0 ? parseFloat(((m5_b * 100) / m5_a).toFixed(0)) : 0,
      m6_b > 0 ? parseFloat(((m6_b * 100) / m6_a).toFixed(0)) : 0,
      m7_b > 0 ? parseFloat(((m7_b * 100) / m7_a).toFixed(0)) : 0,
      m8_b > 0 ? parseFloat(((m8_b * 100) / m8_a).toFixed(0)) : 0,
      m9_b > 0 ? parseFloat(((m9_b * 100) / m9_a).toFixed(0)) : 0,
      m10_b > 0 ? parseFloat(((m10_b * 100) / m10_a).toFixed(0)) : 0,
      m11_b > 0 ? parseFloat(((m11_b * 100) / m11_a).toFixed(0)) : 0,
      m12_b > 0 ? parseFloat(((m12_b * 100) / m12_a).toFixed(0)) : 0
    );
    return data;
  } else if (coverage == "Utilisateur") {
    // janvier
    const m1_cursor = await db.query(
      aql`FOR e IN sms_formations_anims 
          FILTER e.companyKey == ${companyKey} 
          AND e.projectKey == ${projectKey} 
          AND e.socialUserKey == ${userKey}
          AND DATE_YEAR(e.trainingStamp) == ${year}  
          AND DATE_MONTH(e.trainingStamp) == 1
          AND e.status == "Approved" RETURN e`,
      { fullCount: true },
      { count: true }
    );
    const m1_data = await m1_cursor.all();
    if (m1_data.length > 0) {
      for (let i = 0; i < m1_data.length; i++) {
        m1_a = m1_a + m1_data[i].animCountAttendu;
        m1_b = m1_b + m1_data[i].animCountPresent;
      }
    }
    // fevrier
    const m2_cursor = await db.query(
      aql`FOR e IN sms_formations_anims 
          FILTER e.companyKey == ${companyKey} 
          AND e.projectKey == ${projectKey} 
          AND e.socialUserKey == ${userKey}
          AND DATE_YEAR(e.trainingStamp) == ${year}  
          AND DATE_MONTH(e.trainingStamp) == 2
          AND e.status == "Approved" RETURN e`,
      { fullCount: true },
      { count: true }
    );
    const m2_data = await m2_cursor.all();
    if (m2_data.length > 0) {
      for (let i = 0; i < m2_data.length; i++) {
        m2_a = m2_a + m2_data[i].animCountAttendu;
        m2_b = m2_b + m2_data[i].animCountPresent;
      }
    }
    // mars
    const m3_cursor = await db.query(
      aql`FOR e IN sms_formations_anims 
          FILTER e.companyKey == ${companyKey} 
          AND e.projectKey == ${projectKey} 
          AND e.socialUserKey == ${userKey}
          AND DATE_YEAR(e.trainingStamp) == ${year}  
          AND DATE_MONTH(e.trainingStamp) == 3
          AND e.status == "Approved" RETURN e`,
      { fullCount: true },
      { count: true }
    );
    const m3_data = await m3_cursor.all();
    if (m3_data.length > 0) {
      for (let i = 0; i < m3_data.length; i++) {
        m3_a = m3_a + m3_data[i].animCountAttendu;
        m3_b = m3_b + m3_data[i].animCountPresent;
      }
    }

    // avril
    const m4_cursor = await db.query(
      aql`FOR e IN sms_formations_anims 
          FILTER e.companyKey == ${companyKey} 
          AND e.projectKey == ${projectKey} 
          AND e.socialUserKey == ${userKey}
          AND DATE_YEAR(e.trainingStamp) == ${year}  
          AND DATE_MONTH(e.trainingStamp) == 4
          AND e.status == "Approved" RETURN e`,
      { fullCount: true },
      { count: true }
    );
    const m4_data = await m4_cursor.all();
    if (m4_data.length > 0) {
      for (let i = 0; i < m4_data.length; i++) {
        m4_a = m4_a + m4_data[i].animCountAttendu;
        m4_b = m4_b + m4_data[i].animCountPresent;
      }
    }

    // mai
    const m5_cursor = await db.query(
      aql`FOR e IN sms_formations_anims 
          FILTER e.companyKey == ${companyKey} 
          AND e.projectKey == ${projectKey} 
          AND e.socialUserKey == ${userKey}
          AND DATE_YEAR(e.trainingStamp) == ${year}  
          AND DATE_MONTH(e.trainingStamp) == 5
          AND e.status == "Approved" RETURN e`,
      { fullCount: true },
      { count: true }
    );
    const m5_data = await m5_cursor.all();
    if (m5_data.length > 0) {
      for (let i = 0; i < m5_data.length; i++) {
        m5_a = m5_a + m5_data[i].animCountAttendu;
        m5_b = m5_b + m5_data[i].animCountPresent;
      }
    }

    // juin
    const m6_cursor = await db.query(
      aql`FOR e IN sms_formations_anims 
          FILTER e.companyKey == ${companyKey} 
          AND e.projectKey == ${projectKey} 
          AND e.socialUserKey == ${userKey}
          AND DATE_YEAR(e.trainingStamp) == ${year}  
          AND DATE_MONTH(e.trainingStamp) == 6
          AND e.status == "Approved" RETURN e`,
      { fullCount: true },
      { count: true }
    );
    const m6_data = await m6_cursor.all();
    if (m6_data.length > 0) {
      for (let i = 0; i < m6_data.length; i++) {
        m6_a = m6_a + m6_data[i].animCountAttendu;
        m6_b = m6_b + m6_data[i].animCountPresent;
      }
    }

    // juillet
    const m7_cursor = await db.query(
      aql`FOR e IN sms_formations_anims 
          FILTER e.companyKey == ${companyKey} 
          AND e.projectKey == ${projectKey} 
          AND e.socialUserKey == ${userKey}
          AND DATE_YEAR(e.trainingStamp) == ${year}  
          AND DATE_MONTH(e.trainingStamp) == 7
          AND e.status == "Approved" RETURN e`,
      { fullCount: true },
      { count: true }
    );
    const m7_data = await m7_cursor.all();
    if (m7_data.length > 0) {
      for (let i = 0; i < m7_data.length; i++) {
        m7_a = m7_a + m7_data[i].animCountAttendu;
        m7_b = m7_b + m7_data[i].animCountPresent;
      }
    }

    // aout
    const m8_cursor = await db.query(
      aql`FOR e IN sms_formations_anims 
          FILTER e.companyKey == ${companyKey} 
          AND e.projectKey == ${projectKey} 
          AND e.socialUserKey == ${userKey}
          AND DATE_YEAR(e.trainingStamp) == ${year}  
          AND DATE_MONTH(e.trainingStamp) == 8
          AND e.status == "Approved" RETURN e`,
      { fullCount: true },
      { count: true }
    );
    const m8_data = await m8_cursor.all();
    if (m8_data.length > 0) {
      for (let i = 0; i < m8_data.length; i++) {
        m8_a = m8_a + m8_data[i].animCountAttendu;
        m8_b = m8_b + m8_data[i].animCountPresent;
      }
    }

    // septembre
    const m9_cursor = await db.query(
      aql`FOR e IN sms_formations_anims 
          FILTER e.companyKey == ${companyKey} 
          AND e.projectKey == ${projectKey} 
          AND e.socialUserKey == ${userKey}
          AND DATE_YEAR(e.trainingStamp) == ${year}  
          AND DATE_MONTH(e.trainingStamp) == 9
          AND e.status == "Approved" RETURN e`,
      { fullCount: true },
      { count: true }
    );
    const m9_data = await m9_cursor.all();
    if (m9_data.length > 0) {
      for (let i = 0; i < m9_data.length; i++) {
        m9_a = m9_a + m9_data[i].animCountAttendu;
        m9_b = m9_b + m9_data[i].animCountPresent;
      }
    }

    // octobre
    const m10_cursor = await db.query(
      aql`FOR e IN sms_formations_anims 
          FILTER e.companyKey == ${companyKey} 
          AND e.projectKey == ${projectKey} 
          AND e.socialUserKey == ${userKey}
          AND DATE_YEAR(e.trainingStamp) == ${year}  
          AND DATE_MONTH(e.trainingStamp) == 10
          AND e.status == "Approved" RETURN e`,
      { fullCount: true },
      { count: true }
    );
    const m10_data = await m10_cursor.all();
    if (m10_data.length > 0) {
      for (let i = 0; i < m10_data.length; i++) {
        m10_a = m10_a + m10_data[i].animCountAttendu;
        m10_b = m10_b + m10_data[i].animCountPresent;
      }
    }

    // novembre
    const m11_cursor = await db.query(
      aql`FOR e IN sms_formations_anims 
          FILTER e.companyKey == ${companyKey} 
          AND e.projectKey == ${projectKey} 
          AND e.officeKey == ${officeKey} 
          AND e.socialUserKey == ${userKey}
          AND DATE_YEAR(e.trainingStamp) == ${year}  
          AND DATE_MONTH(e.trainingStamp) == 11
          AND e.status == "Approved" RETURN e`,
      { fullCount: true },
      { count: true }
    );
    const m11_data = await m11_cursor.all();
    if (m11_data.length > 0) {
      for (let i = 0; i < m11_data.length; i++) {
        m11_a = m11_a + m11_data[i].animCountAttendu;
        m11_b = m11_b + m11_data[i].animCountPresent;
      }
    }

    // decembre
    const m12_cursor = await db.query(
      aql`FOR e IN sms_formations_anims 
          FILTER e.companyKey == ${companyKey} 
          AND e.projectKey == ${projectKey} 
          AND e.officeKey == ${officeKey} 
          AND e.socialUserKey == ${userKey}
          AND DATE_YEAR(e.trainingStamp) == ${year}  
          AND DATE_MONTH(e.trainingStamp) == 12
          AND e.status == "Approved" RETURN e`,
      { fullCount: true },
      { count: true }
    );
    const m12_data = await m12_cursor.all();
    if (m12_data.length > 0) {
      for (let i = 0; i < m12_data.length; i++) {
        m12_a = m12_a + m12_data[i].animCountAttendu;
        m12_b = m12_b + m12_data[i].animCountPresent;
      }
    }
    // build the array
    data.push(
      m1_b > 0 ? parseFloat(((m1_b * 100) / m1_a).toFixed(0)) : 0,
      m2_b > 0 ? parseFloat(((m2_b * 100) / m2_a).toFixed(0)) : 0,
      m3_b > 0 ? parseFloat(((m3_b * 100) / m3_a).toFixed(0)) : 0,
      m4_b > 0 ? parseFloat(((m4_b * 100) / m4_a).toFixed(0)) : 0,
      m5_b > 0 ? parseFloat(((m5_b * 100) / m5_a).toFixed(0)) : 0,
      m6_b > 0 ? parseFloat(((m6_b * 100) / m6_a).toFixed(0)) : 0,
      m7_b > 0 ? parseFloat(((m7_b * 100) / m7_a).toFixed(0)) : 0,
      m8_b > 0 ? parseFloat(((m8_b * 100) / m8_a).toFixed(0)) : 0,
      m9_b > 0 ? parseFloat(((m9_b * 100) / m9_a).toFixed(0)) : 0,
      m10_b > 0 ? parseFloat(((m10_b * 100) / m10_a).toFixed(0)) : 0,
      m11_b > 0 ? parseFloat(((m11_b * 100) / m11_a).toFixed(0)) : 0,
      m12_b > 0 ? parseFloat(((m12_b * 100) / m12_a).toFixed(0)) : 0
    );
    return data;
  }
  return monthsArray;
}
