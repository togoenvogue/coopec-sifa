export const types = `
    type LoanAvis {
        _id: ID
        _key: ID
        timeStamp: Float
        userKey: User
        message: String
        loanFileKey: String
        nature: String
        fullCount: Int
    }
`;

export const queries = `

`;

export const mutations = `
    loanAvisCreate(
        loanFileKey: String!,
        message: String!,
        userKey: String!,
        nature: String!
    ): String!
`;
