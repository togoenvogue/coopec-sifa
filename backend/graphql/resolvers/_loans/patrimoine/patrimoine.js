import { aql, db } from "../../../../db/arangodb.js";

const loanPatrimoineResolver = {
  loanPatrimoineCreate: async ({
    loanFileKey,
    type,
    category,
    description,
    montant,
  }) => {
    if (description.length > 0) {
      var objArr = [];

      for (let index = 0; index < description.length; index++) {
        const itemName = description[index];
        const prix = montant[index];
        const categ = category[index];

        const obj = {
          timeStamp: Date.now(),
          loanFileKey: loanFileKey,
          category: categ,
          type: type,
          description: itemName,
          montant: prix,
        };
        // add object to array
        objArr.push(obj);
      }

      if (objArr.length > 0) {
        const doc_cursor = await db.query(aql`FOR o IN ${objArr} 
        INSERT o INTO loan_patrimoine RETURN NEW`);
        if (doc_cursor.hasNext) {
          return "SUCCESS";
        } else {
          throw new Error(`Erreur lors de la création du patrimoine`);
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

  loanPatrimoineUpdate: async ({
    docKey,
    type,
    category,
    description,
    montant,
  }) => {
    const obj = {
      category: category,
      type: type,
      description: description,
      montant: montant,
    };
    const doc_cursor = await db.query(aql`UPDATE ${docKey} 
      WITH ${obj} IN loan_patrimoine RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      throw new Error(`Erreur lors de la mise à jour du patrimoine`);
    }
  },

  loanPatrimoineDelete: async ({ docKey }) => {
    console.log(docKey);
    const doc_cursor = await db.query(aql`FOR e IN loan_patrimoine
    FILTER e._key == ${docKey} REMOVE ${docKey} 
    IN loan_patrimoine RETURN OLD`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      throw new Error(`Erreur lors de la suppression du patrimoine`);
    }
  },
};

export default loanPatrimoineResolver;
