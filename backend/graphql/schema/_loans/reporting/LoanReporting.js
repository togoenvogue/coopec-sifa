export const types = `
    type LoanReporting {
        months: [String]
        fileCounts: [Int]
    }
`;

export const queries = `
    loanReporting(
        companyKey: String!,
        projectKey: String!,
        officeKey: String!,
        year: Int!,
        productKey: String!,
        userKey: String!,
        coverage: String!,
        status: String!,
        type: String!,
        roleKey: String, 
        dateFrom: Float!,
        dateTo: Float!,
    ): LoanReporting!

    loanReportDownload(
        labels: [String!],
        counts: [Int!],
        type: String,
        product: String,
        activityCategory: String,
        year: Int,
        totaux: Float,
        status: String,
        dateFrom: Float,
        dateTo: Float,
        coverage: String,
        antenne: String
    ): String!
 
`;

export const mutations = `
`;
