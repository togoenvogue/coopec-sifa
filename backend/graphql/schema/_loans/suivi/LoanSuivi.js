export const types = `
    type LoanSuivi {
        _id: ID
        _key: ID
        timeStamp: Float
        loanFileKey: LoanFile
        adminKey: User
        clientKey: ClientSIG
        officeKey: Office
        groupName: String
        lieu: String
        motif: String
        currentPretCycle: Int
        currentPretMontant: Float
        currentPretDateDecaissement: Float
        currentPretDuree: Float
        nextPretCycle: Int
        nextPretMontant: Float
        nextPretDateDecaissement: Float
        nextPretDuree: Float
        commentaireCompteRendu: String
        suiteSuivite: String
        accompagnateur: String
        dateConvocation: Float
        commentaireAutre: String
        gpsLat: Float
        gpsLong: Float
        photo: String
        photo1: String
        legende: String
        legende1: String
        fullCount: Int
    } 
`;

export const queries = `
    loanVisitesByLoanFileKey(
        loanFileKey: String!
    ): [LoanSuivi]! 
`;

export const mutations = `
    loanVisiteCreate(
        loanFileKey: String!,
        adminKey: String!,
        clientKey: String!,
        officeKey: String!,
        groupName: String!,
        lieu: String!,
        motif: String!,
        currentPretCycle: Int!,
        currentPretMontant: Float!,
        currentPretDateDecaissement: Float!,
        currentPretDuree: Float!,
        nextPretCycle: Int!,
        nextPretMontant: Float!,
        nextPretDateDecaissement: Float!,
        nextPretDuree: Float!,
        commentaireCompteRendu: String!,
        suiteSuivite: String,
        accompagnateur: String,
        dateConvocation: Float,
        commentaireAutre: String,
        gpsLat: Float!,
        gpsLong: Float!,
    ): String!

    loanVisiteUpdate(
        docKey: String!,
        lieu: String!,
        motif: String!,
        commentaireCompteRendu: String,
        suiteSuivite: String,
        accompagnateur: String,
        dateConvocation: Float!,
        commentaireAutre: String,
    ): String!

    loanVisiteDelete(docKey: String!, loanFileKey: String!): String!
`;
