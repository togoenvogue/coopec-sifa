import { aql, db, serverSigUrl } from "../../../../db/arangodb.js";
import {
  getCompanyDoc,
  getProjectDoc,
  getOfficeDoc,
  getUserDoc,
  getCountryDoc,
  getCityDoc,
  getPerfectClientDoc,
  getCautionDocs,
  getGageDocs,
  getSigGroupDoc,
} from "../../../../helpers/joindocs.js";
import {
  getLoanActivityAgrDocs,
  getLoanExploitationDocs,
  getLoanExploitationSum,
  getLoanBudgetDocs,
  getLoanAvisDocs,
  getLoanBesoinsDocs,
  getLoanProductDoc,
  getLoanActivityStockageDocs,
  getLoanVisiteKeysAsStringArr,
  getSessionDoc,
  getLoanPatrimoines,
  getLoanCategoryDoc,
  getLoanPatrimoineDocs,
  getLoanGaranties,
  getLoanVisiteDocs,
} from "../../../../helpers/joindocs_loan.js";
import {
  getSMSQuestionnaireDataByClientKey,
  getSMSQuestionnaireDataKeyByLoanFileKey,
} from "../../../../helpers/joindocs_sms.js";
import clientSIGResolver from "../../_client/client.js";

import {
  _downloadCreditIndividuelFull,
  _downloadPayCalendar,
  _loanFilesPDF_Caisse,
} from "./loan_file_pdf.js";

import axios from "axios";
import logResolver from "../../_app/logs/custom_log.js";
import { sanitizeString } from "../../../../helpers/utilities.js";
import pdfFileResolver from "../../_pdf/pdfFile.js";

const loanFilesResolver = {
  loanFileCreate: async ({
    lfk,
    loanLat,
    loanLong,
    projectKey,
    companyKey,
    loanProductKey,
    loanCategoryKey,
    animateurKey,
    officeKey,
    isCreditIndividuel,
    clientKey,
    groupKey,
    groupClientKeys,
    codeSig,
    creditCycle,
    montantCredit,
    soldeDuCompte,
    soldeClientDate,
    dureeCredit,
    differe,
    frequenceRemboursement,
    frequenceExploitation,
    montageParFullName,
    montageParSignature,
    objetCredit,
    dejaCreditNoWhy,
    dejaCreditInstitution,
    dejaCreditMontant,
    dejaCreditObjet,
    dejaCreditProductKey,
    previousLoanDifficultyReason,
    typeCredit,
    dejaCreditYesNo,
    previousLoanCycle,
    previousLoanStartDate,
    previousLoanTotallyPaid,
    previousLoanPaidWithNant,
    previousLoanDifficulty,
    nombreEcheances,
    personneType,
    interets,
    tauxInterets,
    montantAnantir,
    montantAnantirSouhait,
    filiereKeysArr,
    filiereNamesArr,
    filiereMontantsArry,
    filiereClientAccountsArry,
    filiereClientNamesArry,
    filiereClientKeysArry,
    filiereClientContactsArry,
    filiereClientSexesArry,
    filiereClientQuartiersArry,
    filiereSignaturesArry,
    filiereFingerPrintsArry,
    filiereObjetsArry,
    filiereNantissementsArry,
    filiereMontantsParEcheanceArry,
    filiereInteretsArry,
    filierePhotosArry,
    filierePostesArry,
    tontineMois,
    tontineMises,
    tontineTotaux,
    conjoint,
    custom1,
    custom2,
    custom3,
    custom4,
    custom5,
  }) => {
    let _filieres = [];
    let _tontineRecords = [];

    if (tontineMises.length > 0) {
      for (let tti = 0; tti < tontineMois.length; tti++) {
        _tontineRecords.push({
          mois: tontineMois[tti],
          mise: tontineMises[tti],
          total: tontineTotaux[tti],
        });
      }
    }

    if (filiereKeysArr.length > 0) {
      for (let fi = 0; fi < filiereKeysArr.length; fi++) {
        const filiereObj = {
          filiereKey: filiereKeysArr[fi],
          filiereName: filiereNamesArr[fi],
          montant: filiereMontantsArry[fi],
          clientAccount: filiereClientAccountsArry[fi],
          clientName: filiereClientNamesArry[fi],
          clientKey: filiereClientKeysArry[fi],
          clientContact: filiereClientContactsArry[fi],
          clientSexe: filiereClientSexesArry[fi],
          clientQuartier: filiereClientQuartiersArry[fi],
          signature: null,
          fingerPrint: null,
          //signature: filiereSignaturesArry[fi],
          //fingerPrint: filiereFingerPrintsArry[fi],
          objet: filiereObjetsArry[fi],
          nantissement: filiereNantissementsArry[fi],
          montantParEcheance: filiereMontantsParEcheanceArry[fi],
          interet: filiereInteretsArry[fi],
          photo: filierePhotosArry[fi],
          poste: filierePostesArry[fi],
        };
        _filieres.push(filiereObj);
      }
    }

    if (isCreditIndividuel == true) {
      // select client
      const client_cursor = await db.query(aql`FOR c IN clients_sig 
        FILTER c._key == ${clientKey} AND 
        c.cityKey != null AND
          c.phone != null AND
          LENGTH(c.phone) >= 8 AND
          c.cityKey != null AND
          c.countryKey != null AND
          c.photo != 'camera_avatar.png' AND
          c.maritalStatus != null AND
          c.numberOfChildren != null AND
          c.peopleInCharge != null RETURN c`);
      if (client_cursor.hasNext) {
        // continuer
        const prevLoan_cursor = await db.query(aql`FOR l IN loan_files 
        FILTER l.clientKey == ${clientKey}
        AND l._key != ${lfk} SORT l._key DESC LIMIT 1 RETURN l`);
        const prevLoan = prevLoan_cursor.hasNext
          ? await prevLoan_cursor.next()
          : null;

        if (
          prevLoan == null ||
          (prevLoan != null && prevLoan.creditCycle + 1 == creditCycle)
        ) {
          if (
            prevLoan == null ||
            (prevLoan != null &&
              prevLoan.status != "INITIALISÉ" &&
              prevLoan.status != "INTRODUIT")
          ) {
            const obj = {
              _key: lfk,
              timeStamp: Date.now(),
              loanProductKey: loanProductKey,
              loanCategoryKey: loanCategoryKey,
              isCreditIndividuel: isCreditIndividuel,
              dossierNumero: null,
              dossierRefSig: null,
              animateurKey: animateurKey,
              companyKey: companyKey,
              projectKey: projectKey,
              officeKey: officeKey,
              clientKey: clientKey,
              groupKey: groupKey,
              groupClientKeys: groupClientKeys,
              codeSig,
              frequenceRemboursement: frequenceRemboursement,
              frequenceExploitation: frequenceExploitation,
              montantCreditDemande: montantCredit,
              montantCreditAnalyse: null,
              montantCreditAccorde: null,
              interets,
              tauxInterets,
              autresFrais: 0,
              canDecideAlone: false,
              nextDecisionLevel: 0,
              personneType,
              moreInfo: null,
              dateApprobation: null,
              dateDecaissement: null,
              dateDecaissementEffectif: null,
              datePremierRemboursement: null,
              dureeCreditDemande: dureeCredit,
              dureeCreditAnalyse: dureeCredit,
              dureeCreditAccorde: dureeCredit,
              differe,
              soldeClient: soldeDuCompte,
              soldeClientDate: soldeClientDate,
              montantParEcheance: null,
              nombreEcheances,
              avis: [],
              avisVotes: [],
              approKeys: [],
              activityKeys: [],
              exploitationCharges: [],
              exploitationRecettes: [],
              familyExploitationKeys: [],
              sessionDecisions: [],
              visiteKeys: [],
              patrimoineKeys: [],
              garantieKeys: [],
              cautionKeys: [],
              gageKeys: [],
              gageEvalKeys: [],
              pdfFiles: [],
              revisedBy: null,
              revisedComment: null,
              revisedStamp: null,
              isInSession: false,
              loanLat: loanLat,
              loanLong: loanLong,
              submitStamp: null,
              montageParSignature: montageParSignature,
              montageParFullName: montageParFullName,
              clientSignature: null,
              clientSignatureType: null,
              sessionKey: null,
              expiredNote: null,
              expiredStamp: null,
              creditObjet: objetCredit,
              creditType: typeCredit,
              creditCycle: creditCycle,
              dejaCreditYesNo: dejaCreditYesNo,
              dejaCreditNoWhy: dejaCreditNoWhy,
              dejaCreditInstitution: dejaCreditInstitution,
              dejaCreditMontant: dejaCreditMontant,
              dejaCreditObjet: dejaCreditObjet,
              dejaCreditProductKey: dejaCreditProductKey,
              previousLoanCycle: previousLoanCycle,
              previousLoanStartDate: previousLoanStartDate,
              previousLoanTotallyPaid: previousLoanTotallyPaid,
              previousLoanPaidWithNant: previousLoanPaidWithNant,
              previousLoanDifficulty: previousLoanDifficulty,
              previousLoanDifficultyReason: previousLoanDifficultyReason,
              loanActivityDesc: null,
              loanActivityMarketDesc: null,
              loanActivityOtherInfo: null,
              loanActivityNeeds: null,
              analyseConforme: null,
              analyseRespectPlafond: null,
              analyseRespecteActivity: null,
              riskVolontePayeur: null,
              riskStabiliteRevenu: null,
              riskStabiliteAdresse: null,
              riskPouvoirRemboursement: null,
              riskQuaniteGaranties: null,
              riskRatioRemboursement: null,
              riskReputationDuClient: null,
              riskAntecedentsCredit: null,
              observations: [],
              avisAgentCredit: null,
              signatureAgentCredit: null,
              groupLoanGestions: [],
              groupLoanClients: [],
              groupLoanHistories: [],
              montantAnantir,
              montantAnantirSouhait,
              filieres: _filieres,
              tontineRecords: _tontineRecords,
              conjoint,
              custom1,
              custom2,
              custom3,
              custom4,
              custom5,
              status: "INITIALISÉ", // INITIALISÉ, EN ATTENTE, ACCORDÉ, REJETÉ, AJOURNÉ
            };

            const doc_cursor = await db.query(aql`INSERT ${obj} 
            INTO loan_files RETURN NEW`);
            if (doc_cursor.hasNext) {
              const doc = await doc_cursor.next();

              /*const activObj = {
                timeStamp: Date.now(),
                loanFileKey: lfk,
                activityName: objetCredit,
                stage: "",
                age: null,
                frequency: "",
                periode: [],
                exploitationDateStart: 0,
                exploitationDateEnd: 0,
                commerceType: "",
                commerceMode: "",
                commerceEmplacement: "",
                commerceEmplacementType: "",
                commerceAddress: "",
                moyenDeTransport: "",
                autresInfos: "",
                materielsActuels: "",
                materielsBesoin: "",
                stockActuel: "",
                stockACompleter: "",
                approLieu: "",
                approTransport: "",
                reglementFrequence: "",
                workingDays: [],
                saisonning: [],
                exploitationChargesKeys: [],
                exploitationRecettesKeys: [],
                commerceEmplacementAutre: "",
                moyenDeTransportAutre: "",
                approTransportAutre: "",
                reglementFrequenceAutre: "",
                activityDesc1: "",
                activityDesc2: "",
                activityDesc3: "",
                activityDesc4: "",
              };
              await db.query(aql`INSERT ${activObj} 
              INTO loan_activite_agr RETURN NEW`);*/

              // create log
              await logResolver.createLog({
                action: "CREATE", // CREATE, READ, UPDATE, DELETE, SUCCESS, ERROR
                description: `Création du dossier de crédit ${codeSig} (${montantCredit})`,
                docKey: doc._key,
                docName: "loan_files",
                userKey: animateurKey,
                deviceRef: null,
              }); // and create log

              return "SUCCESS";
            } else {
              throw new Error(`Erreur lors de la création de la demande`);
            }
          } else {
            throw new Error(
              `Il existe déjà un dossier de ce bénéficiaire qui n'est pas encore traité`
            );
          }
        } else {
          throw new Error(
            `Le crédit sollicité (cycle ${creditCycle}) n'est pas en adéquation avec le crédit précédent dans la base (cycle ${prevLoan.creditCycle}). Assurez-vous de réactualiser les données du bénéficiaire depuis le SIG avant d'initialiser la demande`
          );
        }
      } else {
        throw new Error(
          `Désolé, vous devez d'abord identifier le bénéficiaire en renseignant tous les champs marqués obligatoires`
        );
      }
    } else {
      // credit de groupe
      // select group
      const group_cursor = await db.query(aql`FOR c IN groupes_sig 
      FILTER c._key == ${groupKey} RETURN c`);
      if (group_cursor.hasNext) {
        const group = await group_cursor.next();

        let _groupLoanGestions = [];
        // select comitee members
        const comitee_doc = await db.query(aql`FOR m IN clients_sig 
        FILTER m.groupRef == ${group.groupCode} AND m.poste != "Membre" RETURN m`);
        if (comitee_doc.hasNext) {
          const comitees = await comitee_doc.all();
          for (let comi = 0; comi < comitees.length; comi++) {
            const mbr = comitees[comi];
            _groupLoanGestions.push({
              clientKey: mbr._key,
              fullName: mbr.fullName,
              photo: mbr.photo,
              poste: mbr.poste,
              account: mbr.codeSig,
              signature: null,
              finterPrint: null,
            });
          }
        }

        // continuer
        const prevLoan_cursor = await db.query(aql`FOR l IN loan_files 
        FILTER l.groupKey == ${groupKey}
        AND l._key != ${lfk} SORT l._key DESC LIMIT 1 RETURN l`);
        const prevLoan = prevLoan_cursor.hasNext
          ? await prevLoan_cursor.next()
          : null;

        if (
          prevLoan == null ||
          (prevLoan != null && prevLoan.creditCycle + 1 == creditCycle)
        ) {
          if (
            prevLoan == null ||
            (prevLoan != null &&
              prevLoan.status != "INITIALISÉ" &&
              prevLoan.status != "INTRODUIT")
          ) {
            const obj = {
              _key: lfk,
              timeStamp: Date.now(),
              loanProductKey: loanProductKey,
              loanCategoryKey: loanCategoryKey,
              isCreditIndividuel: isCreditIndividuel,
              dossierNumero: null,
              dossierRefSig: null,
              animateurKey: animateurKey,
              companyKey: companyKey,
              projectKey: projectKey,
              officeKey: officeKey,
              clientKey: clientKey,
              groupKey: groupKey,
              groupClientKeys: groupClientKeys,
              codeSig,
              frequenceRemboursement: frequenceRemboursement,
              frequenceExploitation: frequenceExploitation,
              montantCreditDemande: montantCredit,
              montantCreditAnalyse: null,
              montantCreditAccorde: null,
              nombreEcheances: nombreEcheances,
              interets,
              tauxInterets,
              autresFrais: 0,
              canDecideAlone: false,
              nextDecisionLevel: 0,
              personneType,
              moreInfo: null,
              dateApprobation: null,
              dateDecaissement: null,
              dateDecaissementEffectif: null,
              datePremierRemboursement: null,
              dureeCreditDemande: dureeCredit,
              dureeCreditAnalyse: dureeCredit,
              dureeCreditAccorde: dureeCredit,
              differe,
              soldeClient: soldeDuCompte,
              soldeClientDate: null,
              montantParEcheance: null,
              avis: [],
              avisVotes: [],
              approKeys: [],
              activityKeys: [],
              exploitationCharges: [],
              exploitationRecettes: [],
              familyExploitationKeys: [],
              sessionDecisions: [],
              visiteKeys: [],
              patrimoineKeys: [],
              garantieKeys: [],
              cautionKeys: [],
              gageKeys: [],
              gageEvalKeys: [],
              pdfFiles: [],
              revisedBy: null,
              revisedComment: null,
              revisedStamp: null,
              isInSession: false,
              loanLat: loanLat,
              loanLong: loanLong,
              submitStamp: null,
              montageParSignature: montageParSignature,
              montageParFullName: montageParFullName,
              clientSignature: null,
              clientSignatureType: null,
              sessionKey: null,
              expiredNote: null,
              expiredStamp: null,
              creditObjet: objetCredit,
              creditType: typeCredit,
              creditCycle: creditCycle,
              dejaCreditYesNo: dejaCreditYesNo,
              dejaCreditNoWhy: dejaCreditNoWhy,
              dejaCreditInstitution: dejaCreditInstitution,
              dejaCreditMontant: dejaCreditMontant,
              dejaCreditObjet: dejaCreditObjet,
              dejaCreditProductKey: dejaCreditProductKey,
              previousLoanCycle: previousLoanCycle,
              previousLoanStartDate: previousLoanStartDate,
              previousLoanTotallyPaid: previousLoanTotallyPaid,
              previousLoanPaidWithNant: previousLoanPaidWithNant,
              previousLoanDifficulty: previousLoanDifficulty,
              previousLoanDifficultyReason: previousLoanDifficultyReason,
              loanActivityDesc: null,
              loanActivityMarketDesc: null,
              loanActivityOtherInfo: null,
              loanActivityNeeds: null,
              groupRiskConforme: null,
              groupRiskPlafond: null,
              groupRiskEligible: null,
              groupRiskVolonteMembres: null,
              groupRiskStabiliteMembres: null,
              groupRiskMontant: null,
              groupRiskSolidarite: null,
              groupRiskQualiteResponsables: null,
              groupRiskReputation: null,
              groupRiskAntecedents: null,
              observations: [],
              avisAgentCredit: null,
              signatureAgentCredit: null,
              groupLoanGestions: _groupLoanGestions,
              groupLoanClients: [], //
              groupLoanHistories: [], // historique de credit
              filieres: _filieres,
              tontineRecords: [],
              conjoint,
              custom1,
              custom2,
              custom3,
              custom4,
              custom5,
              status: "INITIALISÉ", // INITIALISÉ, EN ATTENTE, ACCORDÉ, REJETÉ, AJOURNÉ
            };

            const doc_cursor = await db.query(aql`INSERT ${obj} 
            INTO loan_files RETURN NEW`);
            if (doc_cursor.hasNext) {
              const doc = await doc_cursor.next();

              // create log
              await logResolver.createLog({
                action: "CREATE", // CREATE, READ, UPDATE, DELETE, SUCCESS, ERROR
                description: `Création du dossier de crédit de groupe [${group.groupName}] (${montantCredit})`,
                docKey: doc._key,
                docName: "loan_files",
                userKey: animateurKey,
                deviceRef: null,
              }); // and create log

              return "SUCCESS";
            } else {
              throw new Error(`Erreur lors de la création de la demande`);
            }
          } else {
            throw new Error(
              `Il existe déjà un dossier de ce groupe(ment) qui n'est pas encore traité`
            );
          }
        } else {
          throw new Error(
            `Le crédit sollicité (cycle ${creditCycle}) n'est pas en adéquation avec le crédit précédent dans la base (cycle ${
              prevLoan.creditCycle
            }). Demandez au Chef d'Agence de porter le cycle du crédit précédent dans DOGA KABA à ${
              prevLoan.creditCycle - 1
            }`
          );
        }
      } else {
        throw new Error(`Erreur lors de la sélection du groupe(ment)`);
      }
    }
  },

  loanFileUpdate: async ({
    fileKey,
    loanProductKey,
    groupClientKeys,
    groupKey,
    creditCycle,
    montantCredit,
    dureeCredit,
    differe,
    frequenceRemboursement,
    frequenceExploitation,
    objetCredit,
    dejaCreditNoWhy,
    dejaCreditInstitution,
    dejaCreditMontant,
    dejaCreditObjet,
    previousLoanDifficultyReason,
    dejaCreditYesNo,
    dejaCreditProductKey,
    previousLoanCycle,
    previousLoanStartDate,
    previousLoanTotallyPaid,
    previousLoanPaidWithNant,
    previousLoanDifficulty,
    nombreEcheances,
    personneType,
    interets,
    tauxInterets,
    montantAnantir,
    montantAnantirSouhait,
    filiereKeysArr,
    filiereNamesArr,
    filiereMontantsArry,
    filiereClientAccountsArry,
    filiereClientNamesArry,
    filiereClientKeysArry,
    filiereClientContactsArry,
    filiereClientSexesArry,
    filiereClientQuartiersArry,
    filiereSignaturesArry,
    filiereFingerPrintsArry,
    filiereObjetsArry,
    filiereNantissementsArry,
    filiereMontantsParEcheanceArry,
    filiereInteretsArry,
    filierePhotosArry,
    filierePostesArry,
    tontineMois,
    tontineMises,
    tontineTotaux,
    isCreditIndividuel,
    conjoint,
    custom1,
    custom2,
    custom3,
    custom4,
    custom5,
  }) => {
    let _filieres = [];
    let _tontineRecords = [];

    if (tontineMises.length > 0) {
      for (let tti = 0; tti < tontineMois.length; tti++) {
        _tontineRecords.push({
          mois: tontineMois[tti],
          mise: tontineMises[tti],
          total: tontineTotaux[tti],
        });
      }
    }

    for (let fi = 0; fi < filiereKeysArr.length; fi++) {
      const filiereObj = {
        filiereKey: filiereKeysArr[fi],
        filiereName: filiereNamesArr[fi],
        montant: filiereMontantsArry[fi],
        clientAccount: filiereClientAccountsArry[fi],
        clientName: filiereClientNamesArry[fi],
        clientKey: filiereClientKeysArry[fi],
        clientContact: filiereClientContactsArry[fi],
        clientSexe: filiereClientSexesArry[fi],
        clientQuartier: filiereClientQuartiersArry[fi],
        signature: null,
        fingerPrint: null,
        //signature: filiereSignaturesArry[fi],
        //fingerPrint: filiereFingerPrintsArry[fi],
        objet: filiereObjetsArry[fi],
        nantissement: filiereNantissementsArry[fi],
        montantParEcheance: filiereMontantsParEcheanceArry[fi],
        interet: filiereInteretsArry[fi],
        photo: filierePhotosArry[fi],
        poste: filierePostesArry[fi],
      };
      _filieres.push(filiereObj);
    }

    if (isCreditIndividuel == true) {
      let _groupLoanGestions = [];

      const obj = {
        loanProductKey,
        groupClientKeys,
        creditCycle,
        montantCreditDemande: montantCredit,
        dureeCreditDemande: dureeCredit,
        differe,
        interets,
        tauxInterets,
        frequenceRemboursement,
        frequenceExploitation,
        creditObjet: objetCredit,
        dejaCreditNoWhy,
        dejaCreditInstitution,
        dejaCreditMontant,
        dejaCreditObjet,
        previousLoanDifficultyReason,
        dejaCreditYesNo,
        dejaCreditProductKey,
        previousLoanCycle,
        previousLoanStartDate,
        previousLoanTotallyPaid,
        previousLoanPaidWithNant,
        previousLoanDifficulty,
        nombreEcheances,
        personneType,
        montantAnantir,
        montantAnantirSouhait,
        groupLoanGestions: _groupLoanGestions,
        filieres: _filieres,
        tontineRecords: _tontineRecords,
        conjoint,
        custom1,
        custom2,
        custom3,
        custom4,
        custom5,
      };

      const doc_cursor = await db.query(aql`UPDATE ${fileKey} 
          WITH ${obj} IN loan_files RETURN NEW`);
      if (doc_cursor.hasNext) {
        const doc = await doc_cursor.next();
        // create log
        await logResolver.createLog({
          action: "UPDATE", // CREATE, READ, UPDATE, DELETE, SUCCESS, ERROR
          description: `Modification du dossier de crédit ${fileKey} (${montantCredit})`,
          docKey: fileKey,
          docName: "loan_files",
          userKey: doc.animateurKey,
          deviceRef: null,
        }); // and create log

        return "SUCCESS";
      } else {
        throw new Error(`Erreur lors de la mise à jour de la demande`);
      }
    } else {
      // credit de groupe
      const group_cursor = await db.query(aql`FOR c IN groupes_sig 
        FILTER c._key == ${groupKey} RETURN c`);
      if (group_cursor.hasNext) {
        const group = await group_cursor.next();

        let _groupLoanGestions = [];
        // select comitee members
        const comitee_doc = await db.query(aql`FOR m IN clients_sig 
          FILTER m.groupRef == ${group.groupCode} AND m.poste != "Membre" RETURN m`);
        if (comitee_doc.hasNext) {
          const comitees = await comitee_doc.all();
          for (let comi = 0; comi < comitees.length; comi++) {
            const mbr = comitees[comi];
            _groupLoanGestions.push({
              clientKey: mbr._key,
              fullName: mbr.fullName,
              photo: mbr.photo,
              poste: mbr.poste,
              account: mbr.codeSig,
              signature: null,
              finterPrint: null,
            });
          }
        }

        const obj = {
          loanProductKey,
          groupClientKeys,
          creditCycle,
          montantCreditDemande: montantCredit,
          dureeCreditDemande: dureeCredit,
          differe,
          interets,
          tauxInterets,
          frequenceRemboursement,
          frequenceExploitation,
          creditObjet: objetCredit,
          dejaCreditNoWhy,
          dejaCreditInstitution,
          dejaCreditMontant,
          dejaCreditObjet,
          previousLoanDifficultyReason,
          dejaCreditYesNo,
          dejaCreditProductKey,
          previousLoanCycle,
          previousLoanStartDate,
          previousLoanTotallyPaid,
          previousLoanPaidWithNant,
          previousLoanDifficulty,
          nombreEcheances,
          personneType,
          montantAnantir,
          montantAnantirSouhait,
          groupLoanGestions: _groupLoanGestions,
          filieres: _filieres,
          conjoint,
          custom1,
          custom2,
          custom3,
          custom4,
          custom5,
          tontineRecords: [],
        };

        const doc_cursor = await db.query(aql`UPDATE ${fileKey} 
          WITH ${obj} IN loan_files RETURN NEW`);
        if (doc_cursor.hasNext) {
          const doc = await doc_cursor.next();
          // create log
          await logResolver.createLog({
            action: "UPDATE", // CREATE, READ, UPDATE, DELETE, SUCCESS, ERROR
            description: `Modification du dossier de crédit ${fileKey} (${montantCredit})`,
            docKey: fileKey,
            docName: "loan_files",
            userKey: doc.animateurKey,
            deviceRef: null,
          }); // and create log

          return "SUCCESS";
        } else {
          throw new Error(`Erreur lors de la mise à jour de la demande`);
        }
      } else {
        throw new Error(`Erreur de selection du groupement`);
      }
    }
  },

  loanFileDelete: async ({ loanKey, animateurKey }) => {
    // select the loan file key
    const loan_doc = await db.query(aql`FOR o IN loan_files 
      FILTER o._key == ${loanKey} 
      AND o.animateurKey == ${animateurKey} RETURN o`);

    if (loan_doc.hasNext) {
      const loan = await loan_doc.next();
      if (loan.status == "INITIALISÉ") {
        // delete the loan
        await db.query(aql`FOR o IN loan_files 
        FILTER o._key == ${loanKey} AND o.animateurKey == ${animateurKey}
        REMOVE o._key IN loan_files RETURN OLD`);

        // delete all loan_activite_agr
        await db.query(aql`FOR a IN loan_activite_agr 
        FILTER a.loanFileKey == ${loanKey} 
        REMOVE a._key IN loan_activite_agr RETURN OLD`);

        // delete all loan_activite_agr
        await db.query(aql`FOR a IN loan_activite_stockage 
        FILTER a.loanFileKey == ${loanKey} 
        REMOVE a._key IN loan_activite_stockage RETURN OLD`);

        // remove all exploitations
        await db.query(aql`FOR ex IN loan_exploitation 
        FILTER ex.loanFileKey == ${loanKey} 
        REMOVE ex._key IN loan_exploitation RETURN OLD`);

        // delete budget
        await db.query(aql`FOR bg IN loan_budget_familial 
        FILTER bg.loanFileKey == ${loanKey} 
        REMOVE bg._key IN loan_budget_familial RETURN OLD`);

        // delete avis
        await db.query(aql`FOR av IN loan_avis 
        FILTER av.loanFileKey == ${loanKey} 
        REMOVE av._key IN loan_avis RETURN OLD`);

        // delete besoin
        await db.query(aql`FOR bz IN loan_besoin 
        FILTER bz.loanFileKey == ${loanKey} 
        REMOVE bz._key IN loan_besoin RETURN OLD`);

        // delete suivi
        await db.query(aql`FOR sui IN loan_suivi 
        FILTER sui.loanFileKey == ${loanKey} 
        REMOVE sui._key IN loan_suivi RETURN OLD`);

        // delete sms questionnaire data
        await db.query(aql`FOR av IN sms_questionnaire_data 
        FILTER av.loanFileKey == ${loanKey}
        REMOVE av._key IN sms_questionnaire_data RETURN OLD`);

        // create log
        await logResolver.createLog({
          action: "DELETE", // CREATE, READ, UPDATE, DELETE, SUCCESS, ERROR
          description: `Suppression du dossier de crédit ${loan.codeSig} (${loan.montantCreditDemande})`,
          docKey: loanKey,
          docName: "loan_files",
          userKey: animateurKey,
          deviceRef: null,
        }); // and create log

        return "SUCCESS";
      } else {
        throw new Error(
          `Impossible de supprimer cette demande car elle n'est plus à l'étape de suppression`
        );
      }
    } else {
      throw new Error(`Erreur de sélection de la demande ${loanKey}`);
    }
  },

  loanFilesByOfficeKey: async ({
    companyKey,
    projectKey,
    officeKey,
    status,
    skip,
    perPage,
    maxAmount,
    minAmount,
    accessLevel,
  }) => {
    /*console.log(`projectKey: ${projectKey}`);
    console.log(`companyKey: ${companyKey}`);
    console.log(`officeKey: ${officeKey}`);
    console.log(`status: ${status}`);
    console.log(`minAmount: ${minAmount}`);
    console.log(`maxAmount: ${maxAmount}`);
    console.log(`accessLevel: ${accessLevel}`);
    console.log(`skip: ${skip}`);
    console.log(`perPage: ${perPage}`);*/

    if (status == "SESSION") {
      const docs_cursor =
        accessLevel > 2
          ? await db.query(
              aql`FOR lf IN loan_files FILTER 
              lf.projectKey == ${projectKey} AND lf.companyKey == ${companyKey} 
              AND lf.status == 'EN ATTENTE' AND lf.officeKey == ${officeKey} 
              AND lf.isInSession == false 
              OR
              lf.projectKey == ${projectKey} AND lf.companyKey == ${companyKey} 
              AND lf.status == 'AJOURNÉ' AND lf.officeKey == ${officeKey} 
              AND lf.isInSession == false 
              SORT lf.submitStamp ASC LIMIT ${skip}, ${perPage} RETURN lf`,
              { fullCount: true },
              { count: true }
            )
          : await db.query(
              aql`FOR lf IN loan_files FILTER 
              lf.projectKey == ${projectKey} AND lf.companyKey == ${companyKey} 
              AND lf.status == 'EN ATTENTE' AND lf.officeKey == ${officeKey} 
              AND lf.isInSession == false 
              AND lf.montantCreditAnalyse <= ${maxAmount}
              OR
              lf.projectKey == ${projectKey} AND lf.companyKey == ${companyKey} 
              AND lf.status == 'AJOURNÉ' AND lf.officeKey == ${officeKey} 
              AND lf.isInSession == false 
              AND lf.montantCreditAnalyse <= ${maxAmount}
              SORT lf.submitStamp ASC LIMIT ${skip}, ${perPage} RETURN lf`,
              { fullCount: true },
              { count: true }
            );
      if (docs_cursor.hasNext) {
        const docs = await docs_cursor.all();
        return docs.map(async (doc) => {
          // get file activities
          return {
            ...(doc.dejaCreditProductKey = await getLoanProductDoc({
              key: doc.dejaCreditProductKey,
            })),
            ...(doc.visiteKeys = await getLoanVisiteKeysAsStringArr({
              loanFileKey: doc._key,
            })),
            ...(doc.patrimoineKeys = await getLoanPatrimoines({
              loanFileKey: doc._key,
            })),
            ...(doc.projectKey = await getProjectDoc({
              projectKey: doc.projectKey,
            })),
            ...(doc.companyKey = await getCompanyDoc({
              companyKey: doc.companyKey,
            })),
            ...(doc.officeKey = await getOfficeDoc({
              officeKey: doc.officeKey,
            })),
            ...(doc.animateurKey = await getUserDoc({
              userKey: doc.animateurKey,
            })),
            ...(doc.cautionKeys = await getCautionDocs({
              laonKey: doc._key,
            })),
            ...(doc.gageKeys = await getGageDocs({
              laonKey: doc._key,
            })),
            ...(doc.revisedBy = await getUserDoc({
              userKey: doc.revisedBy,
            })),
            ...(doc.loanProductKey = await getLoanProductDoc({
              key: doc.loanProductKey,
            })),
            ...(doc.clientKey = await getPerfectClientDoc({
              clientKey: doc.clientKey,
            })),
            ...(doc.clientKey["countryKey"] = await getCountryDoc({
              key: doc.clientKey["countryKey"],
            })),
            ...(doc.clientKey["cityKey"] = await getCityDoc({
              key: doc.clientKey["cityKey"],
            })),
            ...(doc.activityKeys = await getLoanActivityAgrDocs({
              loanFileKey: doc._key,
            })),
            ...(doc.exploitationCharges = await getLoanExploitationDocs({
              loanFileKey: doc._key,
              type: "CHARGES",
            })),
            ...(doc.exploitationRecettes = await getLoanExploitationDocs({
              loanFileKey: doc._key,
              type: "RECETTES",
            })),

            // budget familial
            ...(doc.familyExploitationKeys = await getLoanBudgetDocs({
              loanFileKey: doc._key,
            })),

            ...(doc.avis = await getLoanAvisDocs({
              loanFileKey: doc._key,
            })),
            ...(doc.besoinsKeys = await getLoanBesoinsDocs({
              loanFileKey: doc._key,
            })),
            ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
            ...doc,
          };
        });
      } else {
        return [];
      }
    } else {
      // NOT SESSION
      const docs_cursor =
        status != "SESSION"
          ? await db.query(
              aql`FOR lf IN loan_files FILTER 
            lf.projectKey == ${projectKey} AND lf.companyKey == ${companyKey} 
            AND lf.status == ${status} AND lf.officeKey == ${officeKey}
            SORT lf.dateDecaissement ASC LIMIT ${skip}, ${perPage} RETURN lf`,
              { fullCount: true },
              { count: true }
            )
          : await db.query(
              aql`FOR lf IN loan_files FILTER 
            lf.projectKey == ${projectKey} AND lf.companyKey == ${companyKey} 
            AND lf.status == 'EN ATTENTE' AND lf.officeKey == ${officeKey} 
            AND lf.isInSession == false 
            AND lf.montantCreditAnalyse <= ${minAmount}
            OR
            lf.projectKey == ${projectKey} AND lf.companyKey == ${companyKey} 
            AND lf.status == 'AJOURNÉ' AND lf.officeKey == ${officeKey} 
            AND lf.isInSession == false 
            AND lf.montantCreditAnalyse <= ${maxAmount}
            SORT lf.dateDecaissement ASC LIMIT ${skip}, ${perPage} RETURN lf`,
              { fullCount: true },
              { count: true }
            );
      if (docs_cursor.hasNext) {
        const docs = await docs_cursor.all();
        return docs.map(async (doc) => {
          // get file activities
          return {
            ...(doc.dejaCreditProductKey = await getLoanProductDoc({
              key: doc.dejaCreditProductKey,
            })),
            ...(doc.visiteKeys = await getLoanVisiteKeysAsStringArr({
              loanFileKey: doc._key,
            })),
            ...(doc.patrimoineKeys = await getLoanPatrimoines({
              loanFileKey: doc._key,
            })),
            ...(doc.projectKey = await getProjectDoc({
              projectKey: doc.projectKey,
            })),
            ...(doc.companyKey = await getCompanyDoc({
              companyKey: doc.companyKey,
            })),
            ...(doc.officeKey = await getOfficeDoc({
              officeKey: doc.officeKey,
            })),
            ...(doc.animateurKey = await getUserDoc({
              userKey: doc.animateurKey,
            })),
            ...(doc.cautionKeys = await getCautionDocs({
              laonKey: doc._key,
            })),
            ...(doc.gageKeys = await getGageDocs({
              laonKey: doc._key,
            })),
            ...(doc.revisedBy = await getUserDoc({
              userKey: doc.revisedBy,
            })),
            ...(doc.loanProductKey = await getLoanProductDoc({
              key: doc.loanProductKey,
            })),
            ...(doc.clientKey = await getPerfectClientDoc({
              clientKey: doc.clientKey,
            })),
            ...(doc.clientKey["countryKey"] = await getCountryDoc({
              key: doc.clientKey["countryKey"],
            })),
            ...(doc.clientKey["cityKey"] = await getCityDoc({
              key: doc.clientKey["cityKey"],
            })),
            ...(doc.activityKeys = await getLoanActivityAgrDocs({
              loanFileKey: doc._key,
            })),
            ...(doc.exploitationCharges = await getLoanExploitationDocs({
              loanFileKey: doc._key,
              type: "CHARGES",
            })),
            ...(doc.exploitationRecettes = await getLoanExploitationDocs({
              loanFileKey: doc._key,
              type: "RECETTES",
            })),

            // budget familial
            ...(doc.familyExploitationKeys = await getLoanBudgetDocs({
              loanFileKey: doc._key,
            })),

            ...(doc.avis = await getLoanAvisDocs({
              loanFileKey: doc._key,
            })),
            ...(doc.besoinsKeys = await getLoanBesoinsDocs({
              loanFileKey: doc._key,
            })),
            ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
            ...doc,
          };
        });
      } else {
        return [];
      }
    }
  },

  loanFilesToAnalyseInSession: async ({
    companyKey,
    projectKey,
    officeKey,
    status,
    skip,
    perPage,
    maxAmount,
    minAmount,
    accessLevel,
    sessionLevelId,
  }) => {
    /*console.log(`projectKey: ${projectKey}`);
    console.log(`companyKey: ${companyKey}`);
    console.log(`officeKey: ${officeKey}`);
    console.log(`status: ${status}`);
    console.log(`minAmount: ${minAmount}`);
    console.log(`maxAmount: ${maxAmount}`);
    console.log(`sessionLevelId: ${sessionLevelId}`);
    console.log(`skip: ${skip}`);
    console.log(`perPage: ${perPage}`);*/

    let nextLevel;
    switch (sessionLevelId) {
      case "CA":
        nextLevel = 1;
        break;
      case "CIC":
        nextLevel = 2;
        break;
      case "CC":
        nextLevel = 3;
        break;

      default:
        break;
    }

    const docs_cursor = await db.query(
      aql`FOR lf IN loan_files FILTER 
        lf.projectKey == ${projectKey} AND lf.companyKey == ${companyKey} 
        AND lf.status == 'EN ATTENTE' AND lf.officeKey == ${officeKey} 
        AND lf.isInSession == false AND lf.nextDecisionLevel == ${nextLevel}
        OR
        lf.projectKey == ${projectKey} AND lf.companyKey == ${companyKey} 
        AND lf.status == 'AJOURNÉ' AND lf.officeKey == ${officeKey} 
        AND lf.isInSession == false AND lf.nextDecisionLevel == ${nextLevel} 
        SORT lf.submitStamp ASC LIMIT ${skip}, ${perPage} RETURN lf`,
      { fullCount: true },
      { count: true }
    );
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        // get file activities
        return {
          ...(doc.dejaCreditProductKey = await getLoanProductDoc({
            key: doc.dejaCreditProductKey,
          })),
          ...(doc.visiteKeys = await getLoanVisiteKeysAsStringArr({
            loanFileKey: doc._key,
          })),
          ...(doc.patrimoineKeys = await getLoanPatrimoines({
            loanFileKey: doc._key,
          })),
          ...(doc.projectKey = await getProjectDoc({
            projectKey: doc.projectKey,
          })),
          ...(doc.companyKey = await getCompanyDoc({
            companyKey: doc.companyKey,
          })),
          ...(doc.officeKey = await getOfficeDoc({
            officeKey: doc.officeKey,
          })),
          ...(doc.animateurKey = await getUserDoc({
            userKey: doc.animateurKey,
          })),
          ...(doc.cautionKeys = await getCautionDocs({
            laonKey: doc._key,
          })),
          ...(doc.gageKeys = await getGageDocs({
            laonKey: doc._key,
          })),
          ...(doc.revisedBy = await getUserDoc({
            userKey: doc.revisedBy,
          })),
          ...(doc.loanProductKey = await getLoanProductDoc({
            key: doc.loanProductKey,
          })),
          ...(doc.groupKey = await getSigGroupDoc({
            ref: doc.groupKey,
          })),
          ...(doc.clientKey = await getPerfectClientDoc({
            clientKey: doc.clientKey,
          })),
          ...(doc.clientKey["countryKey"] = await getCountryDoc({
            key: doc.clientKey["countryKey"],
          })),
          ...(doc.clientKey["cityKey"] = await getCityDoc({
            key: doc.clientKey["cityKey"],
          })),
          ...(doc.activityKeys = await getLoanActivityAgrDocs({
            loanFileKey: doc._key,
          })),
          ...(doc.exploitationCharges = await getLoanExploitationDocs({
            loanFileKey: doc._key,
            type: "CHARGES",
          })),
          ...(doc.exploitationRecettes = await getLoanExploitationDocs({
            loanFileKey: doc._key,
            type: "RECETTES",
          })),

          // budget familial
          ...(doc.familyExploitationKeys = await getLoanBudgetDocs({
            loanFileKey: doc._key,
          })),

          ...(doc.avis = await getLoanAvisDocs({
            loanFileKey: doc._key,
          })),
          ...(doc.besoinsKeys = await getLoanBesoinsDocs({
            loanFileKey: doc._key,
          })),
          ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
          ...doc,
        };
      });
    } else {
      return [];
    }
  },

  // remove deliberately a file from the session
  loanFileUnloadFromSession: async ({
    loanKey,
    revisedBy,
    revisedComment,
    status,
    sessionKey,
  }) => {
    // select loan
    const loan_cursor = await db.query(aql`FOR l IN loan_files 
    FILTER l._key == ${loanKey} RETURN l`);
    if (loan_cursor.hasNext) {
      const thisLoan = loan_cursor.next();

      const obj = {
        //revisedStamp: Date.now(),
        //revisedBy: revisedBy,
        revisedText: revisedComment,
        status: status == "DONE" ? thisLoan.status : status,
        wasInSession: status == "DONE" ? thisLoan.wasInSession : true,
        isInSession: false,
        prevDecisionLevel: thisLoan.nextDecisionLevel,
        sessionKey: status == "DONE" ? thisLoan.sessionKey : null,
        sessionSetBy: status == "DONE" ? thisLoan.sessionSetBy : null,
        sessionDecisions: status == "DONE" ? thisLoan.sessionDecisions : [],
      };

      //console.log(obj);

      const doc_cursor = await db.query(aql`UPDATE ${loanKey} 
        WITH ${obj} IN loan_files RETURN NEW`);
      if (doc_cursor.hasNext) {
        //const doc = await doc_cursor.next();
        // reset all votes
        await db.query(aql`UPDATE ${sessionKey} 
        WITH { currentFileKey: null } IN loan_session RETURN NEW`);
        return "TRUE";
      } else {
        return `Erreur lors de la mise à jour du statut du dossier`;
      }
    } else {
      return `Erreur de sélection de la demande de crédit`;
    }
  },

  loanFiles: async ({
    accessLevel,
    userKey,
    companyKey,
    projectKey,
    officeKeys,
    dateFrom,
    dateTo,
    status,
    coverage,
    skip,
    perPage,
    sig,
    minAmount,
    productCoverage,
    productKey,
  }) => {
    const mAmnt = minAmount != undefined ? minAmount : 0;

    /*console.log(`accessLevel: ${accessLevel}`);
    console.log(`userKey: ${userKey}`);
    console.log(`companyKey: ${companyKey}`);
    console.log(`projectKey: ${projectKey}`);
    console.log(`officeKeys: ${officeKeys}`);
    console.log(`dateFrom: ${dateFrom}`);
    console.log(`dateTo: ${dateTo}`);
    console.log(`status: ${status}`);
    console.log(`coverage: ${coverage}`);
    console.log(`skip: ${skip}`);
    console.log(`perPage: ${perPage}`);
    console.log(`sig: ${sig}`);
    console.log(`amount: ${mAmnt}`);*/

    if (sig != null && sig != "" && sig.length >= 5) {
      const docs_cursor = await db.query(
        aql`FOR lf IN loan_files FILTER 
        lf.projectKey == ${projectKey} 
        AND lf.companyKey == ${companyKey} 
        AND lf.codeSig == ${sig}
        SORT lf.timeStamp DESC LIMIT ${skip}, ${perPage} RETURN lf`,
        { fullCount: true },
        { count: true }
      );
      if (docs_cursor.hasNext) {
        const docs = await docs_cursor.all();
        return docs.map(async (doc) => {
          /*var vk = await getLoanVisiteKeysAsStringArr({
            loanFileKey: doc._key,
          });*/
          // get last loan
          return {
            //...(doc.visiteKeys = vk),
            ...(doc.projectKey = await getProjectDoc({
              projectKey: doc.projectKey,
            })),
            ...(doc.officeKey = await getOfficeDoc({
              officeKey: doc.officeKey,
            })),
            ...(doc.animateurKey = await getUserDoc({
              userKey: doc.animateurKey,
            })),
            ...(doc.loanProductKey = await getLoanProductDoc({
              key: doc.loanProductKey,
            })),
            ...(doc.clientKey = await getPerfectClientDoc({
              clientKey: doc.clientKey,
            })),
            ...(doc.groupKey = await getSigGroupDoc({
              ref: doc.groupKey,
            })),
            ...(doc.clientKey["officeKey"] = await getOfficeDoc({
              officeKey: doc.officeKey,
            })),
            ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
            ...doc,
          };
        });
      } else {
        return [];
      }
    } else {
      if (coverage == "Utilisateur") {
        if (
          productCoverage == "Tous les produits" ||
          productCoverage == undefined
        ) {
          if (dateFrom == 0 && dateTo == 0) {
            const docs_cursor =
              status == "ALL"
                ? await db.query(
                    aql`FOR lf IN loan_files FILTER 
                  lf.projectKey == ${projectKey} 
                  AND lf.companyKey == ${companyKey} 
                  ANd lf.animateurKey == ${userKey} 
                  AND lf.status == 'INITIALISÉ' 
                  AND lf.montantCreditDemande >= ${mAmnt}
                  SORT lf.timeStamp DESC LIMIT ${skip}, ${perPage} RETURN lf`,
                    { fullCount: true },
                    { count: true }
                  )
                : await db.query(
                    aql`FOR lf IN loan_files FILTER 
                  lf.projectKey == ${projectKey} 
                  AND lf.companyKey == ${companyKey} 
                  ANd lf.animateurKey == ${userKey}
                  AND lf.status == ${status} 
                  AND lf.montantCreditDemande >= ${mAmnt}
                  SORT lf.timeStamp DESC LIMIT ${skip}, ${perPage} RETURN lf`,
                    { fullCount: true },
                    { count: true }
                  );
            if (docs_cursor.hasNext) {
              const docs = await docs_cursor.all();
              return docs.map(async (doc) => {
                // get last loan
                return {
                  ...(doc.projectKey = await getProjectDoc({
                    projectKey: doc.projectKey,
                  })),
                  ...(doc.officeKey = await getOfficeDoc({
                    officeKey: doc.officeKey,
                  })),
                  ...(doc.animateurKey = await getUserDoc({
                    userKey: doc.animateurKey,
                  })),
                  ...(doc.loanProductKey = await getLoanProductDoc({
                    key: doc.loanProductKey,
                  })),
                  ...(doc.clientKey = await getPerfectClientDoc({
                    clientKey: doc.clientKey,
                  })),
                  ...(doc.groupKey = await getSigGroupDoc({
                    ref: doc.groupKey,
                  })),
                  ...(doc.clientKey["officeKey"] = await getOfficeDoc({
                    officeKey: doc.officeKey,
                  })),
                  ...(doc.avis = await getLoanAvisDocs({
                    loanFileKey: doc._key,
                  })),
                  ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
                  ...doc,
                };
              });
            } else {
              return [];
            }
            // select based on the status
          } else {
            const docs_cursor =
              status == "ALL"
                ? await db.query(
                    aql`FOR lf IN loan_files FILTER 
                lf.projectKey == ${projectKey} 
                AND lf.companyKey == ${companyKey} 
                ANd lf.animateurKey == ${userKey} 
                AND lf.status == 'INITIALISÉ' 
                AND lf.montantCreditDemande >= ${mAmnt}
                AND lf.timeStamp >= ${dateFrom}
                AND lf.timeStamp <= ${dateTo}
                SORT lf.timeStamp DESC LIMIT ${skip}, ${perPage} RETURN lf`,
                    { fullCount: true },
                    { count: true }
                  )
                : await db.query(
                    aql`FOR lf IN loan_files FILTER 
                lf.projectKey == ${projectKey} 
                AND lf.companyKey == ${companyKey} 
                ANd lf.animateurKey == ${userKey}
                AND lf.status == ${status} 
                AND lf.montantCreditDemande >= ${mAmnt}
                AND lf.timeStamp >= ${dateFrom}
                AND lf.timeStamp <= ${dateTo}  
                SORT lf.timeStamp DESC LIMIT ${skip}, ${perPage} RETURN lf`,
                    { fullCount: true },
                    { count: true }
                  );
            if (docs_cursor.hasNext) {
              const docs = await docs_cursor.all();
              return docs.map(async (doc) => {
                return {
                  ...(doc.projectKey = await getProjectDoc({
                    projectKey: doc.projectKey,
                  })),
                  ...(doc.officeKey = await getOfficeDoc({
                    officeKey: doc.officeKey,
                  })),
                  ...(doc.animateurKey = await getUserDoc({
                    userKey: doc.animateurKey,
                  })),
                  ...(doc.loanProductKey = await getLoanProductDoc({
                    key: doc.loanProductKey,
                  })),
                  ...(doc.clientKey = await getPerfectClientDoc({
                    clientKey: doc.clientKey,
                  })),
                  ...(doc.groupKey = await getSigGroupDoc({
                    ref: doc.groupKey,
                  })),
                  ...(doc.clientKey["officeKey"] = await getOfficeDoc({
                    officeKey: doc.officeKey,
                  })),
                  ...(doc.avis = await getLoanAvisDocs({
                    loanFileKey: doc._key,
                  })),
                  ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
                  ...doc,
                };
              });
            } else {
              return [];
            }
          }
        } else {
          // specific product
          const docs_cursor =
            dateFrom == 0 && dateTo == 0
              ? await db.query(
                  aql`FOR lf IN loan_files FILTER 
                  lf.projectKey == ${projectKey} 
                  AND lf.companyKey == ${companyKey}  
                  AND lf.animateurKey == ${userKey}
                  AND lf.status == ${status}  
                  AND lf.montantCreditAnalyse >= ${mAmnt} 
                  AND lf.loanProductKey == ${productKey}
                  SORT lf.timeStamp DESC LIMIT ${skip}, ${perPage} RETURN lf`,
                  { fullCount: true },
                  { count: true }
                )
              : await db.query(
                  aql`FOR lf IN loan_files FILTER 
                  lf.projectKey == ${projectKey} 
                  AND lf.companyKey == ${companyKey} 
                  AND lf.animateurKey == ${userKey}
                  AND lf.status == ${status} 
                  AND lf.montantCreditAnalyse >= ${mAmnt} 
                  AND lf.loanProductKey == ${productKey} 
                  AND lf.timeStamp >= ${dateFrom}
                  AND lf.timeStamp <= ${dateTo} 
                  SORT lf.timeStamp DESC LIMIT ${skip}, ${perPage} RETURN lf`,
                  { fullCount: true },
                  { count: true }
                );

          if (docs_cursor.hasNext) {
            const docs = await docs_cursor.all();
            db.close();
            return docs.map(async (doc) => {
              return {
                ...(doc.projectKey = await getProjectDoc({
                  projectKey: doc.projectKey,
                })),
                ...(doc.officeKey = await getOfficeDoc({
                  officeKey: doc.officeKey,
                })),
                ...(doc.animateurKey = await getUserDoc({
                  userKey: doc.animateurKey,
                })),
                ...(doc.loanProductKey = await getLoanProductDoc({
                  key: doc.loanProductKey,
                })),
                ...(doc.clientKey = await getPerfectClientDoc({
                  clientKey: doc.clientKey,
                })),
                ...(doc.groupKey = await getSigGroupDoc({
                  ref: doc.groupKey,
                })),
                ...(doc.clientKey["officeKey"] = await getOfficeDoc({
                  officeKey: doc.officeKey,
                })),
                ...(doc.avis = await getLoanAvisDocs({
                  loanFileKey: doc._key,
                })),
                ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
                ...doc,
              };
            });
          } else {
            return [];
          }
        }
      } else if (coverage == "Antenne") {
        if (
          productCoverage == "Tous les produits" ||
          productCoverage == undefined
        ) {
          if (dateFrom == 0 && dateTo == 0) {
            const docs_cursor =
              status == "ALL"
                ? await db.query(
                    aql`FOR lf IN loan_files FILTER 
                  lf.projectKey == ${projectKey} 
                  AND lf.companyKey == ${companyKey} 
                  ANd lf.officeKey IN ${officeKeys}  
                  AND lf.status == 'INITIALISÉ'  
                  AND lf.montantCreditDemande >= ${mAmnt}
                  SORT lf.timeStamp DESC LIMIT ${skip}, ${perPage} RETURN lf`,
                    { fullCount: true },
                    { count: true }
                  )
                : await db.query(
                    aql`FOR lf IN loan_files FILTER 
                  lf.projectKey == ${projectKey} 
                  AND lf.companyKey == ${companyKey} 
                  ANd lf.officeKey IN ${officeKeys}  
                  AND lf.status == ${status} AND lf.status != 'INITIALISÉ' 
                  AND lf.montantCreditDemande >= ${mAmnt}
                  SORT lf.timeStamp DESC LIMIT ${skip}, ${perPage} RETURN lf`,
                    { fullCount: true },
                    { count: true }
                  );
            if (docs_cursor.hasNext) {
              const docs = await docs_cursor.all();
              return docs.map(async (doc) => {
                // get last loan
                return {
                  ...(doc.projectKey = await getProjectDoc({
                    projectKey: doc.projectKey,
                  })),
                  ...(doc.officeKey = await getOfficeDoc({
                    officeKey: doc.officeKey,
                  })),
                  ...(doc.animateurKey = await getUserDoc({
                    userKey: doc.animateurKey,
                  })),
                  ...(doc.loanProductKey = await getLoanProductDoc({
                    key: doc.loanProductKey,
                  })),
                  ...(doc.clientKey = await getPerfectClientDoc({
                    clientKey: doc.clientKey,
                  })),
                  ...(doc.groupKey = await getSigGroupDoc({
                    ref: doc.groupKey,
                  })),
                  ...(doc.clientKey["officeKey"] = await getOfficeDoc({
                    officeKey: doc.officeKey,
                  })),
                  ...(doc.avis = await getLoanAvisDocs({
                    loanFileKey: doc._key,
                  })),
                  ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
                  ...doc,
                };
              });
            } else {
              return [];
            }
            // select based on the status
          } else {
            const docs_cursor =
              status == "ALL"
                ? await db.query(
                    aql`FOR lf IN loan_files FILTER 
                lf.projectKey == ${projectKey} 
                AND lf.companyKey == ${companyKey} 
                ANd lf.officeKey IN ${officeKeys}
                AND lf.status == 'INITIALISÉ'  
                AND lf.montantCreditDemande >= ${mAmnt}
                AND lf.timeStamp >= ${dateFrom}
                AND lf.timeStamp <= ${dateTo} 
                SORT lf.timeStamp DESC LIMIT ${skip}, ${perPage} RETURN lf`,
                    { fullCount: true },
                    { count: true }
                  )
                : await db.query(
                    aql`FOR lf IN loan_files FILTER 
                lf.projectKey == ${projectKey} 
                AND lf.companyKey == ${companyKey} 
                ANd lf.officeKey IN ${officeKeys}
                AND lf.status == ${status}
                AND lf.status != 'INITIALISÉ'  
                AND lf.montantCreditDemande >= ${mAmnt}
                AND lf.dateDecaissement >= ${dateFrom}
                AND lf.dateDecaissement <= ${dateTo}  
                SORT lf.dateDecaissement DESC LIMIT ${skip}, ${perPage} RETURN lf`,
                    { fullCount: true },
                    { count: true }
                  );
            if (docs_cursor.hasNext) {
              const docs = await docs_cursor.all();
              return docs.map(async (doc) => {
                // get last loan
                return {
                  ...(doc.projectKey = await getProjectDoc({
                    projectKey: doc.projectKey,
                  })),
                  ...(doc.officeKey = await getOfficeDoc({
                    officeKey: doc.officeKey,
                  })),
                  ...(doc.animateurKey = await getUserDoc({
                    userKey: doc.animateurKey,
                  })),
                  ...(doc.loanProductKey = await getLoanProductDoc({
                    key: doc.loanProductKey,
                  })),
                  ...(doc.clientKey = await getPerfectClientDoc({
                    clientKey: doc.clientKey,
                  })),
                  ...(doc.groupKey = await getSigGroupDoc({
                    ref: doc.groupKey,
                  })),
                  ...(doc.clientKey["officeKey"] = await getOfficeDoc({
                    officeKey: doc.officeKey,
                  })),
                  ...(doc.avis = await getLoanAvisDocs({
                    loanFileKey: doc._key,
                  })),
                  ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
                  ...doc,
                };
              });
            } else {
              return [];
            }
          }
        } else {
          // specific product
          const docs_cursor =
            dateFrom == 0 && dateTo == 0
              ? await db.query(
                  aql`FOR lf IN loan_files FILTER 
              lf.projectKey == ${projectKey} 
              AND lf.companyKey == ${companyKey}  
              AND lf.officeKey IN ${officeKeys}
              AND lf.status == ${status}  
              AND lf.montantCreditAnalyse >= ${mAmnt} 
              AND lf.loanProductKey == ${productKey}
              SORT lf.timeStamp DESC LIMIT ${skip}, ${perPage} RETURN lf`,
                  { fullCount: true },
                  { count: true }
                )
              : await db.query(
                  aql`FOR lf IN loan_files FILTER 
              lf.projectKey == ${projectKey} 
              AND lf.companyKey == ${companyKey} 
              AND lf.officeKey IN ${officeKeys}
              AND lf.status == ${status} 
              AND lf.montantCreditAnalyse >= ${mAmnt} 
              AND lf.loanProductKey == ${productKey} 
              AND lf.timeStamp >= ${dateFrom}
              AND lf.timeStamp <= ${dateTo} 
              SORT lf.timeStamp DESC LIMIT ${skip}, ${perPage} RETURN lf`,
                  { fullCount: true },
                  { count: true }
                );

          if (docs_cursor.hasNext) {
            const docs = await docs_cursor.all();
            db.close();
            return docs.map(async (doc) => {
              return {
                ...(doc.projectKey = await getProjectDoc({
                  projectKey: doc.projectKey,
                })),
                ...(doc.officeKey = await getOfficeDoc({
                  officeKey: doc.officeKey,
                })),
                ...(doc.animateurKey = await getUserDoc({
                  userKey: doc.animateurKey,
                })),
                ...(doc.loanProductKey = await getLoanProductDoc({
                  key: doc.loanProductKey,
                })),
                ...(doc.clientKey = await getPerfectClientDoc({
                  clientKey: doc.clientKey,
                })),
                ...(doc.groupKey = await getSigGroupDoc({
                  ref: doc.groupKey,
                })),
                ...(doc.clientKey["officeKey"] = await getOfficeDoc({
                  officeKey: doc.officeKey,
                })),
                ...(doc.avis = await getLoanAvisDocs({
                  loanFileKey: doc._key,
                })),
                ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
                ...doc,
              };
            });
          } else {
            return [];
          }
        }
      } else if (coverage == "Globale") {
        if (
          productCoverage == "Tous les produits" ||
          productCoverage == undefined
        ) {
          if (dateFrom == 0 && dateTo == 0) {
            const docs_cursor =
              status == "ALL"
                ? await db.query(
                    aql`FOR lf IN loan_files FILTER 
                  lf.projectKey == ${projectKey} 
                  AND lf.companyKey == ${companyKey}  
                  AND lf.status == 'INITIALISÉ'   
                  SORT lf.timeStamp DESC LIMIT ${skip}, ${perPage} RETURN lf`,
                    { fullCount: true },
                    { count: true }
                  ) // Gros montants
                : await db.query(
                    aql`FOR lf IN loan_files FILTER 
                  lf.projectKey == ${projectKey} 
                  AND lf.companyKey == ${companyKey}   
                  AND lf.status == ${status}  
                  AND lf.montantCreditDemande >= ${mAmnt}
                  SORT lf.timeStamp DESC LIMIT ${skip}, ${perPage} RETURN lf`,
                    { fullCount: true },
                    { count: true }
                  );
            if (docs_cursor.hasNext) {
              const docs = await docs_cursor.all();
              return docs.map(async (doc) => {
                // get last loan
                return {
                  ...(doc.projectKey = await getProjectDoc({
                    projectKey: doc.projectKey,
                  })),
                  ...(doc.officeKey = await getOfficeDoc({
                    officeKey: doc.officeKey,
                  })),
                  ...(doc.animateurKey = await getUserDoc({
                    userKey: doc.animateurKey,
                  })),
                  ...(doc.loanProductKey = await getLoanProductDoc({
                    key: doc.loanProductKey,
                  })),
                  ...(doc.clientKey = await getPerfectClientDoc({
                    clientKey: doc.clientKey,
                  })),
                  ...(doc.groupKey = await getSigGroupDoc({
                    ref: doc.groupKey,
                  })),
                  ...(doc.clientKey["officeKey"] = await getOfficeDoc({
                    officeKey: doc.officeKey,
                  })),
                  ...(doc.avis = await getLoanAvisDocs({
                    loanFileKey: doc._key,
                  })),
                  ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
                  ...doc,
                };
              });
            } else {
              return [];
            }
            // select based on dates
          } else {
            const docs_cursor =
              status == "ALL"
                ? await db.query(
                    aql`FOR lf IN loan_files FILTER 
                lf.projectKey == ${projectKey} 
                AND lf.companyKey == ${companyKey} 
                AND lf.status == 'INITIALISÉ'  
                AND lf.timeStamp >= ${dateFrom}
                AND lf.timeStamp <= ${dateTo} 
                SORT lf.timeStamp DESC LIMIT ${skip}, ${perPage} RETURN lf`,
                    { fullCount: true },
                    { count: true }
                  )
                : await db.query(
                    aql`FOR lf IN loan_files FILTER 
                lf.projectKey == ${projectKey} 
                AND lf.companyKey == ${companyKey}  
                AND lf.status == ${status}
                AND lf.montantCreditDemande >= ${dateFrom}
                AND lf.montantCreditDemande <= ${dateTo}  
                AND lf.montantCreditDemande >= ${mAmnt}
                SORT lf.montantCreditDemande DESC LIMIT ${skip}, ${perPage} RETURN lf`,
                    { fullCount: true },
                    { count: true }
                  );
            if (docs_cursor.hasNext) {
              const docs = await docs_cursor.all();
              return docs.map(async (doc) => {
                // get last loan
                return {
                  ...(doc.projectKey = await getProjectDoc({
                    projectKey: doc.projectKey,
                  })),
                  ...(doc.officeKey = await getOfficeDoc({
                    officeKey: doc.officeKey,
                  })),
                  ...(doc.animateurKey = await getUserDoc({
                    userKey: doc.animateurKey,
                  })),
                  ...(doc.loanProductKey = await getLoanProductDoc({
                    key: doc.loanProductKey,
                  })),
                  ...(doc.clientKey = await getPerfectClientDoc({
                    clientKey: doc.clientKey,
                  })),
                  ...(doc.groupKey = await getSigGroupDoc({
                    ref: doc.groupKey,
                  })),
                  ...(doc.clientKey["officeKey"] = await getOfficeDoc({
                    officeKey: doc.officeKey,
                  })),
                  ...(doc.avis = await getLoanAvisDocs({
                    loanFileKey: doc._key,
                  })),
                  ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
                  ...doc,
                };
              });
            } else {
              return [];
            }
          }
        } else {
          // specific product
          const docs_cursor =
            dateFrom == 0 && dateTo == 0
              ? await db.query(
                  aql`FOR lf IN loan_files FILTER 
                  lf.projectKey == ${projectKey} 
                  AND lf.companyKey == ${companyKey}   
                  AND lf.status == ${status}  
                  AND lf.montantCreditDemande >= ${mAmnt} 
                  AND lf.loanProductKey == ${productKey}
                  SORT lf.timeStamp DESC LIMIT ${skip}, ${perPage} RETURN lf`,
                  { fullCount: true },
                  { count: true }
                )
              : await db.query(
                  aql`FOR lf IN loan_files FILTER 
                  lf.projectKey == ${projectKey} 
                  AND lf.companyKey == ${companyKey}   
                  AND lf.status == ${status}  
                  AND lf.montantCreditDemande >= ${mAmnt} 
                  AND lf.loanProductKey == ${productKey} 
                  AND lf.timeStamp >= ${dateFrom}
                  AND lf.timeStamp <= ${dateTo} 
                  SORT lf.timeStamp DESC LIMIT ${skip}, ${perPage} RETURN lf`,
                  { fullCount: true },
                  { count: true }
                );

          if (docs_cursor.hasNext) {
            const docs = await docs_cursor.all();
            db.close();
            return docs.map(async (doc) => {
              return {
                ...(doc.projectKey = await getProjectDoc({
                  projectKey: doc.projectKey,
                })),
                ...(doc.officeKey = await getOfficeDoc({
                  officeKey: doc.officeKey,
                })),
                ...(doc.animateurKey = await getUserDoc({
                  userKey: doc.animateurKey,
                })),
                ...(doc.loanProductKey = await getLoanProductDoc({
                  key: doc.loanProductKey,
                })),
                ...(doc.clientKey = await getPerfectClientDoc({
                  clientKey: doc.clientKey,
                })),
                ...(doc.groupKey = await getSigGroupDoc({
                  ref: doc.groupKey,
                })),
                ...(doc.clientKey["officeKey"] = await getOfficeDoc({
                  officeKey: doc.officeKey,
                })),
                ...(doc.avis = await getLoanAvisDocs({
                  loanFileKey: doc._key,
                })),
                ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
                ...doc,
              };
            });
          } else {
            return [];
          }
        }
      }
    }
  },

  loanFileByKey: async ({ fileKey }) => {
    const doc_cursor = await db.query(aql`FOR lf IN loan_files 
    FILTER lf._key == ${fileKey} RETURN lf`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return {
        ...(doc.pdfFiles = await pdfFileResolver.pdfFiles({
          loanKey: doc._key,
        })),
        ...(doc.dejaCreditProductKey = await getLoanProductDoc({
          key: doc.dejaCreditProductKey,
        })),
        ...(doc.visiteKeys = await getLoanVisiteKeysAsStringArr({
          loanFileKey: doc._key,
        })),
        ...(doc.patrimoineKeys = await getLoanPatrimoines({
          loanFileKey: doc._key,
        })),
        ...(doc.projectKey = await getProjectDoc({
          projectKey: doc.projectKey,
        })),
        ...(doc.companyKey = await getCompanyDoc({
          companyKey: doc.companyKey,
        })),
        ...(doc.officeKey = await getOfficeDoc({
          officeKey: doc.officeKey,
        })),
        ...(doc.animateurKey = await getUserDoc({
          userKey: doc.animateurKey,
        })),
        ...(doc.cautionKeys = await getCautionDocs({
          laonKey: doc._key,
        })),
        ...(doc.gageKeys = await getGageDocs({
          laonKey: doc._key,
        })),
        ...(doc.revisedBy = await getUserDoc({
          userKey: doc.revisedBy,
        })),
        ...(doc.loanProductKey = await getLoanProductDoc({
          key: doc.loanProductKey,
        })),
        ...(doc.clientKey = await getPerfectClientDoc({
          clientKey: doc.clientKey,
        })),
        ...(doc.groupKey = await getSigGroupDoc({
          ref: doc.groupKey,
        })),
        ...(doc.clientKey["countryKey"] = await getCountryDoc({
          key: doc.clientKey["countryKey"],
        })),
        ...(doc.clientKey["cityKey"] = await getCityDoc({
          key: doc.clientKey["cityKey"],
        })),
        ...(doc.clientKey["officeKey"] = await getOfficeDoc({
          officeKey: doc.officeKey,
        })),
        ...(doc.activityKeys = await getLoanActivityAgrDocs({
          loanFileKey: doc._key,
        })),
        ...(doc.exploitationCharges = await getLoanExploitationDocs({
          loanFileKey: doc._key,
          type: "CHARGES",
        })),
        ...(doc.exploitationRecettes = await getLoanExploitationDocs({
          loanFileKey: doc._key,
          type: "RECETTES",
        })),
        // budget familial
        ...(doc.familyExploitationKeys = await getLoanBudgetDocs({
          loanFileKey: doc._key,
        })),
        ...(doc.avis = await getLoanAvisDocs({
          loanFileKey: doc._key,
        })),
        ...(doc.besoinsKeys = await getLoanBesoinsDocs({
          loanFileKey: doc._key,
        })),
        ...(doc.fullCount = 1),
        ...doc,
      };
    } else {
      return {};
    }
  },

  // light (in session)
  loanFileByKeyLight: async ({ fileKey }) => {
    const doc_cursor = await db.query(aql`FOR lf IN loan_files 
    FILTER lf._key == ${fileKey} RETURN lf`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return {
        ...(doc.animateurKey = await getUserDoc({
          userKey: doc.animateurKey,
        })),
        ...(doc.loanProductKey = await getLoanProductDoc({
          key: doc.loanProductKey,
        })),
        ...(doc.clientKey = await getPerfectClientDoc({
          clientKey: doc.clientKey,
        })),
        ...(doc.groupKey = await getSigGroupDoc({
          ref: doc.groupKey,
        })),

        ...(doc.fullCount = 1),
        ...doc,
      };
    } else {
      return {};
    }
  },

  // analyse du credit individuel
  loanFileAnalyseIndividuel: async ({
    loanKey,
    analyseConforme,
    analyseRespectPlafond,
    analyseRespecteActivity,
    riskVolontePayeur,
    riskStabiliteRevenu,
    riskStabiliteAdresse,
    riskPouvoirRemboursement,
    riskQuaniteGaranties,
    riskRatioRemboursement,
    riskReputationDuClient,
    riskAntecedentsCredit,
    dureeCreditAnalyse,
    montantCreditAnalyse,
    interets,
    autresFrais,
    montantParEcheance,
    nombreEcheances,
    dateDecaissement,
  }) => {
    const obj = {
      analyseConforme,
      analyseRespectPlafond,
      analyseRespecteActivity,
      riskVolontePayeur,
      riskStabiliteRevenu,
      riskStabiliteAdresse,
      riskPouvoirRemboursement,
      riskQuaniteGaranties,
      riskRatioRemboursement,
      riskReputationDuClient,
      riskAntecedentsCredit,
      dureeCreditAnalyse,
      montantCreditAnalyse,
      interets,
      autresFrais,
      montantParEcheance,
      nombreEcheances,
      dateDecaissement,
    };

    const doc_cursor = await db.query(aql`UPDATE ${loanKey} 
    WITH ${obj} IN loan_files RETURN NEW`);
    if (doc_cursor.hasNext) {
      return "SUCCESS";
    } else {
      throw new Error(`Erreur lors de la sauvegarde des données de l'analyse`);
    }
  },

  // analyse du credit de groupe
  loanFileAnalyseGroup: async ({
    loanKey,
    groupRiskConforme,
    groupRiskPlafond,
    groupRiskEligible,
    groupRiskVolonteMembres,
    groupRiskStabiliteMembres,
    groupRiskMontant,
    groupRiskSolidarite,
    groupRiskQualiteResponsables,
    groupRiskReputation,
    groupRiskAntecedents,
    dateDecaissement,
  }) => {
    // select loan file
    const loan_cursor = await db.query(aql`FOR l IN loan_files 
    FILTER l._key == ${loanKey} RETURN l`);
    if (loan_cursor.hasNext) {
      const loan = await loan_cursor.next();

      // get the maximum anount from the filieres config
      const _maxAllocation = Math.max.apply(
        Math,
        loan.filieres.map(function (o) {
          return o.montant;
        })
      );

      const obj = {
        groupRiskConforme,
        groupRiskPlafond,
        groupRiskEligible,
        groupRiskVolonteMembres,
        groupRiskStabiliteMembres,
        groupRiskMontant,
        groupRiskSolidarite,
        groupRiskQualiteResponsables,
        groupRiskReputation,
        groupRiskAntecedents,
        dateDecaissement,
        montantCreditAnalyse: _maxAllocation,
        dureeCreditAnalyse: loan.dureeCreditDemande,
      };

      const doc_cursor = await db.query(aql`UPDATE ${loanKey} 
      WITH ${obj} IN loan_files RETURN NEW`);
      if (doc_cursor.hasNext) {
        return "SUCCESS";
      } else {
        throw new Error(
          `Erreur lors de la sauvegarde des données de l'analyse`
        );
      }
    } else {
      throw new Error(`Erreur de sélection de la demande`);
    }
  },

  // décision du comité de crédit
  loanFileDecide: async ({
    loanKey,
    observations,
    closedBy,
    status,
    sessionKey,
    montantCreditAccorde,
    dureeCreditAccorde,
    dateDecaissement,
    datePremierRemboursement,
    nextDecisionLevel,
    comiteLevelId,
    comiteAnalyse1,
    comiteAnalyse2,
    comiteAnalyse3,
    comiteAnalyse4,
    comiteAnalyse5,
    comiteAnalyse6,
    comiteAnalyse7,
    comiteAnalyse8,
    comiteAnalyse9,
    comiteAnalyse10,
    comiteAnalyse11,
    comiteAnalyse12,
    userKey,
    userFullName,
    isFavorable,
    signature,
    roleName,
  }) => {
    if (status != "" && status != "null" && status.length >= 6) {
      // select the session
      const session_doc = await db.query(aql`FOR s IN loan_session 
      FILTER s._key == ${sessionKey} RETURN s`);
      if (session_doc.hasNext) {
        const session = await session_doc.next();
        // make sure the session is still opened
        if (session.status == "OUVERT") {
          // make sure the file is not in session anymore
          const file_cursor = await db.query(aql`FOR f IN loan_files 
          FILTER f._key == ${loanKey} RETURN f`);
          if (file_cursor.hasNext) {
            const file = await file_cursor.next();
            if (
              (file.isInSession == true && file.status == "EN ATTENTE") ||
              (file.isInSession == true && file.status == "AJOURNÉ")
            ) {
              // set amouns
              // set amounts in the session
              const sessStatObj = {
                currentFileKey: null, // unload the file from the session
                totalMontantAnaylse:
                  session.totalMontantAnaylse + montantCreditAccorde,
                totalMontantAccorde:
                  status == "ACCORDÉ"
                    ? session.totalMontantAccorde + montantCreditAccorde
                    : session.totalMontantAccorde + 0,
                totalMontantAjourne:
                  status == "AJOURNÉ"
                    ? session.totalMontantAjourne + montantCreditAccorde
                    : session.totalMontantAjourne + 0,
                totalMontantRejete:
                  status == "REJETÉ"
                    ? session.totalMontantRejete + montantCreditAccorde
                    : session.totalMontantRejete + 0,
              };
              // update the session
              const sess_update_doc = await db.query(aql`UPDATE ${sessionKey} 
       WITH ${sessStatObj} IN loan_session RETURN NEW`);
              // if the update is successfull
              if (sess_update_doc.hasNext) {
                let obsArr = [];
                obsArr = file.observations;
                const obstObj = {
                  timeStamp: Date.now(),
                  sessionKey,
                  comiteLevelId,
                  userKey,
                  userFullName,
                  isFavorable,
                  signature,
                  roleName,
                  note: observations,
                };
                // push the object to the observations
                obsArr.push(obstObj);

                // create the object to update the loan file
                const obj = {
                  dateApprobation: Date.now(),
                  observations: obsArr,
                  closedBy: closedBy,
                  isInSession: false,
                  sessionKey: sessionKey,
                  status: status,
                  montantCreditAccorde: montantCreditAccorde,
                  dureeCreditAccorde: dureeCreditAccorde,
                  dateDecaissement: dateDecaissement,
                  datePremierRemboursement: datePremierRemboursement,
                  nextDecisionLevel: nextDecisionLevel,
                  comiteAnalyse1: comiteLevelId == "CC" ? comiteAnalyse1 : null,
                  comiteAnalyse2: comiteLevelId == "CC" ? comiteAnalyse2 : null,
                  comiteAnalyse3: comiteLevelId == "CC" ? comiteAnalyse3 : null,
                  comiteAnalyse4: comiteLevelId == "CC" ? comiteAnalyse4 : null,
                  comiteAnalyse5: comiteLevelId == "CC" ? comiteAnalyse5 : null,
                  comiteAnalyse6: comiteLevelId == "CC" ? comiteAnalyse6 : null,
                  comiteAnalyse7: comiteLevelId == "CC" ? comiteAnalyse7 : null,
                  comiteAnalyse8: comiteLevelId == "CC" ? comiteAnalyse8 : null,
                  comiteAnalyse9: comiteLevelId == "CC" ? comiteAnalyse9 : null,
                  comiteAnalyse10:
                    comiteLevelId == "CC" ? comiteAnalyse10 : null,
                  comiteAnalyse11:
                    comiteLevelId == "CC" ? comiteAnalyse11 : null,
                  comiteAnalyse12:
                    comiteLevelId == "CC" ? comiteAnalyse12 : null,
                };
                // update the loan file
                const doc_cursor = await db.query(aql`UPDATE ${loanKey} 
         WITH ${obj} IN loan_files RETURN NEW`);
                if (doc_cursor.hasNext) {
                  const doc = await doc_cursor.next();
                  // creer la demande de fonds si le pret est accorde
                  const fondsObj = {
                    timeStamp: Date.now(),
                    sessionKey: sessionKey,
                    loanKey: loanKey,
                    dateDecaissement: doc.dateDecaissement,
                    benefKey: doc.clientKey,
                    animateurKey: doc.animateurKey,
                    companyKey: doc.companyKey,
                    projectKey: doc.projectKey,
                    officeKey: doc.officeKey,
                    montantAccorde: montantCreditAccorde,
                    status: status,
                  };
                  const demande_doc = await db.query(
                    aql`INSERT ${fondsObj} INTO loan_file_fonds RETURN NEW`
                  );
                  const creditSt = status == "ACCORDÉ" ? "OK" : status;
                  // update the client loanCycle
                  await db.query(aql`FOR d IN clients_sig 
             FILTER d._key == ${doc.clientKey} UPDATE {_key: d._key} 
             WITH { prevLoanCycle: ${doc.creditCycle} }
             IN clients_sig RETURN NEW`);

                  // update sms questionnaire data status
                  await db.query(aql`FOR d IN sms_questionnaire_data 
           FILTER d.loanFileKey == ${loanKey} AND d.status == 'Pending'
           UPDATE {_key: d._key} 
           WITH { status: ${creditSt}, loanCycle: ${doc.creditCycle} }
           IN sms_questionnaire_data RETURN NEW`);

                  if (demande_doc.hasNext) {
                    return "SUCCESS";
                  } else {
                    throw new Error(
                      `Erreur lors de la création de la demande de fonds`
                    );
                  }
                } else {
                  throw new Error(
                    `Erreur lors de la mise à jour de la demande`
                  );
                }
              } else {
                throw new Error(
                  `Erreur lors de la mise à jour des montants de la session`
                );
              }
            } else {
              throw new Error(
                `Ce dossier a été déjà clos avec comme statut final: ${file.status}`
              );
            }
          } else {
            throw new Error(`Erreur de selection du dossier`);
          }
        } else {
          throw new Error(
            `Désolé, il semble que la session ${sessionKey} est déjà fermée`
          );
        }
      } else {
        throw new Error(`Erreur de sélection de la session: ${sessionKey}`);
      }
    } else {
      throw new Error(
        `Le statut final du dossier semble être incorrect: ${status}`
      );
    }
  },

  loanFilePrevious: async ({ clientKey }) => {
    // check if there is any initialized loan
    const exist_cursor = await db.query(aql`FOR lf IN loan_files 
    FILTER lf.clientKey == ${clientKey} AND lf.testOnly == 'NON'
    AND lf.status == 'INITIALISÉ' RETURN lf `);
    if (!exist_cursor.hasNext) {
      const doc_cursor = await db.query(aql`FOR lf IN loan_files 
      FILTER lf.clientKey == ${clientKey} 
      AND lf.status != 'INITIALISÉ' AND lf.testOnly == 'NON'
      SORT lf.timeStamp DESC LIMIT 1 RETURN lf `);
      if (doc_cursor.hasNext) {
        const doc = await doc_cursor.next();
        return {
          ...doc,
        };
      } else {
        const vul = await getSMSQuestionnaireDataByClientKey({
          clientKey: clientKey,
        });
        // check for an existing vulnerability record
        const obj = {
          loanCredibilityKey: vul != null ? vul._key : null,
        };
        return {
          ...(obj.fullCount = 1),
          ...obj,
        };
      }
    } else {
      throw new Error(
        `Désolé, vous devez d'abord soumettre ou supprimer le(s) dossier(s) actuellement initialisé(s) pour ce bénéficiaire`
      );
    }
  },

  // l'agent de credit soumet le dossier au chef d'agence
  loanFileSubmit: async ({ loanKey, clientKey, isCreditIndividuel }) => {
    if (isCreditIndividuel == true) {
      // select client
      const client_cursor = await db.query(aql`FOR c IN clients_sig 
      FILTER c._key == ${clientKey} AND 
      c.cityKey != null AND
        c.cityKey != null AND
        c.countryKey != null AND 
        c.photo != 'camera_avatar.png' RETURN c`);
      if (client_cursor.hasNext) {
        const obj = {
          submitStamp: Date.now(),
          nextDecisionLevel: 0,
          status: "INTRODUIT",
        };
        const doc_cursor = await db.query(aql`UPDATE ${loanKey} 
        WITH ${obj} IN loan_files RETURN NEW`);
        if (doc_cursor.hasNext) {
          return "SUCCESS";
        } else {
          throw new Error(`Erreur lors de la soumission de la demande`);
        }
      } else {
        throw new Error(
          `Désolé, vous devez d'abord identifier le bénéficiaire en renseignant tous les champs marqués obligatoires`
        );
      }
    } else {
      const obj = {
        submitStamp: Date.now(),
        nextDecisionLevel: 0,
        status: "INTRODUIT",
      };
      const doc_cursor = await db.query(aql`UPDATE ${loanKey} 
          WITH ${obj} IN loan_files RETURN NEW`);
      if (doc_cursor.hasNext) {
        return "SUCCESS";
      } else {
        throw new Error(`Erreur lors de la soumission de la demande`);
      }
    }
  },

  // revise file by Responsable d'agence
  // if Ok, introduce to session to be analysed
  loanFileRevise: async ({
    loanKey,
    revisedBy,
    revisedComment,
    status,
    canDecideAlone,
    revisedOption,
    nextDecisionLevel,
  }) => {
    const obj = {
      revisedStamp: Date.now(),
      revisedBy: revisedBy,
      revisedComment: revisedComment,
      status: status,
      canDecideAlone: canDecideAlone,
      revisedOption: revisedOption,
      nextDecisionLevel: nextDecisionLevel,
    };

    // select loan
    const loan_cursor = await db.query(aql`FOR l IN loan_files 
    FILTER l._key == ${loanKey} RETURN l`);
    if (loan_cursor.hasNext) {
      // avis
      const avisObj = {
        timeStamp: Date.now(),
        loanFileKey: loanKey,
        message: revisedComment,
        userKey: revisedBy,
        nature: revisedOption,
      };
      await db.query(aql`INSERT ${avisObj} INTO loan_avis RETURN NEW`);

      // update loan file
      const doc_cursor = await db.query(aql`UPDATE ${loanKey} 
        WITH ${obj} IN loan_files RETURN NEW`);
      if (doc_cursor.hasNext) {
        return "SUCCESS";
      } else {
        throw new Error(`Erreur lors de la confirmation de la demande`);
      }
    } else {
      throw new Error(`Erreur de sélection de la demande de crédit`);
    }
  },

  // recuperer le code PRT apres decaissement dans le SIG
  loanFileRefSig: async ({ loanKey }) => {
    // select the loan
    const loans_cursor = await db.query(aql`FOR l IN loan_files 
    FILTER l._key == ${loanKey} RETURN l`);
    if (loans_cursor.hasNext) {
      const loan = await loans_cursor.next();
      // office
      const office = await getOfficeDoc({ officeKey: loan.officeKey });
      // client
      const client =
        loan.isCreditIndividuel == true
          ? await getPerfectClientDoc({ clientKey: loan.clientKey })
          : await getSigGroupDoc({ ref: loan.groupKey });
      // select client or group
      //const groupOrClientSig = "";
      //return "Echec de récupération du numéro du dossier après décaissement. Vérifiez si le montant ou d'autres éléments de la demande correspondent aux données qui sont dans le SIG";
      // send request
      try {
        var result = await axios.post(
          `${serverSigUrl}/latest-loan-by-code-sig/`,
          {
            dbIp: office.sigDBIp,
            dbName: office.sigDBName,
            dbUser: office.sigDBUser,
            dbPass: office.sigDBPass,
            dbPort: office.sigDBPort,
            isCreditIndividuel: loan.isCreditIndividuel,
            codeSig:
              loan.isCreditIndividuel == true
                ? client.codeSig
                : client.groupCode,
          }
        );
        var resData = result.data;
        //console.log(resData);
        /*{
          amount: 100000,
          dateDeblocage: 1654819200000,
          numeroDemande: '35423/22/1',
          numeroCredit: '1/31957/22/1',
          numeroMembre: '20108499',
          deblocage: 'O'
        }*/

        if (
          resData != "NO_DATA" &&
          resData.amount == loan.montantCreditAccorde
        ) {
          const obj = {
            dossierRefSig: resData.numeroCredit, // resData.numeroDemande
            dossierNumero: resData.numeroDemande,
            dateDecaissementEffectif: resData.dateDeblocage,
            status: "DÉCAISSÉ",
          };
          await db.query(aql`UPDATE ${loan._key} 
          WITH ${obj} IN loan_files RETURN NEW`);
          return "SUCCESS";
        } else {
          return "Echec de récupération du numéro du dossier après décaissement. Vérifiez si le montant ou d'autres éléments de la demande correspondent aux données qui sont dans le SIG";
        }
      } catch (error) {
        return error;
      }
    }
  },

  loanFileVote: async ({
    loanFileKey,
    userKey,
    userFullName,
    isFavorable,
    note,
    sessionKey,
    comiteLevelId,
    roleName,
    signature,
  }) => {
    // select the loan file
    const file_cursor = await db.query(aql`FOR lf IN loan_files 
    FILTER lf._key == ${loanFileKey} RETURN lf`);
    if (file_cursor.hasNext) {
      const file = await file_cursor.next();

      // make sure the user has not already voted
      if (
        file.sessionDecisions.some((decision) => decision.userKey === userKey)
      ) {
        throw new Error(
          `Désolé, vous avez déjà enregistré votre vote pour ce dossier`
        );
      } else {
        if (file.status == "EN ATTENTE" || file.status == "AJOURNÉ") {
          const obj = {
            timeStamp: Date.now(),
            sessionKey,
            userKey: userKey,
            userFullName: userFullName,
            isFavorable: isFavorable,
            note: note,
            signature: signature,
            roleName: roleName,
            comiteLevelId,
          };
          let votesArr = file.sessionDecisions;
          votesArr.push(obj);
          const votesArrFinal = [...new Set(votesArr)];
          // udpate the loan file
          const doc_cursor = await db.query(aql`UPDATE ${loanFileKey} 
            WITH  { sessionDecisions: ${votesArrFinal} } 
            IN loan_files RETURN NEW`);
          if (doc_cursor.hasNext) {
            return "SUCCESS";
          } else {
            throw new Error(
              `Erreur lors de l'enregistrement de votre vote. Essayez de nouveau`
            );
          }
        } else {
          throw new Error(
            `Ce dossier a été déjà étudié et clôturé. Votre vote n'a pas été pris en compte`
          );
        }
      }
    }
  },

  loanFileDownload: async ({
    loanFileKey,
    loanProductRef,
    mode,
    folder,
    department,
  }) => {
    //console.log(`loanFileKey: ${loanFileKey}`);
    //console.log(`loanProductRef: ${loanProductRef}`);
    //console.log(`mode: ${mode}`);
    const doc_cursor = await db.query(aql`FOR p IN loan_files 
    FILTER p._key == ${loanFileKey} RETURN p`);
    if (doc_cursor.hasNext) {
      let doc = await doc_cursor.next();

      doc.loanProductKey = await getLoanProductDoc({
        key: doc.loanProductKey,
      });
      doc.loanCategoryKey = await getLoanCategoryDoc({
        categoryKey: doc.loanCategoryKey,
      });
      doc.projectKey = await getProjectDoc({
        projectKey: doc.projectKey,
      });
      doc.companyKey = await getCompanyDoc({
        companyKey: doc.companyKey,
      });
      doc.officeKey = await getOfficeDoc({
        officeKey: doc.officeKey,
      });
      doc.animateurKey = await getUserDoc({
        userKey: doc.animateurKey,
      });
      doc.revisedBy = await getUserDoc({ userKey: doc.revisedBy });

      doc.clientKey = await getPerfectClientDoc({
        clientKey: doc.clientKey,
      });
      doc.clientKey["officeKey"] = await getOfficeDoc({
        officeKey: doc.clientKey["officeKey"],
      });
      doc.clientKey["countryKey"] = await getCountryDoc({
        key: doc.clientKey["countryKey"],
      });
      doc.clientKey["cityKey"] = await getCityDoc({
        key: doc.clientKey["cityKey"],
      });
      doc.activityAgrKeys = await getLoanActivityAgrDocs({
        loanFileKey: doc._key,
      });
      // depenses de la famille
      doc.familleDepenses = await getLoanBudgetDocs({
        loanFileKey: doc._key,
        type: "DÉPENSES",
      });
      // revenus de la famille
      doc.familleRevenus = await getLoanBudgetDocs({
        loanFileKey: doc._key,
        type: "REVENUS",
      });
      // patrimoines (passifs)
      doc.patrimoinePassifs = await getLoanPatrimoineDocs({
        loanFileKey: doc._key,
        type: "PASSIFS",
      });
      // patrimoine (actifs)
      doc.patrimoineActifs = await getLoanPatrimoineDocs({
        loanFileKey: doc._key,
        type: "ACTIFS",
      });

      // gages, garanties
      doc.gages = await getLoanGaranties({ loanFileKey: doc._key });

      // visites
      doc.visites = await getLoanVisiteDocs({ loanFileKey: doc._key });
      // cautions
      doc.cautions = await getCautionDocs({ laonKey: doc._key });

      doc.avis = await getLoanAvisDocs({ loanFileKey: doc._key });
      /*doc.besoinsKeys = await getLoanBesoinsDocs({
        loanFileKey: doc._key,
      });*/
      //doc.resultatNetAGR = 0;

      const date = new Date(doc.timeStamp).toLocaleString("fr-FR", {
        month: "long",
        day: "numeric",
        year: "numeric",
        weekday: "long",
      });

      if (doc.isCreditIndividuel == true) {
        if (mode == "FULL") {
          const pdf = await _downloadCreditIndividuelFull({
            date: date,
            pdfName: `${doc.clientKey["codeSig"]}_demande_credit_full_${doc._key}.pdf`,
            pdfFolder:
              folder != null && folder != undefined ? folder : "public_docs",
            loan: await doc,
          });
          return pdf;
        } else {
          const pdf = await _downloadCreditIndividuelFull({
            date: date,
            pdfName: `${doc.clientKey["codeSig"]}_demande_credit_short_${doc._key}.pdf`,
            loan: await doc,
          });
          return pdf;
        }
      } else {
        throw new Error(
          `La génération du PDF des crédits de groupe n'est pas encore activé`
        );
      }
    } else {
      throw new Error(`Erreur se sélection du prospect`);
    }
  },

  // taleau d'amortissement
  loanPayCalendarDownload: async ({ loanFileKey }) => {
    const doc_cursor = await db.query(aql`FOR p IN loan_files 
    FILTER p._key == ${loanFileKey} RETURN p`);
    if (doc_cursor.hasNext) {
      let doc = await doc_cursor.next();
      //if (doc.isCreditIndividuel == true) {
      // select product
      const product_cursor = await db.query(aql`FOR p IN loan_products 
        FILTER p._key == ${doc.loanProductKey} RETURN p`);
      if (product_cursor.hasNext) {
        const product = await product_cursor.next();
        const client =
          doc.clientKey != "00"
            ? await getPerfectClientDoc({
                clientKey: doc.clientKey,
              })
            : null;
        const group =
          doc.groupKey != "00"
            ? await getSigGroupDoc({
                ref: doc.groupKey,
              })
            : null;

        const pdf = await _downloadPayCalendar({
          pdfName:
            client != null
              ? `${sanitizeString(
                  client.codeSig
                )}_tableau_amortissement_${sanitizeString(
                  doc.frequenceRemboursement
                )}_${doc._key}.pdf`
              : `${sanitizeString(
                  group.groupCode
                )}_tableau_amortissement_${sanitizeString(
                  doc.frequenceRemboursement
                )}_${doc._key}.pdf`,
          pdfFolder: "public_docs",
          loan: await doc,
          product: await product,
          client: await client,
          group: await group,
        });
        return pdf;
      } else {
        throw new Error(`Erreur de sélection du produit`);
      }
      /*} else {
        throw new Error(
          `Impossible de générer le tableau d'amortissement pour les crédits de groupe`
        );
      }*/
    } else {
      throw new Error(`Erreur de sélection du dossier de crédit`);
    }
  },

  // pour le SMS
  loanFileDownloadLatestByCodeSig: async ({ codeSig, mode, folder }) => {
    // select the client
    const doc_cursor = await db.query(aql`FOR c IN loan_files 
    FILTER c.codeSig == ${codeSig} SORT c.creditCycle DESC LIMIT 1 RETURN c`);

    if (doc_cursor.hasNext) {
      let doc = await doc_cursor.next();
      // loan found, continue to select the product key
      const product_cursor = await db.query(aql`FOR p IN loan_products 
      FILTER p._key == ${doc.loanProductKey} RETURN p`);

      if (product_cursor.hasNext) {
        const product = await product_cursor.next();
        const loanProductRef = product.productType;
        // continue
        doc.projectKey = await getProjectDoc({
          projectKey: doc.projectKey,
        });
        doc.companyKey = await getCompanyDoc({
          companyKey: doc.companyKey,
        });
        doc.officeKey = await getOfficeDoc({
          officeKey: doc.officeKey,
        });
        doc.animateurKey = await getUserDoc({
          userKey: doc.animateurKey,
        });
        doc.revisedBy = await getUserDoc({ userKey: doc.revisedBy });
        doc.loanProductKey = await getLoanProductDoc({
          key: doc.loanProductKey,
        });
        doc.clientKey = await getPerfectClientDoc({
          clientKey: doc.clientKey,
        });
        doc.clientKey["officeKey"] = await getOfficeDoc({
          officeKey: doc.clientKey["officeKey"],
        });
        doc.clientKey["countryKey"] = await getCountryDoc({
          key: doc.clientKey["countryKey"],
        });
        doc.clientKey["cityKey"] = await getCityDoc({
          key: doc.clientKey["cityKey"],
        });
        doc.activityAgrKeys = await getLoanActivityAgrDocs({
          loanFileKey: doc._key,
        });
        doc.activityStockageKeys = await getLoanActivityStockageDocs({
          loanFileKey: doc._key,
        });
        doc.exploitationChargesKeys = await getLoanExploitationDocs({
          loanFileKey: doc._key,
          type: "CHARGES",
        });
        doc.exploitationRecettesKeys = await getLoanExploitationDocs({
          loanFileKey: doc._key,
          type: "RECETTES",
        });
        doc.totalCharges = await getLoanExploitationSum({
          loanFileKey: doc._key,
          type: "CHARGES",
        });
        doc.totalRecettes = await getLoanExploitationSum({
          loanFileKey: doc._key,
          type: "RECETTES",
        });
        doc.budgetChargesKeys = await getLoanBudgetDocs({
          loanFileKey: doc._key,
          type: "DÉPENSES",
        });
        doc.budgetRevenusKeys = await getLoanBudgetDocs({
          loanFileKey: doc._key,
          type: "REVENUS",
        });
        doc.avis = await getLoanAvisDocs({ loanFileKey: doc._key });
        doc.besoinsKeys = await getLoanBesoinsDocs({
          loanFileKey: doc._key,
        });
        doc.resultatNetAGR = 0;
        doc.montantAchatEnergie = doc.montantCreditDemande * 0.5;

        const date = new Date(doc.timeStamp).toLocaleString("fr-FR", {
          month: "long",
          day: "numeric",
          year: "numeric",
          weekday: "long",
        });

        const dateDecaissement =
          doc.dateDecaissement != null
            ? new Date(doc.dateDecaissement).toLocaleString("fr-FR", {
                month: "long",
                day: "numeric",
                year: "numeric",
                weekday: "long",
              })
            : "-";

        const dateRemboursement =
          doc.datePremierRemboursement != null
            ? new Date(doc.datePremierRemboursement).toLocaleString("fr-FR", {
                month: "long",
                day: "numeric",
                year: "numeric",
                weekday: "long",
              })
            : "";

        if (loanProductRef == "AGR_AVEC_PRODUITS_ENERGIE") {
          if (mode == "FULL") {
            const pdf = await _loanFilePdfAGR({
              date: date,
              dateDecaissement: dateDecaissement,
              datePremierRemboursement: dateRemboursement,
              pdfName: `${doc.codeSig}_${
                doc._key
              }_demande_credit_full_${sanitizeString(doc.status)}.pdf`,
              pdfFolder:
                folder != null && folder != undefined ? folder : "public_docs",
              loan: await doc,
            });
            return pdf;
          } else {
            const pdf = await _loanFileShort({
              date: date,
              pdfName: `${doc.codeSig}_${
                doc._key
              }_demande_credit_short_${sanitizeString(doc.status)}.pdf`,
              loan: await doc,
            });
            return pdf;
          }
        } else if (loanProductRef == "AGR_SANS_PRODUITS_ENERGIE") {
          if (mode == "FULL") {
            const pdf = await _loanFilePdfAGR({
              date: date,
              dateDecaissement: dateDecaissement,
              datePremierRemboursement: dateRemboursement,
              pdfName: `${doc.codeSig}_${
                doc._key
              }_demande_credit_full_${sanitizeString(doc.status)}.pdf`,
              pdfFolder:
                folder != null && folder != undefined ? folder : "public_docs",
              loan: await doc,
            });
            return pdf;
          } else {
            const pdf = await _loanFileShort({
              date: date,
              pdfName: `${doc.codeSig}_${
                doc._key
              }_demande_credit_short_${sanitizeString(doc.status)}.pdf`,
              loan: await doc,
            });
            return pdf;
          }
        } else if (loanProductRef == "AGR_STOCKAGE") {
          if (mode == "FULL") {
            const pdf = await _loanFilePdfStockage({
              date: date,
              dateDecaissement: dateDecaissement,
              dateRemboursement: dateRemboursement,
              pdfName: `${doc.codeSig}_${
                doc._key
              }_demande_credit_full_${sanitizeString(doc.status)}.pdf`,
              pdfFolder:
                folder != null && folder != undefined ? folder : "public_docs",
              loan: await doc,
            });
            return pdf;
          } else {
            const pdf = await _loanFileShort({
              date: date,
              pdfName: `${doc.codeSig}_${
                doc._key
              }_demande_credit_short_${sanitizeString(doc.status)}.pdf`,
              loan: await doc,
            });
            return pdf;
          }
        }
      } else {
        throw new Error(`Erreur se sélection du prospect`);
      }
    } else {
      return Error(
        `Désolé, aucun crédit trouvé pour le bénéficiaire ${codeSig}`
      );
    }
  },

  loanFilesSummaryDownload: async ({
    officeKey,
    companyKey,
    projectKey,
    status,
    dateFrom,
    dateTo,
    department,
    skip,
    perPage,
  }) => {
    /*console.log(`officeKey: ${officeKey}`);
    console.log(`companyKey: ${companyKey}`);
    console.log(`projectKey: ${projectKey}`);
    console.log(`status: ${status}`);
    console.log(`dateFrom: ${dateFrom}`);
    console.log(`dateTo: ${dateTo}`);
    console.log(`department: ${department}`);*/
    // select the loans
    const docs_cursor = await db.query(
      aql`FOR df IN loan_files
      FILTER df.projectKey == ${projectKey}
      AND df.companyKey == ${companyKey}
      AND df.officeKey == ${officeKey} 
      AND df.status == ${status} 
      AND df.dateDecaissement >= ${dateFrom}
      AND df.dateDecaissement <= ${dateTo} 
      SORT df.dateDecaissement DESC 
      LIMIT ${skip}, ${perPage} RETURN df`,
      { fullCount: true },
      { count: true }
    );

    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      let docsArr = [];
      const dataFrom = skip + 1;
      const dataTo = skip + 1 + (perPage - 1);
      // date from
      const datexFrom = new Date(Math.floor(new Date(dateFrom))).toLocaleString(
        "fr-FR",
        {
          month: "long",
          day: "numeric",
          year: "numeric",
          weekday: "long",
        }
      );
      // date to
      const datexTo = new Date(Math.floor(new Date(dateTo))).toLocaleString(
        "fr-FR",
        {
          month: "long",
          day: "numeric",
          year: "numeric",
          weekday: "long",
        }
      );
      const dateIntervalle = `Du ${datexFrom} au ${datexTo}`;

      for (let index = 0; index < docs.length; index++) {
        const doc = docs[index];

        const agence = await getOfficeDoc({ officeKey: doc.officeKey });
        //const anim = await getUserDoc({ userKey: doc.animateurKey });
        const prod = await getLoanProductDoc({ key: doc.loanProductKey });
        const clt = await getPerfectClientDoc({ clientKey: doc.clientKey });
        const agr = await getLoanActivityAgrDocs({ loanFileKey: doc._key });
        const bes = await getLoanBesoinsDocs({ loanFileKey: doc._key });

        let activity;
        let lieuAppro;
        let lieuVente;

        switch (doc.isCreditIndividuel) {
          case true:
            activity = await agr[0].then((v) => v.activityName);
            lieuAppro = await agr[0].then((v) => v.approLieu);
            lieuVente = await agr[0].then((v) => v.commerceAddress);
            break;
          case false:
            activity = "-";
            lieuAppro = "-";
            lieuVente = "-";
            break;
          default:
            break;
        }

        // build the object
        const docObj = {
          dateDecaissement: new Date(
            Math.floor(
              new Date(
                doc.dateDecaissementEffectif != null
                  ? doc.dateDecaissementEffectif
                  : doc.dateDecaissement
              )
            )
          ).toLocaleString("fr-FR", {
            month: "long",
            day: "numeric",
            year: "numeric",
            weekday: "long",
          }),

          montantCreditPrecedent:
            doc.dejaCreditMontant != null && doc.dejaCreditMontant != undefined
              ? doc.dejaCreditMontant
              : 0,
          amount: doc.montantCreditDemande,
          amountAccorde: doc.montantCreditAccorde,
          duree: doc.dureeCreditDemande,
          dureeAccorde: doc.dureeCreditAccorde,
          clientCode: clt.codeSig,
          clientFullName: clt.fullName,
          animateurFullName:
            doc.montageParFullName.length <= 35
              ? doc.montageParFullName
              : doc.montageParFullName.substr(0, 35),
          produit: prod.productName,
          cycle: doc.creditCycle,
          status: status,
          activite: activity,
          antenne: agence.officeName,
          sexe: clt.gender,
          lieuAppro: lieuAppro,
          lieuVente: lieuVente,
          dossierRefSig: doc.dossierRefSig,
          differe: doc.differe,
          besoinsArr: bes,
          maritalStatus:
            clt.maritalStatus != undefined && clt.maritalStatus != null
              ? clt.maritalStatus
              : "-",
          numberOfChildren:
            clt.numberOfChildren != undefined && clt.numberOfChildren != null
              ? clt.numberOfChildren
              : "-",
          peopleInCharge:
            clt.peopleInCharge != undefined && clt.peopleInCharge != null
              ? clt.peopleInCharge
              : "-",
          birthDate:
            clt.naissanceDate != undefined && clt.naissanceDate != null
              ? clt.naissanceDate
              : "- -/- -/- - - -",
        };
        docsArr.push(docObj);
      }

      if (docsArr.length > 0) {
        if (department == "CAISSE") {
          const pdfx = await _loanFilesPDF_Caisse({
            pdfName: `agence${agence.externalId}_CAISSE_demandes_${officeKey}_${dateFrom}_${dateTo}_skip${skip}_perPage${perPage}.pdf`,
            loanArr: docsArr,
            dateIntervalle: dateIntervalle,
            paging: `Dossier ${dataFrom} à ${dataTo}`,
          });
          return pdfx;
        } else if (department == "KIVA") {
          // TODO > KIVA PDF
          const pdfx = await _loanFilesPDF_Kiva({
            pdfName: `agence${agence.externalId}_KIVA_demandes_${sanitizeString(
              status
            )}_${officeKey}_${dateFrom}_${dateTo}_skip${skip}_perPage${perPage}.pdf`,
            loanArr: docsArr,
            dateIntervalle: dateIntervalle,
            paging: `Dossier ${dataFrom} à ${dataTo}`,
          });
          return pdfx;
        }
      }
    } else {
      return `Aucun dossier trouvé`;
    }
  },

  loanFileSetSync: async ({
    loanFileKey,
    syncType,
    officeKey,
    companyKey,
    projectKey,
  }) => {
    if (syncType == "TRUE" || syncType == "FALSE") {
      const client_doc = await db.query(aql`FOR c IN loan_files 
      FILTER c._key == ${loanFileKey} RETURN c`);
      if (client_doc.hasNext) {
        //const client = await client_doc.next();
        const obj = {
          markedToDownload: syncType == "TRUE" ? true : false,
          updatedAt: Date.now(),
        };
        const doc_cursor = await db.query(aql`UPDATE ${loanFileKey} 
        WITH ${obj} IN loan_files RETURN NEW`);
        if (doc_cursor.hasNext) {
          const doc = await doc_cursor.next();
          return {
            ...(doc.fullCount = 1),
            ...doc,
          };
        } else {
          throw new Error(
            `Erreur lors de la ${
              syncType == "TRUE" ? "synchronisation" : "désynchronisation"
            } du client ${clientKey}`
          );
        }
      } else {
        throw new Error(`Erreur de sélectionner du dossier ${loanFileKey}`);
      }

      // RESET ALL ACTIVATED CLIENTS TO FALSE
    } else if (syncType == "RESET") {
      // select all clients
      const obj = {
        markedToDownload: false,
        updatedAt: Date.now(),
      };
      // bulk update
      const docs_cursor = await db.query(aql`FOR c IN loan_files 
      FILTER c.companyKey == ${companyKey}
       AND c.projectKey == ${projectKey}
       AND c.officeKey == ${officeKey} 
       UPDATE {_key: c._key} WITH ${obj} IN loan_files RETURN NEW`);
      if (docs_cursor.hasNext) {
        const doc = await docs_cursor.next();
        return { ...doc };
      } else {
        throw new Error(`Erreur lors de la désynchronisation de masse`);
      }
    }
  },

  // modifier la date de decaissement
  loanFileSetDateDecaissement: async ({
    loanKey,
    dateDecaissement,
    datePremierRemboursement,
  }) => {
    // select loan
    const loan_cursor = await db.query(aql`FOR l IN loan_files 
    FILTER l._key == ${loanKey} RETURN l`);
    if (loan_cursor.hasNext) {
      const obj = {
        dateDecaissement: dateDecaissement,
        datePremierRemboursement: datePremierRemboursement,
      };
      const doc_cursor = await db.query(aql`UPDATE ${loanKey} 
        WITH ${obj} IN loan_files RETURN NEW`);
      if (doc_cursor.hasNext) {
        return "TRUE";
      } else {
        return `Une erreur s\'est produite lors lors de la modification des dates`;
      }
    } else {
      return `Erreur de sélection de la demande de crédit`;
    }
  },

  loanFileChangeCycle: async ({ loanKey, cycle, clientKey }) => {
    const obj = {
      creditCycle: cycle,
    };
    // select loan
    const loan_cursor = await db.query(aql`FOR lk IN loan_files 
    FILTER lk._key == ${loanKey} RETURN lk`);
    if (loan_cursor.hasNext) {
      // continue
      const doc_cursor = await db.query(aql`UPDATE ${loanKey} 
        WITH ${obj} IN loan_files RETURN NEW`);
      if (doc_cursor.hasNext) {
        // update client lastLoanCycle
        await db.query(aql`FOR d IN clients_sig 
        FILTER d._key == ${clientKey} UPDATE {_key: d._key} 
        WITH { prevLoanCycle: ${cycle} }
        IN clients_sig RETURN NEW`);
        return "OK";
      } else {
        return `Erreur lors de la modification du cycle du crédit ${loanKey}`;
      }
    } else {
      return `Erreur de sélection du dossier de crédit ${loanKey}`;
    }
  },

  /*
  loansCodePrtAutoUpdate: async () => {
    // select the latest loans that need the code PRT
    const loans_cursor = await db.query(aql`FOR l IN loan_files FILTER 
    l.status == "ACCORDÉ" SORT l.timeStamp DESC LIMIT 1 RETURN l`);
    if (loans_cursor.hasNext) {
      const loans = await loans_cursor.all();
      for (let index = 0; index < loans.length; index++) {
        const loan = loans[index];
        // send request
        try {
          var result = await axios.get(
            `${serverSigUrl}/loan-get-code-prt-by-code-sig/${loan.codeSig}`
          );
          var resData = result.data;
          if (resData != {} && resData.codePRT != "NOT_FOUND") {
            //console.log(`orderKey: ${loan._key} > ${resData.codePRT}`);
            await db.query(aql`UPDATE ${loan._key} 
            WITH { codePRT: ${resData.codePRT} } 
            IN loan_files RETURN NEW`);
          } else {
            console.log(`Code PRT non trouvé pour la commande : ${loan._key}`);
          }
        } catch (error) {}
      }
    }
  },*/

  // creer une copie d'un dossier
  loanFileDuplicate: async ({ fileKey }) => {
    // select file
    // if is individual credit
    // if is group credit
  },
};

export default loanFilesResolver;
