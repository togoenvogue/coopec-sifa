export const types = `
    type SMSFormationsAnim {
        _id: ID
        _key: ID
        timeStamp: Float
        trainingStamp: Float
        projectKey: Project
        companyKey: Company
        officeKey: Office
        animCountAttendu: Int
        animCountPresent: Int
        trainingKey: SMSFormationsTheme
        socialUserKey: User
        socialUserRef: String
        animateurKeys: [User]
        animateurRefs: [String]
        comment: String
        trainingLat: Float
        trainingLong: Float
        signatureSocialUser: String
        signaturesAnimateurs: String
        adminKey: User
        status: String
        fullCount: Int
        approveStamp: Float
        rejectStamp: Float
        closeStamp: Float
        adminComments: [String]
    } 
`;

export const queries = `
    getSmsFormationsAnims(
        companyKey: String!,
        projectKey: String!,
        officeKey: String!,
        socialUserKey: String!,
        coverage: String!,
        dateFrom: Float!,
        dateTo: Float!,
        skip: Int!,
        perPage: Int!,
 ): [SMSFormationsAnim]!
`;

export const mutations = `
    smsFormationsAnimsCreate(
        trainingStamp: Float!,
        projectKey: String!,
        companyKey: String!,
        officeKey: String!,
        animCountAttendu: Int!,
        animCountPresent: Int!,
        trainingKey: String!,
        socialUserKey: String!,
        socialUserRef: String!,
        animateurKeys: [String],
        animateurRefs: [String],
        comment: String!,
        trainingLat: Float!,
        trainingLong: Float!,
   ): String!

   smsFormationsAnimsUpdate(
        docKey: String!,
        trainingStamp: Float!,
        officeKey: String!,
        animCountAttendu: Int!,
        animCountPresent: Int!,
        trainingKey: String!,
        animateurKeys: [String],
        animateurRefs: [String],
        comment: String!
   ): String!

   smsFormationsAnimsDelete(docKey: String!): String!
   smsFormationsAnimsApproveOrReject(
        docKey: String!, 
        action: String!, 
        adminKey: String!,
        comment: String!,
    ): String!
`;
