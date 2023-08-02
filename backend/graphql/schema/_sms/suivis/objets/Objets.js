export const types = `
    type SMSSuivisObjet {
        _id: ID
        _key: ID
        timeStamp: Float
        projectKey: Project
        companyKey: Company
        objet: String 
        fullCount: Int
    } 
`;

export const queries = `
    smsSuivisObjets(
        companyKey: String!,
        projectKey: String!,
        skip: Int!,
        perPage: Int!,
    ): [SMSSuivisObjet]! 
`;

export const mutations = `
    smsSuivisObjetsCreate(
        projectKey: String!,
        companyKey: String!,
        objet: String!, 
   ): String!

   smsSuivisObjetsUpdate(
        docKey: String!,
        objet: String!, 
   ): String!

   smsSuivisObjetsDelete(docKey: String!): String!
`;
