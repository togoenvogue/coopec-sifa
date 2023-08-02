import { aql, db, serverAppUrl } from "../../../db/arangodb.js";

const pdfFileResolver = {
  pdfFileCreate: async ({ uploadedFile, description, loanKey }) => {
    const obj = {
      timeStamp: Date.now(),
      loanKey: loanKey,
      fileName: uploadedFile,
      fileDesc: description,
    };

    const create_cursor = await db.query(aql`INSERT ${obj} 
    INTO loan_pdf RETURN NEW`);
    if (create_cursor.hasNext) {
      return "SUCCESS";
    } else {
      throw new Error(`Une erreur s'est produite lors de la sauvegarde du PDF`);
    }
  },

  pdfFileDelete: async ({ pdfKey, pdfFile }) => {
    // delete the PDF file
    const del = await axios.post(`${serverAppUrl}/api/deleteFile`, {
      file: pdfFile,
    });
    if (del.data == "OK") {
      // delte from db
      const delete_cursor = await db.query(aql`REMOVE ${pdfKey} 
        IN loan_pdf RETURN OLD`);
      if (delete_cursor.hasNext) {
        return "SUCCESS";
      } else {
        throw new Error(
          `Une erreur s'est produite lors de la suppression du fichier PDF`
        );
      }
    } else {
      throw new Error(
        `Une erreur s'est produite lors de la suppression du fichier PDF`
      );
    }
  },

  pdfFiles: async ({ loanKey }) => {
    const docs_cursor = await db.query(aql`FOR p IN loan_pdf 
    FILTER p.loanKey == ${loanKey} SORT p.timeStamp DESC RETURN p`);
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return { ...doc };
      });
    } else {
      return [];
    }
  },
};

export default pdfFileResolver;
