import loanActivitiesResolver from "./activities/loan_activity.js";
import loanAvis from "./avis/loan_avis.js";
import loanBesoins from "./besoin/loan_besoins.js";
import loanBudget from "./budget/loan_budget.js";
import loanExploitation from "./exploitation/loan_exploitation.js";
import { _downloadCreditIndividuelFull } from "./loan_files/loan_file_pdf.js";
import loanFiles from "./loan_files/loan_file.js";
import loanProductEnergie from "../_loans/products_energy/loan_product_energie.js";
import loanProducts from "../_loans/products/loan_product.js";
import loanSessionChat from "../_loans/session_chat/loan_session_chat.js";
import loanSession from "./session/loan_session.js";
import loanVisite from "./suivi/loan_visite.js";
import loanSessionLevel from "../_loans/session_levels/session_level.js";
import loanCoffreFortResolver from "./coffre_fort/coffre_fort.js";
import loanReportingResolver from "./reporting/loan_reporting.js";
import loanCategoryResolver from "./loan_category/loan_category.js";
import loanGroupRoleResolver from "./loan_group_role/loan_group_role.js";

import cautionResolver from "./caution/caution.js";
import gageResolver from "./gage/gage.js";
import loanPatrimoineResolver from "./patrimoine/patrimoine.js";

import loanFiliereResolver from "./filieres/filieres.js";

const loanResolvers = {
  ...loanFiliereResolver,
  ...loanPatrimoineResolver,
  ...gageResolver,
  ...cautionResolver,
  ...loanGroupRoleResolver,
  ...loanCategoryResolver,
  ...loanReportingResolver,
  ...loanCoffreFortResolver,
  ...loanSessionLevel,
  ...loanVisite,
  ...loanSession,
  ...loanSessionChat,
  ...loanProducts,
  ...loanActivitiesResolver,
  ...loanAvis,
  ...loanBudget, // loan_budget_familial
  ...loanBesoins,
  ...loanExploitation,
  ...loanFiles,
  ..._downloadCreditIndividuelFull,
  ...loanProductEnergie,
};

export default loanResolvers;
