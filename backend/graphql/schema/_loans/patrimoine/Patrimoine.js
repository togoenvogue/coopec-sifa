export const types = `
    type PatrimoineType {
        _id: ID
        _key: ID
        timeStamp: Float
        loanFileKey: String
        type: String
        category: String
        description: String
        montant: Float
        fullCount: Int
    }
`;

export const queries = `

`;

export const mutations = `
    loanPatrimoineCreate(
        loanFileKey: String!, 
        type: String!, 
        category: [String]!,
        description: [String]!,
        montant: [Float]!,
    ): String!

    loanPatrimoineUpdate(
        docKey: String!, 
        type: String!, 
        category: String!,
        description: String!,
        montant: Float!,
    ): String!

    loanPatrimoineDelete(docKey: String!): String!
`;
