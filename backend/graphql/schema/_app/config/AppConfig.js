export const types = `
    type AppConfig {
        _id: ID
        _key: ID
        previousVersion: String
        currentVersion: String
        whatIsNew: String
        nextUpdate: String
        iosUrl: String
        androidUrl: String
        isMaintenance: Boolean
        devDevices: [String]
        windowsUrl: String
        macUrl: String
        linuxUrl: String
        apkUrl: String
        fullCount: Int
        about: String
    }
`;

export const queries = `
    getAppConfig: AppConfig!
    resetApp(company: String!): Boolean!

    resetSetLoanMontagePar: Boolean!
    resetSetClientsLoanCycle: Boolean!

    databaseSize: Float!
`;

export const mutations = `

    syncDownloadFromTheServer(
        companyKey: String!,
        projectKey: String!,
        officeKey: String!,
        userKey: String!,
        docName: String!,
        docKey: String!,
        accessLevel: Int!,
    ): [String]

    syncInitDefaultToLocal(
        companyKey: String!,
        projectKey: String!, 
        userKey: String!,
    ): [String]

    syncUploadToTheServer(
        companyKey: String!,
        projectKey: String!,
        userKey: String!,
        fileName: String!,
        accessLevel: String!,
        officeKey: String!,
    ): [String]

    syncUploadToTheServerTruncate: Boolean!
    appResetFullTest: Boolean!
    appStipJson: Boolean!

    

`;
