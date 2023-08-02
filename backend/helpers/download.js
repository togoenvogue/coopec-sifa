import { aql, db, serverAppUrl } from "../db/arangodb.js";
import fs from "fs";
import { getOfficeDoc, getRoleDoc } from "../helpers/joindocs.js";

const downloadResolver = {
  exportAndDownloadFile: async ({
    fileType,
    fileSeparator,
    fileDocument,
    varArr,
  }) => {
    let sepr;
    //const sepr = fileSeparator == "VIRG" ? "," : ";";
    switch (fileSeparator) {
      case "VIRG":
        sepr = ",";
        break;
      case "PVIRG":
        sepr = ";";
        break;
      case "TAB":
        sepr = "\t";
        break;

      default:
        break;
    }

    if (fileDocument == "users") {
      const projectKey = varArr[0];
      const companyKey = varArr[1];

      const data_cursor = await db.query(
        aql`FOR u IN user FILTER LENGTH(u.accessObjects[* 
            FILTER CURRENT.projectKey == ${projectKey} 
            AND CURRENT.companyKey == ${companyKey} ]) 
          SORT u.lastName ASC RETURN u`,
        { fullCount: true },
        { count: true }
      );

      if (data_cursor.hasNext) {
        const data = await data_cursor.all();

        const fileName = Date.now() + "_utilisateurs";
        // BAGUES;Bague's en or;4110000;Rue tÍte dOr;BP 65993;Metz;Lorraine;France;06 65 87 00 00
        if (fileType == "CSV") {
          var txtStream = fs.createWriteStream(
            `./public_download/${fileName}.csv`
          );

          txtStream.once("open", async function () {
            txtStream.write(
              `NOM${sepr}PRÉNOM${sepr}USERNAME${sepr}ADRESSE EMAIL${sepr}RÔLE${sepr}ANTENNE${sepr}ACCÈS\n`
            );
            // wring contacts
            for (let index = 0; index < data.length; index++) {
              const d = data[index];

              const rl = await getRoleDoc({
                roleKey: d.accessObjects[0].roleKey,
              });
              const offs = await getOfficeDoc({
                officeKey: d.accessObjects[0].officeKey,
              });
              const fname = d.firstName;
              const lname = d.lastName;
              const username = d.username;
              const email = d.email;
              const access = d.accessObjects[0].accessLevel;
              const role = rl.label;
              const office = offs.officeName;

              txtStream.write(
                `${lname}${sepr}${fname}${sepr}${username}${sepr}${email}${sepr}${role}${sepr}${office}${sepr}Niveau ${access}\n`
              );
            }
            txtStream.end();
          });
          const url = `${serverAppUrl}/public_download/${fileName}.csv`;
          return url;
        }
      } else {
        return `NO_DATA_FOUND`;
      }
    }
  },
};

export default downloadResolver;
