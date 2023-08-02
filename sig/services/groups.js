import sql from "mssql";
import dotenv from "dotenv";
// connect the .env file
dotenv.config();

// https://github.com/debugmodedotnet/sqlservernodejsrestapi/blob/master/dboperations.js

const groupResolver = {
  // recuperer un groupement avec la liste des membres
  // l'historique de credit et le solde du groupement
  groupByCodeSig: async ({ codeSig, dbIp, dbName, dbUser, dbPass, dbPort }) => {
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
      const results = await sql.query(`SELECT membres.agence, 
      membres.NUM_MEMBRE, membres.raison_sociale, 
      membres.DTYPE, membres.ETAT
      FROM membres WHERE NUM_MEMBRE = '${codeSig}' 
      AND DTYPE = 'Groupement'`);

      // console.log(`${codeSig}: ${results.recordset}`);
      if (results.recordset.length > 0) {
        let records = results.recordset;
        for (let index = 0; index < records.length; index++) {
          const r = records[index];
          let groupUsers = [];
          let sold = 0;
          let credits = [];

          if (r.DTYPE == "Groupement") {
            // select previous credits
            const credits_query =
              await sql.query(`SELECT NUMDEMANDE, Numdossier, 
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
                }
              }
            } // end for loop previous credits

            // select group members
            const grpMembers_query =
              await sql.query(`SELECT personne.idPersonne, 
              personne.DTYPE, personne.ACTIF, 
              personne.nomPersonne, personne.sexe, 
              MEMBREGROUPE.CODE_TIERS, MEMBREGROUPE.POSTEOCCUPE,
              membres.raison_sociale FROM personne 
              INNER JOIN MEMBREGROUPE ON MEMBREGROUPE.CODE_TIERS = personne.CODE_TIERS 
              INNER JOIN membres ON membres.NUM_MEMBRE = personne.membre
              WHERE personne.membre = '${r.NUM_MEMBRE}' 
              AND personne.ACTIF = 1 ORDER BY personne.nomPersonne ASC`);

            // loop though group members
            if (grpMembers_query.recordset.length > 0) {
              let members = grpMembers_query.recordset;
              for (let uix = 0; uix < members.length; uix++) {
                const sub = members[uix];
                // group member object
                const subObj = {
                  codeAgence: r.agence,
                  groupName: r.raison_sociale,
                  groupRef: r.NUM_MEMBRE,
                  fullName: sub.nomPersonne,
                  idPersonne: sub.idPersonne,
                  codeSig: sub.idPersonne.toString().replaceAll("_", "/"),
                  codeTiers: sub.CODE_TIERS,
                  personne: sub.DTYPE,
                  sexe: sub.sexe == "M" ? "Homme" : "Femme",
                  poste: sub.POSTEOCCUPE,
                  soldeEpargne: 0,
                  prevSigLoans: [],
                };
                // add to the array
                groupUsers.push(subObj);
              } // end for loop
            } // end if group user found

            // selection du solde
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
          } // end Groupement

          // build object
          const obj = {
            groupName: `${r.raison_sociale}`,
            groupRef: `${r.NUM_MEMBRE}`,
            codeAgence: r.agence,
            groupUsers: groupUsers,
            soldeEpargne: sold,
            prevSigLoans: credits,
          };
          data.push(obj);
        } // end for loop
        // close the connexion
        sqlConn.close();
        //console.log(data);
        return data;
      } else {
        return [];
      }
    } else {
      throw new Error(`Erreur de connexion à la base de données SQL`);
    }
  },
};

export default groupResolver;
