export const types = `
    type Inbox {
        _id: ID
        _key: ID
        timeStamp: Float
        companyKey: Company
        projectKey: Project
        adminKey: User
        title: String
        message: String
        status: String
        toOfficeKeys: [Office]
        readers: [InboxReading]
        dest: String
        type: String
        fullCount: Int
        photo1: String
        photo2: String
        photo3: String
        photo4: String
        photo: String
        legende1: String
        legende2: String
        legende3: String
        legende4: String
        legende: String
        pdf: String
    }

    type InboxReading {
        userKey: String
        date: String
        userFullName: String
    }
`;

export const queries = `
    inboxByCompanyKey(
        companyKey: String!,
        projectKey: String!,
        officeKey: String!,
        dest: String!,
        skip: Int!,
        perPage: Int!
    ): [Inbox]! 
`;

export const mutations = `
    inboxCreate(
        companyKey: String!,
        projectKey: String!,
        adminKey: String!,
        title: String!,
        message: String!,
        status: String!,
        toOfficeKeys: [String]!
        dest: String!,
        type: String!,
    ): Inbox!

    inboxMarkRead( 
        userKey: String!,
        messageKey: String!,
        userFullName: String!,
        date: String!,
    ): Inbox!
`;
