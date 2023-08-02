import smsQuestionnaire from "./questionnaires/questionnaire/index.js";
import smsQuestionnaireData from "./questionnaires/questionnaire/data.js";
import smsQuestionnaireBlock from "./questionnaires/blocks/index.js";
import smsQuestionnaireOption from "./questionnaires/options/index.js";
import smsActivityTypesResolver from "./activity_types/index.js";
import smsActivityThemesResolver from "./activity_themes/index.js";
import smsSocialPartersResolver from "./social_partners/index.js";
import smsFormationsThemesResolver from "./formations/plans/index.js";

import smsSuivisActionsResolver from "./suivis/actions/actions.js";
import smsSuivisObjetsResolver from "./suivis/objets/objets.js";
import smsSuivisStatutPartenaireResolver from "./suivis/status/status.js";
import smsSuivisDataResolver from "./suivis/data/data.js";

// referenement
import smsReferencementsResolver from "./referencements/referencement.js";
// formations
import smsFormationsObsResolver from "./formations/observations/observations.js";
import smsFormationsAnimsResolver from "./formations/animateurs/animateurs.js";

// causeries
import smsCauseriesResolver from "./causeries/causeries.js";
// evenements communautaires
import smsEvenementsResolver from "./evenements/evenements.js";
// rapports monsuels
import smsMonthlyReportResolver from "./reports/monthly/monthly_report.js";
// stats mensuls
import smsMonthlyStatsResolver from "./reports/stats/monthly_stats.js";
// Kiva
import smsKivaResolver from "./kiva/kiva.js";

// sms questionnaire stats
import smsQuestionnaireStatsResolver from "./questionnaires/questionnaire/stats.js";
import smsFormationsTSResolver from "./formations/travailleurs_sociaux/ts.js";

const smsResolvers = {
  ...smsFormationsTSResolver,
  ...smsQuestionnaireStatsResolver,
  ...smsMonthlyStatsResolver,
  ...smsKivaResolver,
  ...smsMonthlyReportResolver,
  ...smsEvenementsResolver,
  ...smsCauseriesResolver,
  ...smsFormationsAnimsResolver,
  ...smsFormationsObsResolver,
  ...smsReferencementsResolver,
  ...smsSuivisDataResolver,
  ...smsSuivisStatutPartenaireResolver,
  ...smsSuivisActionsResolver,
  ...smsSuivisObjetsResolver,
  ...smsFormationsThemesResolver,
  ...smsSocialPartersResolver,
  ...smsActivityThemesResolver,
  ...smsActivityTypesResolver,
  ...smsQuestionnaireOption,
  ...smsQuestionnaire,
  ...smsQuestionnaireBlock,
  ...smsQuestionnaireData,
};

export default smsResolvers;
