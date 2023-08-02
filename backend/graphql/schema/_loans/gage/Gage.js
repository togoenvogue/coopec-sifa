export const types = `
    type GageType {
        _id: ID
        _key: ID
        timeStamp: Float
        companyKey: String
        projectKey: String
        loanFileKey: String 
        fullName: String
        profession: String
        quartier: String
        phone: String
        documents: [String]
        garanties: [GarantieType]
        evaluations: [GageEvalType]
        signatureClient: String
        signatureAgent: String
    }
`;

export const queries = `
`;

export const mutations = `
    gageCreate(
        companyKey: String!,
        projectKey: String!,
        loanFileKey: String !,
        fullName: String!,
        profession: String!,
        quartier: String!,
        phone: String!, 
        documents: [String!]!,
        gTypes: [String]
        gDescs: [String]
        gValeursA: [String]
        gValeursB: [String]
        evalNatures: [String],
        evalDimensions: [String],
        evalReferences: [String],
        evalMarques: [String],
        autresDetails: [String],
        evalZones: [String],
        evalValeursA: [Float],
        evalValeursB: [Float],
        evalValeursC: [Float],
        evalObservations: [String],
    ): String!

    gageUpdate(
        gageKey: String!,
        fullName: String!,
        profession: String!,
        quartier: String!,
        phone: String!, 
        documents: [String!]!,
        gTypes: [String]
        gDescs: [String]
        gValeursA: [String]
        gValeursB: [String]
        evalNatures: [String],
        evalDimensions: [String],
        evalReferences: [String],
        evalMarques: [String],
        autresDetails: [String],
        evalZones: [String],
        evalValeursA: [Float],
        evalValeursB: [Float],
        evalValeursC: [Float],
        evalObservations: [String],
    ): String!

    gageDelete(gageKey: String!): String!
`;
