export const types = `
    type Office {
        _id: ID
        _key: ID
        timeStamp: Float
        companyKey: Company
        projectKey: Project
        adminKey: User
        officeName: String
        isActive: Boolean
        plafond: Float
        externalId: String
        enableLoanSubmition: Boolean
        sigDBName: String
        sigDBUser: String
        sigDBPass: String
        sigDBPort: Int
        sigDBIp: String
        fullCount: Int
        requestSkip: Int
        requestBatch: Int
        dbtestUrl: String
    }
`;

export const queries = `
    officesByProject(
        companyKey: String!,
        projectKey: String!,
        accessLevel: Int!,
        userOfficeKey: String!,
        perPage: Int!,
        skip: Int!,
        coverage: String!,
    ): [Office]!

    officeByKey(officeKey: String!): Office!
`;

export const mutations = `
    officeCreate(
        adminKey: String!, 
        companyKey: String!, 
        projectKey: String!, 
        isActive: Boolean!, 
        officeName: String!,
        plafond: Float!,
        externalId: String!, 
        sigDBName: String!,
        sigDBUser: String!,
        sigDBPass: String!,
        sigDBPort: Int!,
        sigDBIp: String!,
        requestSkip: Int!,
        requestBatch: Int!,
        dbtestUrl: String!,
    ): String!

    officeDelete( 
        officeKey: String!, 
        projectKey: String!, 
    ): String!

    officeUpdate(
        officeKey: String!,
        isActive: Boolean!, 
        officeName: String! 
        plafond: Float!,
        externalId: String,
        sigDBName: String!,
        sigDBUser: String!,
        sigDBPass: String!,
        sigDBPort: Int!,
        sigDBIp: String!,
        requestSkip: Int!,
        requestBatch: Int!,
        dbtestUrl: String!,
    ): String!

    officeSetLoanSubmition(
        officeKey: String!,
        userKey: String!, 
        companyKey: String!,
        projectKey: String!, 
        canSubmit: Boolean!,
    ): String!
`;
