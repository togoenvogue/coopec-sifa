import sql from "mssql";
import dotenv from "dotenv";
// connect the .env file
dotenv.config();
// https://github.com/debugmodedotnet/sqlservernodejsrestapi/blob/master/dboperations.js

const clientResolver = {
  // recuperer un client individuel,
  // son historique de credit et son solde
  clientByCodeSig: async ({
    codeSig,
    dbIp,
    dbName,
    dbUser,
    dbPass,
    dbPort,
  }) => {
    let data = [];
    //console.log(`codeSig: ${codeSig} > dbIp:${dbIp} > dbName:${dbName} > dbUser:${dbUser} > dbPass:${dbPass}`);

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
      //port: 49172,
    };

    // 023A06 -> beneficaiire
    // connect to the database
    var sqlConn = await sql.connect(sqlConfig);
    // make sure the connexion is established successfuly
    if (sqlConn["_connected"] == true) {
      // query
      const results = await sql.query(`SELECT NUM_MEMBRE, NOM, PRENOM,  
        SEXE, CARTE, DTYPE, ETAT, CODE_TIERS, agence FROM membres 
        WHERE NUM_MEMBRE = '${codeSig}' AND ETAT = 'ACTIF'`);

      // console.log(`${codeSig}: ${results.recordset}`);
      if (results.recordset.length > 0) {
        let records = results.recordset;
        for (let index = 0; index < records.length; index++) {
          const r = records[index];
          let sold = 0;
          let credits = [];

          const _gender = r.SEXE == "M" ? "Homme" : "Femme";

          //if (r.DTYPE == "MembrePhysique") {
          // select solde
          const solde_query =
            await sql.query(`SELECT sum(MONTANTDEBIT)-sum(MONTANTCREDIT) AS SOLDE, 
              COMPTE_EP.NUMCOMPTE FROM EPARGNE EPG, 
              COMPTEEPS COMPTE_EP WHERE EPG.compteEps = COMPTE_EP.NUMCOMPTE 
              AND COMPTE_EP.membre = '${r.NUM_MEMBRE}'
              AND COMPTE_EP.NUMCOMPTE LIKE '%E%'
              GROUP BY COMPTE_EP.NUMCOMPTE`);
          //console.log(`rec: ${typeof solde_query.recordsets[0][0]}`);
          if (
            solde_query.recordsets.length > 0 &&
            solde_query.recordsets[0][0] != undefined
          ) {
            sold = solde_query.recordsets[0][0].SOLDE;
          }

          // select previous credits
          const credits_query = await sql.query(`SELECT NUMDEMANDE, Numdossier, 
              MONTANTPRET, NUMMEMBRE, NUM_CREDIT, 
              DUREEPRET, DATEDEMANDE, FINREMBOURSE, DATEDEBLOCAGE
              FROM credits WHERE NUMMEMBRE = '${r.NUM_MEMBRE}' 
              ORDER BY DATEDEBLOCAGE ASC`);
          //console.log(`${r.NUMMEMBRE} > ${r.NOM} ${r.PRENOM}`);
          //console.log(credits_query.recordset);
          if (credits_query.recordset.length > 0) {
            for (let cix = 0; cix < credits_query.recordset.length; cix++) {
              const cred = credits_query.recordset[cix];
              if (cred.DATEDEBLOCAGE != null) {
                //var d = new Date(cred.DATEDEBLOCAGE).getTime();
                //console.log(`Deblocage: ${d}`);
                const credObj = {
                  dateDemande: new Date(cred.DATEDEBLOCAGE).getTime(),
                  dateCloture: new Date(cred.FINREMBOURSE).getTime(),
                  duree: cred.DUREEPRET,
                  montant: cred.MONTANTPRET,
                  numero: cred.NUMDEMANDE,
                  cycle: cix + 1,
                };
                credits.push(credObj);
                //console.log(`physique: ${credObj});
              }
            }
          } // end for loop previous credits
          //} // end personne physique

          // build object
          const obj = {
            fullName: `${r.NOM} ${r.PRENOM}`,
            groupName: null,
            groupRef: "00",
            codeSig: `${r.NUM_MEMBRE}`,
            codeTiers: null,
            idPersonne: null,
            codeAgence: r.agence,
            personne: r.DTYPE, // r.DTYPE = MembrePhysique
            sexe: _gender,
            poste: null,
            soldeEpargne: sold,
            prevSigLoans: credits,
          };
          data.push(obj);
        } // end for loop
        // close the connexion
        //console.log(data);
        sqlConn.close();
        return data;
      } else {
        return [];
      }
    } else {
      throw new Error(`Erreur de connexion à la base de données SQL`);
    }
  },
};

export default clientResolver;
