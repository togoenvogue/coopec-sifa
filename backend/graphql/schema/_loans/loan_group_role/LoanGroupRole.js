export const types = `
    type LoanGroupRole {
        _id: ID
        _key: ID 
        projectKey: Project
        companyKey: Company
        roleName: String
        fullCount: Int
    }
`;

export const queries = `
    loanGroupRoles(skip: Int!, perPage: Int!): [LoanGroupRole]!
`;

export const mutations = `
    loanGroupRoleCreate(
        projectKey: String!,
        companyKey: String!, 
        roleName: String!,
    ): String!

    loanGroupRoleUpdate(
        key: String!,
        roleName: String!, 
    ): String!
`;
