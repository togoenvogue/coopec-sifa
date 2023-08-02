import { buildSchema } from "graphql";

import * as Country from "./_app/country/Country.js";
import * as Company from "./_app/company/Company.js";
import * as User from "./_app/user/User.js";
import * as AccessType from "./_app/access_type/AccessType.js";
import * as City from "./_app/city/City.js";
import * as Notification from "./_app/notification/Notification.js";
import * as AppConfig from "./_app/config/AppConfig.js";
import * as Project from "./_app/project/Project.js";
import * as Module from "./_app/module/Module.js";
import * as Role from "./_app/role/Role.js";
import * as Inbox from "./_inbox/Inbox.js";
import * as Office from "./_app/office/Office.js";
import * as FileHelper from "./utilities/FileHelper.js";
import * as ClientSIG from "./_clients/ClientSIG.js";
import * as GroupSIG from "./_clients/GroupSIG.js";
import * as ActivityType from "./_loans/activities/Activity.js";
import * as LoanAvis from "./_loans/avis/LoanAvis.js";
import * as FamilyExploitationType from "./_loans/famille/FamilyExploitation.js";
import * as LoanComite from "./_loans/comite/LoanComite.js";

import * as GageType from "./_loans/gage/Gage.js";
import * as GateEvalType from "./_loans/gage/GageEval.js";
import * as GarantieType from "./_loans/garantie/Garantie.js";
import * as CautionType from "./_loans/caution/Caution.js";
import * as PatrimoineType from "./_loans/patrimoine/Patrimoine.js";
import * as AvisVoteType from "./_loans/comite/AvisVote.js";

import * as ActivityExploitationType from "./_loans/activities/ActivityExploitation.js";
import * as ActivityApproType from "./_loans/activities/ActivityApproKeys.js";

import * as LoanFile from "./_loans/loan_files/LoanFile.js";
import * as LoanProduct from "./_loans/products/LoanProduct.js";
import * as LoanProductEnergie from "./_loans/products_energy/LoanProductEnergie.js";
import * as LoanSession from "./_loans/session/LoanSession.js";
import * as LoanSessionChat from "./_loans/session_chat/LoanSessionChat.js";
import * as LoanSuivi from "./_loans/suivi/LoanSuivi.js";
import * as LoanSessionLevel from "./_loans/session_levels/LoanSessionLevel.js";
import * as CoffreFOrt from "./_loans/coffre_fort/LoanCoffreFort.js";

import * as DeviceId from "./_app/device/Device.js";

// backup
import * as Backup from "./_backup/Backup.js";
import * as LoanVulnerability from "./_loans/vulnerability/LoanVulnerability.js";

// SMS
import * as SMSQuestionnaire from "./_sms/questionnaire/SMSQuestionnaire.js";
import * as SMSQuestionnaireBlock from "./_sms/questionnaire/SMSQuestionnaireBlock.js";
import * as SMSQuestionnaireOption from "./_sms/questionnaire/SMSQuestionnaireOption.js";
import * as SMSQuestionnaireData from "./_sms/questionnaire/SMSQuestionnaireData.js";
import * as SMSQuestionnaireStats from "./_sms/questionnaire/SMSQuestionnaireStats.js";

// sms activity types
import * as SMSActivityType from "./_sms/activity_types/ActivityTypes.js";
import * as SMSActivityTheme from "./_sms/activity_themes/ActivityThemes.js";
import * as SMSSocialPartners from "./_sms/social_partners/index.js";
import * as SMSFormationsThemes from "./_sms/formations/plans/index.js";
// suivis actions
import * as SMSSuivisActions from "./_sms/suivis/actions/Actions.js";
import * as SMSSuivisObjets from "./_sms/suivis/objets/Objets.js";
import * as SMSSuivisStatus from "./_sms/suivis/status/Status.js";
import * as SMSSuivisData from "./_sms/suivis/data/Data.js";

// referencement
import * as SMSReferencement from "./_sms/referencements/Referencement.js";
// formations
import * as SMSFormationsObs from "./_sms/formations/observations/Observations.js";
import * as SMSFormationsAnims from "./_sms/formations/animateurs/Animateurs.js";

// causeries
import * as SMSCauserie from "./_sms/causeries/Causeries.js";
// evenements
import * as SMSEvenement from "./_sms/evenements/Evenements.js";
// sms monthly reports
import * as SMSMonthlyReport from "./_sms/reports/monthly/MontlyReport.js";
// sms monthly stats
import * as SMSMonthlyStat from "./_sms/reports/stats/MonthlyStats.js";
// sms formations des formateurs
import * as SMSFormationsTS from "./_sms/formations/travailleurs_sociaux/Ts.js";
// loan reporting
import * as LoanReporting from "./_loans/reporting/LoanReporting.js";

// logs
import * as CustomLog from "./_app/logs/CustomLog.js";

// loan categories
import * as LoanCategory from "./_loans/loan_category/LoanCategory.js";
import * as LoanGroupRole from "./_loans/loan_group_role/LoanGroupRole.js";
import * as FiliereType from "./_loans/filieres/FiliereType.js";

import * as PdfFile from "./_pdf/PdfFile.js";

const types = [];
const queries = [];
const mutations = [];

const schemas = [
  PdfFile,
  FiliereType,
  ActivityApproType,
  GageType,
  GateEvalType,
  GarantieType,
  CautionType,
  PatrimoineType,
  AvisVoteType,
  FamilyExploitationType,
  ActivityExploitationType,
  LoanGroupRole,
  LoanCategory,
  CustomLog,
  LoanReporting,
  DeviceId,
  SMSFormationsTS,
  SMSQuestionnaireStats,
  SMSMonthlyStat,
  SMSMonthlyReport,
  SMSEvenement,
  SMSCauserie,
  SMSFormationsAnims,
  SMSFormationsObs,
  SMSReferencement,
  SMSSuivisData,
  SMSSuivisActions,
  SMSSuivisObjets,
  SMSSuivisStatus,
  SMSFormationsThemes,
  SMSSocialPartners,
  SMSActivityTheme,
  SMSActivityType,
  SMSQuestionnaireBlock,
  SMSQuestionnaireOption,
  SMSQuestionnaire,
  SMSQuestionnaireData,
  CoffreFOrt,
  LoanSessionLevel,
  LoanVulnerability,
  Backup,
  ActivityType,
  LoanAvis,
  LoanComite,
  LoanFile,
  LoanProduct,
  LoanProductEnergie,
  LoanSession,
  LoanSessionChat,
  LoanSuivi,
  ClientSIG,
  GroupSIG,
  FileHelper,
  Office,
  Inbox,
  Project,
  Module,
  Role,
  Country,
  Company,
  User,
  AccessType,
  City,
  Notification,
  AppConfig,
];
// loop through the schemas
schemas.forEach((s) => {
  types.push(s.types);
  queries.push(s.queries);
  mutations.push(s.mutations);
});

const graphQlSchema = buildSchema(`
    ${types.join("\n")}
 
    type RootQuery {
        ${queries.join("\n")}
    }
 
    type RootMutation {
        ${mutations.join("\n")}
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);

export default graphQlSchema;
