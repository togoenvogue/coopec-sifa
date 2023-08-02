import { aql, db } from "../../../../db/arangodb.js";

const loanAvisResolver = {
  loanAvisCreate: async ({ loanFileKey, message, userKey, nature }) => {
    const obj = {
      timeStamp: Date.now(),
      loanFileKey: loanFileKey,
      message: message,
      userKey: userKey,
      nature: nature,
    };

    const doc_cursor = await db.query(aql`INSERT ${obj} 
    INTO loan_avis RETURN NEW`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return "SUCCESS";
    } else {
      throw new Error(`Erreur lors de la création de l'avis`);
    }
  },
};

export default loanAvisResolver;
