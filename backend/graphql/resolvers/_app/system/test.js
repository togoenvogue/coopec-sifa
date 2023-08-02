// select the latest loan only
const loans_cursor = await db.query(
  aql`FOR c IN loan_files 
    FILTER c.projectKey == ${projectKey} 
    AND c.companyKey == ${companyKey} 
    AND c.clientKey == ${client._key} 
    SORT c._key DESC LIMIT 1 RETURN c`,
  { fullCount: true },
  { count: true }
);
if (loans_cursor.hasNext) {
  const loanRecords = await loans_cursor.all();
  let loansArr = [];
  let _loanKeys = [];
  let _clientKeys = [];

  // download other files related to the loan files
  for (let lnIdx = 0; lnIdx < loanRecords.length; lnIdx++) {
    let loan = loanRecords[lnIdx];
    loan.fullCount = await loans_cursor.extra.stats.fullCount;
    loan.animateurKey = await getUserDoc({ userKey: loan.animateurKey });
    // build signature and images url
    fileUrls.push(
      `${serverAppUrl}/${dirImage}/${loan.animateurKey["signature"]}`
    );
    fileUrls.push(`${serverAppUrl}/${dirImage}/${loan.montageParSignature}`);

    loan.revisedBy = await getUserDoc({ userKey: loan.revisedBy });
    // build signature and images url
    fileUrls.push(`${serverAppUrl}/${dirImage}/${loan.revisedBy["signature"]}`);
    loan.projectKey = await getProjectDoc({ projectKey: loan.projectKey });
    loan.totalCharges = await getLoanExploitationSum({
      loanFileKey: loan._key,
      type: "CHARGES",
    });
    loan.totalRecettes = await getLoanExploitationSum({
      loanFileKey: loan._key,
      type: "RECETTES",
    });
    loan.resultatNetAGR = 0;
    loan.montantAchatEnergie = loan.montantCreditDemande * 0.5;
    // add the loan to the array
    loansArr.push(loan);
    _loanKeys.push(loan._key);
    _clientKeys.push(loan.clientKey);
  }
  // generate the loan JSON files
  const loanFileUrl = `${dirName}/loan_files.json`;
  // write to file
  fs.writeFileSync(loanFileUrl, JSON.stringify(loansArr, null, 2), () => {});
  // add to the file urls array
  fileUrls.push(`${serverAppUrl}/${loanFileUrl}`);

  // get the other files
  // _activityAgrKeys
  const agr_cursor = await db.query(
    aql`FOR c IN loan_activite_agr FILTER c.loanFileKey 
    IN ${_loanKeys} RETURN c`,
    { fullCount: true },
    { count: true }
  );
  if (agr_cursor.hasNext) {
    const data = await agr_cursor.all();
    data.fullCount = await agr_cursor.extra.stats.fullCount;
    const agrUrl = `${dirName}/loan_activite_agr.json`;
    fs.writeFileSync(agrUrl, JSON.stringify(data, null, 2), () => {});
    fileUrls.push(`${serverAppUrl}/${agrUrl}`);
  } else {
    const agrUrl = `${dirName}/loan_activite_agr.json`;
    fs.writeFileSync(agrUrl, JSON.stringify([], null, 2), () => {});
    fileUrls.push(`${serverAppUrl}/${agrUrl}`);
  }
  // _activityStockageKeys
  const stockage_cursor = await db.query(
    aql`FOR c IN loan_activite_stockage 
    FILTER c.loanFileKey IN ${_loanKeys} RETURN c`,
    { fullCount: true },
    { count: true }
  );
  if (stockage_cursor.hasNext) {
    const data = await stockage_cursor.all();
    data.fullCount = await stockage_cursor.extra.stats.fullCount;
    const stockUrl = `${dirName}/loan_activite_stockage.json`;
    fs.writeFileSync(stockUrl, JSON.stringify(data, null, 2), () => {});
    fileUrls.push(`${serverAppUrl}/${stockUrl}`);
  } else {
    const stockUrl = `${dirName}/loan_activite_stockage.json`;
    fs.writeFileSync(stockUrl, JSON.stringify([], null, 2), () => {});
    fileUrls.push(`${serverAppUrl}/${stockUrl}`);
  }

  // exploitations, CHARGES et RECETTES
  const exp_cursor = await db.query(
    aql`FOR c IN loan_exploitation 
            FILTER c.loanFileKey IN ${_loanKeys} RETURN c`,
    { fullCount: true },
    { count: true }
  );
  if (exp_cursor.hasNext) {
    const data = await exp_cursor.all();
    data.fullCount = await exp_cursor.extra.stats.fullCount;
    const expUrl = `${dirName}/loan_exploitation.json`;
    fs.writeFileSync(expUrl, JSON.stringify(data, null, 2), () => {});
    fileUrls.push(`${serverAppUrl}/${expUrl}`);
  } else {
    const expUrl = `${dirName}/loan_exploitation.json`;
    fs.writeFileSync(expUrl, JSON.stringify([], null, 2), () => {});
    fileUrls.push(`${serverAppUrl}/${expUrl}`);
  }

  // loan_budget_familial : DEPENSES et REVENUS
  const budget_cursor = await db.query(
    aql`FOR c IN loan_budget_familial 
            FILTER c.loanFileKey IN ${_loanKeys} RETURN c`,
    { fullCount: true },
    { count: true }
  );
  if (budget_cursor.hasNext) {
    const data = await budget_cursor.all();
    data.fullCount = await budget_cursor.extra.stats.fullCount;
    const budgUrl = `${dirName}/loan_budget_familial.json`;
    fs.writeFileSync(budgUrl, JSON.stringify(data, null, 2), () => {});
    fileUrls.push(`${serverAppUrl}/${budgUrl}`);
  } else {
    const budgUrl = `${dirName}/loan_budget_familial.json`;
    fs.writeFileSync(budgUrl, JSON.stringify([], null, 2), () => {});
    fileUrls.push(`${serverAppUrl}/${budgUrl}`);
  }
  // avis
  const avis_cursor = await db.query(
    aql`FOR c IN loan_avis 
            FILTER c.loanFileKey IN ${_loanKeys} RETURN c`,
    { fullCount: true },
    { count: true }
  );
  if (avis_cursor.hasNext) {
    const data = await avis_cursor.all();
    data.fullCount = await avis_cursor.extra.stats.fullCount;
    const avisUrl = `${dirName}/loan_avis.json`;
    fs.writeFileSync(avisUrl, JSON.stringify(data, null, 2), () => {});
    fileUrls.push(`${serverAppUrl}/${avisUrl}`);
  } else {
    const avisUrl = `${dirName}/loan_avis.json`;
    fs.writeFileSync(avisUrl, JSON.stringify([], null, 2), () => {});
    fileUrls.push(`${serverAppUrl}/${avisUrl}`);
  }

  // besoins
  const besoins_cursor = await db.query(
    aql`FOR c IN loan_besoin 
            FILTER c.loanFileKey IN ${_loanKeys} RETURN c`,
    { fullCount: true },
    { count: true }
  );
  if (besoins_cursor.hasNext) {
    const data = await besoins_cursor.all();
    data.fullCount = await besoins_cursor.extra.stats.fullCount;
    const besUrl = `${dirName}/loan_besoin.json`;
    fs.writeFileSync(besUrl, JSON.stringify(data, null, 2), () => {});
    fileUrls.push(`${serverAppUrl}/${besUrl}`);
  } else {
    const besUrl = `${dirName}/loan_besoin.json`;
    fs.writeFileSync(besUrl, JSON.stringify([], null, 2), () => {});
    fileUrls.push(`${serverAppUrl}/${besUrl}`);
  }

  // suivi
  const suivis_cursor = await db.query(
    aql`FOR c IN loan_suivi 
            FILTER c.loanFileKey IN ${_loanKeys} RETURN c`,
    { fullCount: true },
    { count: true }
  );
  if (suivis_cursor.hasNext) {
    const data = await suivis_cursor.all();
    data.fullCount = await suivis_cursor.extra.stats.fullCount;
    const suiviUrl = `${dirName}/loan_suivi.json`;
    fs.writeFileSync(avisUrl, JSON.stringify(data, null, 2), () => {});
    fileUrls.push(`${serverAppUrl}/${suiviUrl}`);
  } else {
    const suiviUrl = `${dirName}/loan_suivi.json`;
    fs.writeFileSync(avisUrl, JSON.stringify([], null, 2), () => {});
    fileUrls.push(`${serverAppUrl}/${suiviUrl}`);
  }
} else {
  const url_agr = `${dirName}/loan_activite_agr.json`;
  const url_stockage = `${dirName}/loan_activite_stockage`;
  const url_avis = `${dirName}/loan_avis.json`;
  const url_besoin = `${dirName}/loan_besoin.json`;
  const url_budget = `${dirName}/loan_budget_familial.json`;
  const url_explt = `${dirName}/loan_exploitation.json`;
  const url_files = `${dirName}/loan_files.json`;
  const url_suivi = `${dirName}/loan_suivi.json`;

  // write other empty files
  fs.writeFileSync(url_agr, JSON.stringify([], null, 2), () => {});
  fs.writeFileSync(url_stockage, JSON.stringify([], null, 2), () => {});
  fs.writeFileSync(url_avis, JSON.stringify([], null, 2), () => {});
  fs.writeFileSync(url_besoin, JSON.stringify([], null, 2), () => {});
  fs.writeFileSync(url_budget, JSON.stringify([], null, 2), () => {});
  fs.writeFileSync(url_explt, JSON.stringify([], null, 2), () => {});
  fs.writeFileSync(url_files, JSON.stringify([], null, 2), () => {});
  fs.writeFileSync(url_suivi, JSON.stringify([], null, 2), () => {});

  // push empty files to the files array
  fileUrls.push(`${serverAppUrl}/${dirName}/loan_activity_agr.json`);
  fileUrls.push(`${serverAppUrl}/${dirName}/loan_activity_stockage.json`);
  fileUrls.push(`${serverAppUrl}/${dirName}/loan_avis.json`);
  fileUrls.push(`${serverAppUrl}/${dirName}/loan_besoin.json`);
  fileUrls.push(`${serverAppUrl}/${dirName}/loan_budget_familial.json`);
  fileUrls.push(`${serverAppUrl}/${dirName}/loan_exploitation.json`);
  fileUrls.push(`${serverAppUrl}/${dirName}/loan_files.json`);
  fileUrls.push(`${serverAppUrl}/${dirName}/loan_suivi.json`);
}
