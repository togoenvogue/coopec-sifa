import { aql, db } from "../../../../../db/arangodb.js";

const smsQuestionnaireOptionResolver = {
  smsQuestionnaireOptionCreate: async ({
    blockKey,
    questionnaireKey,
    optionQuestion,
    optionItems,
    optionType,
    isActive,
    optionOrder,
  }) => {
    const obj = {
      timeStamp: Date.now(),
      blockKey: blockKey,
      questionnaireKey: questionnaireKey,
      optionQuestion: optionQuestion,
      optionItems: optionItems,
      optionType: optionType,
      optionOrder: optionOrder,
      isActive: isActive,
    };

    const doc_cursor = await db.query(aql`INSERT ${obj} 
    INTO sms_questionnaire_options RETURN NEW`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return {
        ...(doc.fullCount = 1),
        ...doc,
      };
    } else {
      throw new Error(
        `Erreur lors de la création de l'option du questionnaire`
      );
    }
  },

  smsQuestionnaireOptionUpdateQuestion: async ({
    optionKey,
    optionQuestion,
    optionOrder,
    optionType,
  }) => {
    const obj = {
      optionQuestion: optionQuestion,
      optionOrder: optionOrder,
      optionType,
    };
    const doc_cursor = await db.query(aql`UPDATE ${optionKey} 
    WITH ${obj} IN sms_questionnaire_options RETURN NEW`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return {
        ...(doc.fullCount = 1),
        ...doc,
      };
    } else {
      throw new Error(
        `Erreur lors de la mise à jour du block du questionnaire`
      );
    }
  },

  smsQuestionnaireOptionUpdateItem: async ({
    optionKey,
    optionItemIndex,
    optionItemLabel,
    optionItemValue,
    optionItemScore,
  }) => {
    // select option
    const option_cursor = await db.query(aql`FOR o IN sms_questionnaire_options 
    FILTER o._key == ${optionKey} RETURN o`);
    if (option_cursor.hasNext) {
      const option = await option_cursor.next();
      // make sure the option is not already used in the data
      const used_cursor = await db.query(aql`FOR d IN sms_questionnaire_data 
      FILTER d.optionKey == ${optionKey} RETURN d`);
      if (used_cursor.hasNext) {
        return `Impossible de modifier cette option car elle a déjà fait l'objet d'une ou de plusieurs participations`;
      } else {
        // continue
        let options = option.optionItems;
        let filteredItems = [];
        const newItem = [optionItemLabel, optionItemValue, optionItemScore];
        // loop through the existing items and exclude the one submitted
        for (let i = 0; i < options.length; i++) {
          let item = options[i];
          if (i !== optionItemIndex) {
            filteredItems.push(item);
          } else {
            // add the new item at the initial position
            filteredItems.push(newItem);
          }
        }

        // update
        const doc_cursor = await db.query(aql`UPDATE ${optionKey} 
        WITH { optionItems: ${filteredItems} } 
        IN sms_questionnaire_options RETURN NEW`);
        if (doc_cursor.hasNext) {
          const doc = await doc_cursor.next();
          return {
            ...(doc.fullCount = 1),
            ...doc,
          };
        } else {
          throw new Error(`Erreur lors de la mise à jour des options`);
        }
      }
    } else {
      return `Erreur de sélection de l'option`;
    }
  },

  smsQuestionnaireOptionRemoveItem: async ({
    optionKey,
    optionItemIndex,
    optionItemLabel,
    optionItemValue,
    optionItemScore,
  }) => {
    /*console.log(`optionKey: ${optionKey}`);
    console.log(`optionItemIndex: ${optionItemIndex}`);
    console.log(`optionItemLabel: ${optionItemLabel}`);
    console.log(`optionItemValue: ${optionItemValue}`);
    console.log(`optionItemScore: ${optionItemScore}`);*/
    // select option
    const option_cursor = await db.query(aql`FOR o IN sms_questionnaire_options 
    FILTER o._key == ${optionKey} RETURN o`);
    if (option_cursor.hasNext) {
      const option = await option_cursor.next();
      // make sure the option is not already used in the data
      const used_cursor = await db.query(aql`FOR d IN sms_questionnaire_data 
      FILTER d.optionKey == ${optionKey} RETURN d`);
      if (used_cursor.hasNext) {
        return `Impossible de modifier cette option car elle a déjà fait l'objet d'une ou de plusieurs participations`;
      } else {
        // continue
        let options = option.optionItems;
        let filteredItems = [];
        const newItem = [optionItemLabel, optionItemValue, optionItemScore];
        // loop through the existing items and exclude the one submitted
        for (let i = 0; i < options.length; i++) {
          let item = options[i];
          if (i !== optionItemIndex) {
            filteredItems.push(item);
          } else {
            // add the new item at the initial position
            //filteredItems.push(newItem);
          }
        }

        // update
        const doc_cursor = await db.query(aql`UPDATE ${optionKey} 
        WITH { optionItems: ${filteredItems} } 
        IN sms_questionnaire_options RETURN NEW`);
        if (doc_cursor.hasNext) {
          const doc = await doc_cursor.next();
          return {
            ...(doc.fullCount = 1),
            ...doc,
          };
        } else {
          throw new Error(`Erreur lors de la mise à jour des options`);
        }
      }
    } else {
      return `Erreur de sélection de l'option`;
    }
  },

  smsQuestionnaireOptionAddItem: async ({
    optionKey,
    optionItemLabel,
    optionItemValue,
    optionItemScore,
  }) => {
    const obj = {
      optionQuestion: optionQuestion,
      optionItems: optionItems,
      optionType: optionType,
      optionOrder: optionOrder,
      isActive: isActive,
    };
    const doc_cursor = await db.query(aql`UPDATE ${optionKey} 
    WITH ${obj} IN sms_questionnaire_options RETURN NEW`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return {
        ...(doc.fullCount = 1),
        ...doc,
      };
    } else {
      throw new Error(
        `Erreur lors de la mise à jour du block du questionnaire`
      );
    }
  },

  smsQuestionnaireOptionDelete: async ({ optionKey }) => {
    // make sure this option is not linked to any data before deleting
    const options_cursor = await db.query(aql`FOR b IN sms_questionnaire_data 
    FILTER b.optionKey == ${optionKey} RETURN b`);
    if (options_cursor.hasNext) {
      // cannot delete
      return `Impossible de supprimer la question car elle est liée à une ou plusieurs participations`;
    } else {
      // can delete
      const doc_cursor = await db.query(aql`REMOVE ${optionKey} IN 
      sms_questionnaire_options RETURN OLD`);
      if (doc_cursor.hasNext) {
        return "OK";
      } else {
        return `Une erreur s'est produite lors de la suppression de la question`;
      }
    }
  },
};

export default smsQuestionnaireOptionResolver;
