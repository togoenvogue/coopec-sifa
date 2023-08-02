export const types = `
    type DeviceIdType {
        _id: ID
        _key: ID
        timeStamp: Float
        deviceId: String
        fullName: String
        deviceType: String
        authBy: User
        isActive: Boolean
        lastConnectStamp: Float
        fullCount: Int
        companyKey: Company
        projectKey: Project
    }`;

export const queries = `
    devices(
        projectKey: String!,
        companyKey: String!,
        fullName: String,
        skip: Int!,
        perPage: Int!,
    ): [DeviceIdType]! 
`;

export const mutations = `
    deviceIdCreate(
        deviceId: String!,
        deviceType: String!,
        fullName: String!,
        authBy: String!,
        isActive: Boolean!,
        companyKey: String!,
        projectKey: String!,
    ): String!

    deviceIdUpdate(
        key: String!,
        deviceId: String!,
        deviceType: String!,
        fullName: String!,
        authBy: String!,
        isActive: Boolean!,
    ): String!
`;
