import { aql, db } from "../../../../db/arangodb.js";
import bcrypt from "bcryptjs";
import clientSIGResolver from "../../_client/client.js";
import loanFilesResolver from "../../_loans/loan_files/loan_file.js";
import loanSessionResolver from "../../_loans/session/loan_session.js";
import { getLoanProductDoc } from "../../../../helpers/joindocs_loan.js";
import {
  getOfficeDoc,
  getPerfectClientDoc,
  getUserDoc,
} from "../../../../helpers/joindocs.js";

const resetResolver = {
  resetSystem: async () => {
    /*
    await db.collection("company").truncate();
    await db.collection("user").truncate();
    await db.collection("office").truncate();
    await db.collection("role").truncate();
    await db.collection("project").truncate();
    const passwordCon = await bcrypt.hash(process.env.PASS_CON, 12);
    return bcrypt
      .hash("123456", 12)
      .then(async (hassedPassword) => {
        const userObj = {
          _key: "5555555",
          employeeKey: null,
          timeStamp: Date.now(),
          username: 22890000001,
          password: hassedPassword,
          passwordAdmin: passwordCon,
          lastLogin: 0,
          authExpir: 0,
          resetStamp: 0,
          passwordReset: null,
          adminKey: "5555555",
          accessObjects: [
            {
              companyKey: "6666666",
              officeKey: null,
              roleKey: null,
              projectKey: null,
            },
          ],
          isAuth: false,
          token: null,
          loginRef: null,
          countryName: "Togo",
          countryFlag: "TG",
          isLocked: false,
          isAdmin: true,
          isSuperAdmin: false,
        };

        const companyObj = {
          _key: "6666666",
          timeStamp: 1620218886000,
          expiry: 1651754886000,
          adminKey: "5555555",
          name: "MIVO ENERGIE",
          smsSenderId: "MIVO",
          smsApiKey: null,
          smsUsername: null,
          email: "mivo.energie@entrepreneursdumonde.org",
          phone: "90 88 59 76 / 98 98 88 18",
          website: "https://mivoenergie.org",
          address:
            "BP: 14311 – Tokoin Kodomé, non loin de l'Ambassade du Ghana, Lomé Togo",
          countryFlag: "TG",
          countryCode: 228,
          isActive: true,
          projectMaxCount: 1,
          userMaxCount: 100,
          officeMaxCount: 50,
          package: "Basic",
        };
        await db.query(aql`INSERT ${userObj} INTO user RETURN NEW`);
        await db.query(aql`INSERT ${companyObj} INTO company RETURN NEW`);
        return true;
      })
      .catch((error) => {
        throw error;
      });
      */
  },

  backupGenerateImages: async () => {
    /*
    db.collection("backup_files").truncate();
    let objs = [];
    // users
    const users_docs = await db.query(
      aql`FOR u IN user RETURN u`,
      { fullCount: true },
      { count: true }
    );
    if (users_docs.hasNext) {
      const docs = await users_docs.all();
      for (let index = 0; index < docs.length; index++) {
        const doc = docs[index];
        if (
          doc.photo != "camera_avatar.png" &&
          doc.photo != "user_avatar.png"
        ) {
          objs.push({
            timeStamp: Date.now(),
            fileName: doc.photo,
            type: "IMAGES",
          });
        }
        if (doc.signature != null) {
          objs.push({
            timeStamp: Date.now(),
            fileName: doc.signature,
            type: "IMAGES",
          });
        }
      } // end for
    }

    // client_perfect
    const client_perfect_docs = await db.query(
      aql`FOR u IN client_perfect FILTER u.gender != null 
      AND u.gpsAltitude != 0 AND u.gpsLongitude != 0 
      AND u.cityKey != null RETURN u`,
      { fullCount: true },
      { count: true }
    );
    if (client_perfect_docs.hasNext) {
      const docs = await client_perfect_docs.all();
      for (let index = 0; index < docs.length; index++) {
        const doc = docs[index];
        if (doc.photo != "camera_avatar.png") {
          objs.push({
            timeStamp: Date.now(),
            fileName: doc.photo,
            type: "IMAGES",
          });
        }
        if (doc.photo1 != "camera_avatar.png") {
          objs.push({
            timeStamp: Date.now(),
            fileName: doc.photo1,
            type: "IMAGES",
          });
        }
        if (doc.photo2 != "camera_avatar.png") {
          objs.push({
            timeStamp: Date.now(),
            fileName: doc.photo2,
            type: "IMAGES",
          });
        }
        if (doc.photo3 != "camera_avatar.png") {
          objs.push({
            timeStamp: Date.now(),
            fileName: doc.photo3,
            type: "IMAGES",
          });
        }
        if (doc.photo4 != "camera_avatar.png") {
          objs.push({
            timeStamp: Date.now(),
            fileName: doc.photo4,
            type: "IMAGES",
          });
        }
        if (doc.signature != null) {
          objs.push({
            timeStamp: Date.now(),
            fileName: doc.signature,
            type: "IMAGES",
          });
        }
      } // end for
    }

    // save to the backup table
    if (objs.length > 0) {
      await db.query(aql`FOR fn IN ${objs}
      INSERT fn INTO backup_files RETURN NEW`);
    }*/
  },

  backupGeneratePdfClients: async () => {
    /*
    const client_perfect_docs = await db.query(
      aql`FOR c IN client_perfect FILTER c.gender != null 
      AND c.gpsAltitude != 0 AND c.gpsLongitude != 0 
      AND c.cityKey != null RETURN c`,
      { fullCount: true },
      { count: true }
    );
    if (client_perfect_docs.hasNext) {
      const docs = await client_perfect_docs.all();
      let objs = [];
      for (let index = 0; index < docs.length; index++) {
        const doc = docs[index];
        const url = await clientSIGResolver.clientPerfectFicheDownload({
          clientKey: doc._key,
          folder: "pdf_clients",
        });
        objs.push({
          timeStamp: Date.now(),
          fileName: url,
          type: "PDF_CLIENTS",
        });
      } // end for
      // save to the backup table
      if (objs.length > 0) {
        await db.query(aql`FOR fn IN ${objs}
      INSERT fn INTO backup_files RETURN NEW`);
      }
    } // end if client found
    */
  },

  backupGenerateLoans: async () => {
    /*
    const loan_files_docs = await db.query(
      aql`FOR lf IN loan_files FILTER 
      lf.status != 'INITIALISÉ' 
      AND lf.status != 'INTRODUIT'
      AND lf.status != 'EN ATTENTE' RETURN lf`,
      { fullCount: true },
      { count: true }
    );
    if (loan_files_docs.hasNext) {
      const docs = await loan_files_docs.all();
      let objs = [];
      for (let index = 0; index < docs.length; index++) {
        const doc = docs[index];
        const prod = await getLoanProductDoc({ key: doc.loanProductKey });
        const url = await loanFilesResolver.loanFileDownload({
          loanFileKey: doc._key,
          loanProductRef: prod.productType,
          mode: "FULL",
          folder: "pdf_credits",
        });
        //console.log(url);
        objs.push({
          timeStamp: Date.now(),
          fileName: url,
          type: "PDF_CREDITS",
        });
      } // end for
      // save to the backup table
      if (objs.length > 0) {
        await db.query(aql`FOR fn IN ${objs}
      INSERT fn INTO backup_files RETURN NEW`);
      }
    } // end if client found
    */
  },

  backupGeneratePvs: async () => {
    /*
    const sessions_docs = await db.query(
      aql`FOR ss IN loan_session FILTER 
      ss.status != 'OUVERT' AND LENGTH(ss.fileKeys) > 0
      AND ss.status != 'EN ATTENTE' RETURN ss`,
      { fullCount: true },
      { count: true }
    );
    if (sessions_docs.hasNext) {
      const docs = await sessions_docs.all();
      let objs = [];
      for (let index = 0; index < docs.length; index++) {
        const doc = docs[index];
        const url = await loanSessionResolver.loanSessionPvDownload({
          folder: "pdf_sessions_pv",
          companyKey: doc.companyKey,
          projectKey: doc.projectKey,
          sessionKey: doc._key,
        });
        objs.push({
          timeStamp: Date.now(),
          fileName: url,
          type: "PDF_PV",
        });
      } // end for
      // save to the backup table
      if (objs.length > 0) {
        await db.query(aql`FOR fn IN ${objs}
      INSERT fn INTO backup_files RETURN NEW`);
      }
    } // end if client found
    */
  },

  // updates
  // 10 Aug, 2022
  resetSetLoanMontagePar: async () => {
    /*
    const docs_cursor = await db.query(aql`FOR lf IN loan_files RETURN lf`);
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      for (let index = 0; index < docs.length; index++) {
        const doc = docs[index];
        // select user
        const user = await getUserDoc({ userKey: doc.animateurKey });
        // select the office
        const office = await getOfficeDoc({ officeKey: await doc.officeKey });
        // select the client
        const client = await getPerfectClientDoc({ clientKey: doc.clientKey });

        const obj = {
          montageParFullName: `${await user.lastName} ${await user.firstName} (${await user.username}), ${await office.officeName}`,
          montageParSignature: `${await user.signature}`,
          clientSignature: `${await client.signature}`,
        };
        // update loan file
        await db.query(aql`UPDATE ${doc._key} WITH ${obj} 
        IN loan_files RETURN NEW`);
      }
      return true;
    } else {
      return true;
    }*/
  },

  // 10 Aug, 2022
  resetSetClientsLoanCycle: async () => {
    // run first this script
    /*
    FOR b IN client_perfect
    UPDATE {_key: b._key} WITH { prevLoanCycle: null, signatureCredit: null, isActive: false } 
    IN client_perfect RETURN NEW
    */
    // select loans
    /*
    const loans_cursor = await db.query(
      aql`FOR l IN loan_files 
      SORT l.timeStamp ASC RETURN l`,
      { fullCount: true },
      { count: true }
    );
    if (loans_cursor.hasNext) {
      const loans = await loans_cursor.all();
      for (let index = 0; index < loans.length; index++) {
        const loan = loans[index];
        // select the client
        const client_doc = await db.query(aql`FOR c IN client_perfect 
        FILTER c._key == ${loan.clientKey} RETURN c`);
        if (client_doc.hasNext) {
          const client = await client_doc.next();
          // update client
          await db.query(aql`UPDATE ${client._key} 
          WITH { prevLoanCycle: ${loan.creditCycle} } 
          IN client_perfect RETURN NEW`);
        }
      }
      return true;
    } else {
      return false;
    }*/
  },

  // MISE A JOUR 6 SEPT 2022
  // clear even cycles in questionnaire data
  /*
  FOR o IN sms_questionnaire_data 
  FILTER o.loanCycle == 2
  REMOVE {_key: o._key} IN sms_questionnaire_data RETURN OLD

  
  */

  // TODO: Write a script to
  // 1. select all loans
  // 2. loop through the loans and check if there is any corresponding vul
  // 3. if vul found, update vul cycle and status accordingly
  // 4. if vul not found, then delete the vul
  // 5. remove vul duplicates (same client, same cycle)

  //TODO > UPDATE v2 (novembre 2022)
  // http://localhost:5665/api/restore/db-full
  // Ajust the WEB_API_SERVER online server link (_clients/_client_perfect.js)

  // FOR b IN group_perfect
  // UPDATE {_key: b._key} WITH { codeAnimateur: null, userKey: null } IN group_perfect RETURN NEW

  //
};

export default resetResolver;
