export const types = `
    type SMSFormationsTheme {
        _id: ID
        _key: ID
        timeStamp: Float
        projectKey: Project
        companyKey: Company
        fullCount: Int
        offices: [Office]
        periode: String
        dateFrom: Float
        dateTo: Float
        thematiqueKey: SMSActivityTheme
        reference: String
        titre: String
        objectifs: String
        status: String
        comment: String
        isActive: Boolean
    } 
`;

export const queries = `
    smsFormationsThemes(
        companyKey: String!,
        projectKey: String!,
        offices: [String]!,
        dateFrom: Float!,
        dateTo: Float!,
        skip: Int!,
        perPage: Int!,
 ): [SMSFormationsTheme]!
`;

export const mutations = `
    smsFormationsThemesCreate(
        projectKey: String!,
        companyKey: String!,
        offices: [String]!,
        periode: String!,
        dateFrom: Float!,
        dateTo: Float!,
        thematiqueKey: String!,
        reference: String!,
        titre: String!,
        objectifs: String!,
        status: String!,
        comment: String,
        isActive: Boolean!,
   ): String!

   smsFormationsThemesUpdate(
        docKey: String!,
        offices: [String]!,
        periode: String!,
        dateFrom: Float!,
        dateTo: Float!,
        thematiqueKey: String!,
        reference: String!,
        titre: String!,
        objectifs: String!,
        status: String!,
        comment: String,
        isActive: Boolean!,
   ): String!

   smsFormationsThemesDelete(docKey: String!): String!
`;
