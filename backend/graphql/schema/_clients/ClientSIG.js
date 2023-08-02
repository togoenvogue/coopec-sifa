export const types = `
    type ClientPresence {
        clientKey: String
        codeSig: String
        clientFullName: String
        clientPhone: String
        groupName: String
        isPresentAtStart: Boolean
        isPresentAtEnd: Boolean
        stampStart: Float
        stampEnd: Float
    }

    type Geoloc {
        lieu: String
        lat: Float
        long: Float
    }

    type ClientSIG {
        _id: ID
        _key: ID
        timeStamp: Float 
        codeSig: String
        fullName: String
        intituleDuCompte: String
        phone: String
        phoneAlt: String
        idType: String
        idNumber: String
        idDateStart: Float
        idDateEnd: Float
        email: String
        personneRessourceFullName: String
        personneRessourceFiliation: String
        personneRessourcePhone: String
        personneRessourcePhoneAlt: String
        animateurKey: User
        projectKey: Project
        countryKey: Country
        cityKey: City
        companyKey: Company
        officeKey: Office
        regionKey: LocationRegion
        prefectureKey: LocationPrefecture
        cantonKey: LocationCanton
        codeAgence: String
        quartier: String
        address: String
        addressSinceWhen: String
        addressFiliation: String
        activities: String
        activitiesSinceWhen: String
        activitiesAutres: String
        geoLocations: [Geoloc]
        prevSigLoans: [SigLoan]
        photo: String
        photo1: String
        photo2: String
        photo3: String
        photo4: String
        legende: String
        legende1: String
        legende2: String
        legende3: String
        legende4: String
        gender: String
        personne: String
        poste: String
        groupName: String
        groupRef: String
        status: String
        fullCount: Int
        signature: String
        signatureCredit: String
        fingerPrint: String
        fingerPrintCredit: String
        updatedAt: Float
        isActive: Boolean
        soldeEpargne: Float
        soldeDate: Float
        maritalStatus: String
        numberOfChildren: Int
        peopleInCharge: Int
        naissanceDate: Float
        naissanceLieu: String
        fatherFullName: String
        motherFullName: String
    }

    type SigLoan {
        dateDemande: Float
        dateCloture: Float
        montant: Float
        duree: Int
        numero: String
        cycle: Int
    }

    type GetClientsOrGroupsType {
        labels: [String]
        refs: [String]
        keys: [String]
        officeKeys: [String]
        officeNames: [String]
        soldes: [Float]
        soldeDates: [Float]
        prevLoanCounts: [Int]
        okays: [Boolean]
        personneTypes: [String]
    }
`;

export const queries = `
    clientByKey(clientKey: String): ClientSIG!

    clientsSIG(
        projectKey: String!,
        companyKey: String!,
        officeKey: String!,
        animateurKey: String!,
        groupCode: String!,
        accessLevel: Int!,
        skip: Int!,
        perPage: Int!,
        extend: String!
    ): [ClientSIG]!

    getClientsByCodeSig(
        projectKey: String!,
        companyKey: String!,
        codeSig: String!,
        creditIsIndividuel: Boolean!,
    ): [ClientSIG]!
 
    clientsSearch(
        searchString: String!,
        animateurKey: String!,
        companyKey: String!,
        projectKey: String!,
        officeKey: String!,
        searchCoverage: String!,
        skip: Int!,
        perPage: Int!
    ): [ClientSIG]!

    clientsGPSMap(
        companyKey: String!,
        projectKey: String!,
        perPage: Int!,
        skip: Int!,
        coverage: String!,
        userKey: String!,
    ): [ClientSIG]!

    clientsByGroupByProfile(
        companyKey: String!,
        projectKey: String!,
        groupRef: String!,
        profile: String!,
    ): [ClientSIG]!

    clientGetLatestId(
        companyKey: String!,
        projectKey: String!,
        animateurCode: String!,
    ): String!

    clientsCodes(
        companyKey: String!,
        projectKey: String!,   
    ): String!

    clientFicheDownload(clientKey: String!, folder: String) : String!
    clientSetActiveOrInactive(clientKey: String!, status: Boolean!) : String!

    getClientsOrGroups(
        toSearch: String!,
        creditType: String!,
        animateurKey: String!,
        officeKeys: [String]!,
    ): GetClientsOrGroupsType!
`;

export const mutations = `
    clientUpdate(
        clientKey: String!,
        animateurKey: String!,
        phone: String!,
        phoneAlt: String!,
        intituleDuCompte: String!,
        idType: String,
        idNumber: String,
        idDateStart: Float,
        idDateEnd: Float,
        personneRessourceFullName: String,
        personneRessourceFiliation: String,
        personneRessourcePhone: String,
        personneRessourcePhoneAlt: String,
        countryKey: String!,
        cityKey: String!,
        regionKey: String!
        prefectureKey: String!
        cantonKey: String!
        quartier: String!,
        address: String!,
        addressSinceWhen: String!,
        addressFiliation: String!,
        activities: String!,
        activitiesSinceWhen: String,
        activitiesAutres: String,
        geoLieux: [String!],
        geoLats: [Float!],
        geoLongs: [Float!],
        gender: String,
        naissanceDate: Float,
        naissanceLieu: String,
        fatherFullName: String,
        motherFullName: String,
        maritalStatus: String,
        numberOfChildren: Int!,
        peopleInCharge: Int!,
    ): String!

    clientDelete(clientKey: String!): String!

    importClientByCodeSig( 
        companyKey: String!,
        projectKey: String!,
        officeKey: String!,
        codeSig: String,
        userKey: String!, 
    ): String!
 
    clientReset(
        clientKey: String!,
        userKey: String!,
        companyKey: String!, 
        projectKey: String!, 
    ): String!

    requestClientsByGroupCode(groupCode: String!): [String]!

    clientIntegrer(
        poste: String!,
        clientKey: String!,
        groupName: String!,
        groupRef: String!,
        groupKey: String!,
    ): String!

    clientDissocier(clientKey: String!, groupCode: String!): String!

    
`;
