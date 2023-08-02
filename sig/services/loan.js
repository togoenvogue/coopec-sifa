/*
SELECT TOP 1 * FROM credits 
WHERE NUMMEMBRE = '20103312'
ORDER BY DATEDEBLOCAGE DESC
*/

import sql from "mssql";
import dotenv from "dotenv";
// connect the .env file
dotenv.config();

// https://github.com/debugmodedotnet/sqlservernodejsrestapi/blob/master/dboperations.js

const loanResolver = {
  // recuperer le dernier credit
  // d'un client individuel ou d'un groupement
  getLatestLoan: async ({
    dbIp,
    dbName,
    dbUser,
    dbPass,
    dbPort,
    codeSig,
    isCreditIndividuel,
  }) => {
    /*console.log(
      `id: ${dbIp}, dbName: ${dbName}, dbUser: ${dbUser}, dbPass: ${dbPass}, codeSig: ${codeSig}, isCreditIndividual: ${isCreditIndividuel}`
    );*/

    // connexion config
    const sqlConfig = {
      user: dbUser,
      password: dbPass,
      database: dbName,
      debug: true,
      server: dbIp,
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 120000,
      },
      options: {
        trustedConnection: true,
        enableArithAbort: true,
        encrypt: false,
      },
      port: dbPort,
      //port: 1433,
      //port: 49172,
    };

    // 023A06 -> beneficaiire
    // connect to the database
    var sqlConn = await sql.connect(sqlConfig);
    // make sure the connexion is established successfuly
    if (sqlConn["_connected"] == true) {
      // query
      const results = await sql.query(`SELECT TOP 1 * FROM credits 
        WHERE NUMMEMBRE = '${codeSig}'
        ORDER BY DATEDEBLOCAGE DESC`);

      if (results.recordset.length == 1) {
        let records = results.recordset;
        const cred = records[0];
        const data = {
          amount: cred.montantdmd,
          dateDeblocage: new Date(cred.DATEDEBLOCAGE).getTime(),
          numeroDemande: cred.Numdossier,
          numeroCredit: cred.NUM_CREDIT,
          numeroMembre: cred.NUMMEMBRE,
          deblocage: cred.deblocage,
        };
        //console.log(data);
        return data;
      } else {
        return "NO_DATA";
      }
    } else {
      // connection error
      throw new Error(`Erreur de connexion à la base de données SQL`);
    }
  },
};

export default loanResolver;
