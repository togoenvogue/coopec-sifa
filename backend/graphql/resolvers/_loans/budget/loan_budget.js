import { aql, db } from "../../../../db/arangodb.js";

const loanBudgetResolver = {
  loanBudgetCreate: async ({ loanFileKey, type, description, montant }) => {
    if (description.length > 0) {
      var objArr = [];

      for (let index = 0; index < description.length; index++) {
        const itemName = description[index];
        const prix = montant[index];

        const obj = {
          timeStamp: Date.now(),
          loanFileKey: loanFileKey,
          type: type,
          description: itemName,
          montant: prix,
        };
        // add object to array
        objArr.push(obj);
      }

      if (objArr.length > 0) {
        const doc_cursor = await db.query(aql`FOR o IN ${objArr} 
        INSERT o INTO loan_budget_familial RETURN NEW`);
        if (doc_cursor.hasNext) {
          return "SUCCESS";
        } else {
          throw new Error(`Erreur lors de la création du budget familial`);
        }
      } else {
        throw new Error(
          `Erreur lors de la composition des éléments. Essayez de nouveau`
        );
      }
    } else {
      throw new Error(`Vous devez renseigner au moins un élément`);
    }
  },

  loanBudgetUpdate: async ({ docKey, type, description, montant }) => {
    const obj = {
      type: type,
      description: description,
      montant: montant,
    };
    const doc_cursor = await db.query(aql`UPDATE ${docKey} 
      WITH ${obj} IN loan_budget_familial RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      throw new Error(`Erreur lors de la mise à jour du budget familial`);
    }
  },

  loanBudgetDelete: async ({ docKey }) => {
    const doc_cursor = await db.query(aql`FOR e IN loan_budget_familial 
    FILTER e._key == ${docKey} REMOVE ${docKey} 
    IN loan_budget_familial RETURN OLD`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      throw new Error(`Erreur lors de la suppression du budget familial`);
    }
  },
};

export default loanBudgetResolver;
