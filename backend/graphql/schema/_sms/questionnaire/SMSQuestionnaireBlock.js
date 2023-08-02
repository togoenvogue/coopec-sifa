export const types = `
    type SMSQuestionnaireBlock {
        _id: ID
        _key: ID
        projectKey: Project
        companyKey: Company
        questionnaireKey: SMSQuestionnaire
        blockTitle: String
        options: [SMSQuestionnaireOption] 
        blockOrder: Int
    }
     
`;

export const queries = `
    smsQuestionnaireBlocks(
        questionnaireKey: String!
    ): [SMSQuestionnaireBlock]!

    smsQuestionnaireBlocksWithOptions(
        questionnaireKey: String!,
        companyKey: String!,
        projectKey: String!,
    ): [SMSQuestionnaireBlock]!

    smsQuestionnaireBlocksWithResults(
        questionnaireKey: String!, 
        companyKey: String!,
        projectKey: String!,
        officeKey: String!,
        coverage: String!,
        cycle: Int!,
        dateFrom: Float!,
        dateTo: Float!,
    ): [SMSQuestionnaireBlock]!
`;

export const mutations = `
    smsQuestionnaireBlockCreate(
        questionnaireKey: String!,
        blockTitle: String!,
        blockOrder: Int!,
        projectKey: String!,
        companyKey: String!,
    ): SMSQuestionnaireBlock!

    smsQuestionnaireBlockUpdate(
        blockKey: String!,
        blockTitle: String!,
        blockOrder: Int!, 
    ): SMSQuestionnaireBlock!

    smsQuestionnaireBlockDelete(blockKey: String!): String!
`;
