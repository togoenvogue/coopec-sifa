export const types = `
    type ActivityType {
        _id: ID
        _key: ID
        timeStamp: Float
        loanFileKey: LoanFile
        activityName: String
        stage: String
        age: String
        frequency: String
        periode: [String]
        commerceType: String
        commerceMode: String
        commerceEmplacement: String
        commerceEmplacementType: String
        commerceAddress: String
        moyenDeTransport: String
        autresInfos: String
        materielsActuels: String
        materielsBesoin: String
        stockActuel: String
        stockACompleter: String
        approLieu: String
        approTransport: String
        reglementFrequence: String
        workingDays: [String]
        saisonning: [String] 
        commerceEmplacementAutre: String
        moyenDeTransportAutre: String
        approTransportAutre: String
        reglementFrequenceAutre: String
        activityDesc1: String
        activityDesc2: String
        activityDesc3: String
        activityDesc4: String
        exploitationDateStart: Float
        exploitationDateEnd: Float
        fullCount: Int
    } 
`;

export const queries = `
    loanActivitiesByFileKey(
        loanFileKey: String!
    ): [ActivityType]!
`;

export const mutations = `
    loanActivityCreate(  
        loanFileKey: String!,
        activityName: String!,
        stage: String!,
        age: String!,
        frequency: String!,
        periode: [String]!,
        exploitationDateStart: Float!,
        exploitationDateEnd: Float!,
        commerceType: String!,
        commerceMode: String!,
        commerceEmplacement: String!,
        commerceEmplacementType: String!,
        commerceAddress: String!,
        moyenDeTransport: String,
        autresInfos: String,
        materielsActuels: String,
        materielsBesoin: String,
        stockActuel: String,
        stockACompleter: String,
        approLieu: String,
        approTransport: String,
        reglementFrequence: String,
        workingDays: [String]!,
        saisonning: [String]!,
        commerceEmplacementAutre: String,
        moyenDeTransportAutre: String,
        approTransportAutre: String,
        reglementFrequenceAutre: String,
        activityDesc1: String,
        activityDesc2: String,
        activityDesc3: String,
        activityDesc4: String, 
    ): String!

    loanActivityUpdate(
        activityKey: String!,
        activityName: String!,
        stage: String!,
        age: String!,
        frequency: String!,
        periode: [String]!,
        exploitationDateStart: Float!,
        exploitationDateEnd: Float!,
        commerceType: String!,
        commerceMode: String!,
        commerceEmplacement: String!,
        commerceEmplacementType: String!,
        commerceAddress: String!,
        moyenDeTransport: String,
        autresInfos: String,
        materielsActuels: String,
        materielsBesoin: String,
        stockActuel: String,
        stockACompleter: String,
        approLieu: String,
        approTransport: String,
        reglementFrequence: String,
        workingDays: [String]!,
        saisonning: [String]!,
        commerceEmplacementAutre: String,
        moyenDeTransportAutre: String,
        approTransportAutre: String,
        reglementFrequenceAutre: String,
        activityDesc1: String,
        activityDesc2: String,
        activityDesc3: String,
        activityDesc4: String, 
    ): String!

    loanActivityEditDesc(
        activityKey: String!,
        activityDesc1: String!,
        activityDesc2: String!,
        activityDesc3,: String!
        activityDesc4: String!,
    ): String!

    loanActivityDelete(
        activityKey: String!,
        loanFileKey: String!,
    ): String!
`;
