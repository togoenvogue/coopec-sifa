export const types = `
    type SMSSuivisData {
        _id: ID
        _key: ID
        timeStamp: Float
        suiviStamp: Float
        suiviLat: Float
        suiviLong: Float
        projectKey: Project
        companyKey: Company
        officeKey: Office
        fullCount: Int
        socialUserKey: User
        socialUserRef: String
        animateurKey: User
        adminKey: User
        clientKey: ClientSIG
        clientSocialMaritus: String
        clientCreditStatus: String
        suiviNumber: String
        suiviLocation: String
        suiviLocationAutre: String
        suiviObjetKey: SMSSuivisObjet
        suiviObjetAutre: String
        suiviComment: String
        suiviLastRef: String
        suiviLastRefSocialPartnerKey: SMSSocialPartner
        suiviLastRefDate: Float
        suiviLastRefQualif: String
        suiviLastRefComment: String
        suiviClientStatusKey: SMSSuivisStatutPartenaire
        suiviNextActionKey: SMSSuivisAction
        suiviNextActionDate: Float
        suiviNextActionSocialPartnerKey: SMSSocialPartner
        suiviNextActionLocation: String
        suiviNextActionComment: String
        signatureClient: String
        signatureSocialUser: String
        status: String
        approveStamp: Float
        rejectStamp: Float
        closeStamp: Float
        adminComments: [String]
    } 
`;

export const queries = `
    smsSuivisData(
        companyKey: String!,
        projectKey: String!,
        officeKey: String!,
        dateFrom: Float!,
        dateTo: Float!,
        skip: Int!,
        perPage: Int!,
        socialUserKey: String!,
        coverage: String!
 ): [SMSSuivisData]!
`;

export const mutations = `
    smsSuivisDataCreate(
        suiviStamp: Float!,
        suiviLat: Float!,
        suiviLong: Float!,
        projectKey: String!,
        companyKey: String!,
        officeKey: String!,
        socialUserKey: String!,
        socialUserRef: String!,
        animateurKey: String!,
        clientKey: String!,
        clientSocialMaritus: String!,
        clientCreditStatus: String!,
        suiviNumber: String,
        suiviLocation: String!,
        suiviLocationAutre: String,
        suiviObjetKey: String!,
        suiviObjetAutre: String,
        suiviComment: String!,
        suiviLastRef: String,
        suiviLastRefSocialPartnerKey: String,
        suiviLastRefDate: Float,
        suiviLastRefQualif: String,
        suiviLastRefComment: String,
        suiviClientStatusKey: String,
        suiviNextActionKey: String,
        suiviNextActionDate: Float,
        suiviNextActionSocialPartnerKey: String,
        suiviNextActionLocation: String,
        suiviNextActionComment: String,
   ): String!

   smsSuivisDataUpdate(
        docKey: String!,
        suiviStamp: Float!,
        officeKey: String!,
        clientKey: String!,
        clientSocialMaritus: String!,
        clientCreditStatus: String!,
        suiviNumber: String,
        suiviLocation: String!,
        suiviLocationAutre: String,
        suiviObjetKey: String!,
        suiviObjetAutre: String,
        suiviComment: String!,
        suiviLastRef: String,
        suiviLastRefSocialPartnerKey: String,
        suiviLastRefDate: Float,
        suiviLastRefQualif: String,
        suiviLastRefComment: String,
        suiviClientStatusKey: String,
        suiviNextActionKey: String,
        suiviNextActionDate: Float,
        suiviNextActionSocialPartnerKey: String,
        suiviNextActionLocation: String,
        suiviNextActionComment: String,
   ): String!

   smsSuivisDataDelete(docKey: String!): String!
   smsSuivisDataApproveOrReject(
        docKey: String!, 
        action: String!, 
        adminKey: String!,
        comment: String!,
    ): String!
`;
