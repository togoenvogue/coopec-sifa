import groupSIG from "./group.js";
import clientSIG from "./client.js";

const clientResolvers = {
  ...clientSIG,
  ...groupSIG,
};

export default clientResolvers;
