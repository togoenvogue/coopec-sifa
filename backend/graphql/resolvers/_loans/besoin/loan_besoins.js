import { aql, db } from "../../../../db/arangodb.js";

const loanBesoinsResolver = {
  loanBesoinsCreate: async ({
    loanFileKey,
    productType,
    designation,
    quantity,
    prixUnit,
    total,
  }) => {
    if (designation.length > 0) {
      var objArr = [];

      for (let index = 0; index < designation.length; index++) {
        const itemName = designation[index];
        const type = productType[index];
        const qty = quantity[index];
        const tot = total[index];
        const prix = prixUnit[index];

        const obj = {
          timeStamp: Date.now(),
          loanFileKey: loanFileKey,
          productType: type,
          designation: itemName,
          quantity: qty,
          prixUnit: prix,
          total: tot,
        };
        // add object to array
        objArr.push(obj);
      }

      if (objArr.length > 0) {
        const doc_cursor = await db.query(aql`FOR o IN ${objArr} 
        INSERT o INTO loan_besoin RETURN NEW`);
        if (doc_cursor.hasNext) {
          const doc = await doc_cursor.next();
          return { ...doc };
        } else {
          throw new Error(
            `Erreur lors de la création de la destination du crédit`
          );
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

  loanBesoinsUpdate: async ({
    docKey,
    tproductType,
    designation,
    quantity,
    prixUnit,
    total,
  }) => {
    const obj = {
      tproductType: tproductType,
      designation: designation,
      quantity: quantity,
      prixUnit: prixUnit,
      total: total,
    };
    const doc_cursor = await db.query(aql`UPDATE ${docKey} 
      WITH ${obj} IN loan_besoin RETURN NEW`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return { ...doc };
    } else {
      throw new Error(`Erreur lors de la mise à jour du besoin`);
    }
  },

  loanBesoinsDelete: async ({ docKey }) => {
    const doc_cursor = await db.query(aql`FOR e IN loan_besoin
    FILTER e._key == ${docKey} REMOVE ${docKey} 
    IN loan_besoin RETURN OLD`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return { ...doc };
    } else {
      throw new Error(`Erreur lors de la suppression du besoin`);
    }
  },
};

export default loanBesoinsResolver;
