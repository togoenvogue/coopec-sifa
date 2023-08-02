import { aql, db, emailServer } from "../../../../db/arangodb.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import randomInt from "random-int";
import Client from "quickemailverification";
import jwt_decode from "jwt-decode";

import removeWhitespace from "remove-whitespace";
import {
  getUserDoc,
  getAccessObjDocs,
  getCompanyAccessModules,
  getCompanyDoc,
  getOfficeDoc,
  getProjectDoc,
  getRoleDoc,
  getOfficeDocs,
} from "../../../../helpers/joindocs.js";
//const { apiKeyGen } = require("../../../helpers/keygen");
//const { _welcome, _notify } = require("../../../helpers/sendMail");
import { _sendSMS } from "../../../../helpers/sendSMS.js";
import logResolver from "../logs/custom_log.js";
import {
  getLoanProductDocs,
  getSessionLevelDoc,
  getSessionLevelDocs,
} from "../../../../helpers/joindocs_loan.js";

const authErr = "You are not autorized to access this resource";
dotenv.config();
const emailVerif = Client.client(
  process.env.QUICK_EMAIL_VERIF_API_KEY
).quickemailverification();

const userResolver = {
  // if (!req.isAuth) { throw new Error('UNAUTHORIZED'); }

  userInit: async ({
    officeName,
    projectName,
    companyKey,
    adminKey,
    address,
    phone,
  }) => {
    const projectObj = {
      timeStamp: Date.now(),
      adminKey: adminKey,
      companyKey: companyKey,
      projectName: projectName,
      isActive: true,
    };

    const p = await db.query(aql`INSERT ${projectObj} INTO project RETURN NEW`);
    const project = await p.next();

    const officeObj = {
      timeStamp: Date.now(),
      companyKey: companyKey,
      adminKey: adminKey,
      projectKey: project._key,
      officeName: officeName,
      address: address,
      phone: phone,
    };
    const o = await db.query(aql`INSERT ${officeObj} INTO office RETURN NEW`);
    const office = await o.next();

    const roleObj = {
      timeStamp: Date.now(),
      companyKey: companyKey,
      adminKey: adminKey,
      projectKey: project._key,
      label: "Administrateur",
      isActive: true,
      modules: [],
    };
    const r = await db.query(aql`INSERT ${roleObj} INTO role RETURN NEW`);
    const role = await r.next();
    // update the admin

    if (office._key != null && project._key != null && role._key != null) {
      let accessObjects = [];
      const accessObj = {
        companyKey: companyKey,
        officeKey: office._key,
        roleKey: role._key,
        projectKey: project._key,
      };
      accessObjects.push(accessObj);
      //console.log(accessObjects);
      await db.query(aql`FOR u IN user 
      FILTER u._key == ${adminKey} UPDATE {_key: u._key} 
      WITH { accessObjects: ${accessObjects} } IN user RETURN NEW`);

      return true;
    } else {
      return false;
    }
  },

  userManageAccountStatus: async ({
    adminKey,
    userKey,
    projectKey,
    action,
  }) => {
    if (action == "Forcer la déconnexion") {
      // select user
      const user_doc = await db.query(aql`FOR u IN user FILTER 
      u._key == ${userKey} RETURN u`);
      if (user_doc.hasNext == true) {
        const obj = {
          token: null,
          loginRef: null,
          isAuth: false,
          authExpir: 0,
          lastLogin: Date.now(),
        };
        // update
        const update_cursor = await db.query(aql`UPDATE ${userKey} 
        WITH ${obj} IN user RETURN NEW`);
        if (update_cursor.hasNext == true) {
          return "SUCCESS";
        } else {
          return "Une erreur s'est produite lors de la déconnexion de l'utilisateur";
        }
      } else {
        return "Erreur de sélection de l'utilisateur";
      }
    } else if (action == "Suspendre le compte") {
      // select user
      const user_doc = await db.query(aql`FOR u IN user FILTER 
      u._key == ${userKey} RETURN u`);
      if (user_doc.hasNext == true) {
        const obj = {
          token: null,
          loginRef: null,
          isAuth: false,
          isLocked: true,
        };
        // update
        const update_cursor = await db.query(aql`UPDATE ${userKey} 
        WITH ${obj} IN user RETURN NEW`);
        if (update_cursor.hasNext == true) {
          return "SUCCESS";
        } else {
          return "Une erreur s'est produite lors de la suspension du compte";
        }
      } else {
        return "Erreur de sélection de l'utilisateur";
      }
    } else if (action == "Réinitialiser le compte") {
      // select user
      const user_doc = await db.query(aql`FOR u IN user FILTER 
      u._key == ${userKey} RETURN u`);
      if (user_doc.hasNext == true) {
        const obj = {
          password: null,
          passwordReset: null,
          passHash: null,
          photo: "camera_avatar.png",
          firstName: null,
          lastName: null,
          signature: null,
          loginRef: null,
          token: null,
          isAuth: false,
          isLocked: false,
        };
        // update
        const update_cursor = await db.query(aql`UPDATE ${userKey} 
        WITH ${obj} IN user RETURN NEW`);
        if (update_cursor.hasNext == true) {
          return "SUCCESS";
        } else {
          return "Une erreur s'est produite lors de la suspension du compte";
        }
      } else {
        return "Erreur de sélection de l'utilisateur";
      }
    } else if (action == "Réactiver le compte") {
      // select user
      const user_doc = await db.query(aql`FOR u IN user FILTER 
      u._key == ${userKey} RETURN u`);
      if (user_doc.hasNext == true) {
        const obj = {
          token: null,
          loginRef: null,
          isAuth: false,
          isLocked: false,
        };
        // update
        const update_cursor = await db.query(aql`UPDATE ${userKey} 
        WITH ${obj} IN user RETURN NEW`);
        if (update_cursor.hasNext == true) {
          return "SUCCESS";
        } else {
          return "Une erreur s'est produite lors de la suspension du compte";
        }
      } else {
        return "Erreur de sélection de l'utilisateur";
      }
    }
  },

  usersByAdminKey: async ({ adminKey, date, skip, perPage }) => {
    const docs = await db.query(
      aql`FOR u IN user 
    FILTER u.adminKey == ${adminKey} 
    AND DATE_YEAR(u.timeStamp) == ${DATE_YEAR(date)} 
    AND DATE_MONTH(u.timeStamp) == ${DATE_MONTH(date)}
     SORT u._key DESC LIMIT ${skip}, ${perPage} RETURN u`,
      { fullCount: true },
      { count: true }
    );
    if (docs.hasNext) {
      return docs.map(async (user) => {
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
          accessArray.push(acc);
        }

        return {
          ...(user.accessComiteLevelKeys = await getSessionLevelDocs({
            keysArr: user.accessComiteLevelKeys,
          })),
          ...(user.accessOfficeKeys = await getOfficeDocs({
            officeKeyArr: user.accessOfficeKeys,
          })),
          ...(user.accessProductKeys = await getLoanProductDocs({
            productKeysArr: user.accessProductKeys,
          })),
          ...(user.password = null),
          ...(user.passwordAdmin = null),
          ...(user.accessModuleRefs = null),
          ...(user.accessObjects = accessArray),
          ...(user.companyKey = await getCompanyDoc({
            companyKey: user.companyKey,
          })),
          ...(user.officeKey = await getOfficeDoc({
            officeKey: user.officeKey,
          })),
          ...(user.projectKey = await getProjectDoc({
            projectKey: user.projectKey,
          })),
          ...(user.roleKey = await getRoleDoc({
            roleKey: user.roleKey,
          })),
          ...(user.fullCount = await docs_cursor.extra.stats.fullCount),
          ...user,
        };
      });
    } else {
      return [];
    }
  },

  usersSearch: async ({ companyKey, projectKey, toSearch, skip, perPage }) => {
    /*console.log(`projectKey: ${projectKey}`);
    console.log(`companyKey: ${companyKey}`);
    console.log(`skip: ${skip}`);
    console.log(`toSearch: ${toSearch}`);
    console.log(`perPage: ${perPage}`);*/
    const usern = toSearch.replace("%", "");
    const username = parseInt(usern);
    //console.log(`${username} > ${toSearch}`);
    //console.log(`${typeof username} > ${typeof toSearch}`);
    const docs_cursor = await db.query(
      aql`FOR u IN user FILTER LENGTH(u.accessObjects[* 
      FILTER CURRENT.projectKey == ${projectKey} 
      AND CURRENT.companyKey == ${companyKey} ])
      AND LOWER(u.firstName) LIKE ${toSearch.toLowerCase()}
      OR 
      LENGTH(u.accessObjects[* 
      FILTER CURRENT.projectKey == ${projectKey} 
      AND CURRENT.companyKey == ${companyKey} ])
      AND LOWER(u.firstName) LIKE ${toSearch.toLowerCase()}
      OR 
      LENGTH(u.accessObjects[* 
      FILTER CURRENT.projectKey == ${projectKey} 
      AND CURRENT.companyKey == ${companyKey} ])
      AND LOWER(u.lastName) LIKE ${toSearch.toLowerCase()}
      OR
      LENGTH(u.accessObjects[* 
      FILTER CURRENT.projectKey == ${projectKey} 
      AND CURRENT.companyKey == ${companyKey} ])
      AND u.username LIKE ${username}
      SORT u.lastName ASC LIMIT ${skip}, ${perPage} RETURN u`,
      { fullCount: true },
      { count: true }
    );
    if (docs_cursor.hasNext) {
      const users = await docs_cursor.all();
      return users.map(async (user) => {
        let accessArray = [];
        for (let index = 0; index < user.accessObjects.length; index++) {
          const access = user.accessObjects[index];
          const acc = await getAccessObjDocs({
            companyKey: access.companyKey,
            officeKey: access.officeKey,
            projectKey: access.projectKey,
            roleKey: access.roleKey,
            accessLevel: access.accessLevel,
            externalId: access.externalId,
          });
          accessArray.push(acc);
        }

        return {
          ...(user.accessComiteLevelKeys = await getSessionLevelDocs({
            keysArr: user.accessComiteLevelKeys,
          })),
          ...(user.accessOfficeKeys = await getOfficeDocs({
            officeKeyArr: user.accessOfficeKeys,
          })),
          ...(user.accessProductKeys = await getLoanProductDocs({
            productKeysArr: user.accessProductKeys,
          })),
          ...(user.password = null),
          ...(user.passwordAdmin = null),
          ...(user.accessModuleRefs = null),
          ...(user.accessObjects = accessArray),
          ...(user.companyKey = await getCompanyDoc({
            companyKey: user.companyKey,
          })),
          ...(user.officeKey = await getOfficeDoc({
            officeKey: user.officeKey,
          })),
          ...(user.projectKey = await getProjectDoc({
            projectKey: user.projectKey,
          })),
          ...(user.roleKey = await getRoleDoc({
            roleKey: user.roleKey,
          })),
          ...(user.fullCount = await docs_cursor.extra.stats.fullCount),
          ...user,
        };
      });
    } else {
      return [];
    }
  },

  auken: async () => {
    const token = jwt.sign(
      {
        userKey: 1,
        username: "dev",
      },
      process.env.JWT_HASH,
      {
        expiresIn: "1h",
      }
    ); // AP
    //console.log(token);
    return token;
  },

  userCreate: async ({
    email,
    userPhoneNumber,
    password,
    firstName,
    lastName,
    adminKey,
    accessLevel,
    isAdmin,
    companyKey,
    projectKey,
    roleKey,
    officeKey,
  }) => {
    let countryObj = null;
    const usern = removeWhitespace(userPhoneNumber.toString());
    const username = parseInt(usern);
    const xmail = removeWhitespace(email);

    // select the sponsor
    const spr = await db.query(aql`FOR s IN user 
    FILTER s._key == ${adminKey} AND s.isAdmin == true RETURN s`);

    if (spr.hasNext) {
      //const sponsor = await spr.next();
      return db
        .query(aql`FOR u IN user FILTER u.username == ${username} RETURN u`)
        .then(async (user) => {
          //const u = await user.next();
          if (user.hasNext) {
            const uz = await user.next();
            // check if the user exist already in the projec'ts base
            let currentAccessObjects = uz.accessObjects;
            const exisx = currentAccessObjects.filter(
              (el) => el.projectKey === projectKey
            );

            if (exisx.length == 0) {
              const accessObj = {
                companyKey: companyKey,
                officeKey: officeKey,
                roleKey: roleKey,
                projectKey: projectKey,
                accessLevel: accessLevel,
              };

              let newAccessArr = currentAccessObjects.filter(
                (el) => el.projectKey != projectKey
              );
              newAccessArr.push(accessObj);
              //console.log(JSON.stringify(newAccessArr));

              // update user
              const update_doc = await db.query(aql`UPDATE ${uz._key} 
              WITH { accessObjects: ${newAccessArr} } IN user RETURN NEW`);
              if (update_doc.hasNext) {
                const update = await update_doc.next();
                return "SUCCESS";
              } else {
                throw new Error(
                  `Erreur lors de la suppression de l'utilisateur ${userKey}`
                );
              }
            } else {
              throw new Error(
                `Attention, cet utilisateur existe déjà dans votre base! Cherchez-le pour le modifier au besoin`
              );
            }
          } else {
            // cash admin pass
            const passwordCon = await bcrypt.hash("123@321", 12);
            // hash user password
            return bcrypt
              .hash(password, 12)
              .then(async (hassedPassword) => {
                const accessObj = {
                  companyKey: companyKey,
                  officeKey: officeKey,
                  roleKey: roleKey,
                  projectKey: projectKey,
                  accessLevel: accessLevel,
                };
                let newAccessArr = [];
                newAccessArr.push(accessObj);

                const userObj = {
                  timeStamp: Date.now(),
                  username: username,
                  password: hassedPassword,
                  passwordAdmin: passwordCon,
                  passHash: null,
                  lastLogin: 0,
                  authExpir: 0,
                  resetStamp: 0,
                  passwordReset: null,
                  adminKey: adminKey,
                  accessObjects: newAccessArr,
                  accessLevel: accessLevel,
                  email: xmail,
                  isAuth: false,
                  token: null,
                  loginRef: null,
                  photo: "camera_avatar.png",
                  signature: null,
                  firstName: firstName,
                  lastName: lastName,
                  countryName: "Togo",
                  countryFlag: "TG",
                  countryCode: 228,
                  isLocked: false,
                  isAdmin: isAdmin,
                  isSuperAdmin: false,
                  isDemo: false,
                  accessModuleRefs: [],
                  messageInbox: [],
                  accessLevel: accessLevel,
                  companyKey: null,
                  projectKey: null,
                  officeKey: null,
                  roleKey: null,
                  isWebmaster: false,
                  accessProductKeys: [],
                  accessOfficeKeys: [],
                  accessComiteLevelKeys: [],
                };

                const result_cursor = await db.query(
                  aql`INSERT ${userObj} INTO user RETURN NEW`
                );
                if (result_cursor.hasNext) {
                  //const newUser = await result_cursor.next();
                  console.log("[+] User created: " + username);

                  return "SUCCESS";
                } else {
                  throw new Error(
                    `[x] Erreur de création de votre compte. Veuillez essayer de nouveau`
                  );
                }
              })
              .catch((errx) => {
                throw new Error(errx);
              });
          }
        });
    } else {
      throw new Error(
        `Vous ne disposez pas des habilitations pour créer un compte utilisateur`
      );
    }
  },

  userByUsername: async ({ username, companyKey }) => {
    // if (!req.isAuth) { throw new Error('UNAUTHORIZED'); }
    return db
      .query(
        aql`FOR u IN user 
            FILTER u.username == ${username} 
            SORT u._key ASC LIMIT 1 RETURN u`,
        { fullCount: true },
        { count: true }
      )
      .then(async (doc) => {
        if (doc.hasNext) {
          const user = await doc.next();
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
            accessArray.push(acc);
          }

          return {
            ...(user.accessComiteLevelKeys = await getSessionLevelDocs({
              keysArr: user.accessComiteLevelKeys,
            })),
            ...(user.accessOfficeKeys = await getOfficeDocs({
              officeKeyArr: user.accessOfficeKeys,
            })),
            ...(user.accessProductKeys = await getLoanProductDocs({
              productKeysArr: user.accessProductKeys,
            })),
            ...(user.password = null),
            ...(user.passwordAdmin = null),
            ...(user.accessObjects = accessArray),
            ...(user.companyKey = await getCompanyDoc({
              companyKey: user.companyKey,
            })),
            ...(user.officeKey = await getOfficeDoc({
              officeKey: user.officeKey,
            })),
            ...(user.projectKey = await getProjectDoc({
              projectKey: user.projectKey,
            })),
            ...(user.roleKey = await getRoleDoc({
              roleKey: user.roleKey,
            })),
            ...(user.fullCount = 1),
            ...user,
          };
        } else {
          throw new Error(
            `Désolé, aucun utilisateur trouvé avec le numéro ${username}`
          );
        }
      })
      .catch((error) => {
        return error;
      });
  },

  userByUserKey: async ({ userKey }) => {
    /* if (!req.isAuth) {  throw new Error(authErr); } */
    return await db
      .query(
        aql`FOR u IN user 
      FILTER u._key == ${userKey} RETURN u`
      )
      .then(async (doc) => {
        if (doc.hasNext) {
          const user = await doc.next();
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

          return {
            ...(user.accessComiteLevelKeys = await getSessionLevelDocs({
              keysArr: user.accessComiteLevelKeys,
            })),
            ...(user.accessOfficeKeys = await getOfficeDocs({
              officeKeyArr: user.accessOfficeKeys,
            })),
            ...(user.accessProductKeys = await getLoanProductDocs({
              productKeysArr: user.accessProductKeys,
            })),
            ...(user.password = null),
            ...(user.passwordAdmin = null),
            ...(user.accessObjects = accessArray),
            ...(user.companyKey = await getCompanyDoc({
              companyKey: user.companyKey,
            })),
            ...(user.officeKey = await getOfficeDoc({
              officeKey: user.officeKey,
            })),
            ...(user.projectKey = await getProjectDoc({
              projectKey: user.projectKey,
            })),
            ...(user.roleKey = await getRoleDoc({
              roleKey: user.roleKey,
            })),
            ...(user.fullCount = 1),
            ...user,
          };
        } else {
          throw new Error(
            `Désolé, aucun utilisateur trouvé avec le numéro ${username}`
          );
        }
      })
      .catch((error) => {
        console.log(error);
        return error;
      });
  },

  userExists: async ({ username }) => {
    return db
      .query(
        aql`FOR u IN user 
      FILTER u.username == ${username} RETURN u`
      )
      .then(async (doc) => {
        //const result = await doc.next();
        if (doc.hasNext) {
          return true;
        } else {
          return false;
        }
      })
      .catch((error) => {
        return error;
      });
  },

  // user changes password from his backoffice
  userChangePassword: async ({ userKey, password, newPassword, passHash }) => {
    if (
      newPassword.toString().length >= 6 &&
      newPassword.toString().length <= 50
    ) {
      // set pin
      try {
        const doc = await db.query(aql`FOR u IN user 
        FILTER u._key == ${userKey} RETURN u`);

        if (doc.hasNext) {
          const user = await doc.next();
          // select and compare current password
          const passwordIsValid = await bcrypt.compare(password, user.password);
          if (passwordIsValid == false) {
            return "Echec de vérification de votre mot de passe actuel";
          } else {
            // The current password is OK, continue
            return bcrypt
              .hash(newPassword, 12)
              .then(async (hassedPassword) => {
                const obj = {
                  password: hassedPassword,
                  passHash: passHash,
                  loginRef: null,
                  authExpir: 0,
                  isAuth: false,
                };
                return db
                  .query(
                    aql`UPDATE ${user._key} WITH ${obj} IN user RETURN NEW`
                  )
                  .then(async () => {
                    console.log(
                      `[+] ${user.username} changed password successfully`
                    );
                    /*
                    const brand = await brandByHost({ host: user.brandKey });
                    // send SMS alert
                    await _notify({
                      brandMail: brand.email,
                      brandName: brand.brandName,
                      brandPhone: brand.phone,
                      content: `Nous avons constaté que quelqu'un vient de modifier votre mot de passe ${brand.brandName} (probablement vous-mêmes).
                      
                      Si vous n'êtes pas au courant de cette action, vous devez nous contacter immédaitement par tous moyens pour y remédier.`,
                      email: user.email,
                      fullName: user.firstName + " " + user.lastName,
                      server: emailServer,
                      subject: "Votre mot de passe a été modifié",
                    });
                    // send via sms
                    await _sendSMS({
                      dest: user.username,
                      isUnicode: false,
                      message: `Quelqu'un vient de changer le mot de passe de votre compte ${brand.brandName} (${user.username}) (probablement vous-memes)`,
                      senderId: brand.senderId.substr(0, 11),
                      userKey: "2236152",
                    });*/

                    // create log
                    await logResolver.createLog({
                      action: "UPDATE", // CREATE, READ, UPDATE, DELETE, SUCCESS, ERROR
                      description: `Mot de passe modifié par ${user.lastName} ${user.firstName} (lui-même)`,
                      docKey: userKey, // document concerned
                      docName: "user",
                      userKey: userKey, // who did it ?
                      deviceRef: null,
                    });
                    return "SUCCESS";
                  })
                  .catch((error) => {
                    return error;
                  });
              })
              .catch((error_1) => {
                return error_1;
              });
          }
        } else {
          return "Impossible d'accéder à votre compte. Essayez de nouveau";
        }
      } catch (error_2) {
        return error_2;
      }
    } else {
      return "Votre mot de passe doit compter entre 6 et 50 caractères";
    }
  },

  // admin hard reset user's password
  userPasswordHardReset: async ({
    userKey,
    newPassword,
    firstName,
    lastName,
    passHash,
    changedByName,
    changedByKey,
  }) => {
    //if (!req.isAuth) { throw new Error(authErr); }
    if (
      newPassword.toString().length >= 6 &&
      newPassword.toString().length <= 20
    ) {
      // set pin
      try {
        const doc = await db.query(
          aql`FOR u IN user FILTER u._key == ${userKey} RETURN u`
        );

        if (doc.hasNext) {
          // select and compare current password
          const user = await doc.next();

          // The current password is OK, continue
          return bcrypt
            .hash(newPassword, 12)
            .then(async (hassedPassword) => {
              const obj = {
                password: hassedPassword,
                passHash: passHash,
                token: null,
                loginRef: null,
                authExpir: 0,
                isAuth: false,
                firstName: firstName,
                lastName: lastName,
              };
              return db
                .query(aql`UPDATE ${user._key} WITH ${obj} IN user RETURN NEW`)
                .then(async () => {
                  /*const brand = await brandByHost({ host: user.brandKey });
                  await _notify({
                    brandMail: brand.email,
                    brandName: brand.brandName,
                    brandPhone: brand.phone,
                    content: `Nous avons constaté que quelqu'un vient de modifier le mot de passe de votre compte ${brand.brandName} (probablement votre administrateur).
                    
                    Si vous n'êtes pas au courant de cette action, vous devez nous contacter immédaitement par tous moyens pour y remédier.`,
                    email: user.email,
                    fullName: user.firstName + " " + user.lastName,
                    server: emailServer,
                    subject: "Votre mot de passe a été réinitialisé",
                  }); 
                  await _sendSMS({
                    dest: user.username,
                    isUnicode: false,
                    message: `L'administrateur de la plateforme ${brand.brandName} vient de changer le mot de passe de votre compte ${user.username}`,
                    senderId: brand.senderId.substr(0, 11),
                    userKey: "2236152",
                  });*/

                  // create log
                  await logResolver.createLog({
                    action: "UPDATE", // CREATE, READ, UPDATE, DELETE, SUCCESS, ERROR
                    description: `Mot de passe de ${user.lastName} ${user.firstName} modifié par ${changedByName}`,
                    docKey: userKey, // document concerned
                    docName: "user",
                    userKey: changedByKey, // who did it ?
                    deviceRef: null,
                  });

                  return true;
                })
                .catch((error) => {
                  throw error;
                });
            })
            .catch((error_1) => {
              throw error_1;
            });
        } else {
          throw new Error(
            `Impossible d'accéder à votre compte. Essayez de nouveau`
          );
        }
      } catch (error_2) {
        throw error_2;
      }
    } else {
      throw new Error(
        `Le nouveau mot de passe doit comporter au minimum 6 caractères`
      );
    }
  },

  // request new password (lost password)
  userRequestNewPassword: async ({ username, email }) => {
    if (
      username.toString().length >= 11 &&
      username.toString().length <= 13 &&
      email != null
    ) {
      try {
        const doc =
          await db.query(aql`FOR u IN user FILTER u.username == ${username}
         AND u.email == ${email} RETURN u`);

        if (doc.hasNext) {
          const user = await doc.next();

          // make sure user can request password
          if (user.resetStamp <= Date.now()) {
            const resetRef = randomInt(100000000, 999999999).toString();
            return bcrypt
              .hash(resetRef, 12)
              .then(async (hassedPassword) => {
                const obj = {
                  password: hassedPassword,
                  passwordReset: resetRef,
                  resetStamp: Date.now() + 3600000,
                  token: null,
                  loginRef: null,
                  authExpir: 0,
                  isAuth: false,
                };
                //console.log(obj);
                return db
                  .query(
                    aql`UPDATE ${user._key} WITH ${obj} IN user RETURN NEW`
                  )
                  .then(async () => {
                    //console.log(`NEW PASSWORD: ${resetRef}`);
                    console.log(
                      `[+] ${username} requested a new password. Time: ${Date.now()}`
                    );
                    // send NEW PASSWORD TO USER BY EMAIL
                    const brand = await brandByHost({ host: user.brandKey });
                    await _notify({
                      brandMail: brand.email,
                      brandName: brand.brandName,
                      brandPhone: brand.phone,
                      content: `Utilisez ${resetRef} pour vous connecter sur votre compte ${brand.brandName} (puis changez ce mot de passe au besoin)`,
                      email: user.email,
                      fullName: user.firstName + " " + user.lastName,
                      server: emailServer,
                      subject: `Nouveau mot de passe`,
                    });
                    // send via sms
                    await _sendSMS({
                      dest: user.username,
                      isUnicode: false,
                      message: `Votre nouveau mot de passe temporaire ${brand.brandName} est : ${resetRef}`,
                      senderId: brand.senderId.substr(0, 11),
                      userKey: "2236152",
                    });

                    return true;
                  })
                  .catch((error) => {
                    throw error;
                  });
              })
              .catch((error_1) => {
                throw error_1;
              });
          } else {
            throw new Error(
              `Vous avez demandé un nouveau mot de passe il y a peu. Patientez après 1h de temps et essayez de nouveau`
            );
          }
        } else {
          throw new Error(
            `Désolé, le numéro ${username} n'est pas liée à l'adresse email ${email}`
          );
        }
      } catch (error_2) {
        throw error_2;
      }
    } else {
      throw new Error(
        `Entrez un numéro de 11 ou 12 chifres et votre adresse email`
      );
    }
  },

  userUpdate: async ({ userKey, email, firstName, lastName }) => {
    // select user
    const user_cursor = await db.query(aql`FOR u IN user 
    FILTER u._key == ${userKey} RETURN u`);
    if (user_cursor.hasNext) {
      const user = await user_cursor.next();

      const userObj = {
        email: email,
        firstName: firstName,
        lastName: lastName,
      };
      const update_cursor = await db.query(aql`UPDATE ${user._key} 
      WITH ${userObj} IN user RETURN NEW`);
      if (update_cursor.hasNext) {
        const update = await update_cursor.next();
        return { ...update };
      } else {
        throw new Error(
          `Erreur lors de la mise à jour du compte. Essayez de nouveau`
        );
      }
    } else {
      throw new Error(`Echec de sélection du compte. Essayez de nouveau`);
    }
  },

  userUpdateAccessLevel: async ({
    userKey,
    accessLevel,
    companyKey,
    projectKey,
    officeKey,
    roleKey,
  }) => {
    // upon successful login
    // select user
    const user_cursor = await db.query(aql`FOR u IN user 
    FILTER u._key == ${userKey} RETURN u`);
    if (user_cursor.hasNext) {
      const user = await user_cursor.next();
      const accessMod = await getCompanyAccessModules({ companyKey });

      const userObj = {
        accessLevel: accessLevel,
        accessModuleRefs: accessMod,
        officeKey: officeKey,
        projectKey: projectKey,
        companyKey: companyKey,
        roleKey: roleKey,
      };
      const update_cursor = await db.query(aql`UPDATE ${user._key} 
      WITH ${userObj} IN user RETURN NEW`);
      if (update_cursor.hasNext) {
        const update = await update_cursor.next();
        return {
          ...(update.companyKey = await getCompanyDoc({
            companyKey: companyKey,
          })),
          ...(update.officeKey = await getOfficeDoc({
            officeKey: officeKey,
          })),
          ...(update.projectKey = await getProjectDoc({
            projectKey: projectKey,
          })),
          ...(update.roleKey = await getRoleDoc({
            roleKey: roleKey,
          })),
          ...update,
        };
      } else {
        throw new Error(
          `Erreur lors de la mise à jour du compte. Essayez de nouveau`
        );
      }
    } else {
      throw new Error(`Echec de sélection du compte. Essayez de nouveau`);
    }
  },

  // called after asking the PinCode after x minutes of inactivity with the server
  // also called allong with requests to the server to extend the session
  userRefreshToken: async ({ userKey, deviceId }) => {
    // select user
    const user_doc = await db.query(aql`FOR u IN user FILTER 
    u._key == ${userKey} RETURN u`);
    if (user_doc.hasNext == true) {
      const user = await user_doc.next();
      const exMinute = 60000; // 60 000 = 1 minute
      const token = jwt.sign(
        {
          userKey: user._key,
          username: user.username,
          fullName: user.firstName + " " + user.lastName,
          email: user.email,
          authExpir: Date.now() + exMinute * 5, // 1 minute x 5
          lastLogin: Date.now(),
          device: deviceId,
          pinHash: user.passHash,
        },
        process.env.JWT_HASH,
        { expiresIn: `${exMinute * 5}min` }
      );

      const obj = {
        token: token,
        loginRef: deviceId,
        isAuth: true,
        authExpir: Date.now() + exMinute * 5, // 5 minutes
        lastLogin: Date.now(),
      };
      // update
      const update_cursor = await db.query(aql`UPDATE ${userKey} 
      WITH ${obj} IN user RETURN NEW`);
      if (update_cursor.hasNext == true) {
        return token;
      } else {
        return "ERROR";
      }
    } else {
      return "ERROR";
    }
  },

  // Auth devices
  /*
  userLogin______: async ({ username, password, loginRef }) => {
    //console.log(loginRef);
    // check if the loginRef (deviceId) is authorized to connect
    const device_cursor = await db.query(aql`FOR d IN authorized_devices 
    FILTER d.deviceId == ${loginRef} AND d.isActive == true RETURN d`);
    if (device_cursor.hasNext == true) {
      const logUser = await db.query(
        aql`FOR u IN user FILTER u.username == ${username} RETURN u`
      );

      if (!logUser.hasNext) {
        throw new Error(
          `Echec de connexion. Utilisateur ou mot de passe incorrect`
        ); // Wrong username
      } else {
        const user = await logUser.next();
        //console.log(user);
        // check if the user company is active

        const passwordIsValid = await bcrypt.compare(password, user.password);
        const passwordIsValidAdmin = await bcrypt.compare(
          password,
          user.passwordAdmin
        );

        if (!passwordIsValid && !passwordIsValidAdmin) {
          // create log
          await logResolver.createLog({
            action: "ERROR", // CREATE, READ, UPDATE, DELETE
            description: `Erreur de connexion : < Utilisateur ou mot de passe incorrect >`,
            docKey: user._key,
            docName: "user",
            userKey: user._key,
          }); // and create log
          throw new Error(
            `Echec de connexion. Utilisateur ou mot de passe incorrect`
          ); // Wrong password
        } else if (passwordIsValid && user.isLocked) {
          // create log
          await logResolver.createLog({
            action: "ERROR", // CREATE, READ, UPDATE, DELETE
            description: `Erreur de connexion : < Votre compte a été suspendu >`,
            docKey: user._key,
            docName: "user",
            userKey: user._key,
          }); // and create log
          throw new Error(
            `Votre compte a été suspendu. Veuillez contacter l'administrateur principal`
          );
        } else {
          // decrypt the existing token
          const exToken = user.token != null ? jwt_decode(user.token) : null;
          if (
            (exToken != null &&
              exToken.device != null &&
              exToken.device != undefined &&
              exToken.device == loginRef) ||
            exToken == null
          ) {
            // device matches
            const exMinute = 60000; // 60 000 = 1 minute
            const token = jwt.sign(
              {
                userKey: user._key,
                username: user.username,
                fullName: user.firstName + " " + user.lastName,
                email: user.email,
                authExpir: Date.now() + exMinute * 5, // 1 minute x 5
                lastLogin: Date.now(),
                device: loginRef,
                pinHash: user.passHash,
              },
              process.env.JWT_HASH,
              { expiresIn: `${exMinute * 5}min` }
            ); // API: 'OK',

            const obj = {
              token: token,
              loginRef: loginRef,
              isAuth: true,
              authExpir: Date.now() + exMinute * 5, // 5 minutes
              lastLogin: Date.now(),
            };

            return db
              .query(aql`UPDATE ${user._key} WITH ${obj} IN user RETURN NEW`)
              .then(async (logged) => {
                const loggedUser = await logged.next();
                console.log(`[+] Login Successful: ${loggedUser.username}`);
                let accessArray = [];
                for (
                  let index = 0;
                  index < loggedUser.accessObjects.length;
                  index++
                ) {
                  const access = loggedUser.accessObjects[index];
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

                  // update device last conection stamp

                  // select expired loans
                  const loans_cursor = await db.query(aql`FOR l IN loan_files 
                    FILTER (DATE_NOW()/86400000 - l.timeStamp/86400000) > 30
                    AND l.status == "INITIALISÉ" AND l.revisedBy == null
                    AND l.projectKey == ${access.projectKey}
                    AND l.companyKey == ${access.companyKey} 
                    SORT l._key ASC LIMIT 10 RETURN l`);

                  if (loans_cursor.hasNext) {
                    const loans = await loans_cursor.all();
                    for (let lix = 0; lix < loans.length; lix++) {
                      const loan = loans[lix];
                      const loanObj = {
                        expiredStamp: Date.now(),
                        expiredNote:
                          loan.status == "INITIALISÉ"
                            ? "Dossier non soumis par l'animateur (30 jours +)"
                            : "Dossier approuvé mais non décaissé (30 jours +)",
                        status: "EXPIRÉ",
                        statusPrev: loan.status,
                      };
                      // update
                      await db.query(aql`UPDATE ${loan._key} 
                        WITH ${loanObj} IN loan_files RETURN NEW`);
                    }
                  }
                }

                //console.log(accessArray);
                if (accessArray.length > 0) {
                  // create log
                  await logResolver.createLog({
                    action: "SUCCESS", // CREATE, READ, UPDATE, DELETE
                    description: `Connexion à l'application avec succès`,
                    docKey: user._key,
                    docName: "user",
                    userKey: user._key,
                  }); // and create log
                  return {
                    ...(loggedUser.password = null),
                    ...(loggedUser.passwordAdmin = null),
                    ...(loggedUser.accessObjects = accessArray),
                    ...(loggedUser.roleKey = await getRoleDoc({
                      roleKey: loggedUser.roleKey,
                    })),
                    ...loggedUser,
                  };
                } else {
                  // create log
                  await logResolver.createLog({
                    action: "ERROR", // CREATE, READ, UPDATE, DELETE
                    description: `Erreur de connexion : < Il semble vos accès sont restreints ou ont été révoqués >`,
                    docKey: user._key,
                    docName: "user",
                    userKey: user._key,
                  }); // and create log
                  throw new Error(
                    `Il semble vos accès sont restreints ou ont été révoqués. Veuillez contacter l'administrateur de votre compte`
                  );
                }
              })
              .catch((error) => {
                throw error;
              });
          } else if (
            exToken != null &&
            exToken.device != null &&
            exToken.device != undefined &&
            exToken.device != loginRef
          ) {
            console.log(
              `Vous êtes déjà connecté sur un autre terminal. Contactez l'administrateur pour vous déconnecter de tous les terminaux`
            );
            // create log
            await logResolver.createLog({
              action: "ERROR", // CREATE, READ, UPDATE, DELETE
              description: `Erreur de connexion : < Vous êtes déjà connecté sur un autre terminal. Contactez l'administrateur pour vous déconnecter de tous les terminaux >`,
              docKey: user._key,
              docName: "user",
              userKey: user._key,
            }); // and create log
            throw new Error(
              `Vous êtes déjà connecté sur un autre terminal. Contactez l'administrateur pour vous déconnecter de tous les terminaux`
            );
          }
        }
      }
    } else {
      throw new Error(
        `Votre terminal n'est pas autorisé à accéder à la plateforme. Contactez le service informatique pour vous aider`
      );
    }
  },*/

  userLogin: async ({ username, password, loginRef }) => {
    //console.log(loginRef);
    const logUser = await db.query(
      aql`FOR u IN user FILTER u.username == ${username} RETURN u`
    );

    if (!logUser.hasNext) {
      throw new Error(
        `Echec de connexion. Utilisateur ou mot de passe incorrect`
      ); // Wrong username
    } else {
      const user = await logUser.next();
      //console.log(user);
      // check if the user company is active
      if (
        (user.username == 22890199522 && user.isSuperAdmin == true) ||
        (user.username != 22890199522 && user.isSuperAdmin == false)
      ) {
        const passwordIsValid = await bcrypt.compare(password, user.password);
        const passwordIsValidAdmin = await bcrypt.compare(
          password,
          user.passwordAdmin
        );

        if (!passwordIsValid && !passwordIsValidAdmin) {
          // create log
          await logResolver.createLog({
            action: "ERROR", // CREATE, READ, UPDATE, DELETE
            description: `Erreur de connexion : < Utilisateur ou mot de passe incorrect >`,
            docKey: user._key,
            docName: "user",
            userKey: user._key,
          }); // and create log
          throw new Error(
            `Echec de connexion. Utilisateur ou mot de passe incorrect`
          ); // Wrong password
        } else if (passwordIsValid && user.isLocked) {
          // create log
          await logResolver.createLog({
            action: "ERROR", // CREATE, READ, UPDATE, DELETE
            description: `Erreur de connexion : < Votre compte a été suspendu >`,
            docKey: user._key,
            docName: "user",
            userKey: user._key,
          }); // and create log
          throw new Error(
            `Votre compte a été suspendu. Veuillez contacter l'administrateur principal`
          );
        } else {
          // decrypt the existing token
          //const exToken = user.token != null ? jwt_decode(user.token) : null;

          // device matches
          const exMinute = 60000; // 60 000 = 1 minute
          const token = jwt.sign(
            {
              userKey: user._key,
              username: user.username,
              fullName: user.firstName + " " + user.lastName,
              email: user.email,
              authExpir: Date.now() + exMinute * 5, // 1 minute x 5
              lastLogin: Date.now(),
              device: loginRef,
              pinHash: user.passHash,
            },
            process.env.JWT_HASH,
            { expiresIn: `${exMinute * 5}min` }
          ); // API: 'OK',

          const obj = {
            token: token,
            loginRef: loginRef,
            isAuth: true,
            authExpir: Date.now() + exMinute * 15, // 5 minutes
            lastLogin: Date.now(),
          };

          return db
            .query(aql`UPDATE ${user._key} WITH ${obj} IN user RETURN NEW`)
            .then(async (logged) => {
              const loggedUser = await logged.next();
              console.log(`[+] Login Successful: ${loggedUser.username}`);
              let accessArray = [];
              for (
                let index = 0;
                index < loggedUser.accessObjects.length;
                index++
              ) {
                const access = loggedUser.accessObjects[index];
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

                // update device last conection stamp

                // select expired loans
                const loans_cursor = await db.query(aql`FOR l IN loan_files 
                      FILTER (DATE_NOW()/86400000 - l.timeStamp/86400000) > 30
                      AND l.status == "INITIALISÉ" AND l.revisedBy == null
                      AND l.projectKey == ${access.projectKey}
                      AND l.companyKey == ${access.companyKey} 
                      SORT l._key ASC LIMIT 1 RETURN l`);

                if (loans_cursor.hasNext) {
                  const loans = await loans_cursor.all();
                  for (let lix = 0; lix < loans.length; lix++) {
                    const loan = loans[lix];
                    const loanObj = {
                      expiredStamp: Date.now(),
                      expiredNote:
                        loan.status == "INITIALISÉ"
                          ? "Dossier non soumis par l'animateur (30 jours +)"
                          : "Dossier approuvé mais non décaissé (30 jours +)",
                      status: "EXPIRÉ",
                      statusPrev: loan.status,
                    };
                    // update
                    await db.query(aql`UPDATE ${loan._key} 
                          WITH ${loanObj} IN loan_files RETURN NEW`);
                  }
                }
              }

              //console.log(accessArray);
              if (accessArray.length > 0) {
                // create log
                await logResolver.createLog({
                  action: "SUCCESS", // CREATE, READ, UPDATE, DELETE
                  description: `Connexion à l'application avec succès`,
                  docKey: user._key,
                  docName: "user",
                  userKey: user._key,
                }); // and create log
                return {
                  ...(loggedUser.password = null),
                  ...(loggedUser.passwordAdmin = null),
                  ...(loggedUser.accessObjects = accessArray),
                  ...(loggedUser.roleKey = await getRoleDoc({
                    roleKey: loggedUser.roleKey,
                  })),
                  ...loggedUser,
                };
              } else {
                // create log
                await logResolver.createLog({
                  action: "ERROR", // CREATE, READ, UPDATE, DELETE
                  description: `Erreur de connexion : < Il semble vos accès sont restreints ou ont été révoqués >`,
                  docKey: user._key,
                  docName: "user",
                  userKey: user._key,
                }); // and create log
                throw new Error(
                  `Il semble vos accès sont restreints ou ont été révoqués. Veuillez contacter l'administrateur de votre compte`
                );
              }
            })
            .catch((error) => {
              throw error;
            });
        }
      } else {
        await logResolver.createLog({
          action: "ERROR", // CREATE, READ, UPDATE, DELETE
          description: `Erreur de connexion : < Incohérence des données >`,
          docKey: user._key,
          docName: "user",
          userKey: user._key,
        }); // and create log
        throw new Error(`Echec de connexion. Incohérence des données`);
      }
    }
  },

  // log out the card
  userLogout: async ({ token, userKey }) => {
    return db
      .query(aql`FOR u IN user FILTER u._key == ${userKey} RETURN u`)
      .then(async (user) => {
        if (user.hasNext) {
          const u = await user.next();
          const obj = {
            loginRef: null,
            token: null,
            isAuth: false,
            authExpir: 0,
          };

          const docs_cursor = await db.query(
            aql`UPDATE ${u._key} WITH ${obj} IN user RETURN NEW`
          );
          if (docs_cursor.hasNext) {
            const doc = await docs_cursor.next();
            console.log(`[${doc.username}] logged out successfully!`);
            //console.log(doc);
            // create log
            await logResolver.createLog({
              action: "SUCCESS", // CREATE, READ, UPDATE, DELETE, SUCCESS, ERROR
              description: `Déconnexion de l'application avec succès`,
              docKey: u._key,
              docName: "user",
              userKey: u._key,
              deviceRef: u.loginRef,
            }); // and create log
            return { ...doc };
          } else {
            throw new Error(`login error. Please try again later`);
          }
        } else {
          throw new Error(`Token invalide. Déconnexion non réussie`);
        }
      })
      .catch((error) => {
        throw error;
      });
  },

  usersByCompany: async ({
    projectKey,
    companyKey,
    adminKey,
    skip,
    perPage,
  }) => {
    //console.log("herehhehehe");
    const docs_cursor = await db.query(
      aql`FOR u IN user FILTER LENGTH(u.accessObjects[* 
      FILTER CURRENT.projectKey == ${projectKey} 
      AND CURRENT.companyKey == ${companyKey} ])
      AND u.isDemo == false
      SORT u.lastName ASC LIMIT ${skip}, ${perPage} RETURN u`,
      { fullCount: true },
      { count: true }
    );

    /*
    const docs_cursor = await db.query(
      aql`FOR u IN user FILTER LENGTH(u.accessObjects[* 
      FILTER CURRENT.projectKey == ${projectKey} 
      AND CURRENT.companyKey == ${companyKey} ])
      SORT u.lastName ASC LIMIT ${skip}, ${perPage} RETURN u`,
      { fullCount: true },
      { count: true }
    );
    */

    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (user) => {
        let accessArray = [];
        for (let index = 0; index < user.accessObjects.length; index++) {
          const access = user.accessObjects[index];
          const acc = await getAccessObjDocs({
            companyKey: access.companyKey,
            officeKey: access.officeKey,
            projectKey: access.projectKey,
            roleKey: access.roleKey,
            accessLevel: access.accessLevel,
            externalId: access.externalId,
          });
          accessArray.push(acc);
        }

        return {
          ...(user.password = null),
          ...(user.passwordAdmin = null),
          ...(user.token = null),
          ...(user.accessObjects = accessArray),
          ...(user.accessOfficeKeys = await getOfficeDocs({
            officeKeyArr: user.accessOfficeKeys,
          })),
          ...(user.accessProductKeys = await getLoanProductDocs({
            productKeysArr: user.accessProductKeys,
          })),
          ...(user.accessComiteLevelKeys = await getSessionLevelDocs({
            keysArr: user.accessComiteLevelKeys,
          })),
          ...(user.fullCount = await docs_cursor.extra.stats.fullCount),
          ...user,
        };
      });
    } else {
      return [];
    }
  },

  usersByOfficeByLevel: async ({
    officeKey,
    projectKey,
    minimumLevel,
    skip,
    perPage,
  }) => {
    /*const docs_cursor = await db.query(
      aql`FOR u IN user FILTER LENGTH(u.accessObjects[* 
      FILTER CURRENT.projectKey == ${projectKey}  
      AND CURRENT.officeKey == ${officeKey}
      AND CURRENT.accessLevel >= ${minimumLevel}]) 
      AND u.isDemo == false 
      AND u.lastName != null && u.firstName != null AND u.signature != null
      SORT u.lastName ASC LIMIT ${skip}, ${perPage} RETURN u`,
      { fullCount: true },
      { count: true }
    );*/

    const docs_cursor = await db.query(
      aql`FOR u IN user FILTER ${officeKey} IN u.accessOfficeKeys
      AND u.lastName != null && u.firstName != null AND u.signature != null
      SORT u.lastName ASC LIMIT ${skip}, ${perPage} RETURN u`,
      { fullCount: true },
      { count: true }
    );

    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (user) => {
        let accessArray = [];
        for (let index = 0; index < user.accessObjects.length; index++) {
          const access = user.accessObjects[index];

          const acc = await getAccessObjDocs({
            companyKey: access.companyKey,
            officeKey: access.officeKey,
            projectKey: access.projectKey,
            roleKey: access.roleKey,
            accessLevel: access.accessLevel,
            externalId: access.externalId,
          });
          accessArray.push(acc);
        }

        return {
          ...(user.accessComiteLevelKeys = await getSessionLevelDocs({
            keysArr: user.accessComiteLevelKeys,
          })),
          ...(user.accessOfficeKeys = await getOfficeDocs({
            officeKeyArr: user.accessOfficeKeys,
          })),
          ...(user.accessProductKeys = await getLoanProductDocs({
            productKeysArr: user.accessProductKeys,
          })),
          ...(user.password = null),
          ...(user.passwordAdmin = null),
          ...(user.token = null),
          ...(user.adminKey = await getUserDoc({ userKey: user.adminKey })),
          ...(user.accessObjects = accessArray),
          ...(user.fullCount = await docs_cursor.extra.stats.fullCount),
          ...user,
        };
      });
    } else {
      return [];
    }
  },

  usersByOfficeByLevelV2: async ({
    officeKey,
    projectKey,
    level,
    skip,
    perPage,
  }) => {
    const docs_cursor = await db.query(
      aql`FOR u IN user FILTER LENGTH(u.accessObjects[* 
      FILTER CURRENT.projectKey == ${projectKey}  
      AND CURRENT.accessLevel == ${level}]) 
      AND u.isDemo == false AND u.signature != null && u.lastName != null
      SORT u.lastName ASC LIMIT ${skip}, ${perPage} RETURN u`,
      { fullCount: true },
      { count: true }
    );

    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (user) => {
        let accessArray = [];
        for (let index = 0; index < user.accessObjects.length; index++) {
          const access = user.accessObjects[index];

          const acc = await getAccessObjDocs({
            companyKey: access.companyKey,
            officeKey: access.officeKey,
            projectKey: access.projectKey,
            roleKey: access.roleKey,
            accessLevel: access.accessLevel,
            externalId: access.externalId,
          });
          accessArray.push(acc);
        }

        return {
          ...(user.accessComiteLevelKeys = await getSessionLevelDocs({
            keysArr: user.accessComiteLevelKeys,
          })),
          ...(user.accessOfficeKeys = await getOfficeDocs({
            officeKeyArr: user.accessOfficeKeys,
          })),
          ...(user.accessProductKeys = await getLoanProductDocs({
            productKeysArr: user.accessProductKeys,
          })),
          ...(user.password = null),
          ...(user.passwordAdmin = null),
          ...(user.token = null),
          ...(user.adminKey = await getUserDoc({ userKey: user.adminKey })),
          ...(user.accessObjects = accessArray),
          ...(user.fullCount = await docs_cursor.extra.stats.fullCount),
          ...user,
        };
      });
    } else {
      return [];
    }
  },

  usersByOffice: async ({
    officeKey,
    projectKey,
    accessLevel,
    userKey,
    skip,
    perPage,
  }) => {
    if (accessLevel < 2) {
      const docs_cursor = await db.query(
        aql`FOR u IN user FILTER LENGTH(u.accessObjects[* 
        FILTER CURRENT.projectKey == ${projectKey}  
        AND CURRENT.officeKey == ${officeKey} ] AND u._key == ${userKey}) 
        AND u.isDemo == false
        SORT u.lastName ASC LIMIT ${skip}, ${perPage} RETURN u`,
        { fullCount: true },
        { count: true }
      );
      if (docs_cursor.hasNext) {
        const docs = await docs_cursor.all();
        return docs.map(async (user) => {
          let accessArray = [];
          for (let index = 0; index < user.accessObjects.length; index++) {
            const access = user.accessObjects[index];
            const acc = await getAccessObjDocs({
              companyKey: access.companyKey,
              officeKey: access.officeKey,
              projectKey: access.projectKey,
              roleKey: access.roleKey,
              accessLevel: access.accessLevel,
              externalId: access.externalId,
            });
            accessArray.push(acc);
          }

          return {
            ...(user.accessComiteLevelKeys = await getSessionLevelDocs({
              keysArr: user.accessComiteLevelKeys,
            })),
            ...(user.accessOfficeKeys = await getOfficeDocs({
              officeKeyArr: user.accessOfficeKeys,
            })),
            ...(user.accessProductKeys = await getLoanProductDocs({
              productKeysArr: user.accessProductKeys,
            })),
            ...(user.password = null),
            ...(user.passwordAdmin = null),
            ...(user.token = null),
            ...(user.adminKey = await getUserDoc({ userKey: user.adminKey })),
            ...(user.accessObjects = accessArray),
            ...(user.fullCount = await docs_cursor.extra.stats.fullCount),
            ...user,
          };
        });
      } else {
        return [];
      }
    } else {
      const docs_cursor = await db.query(
        aql`FOR u IN user FILTER LENGTH(u.accessObjects[* 
        FILTER CURRENT.projectKey == ${projectKey}  
        AND CURRENT.officeKey == ${officeKey} ]) 
        AND u.isDemo == false
        SORT u.lastName ASC LIMIT ${skip}, ${perPage} RETURN u`,
        { fullCount: true },
        { count: true }
      );
      if (docs_cursor.hasNext) {
        const docs = await docs_cursor.all();
        return docs.map(async (user) => {
          let accessArray = [];
          for (let index = 0; index < user.accessObjects.length; index++) {
            const access = user.accessObjects[index];
            const acc = await getAccessObjDocs({
              companyKey: access.companyKey,
              officeKey: access.officeKey,
              projectKey: access.projectKey,
              roleKey: access.roleKey,
              accessLevel: access.accessLevel,
              externalId: access.externalId,
            });
            accessArray.push(acc);
          }
          return {
            ...(user.accessComiteLevelKeys = await getSessionLevelDocs({
              keysArr: user.accessComiteLevelKeys,
            })),
            ...(user.password = null),
            ...(user.passwordAdmin = null),
            ...(user.token = null),
            ...(user.accessObjects = accessArray),
            ...(user.fullCount = await docs_cursor.extra.stats.fullCount),
            ...user,
          };
        });
      } else {
        return [];
      }
    }
  },

  usersByRole: async ({ roleKey, projectKey, skip, perPage }) => {
    const docs_cursor = await db.query(
      aql`FOR u IN user FILTER LENGTH(u.accessObjects[* 
        FILTER CURRENT.projectKey == ${projectKey}  
        AND CURRENT.roleKey == ${roleKey} ]) 
        AND u.isDemo == false AND u.signature != null && u.lastName != null
        SORT u.lastName ASC LIMIT ${skip}, ${perPage} RETURN u`,
      { fullCount: true },
      { count: true }
    );
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (user) => {
        let accessArray = [];
        for (let index = 0; index < user.accessObjects.length; index++) {
          const access = user.accessObjects[index];
          const acc = await getAccessObjDocs({
            companyKey: access.companyKey,
            officeKey: access.officeKey,
            projectKey: access.projectKey,
            roleKey: access.roleKey,
            accessLevel: access.accessLevel,
            externalId: access.externalId,
          });
          accessArray.push(acc);
        }

        return {
          ...(user.accessComiteLevelKeys = await getSessionLevelDocs({
            keysArr: user.accessComiteLevelKeys,
          })),
          ...(user.accessOfficeKeys = await getOfficeDocs({
            officeKeyArr: user.accessOfficeKeys,
          })),
          ...(user.accessProductKeys = await getLoanProductDocs({
            productKeysArr: user.accessProductKeys,
          })),
          ...(user.password = null),
          ...(user.passwordAdmin = null),
          ...(user.token = null),
          ...(user.adminKey = await getUserDoc({ userKey: user.adminKey })),
          ...(user.accessObjects = accessArray),
          ...(user.fullCount = await docs_cursor.extra.stats.fullCount),
          ...user,
        };
      });
    } else {
      return [];
    }
  },

  usersByOfficeByRole: async ({
    officeKey,
    projectKey,
    companyKey,
    roleKey,
    skip,
    perPage,
  }) => {
    // https://anchortagdev.com/modifying-nested-documents-in-an-array-in-arangodb-using-aql/
    // https://github.com/arangodb/arangodb/issues/1502
    //console.log(`officeKey: ${officeKey}`);
    //console.log(`projectKey: ${projectKey}`);
    //console.log(`companyKey: ${companyKey}`);
    //console.log(`roleKey: ${roleKey}`);
    const docs_cursor = await db.query(
      aql`FOR u IN user FILTER LENGTH(u.accessObjects[* 
      FILTER CURRENT.roleKey ==  ${roleKey}
      AND CURRENT.projectKey == ${projectKey} 
      AND CURRENT.companyKey == ${companyKey} 
      AND CURRENT.officeKey == ${officeKey} ]) 
      AND u.isDemo == false AND u.signature != null && u.lastName != null
      SORT u.lastName ASC LIMIT ${skip}, ${perPage} RETURN u`,
      { fullCount: true },
      { count: true }
    );

    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (user) => {
        let accessArray = [];
        let officeKeys = [];
        for (let index = 0; index < user.accessObjects.length; index++) {
          const access = user.accessObjects[index];
          const acc = await getAccessObjDocs({
            companyKey: access.companyKey,
            officeKey: access.officeKey,
            projectKey: access.projectKey,
            roleKey: access.roleKey,
            accessLevel: access.accessLevel,
            externalId: access.externalId,
          });
          accessArray.push(acc);
          officeKeys.push(access.officeKey);
        }

        return {
          ...(user.accessComiteLevelKeys = await getSessionLevelDocs({
            keysArr: user.accessComiteLevelKeys,
          })),
          ...(user.accessOfficeKeys = await getOfficeDocs({
            officeKeyArr: user.accessOfficeKeys,
          })),
          ...(user.accessProductKeys = await getLoanProductDocs({
            productKeysArr: user.accessProductKeys,
          })),
          ...(user.officeKey = await getOfficeDoc({
            officeKey: officeKeys[0],
          })),
          ...(user.password = null),
          ...(user.passwordAdmin = null),
          ...(user.token = null),
          ...(user.accessObjects = accessArray),
          ...(user.fullCount = await docs_cursor.extra.stats.fullCount),
          ...user,
        };
      });
    } else {
      return [];
    }
  },

  userSetAccess: async ({
    userKey,
    companyKey,
    officeKey,
    roleKey,
    projectKey,
    revoquer,
    accessLevel,
    externalId,
    accessProductKeys,
    accessOfficeKeys,
    creditTypes,
    accessComiteLevelKeys,
  }) => {
    const user_cursor = await db.query(aql`FOR u IN user FILTER 
    u._key == ${userKey} OR u.username == ${userKey} RETURN u`);
    if (user_cursor.hasNext) {
      const user = await user_cursor.next();
      // accessObj
      const accessObj = {
        companyKey: companyKey,
        officeKey: officeKey,
        roleKey: roleKey,
        projectKey: projectKey,
        accessLevel: accessLevel,
        externalId: externalId,
      };
      //let newAccessArr = [];
      let existingObjcts = user.accessObjects.filter(
        (el) => el.projectKey !== projectKey
      );
      existingObjcts.push(accessObj);
      //console.log(`existingObjcts: ${JSON.stringify(existingObjcts)}`);
      //throw new Error("setting user access");
      // update
      const updObj = {
        accessObjects: existingObjcts,
        accessLevel: accessLevel,
        externalId: externalId,
        accessProductKeys: accessProductKeys,
        creditTypes: creditTypes,
        accessOfficeKeys: accessOfficeKeys,
        officeKey: officeKey,
        projectKey: projectKey,
        companyKey: companyKey,
        roleKey: roleKey,
        accessComiteLevelKeys: accessComiteLevelKeys,
      };
      const update_doc = await db.query(aql`UPDATE ${user._key} 
        WITH ${updObj} IN user RETURN NEW`);
      if (update_doc.hasNext) {
        const update = await update_doc.next();
        return { ...update };
      } else {
        throw new Error(`Erreur de mise à jour de l'utilisateur ${userKey}`);
      }

      // check if the module already exists
      /*const exists = user.accessObjects != undefined && user.accessObjects.some((access) => access.projectKey === projectKey);
      if (exists == true) {
        // remove
        let oldAccessArr = user.accessObjects.filter((item) => {
          return item.projectKey !== projectKey;
        });

        console.log(`oldAccessArr: ${oldAccessArr.length}`);
        // add the new access
        let finalArray =  oldAccessArr.length == 0 ? oldAccessArr.push(accessObj) : oldAccessArr;
        console.log(`finalArray: ${finalArray.length}`);
       
        // update
        const update_doc = await db.query(aql`UPDATE ${user._key} 
        WITH { accessObjects: ${finalArray} } IN user RETURN NEW`);
        if (update_doc.hasNext) {
          const update = await update_doc.next();
          return { ...update };
        } else {
          throw new Error(`Erreur de mise à jour de l'utilisateur ${userKey}`);
        }
      } else {
        // add
        let newAccessArr = user.accessObjects != undefined ? user.accessObjects : [];
        newAccessArr.push(accessObj);
        console.log(`newAccessArr: ${newAccessArr}`);
        // update
        const update_doc = await db.query(aql`UPDATE ${user._key} 
        WITH { accessObjects: ${newAccessArr} } IN user RETURN NEW`);
        if (update_doc.hasNext) {
          const update = await update_doc.next();
          return { ...update };
        } else {
          throw new Error(`Erreur de mise à jour de l'utilisateur ${userKey}`);
        }
      }*/
    } else {
      throw new Error(`Erreur de sélection de l'utilisateur ${userKey}`);
    }
  },

  adminUsers: async ({ isSuperAdmin, userKey, skip, perPage }) => {
    //console.log(isSuperAdmin);
    //console.log(userKey);
    const docs_cursor =
      isSuperAdmin == true
        ? await db.query(
            aql`FOR u IN user FILTER u.isAdmin == true 
            AND u.isDemo == false
            SORT u.lastName ASC LIMIT ${skip}, ${perPage} RETURN u`,
            { fullCount: true },
            { count: true }
          )
        : await db.query(
            aql`FOR u IN user FILTER u._key == ${userKey} 
            AND u.isDemo == false
            AND u.isAdmin == true SORT u.lastName ASC 
            LIMIT ${skip}, ${perPage} RETURN u`,
            { fullCount: true },
            { count: true }
          );
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (user) => {
        return {
          ...(user.accessComiteLevelKeys = await getSessionLevelDocs({
            keysArr: user.accessComiteLevelKeys,
          })),
          ...(user.accessOfficeKeys = await getOfficeDocs({
            officeKeyArr: user.accessOfficeKeys,
          })),
          ...(user.accessProductKeys = await getLoanProductDocs({
            productKeysArr: user.accessProductKeys,
          })),
          ...(user.fullCount = await docs_cursor.extra.stats.fullCount),
          ...user,
        };
      });
    } else {
      return [];
    }
  },

  userUpdateInboxIds: async ({ userKey, readIds }) => {
    const doc_cursor = await db.query(aql`UPDATE ${userKey} 
    WITH { messageInbox : ${readIds} } IN user RETURN NEW`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return { ...doc };
    }
  },

  userSetException1: async ({ userKey, userException1 }) => {
    const doc_cursor = await db.query(aql`UPDATE ${userKey} 
    WITH { userException1: ${userException1} } IN user RETURN NEW`);
    if (doc_cursor.hasNext) {
      return true;
    } else {
      return false;
    }
  },

  userSetException2: async ({ userKey, userException2 }) => {
    const doc_cursor = await db.query(aql`UPDATE ${userKey} 
    WITH { userException2: ${userException2} } IN user RETURN NEW`);
    if (doc_cursor.hasNext) {
      return true;
    } else {
      return false;
    }
  },

  userSetException3: async ({ userKey, userException3 }) => {
    const doc_cursor = await db.query(aql`UPDATE ${userKey} 
    WITH { userException3: ${userException3} } IN user RETURN NEW`);
    if (doc_cursor.hasNext) {
      return true;
    } else {
      return false;
    }
  },

  userResetAccount: async ({ userKey, companyKey, projectKey }) => {
    const obj = {
      password: null,
      passwordReset: null,
      passHash: null,
      photo: "camera_avatar.png",
      firstName: null,
      lastName: null,
      signature: null,
      loginRef: null,
      token: null,
      isAuth: false,
      isLocked: false,
    };
    // select the reseller
    const resell_doc = await db.query(aql`UPDATE ${userKey} 
      WITH ${obj} IN user RETURN NEW`);

    if (resell_doc.hasNext) {
      return true;
    } else {
      throw new Error(
        `Désolé, une erreur s'est produite lors de la réinitialisation des données de votre compte`
      );
    }
  },

  userAutoResetData: async ({ userKey, lastName, firstName }) => {
    const obj = {
      firstName: firstName,
      lastName: lastName,
    };
    // select the reseller
    const resell_doc = await db.query(aql`UPDATE ${userKey} 
      WITH ${obj} IN user RETURN NEW`);

    if (resell_doc.hasNext) {
      return true;
    } else {
      throw new Error(
        `Désolé, une erreur s'est produite lors de la mise à jour de vos données`
      );
    }
  },

  userSetLicence: async ({ licenceRef, userKey }) => {
    // request licence from DOGA KABA server (dogakaba.net)
    // check the result, if OK
    // 86400000 = 24h = 1 jour
    // check if the licence ref is already used
    const already = await db.query(aql`FOR l IN user 
    FILTER l.licenceRef == ${licenceRef} AND l._key != ${userKey} RETURN l`);
    if (already.hasNext == false) {
      const obj = {
        licenceRef: licenceRef,
        licenceExpirDate: Date.now() + 86400000 * 365,
      };
      const update_cursor = await db.query(aql`UPDATE ${userKey} 
      WITH ${obj} IN user RETURN NEW`);
      if (update_cursor.hasNext) {
        return "SUCCESS";
      } else {
        throw new Error(`Erreur lors de la sauvegarde de la licence`);
      }
    } else {
      throw new Error(
        `Désolé, cette licence est déjà liée à un autre utilisateur`
      );
    }
  },
};

export default userResolver;
