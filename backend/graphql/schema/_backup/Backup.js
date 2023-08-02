export const types = `
    type BackupType {
        _id: ID
        _key: ID
        timeStamp: Float
        link: String
        description: String
        type: String
        fullCount: Int
    }
`;

export const queries = `
    getBackupLinks(
        skip: Int!,
        perPage: Int!,
        accessLevel: Int!,
        isSuperAdmin: Boolean!,
    ): [BackupType]!
`;

export const mutations = `

`;
