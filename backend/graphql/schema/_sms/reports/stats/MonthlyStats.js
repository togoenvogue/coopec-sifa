export const types = `
    type SMSMonthlyStat {
        projectKey: Project
        companyKey: Company
        officeKey: Office
        socialUserKey: User
        coverage: String
        ecoute_A: [Float]
        ecoute_B: [Float]
        referencement_A: [Float]
        referencement_B: [Float]
        causerie_A: [Float]
        causerie_B: [Float]
        causerie_C: [Float]
        evenement_A: [Float]
        evenement_B: [Float]
        evenement_C: [Float]
        formations_anim_A: [Float]
        formations_anim_B: [Float]
        observations_A: [Float]
        observations_B: [Float]
    } 
`;

export const queries = `
    smsMonthlyStats(
        companyKey: String!,
        projectKey: String!,
        officeKey: String!,
        year: Float!,
        socialUserKey: String!,
        coverage: String!
        dateFrom: Float!,
        dateTo: Float!,
 ): [SMSMonthlyStat]!
`;

export const mutations = ``;
