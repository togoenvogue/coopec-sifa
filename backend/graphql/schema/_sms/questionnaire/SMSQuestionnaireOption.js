export const types = `
    type SMSQuestionnaireOption {
        _id: ID
        _key: ID
        questionnaireKey: SMSQuestionnaire
        blockKey: SMSQuestionnaireBlock
        optionQuestion: String
        optionItems: [[String]]
        optionResults: [SMSQuestionnaireOptionResult]
        optionOrder: Int
        optionType: String
        isActive: Boolean
    }


    type SMSQuestionnaireOptionResult {
        optionKey: String
        resultValue: String
        optionType: String
        resultCount: Float
    }
     
`;

export const queries = `
    
`;

export const mutations = `
    smsQuestionnaireOptionCreate(
        blockKey: String!,
        questionnaireKey: String!,
        optionQuestion: String!,
        optionItems: [[String]]!,
        optionType: String!,
        optionOrder: Int!,
        isActive: Boolean!,
    ): SMSQuestionnaireOption!

    smsQuestionnaireOptionUpdateQuestion(
        optionKey: String!,  
        optionQuestion: String!, 
        optionOrder: Int!, 
        optionType: String!,
    ): SMSQuestionnaireOption!

    smsQuestionnaireOptionDelete(optionKey: String!): String!

    smsQuestionnaireOptionUpdateItem(
        optionKey: String!,  
        optionItemLabel: String!, 
        optionItemValue: String!, 
        optionItemScore: String!, 
        optionItemIndex: Int!, 
    ): SMSQuestionnaireOption!

    smsQuestionnaireOptionAddItem(
        optionKey: String!,  
        optionItemLabel: String!, 
        optionItemValue: String!, 
        optionItemScore: String!,  
    ): SMSQuestionnaireOption!

    smsQuestionnaireOptionRemoveItem(
        optionKey: String!,  
        optionItemLabel: String!, 
        optionItemValue: String!, 
        optionItemScore: String!, 
        optionItemIndex: Int!, 
    ): SMSQuestionnaireOption!
`;
