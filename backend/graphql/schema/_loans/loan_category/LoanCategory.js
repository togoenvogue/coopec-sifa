export const types = `
    type LoanCategory {
        _id: ID
        _key: ID
        timeStamp: Float 
        projectKey: Project
        companyKey: Company
        categoryDescription: String
        categoryName: String
        fullCount: Int
    }
`;

export const queries = `
    loanCategories(skip: Int!, perPage: Int!): [LoanCategory]!
`;

export const mutations = `
    loanCategoryCreate(
        projectKey: String!,
        companyKey: String!,
        categoryDescription: String!,
        categoryName: String!,
    ): String!

    loanCategoryUpdate(
        key: String!,
        categoryDescription: String!,
        categoryName: String!,
    ): String!
`;
