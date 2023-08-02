export const types = `
    type SMSActivityTheme {
        _id: ID
        _key: ID
        timeStamp: Float
        projectKey: Project
        companyKey: Company
        theme: String
        activityTypeKey: SMSActivityType
        fullCount: Int
    } 
`;

export const queries = `
smsActivityThemes(
     companyKey: String!,
     projectKey: String!,
     activityTypeKey: String!,
     skip: Int!,
     perPage: Int!,
 ): [SMSActivityTheme]!

 smsActivityThemesByTypeKey(
    companyKey: String!,
    projectKey: String!,
    typeKey: String!,
    skip: Int!,
    perPage: Int!,
): [SMSActivityTheme]!
`;

export const mutations = `
    smsActivityThemesCreate(
        projectKey: String!,
        companyKey: String!,
        theme: String!,
        activityTypeKey: String!,
   ): String!

   smsActivityThemesUpdate(
        docKey: String!,
        theme: String!,
        activityTypeKey: String!,
   ): String!

   smsActivityThemesDelete(docKey: String!): String!
`;
