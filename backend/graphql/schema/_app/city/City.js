export const types = `
    type City {
        _id: ID
        _key: ID
        cityName: String 
        countryKey: Country
        regionKey: LocationRegion
        prefectureKey: LocationPrefecture
        cantonKey: LocationCanton
        fullCount: Int
    }

    type LocationRegion {
        _id: ID
        _key: ID
        region: String
        countryKey: Country
        fullCount: Int
    }

    type LocationPrefecture {
        _id: ID
        _key: ID
        prefecture: String
        regionKey: LocationRegion
        fullCount: Int
    }

    type LocationCanton {
        _id: ID
        _key: ID
        canton: String
        prefectureKey: LocationPrefecture
        fullCount: Int
    }
`;

export const queries = `
    getCities(cantonKey: String!, perPage: Int!, skip: Int!): [City]!
    getRegions(countryKey: String!, perPage: Int!, skip: Int!): [LocationRegion]!
    getPrefectures(regionKey: String!, perPage: Int!, skip: Int!): [LocationPrefecture]!
    getCantons(prefectureKey: String!, perPage: Int!, skip: Int!): [LocationCanton]!
`;

export const mutations = `
    cityCreate(
        cityName: String!
        countryKey: String!,
        regionKey: String!,
        prefectureKey: String!,
        cantonKey: String!,
    ): String!

    cityUpdate(
        cityKey: String!,
        cityName: String! 
        regionKey: String!,
        prefectureKey: String!,
        cantonKey: String!,
        countryKey: String!,
    ): String!
`;
