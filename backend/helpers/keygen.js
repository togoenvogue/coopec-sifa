const keygen = require("easy-uid");
module.exports = {
  apiKeyGen: async () => {
    const api = keygen();
    return api.toUpperCase();
  },
};
