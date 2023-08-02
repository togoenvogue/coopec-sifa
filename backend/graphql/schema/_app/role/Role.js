export const types = `
    type Role {
        _id: ID
        _key: ID 
        timeStamp: Float
        companyKey: Company
        projectKey: Project
        adminKey: User
        label: String
        isActive: Boolean
        custom1: String
        custom2: String
        modules: [ModuleRole]
        fullCount: Int
    }

    type RoleRule {
        _id: ID
        _key: ID
        companyKey: Company
        projectKey: Project
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
    rolesByProject( 
        companyKey: String!,
        projectKey: String!,
        skip: Int!,
        perPage: Int!,
    ): [Role]!

    roleRulesByProject(
        companyKey: String!,
        projectKey: String!,
        status: String!
    ): [RoleRule]!
`;

export const mutations = `
    roleCreate(
        label: String!,
        adminKey: String!,
        projectKey: String!,
        companyKey: String!,
        isActive: Boolean!
        custom1: String,
        custom2: String,
    ): Role!

    roleDelete(
        projectKey: String!,
        companyKey: String!,
        roleKey: String! 
    ): Role!

    roleUpdate(
        label: String!, 
        roleKey: String!,
        adminKey: String!,
        isActive: Boolean!,
        resetModules: Boolean!,
        companyKey: String!,
        projectKey: String!,
        custom1: String,
        custom2: String
    ): Role!

    roleSetModuleSingle( 
        roleKey: String!,
        moduleKey: String!, 
        action: String!,
        trueOrFalse: Boolean!,
    ): Role! 

    roleRuleUpdate(
        key: String!,
        canRead: Boolean!,
        canWrite: Boolean!,
        canUpdate: Boolean!,
        canDelete: Boolean!,
        canApprove: Boolean!,
        canCollect: Boolean!,
        canComment: Boolean!,
        canDispatch: Boolean!,
        canCharge: Boolean!,
        canAnalyse: Boolean!,
        canDeliver: Boolean!,
        canLoad: Boolean!,
        canDecide: Boolean!,
    ): RoleRule!
`;
