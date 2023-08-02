export const types = `
    type LoanSessionLevel {
        _id: ID
        _key: ID
        projectKey: Project
        companyKey: Company
        levelName: String
        levelId: String
        minAmount: Float
        maxAmount: Float
        roleKeys: [Role]
        roleNames: [String]
        isActive: Boolean
    } 
`;

export const queries = `
    sessionLevels(
        companyKey: String!,
        projectKey: String!,
        levelsIds: [String]!,
        roleKey: String!,
    ): [LoanSessionLevel]! 
`;

export const mutations = `
    sessionLevelCreate(  
        levelName: String!,
        projectKey: String!,
        companyKey: String!,
        minAmount: Float!,
        maxAmount: Float!,
        roleKeys: [String!]!,
        roleNames: [String!]!,
        isActive: Boolean!,
        levelId: String!,
    ): LoanSessionLevel! 

    sessionLevelUpdate(  
        levelKey: String!,
        levelName: String!,
        minAmount: Float!,
        maxAmount: Float!,
        roleKeys: [String!]!,
        roleNames: [String!]!,
        isActive: Boolean!,
        levelId: String!,
    ): LoanSessionLevel! 

    sessionLevelDelete(levelKey: String!): LoanSessionLevel! 
`;
