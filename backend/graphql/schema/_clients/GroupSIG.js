export const types = `
    type GroupSIG {
        _id: ID
        _key: ID
        userKey: User
        codeAnimateur: String
        codeAgence: String
        groupName: String
        groupCode: String
        internalId: Int
        groupCount: Int
        fullCount: Int
        timeStamp: Float
        companyKey: Company
        projectKey: Project
        officeKey: Office
        isFromTheSig: Boolean
        soldeEpargne: Float
        soldeDate: Float
        prevSigLoans: [SigLoan]

    }
`;

export const queries = `
    groupSIGList(
        companyKey: String!,
        projectKey: String!, 
        officeKey: String!, 
        userKey: String!,
        coverage: String!,
        skip: Int!,
        perPage: Int!,
    ): [GroupSIG]!

    groupSIGSearch(
        companyKey: String!,
        projectKey: String!, 
        searchString: String!, 
    ): [GroupSIG]!
`;

export const mutations = `
    importGroupByCodeSig( 
        companyKey: String!,
        projectKey: String!,
        officeKey: String!,
        codeSig: String,
        userKey: String!, 
    ): String!

    sigMuterClientOrGroup(
        officeKey: String!,
        codeSig: String!,
        userKey: String!,
        clientOrGroup: String!,
    ): String!

    sigChangeOfficeClientOrGroup(
        officeKey: String!,
        docKey: String!, 
        clientOrGroup: String!,
    ): String!

    groupCreate(
        groupName: String!, 
        companyKey: String!,
        projectKey: String!,
        officeKey: String!,
        codeAgence: String!,
        codeAnimateur: String!,
        userKey: String!, 
    ): String!

    groupDelete(groupKey: String!, groupRef: String!, userKey: String!): String!

    perfectRequestGroupsByUserCode(userCode: [String]!): [String]!
`;
