export const types = `
   type PdfFileType {
       _key: ID
       timeStamp: Float
       loanKey: String
       fileName: String
       fileDesc: String
       fullCount: Int
   }
`;

export const queries = `
    pdfFiles(loanKey: String!): [PdfFileType]!
`;

export const mutations = `
    pdfFileCreate(
        uploadedFile: String!,
        description: String!
        loanKey: String!,
    ): String!

    pdfFileDelete(pdfKey: String!): String!
`;
