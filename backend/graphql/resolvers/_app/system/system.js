import {
  aql,
  db,
  serverAppUrl,
  serverSigUrl,
} from "../../../../db/arangodb.js";
import fs, { access } from "fs";
import os from "os";
import replaceall from "replaceall";
import axios from "axios";
import {
  getAccessObjDocs,
  getCityDoc,
  getCompanyDoc,
  getCountryDoc,
  getOfficeDoc,
  getPerfectClientCount,
  getProjectDoc,
  getRoleDoc,
  getUserDoc,
} from "../../../../helpers/joindocs.js";
import { getLoanExploitationSum } from "../../../../helpers/joindocs_loan.js";
import { downloadImage } from "../../../../helpers/download_image.js";

const appResolver = {
  getAppConfig: async () => {
    const app_cursor = await db.query(aql`FOR a IN app_config RETURN a`);
    if (app_cursor.hasNext) {
      const app = await app_cursor.next();
      return { ...app };
    } else {
      return {};
    }
  },

  resetApp: async ({ company }) => {
    if (company == "ASSILASSIME") {
      /*
      await db.collection("loan_files").truncate();
      await db.collection("loan_session").truncate();
      await db.collection("loan_session_chat").truncate();
      await db.collection("loan_activities").truncate();
      await db.collection("loan_avis").truncate();
      await db.collection("loan_besoin").truncate();
      await db.collection("loan_budget_familial").truncate();
      await db.collection("loan_exploitation").truncate();
      await db.collection("loan_suivi").truncate();
      await db.collection("loan_file_fonds").truncate();
      return true;*/
    } else if (company == "MIVO") {
      return false;
    }
  },

  syncInitDefaultToLocal: async ({ projectKey, companyKey, userKey }) => {
    // decalire default variables
    let fileUrls = [];
    let questionnaireKey; // fiche PAT
    const dirImage = `sync/images`;

    // create the user folder if it does not exist
    if (!fs.existsSync(dirImage)) {
      fs.mkdirSync(dirImage);
    }
    const dirName = `sync/user/${userKey}`;
    // create the image folder if it does not exist
    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName);
    }

    // app config
    const appconfig_cursor = await db.query(aql`FOR a IN app_config RETURN a`);
    if (appconfig_cursor.hasNext) {
      const data = await appconfig_cursor.next();
      const configUrl = `${dirName}/app_config.json`;
      // write to file
      fs.writeFileSync(configUrl, JSON.stringify(data, null, 2), () => {});
      // add to the file urls array
      fileUrls.push(`${serverAppUrl}/${configUrl}`);
    }

    // loan_session_levels
    const sslev_cursor = await db.query(
      aql`FOR a IN loan_session_levels RETURN a`
    );
    if (sslev_cursor.hasNext) {
      const data = await sslev_cursor.next();
      const sslvUrl = `${dirName}/loan_session_levels.json`;
      // write to file
      fs.writeFileSync(sslvUrl, JSON.stringify(data, null, 2), () => {});
      // add to the file urls array
      fileUrls.push(`${serverAppUrl}/${sslvUrl}`);
    }

    // countries
    const countries_cursor = await db.query(
      aql`FOR c IN country 
      SORT c.countryName ASC RETURN c`,
      { fullCount: true },
      { count: true }
    );
    if (countries_cursor.hasNext) {
      const records = await countries_cursor.all();
      let data = [];
      for (let cinx = 0; cinx < records.length; cinx++) {
        let ctry = records[cinx];
        ctry.fullCount = await countries_cursor.extra.stats.fullCount;
        data.push(ctry);
      }
      const countryUrl = `${dirName}/country.json`;
      // write to file
      fs.writeFileSync(countryUrl, JSON.stringify(data, null, 2), () => {});
      // add to the file urls array
      fileUrls.push(`${serverAppUrl}/${countryUrl}`);
    }

    // cities
    const cities_cursor = await db.query(
      aql`FOR c IN city SORT c.cityName ASC RETURN c`,
      { fullCount: true },
      { count: true }
    );
    if (cities_cursor.hasNext) {
      const records = await cities_cursor.all();
      let data = [];
      for (let cinx = 0; cinx < records.length; cinx++) {
        let cti = records[cinx];
        cti.fullCount = await cities_cursor.extra.stats.fullCount;
        data.push(cti);
      }
      const cityUrl = `${dirName}/city.json`;
      // write to file
      fs.writeFileSync(cityUrl, JSON.stringify(data, null, 2), () => {});
      // add to the file urls array
      fileUrls.push(`${serverAppUrl}/${cityUrl}`);
    }

    // regions
    const regions_cursor = await db.query(
      aql`FOR c IN location_region SORT c.region ASC RETURN c`,
      { fullCount: true },
      { count: true }
    );
    if (regions_cursor.hasNext) {
      const records = await regions_cursor.all();
      let data = [];
      for (let cinx = 0; cinx < records.length; cinx++) {
        let rec = records[cinx];
        rec.fullCount = await regions_cursor.extra.stats.fullCount;
        data.push(rec);
      }
      const url = `${dirName}/location_region.json`;
      // write to file
      fs.writeFileSync(url, JSON.stringify(data, null, 2), () => {});
      // add to the file urls array
      fileUrls.push(`${serverAppUrl}/${url}`);
    }

    // prefectures
    const prefectues_cursor = await db.query(
      aql`FOR pref IN location_prefecture SORT pref.prefecture ASC RETURN pref`,
      { fullCount: true },
      { count: true }
    );
    if (prefectues_cursor.hasNext) {
      const records = await prefectues_cursor.all();
      let data = [];
      for (let cinx = 0; cinx < records.length; cinx++) {
        let rec = records[cinx];
        rec.fullCount = await prefectues_cursor.extra.stats.fullCount;
        data.push(rec);
      }
      const url = `${dirName}/location_prefecture.json`;
      // write to file
      fs.writeFileSync(url, JSON.stringify(data, null, 2), () => {});
      // add to the file urls array
      fileUrls.push(`${serverAppUrl}/${url}`);
    }

    // cantons
    const cantons_cursor = await db.query(
      aql`FOR cant IN location_canton SORT cant.canton ASC RETURN cant`,
      { fullCount: true },
      { count: true }
    );
    if (cantons_cursor.hasNext) {
      const records = await cantons_cursor.all();
      let data = [];
      for (let cinx = 0; cinx < records.length; cinx++) {
        let rec = records[cinx];
        rec.fullCount = await cantons_cursor.extra.stats.fullCount;
        data.push(rec);
      }
      const url = `${dirName}/location_canton.json`;
      // write to file
      fs.writeFileSync(url, JSON.stringify(data, null, 2), () => {});
      // add to the file urls array
      fileUrls.push(`${serverAppUrl}/${url}`);
    }

    // company
    const companies_cursor = await db.query(aql`FOR c IN company 
      FILTER c._key == ${companyKey} RETURN c`);
    if (companies_cursor.hasNext) {
      const data = await companies_cursor.all();
      data.fullCount = await companies_cursor.extra.stats.fullCount;

      const companyUrl = `${dirName}/company.json`;
      // write to file
      fs.writeFileSync(companyUrl, JSON.stringify(data, null, 2), () => {});
      // add to the file urls array
      fileUrls.push(`${serverAppUrl}/${companyUrl}`);
    } // END COMPANY

    // OFFICES
    const offices_cursor = await db.query(
      aql`FOR c IN office FILTER c.companyKey == ${companyKey} 
      AND c.projectKey == ${projectKey} SORT c.officeName ASC RETURN c`,
      { fullCount: true },
      { count: true }
    );
    if (offices_cursor.hasNext) {
      const data = await offices_cursor.all();
      data.fullCount = await offices_cursor.extra.stats.fullCount;

      const officeUrl = `${dirName}/office.json`;
      // write to file
      fs.writeFileSync(officeUrl, JSON.stringify(data, null, 2), () => {});
      // add to the file urls array
      fileUrls.push(`${serverAppUrl}/${officeUrl}`);
    } // END OFFICES

    // LOAN CATEGORIES
    const loan_categories_cursor = await db.query(
      aql`FOR c IN loan_categories FILTER c.companyKey == ${companyKey}
      AND c.projectKey == ${projectKey} RETURN c`,
      { fullCount: true },
      { count: true }
    );
    if (loan_categories_cursor.hasNext) {
      const data = await loan_categories_cursor.all();
      data.fullCount = await loan_categories_cursor.extra.stats.fullCount;

      const loanCategUrl = `${dirName}/loan_categories.json`;
      // write to file
      fs.writeFileSync(loanCategUrl, JSON.stringify(data, null, 2), () => {});
      // add to the file urls array
      fileUrls.push(`${serverAppUrl}/${loanCategUrl}`);
    } // END LOAN CATEGORIES

    // LOAN PRODUCTS
    const loan_products_cursor = await db.query(
      aql`FOR c IN loan_products 
      FILTER c.companyKey == ${companyKey} AND c.isActive == true
      AND c.projectKey == ${projectKey} RETURN c`,
      { fullCount: true },
      { count: true }
    );
    if (loan_products_cursor.hasNext) {
      const data = await loan_products_cursor.all();
      data.fullCount = await loan_products_cursor.extra.stats.fullCount;

      const loanProdUrl = `${dirName}/loan_products.json`;
      // write to file
      fs.writeFileSync(loanProdUrl, JSON.stringify(data, null, 2), () => {});
      // add to the file urls array
      fileUrls.push(`${serverAppUrl}/${loanProdUrl}`);
    } // END LOAN PRODUCTS

    // LOAN FILIERES
    const loan_filieres_cursor = await db.query(
      aql`FOR c IN loan_filieres FILTER c.companyKey == ${companyKey}  
      AND c.projectKey == ${projectKey} RETURN c`,
      { fullCount: true },
      { count: true }
    );
    if (loan_filieres_cursor.hasNext) {
      const data = await loan_filieres_cursor.all();
      data.fullCount = await loan_filieres_cursor.extra.stats.fullCount;

      const loanFilUrl = `${dirName}/loan_filieres.json`;
      // write to file
      fs.writeFileSync(loanFilUrl, JSON.stringify(data, null, 2), () => {});
      // add to the file urls array
      fileUrls.push(`${serverAppUrl}/${loanFilUrl}`);
    }
    // END LOAN FILIERES

    // MODULE
    const modules_cursor = await db.query(
      aql`FOR c IN module RETURN c`,
      { fullCount: true },
      { count: true }
    );
    if (modules_cursor.hasNext) {
      const data = await modules_cursor.all();
      data.fullCount = await modules_cursor.extra.stats.fullCount;

      const moduleUrl = `${dirName}/module.json`;
      // write to file
      fs.writeFileSync(moduleUrl, JSON.stringify(data, null, 2), () => {});
      // add to the file urls array
      fileUrls.push(`${serverAppUrl}/${moduleUrl}`);
    } // END MODULE

    // ROLE
    const roles_cursor = await db.query(
      aql`FOR c IN role FILTER c.projectKey == ${projectKey} 
      AND c.companyKey == ${companyKey} RETURN c`,
      { fullCount: true },
      { count: true }
    );
    if (roles_cursor.hasNext) {
      const data = await roles_cursor.all();
      data.fullCount = await roles_cursor.extra.stats.fullCount;

      const roleUrl = `${dirName}/role.json`;
      // write to file
      fs.writeFileSync(roleUrl, JSON.stringify(data, null, 2), () => {});
      // add to the file urls array
      fileUrls.push(`${serverAppUrl}/${roleUrl}`);
    } // END ROLE

    // PROJECT
    const project_cursor = await db.query(
      aql`FOR c IN project FILTER c._key == ${projectKey} 
      AND c.companyKey == ${companyKey} RETURN c`,
      { fullCount: true },
      { count: true }
    );
    if (project_cursor.hasNext) {
      const data = await project_cursor.next();
      questionnaireKey = data.loanQuestionnaireKey;
      const projUrl = `${dirName}/project.json`;
      // write to file
      fs.writeFileSync(projUrl, JSON.stringify(data, null, 2), () => {});
      // add to the file urls array
      fileUrls.push(`${serverAppUrl}/${projUrl}`);
    } // END PROJECT

    // USER
    const user_cursor = await db.query(aql`FOR c IN user 
      FILTER c._key == ${userKey} RETURN c`);
    if (user_cursor.hasNext) {
      let userArr = [];
      let userRecords = await user_cursor.all();
      for (let ui = 0; ui < userRecords.length; ui++) {
        let user = userRecords[ui];
        // set access levels
        let accessArray = [];
        for (let index = 0; index < user.accessObjects.length; index++) {
          const access = user.accessObjects[index];
          const acc = await getAccessObjDocs({
            companyKey: access.companyKey,
            officeKey: access.officeKey,
            projectKey: access.projectKey,
            roleKey: access.roleKey,
            accessLevel: access.accessLevel,
          });
          if (acc.companyKey != null) {
            accessArray.push(acc);
          }
        }
        //console.log(accessArray);
        if (accessArray.length > 0) {
          user.accessObjects = accessArray;
        }
        user.roleKey = await getRoleDoc({ roleKey: user.roleKey });
        user.officeKey = await getOfficeDoc({ officeKey: user.officeKey });
        user.companyKey = await getCompanyDoc({ companyKey: user.companyKey });
        user.projectKey = await getProjectDoc({ projectKey: user.projectKey });
        user.password = null;
        user.passwordAdmin = null;

        // user signature and picture
        if (user.signature != null) {
          fileUrls.push(`${serverAppUrl}/${dirImage}/${user.signature}`);
        }
        // create user photo link
        fileUrls.push(`${serverAppUrl}/${dirImage}/${user.photo}`);

        // push user to the user array
        userArr.push(user);
      }

      const userFileUrl = `${dirName}/user.json`;
      // write to file
      fs.writeFileSync(userFileUrl, JSON.stringify(userArr, null, 2), () => {});
      // add to the file urls array
      fileUrls.push(`${serverAppUrl}/${userFileUrl}`);

      // user session expiration file
      const sessExpirFileUrl = `${dirName}/session.json`;
      // write to file
      // 1 min = 60000 miliseconds
      fs.writeFileSync(
        sessExpirFileUrl,
        JSON.stringify(
          {
            loginStamp: Date.now(),
            expireStamp: Date.now() + 60000 * 15,
          },
          null,
          2
        ),
        () => {}
      );
      // add to the file urls array
      fileUrls.push(`${serverAppUrl}/${sessExpirFileUrl}`);
      // end user session expiration file
    } // END USER

    // remove duplicates from the urls
    const uniqueFileUrls = [...new Set(fileUrls)];
    //console.log(`uniqueFileUrls: ${uniqueFileUrls}`);
    // download the images
    for (let inxo = 0; inxo < uniqueFileUrls.length; inxo++) {
      const url = uniqueFileUrls[inxo];
      // check if the url contains an image
      const exts = url.substring(url.length - 4);
      if (exts != "json") {
        // extract the file name
        const fname = url.split("images/")[1];
        await downloadImage({
          uri: `${serverAppUrl}/public_upload/${fname}`,
          fileName: `./sync/images/${fname}`,
          callback: () => {},
        });
      }
    }
    // return unique urls
    return uniqueFileUrls;
  },

  syncDownloadFromTheServer: async ({
    companyKey,
    projectKey,
    officeKey,
    userKey,
    accessLevel,
    docName,
    docKey,
  }) => {
    if (docName == "download_group_by_code") {
      let fileUrls = [];
      const dirName = `sync/user/${userKey}`;
      const fileName = `groupes_sig.json`;
      const fileUrl = `${dirName}/${fileName}`;
      // create the folder if it does not exist
      if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName);
      }
      // select the group based on its code
      const select_cursor = await db.query(
        aql`FOR c IN groupes_sig FILTER c.projectKey == ${projectKey} 
        AND c.companyKey == ${companyKey} AND c.userKey == ${userKey} 
        AND c.groupCode == ${docKey} RETURN c`,
        { fullCount: true },
        { count: true }
      );
      if (select_cursor.hasNext) {
        const records = await select_cursor.all();

        let data = [];
        for (let index = 0; index < records.length; index++) {
          let record = records[index];
          record.fullCount = await select_cursor.extra.stats.fullCount;
          record.groupCount = await getPerfectClientCount({
            groupCode: record.groupCode,
            companyKey: companyKey,
            projectKey: projectKey,
          });
          // push to the array
          data.push(record);
        }
        // write to file
        fs.writeFileSync(fileUrl, JSON.stringify(data, null, 2), () => {});
        // add to the file urls array
        fileUrls.push(`${serverAppUrl}/${fileUrl}`);
      } else {
        // create an empty json file
        fs.writeFileSync(fileUrl, JSON.stringify({}, null, 2), () => {});
      } // end client group

      // remove duplicates from the urls
      const uniqueFileUrls = [...new Set(fileUrls)];
      // return unique urls
      return uniqueFileUrls;
    } else if (docName == "download_clients_by_group") {
      let fileUrls = [];
      const dirName = `sync/user/${userKey}`;
      const dirImage = `sync/images`;
      const clientUrl = `${dirName}/clients_sig.json`;
      const groupUrl = `${dirName}/groupes_sig.json`;
      let questionnaireKey;
      let clientsArr = [];
      // create new directories if they do not exist
      if (!fs.existsSync(dirImage)) {
        fs.mkdirSync(dirImage);
      }
      if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName);
      }

      // select the group
      const group_cursor = await db.query(aql`FOR g IN groupes_sig 
            FILTER g.groupCode == ${docKey} RETURN g`);
      if (group_cursor.hasNext) {
        let groupsArr = await group_cursor.all();
        groupsArr.fullCount = await group_cursor.extra.stats.fullCount;

        // write to file
        fs.writeFileSync(
          groupUrl,
          JSON.stringify(groupsArr, null, 2),
          () => {}
        );
        // add to the file urls array
        fileUrls.push(`${serverAppUrl}/${groupUrl}`);

        /*const _office = await getOfficeDoc({
          officeKey: groupsArr[0].officeKey,
        });*/

        // select the clients based on the group code
        const clients_cursor = await db.query(
          aql`FOR c IN clients_sig FILTER c.projectKey == ${projectKey} 
          AND c.companyKey == ${companyKey} AND c.animateurKey == ${userKey} 
          AND c.groupRef == ${docKey} AND c.isActive == true
          SORT c.fullName ASC RETURN c`,
          { fullCount: true },
          { count: true }
        );
        if (clients_cursor.hasNext) {
          let records = await clients_cursor.all();

          for (let cix = 0; cix < records.length; cix++) {
            let clt = records[cix];
            clt.fullCount = records.length;

            // pas besoin de verifier le solde des membres des groupements
            // request new data from the SIG
            /*const sigReq = await axios.post(
              `${serverSigUrl}/client-by-code-sig`,
              {
                codeSig: clt.codeSig,
                dbIp: _office.sigDBIp,
                dbName: _office.sigDBName,
                dbUser: _office.sigDBUser,
                dbPass: _office.sigDBPass,
                dbPort: _office.sigDBPort,
              }
            );

         
            if (sigReq.data.length > 0) {*/
            //var sigClt = await sigReq.data; // result from the SIG api
            //clt.soldeEpargne = sigClt[0].soldeEpargne;
            //clt.soldeDate = Date.now();

            // create the signature url if available
            if (clt.signature != null) {
              fileUrls.push(`${serverAppUrl}/${dirImage}/${clt.signature}`);
            }
            if (clt.fingerPrint != null) {
              fileUrls.push(`${serverAppUrl}/${dirImage}/${clt.fingerPrint}`);
            }
            // create images url
            if (clt.photo != "camera_avatar.png") {
              fileUrls.push(`${serverAppUrl}/${dirImage}/${clt.photo}`);
            }
            if (clt.photo1 != "camera_avatar.png") {
              fileUrls.push(`${serverAppUrl}/${dirImage}/${clt.photo1}`);
            }
            if (clt.photo2 != "camera_avatar.png") {
              fileUrls.push(`${serverAppUrl}/${dirImage}/${clt.photo2}`);
            }
            if (clt.photo3 != "camera_avatar.png") {
              fileUrls.push(`${serverAppUrl}/${dirImage}/${clt.photo3}`);
            }
            if (clt.photo4 != "camera_avatar.png") {
              fileUrls.push(`${serverAppUrl}/${dirImage}/${clt.photo4}`);
            }

            // push to the array
            clientsArr.push(clt);
            // }
          } // end for loop

          // write to file > clients_sig.json
          fs.writeFileSync(
            clientUrl,
            JSON.stringify(clientsArr, null, 2),
            () => {}
          );
          // add to the file urls array
          fileUrls.push(`${serverAppUrl}/${clientUrl}`);

          //
          // empty client found, create empty files
        } else {
          fileUrls.push(`${serverAppUrl}/${clientUrl}`); // clients_sig.json
          // write other empty files
          fs.writeFileSync(clientUrl, JSON.stringify([], null, 2), () => {}); // clients_sig.json
        } // end clients

        // select the project
        const project = await getProjectDoc({ projectKey: projectKey });
        questionnaireKey = project.loanQuestionnaireKey;

        // SMS QUESTIONNAIRES
        const sms_q_cursor = await db.query(
          aql`FOR c IN sms_questionnaires FILTER c.projectKey == ${projectKey} 
          AND c.companyKey == ${companyKey} AND c._key == ${questionnaireKey} RETURN c`,
          { fullCount: true },
          { count: true }
        );
        if (sms_q_cursor.hasNext) {
          const data = await sms_q_cursor.all();
          data.fullCount = await sms_q_cursor.extra.stats.fullCount;

          const smsQtUrl = `${dirName}/sms_questionnaires.json`;
          // write to file
          fs.writeFileSync(smsQtUrl, JSON.stringify(data, null, 2), () => {});
          // add to the file urls array
          fileUrls.push(`${serverAppUrl}/${smsQtUrl}`);
        } else {
          const smsQtUrl = `${dirName}/sms_questionnaires.json`;
          fs.writeFileSync(smsQtUrl, JSON.stringify([], null, 2), () => {});
          fileUrls.push(`${serverAppUrl}/${smsQtUrl}`);
        } // END SMS QUESTIONNAIRE

        // SMS QUESTIONNAIRES BLOCS
        const sms_blocks_cursor = await db.query(
          aql`FOR c IN sms_questionnaire_blocks FILTER c.projectKey == ${projectKey} 
          AND c.companyKey == ${companyKey} AND c.questionnaireKey == ${questionnaireKey} 
          SORT c.blockOrder ASC RETURN c`,
          { fullCount: true },
          { count: true }
        );
        if (sms_blocks_cursor.hasNext) {
          const data = await sms_blocks_cursor.all();
          data.fullCount = await sms_blocks_cursor.extra.stats.fullCount;

          const smsBlcUrl = `${dirName}/sms_questionnaire_blocks.json`;
          // write to file
          fs.writeFileSync(smsBlcUrl, JSON.stringify(data, null, 2), () => {});
          // add to the file urls array
          fileUrls.push(`${serverAppUrl}/${smsBlcUrl}`);
        } else {
          const smsBlcUrl = `${dirName}/sms_questionnaire_blocks.json`;
          fs.writeFileSync(smsBlcUrl, JSON.stringify([], null, 2), () => {});
          fileUrls.push(`${serverAppUrl}/${smsBlcUrl}`);
        } // END SMS QUESTIONNAIRES BLOCKS

        // SMS QUESTIONNAIRES OPTIONS
        const sms_options_cursor = await db.query(
          aql`FOR c IN sms_questionnaire_options 
          FILTER c.questionnaireKey == ${questionnaireKey} 
          SORT c.optionOrder ASC RETURN c`,
          { fullCount: true },
          { count: true }
        );
        if (sms_options_cursor.hasNext) {
          const data = await sms_options_cursor.all();
          data.fullCount = await sms_options_cursor.extra.stats.fullCount;
          // options
          const smsOpUrl = `${dirName}/sms_questionnaire_options.json`;
          // write to file
          fs.writeFileSync(smsOpUrl, JSON.stringify(data, null, 2), () => {});
          // add to the file urls array
          fileUrls.push(`${serverAppUrl}/${smsOpUrl}`);
        } else {
          const smsOpUrl = `${dirName}/sms_questionnaire_options.json`;
          fs.writeFileSync(smsOpUrl, JSON.stringify([], null, 2), () => {});
          fileUrls.push(`${serverAppUrl}/${smsOpUrl}`);
        } // END SMS QUESTIONNAIRES OPTIONS

        // SMS QUESTIONNAIRES DATA
        const sms_data_cursor = await db.query(
          aql`FOR c IN sms_questionnaire_data 
          FILTER c.questionnaireKey == ${questionnaireKey} 
          AND c.clientKey IN ${clientsArr} RETURN c`,
          { fullCount: true },
          { count: true }
        );
        if (sms_data_cursor.hasNext) {
          const data = await sms_data_cursor.all();
          data.fullCount = await sms_data_cursor.extra.stats.fullCount;
          // options
          const dataUrl = `${dirName}/sms_questionnaire_data.json`;
          // write to file
          fs.writeFileSync(dataUrl, JSON.stringify(data, null, 2), () => {});
          // add to the file urls array
          fileUrls.push(`${serverAppUrl}/${dataUrl}`);
        } else {
          const dataUrl = `${dirName}/sms_questionnaire_data.json`;
          fs.writeFileSync(dataUrl, JSON.stringify([], null, 2), () => {});
          fileUrls.push(`${serverAppUrl}/${dataUrl}`);
        } // END SMS QUESTIONNAIRES DATA

        // END
        // END
        // END
        // remove duplicates from the urls
        const uniqueFileUrls = [...new Set(fileUrls)];
        // download the images
        for (let inxo = 0; inxo < uniqueFileUrls.length; inxo++) {
          const url = uniqueFileUrls[inxo];
          // check if the url contains an image
          const exts = url.substring(url.length - 4);
          if (exts != "json") {
            // extract the file name
            const fname = url.split("images/")[1];
            await downloadImage({
              uri: `${serverAppUrl}/public_upload/${fname}`,
              fileName: `./sync/images/${fname}`,
              callback: () => {},
            });
          }
        }
        // return unique urls
        return uniqueFileUrls;
      } else {
        // no group found
        return [];
      }
    } else if (docName == "download_loan_by_key") {
      let fileUrls = [];
      const dirName = `sync/user/${userKey}`;
      const dirImage = `sync/images`;
      let questionnaireKey;
      let loansArr = [];
      let _loanKeys = [];
      let _clientKeys = [];
      let _groupCodes = [];
      let _groupKeys = [];
      let _groupClientKeys = [];

      //let _vulKeys = [];
      // create new directories if they do not exist
      if (!fs.existsSync(dirImage)) {
        fs.mkdirSync(dirImage);
      }
      if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName);
      }
      //console.log(docKey);
      // select the loan by _key
      const loans_cursor = await db.query(
        aql`FOR c IN loan_files FILTER c.projectKey == ${projectKey} 
        AND c.companyKey == ${companyKey} AND c._key == ${docKey} RETURN c`,
        { fullCount: true },
        { count: true }
      );
      if (loans_cursor.hasNext) {
        const loanRecords = await loans_cursor.all();

        // loop through the loan files
        for (let lnIdx = 0; lnIdx < loanRecords.length; lnIdx++) {
          let loan = loanRecords[lnIdx];
          loan.fullCount = await loans_cursor.extra.stats.fullCount;

          const animtKey = await getUserDoc({ userKey: loan.animateurKey });
          const revdBy = await getUserDoc({ userKey: loan.revisedBy });
          //loan.projectKey = await getProjectDoc({projectKey: loan.projectKey});

          // build signature and images url
          fileUrls.push(`${serverAppUrl}/${dirImage}/${animtKey["signature"]}`);
          fileUrls.push(
            `${serverAppUrl}/${dirImage}/${loan.signatureAgentCredit}`
          );
          if (loan.clientSignature != null) {
            fileUrls.push(
              `${serverAppUrl}/${dirImage}/${loan.clientSignature}`
            );
          }
          // build signature and images url
          fileUrls.push(`${serverAppUrl}/${dirImage}/${revdBy["signature"]}`);

          /*loan.totalCharges = await getLoanExploitationSum({
            loanFileKey: loan._key,
            type: "CHARGES",
          });
          loan.totalRecettes = await getLoanExploitationSum({
            loanFileKey: loan._key,
            type: "RECETTES",
          });*/

          // add the loan to the array
          loansArr.push(loan);
          _loanKeys.push(loan._key);
          if (loan.clientKey != "00") {
            _clientKeys.push(loan.clientKey);
          }
          if (loan.groupKey != "00") {
            _groupKeys.push(loan.groupKey);
          }
          if (loan.groupClientKeys.length > 0) {
            for (let i = 0; i < loan.groupClientKeys.length; i++) {
              _groupClientKeys.push(loan.groupClientKeys[i]);
            }
          }
        } // end for loop
        // generate the loan JSON files
        const loanFileUrl = `${dirName}/loan_files.json`;
        // write to file
        fs.writeFileSync(
          loanFileUrl,
          JSON.stringify(loansArr, null, 2),
          () => {}
        );
        // add to the file urls array
        fileUrls.push(`${serverAppUrl}/${loanFileUrl}`);

        // get the other files
        // _activityAgrKeys
        const agr_cursor = await db.query(
          aql`FOR c IN loan_activite_agr FILTER c.loanFileKey 
            IN ${_loanKeys} RETURN c`,
          { fullCount: true },
          { count: true }
        );
        if (agr_cursor.hasNext) {
          let data = await agr_cursor.all();
          data.fullCount = await agr_cursor.extra.stats.fullCount;
          const agrUrl = `${dirName}/loan_activite_agr.json`;
          fs.writeFileSync(agrUrl, JSON.stringify(data, null, 2), () => {});
          fileUrls.push(`${serverAppUrl}/${agrUrl}`);
        } else {
          const agrUrl = `${dirName}/loan_activite_agr.json`;
          fs.writeFileSync(agrUrl, JSON.stringify([], null, 2), () => {});
          fileUrls.push(`${serverAppUrl}/${agrUrl}`);
        }
        // _activityStockageKeys
        /*const stockage_cursor = await db.query(
          aql`FOR c IN loan_activite_stockage 
            FILTER c.loanFileKey IN ${_loanKeys} RETURN c`,
          { fullCount: true },
          { count: true }
        );
        if (stockage_cursor.hasNext) {
          let data = await stockage_cursor.all();
          data.fullCount = await stockage_cursor.extra.stats.fullCount;
          const stockUrl = `${dirName}/loan_activite_stockage.json`;
          fs.writeFileSync(stockUrl, JSON.stringify(data, null, 2), () => {});
          fileUrls.push(`${serverAppUrl}/${stockUrl}`);
        } else {
          const stockUrl = `${dirName}/loan_activite_stockage.json`;
          fs.writeFileSync(stockUrl, JSON.stringify([], null, 2), () => {});
          fileUrls.push(`${serverAppUrl}/${stockUrl}`);
        }*/

        // exploitations, CHARGES et RECETTES
        const exp_cursor = await db.query(
          aql`FOR c IN loan_exploitation 
            FILTER c.loanFileKey IN ${_loanKeys} RETURN c`,
          { fullCount: true },
          { count: true }
        );
        if (exp_cursor.hasNext) {
          let data = await exp_cursor.all();
          data.fullCount = await exp_cursor.extra.stats.fullCount;
          const expUrl = `${dirName}/loan_exploitation.json`;
          fs.writeFileSync(expUrl, JSON.stringify(data, null, 2), () => {});
          fileUrls.push(`${serverAppUrl}/${expUrl}`);
        } else {
          const expUrl = `${dirName}/loan_exploitation.json`;
          fs.writeFileSync(expUrl, JSON.stringify([], null, 2), () => {});
          fileUrls.push(`${serverAppUrl}/${expUrl}`);
        }

        // loan_budget_familial : DEPENSES et REVENUS
        const budget_cursor = await db.query(
          aql`FOR c IN loan_budget_familial 
            FILTER c.loanFileKey IN ${_loanKeys} RETURN c`,
          { fullCount: true },
          { count: true }
        );
        if (budget_cursor.hasNext) {
          let data = await budget_cursor.all();
          data.fullCount = await budget_cursor.extra.stats.fullCount;
          const budgUrl = `${dirName}/loan_budget_familial.json`;
          fs.writeFileSync(budgUrl, JSON.stringify(data, null, 2), () => {});
          fileUrls.push(`${serverAppUrl}/${budgUrl}`);
        } else {
          const budgUrl = `${dirName}/loan_budget_familial.json`;
          fs.writeFileSync(budgUrl, JSON.stringify([], null, 2), () => {});
          fileUrls.push(`${serverAppUrl}/${budgUrl}`);
        }

        // patrimoines
        const patrimoines_cursor = await db.query(
          aql`FOR c IN loan_patrimoine 
            FILTER c.loanFileKey IN ${_loanKeys} RETURN c`,
          { fullCount: true },
          { count: true }
        );
        if (patrimoines_cursor.hasNext) {
          let data = await patrimoines_cursor.all();
          data.fullCount = await patrimoines_cursor.extra.stats.fullCount;
          const patriUrl = `${dirName}/loan_patrimoine.json`;
          fs.writeFileSync(patriUrl, JSON.stringify(data, null, 2), () => {});
          fileUrls.push(`${serverAppUrl}/${patriUrl}`);
          // no images
        } else {
          const patriUrl = `${dirName}/loan_patrimoine.json`;
          fs.writeFileSync(patriUrl, JSON.stringify([], null, 2), () => {});
          fileUrls.push(`${serverAppUrl}/${patriUrl}`);
        }

        // cautions
        const cautions_cursor = await db.query(
          aql`FOR c IN loan_cautions 
            FILTER c.loanFileKey IN ${_loanKeys} RETURN c`,
          { fullCount: true },
          { count: true }
        );
        if (cautions_cursor.hasNext) {
          let data = await cautions_cursor.all();
          data.fullCount = await cautions_cursor.extra.stats.fullCount;
          const patriUrl = `${dirName}/loan_cautions.json`;
          fs.writeFileSync(patriUrl, JSON.stringify(data, null, 2), () => {});
          fileUrls.push(`${serverAppUrl}/${patriUrl}`);
          // add images
          for (let i = 0; i < data.length; i++) {
            if (data[i].signature != null) {
              fileUrls.push(`${serverAppUrl}/${dirImage}/${data[i].signature}`);
            }
            if (data[i].photo != "camera_avatar.png") {
              fileUrls.push(`${serverAppUrl}/${dirImage}/${data[i].photo}`);
            }
            if (data[i].photo1 != "camera_avatar.png") {
              fileUrls.push(`${serverAppUrl}/${dirImage}/${data[i].photo1}`);
            }
            if (data[i].photo2 != "camera_avatar.png") {
              fileUrls.push(`${serverAppUrl}/${dirImage}/${data[i].photo2}`);
            }
          }
        } else {
          const patriUrl = `${dirName}/loan_cautions.json`;
          fs.writeFileSync(patriUrl, JSON.stringify([], null, 2), () => {});
          fileUrls.push(`${serverAppUrl}/${patriUrl}`);
        }

        // gages
        const gages_cursor = await db.query(
          aql`FOR c IN loan_gages FILTER c.loanFileKey IN ${_loanKeys} RETURN c`,
          { fullCount: true },
          { count: true }
        );
        if (gages_cursor.hasNext) {
          let data = await gages_cursor.all();
          data.fullCount = await gages_cursor.extra.stats.fullCount;
          const gageUrl = `${dirName}/loan_gages.json`;
          fs.writeFileSync(gageUrl, JSON.stringify(data, null, 2), () => {});
          fileUrls.push(`${serverAppUrl}/${gageUrl}`);
          // add images
          for (let i = 0; i < data.length; i++) {
            if (data[i].signatureClient != null) {
              fileUrls.push(
                `${serverAppUrl}/${dirImage}/${data[i].signatureClient}`
              );
            }
            if (data[i].signatureAgent != null) {
              fileUrls.push(
                `${serverAppUrl}/${dirImage}/${data[i].signatureAgent}`
              );
            }
          }
        } else {
          const gageUrl = `${dirName}/loan_gages.json`;
          fs.writeFileSync(gageUrl, JSON.stringify([], null, 2), () => {});
          fileUrls.push(`${serverAppUrl}/${gageUrl}`);
        }

        // avis
        const avis_cursor = await db.query(
          aql`FOR c IN loan_avis FILTER c.loanFileKey IN ${_loanKeys} RETURN c`,
          { fullCount: true },
          { count: true }
        );
        if (avis_cursor.hasNext) {
          let data = await avis_cursor.all();
          data.fullCount = await avis_cursor.extra.stats.fullCount;
          const avisUrl = `${dirName}/loan_avis.json`;
          fs.writeFileSync(avisUrl, JSON.stringify(data, null, 2), () => {});
          fileUrls.push(`${serverAppUrl}/${avisUrl}`);
        } else {
          const avisUrl = `${dirName}/loan_avis.json`;
          fs.writeFileSync(avisUrl, JSON.stringify([], null, 2), () => {});
          fileUrls.push(`${serverAppUrl}/${avisUrl}`);
        }

        // besoins
        const besoins_cursor = await db.query(
          aql`FOR c IN loan_besoin FILTER c.loanFileKey IN ${_loanKeys} RETURN c`,
          { fullCount: true },
          { count: true }
        );
        if (besoins_cursor.hasNext) {
          let data = await besoins_cursor.all();
          data.fullCount = await besoins_cursor.extra.stats.fullCount;
          const besUrl = `${dirName}/loan_besoin.json`;
          fs.writeFileSync(besUrl, JSON.stringify(data, null, 2), () => {});
          fileUrls.push(`${serverAppUrl}/${besUrl}`);
        } else {
          const besUrl = `${dirName}/loan_besoin.json`;
          fs.writeFileSync(besUrl, JSON.stringify([], null, 2), () => {});
          fileUrls.push(`${serverAppUrl}/${besUrl}`);
        }

        // suivi ou visites
        const suivis_cursor = await db.query(
          aql`FOR c IN loan_suivi FILTER c.loanFileKey IN ${_loanKeys} RETURN c`,
          { fullCount: true },
          { count: true }
        );
        if (suivis_cursor.hasNext) {
          let data = await suivis_cursor.all();
          data.fullCount = await suivis_cursor.extra.stats.fullCount;
          const suiviUrl = `${dirName}/loan_suivi.json`;
          fs.writeFileSync(suiviUrl, JSON.stringify(data, null, 2), () => {});
          fileUrls.push(`${serverAppUrl}/${suiviUrl}`);

          // get users who made the visit
          for (let vi = 0; vi < data.length; vi++) {
            // add visites images
            if (vi.photo != null && vi.photo != "camera_avatar.png") {
              fileUrls.push(`${serverAppUrl}/${dirImage}/${vi.photo}`);
            }
            if (vi.photo1 != null && vi.photo1 != "camera_avatar.png") {
              fileUrls.push(`${serverAppUrl}/${dirImage}/${vi.photo1}`);
            }

            const ukey = data[vi]["adminKey"];
            const user_cursor = await db.query(aql`FOR c IN user 
            FILTER c._key == ${ukey} RETURN c`);
            if (user_cursor.hasNext) {
              let userRecords = await user_cursor.all();
              const userFileUrl = `${dirName}/user.json`;
              // write to file
              fs.writeFileSync(
                userFileUrl,
                JSON.stringify(userRecords, null, 2),
                () => {}
              );
              // add to the file urls array
              fileUrls.push(`${serverAppUrl}/${userFileUrl}`);
            } // END admin who made the visit
          } // end for loop
        } else {
          const suiviUrl = `${dirName}/loan_suivi.json`;
          fs.writeFileSync(suiviUrl, JSON.stringify([], null, 2), () => {});
          fileUrls.push(`${serverAppUrl}/${suiviUrl}`);
        }

        // select the client
        const clients_cursor = await db.query(
          aql`FOR c IN clients_sig FILTER c.projectKey == ${projectKey} 
          AND c.companyKey == ${companyKey} AND c._key IN ${_clientKeys} 
          OR 
          c.projectKey == ${projectKey} 
          AND c.companyKey == ${companyKey} AND c.groupRef IN ${_groupCodes}
          SORT c.fullName ASC RETURN c`,
          { fullCount: true },
          { count: true }
        );
        if (clients_cursor.hasNext) {
          let records = await clients_cursor.all();
          records.fullCount = await clients_cursor.extra.stats.fullCount;
          //let clientsArr = [];
          const clientUrl = `${dirName}/clients_sig.json`;
          for (let ccinx = 0; ccinx < records.length; ccinx++) {
            let clt = records[ccinx];
            // push to the array
            //clientsArr.push(clt);
            /*if (clt.groupRef != "00") {
              _groupCodes.push(clt.groupRef);
            }*/
            //_clientKeys.push(clt._key);
            // create the signature url if available
            if (clt.signature != null) {
              fileUrls.push(`${serverAppUrl}/${dirImage}/${clt.signature}`);
            }
            if (clt.fingerPrint != null) {
              fileUrls.push(`${serverAppUrl}/${dirImage}/${clt.fingerPrint}`);
            }
            // create photos urls
            if (clt.photo != "camera_avatar.png") {
              fileUrls.push(`${serverAppUrl}/${dirImage}/${clt.photo}`);
            }
            if (clt.photo1 != "camera_avatar.png") {
              fileUrls.push(`${serverAppUrl}/${dirImage}/${clt.photo1}`);
            }
            if (clt.photo2 != "camera_avatar.png") {
              fileUrls.push(`${serverAppUrl}/${dirImage}/${clt.photo2}`);
            }
            if (clt.photo3 != "camera_avatar.png") {
              fileUrls.push(`${serverAppUrl}/${dirImage}/${clt.photo3}`);
            }
            if (clt.photo4 != "camera_avatar.png") {
              fileUrls.push(`${serverAppUrl}/${dirImage}/${clt.photo4}`);
            }
          } // end for loop

          // write to file > clients_sig.json
          fs.writeFileSync(
            clientUrl,
            JSON.stringify(records, null, 2),
            () => {}
          );
          // add to the file urls array
          fileUrls.push(`${serverAppUrl}/${clientUrl}`);
        } else {
          const clientUrl = `${dirName}/clients_sig.json`;
          fs.writeFileSync(clientUrl, JSON.stringify([], null, 2), () => {});
          fileUrls.push(`${serverAppUrl}/${clientUrl}`);
        } // end client

        // client group
        const groups_cursor = await db.query(
          aql`FOR g IN groupes_sig FILTER g._key 
          IN ${_groupKeys} RETURN g`,
          { fullCount: true },
          { count: true }
        );
        if (groups_cursor.hasNext) {
          let data = await groups_cursor.all();
          data.fullCount = await groups_cursor.extra.stats.fullCount;
          const grpUrl = `${dirName}/groupes_sig.json`;
          fs.writeFileSync(grpUrl, JSON.stringify(data, null, 2), () => {});
          fileUrls.push(`${serverAppUrl}/${grpUrl}`);
        } else {
          const grpUrl = `${dirName}/groupes_sig.json`;
          fs.writeFileSync(grpUrl, JSON.stringify([], null, 2), () => {});
          fileUrls.push(`${serverAppUrl}/${grpUrl}`);
        }

        // clients

        // No loan found
      } else {
        throw new Error(
          `Erreur de sélection de la demande de crédit : ${docKey}`
        );
        const url_agr = `${dirName}/loan_activite_agr.json`;
        const url_stok = `${dirName}/loan_activite_stockage.json`;
        const url_avis = `${dirName}/loan_avis.json`;
        const url_besoin = `${dirName}/loan_besoin.json`;
        const url_budget = `${dirName}/loan_budget_familial.json`;
        const url_explt = `${dirName}/loan_exploitation.json`;
        const url_files = `${dirName}/loan_files.json`;
        const url_suivi = `${dirName}/loan_suivi.json`;
        const url_client = `${dirName}/clients_sig.json`;
        // write other empty files
        fs.writeFileSync(url_agr, JSON.stringify([], null, 2), () => {});
        fs.writeFileSync(url_stok, JSON.stringify([], null, 2), () => {});
        fs.writeFileSync(url_avis, JSON.stringify([], null, 2), () => {});
        fs.writeFileSync(url_besoin, JSON.stringify([], null, 2), () => {});
        fs.writeFileSync(url_budget, JSON.stringify([], null, 2), () => {});
        fs.writeFileSync(url_explt, JSON.stringify([], null, 2), () => {});
        fs.writeFileSync(url_files, JSON.stringify([], null, 2), () => {});
        fs.writeFileSync(url_suivi, JSON.stringify([], null, 2), () => {});
        fs.writeFileSync(url_client, JSON.stringify([], null, 2), () => {});
        // push empty files to the files array
        fileUrls.push(`${serverAppUrl}/${dirName}/loan_activite_agr.json`);
        fileUrls.push(`${serverAppUrl}/${dirName}/loan_activite_stockage.json`);
        fileUrls.push(`${serverAppUrl}/${dirName}/loan_avis.json`);
        fileUrls.push(`${serverAppUrl}/${dirName}/loan_besoin.json`);
        fileUrls.push(`${serverAppUrl}/${dirName}/loan_budget_familial.json`);
        fileUrls.push(`${serverAppUrl}/${dirName}/loan_exploitation.json`);
        fileUrls.push(`${serverAppUrl}/${dirName}/loan_files.json`);
        fileUrls.push(`${serverAppUrl}/${dirName}/loan_suivi.json`);
        fileUrls.push(`${serverAppUrl}/${dirName}/clients_sig.json`);
      }

      // select the project
      const project = await getProjectDoc({ projectKey: projectKey });
      questionnaireKey = project.loanQuestionnaireKey;

      // SMS QUESTIONNAIRES
      const sms_q_cursor = await db.query(
        aql`FOR c IN sms_questionnaires 
        FILTER c.projectKey == ${projectKey} 
        AND c.companyKey == ${companyKey} 
        AND c._key == ${questionnaireKey} RETURN c`,
        { fullCount: true },
        { count: true }
      );
      if (sms_q_cursor.hasNext) {
        const data = await sms_q_cursor.all();
        data.fullCount = await sms_q_cursor.extra.stats.fullCount;

        const smsQtUrl = `${dirName}/sms_questionnaires.json`;
        // write to file
        fs.writeFileSync(smsQtUrl, JSON.stringify(data, null, 2), () => {});
        // add to the file urls array
        fileUrls.push(`${serverAppUrl}/${smsQtUrl}`);
      } else {
        const smsQtUrl = `${dirName}/sms_questionnaires.json`;
        fs.writeFileSync(smsQtUrl, JSON.stringify([], null, 2), () => {});
        fileUrls.push(`${serverAppUrl}/${smsQtUrl}`);
      } // END SMS QUESTIONNAIRE

      // SMS QUESTIONNAIRES BLOCS
      const sms_blocks_cursor = await db.query(
        aql`FOR c IN sms_questionnaire_blocks 
      FILTER c.projectKey == ${projectKey} 
      AND c.companyKey == ${companyKey} 
      AND c.questionnaireKey == ${questionnaireKey} 
      SORT c.blockOrder ASC RETURN c`,
        { fullCount: true },
        { count: true }
      );
      if (sms_blocks_cursor.hasNext) {
        const data = await sms_blocks_cursor.all();
        data.fullCount = await sms_blocks_cursor.extra.stats.fullCount;

        const smsBlcUrl = `${dirName}/sms_questionnaire_blocks.json`;
        // write to file
        fs.writeFileSync(smsBlcUrl, JSON.stringify(data, null, 2), () => {});
        // add to the file urls array
        fileUrls.push(`${serverAppUrl}/${smsBlcUrl}`);
      } else {
        const smsBlcUrl = `${dirName}/sms_questionnaire_blocks.json`;
        fs.writeFileSync(smsBlcUrl, JSON.stringify([], null, 2), () => {});
        fileUrls.push(`${serverAppUrl}/${smsBlcUrl}`);
      } // END SMS QUESTIONNAIRES BLOCKS

      // SMS QUESTIONNAIRES OPTIONS
      const sms_options_cursor = await db.query(
        aql`FOR c IN sms_questionnaire_options 
        FILTER c.questionnaireKey == ${questionnaireKey} 
        SORT c.optionOrder ASC RETURN c`,
        { fullCount: true },
        { count: true }
      );
      if (sms_options_cursor.hasNext) {
        const data = await sms_options_cursor.all();
        data.fullCount = await sms_options_cursor.extra.stats.fullCount;
        // options
        const smsOpUrl = `${dirName}/sms_questionnaire_options.json`;
        // write to file
        fs.writeFileSync(smsOpUrl, JSON.stringify(data, null, 2), () => {});
        // add to the file urls array
        fileUrls.push(`${serverAppUrl}/${smsOpUrl}`);
      } else {
        const smsOpUrl = `${dirName}/sms_questionnaire_options.json`;
        fs.writeFileSync(smsOpUrl, JSON.stringify([], null, 2), () => {});
        fileUrls.push(`${serverAppUrl}/${smsOpUrl}`);
      } // END SMS QUESTIONNAIRES OPTIONS

      // SMS QUESTIONNAIRES DATA
      const sms_data_cursor = await db.query(
        aql`FOR c IN sms_questionnaire_data 
        FILTER c.questionnaireKey == ${questionnaireKey} 
        AND c.clientKey IN ${_clientKeys} RETURN c`,
        { fullCount: true },
        { count: true }
      );
      if (sms_data_cursor.hasNext) {
        const data = await sms_data_cursor.all();
        data.fullCount = await sms_data_cursor.extra.stats.fullCount;
        // options
        const dataUrl = `${dirName}/sms_questionnaire_data.json`;
        // write to file
        fs.writeFileSync(dataUrl, JSON.stringify(data, null, 2), () => {});
        // add to the file urls array
        fileUrls.push(`${serverAppUrl}/${dataUrl}`);
      } else {
        const dataUrl = `${dirName}/sms_questionnaire_data.json`;
        fs.writeFileSync(dataUrl, JSON.stringify([], null, 2), () => {});
        fileUrls.push(`${serverAppUrl}/${dataUrl}`);
      } // END SMS QUESTIONNAIRES DATA

      // END
      // END
      // END
      // remove duplicates from the urls
      const uniqueFileUrls = [...new Set(fileUrls)];
      // download the images
      for (let inxo = 0; inxo < uniqueFileUrls.length; inxo++) {
        const url = uniqueFileUrls[inxo];
        // check if the url contains an image
        const exts = url.substring(url.length - 4);
        if (exts != "json") {
          // extract the file name
          const fname = url.split("images/")[1];
          await downloadImage({
            uri: `${serverAppUrl}/public_upload/${fname}`,
            fileName: `./sync/images/${fname}`,
            callback: () => {},
          });
        }
      }
      // return unique urls
      return uniqueFileUrls;
    } else if (docName == "download_client_by_key") {
      let fileUrls = [];
      let clientsArr = [];
      let groupsArr = [];
      let questionnaireKey;
      const dirName = `sync/user/${userKey}`;
      const dirImage = `sync/images`;

      const clientUrl = `${dirName}/clients_sig.json`;
      // grup url
      const groupUrl = `${dirName}/groupes_sig.json`;
      // create new directories if they do not exist
      if (!fs.existsSync(dirImage)) {
        fs.mkdirSync(dirImage);
      }
      if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName);
      }
      //console.log(docKey);
      // select the clients based on the group code

      // request client details
      const clients_cursor = await db.query(
        aql`FOR c IN clients_sig 
        FILTER c.projectKey == ${projectKey} 
        AND c.companyKey == ${companyKey} 
        AND c.animateurKey == ${userKey} 
        AND c._key == ${docKey} RETURN c`,
        { fullCount: true },
        { count: true }
      );
      if (clients_cursor.hasNext) {
        const records = await clients_cursor.all();
        for (let clientIndex = 0; clientIndex < records.length; clientIndex++) {
          let clt = records[clientIndex];
          clt.fullCount = await clients_cursor.extra.stats.fullCount;
          // request new data from the SIG
          /*codeSig: req.body.codeSig,
          dbIp: req.body.dbIp,
          dbName: req.body.dbName,
          dbUser: req.body.dbUser,
          dbPass: req.body.dbPass,
          dbPort: req.body.dbPort,*/

          // select client office
          const _office = await getOfficeDoc({ officeKey: clt.officeKey });

          /*const sigReq = await axios.post(
            `${serverSigUrl}/client-by-code-sig`,
            {
              codeSig: clt.codeSig,
              dbIp: _office.sigDBIp,
              dbName: _office.sigDBName,
              dbUser: _office.sigDBUser,
              dbPass: _office.sigDBPass,
              dbPort: _office.sigDBPort,
            }
          );*/

          //if (sigReq.data.length > 0) {
          // var sigClt = await sigReq.data; // result from the SIG api

          //clt.soldeEpargne = sigClt[0].soldeEpargne;
          //clt.soldeDate = Date.now();

          // create the signature url if available
          if (clt.signature != null) {
            fileUrls.push(`${serverAppUrl}/${dirImage}/${clt.signature}`);
          }
          if (clt.fingerPrint != null) {
            fileUrls.push(`${serverAppUrl}/${dirImage}/${clt.fingerPrint}`);
          }
          // create images url
          if (clt.photo != "camera_avatar.png") {
            fileUrls.push(`${serverAppUrl}/${dirImage}/${clt.photo}`);
          }
          if (clt.photo1 != "camera_avatar.png") {
            fileUrls.push(`${serverAppUrl}/${dirImage}/${clt.photo1}`);
          }
          if (clt.photo2 != "camera_avatar.png") {
            fileUrls.push(`${serverAppUrl}/${dirImage}/${clt.photo2}`);
          }
          if (clt.photo3 != "camera_avatar.png") {
            fileUrls.push(`${serverAppUrl}/${dirImage}/${clt.photo3}`);
          }
          if (clt.photo4 != "camera_avatar.png") {
            fileUrls.push(`${serverAppUrl}/${dirImage}/${clt.photo4}`);
          }

          // push to the array
          clientsArr.push(clt);

          // download the client's group
          if (clt.groupRef != "00") {
            const group_cursor = await db.query(
              aql`FOR c IN groupes_sig 
              FILTER c.groupCode == ${clt.groupRef} RETURN c`,
              { fullCount: true },
              { count: true }
            );
            if (group_cursor.hasNext) {
              let data = await group_cursor.next();
              data.fullCount = await group_cursor.extra.stats.fullCount;
              groupsArr.push(data);
            }
          }
          //}
        } // end for loop

        // write to file > clients_sig.json
        fs.writeFileSync(
          clientUrl,
          JSON.stringify(clientsArr, null, 2),
          () => {}
        );
        // add to the file urls array
        fileUrls.push(`${serverAppUrl}/${clientUrl}`);

        // write groups to file
        fs.writeFileSync(
          groupUrl,
          JSON.stringify(groupsArr, null, 2),
          () => {}
        );
        fileUrls.push(`${serverAppUrl}/${groupUrl}`);
      } else {
        // write empty client file
        fileUrls.push(`${serverAppUrl}/${clientUrl}`);
        // write other empty files
        fs.writeFileSync(clientUrl, JSON.stringify([], null, 2), () => {});

        // write empty group file
        fileUrls.push(`${serverAppUrl}/${groupUrl}`);
        // write other empty files
        fs.writeFileSync(groupUrl, JSON.stringify([], null, 2), () => {});
      } // end clients

      // select the project
      const project = await getProjectDoc({ projectKey: projectKey });
      questionnaireKey = project.loanQuestionnaireKey;

      // SMS QUESTIONNAIRES
      const sms_q_cursor = await db.query(
        aql`FOR c IN sms_questionnaires FILTER c.projectKey == ${projectKey} 
        AND c.companyKey == ${companyKey} AND c._key == ${questionnaireKey} RETURN c`,
        { fullCount: true },
        { count: true }
      );
      if (sms_q_cursor.hasNext) {
        const data = await sms_q_cursor.all();
        data.fullCount = await sms_q_cursor.extra.stats.fullCount;

        const smsQtUrl = `${dirName}/sms_questionnaires.json`;
        // write to file
        fs.writeFileSync(smsQtUrl, JSON.stringify(data, null, 2), () => {});
        // add to the file urls array
        fileUrls.push(`${serverAppUrl}/${smsQtUrl}`);
      } else {
        const smsQtUrl = `${dirName}/sms_questionnaires.json`;
        fs.writeFileSync(smsQtUrl, JSON.stringify([], null, 2), () => {});
        fileUrls.push(`${serverAppUrl}/${smsQtUrl}`);
      } // END SMS QUESTIONNAIRE

      // SMS QUESTIONNAIRES BLOCS
      const sms_blocks_cursor = await db.query(
        aql`FOR c IN sms_questionnaire_blocks 
        FILTER c.projectKey == ${projectKey} 
        AND c.companyKey == ${companyKey} 
        AND c.questionnaireKey == ${questionnaireKey} 
        SORT c.blockOrder ASC RETURN c`,
        { fullCount: true },
        { count: true }
      );
      if (sms_blocks_cursor.hasNext) {
        const data = await sms_blocks_cursor.all();
        data.fullCount = await sms_blocks_cursor.extra.stats.fullCount;

        const smsBlcUrl = `${dirName}/sms_questionnaire_blocks.json`;
        // write to file
        fs.writeFileSync(smsBlcUrl, JSON.stringify(data, null, 2), () => {});
        // add to the file urls array
        fileUrls.push(`${serverAppUrl}/${smsBlcUrl}`);
      } else {
        const smsBlcUrl = `${dirName}/sms_questionnaire_blocks.json`;
        fs.writeFileSync(smsBlcUrl, JSON.stringify([], null, 2), () => {});
        fileUrls.push(`${serverAppUrl}/${smsBlcUrl}`);
      } // END SMS QUESTIONNAIRES BLOCKS

      // SMS QUESTIONNAIRES OPTIONS
      const sms_options_cursor = await db.query(
        aql`FOR c IN sms_questionnaire_options 
        FILTER c.questionnaireKey == ${questionnaireKey} 
        SORT c.optionOrder ASC RETURN c`,
        { fullCount: true },
        { count: true }
      );
      if (sms_options_cursor.hasNext) {
        const data = await sms_options_cursor.all();
        data.fullCount = await sms_options_cursor.extra.stats.fullCount;
        // options
        const smsOpUrl = `${dirName}/sms_questionnaire_options.json`;
        // write to file
        fs.writeFileSync(smsOpUrl, JSON.stringify(data, null, 2), () => {});
        // add to the file urls array
        fileUrls.push(`${serverAppUrl}/${smsOpUrl}`);
      } else {
        const smsOpUrl = `${dirName}/sms_questionnaire_options.json`;
        fs.writeFileSync(smsOpUrl, JSON.stringify([], null, 2), () => {});
        fileUrls.push(`${serverAppUrl}/${smsOpUrl}`);
      } // END SMS QUESTIONNAIRES OPTIONS

      // SMS QUESTIONNAIRES DATA
      const sms_data_cursor = await db.query(
        aql`FOR c IN sms_questionnaire_data 
        FILTER c.questionnaireKey == ${questionnaireKey} 
        AND c.clientKey IN ${clientsArr} RETURN c`,
        { fullCount: true },
        { count: true }
      );
      if (sms_data_cursor.hasNext) {
        const data = await sms_data_cursor.all();
        data.fullCount = await sms_data_cursor.extra.stats.fullCount;
        // options
        const dataUrl = `${dirName}/sms_questionnaire_data.json`;
        // write to file
        fs.writeFileSync(dataUrl, JSON.stringify(data, null, 2), () => {});
        // add to the file urls array
        fileUrls.push(`${serverAppUrl}/${dataUrl}`);
      } else {
        const dataUrl = `${dirName}/sms_questionnaire_data.json`;
        fs.writeFileSync(dataUrl, JSON.stringify([], null, 2), () => {});
        fileUrls.push(`${serverAppUrl}/${dataUrl}`);
      } // END SMS QUESTIONNAIRES DATA

      // END
      // END
      // END
      // remove duplicates from the urls
      const uniqueFileUrls = [...new Set(fileUrls)];
      // download the images
      for (let inxo = 0; inxo < uniqueFileUrls.length; inxo++) {
        const url = uniqueFileUrls[inxo];
        // check if the url contains an image
        const exts = url.substring(url.length - 4);
        if (exts != "json") {
          // extract the file name
          const fname = url.split("images/")[1];
          await downloadImage({
            uri: `${serverAppUrl}/public_upload/${fname}`,
            fileName: `./sync/images/${fname}`,
            callback: () => {},
          });
        }
      }
      // return unique urls
      return uniqueFileUrls;
    } else if (docName == "download_user_by_key") {
      // decalire default variables
      let fileUrls = [];
      const dirImage = `sync/images`;

      // create the user folder if it does not exist
      if (!fs.existsSync(dirImage)) {
        fs.mkdirSync(dirImage);
      }
      const dirName = `sync/user/${userKey}`;
      // create the image folder if it does not exist
      if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName);
      }

      const user_cursor = await db.query(aql`FOR c IN user 
      FILTER c._key == ${userKey} RETURN c`);
      if (user_cursor.hasNext) {
        let userArr = [];
        let userRecords = await user_cursor.all();
        for (let ui = 0; ui < userRecords.length; ui++) {
          let user = userRecords[ui];
          // set access levels
          let accessArray = [];
          for (let index = 0; index < user.accessObjects.length; index++) {
            const access = user.accessObjects[index];
            const acc = await getAccessObjDocs({
              companyKey: access.companyKey,
              officeKey: access.officeKey,
              projectKey: access.projectKey,
              roleKey: access.roleKey,
              accessLevel: access.accessLevel,
            });
            if (acc.companyKey != null) {
              accessArray.push(acc);
            }
          }
          //console.log(accessArray);
          if (accessArray.length > 0) {
            user.accessObjects = accessArray;
          }
          user.roleKey = await getRoleDoc({ roleKey: user.roleKey });
          user.officeKey = await getOfficeDoc({ officeKey: user.officeKey });
          user.companyKey = await getCompanyDoc({
            companyKey: user.companyKey,
          });
          user.projectKey = await getProjectDoc({
            projectKey: user.projectKey,
          });
          user.password = null;
          user.passwordAdmin = null;

          // user signature and picture
          if (user.signature != null) {
            fileUrls.push(`${serverAppUrl}/${dirImage}/${user.signature}`);
          }
          // create user photo link
          fileUrls.push(`${serverAppUrl}/${dirImage}/${user.photo}`);
          // push user to the user array
          userArr.push(user);
        }

        const userFileUrl = `${dirName}/user.json`;
        // write to file
        fs.writeFileSync(
          userFileUrl,
          JSON.stringify(userArr, null, 2),
          () => {}
        );
        // add to the file urls array
        fileUrls.push(`${serverAppUrl}/${userFileUrl}`);
      } // END USER
      //
      //
      //
      // remove duplicates from the urls
      const uniqueFileUrls = [...new Set(fileUrls)];
      // download the images
      for (let inxo = 0; inxo < uniqueFileUrls.length; inxo++) {
        const url = uniqueFileUrls[inxo];
        // check if the url contains an image
        const exts = url.substring(url.length - 4);
        if (exts != "json") {
          // extract the file name
          const fname = url.split("images/")[1];
          await downloadImage({
            uri: `${serverAppUrl}/public_upload/${fname}`,
            fileName: `./sync/images/${fname}`,
            callback: () => {},
          });
        }
      }
      // return unique urls
      return uniqueFileUrls;
    } else if (docName == "xxxx") {
      let fileUrls = [];
      const dirName = `sync/user/${userKey}`;
      const dirImage = `sync/images`;
      const fileName = `clients_sig.json`;
      const fileUrl = `${dirName}/${fileName}`;
      let questionnaireKey;
      // create new directories if they do not exist
      if (!fs.existsSync(dirImage)) {
        fs.mkdirSync(dirImage);
      }
      if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName);
      }
      //console.log(docKey);
      // select the clients based on the group code
      const clients_cursor = await db.query(
        aql`FOR c IN client_perfect 
        FILTER c.projectKey == ${projectKey} 
        AND c.companyKey == ${companyKey} 
        AND c.animateurKey == ${userKey} 
        AND c.groupCode == ${docKey} 
        AND c.isActive == true
        SORT c.fullName ASC RETURN c`,
        { fullCount: true },
        { count: true }
      );
      if (clients_cursor.hasNext) {
        const records = await clients_cursor.all();
        let clientsArr = [];
        for (let clientIndex = 0; clientIndex < records.length; clientIndex++) {
          let clt = records[clientIndex];
          clt.fullCount = await clients_cursor.extra.stats.fullCount;
          /*clt.animateurKey = await getUserDoc({
            userKey: clt.animateurKey,
          });
          clt.companyKey = await getCompanyDoc({
            companyKey: clt.companyKey,
          });
          clt.officeKey = await getOfficeDoc({
            officeKey: clt.officeKey,
          });
          clt.countryKey = await getCountryDoc({ key: clt.countryKey });
          clt.cityKey = await getCityDoc({ key: clt.cityKey });*/
          // push to the array
          clientsArr.push(clt);

          // create the signature url if available
          if (clt.signature != null) {
            fileUrls.push(`${serverAppUrl}/${dirImage}/${clt.signature}`);
          }
          // create images url
          fileUrls.push(`${serverAppUrl}/${dirImage}/${clt.photo}`);
          fileUrls.push(`${serverAppUrl}/${dirImage}/${clt.photo1}`);
          fileUrls.push(`${serverAppUrl}/${dirImage}/${clt.photo2}`);
          fileUrls.push(`${serverAppUrl}/${dirImage}/${clt.photo3}`);
          fileUrls.push(`${serverAppUrl}/${dirImage}/${clt.photo4}`);
        } // end for loop

        // write to file > clients_sig.json
        fs.writeFileSync(
          fileUrl,
          JSON.stringify(clientsArr, null, 2),
          () => {}
        );
        // add to the file urls array
        fileUrls.push(`${serverAppUrl}/${fileUrl}`);

        //
        //
        //
        //
        // loop through the clients
        for (let cltIndx = 0; cltIndx < clientsArr.length; cltIndx++) {
          const client = clientsArr[cltIndx];
          // select client loans
          // select the latest loan only
          const loans_cursor = await db.query(
            aql`FOR c IN loan_files 
            FILTER c.projectKey == ${projectKey} 
            AND c.companyKey == ${companyKey} 
            AND c.clientKey == ${client._key} 
            SORT c._key DESC LIMIT 1 RETURN c`,
            { fullCount: true },
            { count: true }
          );
          if (loans_cursor.hasNext) {
            const loanRecords = await loans_cursor.all();
            let loansArr = [];
            let _loanKeys = [];
            let _clientKeys = [];

            // download other files related to the loan files
            for (let lnIdx = 0; lnIdx < loanRecords.length; lnIdx++) {
              let loan = loanRecords[lnIdx];
              loan.fullCount = await loans_cursor.extra.stats.fullCount;
              loan.animateurKey = await getUserDoc({
                userKey: loan.animateurKey,
              });
              // build signature and images url
              fileUrls.push(
                `${serverAppUrl}/${dirImage}/${loan.animateurKey["signature"]}`
              );
              fileUrls.push(
                `${serverAppUrl}/${dirImage}/${loan.signatureAgentCredit}`
              );

              loan.revisedBy = await getUserDoc({ userKey: loan.revisedBy });
              // build signature and images url
              fileUrls.push(
                `${serverAppUrl}/${dirImage}/${loan.revisedBy["signature"]}`
              );
              loan.projectKey = await getProjectDoc({
                projectKey: loan.projectKey,
              });
              loan.totalCharges = await getLoanExploitationSum({
                loanFileKey: loan._key,
                type: "CHARGES",
              });
              loan.totalRecettes = await getLoanExploitationSum({
                loanFileKey: loan._key,
                type: "RECETTES",
              });
              loan.resultatNetAGR = 0;
              loan.montantAchatEnergie = loan.montantCreditDemande * 0.5;
              // add the loan to the array
              loansArr.push(loan);
              _loanKeys.push(loan._key);
              _clientKeys.push(loan.clientKey);
            }
            // generate the loan JSON files
            const loanFileUrl = `${dirName}/loan_files.json`;
            // write to file
            fs.writeFileSync(
              loanFileUrl,
              JSON.stringify(loansArr, null, 2),
              () => {}
            );
            // add to the file urls array
            fileUrls.push(`${serverAppUrl}/${loanFileUrl}`);

            // get the other files
            // _activityAgrKeys
            const agr_cursor = await db.query(
              aql`FOR c IN loan_activite_agr FILTER c.loanFileKey 
              IN ${_loanKeys} RETURN c`,
              { fullCount: true },
              { count: true }
            );
            if (agr_cursor.hasNext) {
              let data = await agr_cursor.all();
              data.fullCount = await agr_cursor.extra.stats.fullCount;
              const agrUrl = `${dirName}/loan_activite_agr.json`;
              fs.writeFileSync(agrUrl, JSON.stringify(data, null, 2), () => {});
              fileUrls.push(`${serverAppUrl}/${agrUrl}`);
            } else {
              const agrUrl = `${dirName}/loan_activite_agr.json`;
              fs.writeFileSync(agrUrl, JSON.stringify([], null, 2), () => {});
              fileUrls.push(`${serverAppUrl}/${agrUrl}`);
            }
            // _activityStockageKeys
            const stockage_cursor = await db.query(
              aql`FOR c IN loan_activite_stockage 
              FILTER c.loanFileKey IN ${_loanKeys} RETURN c`,
              { fullCount: true },
              { count: true }
            );
            if (stockage_cursor.hasNext) {
              let data = await stockage_cursor.all();
              data.fullCount = await stockage_cursor.extra.stats.fullCount;
              const stockUrl = `${dirName}/loan_activite_stockage.json`;
              fs.writeFileSync(
                stockUrl,
                JSON.stringify(data, null, 2),
                () => {}
              );
              fileUrls.push(`${serverAppUrl}/${stockUrl}`);
            } else {
              const stockUrl = `${dirName}/loan_activite_stockage.json`;
              fs.writeFileSync(stockUrl, JSON.stringify([], null, 2), () => {});
              fileUrls.push(`${serverAppUrl}/${stockUrl}`);
            }

            // exploitations, CHARGES et RECETTES
            const exp_cursor = await db.query(
              aql`FOR c IN loan_exploitation 
              FILTER c.loanFileKey IN ${_loanKeys} RETURN c`,
              { fullCount: true },
              { count: true }
            );
            if (exp_cursor.hasNext) {
              let data = await exp_cursor.all();
              data.fullCount = await exp_cursor.extra.stats.fullCount;
              const expUrl = `${dirName}/loan_exploitation.json`;
              fs.writeFileSync(expUrl, JSON.stringify(data, null, 2), () => {});
              fileUrls.push(`${serverAppUrl}/${expUrl}`);
            } else {
              const expUrl = `${dirName}/loan_exploitation.json`;
              fs.writeFileSync(expUrl, JSON.stringify([], null, 2), () => {});
              fileUrls.push(`${serverAppUrl}/${expUrl}`);
            }
            // loan_budget_familial : DEPENSES et REVENUS
            const budget_cursor = await db.query(
              aql`FOR c IN loan_budget_familial 
              FILTER c.loanFileKey IN ${_loanKeys} RETURN c`,
              { fullCount: true },
              { count: true }
            );
            if (budget_cursor.hasNext) {
              let data = await budget_cursor.all();
              data.fullCount = await budget_cursor.extra.stats.fullCount;
              const budgUrl = `${dirName}/loan_budget_familial.json`;
              fs.writeFileSync(
                budgUrl,
                JSON.stringify(data, null, 2),
                () => {}
              );
              fileUrls.push(`${serverAppUrl}/${budgUrl}`);
            } else {
              const budgUrl = `${dirName}/loan_budget_familial.json`;
              fs.writeFileSync(budgUrl, JSON.stringify([], null, 2), () => {});
              fileUrls.push(`${serverAppUrl}/${budgUrl}`);
            }
            // avis
            const avis_cursor = await db.query(
              aql`FOR c IN loan_avis 
              FILTER c.loanFileKey IN ${_loanKeys} RETURN c`,
              { fullCount: true },
              { count: true }
            );
            if (avis_cursor.hasNext) {
              let data = await avis_cursor.all();
              data.fullCount = await avis_cursor.extra.stats.fullCount;
              const avisUrl = `${dirName}/loan_avis.json`;
              fs.writeFileSync(
                avisUrl,
                JSON.stringify(data, null, 2),
                () => {}
              );
              fileUrls.push(`${serverAppUrl}/${avisUrl}`);
            } else {
              const avisUrl = `${dirName}/loan_avis.json`;
              fs.writeFileSync(avisUrl, JSON.stringify([], null, 2), () => {});
              fileUrls.push(`${serverAppUrl}/${avisUrl}`);
            }
            // besoins
            const besoins_cursor = await db.query(
              aql`FOR c IN loan_besoin 
              FILTER c.loanFileKey IN ${_loanKeys} RETURN c`,
              { fullCount: true },
              { count: true }
            );
            if (besoins_cursor.hasNext) {
              let data = await besoins_cursor.all();
              data.fullCount = await besoins_cursor.extra.stats.fullCount;
              const besUrl = `${dirName}/loan_besoin.json`;
              fs.writeFileSync(besUrl, JSON.stringify(data, null, 2), () => {});
              fileUrls.push(`${serverAppUrl}/${besUrl}`);
            } else {
              const besUrl = `${dirName}/loan_besoin.json`;
              fs.writeFileSync(besUrl, JSON.stringify([], null, 2), () => {});
              fileUrls.push(`${serverAppUrl}/${besUrl}`);
            }
            // suivi
            const suivis_cursor = await db.query(
              aql`FOR c IN loan_suivi 
              FILTER c.loanFileKey IN ${_loanKeys} RETURN c`,
              { fullCount: true },
              { count: true }
            );
            if (suivis_cursor.hasNext) {
              let data = await suivis_cursor.all();
              data.fullCount = await suivis_cursor.extra.stats.fullCount;
              const suiviUrl = `${dirName}/loan_suivi.json`;
              fs.writeFileSync(
                suiviUrl,
                JSON.stringify(data, null, 2),
                () => {}
              );
              fileUrls.push(`${serverAppUrl}/${suiviUrl}`);
            } else {
              const suiviUrl = `${dirName}/loan_suivi.json`;
              fs.writeFileSync(suiviUrl, JSON.stringify([], null, 2), () => {});
              fileUrls.push(`${serverAppUrl}/${suiviUrl}`);
            }
          } else {
            const url_agr = `${dirName}/loan_activite_agr.json`;
            const url_stok = `${dirName}/loan_activite_stockage.json`;
            const url_avis = `${dirName}/loan_avis.json`;
            const url_besoin = `${dirName}/loan_besoin.json`;
            const url_budget = `${dirName}/loan_budget_familial.json`;
            const url_explt = `${dirName}/loan_exploitation.json`;
            const url_files = `${dirName}/loan_files.json`;
            const url_suivi = `${dirName}/loan_suivi.json`;
            // write other empty files
            fs.writeFileSync(url_agr, JSON.stringify([], null, 2), () => {});
            fs.writeFileSync(url_stok, JSON.stringify([], null, 2), () => {});
            fs.writeFileSync(url_avis, JSON.stringify([], null, 2), () => {});
            fs.writeFileSync(url_besoin, JSON.stringify([], null, 2), () => {});
            fs.writeFileSync(url_budget, JSON.stringify([], null, 2), () => {});
            fs.writeFileSync(url_explt, JSON.stringify([], null, 2), () => {});
            fs.writeFileSync(url_files, JSON.stringify([], null, 2), () => {});
            fs.writeFileSync(url_suivi, JSON.stringify([], null, 2), () => {});
            // push empty files to the files array
            fileUrls.push(`${serverAppUrl}/${dirName}/loan_activite_agr.json`);
            fileUrls.push(
              `${serverAppUrl}/${dirName}/loan_activite_stockage.json`
            );
            fileUrls.push(`${serverAppUrl}/${dirName}/loan_avis.json`);
            fileUrls.push(`${serverAppUrl}/${dirName}/loan_besoin.json`);
            fileUrls.push(
              `${serverAppUrl}/${dirName}/loan_budget_familial.json`
            );
            fileUrls.push(`${serverAppUrl}/${dirName}/loan_exploitation.json`);
            fileUrls.push(`${serverAppUrl}/${dirName}/loan_files.json`);
            fileUrls.push(`${serverAppUrl}/${dirName}/loan_suivi.json`);
          }
        }

        // empty client found, create empty files
      } else {
        fileUrls.push(`${serverAppUrl}/${fileUrl}`); // clients_sig.json
        // write other empty files
        fs.writeFileSync(fileUrl, JSON.stringify([], null, 2), () => {}); // clients_sig.json
      } // end clients

      // select the project
      const project = await getProjectDoc({ projectKey: projectKey });
      questionnaireKey = project.loanQuestionnaireKey;

      // SMS QUESTIONNAIRES
      const sms_q_cursor = await db.query(
        aql`FOR c IN sms_questionnaires 
      FILTER c.projectKey == ${projectKey} 
      AND c.companyKey == ${companyKey} 
      AND c._key == ${questionnaireKey} RETURN c`,
        { fullCount: true },
        { count: true }
      );
      if (sms_q_cursor.hasNext) {
        const data = await sms_q_cursor.all();
        data.fullCount = await sms_q_cursor.extra.stats.fullCount;

        const smsQtUrl = `${dirName}/sms_questionnaires.json`;
        // write to file
        fs.writeFileSync(smsQtUrl, JSON.stringify(data, null, 2), () => {});
        // add to the file urls array
        fileUrls.push(`${serverAppUrl}/${smsQtUrl}`);
      } // END SMS QUESTIONNAIRE

      // SMS QUESTIONNAIRES BLOCS
      const sms_blocks_cursor = await db.query(
        aql`FOR c IN sms_questionnaire_blocks 
      FILTER c.projectKey == ${projectKey} 
      AND c.companyKey == ${companyKey} 
      AND c.questionnaireKey == ${questionnaireKey} 
      SORT c.blockOrder ASC RETURN c`,
        { fullCount: true },
        { count: true }
      );
      if (sms_blocks_cursor.hasNext) {
        const data = await sms_blocks_cursor.all();
        data.fullCount = await sms_blocks_cursor.extra.stats.fullCount;

        const smsBlcUrl = `${dirName}/sms_questionnaire_blocks.json`;
        // write to file
        fs.writeFileSync(smsBlcUrl, JSON.stringify(data, null, 2), () => {});
        // add to the file urls array
        fileUrls.push(`${serverAppUrl}/${smsBlcUrl}`);
      } // END SMS QUESTIONNAIRES BLOCKS

      // SMS QUESTIONNAIRES OPTIONS + DATA
      const sms_options_cursor = await db.query(
        aql`FOR c IN sms_questionnaire_options 
      FILTER c.questionnaireKey == ${questionnaireKey} RETURN c`,
        { fullCount: true },
        { count: true }
      );
      if (sms_options_cursor.hasNext) {
        const data = await sms_options_cursor.all();
        data.fullCount = await sms_options_cursor.extra.stats.fullCount;

        // empty data
        const smsDtUrl = `${dirName}/sms_questionnaire_data.json`;
        fs.writeFileSync(smsDtUrl, JSON.stringify([], null, 2), () => {});
        fileUrls.push(`${serverAppUrl}/${smsDtUrl}`);
        //fileUrl;
        // options
        const smsOpUrl = `${dirName}/sms_questionnaire_options.json`;
        // write to file
        fs.writeFileSync(smsOpUrl, JSON.stringify(data, null, 2), () => {});
        // add to the file urls array
        fileUrls.push(`${serverAppUrl}/${smsOpUrl}`);
      } // END SMS QUESTIONNAIRES OPTIONS

      // END
      // END
      // END
      // remove duplicates from the urls

      const uniqueFileUrls = [...new Set(fileUrls)];
      // download the images
      for (let inxo = 0; inxo < uniqueFileUrls.length; inxo++) {
        const url = uniqueFileUrls[inxo];
        // check if the url contains an image
        const exts = url.substring(url.length - 4);
        if (exts != "json") {
          // extract the file name
          const fname = url.split("images/")[1];
          await downloadImage({
            uri: `${serverAppUrl}/public_upload/${fname}`,
            fileName: `./sync/images/${fname}`,
            callback: () => {},
          });
        }
      }
      // return unique urls
      return uniqueFileUrls;
    }
  },

  // upload data to the server coming from the local device
  syncUploadToTheServer: async ({
    userKey,
    companyKey,
    projectKey,
    fileName,
    docName,
    accessLevel,
    officeKey,
  }) => {
    if (docName == "loan_files.json") {
      fs.readFile(
        `public_download/${fileName}`,
        "utf8",
        async (err, jsonString) => {
          if (err) {
            console.log("Error reading file from disk:", err);
            return;
          }
          try {
            const jsonArr = JSON.parse(jsonString);
            if (jsonArr.length > 0) {
              await db.query(aql`FOR i IN ${jsonArr} 
                INSERT i INTO loan_files 
                OPTIONS { overwrite: true, overwriteMode: "replace" } 
                RETURN NEW `);
            }
          } catch (err) {
            console.log("Error parsing JSON string:", err);
          }
        }
      );
    } else if (docName == "loan_activite_agr.json") {
      fs.readFile(
        `public_download/${fileName}`,
        "utf8",
        async (err, jsonString) => {
          if (err) {
            console.log("Error reading file from disk:", err);
            return;
          }
          try {
            const jsonArr = JSON.parse(jsonString);
            if (jsonArr.length > 0) {
              await db.query(aql`FOR i IN ${jsonArr} 
                INSERT i INTO loan_activite_agr 
                OPTIONS { overwrite: true, overwriteMode: "replace" } 
                RETURN NEW `);
            }
          } catch (err) {
            console.log("Error parsing JSON string:", err);
          }
        }
      );
    } else if (docName == "loan_activite_stockage.json") {
      fs.readFile(
        `public_download/${fileName}`,
        "utf8",
        async (err, jsonString) => {
          if (err) {
            console.log("Error reading file from disk:", err);
            return;
          }
          try {
            const jsonArr = JSON.parse(jsonString);
            if (jsonArr.length > 0) {
              await db.query(aql`FOR i IN ${jsonArr} 
                INSERT i INTO loan_activite_stockage 
                OPTIONS { overwrite: true, overwriteMode: "replace" } 
                RETURN NEW `);
            }
          } catch (err) {
            console.log("Error parsing JSON string:", err);
          }
        }
      );
    } else if (docName == "loan_avis.json") {
      fs.readFile(
        `public_download/${fileName}`,
        "utf8",
        async (err, jsonString) => {
          if (err) {
            console.log("Error reading file from disk:", err);
            return;
          }
          try {
            const jsonArr = JSON.parse(jsonString);
            if (jsonArr.length > 0) {
              await db.query(aql`FOR i IN ${jsonArr} 
                INSERT i INTO loan_avis 
                OPTIONS { overwrite: true, overwriteMode: "replace" } 
                RETURN NEW `);
            }
          } catch (err) {
            console.log("Error parsing JSON string:", err);
          }
        }
      );
    } else if (docName == "loan_besoin.json") {
      fs.readFile(
        `public_download/${fileName}`,
        "utf8",
        async (err, jsonString) => {
          if (err) {
            console.log("Error reading file from disk:", err);
            return;
          }
          try {
            const jsonArr = JSON.parse(jsonString);
            if (jsonArr.length > 0) {
              await db.query(aql`FOR i IN ${jsonArr} 
                INSERT i INTO loan_besoin 
                OPTIONS { overwrite: true, overwriteMode: "replace" } 
                RETURN NEW `);
            }
          } catch (err) {
            console.log("Error parsing JSON string:", err);
          }
        }
      );
    } else if (docName == "loan_budget_familial.json") {
      fs.readFile(
        `public_download/${fileName}`,
        "utf8",
        async (err, jsonString) => {
          if (err) {
            console.log("Error reading file from disk:", err);
            return;
          }
          try {
            const jsonArr = JSON.parse(jsonString);
            if (jsonArr.length > 0) {
              await db.query(aql`FOR i IN ${jsonArr} 
                INSERT i INTO loan_budget_familial 
                OPTIONS { overwrite: true, overwriteMode: "replace" } 
                RETURN NEW `);
            }
          } catch (err) {
            console.log("Error parsing JSON string:", err);
          }
        }
      );
    } else if (docName == "sms_questionnaire_data.json") {
      fs.readFile(
        `public_download/${fileName}`,
        "utf8",
        async (err, jsonString) => {
          if (err) {
            console.log("Error reading file from disk:", err);
            return;
          }
          try {
            const jsonArr = JSON.parse(jsonString);
            if (jsonArr.length > 0) {
              for (let i = 0; i < jsonArr.length; i++) {
                const data = jsonArr[i];
                // delete previous duplicate
                await db.query(aql`FOR s IN sms_questionnaire_data 
                FILTER s.clientKey == ${data.clientKey} 
                AND s.loanCycle == ${data.loanCycle} 
                REMOVE {_key: s._key} IN sms_questionnaire_data RETURN OLD`);

                await db.query(aql`FOR i IN ${jsonArr} 
                INSERT i INTO sms_questionnaire_data 
                OPTIONS { overwrite: true, overwriteMode: "replace" } 
                RETURN NEW `);
              }
            }
          } catch (err) {
            console.log("Error parsing JSON string:", err);
          }
        }
      );
    } else if (docName == "loan_exploitation.json") {
      fs.readFile(
        `public_download/${fileName}`,
        "utf8",
        async (err, jsonString) => {
          if (err) {
            console.log("Error reading file from disk:", err);
            return;
          }
          try {
            const jsonArr = JSON.parse(jsonString);
            if (jsonArr.length > 0) {
              await db.query(aql`FOR i IN ${jsonArr} 
                INSERT i INTO loan_exploitation 
                OPTIONS { overwrite: true, overwriteMode: "replace" } 
                RETURN NEW `);
            }
          } catch (err) {
            console.log("Error parsing JSON string:", err);
          }
        }
      );
    } else if (docName == "loan_suivi.json") {
      fs.readFile(
        `public_download/${fileName}`,
        "utf8",
        async (err, jsonString) => {
          if (err) {
            console.log("Error reading file from disk:", err);
            return;
          }
          try {
            const jsonArr = JSON.parse(jsonString);
            if (jsonArr.length > 0) {
              await db.query(aql`FOR i IN ${jsonArr} 
                INSERT i INTO loan_suivi 
                OPTIONS { overwrite: true, overwriteMode: "replace" } 
                RETURN NEW `);
            }
          } catch (err) {
            console.log("Error parsing JSON string:", err);
          }
        }
      );
    } else if (docName == "clients_sig.json") {
      fs.readFile(
        `public_download/${fileName}`,
        "utf8",
        async (err, jsonString) => {
          if (err) {
            console.log("Error reading file from disk:", err);
            return;
          }
          try {
            const jsonArr = JSON.parse(jsonString);
            if (jsonArr.length > 0) {
              await db.query(aql`FOR i IN ${jsonArr} 
                INSERT i INTO clients_sig 
                OPTIONS { overwrite: true, overwriteMode: "replace" } RETURN NEW`);
            }
          } catch (err) {
            console.log("Error parsing JSON string:", err);
          }
        }
      );
    } else if (docName == "loan_cautions.json") {
      fs.readFile(
        `public_download/${fileName}`,
        "utf8",
        async (err, jsonString) => {
          if (err) {
            console.log("Error reading file from disk:", err);
            return;
          }
          try {
            const jsonArr = JSON.parse(jsonString);
            if (jsonArr.length > 0) {
              await db.query(aql`FOR i IN ${jsonArr} 
                INSERT i INTO loan_cautions 
                OPTIONS { overwrite: true, overwriteMode: "replace" } 
                RETURN NEW `);
            }
          } catch (err) {
            console.log("Error parsing JSON string:", err);
          }
        }
      );
    } else if (docName == "loan_gages.json") {
      fs.readFile(
        `public_download/${fileName}`,
        "utf8",
        async (err, jsonString) => {
          if (err) {
            console.log("Error reading file from disk:", err);
            return;
          }
          try {
            const jsonArr = JSON.parse(jsonString);
            if (jsonArr.length > 0) {
              await db.query(aql`FOR i IN ${jsonArr} 
                INSERT i INTO loan_gages 
                OPTIONS { overwrite: true, overwriteMode: "replace" } 
                RETURN NEW `);
            }
          } catch (err) {
            console.log("Error parsing JSON string:", err);
          }
        }
      );
    } else if (docName == "loan_patrimoine.json") {
      fs.readFile(
        `public_download/${fileName}`,
        "utf8",
        async (err, jsonString) => {
          if (err) {
            console.log("Error reading file from disk:", err);
            return;
          }
          try {
            const jsonArr = JSON.parse(jsonString);
            if (jsonArr.length > 0) {
              await db.query(aql`FOR i IN ${jsonArr} 
                INSERT i INTO loan_patrimoine 
                OPTIONS { overwrite: true, overwriteMode: "replace" } 
                RETURN NEW `);
            }
          } catch (err) {
            console.log("Error parsing JSON string:", err);
          }
        }
      );
    } else if (docName == "xxxx") {
      fs.readFile(
        `public_download/${fileName}`,
        "utf8",
        async (err, jsonString) => {
          if (err) {
            console.log("Error reading file from disk:", err);
            return;
          }
          try {
            const jsonArr = JSON.parse(jsonString);
            if (jsonArr.length > 0) {
              await db.query(aql`FOR i IN ${jsonArr} 
                INSERT i INTO client_perfect 
                OPTIONS { overwrite: true, overwriteMode: "replace" } 
                RETURN NEW `);
            }
          } catch (err) {
            console.log("Error parsing JSON string:", err);
          }
        }
      );
    } else {
      return true;
    }
  },

  xxxxxxtruncate: async () => {
    /*if (os.hostname() == "Komlas-MacBook-Pro.local") {
      // truncate documents
      await db.collection("loan_files").truncate();
      await db.collection("loan_activite_agr").truncate();
      await db.collection("loan_activite_stockage").truncate();
      await db.collection("loan_avis").truncate();
      await db.collection("loan_besoin").truncate();
      await db.collection("loan_budget_familial").truncate();
      await db.collection("loan_exploitation").truncate();
      return true;
    } else {
      return false;
    }*/
  },

  appResetFullTest: async () => {
    // reset loan files status
    /*const fObj = {
      status: "EN ATTENTE",
      isInSession: false,
      sessionKey: null,
      sessionDecisions: [],
      onlineUsers: [],
      fileNumber: "",
      codePRT: null,
    };
    await db.query(aql`FOR x IN loan_files 
    FILTER x.status != 'INITIALISÉ' AND x.status != 'REJETÉ'
    UPDATE {_key: x._key} WITH ${fObj} 
    IN loan_files RETURN NEW`);
    */

    // reset sessions
    /*const uObj = {
      signature: null,
      photo: "camera_avatar.png",
    };
    await db.query(aql`FOR x IN user  
    UPDATE {_key: x._key} WITH ${uObj} 
    IN user RETURN NEW`);

    const cltObj = {
      email: null,
      phone: null,
      phoneAlt: null,
      quartier: null,
      cityKey: null,
      address: null,
      gpsAltitude: 0,
      gpsLongitude: 0,
      gender: null,
      caution1FirstName: null,
      caution1LastName: null,
      caution1Phone1: null,
      caution1Phone2: null,
      caution1Address: null,
      caution2FirstName: null,
      caution2LastName: null,
      caution2Phone1: null,
      caution2Phone2: null,
      caution2Address: null,
      groupName: null,
      signature: null,
      contactsType: null,
      contactsTypeWho: null,
      status: "Imported",
      photo: "camera_avatar.png",
      photo1: "camera_avatar.png",
      photo2: "camera_avatar.png",
      photo3: "camera_avatar.png",
      photo4: "camera_avatar.png",
      legende: null,
      legende1: null,
      legende2: null,
      legende3: null,
      legende4: null,
      updatedAt: 0,
      markedToDownload: false,
    };
    await db.query(aql`FOR x IN client_perfect 
    FILTER x.gender != null OR x.caution1FirstName != null 
    OR x.signature != null OR x.photo != 'camera_avatar.png'
    UPDATE {_key: x._key} WITH ${cltObj} 
    IN client_perfect RETURN NEW`);

    // truncate demandes de fonds et PV, chat
    await db.collection("loan_activite_agr").truncate();
    await db.collection("loan_activite_stockage").truncate();
    await db.collection("loan_avis").truncate();
    await db.collection("loan_besoin").truncate();
    await db.collection("loan_budget_familial").truncate();
    await db.collection("loan_exploitation").truncate();
    await db.collection("loan_files").truncate();
    await db.collection("loan_suivi").truncate();
    await db.collection("loan_file_fonds").truncate();
    await db.collection("loan_vulnerability").truncate();
    await db.collection("loan_session").truncate();
    await db.collection("loan_session_chat").truncate();*/

    // reset all users
    // create new password
    /*const pwd = await bcrypt.hash("123456", 12);
    const uObj = {
      passHash: null,
      password: pwd,
      messageInbox: [],
    };
    await db.query(aql`FOR x IN user 
    UPDATE {_key: x._key} WITH ${uObj} IN user RETURN NEW`);*/

    return true;
  },

  appStipJson: async () => {
    // select activities
    const activities_cursor = await db.query(aql`FOR a 
    IN loan_activite_agr RETURN a`);
    if (activities_cursor.hasNext) {
      const activities = await activities_cursor.all();
      for (let index = 0; index < activities.length; index++) {
        const el = activities[index];
        let periode = [];
        el.periode.forEach((p) => {
          //console.log(p);
          periode.push(replaceall("'", "", p));
        });
        // print
        //console.log(periode);
      }
    }
  },

  databaseSize: async () => {
    let dbSize = 0;
    const collections = await db.collections();
    if (collections.length > 0) {
      for (let index = 0; index < collections.length; index++) {
        const collection = collections[index];
        const cz = await collection.figures();
        //console.log(`${cz.body.name} > ${cz.body.figures.documentsSize}`);
        /*if (index == 4) {
          console.log(cz.body);
        }*/
        dbSize = dbSize + cz.body.figures.documentsSize / 1000000; // Mo
      }
      console.log(dbSize);
    }
    return dbSize;
  },
};

export default appResolver;
