import { aql, db } from "../../../../db/arangodb.js";
import {
  getOfficeDoc,
  getUserDoc,
  getUserDocs,
} from "../../../../helpers/joindocs.js";
import { getSMSFormationDoc } from "../../../../helpers/joindocs_sms.js";

const smsKivaResolver = {};

export default smsKivaResolver;
