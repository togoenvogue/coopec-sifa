export const types = `
    type LoanProductEnergie {
        _id: ID
        _key: ID 
        productName: String
        projectKey: String
        companyKey: String
        price: Float
        fullCount: Int
    }
`;

export const queries = `
    loanProductsEnergieAll(
        companyKey: String!
    ): [LoanProductEnergie]!
`;

export const mutations = `
    loanProductEnergieCreate(
        productName: String!,
        projectKey: String!,
        companyKey: String!,
        price: Float!,
    ) : LoanProductEnergie!

    loanProductEnergieUpdate(
        docKey: String!, 
        productName: String!,
        price: Float!,
    ) : LoanProductEnergie!

    loanProductEnergieDelete(docKey: String!) : LoanProductEnergie!
`;
