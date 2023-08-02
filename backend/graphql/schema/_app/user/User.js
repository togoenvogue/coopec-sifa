export const types = `#graphql
    type User {
        _id: ID
        _key: ID
        timeStamp: Float
        username: Float
        password: String
        passwordAdmin: String
        lastLogin: Float
        authExpir: Float
        resetStamp: Float
        passwordReset: String
        passHash: String
        adminKey: User
        accessObjects: [AccessType]
        accessModuleRefs: [String]
        accessLevel: Int
        isAuth: Boolean
        token: String
        loginRef: String
        countryName: String
        countryFlag: String
        countryCode: Int
        isLocked: Boolean
        isAdmin: Boolean
        isDemo: Boolean
        isSuperAdmin: Boolean
        email: String
        firstName: String
        lastName: String
        photo: String
        signature: String
        companyKey: Company
        projectKey: Project
        officeKey: Office
        roleKey: Role
        messageInbox: [String]
        fullCount: Int
        legende: String
        userException1: Boolean
        userException2: Boolean
        userException3: Boolean
        externalId: [String]
        creditTypes: [String]
        isWebmaster: Boolean
        accessProductKeys: [LoanProduct]
        accessOfficeKeys: [Office] 
        accessComiteLevelKeys: [LoanSessionLevel] 
        licenceExpirDate: Float
        licenceRef: String
    }
`;

export const queries = `
    auken(password: String): String!
    users: [User]!
    userByUserKey(userKey: ID!): User!
    userByUsername(username: Float!, companyKey: String!): User!
    
    userLogin(
        username: Float!, 
        password: String!, 
        loginRef: String!,
    ): User!

    userLogout(token: String!, userKey: String!): User!

    adminUsers(
        isSuperAdmin: Boolean!, 
        userKey: String!,
        skip: Int!,
        perPage: Int!,
    ): [User]!

    usersSearch(
        companyKey: String!, 
        projectKey: String!, 
        toSearch: String!, 
        skip: Int!, 
        perPage: Int!,
    ): [User]!

    userExists(username: Float!): Boolean!

    usersByCompany(
        projectKey: String!, 
        companyKey: String!,
        adminKey: String!,
        skip: Int!,
        perPage: Int!,
        ): [User]!

    usersByOffice(
        officeKey: String!, 
        projectKey: String!,
        userKey: String!,
        accessLevel: Int!,
        skip: Int!,
        perPage: Int!,
    ): [User]!

    usersByRole(
        roleKey: String!, 
        projectKey: String!,
        skip: Int!,
        perPage: Int!,
    ): [User]!

    usersByOfficeByLevel(
        officeKey: String!, 
        projectKey: String!,
        userKey: String!,
        minimumLevel: Int!,
        skip: Int!,
        perPage: Int!,
    ): [User]!

    usersByOfficeByLevelV2(
        officeKey: String!, 
        projectKey: String!,
        level: Int!,
        skip: Int!,
        perPage: Int!,
    ): [User]!

    usersByOfficeByRole(
        projectKey: String!, 
        companyKey: String!,
        officeKey: String!,
        roleKey: String!,
        skip: Int!,
        perPage: Int!,
    ): [User]!
`;

export const mutations = `
    userCreate(
        email: String,
        userPhoneNumber: Float!,
        password: String!,
        firstName: String!,
        lastName: String!, 
        adminKey: String!,
        accessLevel: Int!,
        isAdmin: Boolean!,
        companyKey: String!,
        projectKey: String!,
        roleKey: String!,
        officeKey: String!,
    ): String!
    
    userUpdate( 
        userKey: String!,
        email: String!,
        firstName: String!,
        lastName: String!,   
    ): String!

    userUpdateAccessLevel(
        userKey: String!,
        accessLevel: Int!,
        companyKey: String!,
        projectKey: String!,
        officeKey: String!,
        roleKey: String!,
    ): User!

    userManageAccountStatus(
        adminKey: String!, 
        userKey: String!,
        projectKey: String!,
        action: String!,
    ): String!
    
    userChangePassword(
        userKey: String!, 
        password: String!, 
        newPassword: String!,
        passHash: String!,
    ): String!

    userPasswordHardReset(
        userKey: String!, 
        newPassword: String!,
        firstName: String!,
        lastName: String!,
        passHash: String!,
        changedByKey: String!,
        changedByName: String!,
    ): Boolean!

    userRequestNewPassword(username: Float!, email: String!): User!

    userSetAccess(
        userKey: String!, 
        companyKey: String!, 
        officeKey: String!, 
        roleKey: String!, 
        projectKey: String!,
        externalId: [String],
        accessProductKeys: [String]!,
        accessOfficeKeys: [String]!,
        creditTypes: [String]!,
        accessComiteLevelKeys: [String]!,
        revoquer: Boolean!,
        accessLevel: Int!,
    ): User!

    userUpdateInboxIds(
        userKey: String!, 
        readIds: [Float]!,
    ) : User!

    userInit(
        officeName: String!,
        projectName: String!,
        companyKey: String!,
        adminKey: String!,
        address: String!,
        phone: String!,
    ): Boolean!

    userSetException1( 
        userException1: Boolean!
        userKey: String!, 
    ): Boolean!

    userSetException2( 
        userException2: Boolean!
        userKey: String!, 
    ): Boolean!

    userSetException3(
        userException3: Boolean!
        userKey: String!, 
    ): Boolean!

    userResetAccount( 
        userKey: String!,
        companyKey: String!,
        projectKey: String!, 
    ): Boolean!

    userAutoResetData(
        userKey: String!,
        lastName: String!,
        firstName: String!,
    ): Boolean!

    userRefreshToken(userKey: String!, deviceId: String!): String! 

    userSetLicence(licenceRef: String!, userKey: String!): String!
`;
