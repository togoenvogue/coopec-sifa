import { aql, db } from "../../../../../db/arangodb.js";

const smsQuestionnaireStatsResolver = {
  statsByOptionKeySimple: async ({
    blockKey,
    companyKey,
    officeKey,
    projectKey,
    optionKey,
    cycleFrom,
    cycleTo,
    dateFrom,
    dateTo,
    coverage,
  }) => {
    if (coverage == "Globale") {
      if (cycleFrom != 0 && cycleTo != 0) {
        let cycles = [];
        if (cycleFrom > 0 && cycleTo > 0 && cycleTo >= cycleFrom) {
          for (let i = 1; i < cycleTo + 1; i++) {
            if (i % 2 !== 0 && i >= cycleFrom) {
              // si seulement il s'agit d'un cycle impair
              cycles.push(i);
            }
          }
        }

        let optionResultsArr = [];
        let optionItemsArr = [];
        let optionObjectsArr = [];

        // select the option key
        const option_cursor =
          await db.query(aql`FOR o IN sms_questionnaire_options 
          FILTER o._key == ${optionKey} RETURN o`);
        if (option_cursor.hasNext) {
          const option = await option_cursor.next();
          for (let op = 0; op < option.optionItems.length; op++) {
            const opItm = option.optionItems[op];
            optionItemsArr.push(opItm[0]);
          } // end option items
        } else {
          return [];
        }

        for (let ov = 0; ov < optionItemsArr.length; ov++) {
          const optionValue = optionItemsArr[ov];
          for (let ixx = 0; ixx < cycles.length; ixx++) {
            // continue
            const cycle = cycles[ixx];

            // get total records
            const ttr_cursor =
              await db.query(aql`FOR d IN sms_questionnaire_data 
                FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
                FILTER CURRENT.optionKey ==  ${optionKey}
                AND CURRENT.blockKey == ${blockKey} 
                AND d.companyKey == ${companyKey}
                AND d.timeStamp >= ${dateFrom} 
                AND d.timeStamp <= ${dateTo} 
                AND d.loanCycle == ${cycle}
              ] ) RETURN d`);
            const ttr = (await ttr_cursor.all()).length;

            // the the stats
            const stats_cursor =
              await db.query(aql`FOR d IN sms_questionnaire_data 
                    FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
                    FILTER CURRENT.optionKey ==  ${optionKey}
                    AND CURRENT.blockKey == ${blockKey} 
                    AND CURRENT.optionValues[0] == ${optionValue}
                    AND d.companyKey == ${companyKey}
                    AND d.timeStamp >= ${dateFrom} 
                    AND d.timeStamp <= ${dateTo}
                    AND d.loanCycle == ${cycle}  
                  ] ) RETURN d`);

            if (stats_cursor.hasNext) {
              const stats = await stats_cursor.all();
              const resultObj = {
                optionValue: optionValue,
                cycle: cycle,
                total: ttr,
                quota: stats.length,
                percent: parseFloat(((stats.length * 100) / ttr).toFixed(2)),
              };
              // inert
              optionObjectsArr.push(resultObj);
            } else {
              const resultObj = {
                optionValue: optionValue,
                cycle: cycle,
                total: ttr,
                quota: 0,
                percent: 0,
              };
              optionObjectsArr.push(resultObj);
            }
          } // end for loop cyles

          const fObj = {
            optionValue: optionValue,
            cycles: optionObjectsArr,
          };
          optionResultsArr.push(fObj);
        } // end for optionItemsArr

        let subBlocks = [];

        for (let opv = 0; opv < optionItemsArr.length; opv++) {
          const opItm = optionItemsArr[opv];
          let option = { optionValue: opItm, cycles: [] };

          for (let sub = 0; sub < optionObjectsArr.length; sub++) {
            const el = optionObjectsArr[sub];
            if (el["optionValue"] == opItm) {
              const opSubObj = {
                cycle: el["cycle"],
                total: el["total"],
                quota: el["quota"],
                percent: el["percent"],
              };
              option.cycles.push(opSubObj);
            }
          }
          subBlocks.push(option);
        }
        // return the result
        return subBlocks;
      } else {
        // cycleFrom == 0 && cycleTo == 0 [ ALL CYCLES ]
        let optionResultsArr = [];
        let optionItemsArr = [];
        let optionObjectsArr = [];

        // select the option key
        const option_cursor =
          await db.query(aql`FOR o IN sms_questionnaire_options 
        FILTER o._key == ${optionKey} RETURN o`);
        if (option_cursor.hasNext) {
          const option = await option_cursor.next();
          for (let op = 0; op < option.optionItems.length; op++) {
            const opItm = option.optionItems[op];
            optionItemsArr.push(opItm[0]);
          } // end option items
        } else {
          return [];
        }

        for (let ov = 0; ov < optionItemsArr.length; ov++) {
          const optionValue = optionItemsArr[ov];
          // continue
          const cycle = 0;

          // get total records
          const ttr_cursor = await db.query(aql`FOR d IN sms_questionnaire_data 
              FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
              FILTER CURRENT.optionKey ==  ${optionKey}
              AND CURRENT.blockKey == ${blockKey} 
              AND d.companyKey == ${companyKey}
              AND d.timeStamp >= ${dateFrom} 
              AND d.timeStamp <= ${dateTo}  
            ] ) RETURN d`);
          const ttr = (await ttr_cursor.all()).length;

          // the the stats
          const stats_cursor =
            await db.query(aql`FOR d IN sms_questionnaire_data 
                  FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
                  FILTER CURRENT.optionKey ==  ${optionKey}
                  AND CURRENT.blockKey == ${blockKey} 
                  AND CURRENT.optionValues[0] == ${optionValue}
                  AND d.companyKey == ${companyKey}
                  AND d.timeStamp >= ${dateFrom} 
                  AND d.timeStamp <= ${dateTo} 
                ] ) RETURN d`);

          if (stats_cursor.hasNext) {
            const stats = await stats_cursor.all();
            const resultObj = {
              optionValue: optionValue,
              cycle: cycle,
              total: ttr,
              quota: stats.length,
              percent: parseFloat(((stats.length * 100) / ttr).toFixed(2)),
            };
            // inert
            optionObjectsArr.push(resultObj);
          } else {
            const resultObj = {
              optionValue: optionValue,
              cycle: cycle,
              total: ttr,
              quota: 0,
              percent: 0,
            };
            optionObjectsArr.push(resultObj);
          }

          const fObj = {
            optionValue: optionValue,
            cycles: optionObjectsArr,
          };
          optionResultsArr.push(fObj);
        } // end for optionItemsArr

        let subBlocks = [];

        for (let opv = 0; opv < optionItemsArr.length; opv++) {
          const opItm = optionItemsArr[opv];
          let option = { optionValue: opItm, cycles: [] };

          for (let sub = 0; sub < optionObjectsArr.length; sub++) {
            const el = optionObjectsArr[sub];
            if (el["optionValue"] == opItm) {
              const opSubObj = {
                cycle: el["cycle"],
                total: el["total"],
                quota: el["quota"],
                percent: el["percent"],
              };
              option.cycles.push(opSubObj);
            }
          }
          subBlocks.push(option);
        }
        // return the result
        return subBlocks;
      }
      // specific office
    } else if (coverage == "Agence") {
      if (cycleFrom != 0 && cycleTo != 0) {
        let cycles = [];
        if (cycleFrom > 0 && cycleTo > 0 && cycleTo >= cycleFrom) {
          for (let i = 1; i < cycleTo + 1; i++) {
            if (i % 2 !== 0 && i >= cycleFrom) {
              // si seulement il s'agit d'un cycle impair
              cycles.push(i);
            }
          }
        }

        let optionResultsArr = [];
        let optionItemsArr = [];
        let optionObjectsArr = [];

        // select the option key
        const option_cursor =
          await db.query(aql`FOR o IN sms_questionnaire_options 
          FILTER o._key == ${optionKey} RETURN o`);
        if (option_cursor.hasNext) {
          const option = await option_cursor.next();
          for (let op = 0; op < option.optionItems.length; op++) {
            const opItm = option.optionItems[op];
            optionItemsArr.push(opItm[0]);
          } // end option items
        } else {
          return [];
        }

        for (let ov = 0; ov < optionItemsArr.length; ov++) {
          const optionValue = optionItemsArr[ov];
          for (let ixx = 0; ixx < cycles.length; ixx++) {
            // continue
            const cycle = cycles[ixx];
            // get total records
            const ttr_cursor =
              await db.query(aql`FOR d IN sms_questionnaire_data 
                FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
                FILTER CURRENT.optionKey ==  ${optionKey}
                AND CURRENT.blockKey == ${blockKey} 
                AND d.companyKey == ${companyKey}
                AND d.timeStamp >= ${dateFrom} 
                AND d.timeStamp <= ${dateTo} 
                AND d.loanCycle == ${cycle}
                AND d.officeKey == ${officeKey}
              ] ) RETURN d`);
            const ttr = (await ttr_cursor.all()).length;

            // the the stats
            const stats_cursor =
              await db.query(aql`FOR d IN sms_questionnaire_data 
                    FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
                    FILTER CURRENT.optionKey ==  ${optionKey}
                    AND CURRENT.blockKey == ${blockKey} 
                    AND CURRENT.optionValues[0] == ${optionValue}
                    AND d.companyKey == ${companyKey}
                    AND d.timeStamp >= ${dateFrom} 
                    AND d.timeStamp <= ${dateTo}
                    AND d.loanCycle == ${cycle}
                    AND d.officeKey == ${officeKey}
                  ] ) RETURN d`);

            if (stats_cursor.hasNext) {
              const stats = await stats_cursor.all();
              const resultObj = {
                optionValue: optionValue,
                cycle: cycle,
                total: ttr,
                quota: stats.length,
                percent: parseFloat(((stats.length * 100) / ttr).toFixed(2)),
              };
              // inert
              optionObjectsArr.push(resultObj);
            } else {
              const resultObj = {
                optionValue: optionValue,
                cycle: cycle,
                total: ttr,
                quota: 0,
                percent: 0,
              };
              optionObjectsArr.push(resultObj);
            }
          } // end for loop cyles

          const fObj = {
            optionValue: optionValue,
            cycles: optionObjectsArr,
          };
          optionResultsArr.push(fObj);
        } // end for optionItemsArr

        let subBlocks = [];

        for (let opv = 0; opv < optionItemsArr.length; opv++) {
          const opItm = optionItemsArr[opv];
          let option = { optionValue: opItm, cycles: [] };

          for (let sub = 0; sub < optionObjectsArr.length; sub++) {
            const el = optionObjectsArr[sub];
            if (el["optionValue"] == opItm) {
              const opSubObj = {
                cycle: el["cycle"],
                total: el["total"],
                quota: el["quota"],
                percent: el["percent"],
              };
              option.cycles.push(opSubObj);
            }
          }
          subBlocks.push(option);
        }
        // return the result
        return subBlocks;
      } else {
        // cycleFrom == 0 && cycleTo == 0 [ ALL CYCLES ]
        let optionResultsArr = [];
        let optionItemsArr = [];
        let optionObjectsArr = [];

        // select the option key
        const option_cursor =
          await db.query(aql`FOR o IN sms_questionnaire_options 
        FILTER o._key == ${optionKey} RETURN o`);
        if (option_cursor.hasNext) {
          const option = await option_cursor.next();
          for (let op = 0; op < option.optionItems.length; op++) {
            const opItm = option.optionItems[op];
            optionItemsArr.push(opItm[0]);
          } // end option items
        } else {
          return [];
        }

        for (let ov = 0; ov < optionItemsArr.length; ov++) {
          const optionValue = optionItemsArr[ov];
          // continue
          const cycle = 0;

          // get total records
          const ttr_cursor = await db.query(aql`FOR d IN sms_questionnaire_data 
              FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
              FILTER CURRENT.optionKey ==  ${optionKey}
              AND CURRENT.blockKey == ${blockKey} 
              AND d.companyKey == ${companyKey}
              AND d.timeStamp >= ${dateFrom} 
              AND d.timeStamp <= ${dateTo} 
              AND d.officeKey == ${officeKey}
            ] ) RETURN d`);
          const ttr = (await ttr_cursor.all()).length;

          // the the stats
          const stats_cursor =
            await db.query(aql`FOR d IN sms_questionnaire_data 
                  FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
                  FILTER CURRENT.optionKey ==  ${optionKey}
                  AND CURRENT.blockKey == ${blockKey} 
                  AND CURRENT.optionValues[0] == ${optionValue}
                  AND d.companyKey == ${companyKey}
                  AND d.timeStamp >= ${dateFrom} 
                  AND d.timeStamp <= ${dateTo} 
                  AND d.officeKey == ${officeKey}
                ] ) RETURN d`);

          if (stats_cursor.hasNext) {
            const stats = await stats_cursor.all();
            const resultObj = {
              optionValue: optionValue,
              cycle: cycle,
              total: ttr,
              quota: stats.length,
              percent: parseFloat(((stats.length * 100) / ttr).toFixed(2)),
            };
            // inert
            optionObjectsArr.push(resultObj);
          } else {
            const resultObj = {
              optionValue: optionValue,
              cycle: cycle,
              total: ttr,
              quota: 0,
              percent: 0,
            };
            optionObjectsArr.push(resultObj);
          }

          const fObj = {
            optionValue: optionValue,
            cycles: optionObjectsArr,
          };
          optionResultsArr.push(fObj);
        } // end for optionItemsArr

        let subBlocks = [];

        for (let opv = 0; opv < optionItemsArr.length; opv++) {
          const opItm = optionItemsArr[opv];
          let option = { optionValue: opItm, cycles: [] };

          for (let sub = 0; sub < optionObjectsArr.length; sub++) {
            const el = optionObjectsArr[sub];
            if (el["optionValue"] == opItm) {
              const opSubObj = {
                cycle: el["cycle"],
                total: el["total"],
                quota: el["quota"],
                percent: el["percent"],
              };
              option.cycles.push(opSubObj);
            }
          }
          subBlocks.push(option);
        }
        // return the result
        return subBlocks;
      }
    }
  },

  statsByOptionKeyComplex: async ({
    blockKey,
    companyKey,
    projectKey,
    coverage,
    optionKey,
    dateFrom,
    dateTo,
    cycle,
    officeKeys,
    officeNames,
  }) => {
    if (coverage == "Globale") {
      if (cycle == 0) {
        let optionResultsArr = [];
        let optionItemsArr = [];
        let optionObjectsArr = [];

        // select the option key
        const option_cursor =
          await db.query(aql`FOR o IN sms_questionnaire_options 
          FILTER o._key == ${optionKey} RETURN o`);
        if (option_cursor.hasNext) {
          const option = await option_cursor.next();
          for (let op = 0; op < option.optionItems.length; op++) {
            const opItm = option.optionItems[op];
            optionItemsArr.push(opItm[0]);
          } // end option items
        } else {
          return [];
        }

        for (let ov = 0; ov < optionItemsArr.length; ov++) {
          const optionValue = optionItemsArr[ov];
          // get total records
          const ttr_cursor = await db.query(aql`FOR d IN sms_questionnaire_data 
                FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
                FILTER CURRENT.optionKey ==  ${optionKey}
                AND CURRENT.blockKey == ${blockKey} 
                AND d.companyKey == ${companyKey}
                AND d.timeStamp >= ${dateFrom} 
                AND d.timeStamp <= ${dateTo}  
              ] ) RETURN d`);
          const ttr = (await ttr_cursor.all()).length;

          // the the stats
          const stats_cursor =
            await db.query(aql`FOR d IN sms_questionnaire_data 
                    FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
                    FILTER CURRENT.optionKey ==  ${optionKey}
                    AND CURRENT.blockKey == ${blockKey} 
                    AND CURRENT.optionValues[0] == ${optionValue}
                    AND d.companyKey == ${companyKey}
                    AND d.timeStamp >= ${dateFrom} 
                    AND d.timeStamp <= ${dateTo}  
                  ] ) RETURN d`);

          if (stats_cursor.hasNext) {
            const stats = await stats_cursor.all();
            const resultObj = {
              optionValue: optionValue,
              cycle: cycle,
              total: ttr,
              quota: stats.length,
              percent: parseFloat(((stats.length * 100) / ttr).toFixed(2)),
              officeName: "",
              coverage: coverage,
            };
            // inert
            optionObjectsArr.push(resultObj);
          } else {
            const resultObj = {
              optionValue: optionValue,
              cycle: cycle,
              total: ttr,
              quota: 0,
              percent: 0,
              officeName: "",
              coverage: coverage,
            };
            optionObjectsArr.push(resultObj);
          }

          const fObj = {
            optionValue: optionValue,
            jeux: optionObjectsArr,
          };
          optionResultsArr.push(fObj);
        } // end for optionItemsArr

        let subBlocks = [];

        for (let opv = 0; opv < optionItemsArr.length; opv++) {
          const opItm = optionItemsArr[opv];
          let option = { optionValue: opItm, jeux: [] };

          for (let sub = 0; sub < optionObjectsArr.length; sub++) {
            const el = optionObjectsArr[sub];
            if (el["optionValue"] == opItm) {
              const opSubObj = {
                cycle: el["cycle"],
                total: el["total"],
                quota: el["quota"],
                percent: el["percent"],
                officeName: el["officeName"],
                coverage: el["coverage"],
              };
              option.jeux.push(opSubObj);
            }
          }
          subBlocks.push(option);
        }
        // return the result
        return subBlocks;
      } else {
        let optionResultsArr = [];
        let optionItemsArr = [];
        let optionObjectsArr = [];

        // select the option key
        const option_cursor =
          await db.query(aql`FOR o IN sms_questionnaire_options 
          FILTER o._key == ${optionKey} RETURN o`);
        if (option_cursor.hasNext) {
          const option = await option_cursor.next();
          for (let op = 0; op < option.optionItems.length; op++) {
            const opItm = option.optionItems[op];
            optionItemsArr.push(opItm[0]);
          } // end option items
        } else {
          return [];
        }

        for (let ov = 0; ov < optionItemsArr.length; ov++) {
          const optionValue = optionItemsArr[ov];
          // get total records
          const ttr_cursor = await db.query(aql`FOR d IN sms_questionnaire_data 
                FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
                FILTER CURRENT.optionKey ==  ${optionKey}
                AND CURRENT.blockKey == ${blockKey} 
                AND d.companyKey == ${companyKey}
                AND d.timeStamp >= ${dateFrom} 
                AND d.timeStamp <= ${dateTo}  
                AND d.loanCycle == ${cycle}
              ] ) RETURN d`);
          const ttr = (await ttr_cursor.all()).length;

          // the the stats
          const stats_cursor =
            await db.query(aql`FOR d IN sms_questionnaire_data 
                    FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
                    FILTER CURRENT.optionKey ==  ${optionKey}
                    AND CURRENT.blockKey == ${blockKey} 
                    AND CURRENT.optionValues[0] == ${optionValue}
                    AND d.companyKey == ${companyKey}
                    AND d.timeStamp >= ${dateFrom} 
                    AND d.timeStamp <= ${dateTo}  
                    AND d.loanCycle == ${cycle}
                  ] ) RETURN d`);

          if (stats_cursor.hasNext) {
            const stats = await stats_cursor.all();
            const resultObj = {
              optionValue: optionValue,
              cycle: cycle,
              total: ttr,
              quota: stats.length,
              percent: parseFloat(((stats.length * 100) / ttr).toFixed(2)),
              officeName: "",
              coverage: coverage,
            };
            // inert
            optionObjectsArr.push(resultObj);
          } else {
            const resultObj = {
              optionValue: optionValue,
              cycle: cycle,
              total: ttr,
              quota: 0,
              percent: 0,
              officeName: "",
              coverage: coverage,
            };
            optionObjectsArr.push(resultObj);
          }

          const fObj = {
            optionValue: optionValue,
            jeux: optionObjectsArr,
          };
          optionResultsArr.push(fObj);
        } // end for optionItemsArr

        let subBlocks = [];

        for (let opv = 0; opv < optionItemsArr.length; opv++) {
          const opItm = optionItemsArr[opv];
          let option = { optionValue: opItm, jeux: [] };

          for (let sub = 0; sub < optionObjectsArr.length; sub++) {
            const el = optionObjectsArr[sub];
            if (el["optionValue"] == opItm) {
              const opSubObj = {
                cycle: el["cycle"],
                total: el["total"],
                quota: el["quota"],
                percent: el["percent"],
                officeName: el["officeName"],
                coverage: el["coverage"],
              };
              option.jeux.push(opSubObj);
            }
          }
          subBlocks.push(option);
        }
        // return the result
        return subBlocks;
      }
      // specific office
    } else if (coverage == "Agence") {
      if (cycle != 0) {
        let optionResultsArr = [];
        let optionItemsArr = [];
        let optionObjectsArr = [];

        // select the option key
        const option_cursor =
          await db.query(aql`FOR o IN sms_questionnaire_options 
          FILTER o._key == ${optionKey} RETURN o`);
        if (option_cursor.hasNext) {
          const option = await option_cursor.next();
          for (let op = 0; op < option.optionItems.length; op++) {
            const opItm = option.optionItems[op];
            optionItemsArr.push(opItm[0]);
          } // end option items
        } else {
          return [];
        }

        for (let ov = 0; ov < optionItemsArr.length; ov++) {
          const optionValue = optionItemsArr[ov];
          for (let offc = 0; offc < officeKeys.length; offc++) {
            // continue
            const officeKey = officeKeys[offc];
            const officeName = officeNames[offc];
            // get total records
            const ttr_cursor =
              await db.query(aql`FOR d IN sms_questionnaire_data 
                FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
                FILTER CURRENT.optionKey ==  ${optionKey}
                AND CURRENT.blockKey == ${blockKey} 
                AND d.companyKey == ${companyKey}
                AND d.timeStamp >= ${dateFrom} 
                AND d.timeStamp <= ${dateTo} 
                AND d.loanCycle == ${cycle}
                AND d.officeKey == ${officeKey}
              ] ) RETURN d`);
            const ttr = (await ttr_cursor.all()).length;

            // the the stats
            const stats_cursor =
              await db.query(aql`FOR d IN sms_questionnaire_data 
                    FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
                    FILTER CURRENT.optionKey ==  ${optionKey}
                    AND CURRENT.blockKey == ${blockKey} 
                    AND CURRENT.optionValues[0] == ${optionValue}
                    AND d.companyKey == ${companyKey}
                    AND d.timeStamp >= ${dateFrom} 
                    AND d.timeStamp <= ${dateTo}
                    AND d.loanCycle == ${cycle}
                    AND d.officeKey == ${officeKey}
                  ] ) RETURN d`);

            if (stats_cursor.hasNext) {
              const stats = await stats_cursor.all();
              const resultObj = {
                optionValue: optionValue,
                cycle: cycle,
                total: ttr,
                quota: stats.length,
                percent: parseFloat(((stats.length * 100) / ttr).toFixed(2)),
                officeName: officeName,
                coverage: coverage,
              };
              // inert
              optionObjectsArr.push(resultObj);
            } else {
              const resultObj = {
                optionValue: optionValue,
                cycle: cycle,
                total: ttr,
                quota: 0,
                percent: 0,
                officeName: officeName,
                coverage: coverage,
              };
              optionObjectsArr.push(resultObj);
            }
          } // end for loop cyles

          const fObj = {
            optionValue: optionValue,
            jeux: optionObjectsArr,
          };
          optionResultsArr.push(fObj);
        } // end for optionItemsArr

        let subBlocks = [];

        for (let opv = 0; opv < optionItemsArr.length; opv++) {
          const opItm = optionItemsArr[opv];
          let option = { optionValue: opItm, jeux: [] };

          for (let sub = 0; sub < optionObjectsArr.length; sub++) {
            const el = optionObjectsArr[sub];
            if (el["optionValue"] == opItm) {
              const opSubObj = {
                cycle: el["cycle"],
                total: el["total"],
                quota: el["quota"],
                percent: el["percent"],
                officeName: el["officeName"], // get from params
                coverage: el["coverage"],
              };
              option.jeux.push(opSubObj);
            }
          }
          subBlocks.push(option);
        }
        // return the result
        return subBlocks;
      } else {
        // cycle == 0, all cycles
        let optionResultsArr = [];
        let optionItemsArr = [];
        let optionObjectsArr = [];

        // select the option key
        const option_cursor =
          await db.query(aql`FOR o IN sms_questionnaire_options 
          FILTER o._key == ${optionKey} RETURN o`);
        if (option_cursor.hasNext) {
          const option = await option_cursor.next();
          for (let op = 0; op < option.optionItems.length; op++) {
            const opItm = option.optionItems[op];
            optionItemsArr.push(opItm[0]);
          } // end option items
        } else {
          return [];
        }

        for (let ov = 0; ov < optionItemsArr.length; ov++) {
          const optionValue = optionItemsArr[ov];
          for (let offc = 0; offc < officeKeys.length; offc++) {
            // continue
            const officeKey = officeKeys[offc];
            const officeName = officeNames[offc];
            // get total records
            const ttr_cursor =
              await db.query(aql`FOR d IN sms_questionnaire_data 
                FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
                FILTER CURRENT.optionKey ==  ${optionKey}
                AND CURRENT.blockKey == ${blockKey} 
                AND d.companyKey == ${companyKey}
                AND d.timeStamp >= ${dateFrom} 
                AND d.timeStamp <= ${dateTo}  
                AND d.officeKey == ${officeKey}
              ] ) RETURN d`);
            const ttr = (await ttr_cursor.all()).length;

            // the the stats
            const stats_cursor =
              await db.query(aql`FOR d IN sms_questionnaire_data 
                    FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
                    FILTER CURRENT.optionKey ==  ${optionKey}
                    AND CURRENT.blockKey == ${blockKey} 
                    AND CURRENT.optionValues[0] == ${optionValue}
                    AND d.companyKey == ${companyKey}
                    AND d.timeStamp >= ${dateFrom} 
                    AND d.timeStamp <= ${dateTo} 
                    AND d.officeKey == ${officeKey}
                  ] ) RETURN d`);

            if (stats_cursor.hasNext) {
              const stats = await stats_cursor.all();
              const resultObj = {
                optionValue: optionValue,
                cycle: cycle,
                total: ttr,
                quota: stats.length,
                percent: parseFloat(((stats.length * 100) / ttr).toFixed(2)),
                officeName: officeName,
                coverage: coverage,
              };
              // inert
              optionObjectsArr.push(resultObj);
            } else {
              const resultObj = {
                optionValue: optionValue,
                cycle: cycle,
                total: ttr,
                quota: 0,
                percent: 0,
                officeName: officeName,
                coverage: coverage,
              };
              optionObjectsArr.push(resultObj);
            }
          } // end for loop cyles

          const fObj = {
            optionValue: optionValue,
            jeux: optionObjectsArr,
          };
          optionResultsArr.push(fObj);
        } // end for optionItemsArr

        let subBlocks = [];

        for (let opv = 0; opv < optionItemsArr.length; opv++) {
          const opItm = optionItemsArr[opv];
          let option = { optionValue: opItm, jeux: [] };

          for (let sub = 0; sub < optionObjectsArr.length; sub++) {
            const el = optionObjectsArr[sub];
            if (el["optionValue"] == opItm) {
              const opSubObj = {
                cycle: el["cycle"],
                total: el["total"],
                quota: el["quota"],
                percent: el["percent"],
                officeName: el["officeName"], // get from params
                coverage: el["coverage"],
              };
              option.jeux.push(opSubObj);
            }
          }
          subBlocks.push(option);
        }
        // return the result
        return subBlocks;
      }
    }
  },

  statsByOptionKeyClient: async ({
    blockKey,
    companyKey,
    projectKey,
    optionKey,
    codeSig,
    cycleFrom,
    cycleTo,
  }) => {
    // select the client
    const client_cursor = await db.query(aql`FOR c IN client_perfect 
    FILTER c.code == ${codeSig} RETURN c`);
    if (client_cursor.hasNext) {
      const client = await client_cursor.next();
      // client found, continue
      if (cycleFrom != 0 && cycleTo != 0) {
        let cycles = [];
        if (cycleFrom > 0 && cycleTo > 0 && cycleTo >= cycleFrom) {
          for (let i = 1; i < cycleTo + 1; i++) {
            if (i % 2 !== 0 && i >= cycleFrom) {
              // si seulement il s'agit d'un cycle impair
              cycles.push(i);
            }
          }
        }

        let optionResultsArr = [];
        let optionItemsArr = [];
        let optionObjectsArr = [];
        let datesArry = [];

        // select the option key
        const option_cursor =
          await db.query(aql`FOR o IN sms_questionnaire_options 
          FILTER o._key == ${optionKey} RETURN o`);
        if (option_cursor.hasNext) {
          const option = await option_cursor.next();
          for (let op = 0; op < option.optionItems.length; op++) {
            const opItm = option.optionItems[op];
            optionItemsArr.push(opItm[0]);
          } // end option items
        } else {
          return [];
        }

        for (let ov = 0; ov < optionItemsArr.length; ov++) {
          const optionValue = optionItemsArr[ov];
          for (let ixx = 0; ixx < cycles.length; ixx++) {
            // continue
            const cycle = cycles[ixx];

            // get total records
            const ttr_cursor =
              await db.query(aql`FOR d IN sms_questionnaire_data 
                FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
                FILTER CURRENT.optionKey ==  ${optionKey}
                AND CURRENT.blockKey == ${blockKey} 
                AND d.companyKey == ${companyKey}
                AND d.loanCycle == ${cycle} 
                AND d.clientKey == ${client._key}
              ] ) RETURN d`);
            const ttr = (await ttr_cursor.all()).length;

            // the the stats
            const stats_cursor =
              await db.query(aql`FOR d IN sms_questionnaire_data 
                    FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
                    FILTER CURRENT.optionKey ==  ${optionKey}
                    AND CURRENT.blockKey == ${blockKey} 
                    AND CURRENT.optionValues[0] == ${optionValue}
                    AND d.companyKey == ${companyKey}
                    AND d.loanCycle == ${cycle}  
                    AND d.clientKey == ${client._key}
                  ] ) RETURN d`);

            if (stats_cursor.hasNext) {
              const stats = await stats_cursor.all();
              // next
              const dateCursor_cursor =
                await db.query(aql`FOR d IN sms_questionnaire_data 
                  FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
                  FILTER CURRENT.optionKey ==  ${optionKey}
                  AND CURRENT.blockKey == ${blockKey} 
                  AND CURRENT.optionValues[0] == ${optionValue}
                  AND d.companyKey == ${companyKey}
                  AND d.loanCycle == ${cycle}  
                  AND d.clientKey == ${client._key}
                ] ) RETURN d`);
              const dateCursor = await dateCursor_cursor.next();
              // build the object
              const resultObj = {
                optionValue: optionValue,
                cycle: cycle,
                total: ttr,
                quota: stats.length,
                percent: parseFloat(((stats.length * 100) / ttr).toFixed(2)),
                fullName: client.fullName,
                codeSig: codeSig,
                date: dateCursor.dataStamp,
              };
              // inert
              optionObjectsArr.push(resultObj);
              datesArry.push(55);
            } else {
              const resultObj = {
                optionValue: optionValue,
                cycle: cycle,
                total: ttr,
                quota: 0,
                percent: 0,
                fullName: client.fullName,
                codeSig: codeSig,
                date: 0,
              };
              optionObjectsArr.push(resultObj);
            }
          } // end for loop cyles

          const fObj = {
            optionValue: optionValue,
            cycles: optionObjectsArr,
          };
          optionResultsArr.push(fObj);
        } // end for optionItemsArr

        let subBlocks = [];

        for (let opv = 0; opv < optionItemsArr.length; opv++) {
          const opItm = optionItemsArr[opv];
          let option = {
            optionValue: opItm,
            cycles: [],
          };

          for (let sub = 0; sub < optionObjectsArr.length; sub++) {
            const el = optionObjectsArr[sub];
            if (el["optionValue"] == opItm) {
              const opSubObj = {
                cycle: el["cycle"],
                total: el["total"],
                quota: el["quota"],
                percent: el["percent"],
                fullName: el["fullName"],
                codeSig: el["codeSig"],
                date: el["date"],
              };
              option.cycles.push(opSubObj);
            }
          }
          subBlocks.push(option);
        }
        // return the result
        return subBlocks;
      } else {
        // cyel == 0 [ ALL ]
        let cycles = [];
        // select the client last cycle
        const latest_cursor =
          await db.query(aql`FOR d IN sms_questionnaire_data 
        FILTER d.clientKey == ${client._key} SORT 
        d.loanCycle DESC LIMIT 1 RETURN d`);
        if (latest_cursor.hasNext) {
          const latest = await latest_cursor.next();

          if (latest.loanCycle > 1) {
            for (let i = 1; i < latest.loanCycle + 1; i++) {
              if (i % 2 !== 0 && i >= 1) {
                // si seulement il s'agit d'un cycle impair
                cycles.push(i);
              }
            }
          } else {
            cycles.push(1);
          }

          let optionResultsArr = [];
          let optionItemsArr = [];
          let optionObjectsArr = [];

          // select the option key
          const option_cursor =
            await db.query(aql`FOR o IN sms_questionnaire_options 
            FILTER o._key == ${optionKey} RETURN o`);
          if (option_cursor.hasNext) {
            const option = await option_cursor.next();
            for (let op = 0; op < option.optionItems.length; op++) {
              const opItm = option.optionItems[op];
              optionItemsArr.push(opItm[0]);
            } // end option items
          } else {
            return [];
          }

          for (let ov = 0; ov < optionItemsArr.length; ov++) {
            const optionValue = optionItemsArr[ov];
            for (let ixx = 0; ixx < cycles.length; ixx++) {
              // continue
              const cycle = cycles[ixx];

              // get total records
              const ttr_cursor =
                await db.query(aql`FOR d IN sms_questionnaire_data 
                  FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
                  FILTER CURRENT.optionKey ==  ${optionKey}
                  AND CURRENT.blockKey == ${blockKey} 
                  AND d.companyKey == ${companyKey}
                  AND d.loanCycle == ${cycle} 
                  AND d.clientKey == ${client._key}
                ] ) RETURN d`);
              const ttr = (await ttr_cursor.all()).length;

              // the the stats
              const stats_cursor =
                await db.query(aql`FOR d IN sms_questionnaire_data 
                      FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
                      FILTER CURRENT.optionKey ==  ${optionKey}
                      AND CURRENT.blockKey == ${blockKey} 
                      AND CURRENT.optionValues[0] == ${optionValue}
                      AND d.companyKey == ${companyKey}
                      AND d.loanCycle == ${cycle}  
                      AND d.clientKey == ${client._key}
                    ] ) RETURN d`);

              if (stats_cursor.hasNext) {
                const stats = await stats_cursor.all();
                // next
                const dateCursor_cursor =
                  await db.query(aql`FOR d IN sms_questionnaire_data 
                      FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
                      FILTER CURRENT.optionKey ==  ${optionKey}
                      AND CURRENT.blockKey == ${blockKey} 
                      AND CURRENT.optionValues[0] == ${optionValue}
                      AND d.companyKey == ${companyKey}
                      AND d.loanCycle == ${cycle}  
                      AND d.clientKey == ${client._key}
                    ] ) RETURN d`);
                const dateCursor = await dateCursor_cursor.next();
                // build the object
                const resultObj = {
                  optionValue: optionValue,
                  cycle: cycle,
                  total: ttr,
                  quota: stats.length,
                  percent: parseFloat(((stats.length * 100) / ttr).toFixed(2)),
                  fullName: client.fullName,
                  codeSig: codeSig,
                  date: dateCursor.dataStamp,
                };
                // inert
                optionObjectsArr.push(resultObj);
              } else {
                const resultObj = {
                  optionValue: optionValue,
                  cycle: cycle,
                  total: ttr,
                  quota: 0,
                  percent: 0,
                  fullName: client.fullName,
                  codeSig: codeSig,
                  date: 0,
                };
                optionObjectsArr.push(resultObj);
              }
            } // end for loop cyles

            const fObj = {
              optionValue: optionValue,
              cycles: optionObjectsArr,
            };
            optionResultsArr.push(fObj);
          } // end for optionItemsArr

          let subBlocks = [];

          for (let opv = 0; opv < optionItemsArr.length; opv++) {
            const opItm = optionItemsArr[opv];
            let option = { optionValue: opItm, cycles: [] };

            for (let sub = 0; sub < optionObjectsArr.length; sub++) {
              const el = optionObjectsArr[sub];
              if (el["optionValue"] == opItm) {
                const opSubObj = {
                  cycle: el["cycle"],
                  total: el["total"],
                  quota: el["quota"],
                  percent: el["percent"],
                  fullName: el["fullName"],
                  codeSig: el["codeSig"],
                  date: el["date"],
                };
                option.cycles.push(opSubObj);
              }
            }
            subBlocks.push(option);
          }
          // return the result
          return subBlocks;
        } else {
          // no previous vul found
          return [];
        }
      }
    } else {
      throw new Error(`Aucun bénéficiaire trouvé avec le code SIG ${codeSig}`);
    }
  },

  statsGroupCheck: async ({
    companyKey,
    projectKey,
    officeKey,
    coverage,
    cycles,
    dateFrom,
    dateTo,
  }) => {
    // select
    let clientKeysATotal = 0;
    let clientKeysATotalArr = [];

    let clientKeysBTotal = 0;
    let clientKeysBTotalArr = [];

    let clientKeysCTotal = 0;
    let clientKeysCTotalArr = [];

    let clientKeysDTotal = 0;
    let clientKeysDArr = [];

    let clientKeysETotal = 0;
    let clientKeysEArr = [];

    let totalLast = 0;

    if (coverage == "Globale") {
      const cycleA = cycles[0] > 0 ? cycles[0] : 0;
      const cycleB = cycles[1] > 0 ? cycles[1] : 0;
      const cycleC = cycles[2] > 0 ? cycles[2] : 0;
      const cycleD = cycles[3] > 0 ? cycles[3] : 0;
      const cycleE = cycles[4] > 0 ? cycles[4] : 0;

      // select cycle A
      if (cycleA > 0) {
        const vulCyclesA_cursor =
          await db.query(aql`FOR d IN sms_questionnaire_data 
          FILTER d.status == 'OK' 
          AND d.companyKey == ${companyKey}
          AND d.timeStamp >= ${dateFrom} 
          AND d.timeStamp <= ${dateTo} 
          AND d.loanCycle == ${cycleA} RETURN d`);
        if (vulCyclesA_cursor.hasNext) {
          const vulCyclesA = await vulCyclesA_cursor.all();
          // loop
          for (let ic = 0; ic < vulCyclesA.length; ic++) {
            const clt = vulCyclesA[ic];
            clientKeysATotalArr.push(clt.clientKey);
          }
          // total cycle A
          clientKeysATotal = vulCyclesA.length;
          totalLast = vulCyclesA.length;
        } else {
          totalLast = 0;
        }
      }

      // select cycle B
      if (cycleB > 0) {
        const vulCyclesB_cursor =
          await db.query(aql`FOR d IN sms_questionnaire_data 
          FILTER d.status == 'OK' 
          AND d.companyKey == ${companyKey}
          AND d.timeStamp >= ${dateFrom} 
          AND d.timeStamp <= ${dateTo} 
          AND d.loanCycle == ${cycleB} 
          AND d.clientKey IN ${clientKeysATotalArr} RETURN d`);
        if (vulCyclesB_cursor.hasNext) {
          const vulCyclesB = await vulCyclesB_cursor.all();
          // loop
          for (let ic = 0; ic < vulCyclesB.length; ic++) {
            const clt = vulCyclesB[ic];
            clientKeysBTotalArr.push(clt.clientKey);
          }
          // total cycle B
          clientKeysBTotal = vulCyclesB.length;
          totalLast = vulCyclesB.length;
        } else {
          totalLast = 0;
        }
      }

      // select cycle C
      if (cycleC > 0) {
        const vulCyclesC_cursor =
          await db.query(aql`FOR d IN sms_questionnaire_data 
          FILTER d.status == 'OK' 
          AND d.companyKey == ${companyKey}
          AND d.timeStamp >= ${dateFrom} 
          AND d.timeStamp <= ${dateTo} 
          AND d.loanCycle == ${cycleC} 
          AND d.clientKey IN ${clientKeysBTotalArr} RETURN d`);
        if (vulCyclesC_cursor.hasNext) {
          const vulCyclesC = await vulCyclesC_cursor.all();
          // loop
          for (let ic = 0; ic < vulCyclesC.length; ic++) {
            const clt = vulCyclesC[ic];
            clientKeysCTotalArr.push(clt.clientKey);
          }
          // total cycle C
          clientKeysCTotal = vulCyclesC.length;
          totalLast = vulCyclesC.length;
        } else {
          totalLast = 0;
        }
      }

      // select cycle D
      if (cycleD > 0) {
        const vulCyclesD_cursor =
          await db.query(aql`FOR d IN sms_questionnaire_data 
          FILTER d.status == 'OK' 
          AND d.companyKey == ${companyKey}
          AND d.timeStamp >= ${dateFrom} 
          AND d.timeStamp <= ${dateTo} 
          AND d.loanCycle == ${cycleD} 
          AND d.clientKey IN ${clientKeysCTotalArr} RETURN d`);
        if (vulCyclesD_cursor.hasNext) {
          const vulCyclesD = await vulCyclesD_cursor.all();
          // loop
          for (let ic = 0; ic < vulCyclesD.length; ic++) {
            const clt = vulCyclesD[ic];
            clientKeysDArr.push(clt.clientKey);
          }
          // total cycle D
          clientKeysDTotal = vulCyclesD.length;
          totalLast = vulCyclesD.length;
        } else {
          totalLast = 0;
        }
      } // end cycleD

      // select cycle E
      if (cycleE > 0) {
        const vulCyclesE_cursor =
          await db.query(aql`FOR d IN sms_questionnaire_data 
          FILTER d.status == 'OK' 
          AND d.companyKey == ${companyKey}
          AND d.timeStamp >= ${dateFrom} 
          AND d.timeStamp <= ${dateTo} 
          AND d.loanCycle == ${cycleE} 
          AND d.clientKey IN ${clientKeysDArr} RETURN d`);
        if (vulCyclesE_cursor.hasNext) {
          const vulCyclesE = await vulCyclesE_cursor.all();
          // loop
          for (let ic = 0; ic < vulCyclesE.length; ic++) {
            const clt = vulCyclesE[ic];
            clientKeysEArr.push(clt.clientKey);
          }
          // total cycle E
          clientKeysETotal = vulCyclesE.length;
          totalLast = vulCyclesE.length;
        } else {
          totalLast = 0;
        }
      } // end cycleE

      const obj = {
        cycles: cycles,
        totalLast: totalLast,
        clientKeysATotal: clientKeysATotal,
        clientKeysBTotal: clientKeysBTotal,
        clientKeysCTotal: clientKeysCTotal,
        clientKeysDTotal: clientKeysDTotal,
        clientKeysETotal: clientKeysETotal,
      };
      return obj;
    } else if (coverage == "Agence") {
      const cycleA = cycles[0] > 0 ? cycles[0] : 0;
      const cycleB = cycles[1] > 0 ? cycles[1] : 0;
      const cycleC = cycles[2] > 0 ? cycles[2] : 0;
      const cycleD = cycles[3] > 0 ? cycles[3] : 0;
      const cycleE = cycles[4] > 0 ? cycles[4] : 0;

      // select cycle A
      if (cycleA > 0) {
        const vulCyclesA_cursor =
          await db.query(aql`FOR d IN sms_questionnaire_data 
          FILTER d.status == 'OK' 
          AND d.companyKey == ${companyKey}
          AND d.officeKey == ${officeKey}
          AND d.timeStamp >= ${dateFrom} 
          AND d.timeStamp <= ${dateTo} 
          AND d.loanCycle == ${cycleA} RETURN d`);
        if (vulCyclesA_cursor.hasNext) {
          const vulCyclesA = await vulCyclesA_cursor.all();
          // loop
          for (let ic = 0; ic < vulCyclesA.length; ic++) {
            const clt = vulCyclesA[ic];
            clientKeysATotalArr.push(clt.clientKey);
          }
          // total cycle A
          clientKeysATotal = vulCyclesA.length;
          totalLast = vulCyclesA.length;
        } else {
          totalLast = 0;
        }
      }

      // select cycle B
      if (cycleB > 0) {
        const vulCyclesB_cursor =
          await db.query(aql`FOR d IN sms_questionnaire_data 
          FILTER d.status == 'OK' 
          AND d.companyKey == ${companyKey}
          AND d.officeKey == ${officeKey}
          AND d.timeStamp >= ${dateFrom} 
          AND d.timeStamp <= ${dateTo} 
          AND d.loanCycle == ${cycleB} 
          AND d.clientKey IN ${clientKeysATotalArr} RETURN d`);
        if (vulCyclesB_cursor.hasNext) {
          const vulCyclesB = await vulCyclesB_cursor.all();
          // loop
          for (let ic = 0; ic < vulCyclesB.length; ic++) {
            const clt = vulCyclesB[ic];
            clientKeysBTotalArr.push(clt.clientKey);
          }
          // total cycle B
          clientKeysBTotal = vulCyclesB.length;
          totalLast = vulCyclesB.length;
        } else {
          totalLast = 0;
        }
      }

      // select cycle C
      if (cycleC > 0) {
        const vulCyclesC_cursor =
          await db.query(aql`FOR d IN sms_questionnaire_data 
          FILTER d.status == 'OK' 
          AND d.companyKey == ${companyKey}
          AND d.officeKey == ${officeKey}
          AND d.timeStamp >= ${dateFrom} 
          AND d.timeStamp <= ${dateTo} 
          AND d.loanCycle == ${cycleC} 
          AND d.clientKey IN ${clientKeysBTotalArr} RETURN d`);
        if (vulCyclesC_cursor.hasNext) {
          const vulCyclesC = await vulCyclesC_cursor.all();
          // loop
          for (let ic = 0; ic < vulCyclesC.length; ic++) {
            const clt = vulCyclesC[ic];
            clientKeysCTotalArr.push(clt.clientKey);
          }
          // total cycle C
          clientKeysCTotal = vulCyclesC.length;
          totalLast = vulCyclesC.length;
        } else {
          totalLast = 0;
        }
      }

      // select cycle D
      if (cycleD > 0) {
        const vulCyclesD_cursor =
          await db.query(aql`FOR d IN sms_questionnaire_data 
          FILTER d.status == 'OK' 
          AND d.companyKey == ${companyKey}
          AND d.officeKey == ${officeKey}
          AND d.timeStamp >= ${dateFrom} 
          AND d.timeStamp <= ${dateTo} 
          AND d.loanCycle == ${cycleD} 
          AND d.clientKey IN ${clientKeysCTotalArr} RETURN d`);
        if (vulCyclesD_cursor.hasNext) {
          const vulCyclesD = await vulCyclesD_cursor.all();
          // loop
          for (let ic = 0; ic < vulCyclesD.length; ic++) {
            const clt = vulCyclesD[ic];
            clientKeysDArr.push(clt.clientKey);
          }
          // total cycle D
          clientKeysDTotal = vulCyclesD.length;
          totalLast = vulCyclesD.length;
        } else {
          totalLast = 0;
        }
      } // end cycleD

      // select cycle E
      if (cycleE > 0) {
        const vulCyclesE_cursor =
          await db.query(aql`FOR d IN sms_questionnaire_data 
          FILTER d.status == 'OK' 
          AND d.companyKey == ${companyKey}
          AND d.officeKey == ${officeKey}
          AND d.timeStamp >= ${dateFrom} 
          AND d.timeStamp <= ${dateTo} 
          AND d.loanCycle == ${cycleE} 
          AND d.clientKey IN ${clientKeysDArr} RETURN d`);
        if (vulCyclesE_cursor.hasNext) {
          const vulCyclesE = await vulCyclesE_cursor.all();
          // loop
          for (let ic = 0; ic < vulCyclesE.length; ic++) {
            const clt = vulCyclesE[ic];
            clientKeysEArr.push(clt.clientKey);
          }
          // total cycle E
          clientKeysETotal = vulCyclesE.length;
          totalLast = vulCyclesE.length;
        } else {
          totalLast = 0;
        }
      } // end cycleE

      const obj = {
        cycles: cycles,
        totalLast: totalLast,
        clientKeysATotal: clientKeysATotal,
        clientKeysBTotal: clientKeysBTotal,
        clientKeysCTotal: clientKeysCTotal,
        clientKeysDTotal: clientKeysDTotal,
        clientKeysETotal: clientKeysETotal,
      };
      return obj;
    }
  },

  statsByOptionKeyGroup: async ({
    blockKey,
    companyKey,
    officeKey,
    projectKey,
    optionKey,
    cycles,
    dateFrom,
    dateTo,
    coverage,
  }) => {
    // select
    let clientKeysAArr = [];
    let clientKeysBArr = [];
    let clientKeysCArr = [];
    let clientKeysDArr = [];
    let clientKeysEArr = [];

    let optionResultsArr = [];
    let optionItemsArr = [];
    let optionObjectsArr = [];

    // select the option key
    const option_cursor = await db.query(aql`FOR o IN sms_questionnaire_options 
      FILTER o._key == ${optionKey} RETURN o`);
    if (option_cursor.hasNext) {
      const option = await option_cursor.next();
      for (let op = 0; op < option.optionItems.length; op++) {
        const opItm = option.optionItems[op];
        optionItemsArr.push(opItm[0]);
      } // end option items
    } else {
      return [];
    }

    if (coverage == "Globale") {
      const cycleA = cycles[0] > 0 ? cycles[0] : 0;
      const cycleB = cycles[1] > 0 ? cycles[1] : 0;
      const cycleC = cycles[2] > 0 ? cycles[2] : 0;
      const cycleD = cycles[3] > 0 ? cycles[3] : 0;
      const cycleE = cycles[4] > 0 ? cycles[4] : 0;

      // select cycle A
      if (cycleA > 0) {
        const vulCyclesA_cursor =
          await db.query(aql`FOR d IN sms_questionnaire_data 
          FILTER d.status == 'OK' 
          AND d.companyKey == ${companyKey}
          AND d.timeStamp >= ${dateFrom} 
          AND d.timeStamp <= ${dateTo} 
          AND d.loanCycle == ${cycleA} RETURN d`);
        if (vulCyclesA_cursor.hasNext) {
          const vulCyclesA = await vulCyclesA_cursor.all();
          // loop
          for (let ic = 0; ic < vulCyclesA.length; ic++) {
            const clt = vulCyclesA[ic];
            clientKeysAArr.push(clt.clientKey);
          }
          ///
          for (let ov = 0; ov < optionItemsArr.length; ov++) {
            const optionValue = optionItemsArr[ov];
            // get total records
            const ttr_cursor =
              await db.query(aql`FOR d IN sms_questionnaire_data 
                  FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
                  FILTER CURRENT.optionKey ==  ${optionKey}
                  AND CURRENT.blockKey == ${blockKey} 
                  AND d.companyKey == ${companyKey}
                  AND d.timeStamp >= ${dateFrom} 
                  AND d.timeStamp <= ${dateTo} 
                  AND d.loanCycle == ${cycleA}
                ] ) RETURN d`);
            const ttr = (await ttr_cursor.all()).length;

            // the the stats
            const stats_cursor =
              await db.query(aql`FOR d IN sms_questionnaire_data 
              FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
              FILTER CURRENT.optionKey ==  ${optionKey}
              AND CURRENT.blockKey == ${blockKey} 
              AND CURRENT.optionValues[0] == ${optionValue}
              AND d.companyKey == ${companyKey}
              AND d.timeStamp >= ${dateFrom} 
              AND d.timeStamp <= ${dateTo}
              AND d.loanCycle == ${cycleA}  
            ] ) RETURN d`);

            if (stats_cursor.hasNext) {
              const stats = await stats_cursor.all();
              const resultObj = {
                optionValue: optionValue,
                cycle: cycleA,
                total: ttr,
                quota: stats.length,
                percent: parseFloat(((stats.length * 100) / ttr).toFixed(2)),
              };
              // inert
              optionObjectsArr.push(resultObj);
            } else {
              const resultObj = {
                optionValue: optionValue,
                cycle: cycleA,
                total: ttr,
                quota: 0,
                percent: 0,
              };
              optionObjectsArr.push(resultObj);
            }

            const fObj = {
              optionValue: optionValue,
              cycles: optionObjectsArr,
            };
            optionResultsArr.push(fObj);
          } // end for optionItemsArr
        }
      } // end cycleA

      // select cycle B
      if (cycleB > 0) {
        const vulCyclesB_cursor =
          await db.query(aql`FOR d IN sms_questionnaire_data 
          FILTER d.status == 'OK' 
          AND d.companyKey == ${companyKey}
          AND d.timeStamp >= ${dateFrom} 
          AND d.timeStamp <= ${dateTo} 
          AND d.loanCycle == ${cycleB} 
          AND d.clientKey IN ${clientKeysAArr} RETURN d`);
        if (vulCyclesB_cursor.hasNext) {
          const vulCyclesB = await vulCyclesB_cursor.all();
          // loop
          for (let ic = 0; ic < vulCyclesB.length; ic++) {
            const clt = vulCyclesB[ic];
            clientKeysBArr.push(clt.clientKey);
          }
          ///
          for (let ov = 0; ov < optionItemsArr.length; ov++) {
            const optionValue = optionItemsArr[ov];
            // get total records
            const ttr_cursor =
              await db.query(aql`FOR d IN sms_questionnaire_data 
                  FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
                  FILTER CURRENT.optionKey ==  ${optionKey}
                  AND CURRENT.blockKey == ${blockKey} 
                  AND d.companyKey == ${companyKey}
                  AND d.timeStamp >= ${dateFrom} 
                  AND d.timeStamp <= ${dateTo} 
                  AND d.loanCycle == ${cycleB} 
                  AND d.clientKey IN ${clientKeysAArr}
                ] ) RETURN d`);
            const ttr = (await ttr_cursor.all()).length;

            // the the stats
            const stats_cursor =
              await db.query(aql`FOR d IN sms_questionnaire_data 
              FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
              FILTER CURRENT.optionKey ==  ${optionKey}
              AND CURRENT.blockKey == ${blockKey} 
              AND CURRENT.optionValues[0] == ${optionValue}
              AND d.companyKey == ${companyKey}
              AND d.timeStamp >= ${dateFrom} 
              AND d.timeStamp <= ${dateTo}
              AND d.loanCycle == ${cycleB} 
              AND d.clientKey IN ${clientKeysAArr}  
            ] ) RETURN d`);

            if (stats_cursor.hasNext) {
              const stats = await stats_cursor.all();
              const resultObj = {
                optionValue: optionValue,
                cycle: cycleB,
                total: ttr,
                quota: stats.length,
                percent: parseFloat(((stats.length * 100) / ttr).toFixed(2)),
              };
              // inert
              optionObjectsArr.push(resultObj);
            } else {
              const resultObj = {
                optionValue: optionValue,
                cycle: cycleB,
                total: ttr,
                quota: 0,
                percent: 0,
              };
              optionObjectsArr.push(resultObj);
            }

            const fObj = {
              optionValue: optionValue,
              cycles: optionObjectsArr,
            };
            optionResultsArr.push(fObj);
          } // end for optionItemsArr
        }
      } // end cycle B

      // select cycle C
      if (cycleC > 0) {
        const vulCyclesC_cursor =
          await db.query(aql`FOR d IN sms_questionnaire_data 
          FILTER d.status == 'OK' 
          AND d.companyKey == ${companyKey}
          AND d.timeStamp >= ${dateFrom} 
          AND d.timeStamp <= ${dateTo} 
          AND d.loanCycle == ${cycleC} 
          AND d.clientKey IN ${clientKeysBArr} RETURN d`);
        if (vulCyclesC_cursor.hasNext) {
          const vulCyclesC = await vulCyclesC_cursor.all();
          // loop
          for (let ic = 0; ic < vulCyclesC.length; ic++) {
            const clt = vulCyclesC[ic];
            clientKeysCArr.push(clt.clientKey);
          }
          ///
          for (let ov = 0; ov < optionItemsArr.length; ov++) {
            const optionValue = optionItemsArr[ov];
            // get total records
            const ttr_cursor =
              await db.query(aql`FOR d IN sms_questionnaire_data 
                  FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
                  FILTER CURRENT.optionKey ==  ${optionKey}
                  AND CURRENT.blockKey == ${blockKey} 
                  AND d.companyKey == ${companyKey}
                  AND d.timeStamp >= ${dateFrom} 
                  AND d.timeStamp <= ${dateTo} 
                  AND d.loanCycle == ${cycleC} 
                  AND d.clientKey IN ${clientKeysBArr}
                ] ) RETURN d`);
            const ttr = (await ttr_cursor.all()).length;

            // the the stats
            const stats_cursor =
              await db.query(aql`FOR d IN sms_questionnaire_data 
              FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
              FILTER CURRENT.optionKey ==  ${optionKey}
              AND CURRENT.blockKey == ${blockKey} 
              AND CURRENT.optionValues[0] == ${optionValue}
              AND d.companyKey == ${companyKey}
              AND d.timeStamp >= ${dateFrom} 
              AND d.timeStamp <= ${dateTo}
              AND d.loanCycle == ${cycleC} 
              AND d.clientKey IN ${clientKeysBArr}  
            ] ) RETURN d`);

            if (stats_cursor.hasNext) {
              const stats = await stats_cursor.all();
              const resultObj = {
                optionValue: optionValue,
                cycle: cycleC,
                total: ttr,
                quota: stats.length,
                percent: parseFloat(((stats.length * 100) / ttr).toFixed(2)),
              };
              // inert
              optionObjectsArr.push(resultObj);
            } else {
              const resultObj = {
                optionValue: optionValue,
                cycle: cycleC,
                total: ttr,
                quota: 0,
                percent: 0,
              };
              optionObjectsArr.push(resultObj);
            }

            const fObj = {
              optionValue: optionValue,
              cycles: optionObjectsArr,
            };
            optionResultsArr.push(fObj);
          } // end for optionItemsArr
        }
      } // end cycle C

      // select cycle D
      if (cycleD > 0) {
        const vulCyclesD_cursor =
          await db.query(aql`FOR d IN sms_questionnaire_data 
          FILTER d.status == 'OK' 
          AND d.companyKey == ${companyKey}
          AND d.timeStamp >= ${dateFrom} 
          AND d.timeStamp <= ${dateTo} 
          AND d.loanCycle == ${cycleD} 
          AND d.clientKey IN ${clientKeysCArr} RETURN d`);
        if (vulCyclesD_cursor.hasNext) {
          const vulCyclesD = await vulCyclesD_cursor.all();
          // loop
          for (let ic = 0; ic < vulCyclesD.length; ic++) {
            const clt = vulCyclesD[ic];
            clientKeysDArr.push(clt.clientKey);
          }

          ///
          for (let ov = 0; ov < optionItemsArr.length; ov++) {
            const optionValue = optionItemsArr[ov];
            // get total records
            const ttr_cursor =
              await db.query(aql`FOR d IN sms_questionnaire_data 
                  FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
                  FILTER CURRENT.optionKey ==  ${optionKey}
                  AND CURRENT.blockKey == ${blockKey} 
                  AND d.companyKey == ${companyKey}
                  AND d.timeStamp >= ${dateFrom} 
                  AND d.timeStamp <= ${dateTo} 
                  AND d.loanCycle == ${cycleD} 
                  AND d.clientKey IN ${clientKeysCArr}
                ] ) RETURN d`);
            const ttr = (await ttr_cursor.all()).length;

            // the the stats
            const stats_cursor =
              await db.query(aql`FOR d IN sms_questionnaire_data 
              FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
              FILTER CURRENT.optionKey ==  ${optionKey}
              AND CURRENT.blockKey == ${blockKey} 
              AND CURRENT.optionValues[0] == ${optionValue}
              AND d.companyKey == ${companyKey}
              AND d.timeStamp >= ${dateFrom} 
              AND d.timeStamp <= ${dateTo}
              AND d.loanCycle == ${cycleD} 
              AND d.clientKey IN ${clientKeysCArr}  
            ] ) RETURN d`);

            if (stats_cursor.hasNext) {
              const stats = await stats_cursor.all();
              const resultObj = {
                optionValue: optionValue,
                cycle: cycleD,
                total: ttr,
                quota: stats.length,
                percent: parseFloat(((stats.length * 100) / ttr).toFixed(2)),
              };
              // inert
              optionObjectsArr.push(resultObj);
            } else {
              const resultObj = {
                optionValue: optionValue,
                cycle: cycleD,
                total: ttr,
                quota: 0,
                percent: 0,
              };
              optionObjectsArr.push(resultObj);
            }

            const fObj = {
              optionValue: optionValue,
              cycles: optionObjectsArr,
            };
            optionResultsArr.push(fObj);
          } // end for optionItemsArr
        }
      } // end cycleD

      // select cycle E
      if (cycleE > 0) {
        const vulCyclesE_cursor =
          await db.query(aql`FOR d IN sms_questionnaire_data 
          FILTER d.status == 'OK' 
          AND d.companyKey == ${companyKey}
          AND d.timeStamp >= ${dateFrom} 
          AND d.timeStamp <= ${dateTo} 
          AND d.loanCycle == ${cycleE} 
          AND d.clientKey IN ${clientKeysDArr} RETURN d`);
        if (vulCyclesE_cursor.hasNext) {
          const vulCyclesE = await vulCyclesE_cursor.all();
          // loop
          for (let ic = 0; ic < vulCyclesE.length; ic++) {
            const clt = vulCyclesE[ic];
            clientKeysEArr.push(clt.clientKey);
          }

          ///
          for (let ov = 0; ov < optionItemsArr.length; ov++) {
            const optionValue = optionItemsArr[ov];
            // get total records
            const ttr_cursor =
              await db.query(aql`FOR d IN sms_questionnaire_data 
                  FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
                  FILTER CURRENT.optionKey ==  ${optionKey}
                  AND CURRENT.blockKey == ${blockKey} 
                  AND d.companyKey == ${companyKey}
                  AND d.timeStamp >= ${dateFrom} 
                  AND d.timeStamp <= ${dateTo} 
                  AND d.loanCycle == ${cycleE} 
                  AND d.clientKey IN ${clientKeysDArr}
                ] ) RETURN d`);
            const ttr = (await ttr_cursor.all()).length;

            // the the stats
            const stats_cursor =
              await db.query(aql`FOR d IN sms_questionnaire_data 
              FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
              FILTER CURRENT.optionKey ==  ${optionKey}
              AND CURRENT.blockKey == ${blockKey} 
              AND CURRENT.optionValues[0] == ${optionValue}
              AND d.companyKey == ${companyKey}
              AND d.timeStamp >= ${dateFrom} 
              AND d.timeStamp <= ${dateTo}
              AND d.loanCycle == ${cycleE} 
              AND d.clientKey IN ${clientKeysDArr}
            ] ) RETURN d`);

            if (stats_cursor.hasNext) {
              const stats = await stats_cursor.all();
              const resultObj = {
                optionValue: optionValue,
                cycle: cycleE,
                total: ttr,
                quota: stats.length,
                percent: parseFloat(((stats.length * 100) / ttr).toFixed(2)),
              };
              // inert
              optionObjectsArr.push(resultObj);
            } else {
              const resultObj = {
                optionValue: optionValue,
                cycle: cycleE,
                total: ttr,
                quota: 0,
                percent: 0,
              };
              optionObjectsArr.push(resultObj);
            }

            const fObj = {
              optionValue: optionValue,
              cycles: optionObjectsArr,
            };
            optionResultsArr.push(fObj);
          } // end for optionItemsArr
        }
      } // end cycleE

      // final build
      let subBlocks = [];
      for (let opv = 0; opv < optionItemsArr.length; opv++) {
        const opItm = optionItemsArr[opv];
        let option = { optionValue: opItm, cycles: [] };
        //
        for (let sub = 0; sub < optionObjectsArr.length; sub++) {
          const el = optionObjectsArr[sub];
          if (el["optionValue"] == opItm) {
            const opSubObj = {
              cycle: el["cycle"],
              total: el["total"],
              quota: el["quota"],
              percent: el["percent"],
            };
            option.cycles.push(opSubObj);
          }
        }
        subBlocks.push(option);
      }
      // return the result
      return subBlocks;
    } else if (coverage == "Agence") {
      const cycleA = cycles[0] > 0 ? cycles[0] : 0;
      const cycleB = cycles[1] > 0 ? cycles[1] : 0;
      const cycleC = cycles[2] > 0 ? cycles[2] : 0;
      const cycleD = cycles[3] > 0 ? cycles[3] : 0;
      const cycleE = cycles[4] > 0 ? cycles[4] : 0;

      // select cycle A
      if (cycleA > 0) {
        const vulCyclesA_cursor =
          await db.query(aql`FOR d IN sms_questionnaire_data 
          FILTER d.status == 'OK' 
          AND d.companyKey == ${companyKey} 
          AND d.officeKey == ${officeKey}
          AND d.timeStamp >= ${dateFrom} 
          AND d.timeStamp <= ${dateTo} 
          AND d.loanCycle == ${cycleA} RETURN d`);
        if (vulCyclesA_cursor.hasNext) {
          const vulCyclesA = await vulCyclesA_cursor.all();
          // loop
          for (let ic = 0; ic < vulCyclesA.length; ic++) {
            const clt = vulCyclesA[ic];
            clientKeysAArr.push(clt.clientKey);
          }
          ///
          for (let ov = 0; ov < optionItemsArr.length; ov++) {
            const optionValue = optionItemsArr[ov];
            // get total records
            const ttr_cursor =
              await db.query(aql`FOR d IN sms_questionnaire_data 
                  FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
                  FILTER CURRENT.optionKey ==  ${optionKey}
                  AND CURRENT.blockKey == ${blockKey} 
                  AND d.companyKey == ${companyKey}
                  AND d.officeKey == ${officeKey}
                  AND d.timeStamp >= ${dateFrom} 
                  AND d.timeStamp <= ${dateTo} 
                  AND d.loanCycle == ${cycleA}
                ] ) RETURN d`);
            const ttr = (await ttr_cursor.all()).length;

            // the the stats
            const stats_cursor =
              await db.query(aql`FOR d IN sms_questionnaire_data 
              FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
              FILTER CURRENT.optionKey ==  ${optionKey}
              AND CURRENT.blockKey == ${blockKey} 
              AND CURRENT.optionValues[0] == ${optionValue}
              AND d.companyKey == ${companyKey}
              AND d.officeKey == ${officeKey}
              AND d.timeStamp >= ${dateFrom} 
              AND d.timeStamp <= ${dateTo}
              AND d.loanCycle == ${cycleA}  
            ] ) RETURN d`);

            if (stats_cursor.hasNext) {
              const stats = await stats_cursor.all();
              const resultObj = {
                optionValue: optionValue,
                cycle: cycleA,
                total: ttr,
                quota: stats.length,
                percent: parseFloat(((stats.length * 100) / ttr).toFixed(2)),
              };
              // inert
              optionObjectsArr.push(resultObj);
            } else {
              const resultObj = {
                optionValue: optionValue,
                cycle: cycleA,
                total: ttr,
                quota: 0,
                percent: 0,
              };
              optionObjectsArr.push(resultObj);
            }

            const fObj = {
              optionValue: optionValue,
              cycles: optionObjectsArr,
            };
            optionResultsArr.push(fObj);
          } // end for optionItemsArr
        }
      } // end cycleA

      // select cycle B
      if (cycleB > 0) {
        const vulCyclesB_cursor =
          await db.query(aql`FOR d IN sms_questionnaire_data 
          FILTER d.status == 'OK' 
          AND d.companyKey == ${companyKey}
          AND d.officeKey == ${officeKey}
          AND d.timeStamp >= ${dateFrom} 
          AND d.timeStamp <= ${dateTo} 
          AND d.loanCycle == ${cycleB} 
          AND d.clientKey IN ${clientKeysAArr} RETURN d`);
        if (vulCyclesB_cursor.hasNext) {
          const vulCyclesB = await vulCyclesB_cursor.all();
          // loop
          for (let ic = 0; ic < vulCyclesB.length; ic++) {
            const clt = vulCyclesB[ic];
            clientKeysBArr.push(clt.clientKey);
          }
          ///
          for (let ov = 0; ov < optionItemsArr.length; ov++) {
            const optionValue = optionItemsArr[ov];
            // get total records
            const ttr_cursor =
              await db.query(aql`FOR d IN sms_questionnaire_data 
                  FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
                  FILTER CURRENT.optionKey ==  ${optionKey}
                  AND CURRENT.blockKey == ${blockKey} 
                  AND d.companyKey == ${companyKey}
                  AND d.officeKey == ${officeKey}
                  AND d.timeStamp >= ${dateFrom} 
                  AND d.timeStamp <= ${dateTo} 
                  AND d.loanCycle == ${cycleB} 
                  AND d.clientKey IN ${clientKeysAArr}
                ] ) RETURN d`);
            const ttr = (await ttr_cursor.all()).length;

            // the the stats
            const stats_cursor =
              await db.query(aql`FOR d IN sms_questionnaire_data 
              FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
              FILTER CURRENT.optionKey ==  ${optionKey}
              AND CURRENT.blockKey == ${blockKey} 
              AND CURRENT.optionValues[0] == ${optionValue}
              AND d.companyKey == ${companyKey}
              AND d.officeKey == ${officeKey}
              AND d.timeStamp >= ${dateFrom} 
              AND d.timeStamp <= ${dateTo}
              AND d.loanCycle == ${cycleB} 
              AND d.clientKey IN ${clientKeysAArr}  
            ] ) RETURN d`);

            if (stats_cursor.hasNext) {
              const stats = await stats_cursor.all();
              const resultObj = {
                optionValue: optionValue,
                cycle: cycleB,
                total: ttr,
                quota: stats.length,
                percent: parseFloat(((stats.length * 100) / ttr).toFixed(2)),
              };
              // inert
              optionObjectsArr.push(resultObj);
            } else {
              const resultObj = {
                optionValue: optionValue,
                cycle: cycleB,
                total: ttr,
                quota: 0,
                percent: 0,
              };
              optionObjectsArr.push(resultObj);
            }

            const fObj = {
              optionValue: optionValue,
              cycles: optionObjectsArr,
            };
            optionResultsArr.push(fObj);
          } // end for optionItemsArr
        }
      } // end cycle B

      // select cycle C
      if (cycleC > 0) {
        const vulCyclesC_cursor =
          await db.query(aql`FOR d IN sms_questionnaire_data 
          FILTER d.status == 'OK' 
          AND d.companyKey == ${companyKey}
          AND d.officeKey == ${officeKey}
          AND d.timeStamp >= ${dateFrom} 
          AND d.timeStamp <= ${dateTo} 
          AND d.loanCycle == ${cycleC} 
          AND d.clientKey IN ${clientKeysBArr} RETURN d`);
        if (vulCyclesC_cursor.hasNext) {
          const vulCyclesC = await vulCyclesC_cursor.all();
          // loop
          for (let ic = 0; ic < vulCyclesC.length; ic++) {
            const clt = vulCyclesC[ic];
            clientKeysCArr.push(clt.clientKey);
          }
          ///
          for (let ov = 0; ov < optionItemsArr.length; ov++) {
            const optionValue = optionItemsArr[ov];
            // get total records
            const ttr_cursor =
              await db.query(aql`FOR d IN sms_questionnaire_data 
                  FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
                  FILTER CURRENT.optionKey ==  ${optionKey}
                  AND CURRENT.blockKey == ${blockKey} 
                  AND d.companyKey == ${companyKey}
                  AND d.officeKey == ${officeKey}
                  AND d.timeStamp >= ${dateFrom} 
                  AND d.timeStamp <= ${dateTo} 
                  AND d.loanCycle == ${cycleC} 
                  AND d.clientKey IN ${clientKeysBArr}
                ] ) RETURN d`);
            const ttr = (await ttr_cursor.all()).length;

            // the the stats
            const stats_cursor =
              await db.query(aql`FOR d IN sms_questionnaire_data 
              FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
              FILTER CURRENT.optionKey ==  ${optionKey}
              AND CURRENT.blockKey == ${blockKey} 
              AND CURRENT.optionValues[0] == ${optionValue}
              AND d.companyKey == ${companyKey}
              AND d.officeKey == ${officeKey}
              AND d.timeStamp >= ${dateFrom} 
              AND d.timeStamp <= ${dateTo}
              AND d.loanCycle == ${cycleC} 
              AND d.clientKey IN ${clientKeysBArr}  
            ] ) RETURN d`);

            if (stats_cursor.hasNext) {
              const stats = await stats_cursor.all();
              const resultObj = {
                optionValue: optionValue,
                cycle: cycleC,
                total: ttr,
                quota: stats.length,
                percent: parseFloat(((stats.length * 100) / ttr).toFixed(2)),
              };
              // inert
              optionObjectsArr.push(resultObj);
            } else {
              const resultObj = {
                optionValue: optionValue,
                cycle: cycleC,
                total: ttr,
                quota: 0,
                percent: 0,
              };
              optionObjectsArr.push(resultObj);
            }

            const fObj = {
              optionValue: optionValue,
              cycles: optionObjectsArr,
            };
            optionResultsArr.push(fObj);
          } // end for optionItemsArr
        }
      } // end cycle C

      // select cycle D
      if (cycleD > 0) {
        const vulCyclesD_cursor =
          await db.query(aql`FOR d IN sms_questionnaire_data 
          FILTER d.status == 'OK' 
          AND d.companyKey == ${companyKey}
          AND d.officeKey == ${officeKey}
          AND d.timeStamp >= ${dateFrom} 
          AND d.timeStamp <= ${dateTo} 
          AND d.loanCycle == ${cycleD} 
          AND d.clientKey IN ${clientKeysCArr} RETURN d`);
        if (vulCyclesD_cursor.hasNext) {
          const vulCyclesD = await vulCyclesD_cursor.all();
          // loop
          for (let ic = 0; ic < vulCyclesD.length; ic++) {
            const clt = vulCyclesD[ic];
            clientKeysDArr.push(clt.clientKey);
          }

          ///
          for (let ov = 0; ov < optionItemsArr.length; ov++) {
            const optionValue = optionItemsArr[ov];
            // get total records
            const ttr_cursor =
              await db.query(aql`FOR d IN sms_questionnaire_data 
                  FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
                  FILTER CURRENT.optionKey ==  ${optionKey}
                  AND CURRENT.blockKey == ${blockKey} 
                  AND d.companyKey == ${companyKey}
                  AND d.officeKey == ${officeKey}
                  AND d.timeStamp >= ${dateFrom} 
                  AND d.timeStamp <= ${dateTo} 
                  AND d.loanCycle == ${cycleD} 
                  AND d.clientKey IN ${clientKeysCArr}
                ] ) RETURN d`);
            const ttr = (await ttr_cursor.all()).length;

            // the the stats
            const stats_cursor =
              await db.query(aql`FOR d IN sms_questionnaire_data 
              FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
              FILTER CURRENT.optionKey ==  ${optionKey}
              AND CURRENT.blockKey == ${blockKey} 
              AND CURRENT.optionValues[0] == ${optionValue}
              AND d.companyKey == ${companyKey}
              AND d.officeKey == ${officeKey}
              AND d.timeStamp >= ${dateFrom} 
              AND d.timeStamp <= ${dateTo}
              AND d.loanCycle == ${cycleD} 
              AND d.clientKey IN ${clientKeysCArr}  
            ] ) RETURN d`);

            if (stats_cursor.hasNext) {
              const stats = await stats_cursor.all();
              const resultObj = {
                optionValue: optionValue,
                cycle: cycleD,
                total: ttr,
                quota: stats.length,
                percent: parseFloat(((stats.length * 100) / ttr).toFixed(2)),
              };
              // inert
              optionObjectsArr.push(resultObj);
            } else {
              const resultObj = {
                optionValue: optionValue,
                cycle: cycleD,
                total: ttr,
                quota: 0,
                percent: 0,
              };
              optionObjectsArr.push(resultObj);
            }

            const fObj = {
              optionValue: optionValue,
              cycles: optionObjectsArr,
            };
            optionResultsArr.push(fObj);
          } // end for optionItemsArr
        }
      } // end cycleD

      // select cycle E
      if (cycleE > 0) {
        const vulCyclesE_cursor =
          await db.query(aql`FOR d IN sms_questionnaire_data 
          FILTER d.status == 'OK' 
          AND d.companyKey == ${companyKey}
          AND d.officeKey == ${officeKey}
          AND d.timeStamp >= ${dateFrom} 
          AND d.timeStamp <= ${dateTo} 
          AND d.loanCycle == ${cycleE} 
          AND d.clientKey IN ${clientKeysDArr} RETURN d`);
        if (vulCyclesE_cursor.hasNext) {
          const vulCyclesE = await vulCyclesE_cursor.all();
          // loop
          for (let ic = 0; ic < vulCyclesE.length; ic++) {
            const clt = vulCyclesE[ic];
            clientKeysEArr.push(clt.clientKey);
          }

          ///
          for (let ov = 0; ov < optionItemsArr.length; ov++) {
            const optionValue = optionItemsArr[ov];
            // get total records
            const ttr_cursor =
              await db.query(aql`FOR d IN sms_questionnaire_data 
                  FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
                  FILTER CURRENT.optionKey ==  ${optionKey}
                  AND CURRENT.blockKey == ${blockKey} 
                  AND d.companyKey == ${companyKey}
                  AND d.officeKey == ${officeKey}
                  AND d.timeStamp >= ${dateFrom} 
                  AND d.timeStamp <= ${dateTo} 
                  AND d.loanCycle == ${cycleE} 
                  AND d.clientKey IN ${clientKeysDArr}
                ] ) RETURN d`);
            const ttr = (await ttr_cursor.all()).length;

            // the the stats
            const stats_cursor =
              await db.query(aql`FOR d IN sms_questionnaire_data 
              FILTER d.status == 'OK' AND LENGTH(d.optionObjects[* 
              FILTER CURRENT.optionKey ==  ${optionKey}
              AND CURRENT.blockKey == ${blockKey} 
              AND CURRENT.optionValues[0] == ${optionValue}
              AND d.companyKey == ${companyKey}
              AND d.officeKey == ${officeKey}
              AND d.timeStamp >= ${dateFrom} 
              AND d.timeStamp <= ${dateTo}
              AND d.loanCycle == ${cycleE} 
              AND d.clientKey IN ${clientKeysDArr}
            ] ) RETURN d`);

            if (stats_cursor.hasNext) {
              const stats = await stats_cursor.all();
              const resultObj = {
                optionValue: optionValue,
                cycle: cycleE,
                total: ttr,
                quota: stats.length,
                percent: parseFloat(((stats.length * 100) / ttr).toFixed(2)),
              };
              // inert
              optionObjectsArr.push(resultObj);
            } else {
              const resultObj = {
                optionValue: optionValue,
                cycle: cycleE,
                total: ttr,
                quota: 0,
                percent: 0,
              };
              optionObjectsArr.push(resultObj);
            }

            const fObj = {
              optionValue: optionValue,
              cycles: optionObjectsArr,
            };
            optionResultsArr.push(fObj);
          } // end for optionItemsArr
        }
      } // end cycleE

      // final build
      let subBlocks = [];
      for (let opv = 0; opv < optionItemsArr.length; opv++) {
        const opItm = optionItemsArr[opv];
        let option = { optionValue: opItm, cycles: [] };
        //
        for (let sub = 0; sub < optionObjectsArr.length; sub++) {
          const el = optionObjectsArr[sub];
          if (el["optionValue"] == opItm) {
            const opSubObj = {
              cycle: el["cycle"],
              total: el["total"],
              quota: el["quota"],
              percent: el["percent"],
            };
            option.cycles.push(opSubObj);
          }
        }
        subBlocks.push(option);
      }
      // return the result
      return subBlocks;
    }
  },
};

export default smsQuestionnaireStatsResolver;
