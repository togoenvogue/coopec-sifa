export const types = `
    type SMSMonthlyReport {
        _id: ID
        _key: ID
        companyKey: Company
        projectKey: Project
        officeKey: Office
        socialUserKey: User
        socialUserRef: String
        month: Int
        year: Int
        timeStamp: Float
        ecoute_1: String
        ecoute_2: String
        ecoute_3: String
        ecoute_4: String
        referencement_1: String
        referencement_2: String
        referencement_3: String
        referencement_4: String
        causerie_1: String
        causerie_2: String
        causerie_3: String
        causerie_4: String
        causerie_5: String
        evenement_1: String
        evenement_2: String
        evenement_3: String
        formation_oper_1: String
        formation_oper_2: String
        observation_1: String
        observation_2: String
        observation_3: String
        fullCount: Int
        adminStamp: String
        adminKey: User
        status: String
        adminComments: [String]
    } 
`;

export const queries = `
    smsMonthlyReports(
        companyKey: String!,
        projectKey: String!,
        officeKey: String!,
        month: Float!,
        year: Float!,
        skip: Int!,
        perPage: Int!,
        socialUserKey: String!,
        coverage: String!
 ): [SMSMonthlyReport]!
`;

export const mutations = `
    smsMonthlyReportsCreate(
        companyKey: String!,
        projectKey: String!,
        officeKey: String!,
        socialUserKey: String!,
        socialUserRef: String!,
        month: Int!,
        year: Int!,
        ecoute_1: String!,
        ecoute_2: String!,
        ecoute_3: String!,
        ecoute_4: String!,
        referencement_1: String!,
        referencement_2: String!,
        referencement_3: String!,
        referencement_4: String!,
        causerie_1: String!,
        causerie_2: String!,
        causerie_3: String!,
        causerie_4: String!,
        causerie_5: String!,
        evenement_1: String!,
        evenement_2: String!,
        evenement_3: String!,
        formation_oper_1: String!,
        formation_oper_2: String!,
        observation_1: String!,
        observation_2: String!,
        observation_3: String!,
   ): String!

   smsMonthlyReportsUpdate(
        docKey: String!,
        month: Int!,
        year: Int!,
        ecoute_1: String!,
        ecoute_2: String!,
        ecoute_3: String!,
        ecoute_4: String!,
        referencement_1: String!,
        referencement_2: String!,
        referencement_3: String!,
        referencement_4: String!,
        causerie_1: String!,
        causerie_2: String!,
        causerie_3: String!,
        causerie_4: String!,
        causerie_5: String!,
        evenement_1: String!,
        evenement_2: String!,
        evenement_3: String!,
        formation_oper_1: String!,
        formation_oper_2: String!,
        observation_1: String!,
        observation_2: String!,
        observation_3: String!,
   ): String!

   smsMonthlyReportsDelete(docKey: String!): String!
   smsMonthlyReportsApproveOrReject(
        docKey: String!, 
        action: String!, 
        adminKey: String!,
        comment: String!,
    ): String!
`;
