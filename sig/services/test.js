import sql from "mssql";
import dotenv from "dotenv";
// connect the .env file
dotenv.config();

// https://github.com/debugmodedotnet/sqlservernodejsrestapi/blob/master/dboperations.js

const testResolver = {
  dbtest: async ({ dbIp, dbName, dbUser, dbPass }) => {
    console.log(
      `HOST: ${dbIp} > DB: ${dbName} > USER: ${dbUser} > PASS: ${dbPass}`
    );
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
      port: 1433,
      //port: 49172,
    };

    // 023A06 -> beneficaiire
    // connect to the database
    try {
      var sqlConn = await sql.connect(sqlConfig);
      // make sure the connexion is established successfuly
      if (sqlConn["_connected"] == true) {
        sqlConn.close();
        return `Bravo! La connexion à la base ${dbName} a été établie avec succès!`;
      } else {
        return `Erreur de connexion à la base SQL ${dbName}`;
      }
    } catch (error) {
      //console.log(error);
      return error.message;
    }
  },
};

export default testResolver;
