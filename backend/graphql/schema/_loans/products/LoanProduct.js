export const types = `
    type LoanProduct {
        _id: ID
        _key: ID
        timeStamp: Float 
        projectKey: Project
        companyKey: Company
        loanCategoryKey: LoanCategory
        isActive: Boolean
        fullCount: Int
        productName: String
        productReference: String
        productCible: String
        productObjets: String
        autresGaranties: String
        autresConditions: String
        montantMinIndividuel: String
        montantMaxIndividuel: String
        montantMinGroupe: String
        montantMaxGroupe: String
        montantMaxGroupeParPersonne: Float
        dureeMax: Int
        productTypes: [String]
        personTypes: [String]
        personnesMin: Int
        personnesMax: Int
        periodeCapitalisation: Int
        ratioNantissement: Float
        periodiciteRemboursement: [String]
        differePossible: Boolean
        differeMax: Int
        tauxInteret: Float
        tauxInteretType: String
        tauxAssurance: Float
        tauxAssuranceType: String
        fraisDossier: Float
        fraisDossierType: String
        autresFrais: Float
        autresFraisType: String
        gages: Boolean
        cautions: Int
        interestFrequency: String
        kapitalFrenquency: String
    }
`;

export const queries = `
    loanProductsAll(skip: Int!, perPage: Int!): [LoanProduct]!

    loanProductsByCompany(
        companyKey: String!,
        projectKey: String!,
        includeOnly: [String]
    ): [LoanProduct]!
`;

export const mutations = `
    loanProductCreate(
        projectKey: String!,
        companyKey: String!,
        loanCategoryKey: String!,
        isActive: Boolean!, 
        productName: String!,
        productReference: String!,
        productCible: String,
        productObjets: String,
        autresGaranties: String,
        autresConditions: String,
        montantMinIndividuel: String!,
        montantMaxIndividuel: String!,
        montantMinGroupe: String!,
        montantMaxGroupe: String!,
        montantMaxGroupeParPersonne: Float!,
        dureeMax: Int!,
        productTypes: [String]!,
        personnesMin: Int!,
        personnesMax: Int!,
        periodeCapitalisation: Int,
        ratioNantissement: Float!,
        periodiciteRemboursement: [String],
        differePossible: Boolean!,
        differeMax: Int!,
        tauxInteret: Float,
        tauxInteretType: String,
        tauxAssurance: Float,
        tauxAssuranceType: String,
        fraisDossier: Float,
        fraisDossierType: String,
        autresFrais: Float,
        autresFraisType: String,
        gages: Boolean!,
        cautions: Int!,
        interestFrequency: String!,
        kapitalFrenquency: String!,
        personTypes: [String]!,
    ): String!

    loanProductUpdate(
        key: String!,
        loanCategoryKey: String!,
        isActive: Boolean!, 
        productName: String!,
        productReference: String!,
        productCible: String,
        productObjets: String,
        autresGaranties: String,
        autresConditions: String,
        montantMinIndividuel: String!,
        montantMaxIndividuel: String!,
        montantMinGroupe: String!,
        montantMaxGroupe: String!,
        montantMaxGroupeParPersonne: Float!,
        dureeMax: Int!,
        productTypes: [String]!,
        personnesMin: Int!,
        personnesMax: Int!,
        periodeCapitalisation: Int,
        ratioNantissement: Float!,
        periodiciteRemboursement: [String],
        differePossible: Boolean!,
        differeMax: Int!,
        tauxInteret: Float,
        tauxInteretType: String,
        tauxAssurance: Float,
        tauxAssuranceType: String,
        fraisDossier: Float,
        fraisDossierType: String,
        autresFrais: Float,
        autresFraisType: String,
        gages: Boolean!,
        cautions: Int!,
        interestFrequency: String!,
        kapitalFrenquency: String!,
        personTypes: [String]!,
    ): String!
`;
