export const types = `
    type LoanSession {
        _id: ID
        _key: ID
        timeStamp: Float
        createdBy: User
        sessionStamp: Float
        timeSpan: String
        projectKey: Project
        companyKey: Company
        officeKey: Office
        sessionLevelKey: LoanSessionLevel
        sessionLabel: String
        participantKeys: [User]
        joinedUsers: [User]
        fileKeys: [LoanFile]
        currentFileKey: LoanFile
        status: String
        fullCount: Int
        totalMontantAccorde: Float
        totalMontantAnaylse: Float
        totalMontantRejete: Float
        totalMontantAjourne: Float
        sessionRoomUUID: String
    }

    type LoanSessionDecision {
        _key: ID
        timeStamp: Float
        userKey: String
        userFullName: String
        isFavorable: Boolean
        note: String
        signature: String
        roleName: String
        sessionKey: String
        comiteLevelId: String
    }

    type LoanSessionFondsPayment {
        date: String
        amount: Float
        coffreAmount: Float
    }

    type LoanSessionFonds {
        payments: [LoanSessionFondsPayment]
        total: Float
        sessionLabel: String
        sessionDate: String
        agence: String
    }
`;

export const queries = `
    loanSessionList(
        companyKey: String!,
        projectKey: String!,
        officeKey: String,
        userKey: String!,
        accessLevel: Int!,
        skip: Int!,
        perPage: Int!,
        coverage: String!,
        dateFrom: Float!,
        dateTo: Float!,
        status: String!, 
    ): [LoanSession]!

    loanSessionByKey(sessionKey: String!): LoanSession!

    loanSessionPvDownload(
        sessionKey: String!,
        companyKey: String!, 
        projectKey: String!, 
    ): String! 
 
    loanSessionFondsDownload(
        sessionKey: String!,
        companyKey: String!, 
        projectKey: String!,
        officeKey: String!,
        type: String!,
    ): String!

    loanSessionFondsByType(
        sessionKey: String!,
        companyKey: String!, 
        projectKey: String!,
        officeKey: String!,
        type: String!,
    ): LoanSessionFonds!

    loanSessionDownloadZip(
        sessionKey: String!, 
        sessionName: String!, 
        officeName: String!,
    ): String!
`;

export const mutations = `
    loanSessionCreate(
        createdBy: String!,
        sessionStamp: Float!,
        timeSpan: String!, 
        projectKey: String!,
        companyKey: String!,
        officeKey: String!,
        sessionLevelKey: String!,
        sessionLabel: String!,
        participantKeys: [String!]!
    ): LoanSession!

    loanSessionUpdate(
        sessionKey: String!,
        sessionStamp: Float!,
        timeSpan: String!, 
        officeKey: String!,
        sessionLevelKey: String!,
        sessionLabel: String!,
        participantKeys: [String!]!
    ): LoanSession!

    loanSessionClose(sessionKey: String!): String!
    loanSessionDelete(sessionKey: String!): String!

    loanSessionAddFile(
        sessionKey: String!,
        loanFileKey: String!,
        companyKey: String!,
        projectKey: String!,
        adminKey: String!,
    ): LoanSession!

    loanSessionJoin(
        companyKey: String!,
        projectKey: String!,
        userKey: String!,
        userFullName: String!,
        sessionKey: String!,
        loanFileKey: String!,
        message: String!,
        action: String!,
    ) : LoanSession!

    loanSessionOpen(
        adminKey: String!, 
        sessionKey: String!
    ) : String!

    loanSessionUsersOnline(
        sessionKey: String!,
        userFullName: String!,
        action: String!,
    ): [String]!
`;
