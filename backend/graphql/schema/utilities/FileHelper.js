export const types = `
   type UploadHelper {
       _key: ID
   }
`;

export const queries = `
    exportAndDownloadFile(
        fileType: String!, 
        fileSeparator: String!, 
        fileDocument: String!,
        varArr: [String],
    ): String!

    uploadPhotoAndUpdateDocument(
        uploadedFile: String!, 
        index: String!,
        legende: String,
        docName: String!,
        docKey: String!,
        ): Boolean!
`;

export const mutations = `
    deletePhotoAndUpdateDocument(
        uploadedFile: String!,
        index: String!
        docKey: String!,
        docName: String!, 
    ): String!
`;
