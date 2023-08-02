import { aql, db } from "../../../../db/arangodb.js";
import { customFullDate } from "../../../../helpers/date.js";
import { _printLoanReporting } from "./loan_reporting_pdf.js";

const loanReportingResolver = {
  loanReporting: async ({
    companyKey,
    projectKey,
    officeKey,
    year,
    productKey,
    userKey,
    coverage,
    status,
    type,
    roleKey,
    dateFrom,
    dateTo,
  }) => {
    /*console.log(`projectKey: ${projectKey}`);
    console.log(`companyKey: ${companyKey}`);
    console.log(`officeKey: ${officeKey}`);
    console.log(`year: ${year}`);
    console.log(`productKey: ${productKey}`);
    console.log(`userKey: ${userKey}`);
    console.log(`coverage: ${coverage}`);
    console.log(`status: ${status}`);
    console.log(`activityCategoryKey: ${activityCategoryKey}`); // filieres
    console.log(`roleKey: ${roleKey}`);
    console.log(`type: ${type}`);*/

    if (type == "Statistiques annuelles") {
      let months = [
        "JANVIER",
        "FÉVRIER",
        "MARS",
        "AVRIL",
        "MAI",
        "JUIN",
        "JUILLET",
        "AOÛT",
        "SEPTEMBRE",
        "OCTOBRE",
        "NOVEMBRE",
        "DÉCEMBRE",
      ];
      let fileCounts = [];

      if (coverage == "Utilisateur") {
        const loans_cursor =
          productKey == "ALL"
            ? await db.query(
                aql`FOR l IN loan_files 
                        FILTER l.officeKey == ${officeKey}  
                        AND l.animateurKey == ${userKey}
                        AND DATE_YEAR(l.timeStamp) == ${year}
                        AND l.status == ${status} RETURN l`,
                { fullCount: true },
                { count: true }
              )
            : await db.query(
                aql`FOR l IN loan_files 
                        FILTER l.officeKey == ${officeKey} 
                        AND l.animateurKey == ${userKey}
                        AND l.loanProductKey == ${productKey} 
                        AND DATE_YEAR(l.timeStamp) == ${year}
                        AND l.status == ${status} RETURN l`,
                { fullCount: true },
                { count: true }
              );
        if (loans_cursor.hasNext) {
          const loans = await loans_cursor.all();
          let JAN = 0;
          let FEV = 0;
          let MAR = 0;
          let AVR = 0;
          let MAI = 0;
          let JUN = 0;
          let JUL = 0;
          let AOU = 0;
          let SEP = 0;
          let OCT = 0;
          let NOV = 0;
          let DEC = 0;

          for (let index = 0; index < loans.length; index++) {
            const loan = loans[index];
            const date = new Date(loan.timeStamp);
            const _year = date.getFullYear();
            const _month = date.getMonth() + 1;

            if (_month == 1 && _year == year) {
              JAN = JAN + 1;
            } else if (_month == 2 && _year == year) {
              FEV = FEV + 1;
            } else if (_month == 3 && _year == year) {
              MAR = MAR + 1;
            } else if (_month == 4 && _year == year) {
              AVR = AVR + 1;
            } else if (_month == 5 && _year == year) {
              MAI = MAI + 1;
            } else if (_month == 6 && _year == year) {
              JUN = JUN + 1;
            } else if (_month == 7 && _year == year) {
              JUL = JUL + 1;
            } else if (_month == 8 && _year == year) {
              AOU = AOU + 1;
            } else if (_month == 9 && _year == year) {
              SEP = SEP + 1;
            } else if (_month == 10 && _year == year) {
              OCT = OCT + 1;
            } else if (_month == 11 && _year == year) {
              NOV = NOV + 1;
            } else if (_month == 12 && _year == year) {
              DEC = DEC + 1;
            }
          } // end for each loop
          fileCounts.push(
            JAN,
            FEV,
            MAR,
            AVR,
            MAI,
            JUN,
            JUL,
            AOU,
            SEP,
            OCT,
            NOV,
            DEC
          );
          return { months: months, fileCounts: fileCounts };
        } else {
          fileCounts.push(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
          return { months: months, fileCounts: fileCounts };
        }
      } else if (coverage == "Antenne") {
        const loans_cursor =
          productKey == "ALL"
            ? await db.query(
                aql`FOR l IN loan_files 
                    FILTER l.officeKey == ${officeKey}  
                    AND DATE_YEAR(l.timeStamp) == ${year}
                    AND l.status == ${status} RETURN l`,
                { fullCount: true },
                { count: true }
              )
            : await db.query(
                aql`FOR l IN loan_files 
                    FILTER l.officeKey == ${officeKey}  
                    AND l.loanProductKey == ${productKey} 
                    AND DATE_YEAR(l.timeStamp) == ${year}
                    AND l.status == ${status} RETURN l`,
                { fullCount: true },
                { count: true }
              );
        if (loans_cursor.hasNext) {
          const loans = await loans_cursor.all();
          let JAN = 0;
          let FEV = 0;
          let MAR = 0;
          let AVR = 0;
          let MAI = 0;
          let JUN = 0;
          let JUL = 0;
          let AOU = 0;
          let SEP = 0;
          let OCT = 0;
          let NOV = 0;
          let DEC = 0;

          for (let index = 0; index < loans.length; index++) {
            const loan = loans[index];
            const date = new Date(loan.timeStamp);
            const _year = date.getFullYear();
            const _month = date.getMonth() + 1;

            if (_month == 1 && _year == year) {
              JAN = JAN + 1;
            } else if (_month == 2 && _year == year) {
              FEV = FEV + 1;
            } else if (_month == 3 && _year == year) {
              MAR = MAR + 1;
            } else if (_month == 4 && _year == year) {
              AVR = AVR + 1;
            } else if (_month == 5 && _year == year) {
              MAI = MAI + 1;
            } else if (_month == 6 && _year == year) {
              JUN = JUN + 1;
            } else if (_month == 7 && _year == year) {
              JUL = JUL + 1;
            } else if (_month == 8 && _year == year) {
              AOU = AOU + 1;
            } else if (_month == 9 && _year == year) {
              SEP = SEP + 1;
            } else if (_month == 10 && _year == year) {
              OCT = OCT + 1;
            } else if (_month == 11 && _year == year) {
              NOV = NOV + 1;
            } else if (_month == 12 && _year == year) {
              DEC = DEC + 1;
            }
          } // end for each loop
          fileCounts.push(
            JAN,
            FEV,
            MAR,
            AVR,
            MAI,
            JUN,
            JUL,
            AOU,
            SEP,
            OCT,
            NOV,
            DEC
          );
          return { months: months, fileCounts: fileCounts };
        } else {
          fileCounts.push(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
          return { months: months, fileCounts: fileCounts };
        }
      } else if (coverage == "Globale") {
        const loans_cursor =
          productKey == "ALL"
            ? await db.query(
                aql`FOR l IN loan_files 
                    FILTER l.companyKey == ${companyKey}  
                    AND DATE_YEAR(l.timeStamp) == ${year}
                    AND l.status == ${status} RETURN l`,
                { fullCount: true },
                { count: true }
              )
            : await db.query(
                aql`FOR l IN loan_files 
                    FILTER l.companyKey == ${companyKey}  
                    AND l.loanProductKey == ${productKey} 
                    AND DATE_YEAR(l.timeStamp) == ${year}
                    AND l.status == ${status} RETURN l`,
                { fullCount: true },
                { count: true }
              );

        if (loans_cursor.hasNext) {
          const loans = await loans_cursor.all();
          let JAN = 0;
          let FEV = 0;
          let MAR = 0;
          let AVR = 0;
          let MAI = 0;
          let JUN = 0;
          let JUL = 0;
          let AOU = 0;
          let SEP = 0;
          let OCT = 0;
          let NOV = 0;
          let DEC = 0;

          for (let index = 0; index < loans.length; index++) {
            const loan = await loans[index];
            const date = new Date(loan.timeStamp);
            const _year = date.getFullYear();
            const _month = date.getMonth() + 1;
            //console.log(`_MONTH: ${_month}`);
            //console.log(`_YEAR: ${_year}`);

            if (_month == 1 && _year == year) {
              JAN = JAN + 1;
              //console.log(`JAN: ${JAN}`);
            } else if (_month == 2 && _year == year) {
              FEV = FEV + 1;
              //console.log(`FEV: ${FEV}`);
            } else if (_month == 3 && _year == year) {
              MAR = MAR + 1;
              //console.log(`MAR: ${MAR}`);
            } else if (_month == 4 && _year == year) {
              AVR = AVR + 1;
              //console.log(`AVR: ${AVR}`);
            } else if (_month == 5 && _year == year) {
              MAI = MAI + 1;
              //console.log(`MAI: ${MAI}`);
            } else if (_month == 6 && _year == year) {
              JUN = JUN + 1;
              //console.log(`JUN: ${JUN}`);
            } else if (_month == 7 && _year == year) {
              JUL = JUL + 1;
              //console.log(`JUL: ${JUL}`);
            } else if (_month == 8 && _year == year) {
              AOU = AOU + 1;
              //console.log(`AOU: ${AOU}`);
            } else if (_month == 9 && _year == year) {
              SEP = SEP + 1;
              //console.log(`SEP: ${SEP}`);
            } else if (_month == 10 && _year == year) {
              OCT = OCT + 1;
              //console.log(`OCT: ${OCT}`);
            } else if (_month == 11 && _year == year) {
              NOV = NOV + 1;
              //console.log(`NOV: ${NOV}`);
            } else if (_month == 12 && _year == year) {
              DEC = DEC + 1;
              //console.log(`DEC: ${DEC}`);
            }
          } // end for each loop
          fileCounts.push(
            JAN,
            FEV,
            MAR,
            AVR,
            MAI,
            JUN,
            JUL,
            AOU,
            SEP,
            OCT,
            NOV,
            DEC
          );

          return { months: months, fileCounts: fileCounts };
        } else {
          fileCounts.push(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
          return { months: months, fileCounts: fileCounts };
        }
      }
      // analyses croisees
    } else if (type == "Statistiques croisées") {
      //
      let months = [];
      let fileCounts = [];
      let keysArr = [];

      if (coverage == "Utilisateur") {
        // select users
        const users_cursor = await db.query(
          aql`FOR u IN user 
              FILTER u.companyKey == ${companyKey} 
              AND u.projectKey == ${projectKey} 
              AND u.officeKey == ${officeKey}
              SORT u.lastName ASC RETURN u`,
          { fullCount: true },
          { count: true }
        );
        if (users_cursor.hasNext) {
          const users = await users_cursor.all();
          for (let oi = 0; oi < users.length; oi++) {
            const user = users[oi];
            months.push(`${user.lastName} ${user.firstName}`);
            keysArr.push(user._key);
          } // end for users

          // select loans
          for (let ki = 0; ki < keysArr.length; ki++) {
            const key = keysArr[ki];

            const loans_cursor =
              productKey == "ALL"
                ? await db.query(
                    aql`FOR l IN loan_files 
                        FILTER l.officeKey == ${officeKey}
                        AND l.animateurKey == ${key}  
                        AND l.timeStamp >= ${dateFrom}
                        AND l.timeStamp <= ${dateTo}
                        AND l.status == ${status} RETURN l`,
                    { fullCount: true },
                    { count: true }
                  )
                : await db.query(
                    aql`FOR l IN loan_files 
                        FILTER l.officeKey == ${officeKey}
                        AND l.animateurKey == ${key}
                        AND l.loanProductKey == ${productKey} 
                        AND l.timeStamp >= ${dateFrom}
                        AND l.timeStamp <= ${dateTo}
                        AND l.status == ${status} RETURN l`,
                    { fullCount: true },
                    { count: true }
                  );
            if (loans_cursor.hasNext) {
              const loans = await loans_cursor.all();
              let count_$key = 0;

              for (let index = 0; index < loans.length; index++) {
                count_$key = count_$key + 1;
              } // end for loan each loop

              fileCounts.push(count_$key);
            } else {
              fileCounts.push(0);
            }
          } // end for keysArr
          return { fileCounts: fileCounts, months: months };
        } else {
          fileCounts.push(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
          return { months: months, fileCounts: fileCounts };
        }
      } else if (coverage == "Antenne") {
        // select offices
        const offices_cursor = await db.query(
          aql`FOR o IN office 
            FILTER o.companyKey == ${companyKey} AND o.projectKey == ${projectKey} 
            SORT o.officeName ASC RETURN o`,
          { fullCount: true },
          { count: true }
        );
        if (offices_cursor.hasNext) {
          const offices = await offices_cursor.all();
          for (let oi = 0; oi < offices.length; oi++) {
            const office = offices[oi];
            months.push(office.officeName);
            keysArr.push(office._key);
          } // end for offices

          // select loans
          for (let ki = 0; ki < keysArr.length; ki++) {
            const key = keysArr[ki];

            const loans_cursor =
              productKey == "ALL"
                ? await db.query(
                    aql`FOR l IN loan_files 
                      FILTER l.officeKey == ${key}  
                      AND l.timeStamp >= ${dateFrom}
                      AND l.timeStamp <= ${dateTo}
                      AND l.status == ${status} RETURN l`,
                    { fullCount: true },
                    { count: true }
                  )
                : await db.query(
                    aql`FOR l IN loan_files 
                      FILTER l.officeKey == ${key}  
                      AND l.loanProductKey == ${productKey} 
                      AND l.timeStamp >= ${dateFrom}
                      AND l.timeStamp <= ${dateTo}
                      AND l.status == ${status} RETURN l`,
                    { fullCount: true },
                    { count: true }
                  );
            if (loans_cursor.hasNext) {
              const loans = await loans_cursor.all();
              let count_$key = 0;

              for (let index = 0; index < loans.length; index++) {
                count_$key = count_$key + 1;
              } // end for loan each loop

              fileCounts.push(count_$key);
            } else {
              fileCounts.push(0);
            }
          } // end for keysArr
          return { fileCounts: fileCounts, months: months };
        } else {
          fileCounts.push(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
          return { months: months, fileCounts: fileCounts };
        }
      }
    }
  },

  loanReportDownload: async ({
    labels,
    counts,
    type,
    product,
    activityCategory,
    year,
    totaux,
    status,
    dateFrom,
    dateTo,
    coverage,
    antenne,
  }) => {
    const pdf = await _printLoanReporting({
      activityCategory: activityCategory,
      counts: counts,
      labels: labels,
      product: product,
      status: status,
      totaux: totaux,
      type: type,
      coverage: coverage,
      antenne: antenne,
      date:
        type == "Statistiques annuelles"
          ? year
          : `${await customFullDate({
              timeStamp: dateFrom,
            })} / ${await customFullDate({
              timeStamp: dateTo,
            })}`,
      pdfFolder: "public_docs",
      pdfName: `statistiques_de_gestion.pdf`,
    });
    console.log(pdf);
    return pdf;
  },
};

export default loanReportingResolver;
