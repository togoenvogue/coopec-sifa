export const types = `
    type Notification {
        _id: ID
        _key: ID
        timeStamp: Float
        accessLevel: Int
        action: String
        docName: String
        docKey: String
        projectKey: String
        companyKey: String
        message: String
        fullCount: Int
    }
`;

export const queries = `
    notificationsGetAll(
        companyKey: String!,
        projectKey: String!
    ): [Notification]!
`;

export const mutations = `

`;
