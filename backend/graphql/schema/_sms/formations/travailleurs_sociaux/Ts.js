export const types = `
    type SMSFormationsTS {
        _id: ID
        _key: ID
        timeStamp: Float
        trainingStamp: Float
        projectKey: Project
        companyKey: Company 
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
    getSmsFormationsTS(
        companyKey: String!,
        projectKey: String!, 
        dateFrom: Float!,
        dateTo: Float!,
        skip: Int!,
        perPage: Int!,
 ): [SMSFormationsTS]!
`;

export const mutations = `
    smsFormationsTSCreate(
        trainingStamp: Float!,
        projectKey: String!,
        companyKey: String!, 
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

   smsFormationsTSUpdate(
        docKey: String!,
        trainingStamp: Float!, 
        animCountAttendu: Int!,
        animCountPresent: Int!,
        trainingKey: String!,
        animateurKeys: [String],
        animateurRefs: [String],
        comment: String!
   ): SMSFormationsTS!

   smsFormationsTSDelete(docKey: String!): String!
   smsFormationsTSApproveOrReject(
        docKey: String!, 
        action: String!, 
        adminKey: String!,
        comment: String!,
    ): String!
`;
