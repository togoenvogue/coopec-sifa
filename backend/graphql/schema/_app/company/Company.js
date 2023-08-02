export const types = `
    type Company {
        _id: ID
        _key: ID
        timeStamp: Float
        expiry: Float
        adminKey: User
        companyName: String
        companyEmail: String
        companyPhone: String
        website: String
        address: String
        countryFlag: String
        countryCode: Int
        isActive: Boolean
        package: String
        projectMaxCount: Int
        userMaxCount: Int
        officeMaxCount: Int
        smsSenderId: String
        smsApiKey: String
        smsUsername: String
        logo: String
        themeColor: String
        fullCount: Int
    }
`;

export const queries = `
    getCompanies: [Company]!
    
    getCompaniesByAccessLevel(
        isSuperAdmin: Boolean!,
        companyKey: String!
    ): [Company]!
`;

export const mutations = `
    companyCreate(
        expiry: Float!,
        adminKey: String!,
        companyName: String!,
        companyEmail: String!,
        companyPhone: String!,
        website: String!,
        address: String!,
        countryFlag: String!,
        countryCode: Int!,
        packag: String!,
        projectMaxCount: Int!,
        userMaxCount: Int!, 
        officeMaxCount: Int!,
        smsSenderId: String,
        smsApiKey: String,
        smsUsername: String,
        logo: String!,
        themeColor: String!,
    ): Company!

    companyUpdate(
        key: String!,
        adminKey: String!,
        companyName: String!,
        companyEmail: String!,
        companyPhone: String!,
        website: String!,
        address: String!,
        smsSenderId: String,
        smsApiKey: String,
        smsUsername: String,
        logo: String!,
        themeColor: String!,
    ): Company!
`;
