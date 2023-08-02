export const types = `
    type Module {
        _id: ID
        _key: ID
        moduleName: String
        moduleDesc: String
        moduleRef: String
        companies: [Company]
        isActive: Boolean
        fullCount: Int
    }

    type ModuleRole {
        moduleKey: String
        moduleName: String
        moduleDesc: String
        moduleRef: String
        canRead: Boolean
        canWrite: Boolean
        canUpdate: Boolean
        canDelete: Boolean
        canApprove: Boolean
        canCollect: Boolean
        canComment: Boolean
        canDispatch: Boolean
        canCharge: Boolean
        canAnalyse: Boolean
        canDeliver: Boolean
        canLoad: Boolean
        canDecide: Boolean
    }
`;

export const queries = `
    modules(skip: Int!, perPage: Int!): [Module]! 
    modulesByCompanyKey(companyKey: String!): [Module]! 
`;

export const mutations = `
    moduleCreate(
        moduleName: String!,
        moduleRef: String!,
        moduleDesc: String!,
    ): Module!

    moduleUpdate(
        moduleKey: String!,
        moduleName: String!,
        moduleRef: String!,
        moduleDesc: String!,
    ): Module!

    moduleAddCompany(
        moduleKey: String!,
        companyKey: String!
    ): Module!

    moduleRemoveCompany(
        moduleKey: String!,
        companyKey: String!
    ): Module!
`;
