export const types = `
    type SMSQuestionnaire {
        _id: ID
        _key: ID
        timeStamp: Float
        projectKey: Project
        companyKey: Company
        questionnaireLabel: String
        questionnaireDesc: String
        blocks: [SMSQuestionnaireBlock] 
        fullCount: Int
    } 
`;

export const queries = `
 smsQuestionnaires(
     companyKey: String!,
     projectKey: String!,
     skip: Int!,
     perPage: Int!,
 ): [SMSQuestionnaire]!
`;

export const mutations = `
   smsQuestionnaireCreate(
        projectKey: String!,
        companyKey: String!,
        questionnaireLabel: String!,
        questionnaireDesc: String!,
   ): SMSQuestionnaire!

   smsQuestionnaireUpdate(
        docKey: String!,
        questionnaireLabel: String!,
        questionnaireDesc: String!,
   ): SMSQuestionnaire!

   smsQuestionnaireDelete(docKey: String!): String!
`;
