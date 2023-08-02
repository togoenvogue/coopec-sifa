import { aql, db, serverAppUrl } from "../db/arangodb.js";
import axios from "axios";
import { log } from "console";
import fs from "fs";

const uploadResolver = {
  uploadPhotoAndUpdateDocument: async ({
    uploadedFile,
    index,
    docName,
    docField,
    docKey,
    legende,
  }) => {
    //console.log(`index: ${index}`);
    //console.log(`uploadedFile: ${uploadedFile}`);
    //console.log(`docName: ${docName}`);
    //console.log(`docField: ${docField}`);
    if (
      docKey.length >= 2 &&
      docName.length >= 2 &&
      uploadedFile.length >= 20
    ) {
      let picObj;
      switch (index) {
        case "0":
          picObj = {
            photo: uploadedFile,
            legende: legende,
          };
          break;
        case "1":
          picObj = {
            photo1: uploadedFile,
            legende1: legende,
          };
          break;
        case "2":
          picObj = {
            photo2: uploadedFile,
            legende2: legende,
          };
          break;
        case "3":
          picObj = {
            photo3: uploadedFile,
            legende3: legende,
          };
          break;
        case "4":
          picObj = {
            photo4: uploadedFile,
            legende4: legende,
          };
          break;

        default:
          break;
      }
      const extension = uploadedFile.substr(uploadedFile.length - 4);
      if (extension == ".png" || extension == ".jpg" || extension == "jpeg") {
        const bkObj = {
          timeStamp: Date.now(),
          fileName: uploadedFile,
          type: "IMAGES",
        };

        try {
          if (docName == "user_picture") {
            // select the document
            const doc_cursor = await db.query(aql`FOR u IN user 
            FILTER u._key == ${docKey} RETURN u`);

            if (doc_cursor.hasNext) {
              const doc = await doc_cursor.next();
              const update_cursor = await db.query(aql`UPDATE ${doc._key} 
              WITH ${picObj} IN user RETURN NEW`);
              if (update_cursor.hasNext) {
                // save to the backup table
                await db.query(
                  aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                );
                return {
                  status: 200,
                  fileUrl: uploadedFile,
                  docKey: docKey,
                  message: `La photo de profil a été chargée avec succès.`,
                };
              } else {
                return {
                  status: 403,
                  fileUrl: uploadedFile,
                  docKey: docKey,
                  message: `Erreur de mise à jour du document ${docKey}`,
                };
              }
            } else {
              return {
                status: 403,
                fileUrl: uploadedFile,
                docKey: docKey,
                message: `Erreur de sélection du document ${docKey}`,
              };
            }
          } else if (docName == "user_signature") {
            // set user signature
            const doc_cursor = await db.query(aql`FOR u IN user 
            FILTER u._key == ${docKey} RETURN u`);

            if (doc_cursor.hasNext) {
              const doc = await doc_cursor.next();
              // delete previous signature if available
              if (doc.signature != null && doc.signature.length > 10) {
                /*console.log(`SIGNATURE: ${doc.signature}`);

                const del = await axios.post(`${serverAppUrl}/api/deleteFile`, {
                  file: doc.signature,
                });
                console.log(`del.data: ${del.data}`);

                if (del.data == "OK") {*/
                if ("OK" == "OK") {
                  // file deleted
                  const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                  WITH { signature: ${uploadedFile} } 
                  IN user RETURN NEW`);
                  if (update_cursor.hasNext) {
                    // save to the backup table
                    await db.query(
                      aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                    );
                    return {
                      status: 200,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Votre signature a été sauvegardée avec succès.`,
                    };
                  } else {
                    return {
                      status: 403,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Erreur de mise à jour du document ${docKey}`,
                    };
                  }
                }
              } else {
                // no previous signature to delete, proceed
                const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                WITH { signature: ${uploadedFile} } IN user RETURN NEW`);
                if (update_cursor.hasNext) {
                  return {
                    status: 200,
                    fileUrl: uploadedFile,
                    docKey: docKey,
                    message: `Votre signature a été sauvegardée avec succès.`,
                  };
                } else {
                  return {
                    status: 403,
                    fileUrl: uploadedFile,
                    docKey: docKey,
                    message: `Erreur de mise à jour du document ${docKey}`,
                  };
                }
              }
            } else {
              return {
                status: 403,
                fileUrl: uploadedFile,
                docKey: docKey,
                message: `Erreur de sélection du document ${docKey}`,
              };
            }
          } else if (docName == "client_sig_signature") {
            console.log(`docKey: ${docKey}`);
            // set user signature
            const doc_cursor = await db.query(aql`FOR u IN clients_sig 
            FILTER u._key == ${docKey} RETURN u`);

            if (doc_cursor.hasNext) {
              const doc = await doc_cursor.next();
              // delete previous signature if available
              if (doc.signature != null && doc.signature.length > 10) {
                const del = await axios.post(`${serverAppUrl}/api/deleteFile`, {
                  file: doc.signature,
                });
                if (del.data == "OK") {
                  // file deleted
                  const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                  WITH { signature: ${uploadedFile} } 
                  IN clients_sig RETURN NEW`);
                  if (update_cursor.hasNext) {
                    // save to the backup table
                    await db.query(
                      aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                    );
                    return {
                      status: 200,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Votre signature a été sauvegardée avec succès.`,
                    };
                  } else {
                    return {
                      status: 403,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Erreur de mise à jour du document ${docKey}`,
                    };
                  }
                }
              } else {
                // no previous signature to delete, proceed
                const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                WITH { signature: ${uploadedFile} } IN clients_sig RETURN NEW`);
                if (update_cursor.hasNext) {
                  // save to the backup table
                  await db.query(
                    aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                  );
                  return {
                    status: 200,
                    fileUrl: uploadedFile,
                    docKey: docKey,
                    message: `Votre signature a été sauvegardée avec succès.`,
                  };
                } else {
                  return {
                    status: 403,
                    fileUrl: uploadedFile,
                    docKey: docKey,
                    message: `Erreur de mise à jour du document ${docKey}`,
                  };
                }
              }
            } else {
              return {
                status: 403,
                fileUrl: uploadedFile,
                docKey: docKey,
                message: `Erreur de sélection du document ${docKey}`,
              };
            }
          } else if (docName == "client_sig_picture") {
            // select the document
            const doc_cursor = await db.query(aql`FOR clpf IN clients_sig 
              FILTER clpf._key == ${docKey} RETURN clpf`);
            if (doc_cursor.hasNext) {
              const doc = await doc_cursor.next();
              const update_cursor = await db.query(aql`UPDATE ${doc._key} 
              WITH ${picObj} IN clients_sig RETURN NEW`);
              if (update_cursor.hasNext) {
                // save to the backup table
                await db.query(
                  aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                );
                return {
                  status: 200,
                  fileUrl: uploadedFile,
                  docKey: docKey,
                  message: `Félicitations, la photo a été chargée avec succès.`,
                };
              } else {
                return {
                  status: 403,
                  fileUrl: uploadedFile,
                  docKey: docKey,
                  message: `Erreur de mise à jour du document ${docKey}`,
                };
              }
            } else {
              return {
                status: 403,
                fileUrl: uploadedFile,
                docKey: docKey,
                message: `Erreur de sélection du document ${docKey}`,
              };
            }
          } else if (docName == "client_loan_signature") {
            // set client signatureCredit
            const doc_cursor = await db.query(aql`FOR u IN clients_sig 
            FILTER u._key == ${docKey} RETURN u`);

            if (doc_cursor.hasNext) {
              const doc = await doc_cursor.next();

              // delete previous signatureCredit if available
              if (
                doc.signatureCredit != null &&
                doc.signatureCredit.length > 10
              ) {
                const del = await axios.post(`${serverAppUrl}/api/deleteFile`, {
                  file: doc.signatureCredit,
                });
                console.log(del);
                if (del.data == "OK") {
                  // file deleted
                  const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                  WITH { signatureCredit: ${uploadedFile} } 
                  IN clients_sig RETURN NEW`);
                  if (update_cursor.hasNext) {
                    // save to the backup table
                    await db.query(
                      aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                    );
                    return {
                      status: 200,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Votre signature a été sauvegardée avec succès.`,
                    };
                  } else {
                    return {
                      status: 403,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Erreur de mise à jour du document ${docKey}`,
                    };
                  }
                }
              } else {
                // no previous signature to delete, proceed
                const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                WITH { signatureCredit: ${uploadedFile} } 
                IN clients_sig RETURN NEW`);
                if (update_cursor.hasNext) {
                  // save to the backup table
                  await db.query(
                    aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                  );
                  return {
                    status: 200,
                    fileUrl: uploadedFile,
                    docKey: docKey,
                    message: `Votre signature a été sauvegardée avec succès.`,
                  };
                } else {
                  return {
                    status: 403,
                    fileUrl: uploadedFile,
                    docKey: docKey,
                    message: `Erreur de mise à jour du document ${docKey}`,
                  };
                }
              }
            } else {
              return {
                status: 403,
                fileUrl: uploadedFile,
                docKey: docKey,
                message: `Erreur de sélection du document ${docKey}`,
              };
            }
          } else if (docName == "loan_signature_client") {
            const doc_cursor = await db.query(aql`FOR u IN loan_files 
            FILTER u._key == ${docKey} RETURN u`);

            if (doc_cursor.hasNext) {
              const doc = await doc_cursor.next();

              // delete previous clientSignature if available
              if (
                doc.clientSignature != null &&
                doc.clientSignature.length > 10
              ) {
                const del = await axios.post(`${serverAppUrl}/api/deleteFile`, {
                  file: doc.clientSignature,
                });
                if (del.data == "OK") {
                  // file deleted
                  const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                  WITH { clientSignature: ${uploadedFile} } 
                  IN loan_files RETURN NEW`);
                  if (update_cursor.hasNext) {
                    // save to the backup table
                    await db.query(
                      aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                    );
                    return {
                      status: 200,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Votre signature a été sauvegardée avec succès.`,
                    };
                  } else {
                    return {
                      status: 403,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Erreur de mise à jour du document ${docKey}`,
                    };
                  }
                }
              } else {
                // no previous signature to delete, proceed
                const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                WITH { clientSignature: ${uploadedFile} } 
                IN loan_files RETURN NEW`);
                if (update_cursor.hasNext) {
                  // save to the backup table
                  await db.query(
                    aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                  );
                  return {
                    status: 200,
                    fileUrl: uploadedFile,
                    docKey: docKey,
                    message: `Votre signature a été sauvegardée avec succès.`,
                  };
                } else {
                  return {
                    status: 403,
                    fileUrl: uploadedFile,
                    docKey: docKey,
                    message: `Erreur de mise à jour du document ${docKey}`,
                  };
                }
              }
            } else {
              return {
                status: 403,
                fileUrl: uploadedFile,
                docKey: docKey,
                message: `Erreur de sélection du document ${docKey}`,
              };
            }
          } else if (docName == "loan_signature_agent_credit") {
            const doc_cursor = await db.query(aql`FOR u IN loan_files 
            FILTER u._key == ${docKey} RETURN u`);

            if (doc_cursor.hasNext) {
              const doc = await doc_cursor.next();

              // delete previous signatureAgentCredit if available
              if (
                doc.signatureAgentCredit != null &&
                doc.signatureAgentCredit.length > 10
              ) {
                const del = await axios.post(`${serverAppUrl}/api/deleteFile`, {
                  file: doc.signatureAgentCredit,
                });
                //console.log(`del.data: ${del.data}`);
                if (del.data == "OK") {
                  // file deleted
                  const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                  WITH { signatureAgentCredit: ${uploadedFile} } 
                  IN loan_files RETURN NEW`);
                  if (update_cursor.hasNext) {
                    // save to the backup table
                    await db.query(
                      aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                    );
                    return {
                      status: 200,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Votre signature a été sauvegardée avec succès.`,
                    };
                  } else {
                    return {
                      status: 403,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Erreur de mise à jour du document ${docKey}`,
                    };
                  }
                }
              } else {
                // no previous signature to delete, proceed
                const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                WITH { signatureAgentCredit: ${uploadedFile} } 
                IN loan_files RETURN NEW`);
                if (update_cursor.hasNext) {
                  // save to the backup table
                  await db.query(
                    aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                  );
                  return {
                    status: 200,
                    fileUrl: uploadedFile,
                    docKey: docKey,
                    message: `Votre signature a été sauvegardée avec succès.`,
                  };
                } else {
                  return {
                    status: 403,
                    fileUrl: uploadedFile,
                    docKey: docKey,
                    message: `Erreur de mise à jour du document ${docKey}`,
                  };
                }
              }
            } else {
              return {
                status: 403,
                fileUrl: uploadedFile,
                docKey: docKey,
                message: `Erreur de sélection du document ${docKey}`,
              };
            }
          } else if (docName == "loan_caution_signature") {
            const doc_cursor = await db.query(aql`FOR u IN loan_cautions 
            FILTER u._key == ${docKey} RETURN u`);

            if (doc_cursor.hasNext) {
              const doc = await doc_cursor.next();

              // delete previous signature if available
              if (doc.signature != null && doc.signature.length > 10) {
                const del = await axios.post(`${serverAppUrl}/api/deleteFile`, {
                  file: doc.signature,
                });
                if (del.data == "OK") {
                  // file deleted
                  const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                  WITH { signature: ${uploadedFile} } 
                  IN loan_cautions RETURN NEW`);
                  if (update_cursor.hasNext) {
                    // save to the backup table
                    await db.query(
                      aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                    );
                    return {
                      status: 200,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Votre signature a été sauvegardée avec succès.`,
                    };
                  } else {
                    return {
                      status: 403,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Erreur de mise à jour du document ${docKey}`,
                    };
                  }
                }
              } else {
                // no previous signature to delete, proceed
                const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                WITH { signature: ${uploadedFile} } 
                IN loan_cautions RETURN NEW`);
                if (update_cursor.hasNext) {
                  // save to the backup table
                  await db.query(
                    aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                  );
                  return {
                    status: 200,
                    fileUrl: uploadedFile,
                    docKey: docKey,
                    message: `Votre signature a été sauvegardée avec succès.`,
                  };
                } else {
                  return {
                    status: 403,
                    fileUrl: uploadedFile,
                    docKey: docKey,
                    message: `Erreur de mise à jour du document ${docKey}`,
                  };
                }
              }
            } else {
              return {
                status: 403,
                fileUrl: uploadedFile,
                docKey: docKey,
                message: `Erreur de sélection du document ${docKey}`,
              };
            }
          } else if (docName == "loan_gage_signature_client") {
            const doc_cursor = await db.query(aql`FOR u IN loan_gages 
            FILTER u._key == ${docKey} RETURN u`);

            if (doc_cursor.hasNext) {
              const doc = await doc_cursor.next();
              // delete previous signatureClient if available
              if (
                doc.signatureClient != null &&
                doc.signatureClient.length > 10
              ) {
                const del = await axios.post(`${serverAppUrl}/api/deleteFile`, {
                  file: doc.signatureClient,
                });
                if (del.data == "OK") {
                  // file deleted
                  const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                  WITH { signatureClient: ${uploadedFile} } 
                  IN loan_gages RETURN NEW`);
                  if (update_cursor.hasNext) {
                    // save to the backup table
                    await db.query(
                      aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                    );
                    return {
                      status: 200,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Votre signature a été sauvegardée avec succès.`,
                    };
                  } else {
                    return {
                      status: 403,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Erreur de mise à jour du document ${docKey}`,
                    };
                  }
                }
              } else {
                // no previous signatureClient to delete, proceed
                const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                WITH { signatureClient: ${uploadedFile} } 
                IN loan_gages RETURN NEW`);
                if (update_cursor.hasNext) {
                  // save to the backup table
                  await db.query(
                    aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                  );
                  return {
                    status: 200,
                    fileUrl: uploadedFile,
                    docKey: docKey,
                    message: `Votre signature a été sauvegardée avec succès.`,
                  };
                } else {
                  return {
                    status: 403,
                    fileUrl: uploadedFile,
                    docKey: docKey,
                    message: `Erreur de mise à jour du document ${docKey}`,
                  };
                }
              }
            } else {
              return {
                status: 403,
                fileUrl: uploadedFile,
                docKey: docKey,
                message: `Erreur de sélection du document ${docKey}`,
              };
            }
          } else if (docName == "loan_gage_signature_agent") {
            const doc_cursor = await db.query(aql`FOR u IN loan_gages 
            FILTER u._key == ${docKey} RETURN u`);

            if (doc_cursor.hasNext) {
              const doc = await doc_cursor.next();
              // delete previous signatureAgent if available
              if (
                doc.signatureAgent != null &&
                doc.signatureAgent.length > 10
              ) {
                const del = await axios.post(`${serverAppUrl}/api/deleteFile`, {
                  file: doc.signatureAgent,
                });
                if (del.data == "OK") {
                  // file deleted
                  const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                  WITH { signatureAgent: ${uploadedFile} } 
                  IN loan_gages RETURN NEW`);
                  if (update_cursor.hasNext) {
                    // save to the backup table
                    await db.query(
                      aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                    );
                    return {
                      status: 200,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Votre signature a été sauvegardée avec succès.`,
                    };
                  } else {
                    return {
                      status: 403,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Erreur de mise à jour du document ${docKey}`,
                    };
                  }
                }
              } else {
                // no previous signatureAgent to delete, proceed
                const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                WITH { signatureAgent: ${uploadedFile} } 
                IN loan_gages RETURN NEW`);
                if (update_cursor.hasNext) {
                  // save to the backup table
                  await db.query(
                    aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                  );
                  return {
                    status: 200,
                    fileUrl: uploadedFile,
                    docKey: docKey,
                    message: `Votre signature a été sauvegardée avec succès.`,
                  };
                } else {
                  return {
                    status: 403,
                    fileUrl: uploadedFile,
                    docKey: docKey,
                    message: `Erreur de mise à jour du document ${docKey}`,
                  };
                }
              }
            } else {
              return {
                status: 403,
                fileUrl: uploadedFile,
                docKey: docKey,
                message: `Erreur de sélection du document ${docKey}`,
              };
            }
          } else if (docName == "sms_suivis_data") {
            // set client signatureCredit
            const doc_cursor = await db.query(aql`FOR u IN sms_suivis_data 
            FILTER u._key == ${docKey} RETURN u`);

            if (doc_cursor.hasNext) {
              const doc = await doc_cursor.next();

              if (docField == "signatureClient") {
                if (
                  doc.signatureClient != null &&
                  doc.signatureClient.length > 10
                ) {
                  const del = await axios.post(
                    `${serverAppUrl}/api/deleteFile`,
                    {
                      file: doc.signatureClient,
                    }
                  );
                  if (del.data == "OK") {
                    // file deleted
                    const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                    WITH { signatureClient: ${uploadedFile} } 
                    IN sms_suivis_data RETURN NEW`);
                    if (update_cursor.hasNext) {
                      // save to the backup table
                      await db.query(
                        aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                      );
                      return {
                        status: 200,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Votre signature a été sauvegardée avec succès.`,
                      };
                    } else {
                      return {
                        status: 403,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Erreur de mise à jour du document ${docKey}`,
                      };
                    }
                  }
                } else {
                  // no previous signature to delete, proceed
                  const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                  WITH { signatureClient: ${uploadedFile} } 
                  IN sms_suivis_data RETURN NEW`);
                  if (update_cursor.hasNext) {
                    // save to the backup table
                    await db.query(
                      aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                    );
                    return {
                      status: 200,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Votre signature a été sauvegardée avec succès.`,
                    };
                  } else {
                    return {
                      status: 403,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Erreur de mise à jour du document ${docKey}`,
                    };
                  }
                }
              } else if (docField == "signatureSocialUser") {
                if (
                  doc.signatureSocialUser != null &&
                  doc.signatureSocialUser.length > 10
                ) {
                  const del = await axios.post(
                    `${serverAppUrl}/api/deleteFile`,
                    {
                      file: doc.signatureSocialUser,
                    }
                  );
                  if (del.data == "OK") {
                    // file deleted
                    const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                    WITH { signatureSocialUser: ${uploadedFile} } 
                    IN sms_suivis_data RETURN NEW`);
                    if (update_cursor.hasNext) {
                      // save to the backup table
                      await db.query(
                        aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                      );
                      return {
                        status: 200,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Votre signature a été sauvegardée avec succès.`,
                      };
                    } else {
                      return {
                        status: 403,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Erreur de mise à jour du document ${docKey}`,
                      };
                    }
                  }
                } else {
                  // no previous signature to delete, proceed
                  const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                  WITH { signatureSocialUser: ${uploadedFile} } 
                  IN sms_suivis_data RETURN NEW`);
                  if (update_cursor.hasNext) {
                    // save to the backup table
                    await db.query(
                      aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                    );
                    return {
                      status: 200,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Votre signature a été sauvegardée avec succès.`,
                    };
                  } else {
                    return {
                      status: 403,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Erreur de mise à jour du document ${docKey}`,
                    };
                  }
                }
              }
            } else {
              return {
                status: 403,
                fileUrl: uploadedFile,
                docKey: docKey,
                message: `Erreur de sélection du document ${docKey}`,
              };
            }
          } else if (docName == "sms_referencements") {
            // set client signatureCredit
            const doc_cursor = await db.query(aql`FOR u IN sms_referencements 
            FILTER u._key == ${docKey} RETURN u`);

            if (doc_cursor.hasNext) {
              const doc = await doc_cursor.next();

              if (docField == "signatureClient") {
                if (
                  doc.signatureClient != null &&
                  doc.signatureClient.length > 10 &&
                  doc.photo != "camera_avatar.png"
                ) {
                  const del = await axios.post(
                    `${serverAppUrl}/api/deleteFile`,
                    {
                      file: doc.signatureClient,
                    }
                  );
                  if (del.data == "OK") {
                    // file deleted
                    const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                    WITH { signatureClient: ${uploadedFile} } 
                    IN sms_referencements RETURN NEW`);
                    if (update_cursor.hasNext) {
                      // save to the backup table
                      await db.query(
                        aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                      );
                      return {
                        status: 200,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Votre signature a été sauvegardée avec succès.`,
                      };
                    } else {
                      return {
                        status: 403,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Erreur de mise à jour du document ${docKey}`,
                      };
                    }
                  }
                } else {
                  // no previous signature to delete, proceed
                  const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                  WITH { signatureClient: ${uploadedFile} } 
                  IN sms_referencements RETURN NEW`);
                  if (update_cursor.hasNext) {
                    // save to the backup table
                    await db.query(
                      aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                    );
                    return {
                      status: 200,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Votre signature a été sauvegardée avec succès.`,
                    };
                  } else {
                    return {
                      status: 403,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Erreur de mise à jour du document ${docKey}`,
                    };
                  }
                }
              } else if (docField == "signatureSocialUser") {
                if (
                  doc.signatureSocialUser != null &&
                  doc.signatureSocialUser.length > 10
                ) {
                  const del = await axios.post(
                    `${serverAppUrl}/api/deleteFile`,
                    {
                      file: doc.signatureSocialUser,
                    }
                  );
                  if (del.data == "OK") {
                    // file deleted
                    const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                    WITH { signatureSocialUser: ${uploadedFile} } 
                    IN sms_referencements RETURN NEW`);
                    if (update_cursor.hasNext) {
                      // save to the backup table
                      await db.query(
                        aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                      );
                      return {
                        status: 200,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Votre signature a été sauvegardée avec succès.`,
                      };
                    } else {
                      return {
                        status: 403,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Erreur de mise à jour du document ${docKey}`,
                      };
                    }
                  }
                } else {
                  // no previous signature to delete, proceed
                  const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                  WITH { signatureSocialUser: ${uploadedFile} } 
                  IN sms_referencements RETURN NEW`);
                  if (update_cursor.hasNext) {
                    // save to the backup table
                    await db.query(
                      aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                    );
                    return {
                      status: 200,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Votre signature a été sauvegardée avec succès.`,
                    };
                  } else {
                    return {
                      status: 403,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Erreur de mise à jour du document ${docKey}`,
                    };
                  }
                }
              } else if (docField == "signatureSocialPartner") {
                if (
                  doc.signatureSocialPartner != null &&
                  doc.signatureSocialPartner.length > 10
                ) {
                  const del = await axios.post(
                    `${serverAppUrl}/api/deleteFile`,
                    {
                      file: doc.signatureSocialPartner,
                    }
                  );
                  if (del.data == "OK") {
                    // file deleted
                    const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                    WITH { signatureSocialPartner: ${uploadedFile} } 
                    IN sms_referencements RETURN NEW`);
                    if (update_cursor.hasNext) {
                      // save to the backup table
                      await db.query(
                        aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                      );
                      return {
                        status: 200,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Votre signature a été sauvegardée avec succès.`,
                      };
                    } else {
                      return {
                        status: 403,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Erreur de mise à jour du document ${docKey}`,
                      };
                    }
                  }
                } else {
                  // no previous signature to delete, proceed
                  const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                  WITH { signatureSocialPartner: ${uploadedFile} } 
                  IN sms_referencements RETURN NEW`);
                  if (update_cursor.hasNext) {
                    // save to the backup table
                    await db.query(
                      aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                    );
                    return {
                      status: 200,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Votre signature a été sauvegardée avec succès.`,
                    };
                  } else {
                    return {
                      status: 403,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Erreur de mise à jour du document ${docKey}`,
                    };
                  }
                }
              } else {
                const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                WITH ${picObj} IN sms_referencements RETURN NEW`);
                if (update_cursor.hasNext) {
                  // save to the backup table
                  await db.query(
                    aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                  );
                  return {
                    status: 200,
                    fileUrl: uploadedFile,
                    docKey: docKey,
                    message: `L'image a été chargée avec succès.`,
                  };
                } else {
                  return {
                    status: 403,
                    fileUrl: uploadedFile,
                    docKey: docKey,
                    message: `Erreur de mise à jour du document ${docKey}`,
                  };
                }
              }
            } else {
              return {
                status: 403,
                fileUrl: uploadedFile,
                docKey: docKey,
                message: `Erreur de sélection du document ${docKey}`,
              };
            }
          } else if (docName == "sms_formations_obs") {
            const doc_cursor = await db.query(aql`FOR u IN sms_formations_obs 
            FILTER u._key == ${docKey} RETURN u`);

            if (doc_cursor.hasNext) {
              const doc = await doc_cursor.next();

              if (docField == "signatureAnimateur") {
                if (
                  doc.signatureAnimateur != null &&
                  doc.signatureAnimateur.length > 10
                ) {
                  const del = await axios.post(
                    `${serverAppUrl}/api/deleteFile`,
                    {
                      file: doc.signatureAnimateur,
                    }
                  );
                  if (del.data == "OK") {
                    // file deleted
                    const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                    WITH { signatureAnimateur: ${uploadedFile} } 
                    IN sms_formations_obs RETURN NEW`);
                    if (update_cursor.hasNext) {
                      // save to the backup table
                      await db.query(
                        aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                      );
                      return {
                        status: 200,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Votre signature a été sauvegardée avec succès.`,
                      };
                    } else {
                      return {
                        status: 403,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Erreur de mise à jour du document ${docKey}`,
                      };
                    }
                  }
                } else {
                  // no previous signature to delete, proceed
                  const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                  WITH { signatureAnimateur: ${uploadedFile} } 
                  IN sms_formations_obs RETURN NEW`);
                  if (update_cursor.hasNext) {
                    // save to the backup table
                    await db.query(
                      aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                    );
                    return {
                      status: 200,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Votre signature a été sauvegardée avec succès.`,
                    };
                  } else {
                    return {
                      status: 403,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Erreur de mise à jour du document ${docKey}`,
                    };
                  }
                }
              } else if (docField == "signatureSocialUser") {
                if (
                  doc.signatureSocialUser != null &&
                  doc.signatureSocialUser.length > 10
                ) {
                  const del = await axios.post(
                    `${serverAppUrl}/api/deleteFile`,
                    {
                      file: doc.signatureSocialUser,
                    }
                  );
                  if (del.data == "OK") {
                    // file deleted
                    const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                    WITH { signatureSocialUser: ${uploadedFile} } 
                    IN sms_formations_obs RETURN NEW`);
                    if (update_cursor.hasNext) {
                      // save to the backup table
                      await db.query(
                        aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                      );
                      return {
                        status: 200,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Votre signature a été sauvegardée avec succès.`,
                      };
                    } else {
                      return {
                        status: 403,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Erreur de mise à jour du document ${docKey}`,
                      };
                    }
                  }
                } else {
                  // no previous signature to delete, proceed
                  const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                  WITH { signatureSocialUser: ${uploadedFile} } 
                  IN sms_formations_obs RETURN NEW`);
                  if (update_cursor.hasNext) {
                    // save to the backup table
                    await db.query(
                      aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                    );
                    return {
                      status: 200,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Votre signature a été sauvegardée avec succès.`,
                    };
                  } else {
                    return {
                      status: 403,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Erreur de mise à jour du document ${docKey}`,
                    };
                  }
                }
              }
            } else {
              return {
                status: 403,
                fileUrl: uploadedFile,
                docKey: docKey,
                message: `Erreur de sélection du document ${docKey}`,
              };
            }
          } else if (docName == "sms_formations_anims") {
            const doc_cursor = await db.query(aql`FOR u IN sms_formations_anims 
            FILTER u._key == ${docKey} RETURN u`);

            if (doc_cursor.hasNext) {
              const doc = await doc_cursor.next();

              if (docField == "signaturesAnimateurs") {
                if (
                  doc.signaturesAnimateurs != null &&
                  doc.signaturesAnimateurs.length > 10
                ) {
                  const del = await axios.post(
                    `${serverAppUrl}/api/deleteFile`,
                    {
                      file: doc.signaturesAnimateurs,
                    }
                  );
                  if (del.data == "OK") {
                    // file deleted
                    const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                    WITH { signaturesAnimateurs: ${uploadedFile} } 
                    IN sms_formations_anims RETURN NEW`);
                    if (update_cursor.hasNext) {
                      // save to the backup table
                      await db.query(
                        aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                      );
                      return {
                        status: 200,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Votre signature a été sauvegardée avec succès.`,
                      };
                    } else {
                      return {
                        status: 403,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Erreur de mise à jour du document ${docKey}`,
                      };
                    }
                  }
                } else {
                  // no previous signature to delete, proceed
                  const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                  WITH { signaturesAnimateurs: ${uploadedFile} } 
                  IN sms_formations_anims RETURN NEW`);
                  if (update_cursor.hasNext) {
                    // save to the backup table
                    await db.query(
                      aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                    );
                    return {
                      status: 200,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Votre signature a été sauvegardée avec succès.`,
                    };
                  } else {
                    return {
                      status: 403,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Erreur de mise à jour du document ${docKey}`,
                    };
                  }
                }
              } else if (docField == "signatureSocialUser") {
                if (
                  doc.signatureSocialUser != null &&
                  doc.signatureSocialUser.length > 10
                ) {
                  const del = await axios.post(
                    `${serverAppUrl}/api/deleteFile`,
                    {
                      file: doc.signatureSocialUser,
                    }
                  );
                  if (del.data == "OK") {
                    // file deleted
                    const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                    WITH { signatureSocialUser: ${uploadedFile} } 
                    IN sms_formations_anims RETURN NEW`);
                    if (update_cursor.hasNext) {
                      // save to the backup table
                      await db.query(
                        aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                      );
                      return {
                        status: 200,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Votre signature a été sauvegardée avec succès.`,
                      };
                    } else {
                      return {
                        status: 403,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Erreur de mise à jour du document ${docKey}`,
                      };
                    }
                  }
                } else {
                  // no previous signature to delete, proceed
                  const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                  WITH { signatureSocialUser: ${uploadedFile} } 
                  IN sms_formations_anims RETURN NEW`);
                  if (update_cursor.hasNext) {
                    // save to the backup table
                    await db.query(
                      aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                    );
                    return {
                      status: 200,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Votre signature a été sauvegardée avec succès.`,
                    };
                  } else {
                    return {
                      status: 403,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Erreur de mise à jour du document ${docKey}`,
                    };
                  }
                }
              }
            } else {
              return {
                status: 403,
                fileUrl: uploadedFile,
                docKey: docKey,
                message: `Erreur de sélection du document ${docKey}`,
              };
            }
          } else if (docName == "sms_formations_ts") {
            const doc_cursor = await db.query(aql`FOR u IN sms_formations_ts 
            FILTER u._key == ${docKey} RETURN u`);

            if (doc_cursor.hasNext) {
              const doc = await doc_cursor.next();

              if (docField == "signaturesAnimateurs") {
                if (
                  doc.signaturesAnimateurs != null &&
                  doc.signaturesAnimateurs.length > 10
                ) {
                  const del = await axios.post(
                    `${serverAppUrl}/api/deleteFile`,
                    {
                      file: doc.signaturesAnimateurs,
                    }
                  );
                  if (del.data == "OK") {
                    // file deleted
                    const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                    WITH { signaturesAnimateurs: ${uploadedFile} } 
                    IN sms_formations_ts RETURN NEW`);
                    if (update_cursor.hasNext) {
                      // save to the backup table
                      await db.query(
                        aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                      );
                      return {
                        status: 200,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Votre signature a été sauvegardée avec succès.`,
                      };
                    } else {
                      return {
                        status: 403,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Erreur de mise à jour du document ${docKey}`,
                      };
                    }
                  }
                } else {
                  // no previous signature to delete, proceed
                  const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                  WITH { signaturesAnimateurs: ${uploadedFile} } 
                  IN sms_formations_ts RETURN NEW`);
                  if (update_cursor.hasNext) {
                    // save to the backup table
                    await db.query(
                      aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                    );
                    return {
                      status: 200,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Votre signature a été sauvegardée avec succès.`,
                    };
                  } else {
                    return {
                      status: 403,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Erreur de mise à jour du document ${docKey}`,
                    };
                  }
                }
              } else if (docField == "signatureSocialUser") {
                if (
                  doc.signatureSocialUser != null &&
                  doc.signatureSocialUser.length > 10
                ) {
                  const del = await axios.post(
                    `${serverAppUrl}/api/deleteFile`,
                    {
                      file: doc.signatureSocialUser,
                    }
                  );
                  if (del.data == "OK") {
                    // file deleted
                    const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                    WITH { signatureSocialUser: ${uploadedFile} } 
                    IN sms_formations_ts RETURN NEW`);
                    if (update_cursor.hasNext) {
                      // save to the backup table
                      await db.query(
                        aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                      );
                      return {
                        status: 200,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Votre signature a été sauvegardée avec succès.`,
                      };
                    } else {
                      return {
                        status: 403,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Erreur de mise à jour du document ${docKey}`,
                      };
                    }
                  }
                } else {
                  // no previous signature to delete, proceed
                  const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                  WITH { signatureSocialUser: ${uploadedFile} } 
                  IN sms_formations_ts RETURN NEW`);
                  if (update_cursor.hasNext) {
                    // save to the backup table
                    await db.query(
                      aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                    );
                    return {
                      status: 200,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Votre signature a été sauvegardée avec succès.`,
                    };
                  } else {
                    return {
                      status: 403,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Erreur de mise à jour du document ${docKey}`,
                    };
                  }
                }
              }
            } else {
              return {
                status: 403,
                fileUrl: uploadedFile,
                docKey: docKey,
                message: `Erreur de sélection du document ${docKey}`,
              };
            }
          } else if (docName == "caution_solidaire_picture0") {
            const doc_cursor = await db.query(aql`FOR u IN loan_cautions 
            FILTER u._key == ${docKey} RETURN u`);

            if (doc_cursor.hasNext) {
              const doc = await doc_cursor.next();
              // delete previous photo if available
              if (
                doc.photo != null &&
                doc.photo.length > 10 &&
                doc.photo != "camera_avatar.png"
              ) {
                const del = await axios.post(`${serverAppUrl}/api/deleteFile`, {
                  file: doc.photo,
                });
                if (del.data == "OK") {
                  // file deleted
                  const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                  WITH ${picObj} IN loan_cautions RETURN NEW`);
                  if (update_cursor.hasNext) {
                    // save to the backup table
                    await db.query(
                      aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                    );
                    return {
                      status: 200,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Le fichier (photo) de la caution a été sauvegardé avec succès`,
                    };
                  } else {
                    return {
                      status: 403,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Erreur de mise à jour du document ${docKey}`,
                    };
                  }
                }
              } else {
                // no previous photo to delete, proceed
                const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                WITH ${picObj} IN loan_cautions RETURN NEW`);
                if (update_cursor.hasNext) {
                  // save to the backup table
                  await db.query(
                    aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                  );
                  return {
                    status: 200,
                    fileUrl: uploadedFile,
                    docKey: docKey,
                    message: `Le fichier (photo) de la caution a été sauvegardé avec succès`,
                  };
                } else {
                  return {
                    status: 403,
                    fileUrl: uploadedFile,
                    docKey: docKey,
                    message: `Erreur de mise à jour du document ${docKey}`,
                  };
                }
              }
            } else {
              return {
                status: 403,
                fileUrl: uploadedFile,
                docKey: docKey,
                message: `Erreur de sélection du document ${docKey}`,
              };
            }
          } else if (docName == "caution_solidaire_picture1") {
            const doc_cursor = await db.query(aql`FOR u IN loan_cautions 
            FILTER u._key == ${docKey} RETURN u`);

            if (doc_cursor.hasNext) {
              const doc = await doc_cursor.next();
              // delete previous photo1 if available
              if (
                doc.photo1 != null &&
                doc.photo1.length > 10 &&
                doc.photo1 != "camera_avatar.png"
              ) {
                const del = await axios.post(`${serverAppUrl}/api/deleteFile`, {
                  file: doc.photo1,
                });
                if (del.data == "OK") {
                  // file deleted
                  const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                  WITH ${picObj} IN loan_cautions RETURN NEW`);
                  if (update_cursor.hasNext) {
                    // save to the backup table
                    await db.query(
                      aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                    );
                    return {
                      status: 200,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Le fichier (photo) de la caution a été sauvegardé avec succès`,
                    };
                  } else {
                    return {
                      status: 403,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Erreur de mise à jour du document ${docKey}`,
                    };
                  }
                }
              } else {
                // no previous photo to delete, proceed
                const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                WITH ${picObj} IN loan_cautions RETURN NEW`);
                if (update_cursor.hasNext) {
                  // save to the backup table
                  await db.query(
                    aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                  );
                  return {
                    status: 200,
                    fileUrl: uploadedFile,
                    docKey: docKey,
                    message: `Le fichier (photo) de la caution a été sauvegardé avec succès`,
                  };
                } else {
                  return {
                    status: 403,
                    fileUrl: uploadedFile,
                    docKey: docKey,
                    message: `Erreur de mise à jour du document ${docKey}`,
                  };
                }
              }
            } else {
              return {
                status: 403,
                fileUrl: uploadedFile,
                docKey: docKey,
                message: `Erreur de sélection du document ${docKey}`,
              };
            }
          } else if (docName == "caution_solidaire_picture2") {
            const doc_cursor = await db.query(aql`FOR u IN loan_cautions 
            FILTER u._key == ${docKey} RETURN u`);

            if (doc_cursor.hasNext) {
              const doc = await doc_cursor.next();
              // delete previous photo if available
              if (
                doc.photo2 != null &&
                doc.photo2.length > 10 &&
                doc.photo2 != "camera_avatar.png"
              ) {
                const del = await axios.post(`${serverAppUrl}/api/deleteFile`, {
                  file: doc.photo2,
                });
                if (del.data == "OK") {
                  // file deleted
                  const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                  WITH ${picObj} IN loan_cautions RETURN NEW`);
                  if (update_cursor.hasNext) {
                    // save to the backup table
                    await db.query(
                      aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                    );
                    return {
                      status: 200,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Le fichier (photo) a été sauvegardé avec succès`,
                    };
                  } else {
                    return {
                      status: 403,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Erreur de mise à jour du document ${docKey}`,
                    };
                  }
                }
              } else {
                // no previous photo to delete, proceed
                const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                WITH ${picObj} IN loan_cautions RETURN NEW`);
                if (update_cursor.hasNext) {
                  // save to the backup table
                  await db.query(
                    aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                  );
                  return {
                    status: 200,
                    fileUrl: uploadedFile,
                    docKey: docKey,
                    message: `Le fichier (photo) a été sauvegardé avec succès`,
                  };
                } else {
                  return {
                    status: 403,
                    fileUrl: uploadedFile,
                    docKey: docKey,
                    message: `Erreur de mise à jour du document ${docKey}`,
                  };
                }
              }
            } else {
              return {
                status: 403,
                fileUrl: uploadedFile,
                docKey: docKey,
                message: `Erreur de sélection du document ${docKey}`,
              };
            }
          } else if (docName == "loan_visite_photo0") {
            const doc_cursor = await db.query(aql`FOR u IN loan_suivi 
            FILTER u._key == ${docKey} RETURN u`);

            if (doc_cursor.hasNext) {
              const doc = await doc_cursor.next();

              // delete previous photo if available
              if (
                doc.photo != null &&
                doc.photo.length > 10 &&
                doc.photo != "camera_avatar.png"
              ) {
                const del = await axios.post(`${serverAppUrl}/api/deleteFile`, {
                  file: doc.photo,
                });
                if (del.data == "OK") {
                  // file deleted
                  const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                  WITH ${picObj} IN loan_suivi RETURN NEW`);
                  if (update_cursor.hasNext) {
                    // save to the backup table
                    await db.query(
                      aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                    );
                    return {
                      status: 200,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Le fichier (photo) de la visite a été sauvegardé avec succès`,
                    };
                  } else {
                    return {
                      status: 403,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Erreur de mise à jour du document ${docKey}`,
                    };
                  }
                }
              } else {
                // no previous photo to delete, proceed
                const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                WITH ${picObj} IN loan_suivi RETURN NEW`);
                if (update_cursor.hasNext) {
                  // save to the backup table
                  await db.query(
                    aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                  );
                  return {
                    status: 200,
                    fileUrl: uploadedFile,
                    docKey: docKey,
                    message: `Le fichier (photo) de la visite a été sauvegardé avec succès`,
                  };
                } else {
                  return {
                    status: 403,
                    fileUrl: uploadedFile,
                    docKey: docKey,
                    message: `Erreur de mise à jour du document ${docKey}`,
                  };
                }
              }
            } else {
              return {
                status: 403,
                fileUrl: uploadedFile,
                docKey: docKey,
                message: `Erreur de sélection du document ${docKey}`,
              };
            }
          } else if (docName == "loan_visite_photo1") {
            const doc_cursor = await db.query(aql`FOR u IN loan_suivi 
            FILTER u._key == ${docKey} RETURN u`);

            if (doc_cursor.hasNext) {
              const doc = await doc_cursor.next();
              // delete previous photo1 if available
              if (
                doc.photo1 != null &&
                doc.photo1.length > 10 &&
                doc.photo1 != "camera_avatar.png"
              ) {
                const del = await axios.post(`${serverAppUrl}/api/deleteFile`, {
                  file: doc.photo1,
                });
                if (del.data == "OK") {
                  // file deleted
                  const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                  WITH ${picObj} IN loan_suivi RETURN NEW`);
                  if (update_cursor.hasNext) {
                    // save to the backup table
                    await db.query(
                      aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                    );
                    return {
                      status: 200,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Le fichier (photo) de la visite a été sauvegardé avec succès`,
                    };
                  } else {
                    return {
                      status: 403,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Erreur de mise à jour du document ${docKey}`,
                    };
                  }
                }
              } else {
                // no previous photo to delete, proceed
                const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                WITH ${picObj} IN loan_suivi RETURN NEW`);
                if (update_cursor.hasNext) {
                  // save to the backup table
                  await db.query(
                    aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                  );
                  return {
                    status: 200,
                    fileUrl: uploadedFile,
                    docKey: docKey,
                    message: `Le fichier (photo) de la visite a été sauvegardé avec succès`,
                  };
                } else {
                  return {
                    status: 403,
                    fileUrl: uploadedFile,
                    docKey: docKey,
                    message: `Erreur de mise à jour du document ${docKey}`,
                  };
                }
              }
            } else {
              return {
                status: 403,
                fileUrl: uploadedFile,
                docKey: docKey,
                message: `Erreur de sélection du document ${docKey}`,
              };
            }
          } else if (docName == "loan_group_signatures_membres") {
            // select the loan file
            const doc_cursor = await db.query(aql`FOR l IN loan_files 
            FILTER l._key == ${docKey} RETURN l`);
            if (doc_cursor.hasNext) {
              const doc = await doc_cursor.next();
              // existing filieres array
              let _filieres = doc.filieres;
              let _current = {};

              for (let i = 0; i < _filieres.length; i++) {
                const f = _filieres[i];
                if (f.clientKey === docField) {
                  _current = f;
                }
              }
              // assign the signature
              _current["signature"] = uploadedFile;

              // new filieres array
              let _newFilieres = [];
              _filieres.forEach((f, i) => {
                if (f.clientKey == docField) {
                  _newFilieres.push(_current);
                } else {
                  _newFilieres.push(f);
                }
              });
              // save
              const update = await db.query(aql`UPDATE ${docKey} 
               WITH { filieres: ${_newFilieres} } IN loan_files RETURN NEW`);
              if (update.hasNext) {
                return {
                  status: 200,
                  fileUrl: uploadedFile,
                  docKey: docKey,
                  message: `La signature a été sauvegardée avec succès`,
                };
              } else {
                return {
                  status: 403,
                  fileUrl: uploadedFile,
                  docKey: docKey,
                  message: `Erreur lors de la sauvegarde de la signature`,
                };
              }
            } else {
              return {
                status: 403,
                fileUrl: uploadedFile,
                docKey: docKey,
                message: `Erreur lors de la sélection de la demande`,
              };
            }
          } else if (docName == "loan_group_signatures_comite") {
            // select the loan file
            const doc_cursor = await db.query(aql`FOR l IN loan_files 
            FILTER l._key == ${docKey} RETURN l`);
            if (doc_cursor.hasNext) {
              const doc = await doc_cursor.next();
              // existing groupLoanGestions array
              let _groupLoanGestions = doc.groupLoanGestions;
              let _current = {};

              for (let i = 0; i < _groupLoanGestions.length; i++) {
                const f = _groupLoanGestions[i];
                if (f.clientKey === docField) {
                  _current = f;
                }
              }
              // assign the signature
              _current["signature"] = uploadedFile;

              // new groupLoanGestions array
              let _newGroupLoanGestions = [];
              _groupLoanGestions.forEach((f, i) => {
                if (f.clientKey == docField) {
                  _newGroupLoanGestions.push(_current);
                } else {
                  _newGroupLoanGestions.push(f);
                }
              });
              // save
              const update = await db.query(aql`UPDATE ${docKey} 
               WITH { groupLoanGestions: ${_newGroupLoanGestions} } 
               IN loan_files RETURN NEW`);
              if (update.hasNext) {
                return {
                  status: 200,
                  fileUrl: uploadedFile,
                  docKey: docKey,
                  message: `La signature a été sauvegardée avec succès`,
                };
              } else {
                return {
                  status: 403,
                  fileUrl: uploadedFile,
                  docKey: docKey,
                  message: `Erreur lors de la sauvegarde de la signature`,
                };
              }
            } else {
              return {
                status: 403,
                fileUrl: uploadedFile,
                docKey: docKey,
                message: `Erreur lors de la sélection de la demande`,
              };
            }
          } else if (docName == "xxxx") {
          } else if (docName == "xxxx") {
          } else if (docName == "xxxx") {
          } else if (docName == "xxxx") {
          }
        } catch (err) {
          console.log(err);
          return {
            status: 403,
            fileUrl: uploadedFile,
            message: err,
          };
        }
      } else {
        return {
          status: 403,
          fileUrl: uploadedFile,
          docKey: docKey,
          message: `Chargez une image avec une extension .png, .jpg ou .jpeg`,
        };
      }
      //
    } else {
      return {
        status: 404,
        fileUrl: null,
        docKey: docKey,
        message: `Photo non chargée. Il manque des données`,
      };
    }
  },

  deletePhotoAndUpdateDocument: async ({
    uploadedFile, // existing picture to delete
    index,
    docKey,
    docName,
  }) => {
    if (
      docKey.length >= 2 &&
      docName.length >= 2 &&
      uploadedFile.length >= 20
    ) {
      let picObj;
      switch (index) {
        case "0":
          picObj = {
            photo: "camera_avatar.png",
            legende: null,
          };
          break;
        case "1":
          picObj = {
            photo1: "camera_avatar.png",
            legend1: null,
          };
          break;
        case "2":
          picObj = {
            photo2: "camera_avatar.png",
            legend2: null,
          };
          break;
        case "3":
          picObj = {
            photo3: "camera_avatar.png",
            legend3: null,
          };
          break;
        case "4":
          picObj = {
            photo4: "camera_avatar.png",
            legend4: null,
          };
          break;

        default:
          break;
      }

      const extension = uploadedFile.substr(uploadedFile.length - 4);
      if (extension == ".png" || extension == ".jpg" || extension == "jpeg") {
        const bkObj = {
          timeStamp: Date.now(),
          fileName: uploadedFile,
          type: "IMAGES",
        };

        try {
          if (docName == "user_picture") {
            // select the document
            const doc_cursor = await db.query(aql`FOR u IN user 
            FILTER u._key == ${docKey} RETURN u`);

            if (doc_cursor.hasNext) {
              const doc = await doc_cursor.next();
              const update_cursor = await db.query(aql`UPDATE ${doc._key} 
              WITH ${picObj} IN user RETURN NEW`);
              if (update_cursor.hasNext) {
                // save to the backup table
                await db.query(
                  aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                );
                return {
                  status: 200,
                  fileUrl: uploadedFile,
                  docKey: docKey,
                  message: `La photo de profil a été chargée avec succès.`,
                };
              } else {
                return {
                  status: 403,
                  fileUrl: uploadedFile,
                  docKey: docKey,
                  message: `Erreur de mise à jour du document ${docKey}`,
                };
              }
            } else {
              return {
                status: 403,
                fileUrl: uploadedFile,
                docKey: docKey,
                message: `Erreur de sélection du document ${docKey}`,
              };
            }
          } else if (docName == "user_signature") {
            // set user signature
            const doc_cursor = await db.query(aql`FOR u IN user 
            FILTER u._key == ${docKey} RETURN u`);

            if (doc_cursor.hasNext) {
              const doc = await doc_cursor.next();
              // delete previous signature if available
              if (doc.signature != null && doc.signature.length > 10) {
                /*console.log(`SIGNATURE: ${doc.signature}`);

                const del = await axios.post(`${serverAppUrl}/api/deleteFile`, {
                  file: doc.signature,
                });
                console.log(`del.data: ${del.data}`);

                if (del.data == "OK") {*/
                if ("OK" == "OK") {
                  // file deleted
                  const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                  WITH { signature: ${uploadedFile} } 
                  IN user RETURN NEW`);
                  if (update_cursor.hasNext) {
                    // save to the backup table
                    await db.query(
                      aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                    );
                    return {
                      status: 200,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Votre signature a été sauvegardée avec succès.`,
                    };
                  } else {
                    return {
                      status: 403,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Erreur de mise à jour du document ${docKey}`,
                    };
                  }
                }
              } else {
                // no previous signature to delete, proceed
                const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                WITH { signature: ${uploadedFile} } IN user RETURN NEW`);
                if (update_cursor.hasNext) {
                  return {
                    status: 200,
                    fileUrl: uploadedFile,
                    docKey: docKey,
                    message: `Votre signature a été sauvegardée avec succès.`,
                  };
                } else {
                  return {
                    status: 403,
                    fileUrl: uploadedFile,
                    docKey: docKey,
                    message: `Erreur de mise à jour du document ${docKey}`,
                  };
                }
              }
            } else {
              return {
                status: 403,
                fileUrl: uploadedFile,
                docKey: docKey,
                message: `Erreur de sélection du document ${docKey}`,
              };
            }
          } else if (docName == "client_sig_signature") {
            // set user signature
            const doc_cursor = await db.query(aql`FOR u IN clients_sig 
            FILTER u._key == ${docKey} RETURN u`);

            if (doc_cursor.hasNext) {
              const doc = await doc_cursor.next();
              // delete previous signature if available
              if (doc.signature != null && doc.signature.length > 10) {
                const del = await axios.post(`${serverAppUrl}/api/deleteFile`, {
                  file: doc.signature,
                });
                if (del.data == "OK") {
                  // file deleted
                  const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                  WITH { signature: ${uploadedFile} } 
                  IN clients_sig RETURN NEW`);
                  if (update_cursor.hasNext) {
                    // save to the backup table
                    await db.query(
                      aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                    );
                    return {
                      status: 200,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Votre signature a été sauvegardée avec succès.`,
                    };
                  } else {
                    return {
                      status: 403,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Erreur de mise à jour du document ${docKey}`,
                    };
                  }
                }
              } else {
                // no previous signature to delete, proceed
                const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                WITH { signature: ${uploadedFile} } IN clients_sig RETURN NEW`);
                if (update_cursor.hasNext) {
                  // save to the backup table
                  await db.query(
                    aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                  );
                  return {
                    status: 200,
                    fileUrl: uploadedFile,
                    docKey: docKey,
                    message: `Votre signature a été sauvegardée avec succès.`,
                  };
                } else {
                  return {
                    status: 403,
                    fileUrl: uploadedFile,
                    docKey: docKey,
                    message: `Erreur de mise à jour du document ${docKey}`,
                  };
                }
              }
            } else {
              return {
                status: 403,
                fileUrl: uploadedFile,
                docKey: docKey,
                message: `Erreur de sélection du document ${docKey}`,
              };
            }
          } else if (docName == "client_sig_picture") {
            // select the document
            const doc_cursor = await db.query(aql`FOR clpf IN clients_sig 
              FILTER clpf._key == ${docKey} RETURN clpf`);
            if (doc_cursor.hasNext) {
              const doc = await doc_cursor.next();
              const update_cursor = await db.query(aql`UPDATE ${doc._key} 
              WITH ${picObj} IN clients_sig RETURN NEW`);
              if (update_cursor.hasNext) {
                // save to the backup table
                await db.query(
                  aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                );
                return {
                  status: 200,
                  fileUrl: uploadedFile,
                  docKey: docKey,
                  message: `La photo a été chargée avec succès.`,
                };
              } else {
                return {
                  status: 403,
                  fileUrl: uploadedFile,
                  docKey: docKey,
                  message: `Erreur de mise à jour du document ${docKey}`,
                };
              }
            } else {
              return {
                status: 403,
                fileUrl: uploadedFile,
                docKey: docKey,
                message: `Erreur de sélection du document ${docKey}`,
              };
            }
          } else if (docName == "client_loan_signature") {
            // set client signatureCredit
            const doc_cursor = await db.query(aql`FOR u IN clients_sig 
            FILTER u._key == ${docKey} RETURN u`);

            if (doc_cursor.hasNext) {
              const doc = await doc_cursor.next();

              // delete previous signatureCredit if available
              if (
                doc.signatureCredit != null &&
                doc.signatureCredit.length > 10
              ) {
                const del = await axios.post(`${serverAppUrl}/api/deleteFile`, {
                  file: doc.signatureCredit,
                });
                console.log(del);
                if (del.data == "OK") {
                  // file deleted
                  const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                  WITH { signatureCredit: ${uploadedFile} } 
                  IN clients_sig RETURN NEW`);
                  if (update_cursor.hasNext) {
                    // save to the backup table
                    await db.query(
                      aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                    );
                    return {
                      status: 200,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Votre signature a été sauvegardée avec succès.`,
                    };
                  } else {
                    return {
                      status: 403,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Erreur de mise à jour du document ${docKey}`,
                    };
                  }
                }
              } else {
                // no previous signature to delete, proceed
                const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                WITH { signatureCredit: ${uploadedFile} } 
                IN clients_sig RETURN NEW`);
                if (update_cursor.hasNext) {
                  // save to the backup table
                  await db.query(
                    aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                  );
                  return {
                    status: 200,
                    fileUrl: uploadedFile,
                    docKey: docKey,
                    message: `Votre signature a été sauvegardée avec succès.`,
                  };
                } else {
                  return {
                    status: 403,
                    fileUrl: uploadedFile,
                    docKey: docKey,
                    message: `Erreur de mise à jour du document ${docKey}`,
                  };
                }
              }
            } else {
              return {
                status: 403,
                fileUrl: uploadedFile,
                docKey: docKey,
                message: `Erreur de sélection du document ${docKey}`,
              };
            }
          } else if (docName == "sms_suivis_data") {
            // set client signatureCredit
            const doc_cursor = await db.query(aql`FOR u IN sms_suivis_data 
            FILTER u._key == ${docKey} RETURN u`);

            if (doc_cursor.hasNext) {
              const doc = await doc_cursor.next();

              if (docField == "signatureClient") {
                if (
                  doc.signatureClient != null &&
                  doc.signatureClient.length > 10
                ) {
                  const del = await axios.post(
                    `${serverAppUrl}/api/deleteFile`,
                    {
                      file: doc.signatureClient,
                    }
                  );
                  if (del.data == "OK") {
                    // file deleted
                    const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                    WITH { signatureClient: ${uploadedFile} } 
                    IN sms_suivis_data RETURN NEW`);
                    if (update_cursor.hasNext) {
                      // save to the backup table
                      await db.query(
                        aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                      );
                      return {
                        status: 200,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Votre signature a été sauvegardée avec succès.`,
                      };
                    } else {
                      return {
                        status: 403,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Erreur de mise à jour du document ${docKey}`,
                      };
                    }
                  }
                } else {
                  // no previous signature to delete, proceed
                  const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                  WITH { signatureClient: ${uploadedFile} } 
                  IN sms_suivis_data RETURN NEW`);
                  if (update_cursor.hasNext) {
                    // save to the backup table
                    await db.query(
                      aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                    );
                    return {
                      status: 200,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Votre signature a été sauvegardée avec succès.`,
                    };
                  } else {
                    return {
                      status: 403,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Erreur de mise à jour du document ${docKey}`,
                    };
                  }
                }
              } else if (docField == "signatureSocialUser") {
                if (
                  doc.signatureSocialUser != null &&
                  doc.signatureSocialUser.length > 10
                ) {
                  const del = await axios.post(
                    `${serverAppUrl}/api/deleteFile`,
                    {
                      file: doc.signatureSocialUser,
                    }
                  );
                  if (del.data == "OK") {
                    // file deleted
                    const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                    WITH { signatureSocialUser: ${uploadedFile} } 
                    IN sms_suivis_data RETURN NEW`);
                    if (update_cursor.hasNext) {
                      // save to the backup table
                      await db.query(
                        aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                      );
                      return {
                        status: 200,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Votre signature a été sauvegardée avec succès.`,
                      };
                    } else {
                      return {
                        status: 403,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Erreur de mise à jour du document ${docKey}`,
                      };
                    }
                  }
                } else {
                  // no previous signature to delete, proceed
                  const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                  WITH { signatureSocialUser: ${uploadedFile} } 
                  IN sms_suivis_data RETURN NEW`);
                  if (update_cursor.hasNext) {
                    // save to the backup table
                    await db.query(
                      aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                    );
                    return {
                      status: 200,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Votre signature a été sauvegardée avec succès.`,
                    };
                  } else {
                    return {
                      status: 403,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Erreur de mise à jour du document ${docKey}`,
                    };
                  }
                }
              }
            } else {
              return {
                status: 403,
                fileUrl: uploadedFile,
                docKey: docKey,
                message: `Erreur de sélection du document ${docKey}`,
              };
            }
          } else if (docName == "sms_referencements") {
            // set client signatureCredit
            const doc_cursor = await db.query(aql`FOR u IN sms_referencements 
            FILTER u._key == ${docKey} RETURN u`);

            if (doc_cursor.hasNext) {
              const doc = await doc_cursor.next();
              // check if the old picture is the one in the document
              if (uploadedFile == doc.signatureClient) {
                const del = await axios.post(`${serverAppUrl}/api/deleteFile`, {
                  file: doc.signatureClient,
                });
                console.log(del);
                if (del.status == 200 && del.data == "OK") {
                  // file deleted
                  const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                    WITH { signatureClient: null } 
                    IN sms_referencements RETURN NEW`);
                  if (update_cursor.hasNext) {
                    // save to the backup table
                    await db.query(
                      aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                    );
                    return {
                      status: 200,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `La signature du client a été supprimée avec succès.`,
                    };
                  } else {
                    return {
                      status: 403,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Erreur de réinitialisation de la signature du client`,
                    };
                  }
                } else {
                  // picture not deleted
                  return {
                    status: 403,
                    fileUrl: uploadedFile,
                    docKey: docKey,
                    message: `Erreur de suppression de l'image`,
                  };
                }
              } else if (uploadedFile == doc.signatureSocialUser) {
              } else if (uploadedFile == doc.signatureSocialPartner) {
              } else if (uploadedFile == doc.photo) {
              } else if (uploadedFile == doc.photo1) {
              } else if (uploadedFile == doc.photo2) {
              } else if (uploadedFile == doc.photo3) {
              }
            } else {
              return {
                status: 403,
                fileUrl: uploadedFile,
                docKey: docKey,
                message: `Erreur de sélection du document ${docKey}`,
              };
            }
          } else if (docName == "sms_formations_obs") {
            const doc_cursor = await db.query(aql`FOR u IN sms_formations_obs 
            FILTER u._key == ${docKey} RETURN u`);

            if (doc_cursor.hasNext) {
              const doc = await doc_cursor.next();

              if (docField == "signatureAnimateur") {
                if (
                  doc.signatureAnimateur != null &&
                  doc.signatureAnimateur.length > 10
                ) {
                  const del = await axios.post(
                    `${serverAppUrl}/api/deleteFile`,
                    {
                      file: doc.signatureAnimateur,
                    }
                  );
                  if (del.data == "OK") {
                    // file deleted
                    const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                    WITH { signatureAnimateur: ${uploadedFile} } 
                    IN sms_formations_obs RETURN NEW`);
                    if (update_cursor.hasNext) {
                      // save to the backup table
                      await db.query(
                        aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                      );
                      return {
                        status: 200,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Votre signature a été sauvegardée avec succès.`,
                      };
                    } else {
                      return {
                        status: 403,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Erreur de mise à jour du document ${docKey}`,
                      };
                    }
                  }
                } else {
                  // no previous signature to delete, proceed
                  const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                  WITH { signatureAnimateur: ${uploadedFile} } 
                  IN sms_formations_obs RETURN NEW`);
                  if (update_cursor.hasNext) {
                    // save to the backup table
                    await db.query(
                      aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                    );
                    return {
                      status: 200,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Votre signature a été sauvegardée avec succès.`,
                    };
                  } else {
                    return {
                      status: 403,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Erreur de mise à jour du document ${docKey}`,
                    };
                  }
                }
              } else if (docField == "signatureSocialUser") {
                if (
                  doc.signatureSocialUser != null &&
                  doc.signatureSocialUser.length > 10
                ) {
                  const del = await axios.post(
                    `${serverAppUrl}/api/deleteFile`,
                    {
                      file: doc.signatureSocialUser,
                    }
                  );
                  if (del.data == "OK") {
                    // file deleted
                    const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                    WITH { signatureSocialUser: ${uploadedFile} } 
                    IN sms_formations_obs RETURN NEW`);
                    if (update_cursor.hasNext) {
                      // save to the backup table
                      await db.query(
                        aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                      );
                      return {
                        status: 200,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Votre signature a été sauvegardée avec succès.`,
                      };
                    } else {
                      return {
                        status: 403,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Erreur de mise à jour du document ${docKey}`,
                      };
                    }
                  }
                } else {
                  // no previous signature to delete, proceed
                  const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                  WITH { signatureSocialUser: ${uploadedFile} } 
                  IN sms_formations_obs RETURN NEW`);
                  if (update_cursor.hasNext) {
                    // save to the backup table
                    await db.query(
                      aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                    );
                    return {
                      status: 200,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Votre signature a été sauvegardée avec succès.`,
                    };
                  } else {
                    return {
                      status: 403,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Erreur de mise à jour du document ${docKey}`,
                    };
                  }
                }
              }
            } else {
              return {
                status: 403,
                fileUrl: uploadedFile,
                docKey: docKey,
                message: `Erreur de sélection du document ${docKey}`,
              };
            }
          } else if (docName == "sms_formations_anims") {
            const doc_cursor = await db.query(aql`FOR u IN sms_formations_anims 
            FILTER u._key == ${docKey} RETURN u`);

            if (doc_cursor.hasNext) {
              const doc = await doc_cursor.next();

              if (docField == "signaturesAnimateurs") {
                if (
                  doc.signaturesAnimateurs != null &&
                  doc.signaturesAnimateurs.length > 10
                ) {
                  const del = await axios.post(
                    `${serverAppUrl}/api/deleteFile`,
                    {
                      file: doc.signaturesAnimateurs,
                    }
                  );
                  if (del.data == "OK") {
                    // file deleted
                    const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                    WITH { signaturesAnimateurs: ${uploadedFile} } 
                    IN sms_formations_anims RETURN NEW`);
                    if (update_cursor.hasNext) {
                      // save to the backup table
                      await db.query(
                        aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                      );
                      return {
                        status: 200,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Votre signature a été sauvegardée avec succès.`,
                      };
                    } else {
                      return {
                        status: 403,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Erreur de mise à jour du document ${docKey}`,
                      };
                    }
                  }
                } else {
                  // no previous signature to delete, proceed
                  const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                  WITH { signaturesAnimateurs: ${uploadedFile} } 
                  IN sms_formations_anims RETURN NEW`);
                  if (update_cursor.hasNext) {
                    // save to the backup table
                    await db.query(
                      aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                    );
                    return {
                      status: 200,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Votre signature a été sauvegardée avec succès.`,
                    };
                  } else {
                    return {
                      status: 403,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Erreur de mise à jour du document ${docKey}`,
                    };
                  }
                }
              } else if (docField == "signatureSocialUser") {
                if (
                  doc.signatureSocialUser != null &&
                  doc.signatureSocialUser.length > 10
                ) {
                  const del = await axios.post(
                    `${serverAppUrl}/api/deleteFile`,
                    {
                      file: doc.signatureSocialUser,
                    }
                  );
                  if (del.data == "OK") {
                    // file deleted
                    const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                    WITH { signatureSocialUser: ${uploadedFile} } 
                    IN sms_formations_anims RETURN NEW`);
                    if (update_cursor.hasNext) {
                      // save to the backup table
                      await db.query(
                        aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                      );
                      return {
                        status: 200,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Votre signature a été sauvegardée avec succès.`,
                      };
                    } else {
                      return {
                        status: 403,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Erreur de mise à jour du document ${docKey}`,
                      };
                    }
                  }
                } else {
                  // no previous signature to delete, proceed
                  const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                  WITH { signatureSocialUser: ${uploadedFile} } 
                  IN sms_formations_anims RETURN NEW`);
                  if (update_cursor.hasNext) {
                    // save to the backup table
                    await db.query(
                      aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                    );
                    return {
                      status: 200,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Votre signature a été sauvegardée avec succès.`,
                    };
                  } else {
                    return {
                      status: 403,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Erreur de mise à jour du document ${docKey}`,
                    };
                  }
                }
              }
            } else {
              return {
                status: 403,
                fileUrl: uploadedFile,
                docKey: docKey,
                message: `Erreur de sélection du document ${docKey}`,
              };
            }
          } else if (docName == "sms_formations_ts") {
            const doc_cursor = await db.query(aql`FOR u IN sms_formations_ts 
            FILTER u._key == ${docKey} RETURN u`);

            if (doc_cursor.hasNext) {
              const doc = await doc_cursor.next();

              if (docField == "signaturesAnimateurs") {
                if (
                  doc.signaturesAnimateurs != null &&
                  doc.signaturesAnimateurs.length > 10
                ) {
                  const del = await axios.post(
                    `${serverAppUrl}/api/deleteFile`,
                    {
                      file: doc.signaturesAnimateurs,
                    }
                  );
                  if (del.data == "OK") {
                    // file deleted
                    const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                    WITH { signaturesAnimateurs: ${uploadedFile} } 
                    IN sms_formations_ts RETURN NEW`);
                    if (update_cursor.hasNext) {
                      // save to the backup table
                      await db.query(
                        aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                      );
                      return {
                        status: 200,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Votre signature a été sauvegardée avec succès.`,
                      };
                    } else {
                      return {
                        status: 403,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Erreur de mise à jour du document ${docKey}`,
                      };
                    }
                  }
                } else {
                  // no previous signature to delete, proceed
                  const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                  WITH { signaturesAnimateurs: ${uploadedFile} } 
                  IN sms_formations_ts RETURN NEW`);
                  if (update_cursor.hasNext) {
                    // save to the backup table
                    await db.query(
                      aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                    );
                    return {
                      status: 200,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Votre signature a été sauvegardée avec succès.`,
                    };
                  } else {
                    return {
                      status: 403,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Erreur de mise à jour du document ${docKey}`,
                    };
                  }
                }
              } else if (docField == "signatureSocialUser") {
                if (
                  doc.signatureSocialUser != null &&
                  doc.signatureSocialUser.length > 10
                ) {
                  const del = await axios.post(
                    `${serverAppUrl}/api/deleteFile`,
                    {
                      file: doc.signatureSocialUser,
                    }
                  );
                  if (del.data == "OK") {
                    // file deleted
                    const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                    WITH { signatureSocialUser: ${uploadedFile} } 
                    IN sms_formations_ts RETURN NEW`);
                    if (update_cursor.hasNext) {
                      // save to the backup table
                      await db.query(
                        aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                      );
                      return {
                        status: 200,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Votre signature a été sauvegardée avec succès.`,
                      };
                    } else {
                      return {
                        status: 403,
                        fileUrl: uploadedFile,
                        docKey: docKey,
                        message: `Erreur de mise à jour du document ${docKey}`,
                      };
                    }
                  }
                } else {
                  // no previous signature to delete, proceed
                  const update_cursor = await db.query(aql`UPDATE ${doc._key} 
                  WITH { signatureSocialUser: ${uploadedFile} } 
                  IN sms_formations_ts RETURN NEW`);
                  if (update_cursor.hasNext) {
                    // save to the backup table
                    await db.query(
                      aql`INSERT ${bkObj} INTO backup_files RETURN NEW`
                    );
                    return {
                      status: 200,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Votre signature a été sauvegardée avec succès.`,
                    };
                  } else {
                    return {
                      status: 403,
                      fileUrl: uploadedFile,
                      docKey: docKey,
                      message: `Erreur de mise à jour du document ${docKey}`,
                    };
                  }
                }
              }
            } else {
              return {
                status: 403,
                fileUrl: uploadedFile,
                docKey: docKey,
                message: `Erreur de sélection du document ${docKey}`,
              };
            }
          } else if (docName == "xxx") {
          } else if (docName == "") {
          }
        } catch (err) {
          console.log(err);
          return {
            status: 403,
            fileUrl: uploadedFile,
            message: err,
          };
        }
      } else {
        return {
          status: 403,
          fileUrl: uploadedFile,
          docKey: docKey,
          message: `Chargez une image avec une extension .png, .jpg ou .jpeg`,
        };
      }
      //
    } else {
      return {
        status: 404,
        fileUrl: null,
        docKey: docKey,
        message: `Photo non chargée. Il manque des données`,
      };
    }
  },

  downloadToCsv: async ({}) => {
    const user_cursor = await db.query(aql`FOR u IN user 
    FILTER u._key == ${userKey} RETURN u`);
    if (user_cursor.hasNext) {
      const user = await user_cursor.next();
      // select user brand
      const brand = await getBrandDoc({ brandKey: user.brandKey });
      // select the addres book
      const book_cursor = await db.query(aql`FOR b IN addressBook 
      FILTER b._key == ${bookKey} AND b.userKey == ${userKey} RETURN b`);
      if (book_cursor.hasNext) {
        const book = await book_cursor.next();
        // select the contactcs
        const contacts_cursor = await db.query(aql`FOR c IN contact 
        FILTER c.addressBookKey == ${bookKey} 
        AND c.userKey == ${userKey} RETURN c`);
        if (contacts_cursor.hasNext) {
          // select contacts
          const contacts = await contacts_cursor.all();
          // timeStamp + bookKey + userKey
          const fileName = Date.now() + "_bookKey_" + bookKey + "_" + userKey;
          //const contactsArray = [];

          const ext = fileType == "TEXTE" ? ".txt" : ".csv";

          if (fileType == "TEXTE") {
            var txtStream = fs.createWriteStream(
              `./public_download/${fileName}.txt`
            );

            txtStream.once("open", function (fd) {
              txtStream.write(`USERNAME: ${user.username.toString()}\n`);
              txtStream.write(`---------\n`);
              txtStream.write(`GROUPE: ${book.name.toString()}\n`);
              txtStream.write(`---------\n`);
              txtStream.write(
                `CONTACTS: ${contacts.length.toString()} numéros\n`
              );
              txtStream.write(`= = = = = = = = = = = = = = \n`);
              // wring contacts
              for (let index = 0; index < contacts.length; index++) {
                const contact = contacts[index];
                //contactsArray.push(`${contact.phone}\n`);
                txtStream.write(`${contact.phone.toString()}\n`);
              }
              txtStream.end();
            });
            // send email with download link
            await _downloadAddressBook({
              addressBookName: book.name,
              downloadLink: `${serverAppUrl}/public_download/${fileName}${ext}`,
              email: email,
              fileFormat: ext,
              fullName: `${user.firstName} ${user.lastName}`,
              server: emailServer,
              subject: `Téléchargez votre carnet d'adresses : ${book.name}`,
              brandMail: brand.email,
              brandName: brand.brandName,
              brandPhone: brand.phone,
            });

            return true;
          } else if (fileType != "TEXTE") {
            const sepr = fileType == "VIRGULE" ? "," : ";";
            var txtStream = fs.createWriteStream(
              `./public_download/${fileName}.csv`
            );

            txtStream.once("open", function (fd) {
              // create the header
              txtStream.write(
                `NUMERO 1${sepr}NUMERO 2${sepr}NOM ET PRENOM${sepr}EMAIL\n`
              );
              // wring contacts
              for (let index = 0; index < contacts.length; index++) {
                const contact = contacts[index];
                const col1 = contact.phone.toString();
                const col2 = contact.phoneAlt
                  ? contact.phoneAlt.toString()
                  : "";
                const col3 = contact.fullName
                  ? contact.fullName.toString()
                  : "";
                const col4 = contact.email ? contact.email.toString() : "";
                txtStream.write(
                  `${col1}${sepr}${col2}${sepr}${col3}${sepr}${col4}\n`
                );
              } // end loop
              txtStream.end();
            });
            // send email with download link
            await _downloadAddressBook({
              addressBookName: book.name,
              downloadLink: `${serverAppUrl}/public_download/${fileName}${ext}`,
              email: email,
              fileFormat: ext,
              fullName: `${user.firstName} ${user.lastName}`,
              server: emailServer,
              subject: `Téléchargez votre carnet d'adresses : ${book.name}`,
              brandMail: brand.email,
              brandName: brand.brandName,
              brandPhone: brand.phone,
            });

            return true;
          }
        } else {
          console.log(`Désolé, ce carnet d'adresse ne contient aucun contact`);
          throw new Error(
            `Désolé, ce carnet d'adresse ne contient aucun contact`
          );
        }
      } else {
        console.log(`Erreur de sélection du carnet d'adresse ${bookKey}`);
        throw new Error(`Erreur de sélection du carnet d'adresse ${bookKey}`);
      }
    } else {
      console.log(`Erreur de selection du compte utilisateur ${userKey}`);
      throw new Error(`Erreur de selection du compte utilisateur ${userKey}`);
    }
  },

  importCSV: async ({
    importedFile,
    projectKey,
    companyKey,
    officeKey,
    animateurKey,
    countryKey,
  }) => {
    const extension = importedFile.substr(importedFile.length - 4);
    //console.log(`importedFile:::: ${importedFile}`);
    //console.log(`extension > ${extension}`);
    if (extension == ".csv") {
      const document = importedFile.split("_+++_")[2].split(extension)[0];
      if (document == "clients_sig") {
        // database document name
        //const fileOriginal = importedFile.split("_+++_")[1];
        //console.log(`importedFile > ${importedFile}`);
        //console.log(`fileOriginal > ${fileOriginal}`);
        try {
          const contacts = fs.readFileSync(
            `./public_upload/${importedFile}`,
            "utf8"
          );
          //console.log(`contacts.length: ${contacts.length}`);
          const contactsArray = contacts.split("\n");
          if (contactsArray.length > 0) {
            const sepr =
              contactsArray[0].split(",")[0] != "undefined" &&
              contactsArray[0].split(",")[0].length >= 2 &&
              contactsArray[0].split(",")[0].length <= 200
                ? ","
                : ";";

            if (contactsArray.length <= 10000) {
              for (let index = 0; index < contactsArray.length; index++) {
                const code = contactsArray[index].split(sepr)[0];
                const fullName = contactsArray[index].split(sepr)[1];
                const regDate = contactsArray[index].split(sepr)[2];

                /*console.log(
                  `fullName:${fullName} > code:${code} > animateurKey:${animateurKey} > projectKey:${projectKey} > companyKey:${companyKey} > officeKey:${officeKey} > regDate:${regDate}`
                );
                // fullName:YOMENOU Amevi > code:A0500709 > animateurKey:76614539 > projectKey:10253471 > companyKey:10251012 > officeKey:76451894 > regDate:19/05/2016
                console.log(`- - - - - - - - - - - - - -  -`);*/
                // add to db
                const obj = {
                  timeStamp: Date.now(),
                  code: code,
                  fullName: fullName,
                  //regDate: regDate.replace("\r", ""),
                  regDate: regDate,
                  animateurKey: animateurKey,
                  companyKey: companyKey,
                  officeKey: officeKey,
                  projectKey: projectKey,
                  email: null,
                  phone: null,
                  phoneAlt: null,
                  quartier: null,
                  countryKey: countryKey,
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
                };
                // make sure the client is not in the db yet
                const verify = await db.query(aql`FOR i IN clients_sig 
                FILTER i.code == ${code} RETURN i`);
                if (!verify.hasNext) {
                  const doc_cursor = await db.query(aql`INSERT ${obj} 
                      INTO clients_sig RETURN NEW`);
                  if (doc_cursor.hasNext) {
                    if (index == contactsArray.length - 1) {
                      const importResult = {
                        totalImported: contactsArray.length,
                        message: null,
                      };
                      //console.log(`option0: ${importResult}`);
                      return {
                        status: 200,
                        fileUrl: importedFile,
                        message: importResult,
                      };
                    }
                  } else {
                    throw new Error(
                      `Erreur lors de la création du correspondant`
                    );
                  }
                } else {
                  if (index == contactsArray.length - 1) {
                    const importResult = {
                      totalImported: contactsArray.length,
                      message: null,
                    };
                    //console.log(`option0: ${importResult}`);
                    return {
                      status: 200,
                      fileUrl: importedFile,
                      message: importResult,
                    };
                  }
                }
              } // end map through imported contacts
            } else {
              console.log("ERROR 1");
              return {
                status: 403,
                fileUrl: importedFile,
                message: `Vous ne pouvez pas importer plus de 10000 clients dans un groupe`,
              };
            }
          } else {
            console.log("ERROR 2");
            return {
              status: 403,
              fileUrl: importedFile,
              message: `Il semble que votre fichier ne contient aucun client à importer`,
            };
          }
        } catch (err) {
          console.log(err);
          return {
            status: 403,
            fileUrl: importedFile,
            message: err,
          };
        }
      } else if (document == "") {
      }
      return;
    }
    return;
  },
};

export default uploadResolver;
