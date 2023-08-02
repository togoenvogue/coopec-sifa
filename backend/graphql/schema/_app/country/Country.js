export const types = `
    type Country {
        _id: ID
        _key: ID
        countryCode: Int
        countryFlag: String
        countryName: String
        isActive: Boolean
        fullCount: Int
    }`;

export const queries = `
    getCountries: [Country]! 
`;

export const mutations = `
    countryCreate(
        countryName: String!,
        countryFlag:  String!,
        countryCode: Int!,
        isActive: Boolean!,
    ): Country!

    countryUpdate(
        countryKey: String!
        countryName: String!,
        countryFlag:  String!,
        countryCode: Int!,
        isActive: Boolean!,
    ): Country!
`;
