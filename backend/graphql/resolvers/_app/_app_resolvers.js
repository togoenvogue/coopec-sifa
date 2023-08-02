import notificationResolver from "./notification/notification.js";
import systemResolver from "./system/system.js";
import userResolver from "./user/user.js";
import resetResolver from "./reset/reset.js";
import cityResolver from "./city/city.js";
import companyResolver from "./company/company.js";
import projectResolver from "./project/project.js";
import moduleResolver from "./module/modules.js";
import countryResolver from "./country/country.js";
import backupResolver from "./backup/backup.js";
import roleResolver from "./role/role.js";
import officeResolver from "./office/office.js";
import deviceIdResolver from "./device/device.js";
import logResolver from "./logs/custom_log.js";

const appResolvers = {
  ...logResolver,
  ...deviceIdResolver,
  ...officeResolver,
  ...roleResolver,
  ...backupResolver,
  ...moduleResolver,
  ...countryResolver,
  ...projectResolver,
  ...notificationResolver,
  ...systemResolver,
  ...userResolver,
  ...resetResolver,
  ...cityResolver,
  ...companyResolver,
};

export default appResolvers;
