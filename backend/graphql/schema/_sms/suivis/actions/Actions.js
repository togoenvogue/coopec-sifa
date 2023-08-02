export const types = `
    type SMSSuivisAction {
        _id: ID
        _key: ID
        timeStamp: Float
        projectKey: Project
        companyKey: Company
        action: String 
        fullCount: Int
    } 
`;

export const queries = `
    smsSuivisActions(
        companyKey: String!,
        projectKey: String!,
        skip: Int!,
        perPage: Int!,
    ): [SMSSuivisAction]! 
`;

export const mutations = `
    smsSuivisActionsCreate(
        projectKey: String!,
        companyKey: String!,
        action: String!, 
   ): String!

   smsSuivisActionsUpdate(
        docKey: String!,
        action: String!, 
   ): String!

   smsSuivisActionsDelete(docKey: String!): String!
`;
