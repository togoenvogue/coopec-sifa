export const types = `
    type SMSSocialPartner {
        _id: ID
        _key: ID
        timeStamp: Float
        projectKey: Project
        companyKey: Company
        partnerName: String
        activitySector: String
        activityDetails: String
        address: String
        countryKey: Country
        cityKey: City
        partnerPhone: String
        partnerMail: String
        partnerWebsite: String
        contactPerson1Name: String
        contactPerson1Fonction: String
        contactPerson1Phone: String
        contactPerson1Mail: String
        contactPerson2Name: String
        contactPerson2Fonction: String
        contactPerson2Phone: String
        contactPerson2Mail: String
        partnershipNature: String
        concernedOffices: [Office]
        fullCount: Int
    } 
`;

export const queries = `
    smsSocialPartners(
        companyKey: String!,
        projectKey: String!,
        skip: Int!,
        perPage: Int!,
 ): [SMSSocialPartner]!
`;

export const mutations = `
    smsSocialPartnersCreate(
        projectKey: String!,
        companyKey: String!,
        partnerName: String!,
        partnershipNature: String!,
        concernedOffices: [String!]!
        activitySector: String!,
        activityDetails: String!,
        address: String!,
        countryKey: String!,
        cityKey: String!,
        partnerPhone: String,
        partnerMail: String,
        partnerWebsite: String,
        contactPerson1Name: String!,
        contactPerson1Fonction: String!,
        contactPerson1Phone: String!,
        contactPerson1Mail: String,
        contactPerson2Name: String,
        contactPerson2Fonction: String,
        contactPerson2Phone: String,
        contactPerson2Mail: String, 
   ): String!

   smsSocialPartnersUpdate(
        docKey: String!,
        partnerName: String!,
        partnershipNature: String!,
        concernedOffices: [String!]!
        activitySector: String!,
        activityDetails: String!,
        address: String!,
        countryKey: String!,
        cityKey: String!,
        partnerPhone: String,
        partnerMail: String,
        partnerWebsite: String,
        contactPerson1Name: String!,
        contactPerson1Fonction: String!,
        contactPerson1Phone: String!,
        contactPerson1Mail: String,
        contactPerson2Name: String,
        contactPerson2Fonction: String,
        contactPerson2Phone: String,
        contactPerson2Mail: String, 
   ): String!

   smsSocialPartnersDelete(docKey: String!): String!
`;
