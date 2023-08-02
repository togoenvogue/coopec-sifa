export const types = `
    type LoanSessionChat {
        _id: ID
        _key: ID
        timeStamp: Float
        companyKey: String
        projectKey: String
        userKey: String
        userFullName: String
        sessionKey: String
        loanFileKey: String
        message: String
        action: String 
        messageType: String
        audioFile: String
        childUser: String
        childStamp: Float
        childMessageType: String
        childMessage: String
        childAudioFile: String
        fullCount: Int 
    }
`;

export const queries = `
    loanSessionChatBySessionKey(
        companyKey: String!,
        projectKey: String!,
        sessionKey: String!,
    ): [LoanSessionChat]!
`;

export const mutations = `
    loanSessionChatCreate(
        companyKey: String!,
        projectKey: String!,
        userKey: String!,
        userFullName: String!,
        sessionKey: String!,
        loanFileKey: String!,
        message: String!,
        action: String!,
        messageType: String,
        audioFile: String,
        childUser: String,
        childStamp: Float,
        childMessageType: String,
        childMessage: String,
        childAudioFile: String,
    ): LoanSessionChat!
`;
