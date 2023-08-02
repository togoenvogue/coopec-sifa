import { aql, db } from "../../../../../db/arangodb.js";
import {
  getCompanyDoc,
  getProjectDoc,
} from "../../../../../helpers/joindocs.js";
import {
  getSMSQuestionnaire,
  getSMSQuestionnaireOptionsByBlockKey,
  getSMSQuestionnaireOptionStatsByBlockKey,
} from "../../../../../helpers/joindocs_sms.js";

const smsQuestionnaireBlockResolver = {
  smsQuestionnaireBlockCreate: async ({
    blockTitle,
    blockOrder,
    projectKey,
    companyKey,
    questionnaireKey,
  }) => {
    const obj = {
      timeStamp: Date.now(),
      projectKey: projectKey,
      companyKey: companyKey,
      questionnaireKey: questionnaireKey,
      blockTitle: blockTitle,
      blockOrder: blockOrder,
      options: [],
    };

    const doc_cursor = await db.query(aql`INSERT ${obj} 
    INTO sms_questionnaire_blocks RETURN NEW`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return {
        ...(doc.companyKey = await getCompanyDoc({
          companyKey: doc.companyKey,
        })),
        ...(doc.projectKey = await getProjectDoc({
          projectKey: doc.projectKey,
        })),
        ...(doc.fullCount = 1),
        ...doc,
      };
    } else {
      throw new Error(`Erreur lors de la création du block du questionnaire`);
    }
  },

  smsQuestionnaireBlockUpdate: async ({ blockTitle, blockOrder, blockKey }) => {
    const obj = {
      blockTitle: blockTitle,
      blockOrder: blockOrder,
    };
    const doc_cursor = await db.query(aql`UPDATE ${blockKey} 
    WITH ${obj} IN sms_questionnaire_blocks RETURN NEW`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return {
        ...(doc.companyKey = await getCompanyDoc({
          companyKey: doc.companyKey,
        })),
        ...(doc.projectKey = await getProjectDoc({
          projectKey: doc.projectKey,
        })),
        ...(doc.fullCount = 1),
        ...doc,
      };
    } else {
      throw new Error(
        `Erreur lors de la mise à jour du block du questionnaire`
      );
    }
  },

  smsQuestionnaireBlocks: async ({ questionnaireKey }) => {
    const docs_cursor = await db.query(
      aql`FOR p IN sms_questionnaire_blocks  
      FILTER p.questionnaireKey == ${questionnaireKey} 
      SORT p.blockOrder ASC RETURN p`,
      { fullCount: true },
      { count: true }
    );
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return {
          ...(doc.options = await getSMSQuestionnaireOptionsByBlockKey({
            blockKey: doc._key,
          })),
          ...(doc.questionnaireKey = await getSMSQuestionnaire({
            key: doc.questionnaireKey,
          })),
          ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
          ...doc,
        };
      });
    } else {
      return [];
    }
  },

  smsQuestionnaireBlocksWithOptions: async ({
    questionnaireKey,
    companyKey,
    projectKey,
  }) => {
    const docs_cursor = await db.query(
      aql`FOR p IN sms_questionnaire_blocks  
      FILTER p.questionnaireKey == ${questionnaireKey} 
      SORT p.blockOrder ASC RETURN p`,
      { fullCount: true },
      { count: true }
    );
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return {
          ...(doc.options = await getSMSQuestionnaireOptionsByBlockKey({
            blockKey: doc._key,
          })),
          ...(doc.questionnaireKey = await getSMSQuestionnaire({
            key: doc.questionnaireKey,
          })),
          ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
          ...doc,
        };
      });
    } else {
      return [];
    }
  },

  smsQuestionnaireBlocksWithResults: async ({
    questionnaireKey,
    companyKey,
    projectKey,
    officeKey,
    coverage,
    cycle,
    dateFrom,
    dateTo,
  }) => {
    /*console.log(`questionnaireKey: ${questionnaireKey}`);
    console.log(`officeKey: ${officeKey}`);
    console.log(`coverage: ${coverage}`);
    console.log(`cycle: ${cycle}`);
    console.log(`dateFrom: ${dateFrom}`);
    console.log(`dateTo: ${dateTo}`);*/
    const docs_cursor = await db.query(
      aql`FOR p IN sms_questionnaire_blocks  
      FILTER p.questionnaireKey == ${questionnaireKey} 
      SORT p.blockOrder ASC RETURN p`,
      { fullCount: true },
      { count: true }
    );
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return {
          ...(doc.options = await getSMSQuestionnaireOptionStatsByBlockKey({
            blockKey: doc._key,
            companyKey: companyKey,
            coverage: coverage,
            officeKey: officeKey,
            projectKey: projectKey,
            cycle: cycle,
            dateFrom: dateFrom,
            dateTo: dateTo,
          })),
          ...(doc.questionnaireKey = await getSMSQuestionnaire({
            key: doc.questionnaireKey,
          })),
          ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
          ...doc,
        };
      });
    } else {
      return [];
    }
  },

  smsQuestionnaireBlockDelete: async ({ blockKey }) => {
    // make sure the block does not contain any option before deleting
    const options_cursor =
      await db.query(aql`FOR b IN sms_questionnaire_options 
    FILTER b.blockKey == ${blockKey} RETURN b`);
    if (options_cursor.hasNext) {
      // cannot delete
      return `Impossible de supprimer ce block car il contient une ou plusieurs questions`;
    } else {
      // can delete
      const doc_cursor = await db.query(aql`REMOVE ${blockKey} IN 
      sms_questionnaire_blocks RETURN OLD`);
      if (doc_cursor.hasNext) {
        return "OK";
      } else {
        return `Une erreur s'est produite lors de la suppression du blocksss`;
      }
    }
  },
};

export default smsQuestionnaireBlockResolver;
