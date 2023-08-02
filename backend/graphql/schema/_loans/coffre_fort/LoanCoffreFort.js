export const types = `
    type LoanCoffreFort {
        _id: ID
        _key: ID
        timeStamp: Float
        dateStamp: Float
        day: Int
        month: Int
        year: Int,
        adminKey: User
        amount: Float
        companyKey: Company
        officeKey: Office
        projectKey: Project 
        fullCount: Int
    }
`;

export const queries = `
    coffreFortList(
        companyKey: String!,
        projectKey: String!,
        officeKey: String!, 
        skip: Int!,
        perPage: Int!,
    ): [LoanCoffreFort]!
`;

export const mutations = `
    coffreFortCreate(
        dateStamp: Float!,
        day: Int!,
        month: Int!,
        year: Int!,
        adminKey: String!,
        amount: Float!,
        companyKey: String!,
        officeKey: String!,
        projectKey: String!,
    ): LoanCoffreFort!

    coffreFortUpdate(
        key: String!,
        amount: Float!,
    ): LoanCoffreFort!
`;
