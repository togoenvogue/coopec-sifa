export const types = `
    type SMSQuestionnaireStatsSimpleCyclesValues {
        cycle: Int
        total: Float
        quota: Float
        percent: Float
    }
    type SMSQuestionnaireStatsSimple {
        optionValue: String
        cycles: [SMSQuestionnaireStatsSimpleCyclesValues]
    }  
    
    input SMSQuestionnaireStatsComplexInput {
        officeKeys: [String]
    }

    type SMSQuestionnaireStatsComplexValues {
        officeName: String
        coverage: String
        cycle: Int
        total: Int
        quota: Float
        percent: Float
    } 
    type SMSQuestionnaireStatsComplex {
        optionValue: String
        jeux: [SMSQuestionnaireStatsComplexValues]
    } 

    type SMSQuestionnaireStatsClientValues {
        codeSig: String
        fullName: String
        cycle: Int
        total: Float
        quota: Float
        percent: Float
        date: Float
    }
    type SMSQuestionnaireStatsClient {
        optionValue: String 
        cycles: [SMSQuestionnaireStatsClientValues]
    }

    type SMSQuestionnaireGroupCheck {
        cycles: [Int]
        clientKeysATotal: Int
        clientKeysBTotal: Int
        clientKeysCTotal: Int
        clientKeysDTotal: Int
        clientKeysETotal: Int
        totalLast: Int
    }

    type SMSQuestionnaireStatsGroupCycleValues {
        cycle: Int
        total: Float
        quota: Float
        percent: Float
    }
    type SMSQuestionnaireStatsGroup {
        optionValue: String
        cycles: [SMSQuestionnaireStatsGroupCycleValues]
    }  

    
`;

export const queries = `
    statsByOptionKeySimple(
        blockKey: String!,
        companyKey: String!,
        officeKey: String,
        projectKey: String!,
        optionKey: String!,
        cycleFrom: Int!,
        cycleTo: Int!,
        dateFrom: Float!,
        dateTo: Float!,
        coverage: String!,
    ): [SMSQuestionnaireStatsSimple]!

    statsByOptionKeyComplex(
        blockKey: String!,
        companyKey: String!, 
        projectKey: String!, 
        coverage: String!,
        optionKey: String!,
        dateFrom: Float!,
        dateTo: Float!,
        cycle: Int,
        officeKeys: [String]!,
        officeNames: [String]!,
    ): [SMSQuestionnaireStatsComplex]!


    statsByOptionKeyClient(
        blockKey: String!,
        companyKey: String!, 
        projectKey: String!, 
        optionKey: String!,
        codeSig: String!,
        cycleFrom: Int!,
        cycleTo: Int!,
    ): [SMSQuestionnaireStatsClient]!

    statsGroupCheck(
        dateFrom: Float!,
        dateTo: Float!,
        companyKey: String!, 
        projectKey: String!, 
        officeKey: String!,
        coverage: String!,  
        cycles: [Int]!,
    ): SMSQuestionnaireGroupCheck!

    statsByOptionKeyGroup(
        blockKey: String!,
        companyKey: String!,
        officeKey: String,
        projectKey: String!,
        optionKey: String!,
        cycles: [Int]!, 
        dateFrom: Float!,
        dateTo: Float!,
        coverage: String!,
    ): [SMSQuestionnaireStatsGroup]!

    
`;

export const mutations = `
     
`;
