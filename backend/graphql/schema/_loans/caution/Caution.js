export const types = `
    type CautionType {
        _id: ID
        _key: ID
        timeStamp: Float
        companyKey: String
        projectKey: String
        loanFileKey: String 
        fullName: String
        naissanceLieu: String
        nationalite: String
        profession: String
        employeur: String
        renvenuNet: Float
        revenuAutres: Float
        revenuAutresProvenance: String
        adressePerso: String
        adresseWork: String
        phonePerso: String
        phoneWork: String
        pieceNumero: String
        pieceLocation: String
        membreImf: String
        numeroCompteImf: String
        naissanceDate: Float 
        pieceType: String
        pieceDateDebut: Float
        pieceDateFin: Float
        signature: String
        bonPourCaution: String
        filiation: String
        photo: String
        photo1: String
        photo2: String
        legende: String
        legende1: String
        legende2: String
    }
`;

export const queries = `

`;

export const mutations = `
    cautionCreate(
        loanFileKey: String!,
        companyKey: String!,
        projectKey: String!,
        fullName: String!,
        naissanceLieu: String!,
        nationalite: String!,
        profession: String!,
        employeur: String!,
        renvenuNet: Float!,
        revenuAutres: Float,
        revenuAutresProvenance: String,
        adressePerso: String!,
        adresseWork: String,
        phonePerso: String!,
        phoneWork: String,
        pieceNumero: String!,
        pieceLocation: String!,
        membreImf: String!,
        numeroCompteImf: String,
        filiation: String!,
        naissanceDate: Float!, 
        pieceType: String!,
        pieceDateDebut: Float!,
        pieceDateFin: Float!,
    ): String!


    cautionUpdate(
        cautionKey: String!,
        fullName: String!,
        naissanceLieu: String!,
        nationalite: String!,
        profession: String!,
        employeur: String!,
        renvenuNet: Float!,
        revenuAutres: Float,
        revenuAutresProvenance: String,
        adressePerso: String!,
        adresseWork: String,
        phonePerso: String!,
        phoneWork: String,
        pieceNumero: String!,
        pieceLocation: String!,
        membreImf: String!,
        numeroCompteImf: String,
        filiation: String!,
        naissanceDate: Float!, 
        pieceType: String!,
        pieceDateDebut: Float!,
        pieceDateFin: Float!,
    ): String!

    cautionDelete(cautionKey: String!): String!
`;
