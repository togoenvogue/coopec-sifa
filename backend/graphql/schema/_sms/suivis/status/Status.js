export const types = `
    type SMSSuivisStatutPartenaire {
        _id: ID
        _key: ID
        timeStamp: Float
        projectKey: Project
        companyKey: Company
        status: String 
        fullCount: Int
    } 
`;

export const queries = `
    smsSuivisStatutPartenaire(
        companyKey: String!,
        projectKey: String!,
        skip: Int!,
        perPage: Int!,
    ): [SMSSuivisStatutPartenaire]! 
`;

export const mutations = `
    smsSuivisStatutPartenaireCreate(
        projectKey: String!,
        companyKey: String!,
        status: String!, 
   ): SMSSuivisStatutPartenaire!

   smsSuivisStatutPartenaireUpdate(
        docKey: String!,
        status: String!, 
   ): SMSSuivisStatutPartenaire!

   smsSuivisStatutPartenaireDelete(docKey: String!): String!
`;
