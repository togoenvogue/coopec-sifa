export const types = `
    type SMSActivityType {
        _id: ID
        _key: ID
        timeStamp: Float
        projectKey: Project
        companyKey: Company
        activity: String
        accessLevel: Int
        fullCount: Int
    } 
`;

export const queries = `
    smsActivityTypes(
        companyKey: String!,
        projectKey: String!,
        skip: Int!,
        perPage: Int!,
    ): [SMSActivityType]!

    smsActivityTypesByLevel(
        companyKey: String!,
        projectKey: String!,
        accessLevel: Int!,
        skip: Int!,
        perPage: Int!,
    ): [SMSActivityType]!
`;

export const mutations = `
    smsActivityTypesCreate(
        projectKey: String!,
        companyKey: String!,
        activity: String!,
        accessLevel: Int!,
   ): String!

   smsActivityTypesUpdate(
        docKey: String!,
        activity: String!,
        accessLevel: Int!,
   ): String!

   smsActivityTypesDelete(docKey: String!): String!
`;
