import { aql, db } from "../../../../../db/arangodb.js";
import {
  getCompanyDoc,
  getProjectDoc,
} from "../../../../../helpers/joindocs.js";

const smsQuestionnaireResolver = {
  smsQuestionnaireCreate: async ({
    projectKey,
    companyKey,
    questionnaireLabel,
    questionnaireDesc,
  }) => {
    const obj = {
      timeStamp: Date.now(),
      projectKey: projectKey,
      companyKey: companyKey,
      questionnaireLabel: questionnaireLabel,
      questionnaireDesc: questionnaireDesc,
      blocks: [],
    };

    const doc_cursor = await db.query(aql`INSERT ${obj} 
    INTO sms_questionnaires RETURN NEW`);
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
      throw new Error(`Erreur lors de la création de du questionnaire`);
    }
  },

  smsQuestionnaireUpdate: async ({
    questionnaireLabel,
    questionnaireDesc,
    docKey,
  }) => {
    const obj = {
      questionnaireLabel: questionnaireLabel,
      questionnaireDesc: questionnaireDesc,
    };
    const doc_cursor = await db.query(aql`UPDATE ${docKey} 
    WITH ${obj} IN sms_questionnaires RETURN NEW`);
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
      throw new Error(`Erreur lors de la mise à jour du questionnaire`);
    }
  },

  smsQuestionnaires: async ({ companyKey, projectKey, skip, perPage }) => {
    const docs_cursor = await db.query(
      aql`FOR p IN sms_questionnaires  
      FILTER p.projectKey == ${projectKey} 
      AND p.companyKey == ${companyKey}
      SORT p._key DESC LIMIT ${skip}, ${perPage} RETURN p`,
      { fullCount: true },
      { count: true }
    );
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        // select blocks
        const blocks_cursor =
          await db.query(aql`FOR b IN sms_questionnaire_blocks 
        FILTER b.questionnaireKey == ${doc._key} RETURN b`);
        let blocs = [];
        if (blocks_cursor.hasNext) {
          blocs = await blocks_cursor.all();
        }

        return {
          ...(doc.blocks = blocs),
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

  smsQuestionnaireDelete: async ({ docKey }) => {
    // make sure the questionnaire does not contain any block before deleting
    const docs_cursor = await db.query(aql`FOR b IN sms_questionnaire_blocks 
    FILTER b.questionnaireKey == ${docKey} RETURN b`);
    if (docs_cursor.hasNext) {
      // cannot delete
      return `Impossible de supprimer ce questionnaire car il contient un ou plusieurs blocks`;
    } else {
      // can delete
      const doc_cursor = await db.query(aql`REMOVE ${docKey} IN 
      sms_questionnaires RETURN OLD`);
      if (doc_cursor.hasNext) {
        return "OK";
      } else {
        return `Une erreur s'est produite lors de la suppression du questionnaire`;
      }
    }
  },
};

export default smsQuestionnaireResolver;
