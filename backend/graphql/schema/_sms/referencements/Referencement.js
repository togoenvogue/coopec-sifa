export const types = `
    type SMSReferencement {
        _id: ID
        _key: ID
        timeStamp: Float
        referStamp: Float
        referLat: Float
        referLong: Float
        projectKey: Project
        companyKey: Company
        officeKey: Office
        socialUserKey: User
        socialUserRef: String
        adminKey: User
        clientKey: ClientSIG
        motifThemeKey: SMSActivityTheme
        motifThemeAutre: String
        socialPartnerKey: SMSSocialPartner
        meetingStamp: Float
        meetingPartnerAssistantFullName: String
        meetingPartnerAssistantContact: String
        meetingActions: String
        meetingDecisions: String
        signatureClient: String
        signatureSocialUser: String
        signatureSocialPartner: String
        fullCount: Int
        status: String
        approveStamp: Float
        rejectStamp: Float
        closeStamp: Float
        photo: String
        photo1: String
        photo2: String
        photo3: String
        legende: String
        legende1: String
        legende2: String
        legende3: String
        adminComments: [String]
    } 
`;

export const queries = `
    smsReferencements(
        companyKey: String!,
        projectKey: String!,
        officeKey: String!,
        dateFrom: Float!,
        dateTo: Float!,
        skip: Int!,
        perPage: Int!,
        socialUserKey: String!,
        coverage: String!
    ): [SMSReferencement]!
`;

export const mutations = `
    smsReferencementsCreate(
        referStamp: Float!,
        referLat: Float!,
        referLong: Float!,
        projectKey: String!,
        companyKey: String!,
        officeKey: String!, 
        socialUserKey: String!,
        socialUserRef: String!,
        clientKey: String!,
        motifThemeKey: String!,
        motifThemeAutre: String,
        socialPartnerKey: String!,
        meetingStamp: Float!,
        meetingPartnerAssistantFullName: String!,
        meetingPartnerAssistantContact: String!,
        meetingActions: String!,
        meetingDecisions: String!,
   ): String!

   smsReferencementsUpdate(
        docKey: String!,
        referStamp: Float!,
        officeKey: String!,
        clientKey: String!,
        motifThemeKey: String!,
        motifThemeAutre: String,
        socialPartnerKey: String!,
        meetingStamp: Float!,
        meetingPartnerAssistantFullName: String!,
        meetingPartnerAssistantContact: String!,
        meetingActions: String!,
        meetingDecisions: String!,
   ): String!

   smsReferencementsDelete(docKey: String!): String!
   smsReferencementsApproveOrReject(
        docKey: String!, 
        action: String!, 
        adminKey: String!,
        comment: String!,
    ): String!
`;
