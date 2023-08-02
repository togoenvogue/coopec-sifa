export const types = `
    type LoanFile {
        _id: ID
        _key: ID
        timeStamp: Float
        loanProductKey: LoanProduct
        loanCategoryKey: LoanCategory
        isCreditIndividuel: Boolean
        dossierNumero: String
        dossierRefSig: String
        animateurKey: User
        companyKey: Company
        projectKey: Project
        officeKey: Office
        clientKey: ClientSIG
        groupKey: GroupSIG
        groupClientKeys: [ClientSIG]
        frequenceRemboursement: String
        frequenceExploitation: String
        montantCreditDemande: Float
        montantCreditAnalyse: Float
        montantCreditAccorde: Float
        nombreEcheances: Int
        differe: Int
        personneType: String
        moreInfo: String
        interets: Float
        tauxInterets: Float
        autresFrais: Float
        dateApprobation: Float
        dateDecaissement: Float
        dateDecaissementEffectif: Float
        datePremierRemboursement: Float
        dureeCreditDemande: Int
        dureeCreditAnalyse: Int
        dureeCreditAccorde: Int 
        status: String
        activityKeys: [ActivityType]
        exploitationCharges: [ActivityExploitationType]
        exploitationRecettes: [ActivityExploitationType]
        familyExploitationKeys: [FamilyExploitationType]
        soldeClient: Float
        soldeClientDate: Float
        montantParEcheance: Float
        avis: [LoanAvis]
        avisAgentCredit: String
        avisVotes: [AvisVoteType]
        approKeys: [ActivityApproType]
        revisedBy: User
        revisedComment: String
        revisedStamp: Float
        revisedOption: String
        nextDecisionLevel: Int
        canDecideAlone: Boolean
        isInSession: Boolean
        fullCount: Int
        sessionDecisions: [LoanSessionDecision]
        loanLat: Float
        loanLong: Float
        visiteKeys: [LoanSuivi]
        patrimoineKeys: [PatrimoineType]
        submitStamp: Float
        montageParSignature: String
        montageParFullName: String
        signatureAgentCredit: String
        clientSignature: String
        clientSignatureType: String
        sessionKey: LoanSession
        expiredNote: String
        expiredStamp: Float
        creditObjet: String
        creditType: String
        creditCycle: Int
        dejaCreditYesNo: String
        dejaCreditNoWhy: String
        dejaCreditInstitution: String
        dejaCreditMontant: Float
        dejaCreditObjet: String
        dejaCreditProductKey: LoanProduct 
        previousLoanCycle: Int
        previousLoanStartDate: Float
        previousLoanTotallyPaid: String
        previousLoanPaidWithNant: String
        previousLoanDifficulty: String
        previousLoanDifficultyReason: String
        loanActivityDesc: String
        loanActivityMarketDesc: String
        loanActivityOtherInfo: String
        loanActivityNeeds: String
        analyseConforme: String
        analyseRespectPlafond: String
        analyseRespecteActivity: String
        riskVolontePayeur: String
        riskStabiliteRevenu: String
        riskStabiliteAdresse: String
        riskPouvoirRemboursement: String
        riskQuaniteGaranties: String
        riskRatioRemboursement: String
        riskReputationDuClient: String
        riskAntecedentsCredit: String  
        cautionKeys: [CautionType]
        gageKeys: [GageType]
        gageEvalKeys: [GageEvalType]
        observations: [LoanSessionDecision]
        loanCredibilityKey: String
        groupLoanGestions: [GroupLoanGestion]
        groupLoanClients: [GroupLoanClient]
        groupLoanHistories: [GroupLanHistory]
        filieres: [RepartitionFiliereType]
        pdfFiles: [PdfFileType]
        tontineRecords: [TontineRecord]
        montantAnantir: Float
        montantAnantirSouhait: Float
        groupRiskConforme: String
        groupRiskPlafond: String
        groupRiskEligible: String
        groupRiskVolonteMembres: String
        groupRiskStabiliteMembres: String
        groupRiskMontant: String
        groupRiskSolidarite: String
        groupRiskQualiteResponsables: String
        groupRiskReputation: String
        groupRiskAntecedents: String 
        comiteAnalyse1: String
        comiteAnalyse2: String
        comiteAnalyse3: String
        comiteAnalyse4: String
        comiteAnalyse5: String
        comiteAnalyse6: String
        comiteAnalyse7: String
        comiteAnalyse8: String
        comiteAnalyse9: String
        comiteAnalyse10: String
        comiteAnalyse11: String
        comiteAnalyse12: String
        conjoint: String
        custom1: String
        custom2: String
        custom3: String
        custom4: String
        custom5: String
    }

    type RepartitionFiliereType {
        filiereKey: String
        filiereName: String
        montant: Float
        interet: Float
        nantissement: Float
        clientKey: String
        clientName: String
        clientAccount: String
        clientSexe: String
        clientContact: String
        clientQuartier: String
        objet: String
        montantParEcheance: Float
        signature: String
        fingerPrint: String
        photo: String
        poste: String
    }

    type GroupLoanGestion {
        clientKey: String
        fullName: String
        photo: String
        poste: String
        account: String
        signature: String
        finterPrint: String
    }

    type GroupLoanClient {
        clientKey: ClientSIG
        account: String
        montantNanti: Float
        montantCredit: Float
        interet: Float
        montantTotal: Float
        montantParEcheance: Float
        objetCredit: String
        signature: String
        fingerPrint: String
    }

    type GroupLanHistory {
        cycle: Int
        montant: Float
        epargneFinCycle: Float
        totalBenef: Int
        observations: String
    }

    type TontineRecord {
        mois: String
        mise: Float
        total: Float
    }
 
`;

export const queries = `
    loanFileDownload(
        loanFileKey: String,
        loanProductRef: String!,
        mode: String!,
        folder: String, 
    ): String!

    loanPayCalendarDownload(loanFileKey: String): String!

    loanFileDownloadLatestByCodeSig(
        codeSig: String!,
        mode: String!,
    ): String!

    loanFilesSummaryDownload(
        projectKey: String!,
        companyKey: String!,
        officeKey: String!,
        status: String!,
        dateFrom: Float!,
        dateTo: Float!, 
        department: String!,
        skip: Int!,
        perPage: Int!,
    ): String!


    loanFiles(
        accessLevel: Int!,
        userKey: String!,
        companyKey: String!,
        officeKeys: [String]!,
        projectKey: String!,
        status: String!,
        coverage: String!,
        sig: String!,
        dateFrom: Float!,
        dateTo: Float!, 
        minAmount: Float
        skip: Int!,
        perPage: Int!,
        productCoverage: String,
        productKey: String,
    ): [LoanFile]!

    loanFilesByOfficeKey(
        companyKey: String!,
        projectKey: String!,
        officeKey: String!,
        status: String!,
        skip: Int!,
        perPage: Int!,
        maxAmount: Float!,
        minAmount: Float!,
        accessLevel: Int!,
    ): [LoanFile]!


    loanFilesToAnalyseInSession(
        companyKey: String!,
        projectKey: String!,
        officeKey: String!,
        status: String!,
        skip: Int!,
        perPage: Int!,
        maxAmount: Float!,
        minAmount: Float!,
        accessLevel: Int!,
        sessionLevelId: String!,
    ): [LoanFile]!

    loanFileByKey(fileKey: String!): LoanFile!
    loanFileByKeyLight(fileKey: String!) : LoanFile!

    loanFilePrevious(clientKey: String!): LoanFile!
`;

export const mutations = `
    loanFileCreate(
        lfk: String!, 
        loanLat: Float!,
        loanLong: Float!,
        projectKey: String!,
        companyKey: String!,
        loanProductKey: String!,
        loanCategoryKey: String!,
        animateurKey: String!,
        officeKey: String!,
        isCreditIndividuel: Boolean!,
        clientKey: String,
        groupKey: String,
        groupClientKeys: [String],
        codeSig: String,
        creditCycle: Int,
        montantCredit: Float!,
        soldeDuCompte: Float,
        soldeClientDate: Float!,
        dureeCredit: Int!,
        differe: Int!,
        interets: Float!,
        tauxInterets: Float!,
        frequenceRemboursement: String!,
        frequenceExploitation: String!,
        montageParFullName: String!,
        montageParSignature: String!,
        objetCredit: String!,
        dejaCreditNoWhy: String,
        dejaCreditInstitution: String,
        dejaCreditMontant: Float,
        dejaCreditObjet: String, 
        previousLoanDifficultyReason: String,
        typeCredit: String,
        dejaCreditYesNo: String,
        previousLoanCycle: Int,
        previousLoanStartDate: Float,
        previousLoanTotallyPaid: String,
        previousLoanPaidWithNant: String,
        previousLoanDifficulty: String,
        nombreEcheances: Int, 
        personneType: String!, 
        dejaCreditProductKey: String, 
        montantAnantir: Float!,
        montantAnantirSouhait: Float,
        filiereKeysArr: [String]!,
        filiereNamesArr: [String]!,
        filiereMontantsArry: [Float]!,
        filiereClientAccountsArry: [String]!,
        filiereClientNamesArry: [String]!,
        filiereClientKeysArry: [String]!,
        filiereClientContactsArry: [String]!,
        filiereClientSexesArry: [String]!,
        filiereClientQuartiersArry: [String]!,
        filiereSignaturesArry: [String]!,
        filiereFingerPrintsArry: [String]!,
        filiereObjetsArry: [String]!,
        filiereNantissementsArry: [Float]!,
        filiereMontantsParEcheanceArry: [Float]!,
        filiereInteretsArry: [Float]!,
        filierePhotosArry: [String]!,
        filierePostesArry: [String]!,
        tontineMois: [String],
        tontineMises: [Float],
        tontineTotaux: [Float],
        conjoint: String
        custom1: String
        custom2: String
        custom3: String
        custom4: String
        custom5: String
    ): String!

    loanFileUpdate(
        fileKey: String!,
        isCreditIndividuel: Boolean!,
        loanProductKey: String!,
        groupClientKeys: [String], 
        groupKey: String!,
        creditCycle: Int!,
        montantCredit: Float!,
        dureeCredit: Int!,
        differe: Int!,
        interets: Float!,
        tauxInterets: Float!,
        frequenceRemboursement: String,
        frequenceExploitation: String,
        objetCredit: String,
        dejaCreditNoWhy: String,
        dejaCreditInstitution: String,
        dejaCreditMontant: Float,
        dejaCreditObjet: String, 
        previousLoanDifficultyReason: String,
        dejaCreditYesNo: String,
        previousLoanCycle: Int,
        previousLoanStartDate: Float,
        previousLoanTotallyPaid: String,
        previousLoanPaidWithNant: String,
        previousLoanDifficulty: String,
        nombreEcheances: Int, 
        personneType: String!, 
        dejaCreditProductKey: String,
        montantAnantir: Float!,
        montantAnantirSouhait: Float,
        filiereKeysArr: [String]!,
        filiereNamesArr: [String]!,
        filiereMontantsArry: [Float]!,
        filiereKeysArr: [String]!,
        filiereNamesArr: [String]!,
        filiereMontantsArry: [Float]!,
        filiereClientAccountsArry: [String]!,
        filiereClientNamesArry: [String]!,
        filiereClientKeysArry: [String]!,
        filiereClientContactsArry: [String]!,
        filiereClientSexesArry: [String]!,
        filiereClientQuartiersArry: [String]!,
        filiereSignaturesArry: [String]!,
        filiereFingerPrintsArry: [String]!,
        filiereObjetsArry: [String]!,
        filiereNantissementsArry: [Float]!,
        filiereMontantsParEcheanceArry: [Float]!,
        filiereInteretsArry: [Float]!,
        filierePhotosArry: [String]!,
        filierePostesArry: [String]!,
        tontineMois: [String],
        tontineMises: [Float],
        tontineTotaux: [Float],
        conjoint: String
        custom1: String
        custom2: String
        custom3: String
        custom4: String
        custom5: String
    ): String!

    loanFileAnalyseIndividuel(
        loanKey: String!,
        analyseConforme: String!,
        analyseRespectPlafond: String!,
        analyseRespecteActivity: String!,
        riskVolontePayeur: String!,
        riskStabiliteRevenu: String!,
        riskStabiliteAdresse: String!,
        riskPouvoirRemboursement: String!,
        riskQuaniteGaranties: String!,
        riskRatioRemboursement: String!,
        riskReputationDuClient: String!,
        riskAntecedentsCredit: String!, 
        interets: Float!,
        autresFrais: Float!,
        dureeCreditAnalyse: Float!,
        montantCreditAnalyse: Float!, 
        montantParEcheance: Float!,
        nombreEcheances: Int!,
        dateDecaissement: Float!,
    ): String!

    loanFileAnalyseGroup(
        loanKey: String!,
        groupRiskConforme: String!,
        groupRiskPlafond: String!,
        groupRiskEligible: String!,
        groupRiskVolonteMembres: String!,
        groupRiskStabiliteMembres: String!,
        groupRiskMontant: String!,
        groupRiskSolidarite: String!,
        groupRiskQualiteResponsables: String!,
        groupRiskReputation: String!,
        groupRiskAntecedents: String!,
        dateDecaissement: Float!,
    ): String!

    loanFileDecide(
        loanKey: String!,
        observations: String,
        closedBy: String!,
        status: String!,
        sessionKey: String!,
        montantCreditAccorde: Float!,
        dureeCreditAccorde: Float!,
        dateDecaissement: Float!,
        datePremierRemboursement: Float!,
        comiteLevelId: String!,
        comiteAnalyse1: String,
        comiteAnalyse2: String,
        comiteAnalyse3: String,
        comiteAnalyse4: String,
        comiteAnalyse5: String,
        comiteAnalyse6: String,
        comiteAnalyse7: String,
        comiteAnalyse8: String,
        comiteAnalyse9: String,
        comiteAnalyse10: String,
        comiteAnalyse11: String,
        comiteAnalyse12: String,
        nextDecisionLevel: Int!,
        userKey: String!,
        userFullName: String!,
        isFavorable: Boolean!,
        signature: String!,
        roleName: String!,
    ): String!

    loanFileDelete(
        loanKey: String!,
        animateurKey: String!,
    ): String!

    loanFileSubmit(
        loanKey: String!, 
        clientKey: String!, 
        isCreditIndividuel: Boolean!,
    ): String!

    loanFileRevise(
        loanKey: String!,
        revisedBy: String!,
        revisedComment: String!,
        revisedOption: String!,
        nextDecisionLevel: Int!,
        status: String!,
        canDecideAlone: Boolean!, 
    ): String!

    loanFileUnloadFromSession(
        loanKey: String!,
        revisedBy: String!,
        revisedComment: String!,
        status: String!,
        sessionKey: String!,
    ): String!

    loanFileVote( 
        loanFileKey: String!,
        sessionKey: String!,
        userKey: String!,
        userFullName: String!,
        isFavorable: Boolean!,
        note: String,
        roleName: String!,
        signature: String!,
        comiteLevelId: String!,
    ): String!

    loanFileRefSig(loanKey: String!): String!

    loanFileChangeCycle(
        loanKey: String!,
        clientKey: String!, 
        cycle: Int!, 
    ): String!

    loanFileSetSync(
        loanFileKey: String!,
        syncType: String!,
        officeKey: String!,
        companyKey: String!,
        projectKey: String!,
    ): String!

    loanFileSetDateDecaissement(
        loanKey: String!,
        dateDecaissement: Float!,
        datePremierRemboursement: Float!,
    ): String!

    loanFileDuplicate(fileKey: String!): String!
`;
