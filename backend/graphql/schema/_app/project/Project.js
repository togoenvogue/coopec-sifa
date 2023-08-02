export const types = `
    type Project {
        _id: ID
        _key: ID
        timeStamp: Float
        projectType: String
        adminKey: User
        companyKey: Company
        projectName: String
        isActive: Boolean
        fullCount: Int
        appId: String
        appLabel: String
        appLogo: String
        appName: String
        appSenderId: String
        appThemeColor: String
        appWebsite: String
        appCustom1: String
        appCustom2: String
        appCustom3: String
        appCustom4: String
        appCustom5: String
        maxOffice: Int
        loanQuestionnaireKey: String
        perfectWebApi: String
        platforms: [ProjectPlaforms]
    }

    type ProjectPlaforms {
        platformName: String
        platformDesc: String
    }
`;

export const queries = `
    projects(
        adminKey: String!,
        companyKey: String!,
        isSuperAdmin: Boolean!,
    ): [Project]!

    projectsByCompanyKey(companyKey: String!): [Project]!

    projectByKey(projectKey: String!): Project!
`;

export const mutations = `
    projectCreate(
        adminKey: String!, 
        companyKey: String!, 
        projectType: String!,
        projectName: String!,
        isActive: Boolean!
        appId: String!,
        appLabel: String!,
        appLogo: String!,
        appName: String!,
        appSenderId: String!,
        appThemeColor: String!,
        appWebsite: String!,
        appCustom1: String,
        appCustom2: String,
        appCustom3: String,
        appCustom4: String,
        appCustom5: String,
        maxOffice: Int!,
        loanQuestionnaireKey: String
    ): Project!

    projectUpdate(
        adminKey: String!, 
        companyKey: String!, 
        projectType: String!,
        projectName: String!, 
        projectKey: String!, 
        isActive: Boolean!,
        appId: String!,
        appLabel: String!,
        appLogo: String!,
        appName: String!,
        appSenderId: String!,
        appThemeColor: String!,
        appWebsite: String!,
        appCustom1: String,
        appCustom2: String,
        appCustom3: String,
        appCustom4: String,
        appCustom5: String,
        maxOffice: Int!,
        loanQuestionnaireKey: String
    ): Project!
`;
