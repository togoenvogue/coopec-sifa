export const types = `
    type SMSFormationsObs {
        _id: ID
        _key: ID
        timeStamp: Float
        obsStamp: Float
        projectKey: Project
        companyKey: Company
        officeKey: Office
        fullCount: Int
        trainingKey: SMSFormationsTheme
        socialUserKey: User
        socialUserRef: String
        animateurKey: User
        animateurRef: String
        adminKey: User
        groupKeys: [GroupSIG]
        groupNames: [String]
        comment: String
        obsLat: Float
        obsLong: Float
        status: String
        signatureSocialUser: String
        signatureAnimateur: String
        approveStamp: Float
        rejectStamp: Float
        closeStamp: Float
        adminComments: [String]
    } 
`;

export const queries = `
    getSmsFormationsObs(
        companyKey: String!,
        projectKey: String!,
        officeKey: String!,
        socialUserKey: String!,
        coverage: String!,
        dateFrom: Float!,
        dateTo: Float!,
        skip: Int!,
        perPage: Int!,
 ): [SMSFormationsObs]!
`;

export const mutations = `
    smsFormationsObsCreate(
        obsLat: Float!,
        obsLong: Float!,
        obsStamp: Float!,
        projectKey: String!,
        companyKey: String!,
        officeKey: String!,
        trainingKey: String!,
        socialUserKey: String!,
        socialUserRef: String!,
        animateurKey: String!,
        animateurRef: String!,
        groupKeys: [String]!,
        groupNames: [String]!,
        comment: String!,
   ): String!

   smsFormationsObsUpdate(
        docKey: String!,
        obsStamp: Float!,
        officeKey: String!,
        trainingKey: String!,
        groupKeys: [String]!,
        groupNames: [String]!,
        comment: String!,
   ): String!

   smsFormationsObsDelete(docKey: String!): String!
   smsFormationsObsApproveOrReject(
        docKey: String!, 
        action: String!, 
        adminKey: String!,
        comment: String!,
    ): String!
`;
