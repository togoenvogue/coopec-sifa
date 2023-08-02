export const types = `
    type SMSEvenement {
        _id: ID
        _key: ID
        timeStamp: Float
        projectKey: Project
        companyKey: Company
        officeKey: Office
        eventStamp: Float
        eventThemeKey: SMSActivityTheme
        eventThemeDetail: String
        socialUserKey: User
        socialUserRef: String
        socialPartnerKeys: [SMSSocialPartner]
        socialPartnerNames: [String]
        totalParticipantDirect: Int
        totalParticipantInDirect: Int
        comment: String
        eventLat: Float
        eventLong: Float
        adminKey: User
        status: String
        approveStamp: Float
        rejectStamp: Float
        closeStamp: Float
        fullCount: Int
        photo: String
        photo1: String
        photo2: String
        photo3: String
        adminComments: [String]
    } 
`;

export const queries = `
    smsEvenements(
        companyKey: String!,
        projectKey: String!,
        officeKey: String!,
        socialUserKey: String!,
        coverage: String!,
        dateFrom: Float!,
        dateTo: Float!,
        skip: Int!,
        perPage: Int!,
 ): [SMSEvenement]!
`;

export const mutations = `
    smsEvenementsCreate(
        projectKey: String!,
        companyKey: String!,
        officeKey: String!,
        eventStamp: Float!,
        eventThemeKey: String!,
        eventThemeDetail: String!,
        socialUserKey: String!,
        socialUserRef: String!,
        socialPartnerKeys: [String],
        socialPartnerNames: [String], 
        eventLat: Float!,
        eventLong: Float!,
   ): String!

   smsEvenementsUpdate(
        docKey: String!,
        officeKey: String!,
        eventStamp: Float!,
        eventThemeDetail: String!,
        socialPartnerKeys: [String],
        socialPartnerNames: [String],
        totalParticipantDirect: Int!,
        totalParticipantInDirect: Int!,
        comment: String!,
   ): String!
 
   smsEvenementsDelete(docKey: String!): String!
   smsEvenementsApproveOrReject(
        docKey: String!, 
        action: String!, 
        adminKey: String!,
        comment: String!,
    ): String!
`;
