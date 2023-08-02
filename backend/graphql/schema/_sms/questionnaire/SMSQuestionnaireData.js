export const types = `
    type SMSQuestionnaireDataObject {
        optionKey: String
        blockKey: String
        question: String
        optionValues: [String]!
    }

    type SMSQuestionnaireData {
        _id: ID
        _key: ID 
        timeStamp: Float
        dataStamp: Float
        geoLat: Float
        geoLong: Float
        projectKey: Project
        companyKey: Company
        officeKey: Office
        userKey: User
        userFullName: String
        userOfficeName: String
        userUsername: String
        clientKey: ClientSIG
        participant: String
        questionnaireKey: SMSQuestionnaire
        loanCycle: Float
        loanFileKey: LoanFile
        optionObjects: [SMSQuestionnaireDataObject]
        status: String
        score: Int
        initFrom: String
        fullCount: Int
    } 
`;

export const queries = `
    questionnaireDataByLoanFileKey(loanFileKey: String!): SMSQuestionnaireData!
    
    questionnairesDataByClientKey(
        clientKey: String!,
        projectKey: String!,
        companyKey: String!,
        skip: Int!,
        perPage: Int!,
    ): [SMSQuestionnaireData]! 

    questionnairesDataByQuestionnaireKey(
        questionnaireKey: String!,
        projectKey: String!,
        companyKey: String!,
        officeKey: String!,
        userKey: String!,
        coverage: String!,
        dateFrom: Float!,
        dateTo: Float!,
        skip: Int!,
        perPage: Int!,
    ): [SMSQuestionnaireData]!

    smsQuestionnaireGetPrevDataDraft(
        clientKey: String!,
    ): SMSQuestionnaireData

`;

export const mutations = `
    questionnaireDataCreate(
        dataStamp: Float!,
        projectKey: String!,
        companyKey: String!,
        officeKey: String!,
        userKey: String,
        status: String!,
        clientKey: String,
        participant: String!
        questionnaireKey: String!,
        loanCycle: Int,
        loanFileKey: String, 
        optionKeys: [String],
        optionValues: [[String]],
        blocKeys: [String]!,
        questions: [String]!,
        score: Int,
        geoLat: Float!,
        geoLong: Float!,
   ): SMSQuestionnaireData!

   smsQuestionnaireDataDelete(vulKey: String!): String!
`;
