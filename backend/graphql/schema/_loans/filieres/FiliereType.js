export const types = `
    type FiliereType {
        _id: ID
        _key: ID 
        timeStamp: Float
        companyKey: Company
        projectKey: Project
        filiereName: String
        fullCount: Int
    }
`;

export const queries = `
    loanFilieres(
        companyKey: String!,
        projectKey: String!,
        skip: Int!,
        perPage: Int!,
    ): [FiliereType]!
`;

export const mutations = `
    loanFiliereCreate(
        companyKey: String!,
        projectKey: String!,
        filiereName: String!,
    ): String!

    loanFiliereUpdate(
        docKey: String!,
        filiereName: String!,
    ): String!

    filiereDelete(docKey: String!): String!
`;
