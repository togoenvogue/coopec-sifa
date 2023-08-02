import { aql, db } from "../../../../../db/arangodb.js";
import {
  getOfficeDoc,
  getPerfectClientDoc,
  getUserDoc,
} from "../../../../../helpers/joindocs.js";
import { getLoanFileDoc } from "../../../../../helpers/joindocs_loan.js";
import { getSMSQuestionnaire } from "../../../../../helpers/joindocs_sms.js";

const smsQuestionnaireDataResolver = {
  questionnaireDataCreate: async ({
    projectKey,
    companyKey,
    officeKey,
    userKey,
    clientKey,
    participant,
    questionnaireKey,
    loanCycle,
    loanFileKey,
    optionKeys,
    optionValues,
    blocKeys,
    questions,
    score,
    geoLat,
    geoLong,
    isOldFile,
    status,
    dataStamp,
  }) => {
    /*console.log(`loanFileKey: ${loanFileKey}`);
    console.log(`isOldFile: ${isOldFile}`);
    console.log(`status: ${status}`);*/

    // DELTE PREVIOSU data with the same clientKey and cycle
    await db.query(aql`FOR s IN sms_questionnaire_data 
    FILTER s.clientKey == ${clientKey} AND s.loanCycle == ${loanCycle} 
    REMOVE {_key: s._key} IN sms_questionnaire_data RETURN OLD`);

    if (loanCycle % 2 != 0) {
      // make sure there is no prevous vul with this client with the same credit cycle
      const vul_prev = await db.query(aql`FOR v IN sms_questionnaire_data 
        FILTER v.clientKey == ${clientKey} AND v.loanCycle == ${loanCycle} RETURN v`);
      if (vul_prev.hasNext == false) {
        if (optionKeys.length > 0) {
          // get the user
          const user = await getUserDoc({ userKey: userKey });
          const office = await getOfficeDoc({ officeKey: officeKey });

          let objectsArr = [];
          for (let index = 0; index < optionKeys.length; index++) {
            const opKey = optionKeys[index];
            const blockKey = blocKeys[index];
            const question = questions[index];
            const opVal = optionValues[index];

            const obj = {
              optionKey: opKey,
              blockKey: blockKey,
              question: question,
              optionValues: opVal,
            };
            objectsArr.push(obj);
          }
          if (objectsArr.length > 0) {
            const obj = {
              timeStamp: Date.now(),
              dataStamp:
                dataStamp != null && dataStamp != undefined && dataStamp != 0
                  ? dataStamp
                  : Date.now(),
              projectKey,
              companyKey,
              officeKey,
              userKey,
              userUsername: await user.username,
              userFullName: `${await user.lastName} ${await user.firstName}`,
              userOfficeName: await office.officeName,
              clientKey,
              participant,
              questionnaireKey,
              loanCycle,
              loanFileKey,
              optionObjects: objectsArr,
              score,
              geoLat,
              geoLong,
              initFrom: "Online",
              status,
            };

            const doc_cursor = await db.query(aql`INSERT ${obj} 
              INTO sms_questionnaire_data RETURN NEW`);
            if (doc_cursor.hasNext) {
              const doc = await doc_cursor.next();
              if (loanFileKey != "" && isOldFile == true) {
                // update the loan file with the vulnerability key
                await db.query(aql`UPDATE ${loanFileKey} 
                  WITH { loanCredibilityKey: ${doc._key} } 
                  IN loan_files RETURN NEW`);
                return {
                  ...(doc.fullCount = 1),
                  ...doc,
                };
              } else {
                // init loan file
                return {
                  ...(doc.fullCount = 1),
                  ...doc,
                };
              }
            } else {
              throw new Error(`Erreur de création du questionnaire`);
            }
          } else {
            throw new Error(`Il semble que vous n'avez fourni aucune réponse`);
          }
        } else {
          throw new Error(`Erreur lors de la création du questionnaire`);
        }
      } else {
        throw new Error(
          `Désolé, vous essayez de créer un doublon du questionnaire pour ce bénéficiaire. Le cycle #${loanCycle} existe déjà`
        );
      }
    } else {
      throw new Error(
        `Désolé, vous ne pouvez pas administrer la fiche PAT à un credit de cycle pair : ${loanCycle}`
      );
    }
  },

  questionnaireDataByLoanFileKey: async ({ loanFileKey }) => {
    const doc_cursor = await db.query(aql`FOR a IN sms_questionnaire_data 
      FILTER a.loanFileKey == ${loanFileKey} RETURN a`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return {
        ...(doc.questionnaireKey = await getSMSQuestionnaire({
          key: doc.questionnaireKey,
        })),
        ...(doc.officeKey = await getOfficeDoc({ officeKey: doc.officeKey })),
        ...(doc.userKey = await getUserDoc({ userKey: doc.userKey })),
        ...(doc.clientKey =
          doc.clientKey != ""
            ? await getPerfectClientDoc({ clientKey: doc.clientKey })
            : null),
        ...(doc.loanFileKey =
          doc.loanFileKey != ""
            ? await getLoanFileDoc({ fileKey: doc.loanFileKey })
            : null),
        ...(doc.fullCount = 1),
        ...doc,
      };
    } else {
      throw new Error(`Erreur de sélecton du questionnaire`);
    }
  },

  questionnairesDataByClientKey: async ({
    clientKey,
    companyKey,
    projectKey,
    skip,
    perPage,
  }) => {
    const docs_cursor = await db.query(
      aql`FOR a IN sms_questionnaire_data 
      FILTER a.companyKey == ${companyKey} AND a.projectKey == ${projectKey} 
      AND a.clientKey == ${clientKey}
      SORT a.dataStamp DESC LIMIT ${skip}, ${perPage} RETURN a `,
      { fullCount: true },
      { count: true }
    );
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return {
          ...(doc.questionnaireKey = await getSMSQuestionnaire({
            key: doc.questionnaireKey,
          })),
          ...(doc.officeKey = await getOfficeDoc({
            officeKey: doc.officeKey,
          })),
          ...(doc.userKey = await getUserDoc({ userKey: doc.userKey })),
          ...(doc.clientKey =
            doc.clientKey != ""
              ? await getPerfectClientDoc({ clientKey: doc.clientKey })
              : null),
          ...(doc.loanFileKey =
            doc.loanFileKey != ""
              ? await getLoanFileDoc({ fileKey: doc.loanFileKey })
              : null),
          ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
          ...doc,
        };
      });
    } else {
      return [];
    }
  },

  questionnairesDataByQuestionnaireKey: async ({
    questionnaireKey,
    projectKey,
    companyKey,
    officeKey,
    userKey,
    coverage,
    dateFrom,
    dateTo,
    skip,
    perPage,
  }) => {
    /*
    FOR b IN sms_questionnaire_data
    UPDATE {_key: b._key} WITH { dataStamp: b.timeStamp } IN sms_questionnaire_data RETURN NEW
    */
    /*console.log(`coverage: ${coverage}`);
    console.log(`officeKey: ${officeKey}`);
    console.log(`userKey: ${userKey}`);
    console.log(`dateFrom: ${dateFrom}`);
    console.log(`dateTo: ${dateTo}`);
    console.log(`skip: ${skip}`);
    console.log(`perPage: ${perPage}`);*/

    if (coverage == "Utilisateur") {
      const docs_cursor = await db.query(
        aql`FOR a IN sms_questionnaire_data 
        FILTER a.questionnaireKey == ${questionnaireKey} 
        AND a.dataStamp >= ${dateFrom} AND a.dataStamp <= ${dateTo} 
        AND a.companyKey == ${companyKey} AND a.projectKey == ${projectKey} 
        AND a.userKey == ${userKey}
        SORT a.dataStamp DESC LIMIT ${skip}, ${perPage} RETURN a `,
        { fullCount: true },
        { count: true }
      );
      if (docs_cursor.hasNext) {
        const docs = await docs_cursor.all();
        return docs.map(async (doc) => {
          return {
            ...(doc.questionnaireKey = await getSMSQuestionnaire({
              key: doc.questionnaireKey,
            })),
            ...(doc.officeKey = await getOfficeDoc({
              officeKey: doc.officeKey,
            })),
            ...(doc.userKey = await getUserDoc({ userKey: doc.userKey })),
            ...(doc.clientKey =
              doc.clientKey != ""
                ? await getPerfectClientDoc({ clientKey: doc.clientKey })
                : null),
            ...(doc.loanFileKey =
              doc.loanFileKey != ""
                ? await getLoanFileDoc({ fileKey: doc.loanFileKey })
                : null),
            ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
            ...doc,
          };
        });
      } else {
        return [];
      }
    } else if (coverage == "Antenne") {
      const docs_cursor = await db.query(
        aql`FOR a IN sms_questionnaire_data 
        FILTER a.questionnaireKey == ${questionnaireKey} 
        AND a.dataStamp >= ${dateFrom} AND a.dataStamp <= ${dateTo} 
        AND a.companyKey == ${companyKey} AND a.projectKey == ${projectKey} 
        AND a.officeKey == ${officeKey}
        SORT a.dataStamp DESC LIMIT ${skip}, ${perPage} RETURN a`,
        { fullCount: true },
        { count: true }
      );
      if (docs_cursor.hasNext) {
        const docs = await docs_cursor.all();
        return docs.map(async (doc) => {
          return {
            ...(doc.questionnaireKey = await getSMSQuestionnaire({
              key: doc.questionnaireKey,
            })),
            ...(doc.officeKey = await getOfficeDoc({
              officeKey: doc.officeKey,
            })),
            ...(doc.userKey = await getUserDoc({ userKey: doc.userKey })),
            ...(doc.clientKey =
              doc.clientKey != ""
                ? await getPerfectClientDoc({ clientKey: doc.clientKey })
                : null),
            ...(doc.loanFileKey =
              doc.loanFileKey != ""
                ? await getLoanFileDoc({ fileKey: doc.loanFileKey })
                : null),
            ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
            ...doc,
          };
        });
      } else {
        return [];
      }
    } else if (coverage == "Globale") {
      const docs_cursor = await db.query(
        aql`FOR a IN sms_questionnaire_data 
        FILTER a.questionnaireKey == ${questionnaireKey} 
        AND a.dataStamp >= ${dateFrom} AND a.dataStamp <= ${dateTo} 
        AND a.companyKey == ${companyKey} AND a.projectKey == ${projectKey}
        SORT a.dataStamp DESC LIMIT ${skip}, ${perPage} RETURN a `,
        { fullCount: true },
        { count: true }
      );
      if (docs_cursor.hasNext) {
        const docs = await docs_cursor.all();
        return docs.map(async (doc) => {
          return {
            ...(doc.questionnaireKey = await getSMSQuestionnaire({
              key: doc.questionnaireKey,
            })),
            ...(doc.officeKey = await getOfficeDoc({
              officeKey: doc.officeKey,
            })),
            ...(doc.userKey = await getUserDoc({ userKey: doc.userKey })),
            ...(doc.clientKey =
              doc.clientKey != ""
                ? await getPerfectClientDoc({ clientKey: doc.clientKey })
                : null),
            ...(doc.loanFileKey =
              doc.loanFileKey != ""
                ? await getLoanFileDoc({ fileKey: doc.loanFileKey })
                : null),
            ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
            ...doc,
          };
        });
      } else {
        return [];
      }
    }
  },

  smsQuestionnaireGetPrevDataDraft: async ({ clientKey }) => {
    const doc_cursor = await db.query(aql`FOR d IN sms_questionnaire_data 
    FILTER d.status == 'Draft' AND d.clientKey == ${clientKey} 
    SORT d._key DESC LIMIT 1 RETURN d`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      const lf = await getLoanFileDoc({ fileKey: doc.loanFileKey });
      return {
        ...(doc.clientKey = await getPerfectClientDoc({
          clientKey: doc.clientKey,
        })),
        ...(doc.userKey = await getUserDoc({ userKey: doc.userKey })),
        ...(doc.loanFileKey = lf != null ? lf : { _key: doc.loanFileKey }),
        ...(doc.fullCount = 1),
        ...doc,
      };
    } else {
      return {};
    }
  },

  smsQuestionnaireDataDelete: async ({ vulKey }) => {
    const doc_cursor = await db.query(aql`REMOVE ${vulKey} IN 
    sms_questionnaire_data RETURN OLD`);
    if (doc_cursor.hasNext) {
      return "OK";
    } else {
      return "Une erreur s'est produite lors de la suppression de la fiche PAT";
    }
  },
};

export default smsQuestionnaireDataResolver;
