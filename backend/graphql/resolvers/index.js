import appResolvers from "./_app/_app_resolvers.js";
import loanResolvers from "./_loans/_loan_resolvers.js";
import uploadResolver from "../../helpers/upload.js";
import downloadResolver from "../../helpers/download.js";
import clientResolvers from "./_client/_client_resolvers.js";
import smsResolvers from "./_sms/_sms_resolvers.js";

const graphQlResolvers = {
  ...smsResolvers,
  ...clientResolvers,
  ...appResolvers,
  ...loanResolvers,
  ...downloadResolver,
  ...uploadResolver,
};

export default graphQlResolvers;
