export const types = `
    type SMSCauserie {
        _id: ID
        _key: ID
        timeStamp: Float
        eventStamp: Float
        companyKey: Company
        projectKey: Project
        officeKey: Office
        socialUserKey: User
        socialUserRef: String
        timeSpan: String
        benefCountDirect: Int
        benefCountIndirect: Int
        trainingThemeKey: SMSActivityTheme
        trainingThemeDetail: String
        socialPartnerKeys: [SMSSocialPartner]
        socialPartnerNames: [String]
        presenceList: [ClientPresence] 
        comment: String
        eventLat: Float
        eventLong: Float
        adminKey: User
        status: String
        fullCount: Int
        photo: String
        photo1: String
        photo2: String
        photo3: String
        approveStamp: Float
        rejectStamp: Float
        lockStamp: Float
        startStamp: Float
        closeStamp: Float
        adminComments: [String]
    } 
`;

export const queries = `
    SMSCauseries(
        companyKey: String!,
        projectKey: String!,
        officeKey: String!,
        socialUserKey: String!,
        coverage: String!,
        dateFrom: Float!,
        dateTo: Float!,
        skip: Int!,
        perPage: Int!,
 ): [SMSCauserie]!
`;

export const mutations = `
    smsCauseriesCreate(
        eventStamp: Float
        companyKey: String!,
        projectKey: String!,
        officeKey: String!,
        timeSpan: String!,
        trainingThemeKey: String!,
        trainingThemeDetail: String!,
        socialPartnerKeys: [String]!,
        socialPartnerNames: [String]!,
        eventLat: Float!,
        eventLong: Float!,
        socialUserKey: String!,
        socialUserRef: String!,
   ): String!

   smsCauseriesUpdate(
        docKey: String!,
        eventStamp: Float
        officeKey: String!,
        timeSpan: String!,
        trainingThemeDetail: String!,
        socialPartnerKeys: [String]!,
        socialPartnerNames: [String]!,
   ): String!

   smsCauseriesAddOrRemoveParticipant(
        docKey: String!,
        clientKeys: [String]!,
        action: String!,
    ): String!

   smsCauseriesSetPresence(
        docKey: String!,
        clientKey: String!,
        round: String!,
        isPresent: Boolean!, 
        presenceStamp: Float!,
    ): String!

   smsCauseriesClose(
        docKey: String!,
        comment: String!,
        benefCountDirect: Int!,
        benefCountIndirect: Int!,
    ): String!

   smsCauseriesDelete(docKey: String!): String!
   smsCauseriesApproveOrReject(
        docKey: String!,
        action: String!, 
        adminKey: String!,
        comment: String!,
    ): String!
`;
