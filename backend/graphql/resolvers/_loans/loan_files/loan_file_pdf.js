import pdf from "html-pdf"; // https://www.npmjs.com/package/html-pdf?activeTab=readme
import {
  customFullDate,
  customFullDateWithHour,
  dateShotCutAmortissement,
} from "../../../../helpers/date.js";

import dotenv from "dotenv";
dotenv.config();
const SERVER_URL = `http://localhost:${process.env.PORT_SERVER_APP}`; // do not change localhost, even on production mode

// credit individuel
export async function _downloadCreditIndividuelFull({
  pdfName,
  pdfFolder,
  date,
  loan,
}) {
  //console.log(await loan.activityAgrKeys);
  // signature client
  const signatureClient =
    loan.clientSignature != null && loan.clientSignature != undefined
      ? `<img style="width: 95px" src="${SERVER_URL}/public_upload/${loan.clientSignature}" />`
      : "Non signé";

  // client picture
  const pictureClient = `<div style="width: 100%">
  <div style="border: solid 4px #ddd; 
  width: 200px; height: 200px; 
  border-radius: 100%; 
  text-align: center;
  float: left;
  overflow: hidden; margin: 10px auto;">
  <img src="${SERVER_URL}/public_upload/${loan.clientKey["photo"]}" height="200px" />
  </div>
  <div style="border: solid 4px #ddd; 
  width: 200px; height: 200px; 
  border-radius: 100%; 
  text-align: center;
  float: right;
  overflow: hidden; margin: 10px auto;">
  <img src="${SERVER_URL}/public_upload/${loan.clientKey["photo1"]}" height="200px" />
  </div>
</div>`;

  // signature animateur
  const signatureAnimateur =
    loan.montageParSignature != null && loan.montageParSignature != undefined
      ? `<img style="width: 95px" src="${SERVER_URL}/public_upload/${loan.montageParSignature}" />`
      : "Non signé";

  const loanSignaturesBlock = `<!-- DEBUT clear (Signatures) -->
  <div class="clear">
    <div class="wrapperHeader">LU ET APPROUVÉ</div>
    <!-- DEBUT WRAPPER-->
    <div class="wrapper">
      <!-- DEBUT div1Col -->
      <div class="div2Cols">
        <!-- DEBUT signatureBlock -->
        <div class="signatureBlockLeft">
          <div class="paragraph">L'agent de crédit</div>
          <div class="signatureImg">
            <img
              alt=""
              src="${SERVER_URL}/public_upload/${await loan.signatureAgentCredit}"
            />
          </div>
          <div class="signatureName">${await loan.montageParFullName}</div>
        </div>
        <!-- FIN signatureBlock -->
      </div>
      <!-- FIN div2Col-->

      <!-- DEBUT div2Col-->
      <div class="div2Cols">
        <!-- DEBUT signatureBlock -->
        <div class="signatureBlockRight">
          <div class="paragraph">Le bénéficiaire</div>
          <div class="signatureImg">
            <img
              alt=""
              src="${SERVER_URL}/public_upload/${await loan.clientSignature}"
            />
          </div>
          <div class="signatureName">${await loan.clientKey["fullName"]}</div>
        </div>
        <!-- FIN signatureBlock -->
      </div>
      <!-- FIN div2Col-->
    </div>
    <!-- FIN WRAPPER-->
  </div>
  <!-- FIN clear (Signatures) -->`;

  const photosBlock = `<!-- DEBUT CLEAR (photos) -->
  <div class="clear">
    <!-- DEBUT HEADER-->
    <div class="wrapperHeader">IMAGES DE L'EMPRUNTEUR</div>
    <!-- FIN HEADER-->
    <!-- DEBUT WRAPPER-->
    <div class="wrapper">
      <!-- DEBUT div4Cols-->
      <div class="div4Cols">
        <!-- DEBUT img4 -->
        <div class="img4">
          <img
            alt=""
            src="${SERVER_URL}/public_upload/${await loan.clientKey["photo"]}"
          />
        </div>
        <!-- FIN img4-->
      </div>
      <!-- FIN div4Cols-->

      <!-- DEBUT div4Cols-->
      <div class="div4Cols">
        <!-- DEBUT img4 -->
        <div class="img4">
          <img
            alt=""
            src="${SERVER_URL}/public_upload/${await loan.clientKey["photo1"]}"
          />
        </div>
        <!-- FIN img4-->
      </div>
      <!-- FIN div4Cols-->

      <!-- DEBUT div4Cols-->
      <div class="div4Cols">
        <!-- DEBUT img4 -->
        <div class="img4">
          <img
            alt=""
            src="${SERVER_URL}/public_upload/${await loan.clientKey["photo2"]}"
          />
        </div>
        <!-- FIN img4-->
      </div>
      <!-- FIN div4Cols-->

      <!-- DEBUT div4Cols-->
      <div class="div4Cols">
        <!-- DEBUT img4 -->
        <div class="img4">
          <img
            alt=""
            src="${SERVER_URL}/public_upload/${await loan.clientKey["photo3"]}"
          />
        </div>
        <!-- FIN img4-->
      </div>
      <!-- FIN div4Cols-->
    </div>
    <!-- FIN WRAPPER-->
  </div>
  <!-- FIN CLEAR (photos) -->`;

  const enteteBlock = `<!-- DEBUT entete-->
  <div class="center div1Col" style="font-size: 25px;">
    <strong>COOPEC-SIFA</strong>
  </div>
  <div class="center div1Col" style="font-size: 25px;">
  <img style="height: 60px;" src="${SERVER_URL}/public_files/logos/logo_imf.png" />
  </div>

  <div class="div1Col">
    <div style="float: left; width: 200px;">
      <div class="entete">
        Dossier de crédit ................ <strong>Individuel</strong>
      </div>
    </div>
    <div style="float: right; width: 200px;">
      <div class="entete">
        Date ...................................
        <strong>${await customFullDate({
          timeStamp: await loan.timeStamp,
        })}</strong>
      </div>
    </div>
  </div>


  <div class="div1Col">
    <div style="float: left; width: 200px;">
       <div class="entete">
       Cycle ...................................
        <strong>#${await loan.creditCycle}</strong>
      </div>
    </div>
    <div style="float: right; width: 200px;">
      <div class="entete">
      Numéro du crédit ...... <strong>${
        (await loan.dossierRefSig) != null ? await loan.dossierRefSig : ""
      }</strong>
      </div>
    </div>
  </div>

  <!-- FIN entete-->`;

  // commentaires
  let avisTemp = [];
  let avisArr = [];
  let avisBlock = "";

  // avis
  if ((await loan.avis.length) > 0) {
    for (let index = 0; index < (await loan.avis.length); index++) {
      const a = await loan.avis[index];
      const obj = {
        date: a.timeStamp,
        name: `${a.userKey["lastName"]} ${a.userKey["firstName"]}`,
        role: `${a.userKey["roleKey"]["label"]}`,
        signature: a.userKey["signature"],
        message: a.message,
        avis: a.nature == "Favorable" ? "Avis favorable" : "Avis défavorable",
      };
      avisTemp.push(obj);
    }
  }

  // avisTemp
  if (avisTemp.length > 0) {
    // sort by timeStamp ASC
    const dataSorted = avisTemp.sort((a, b) =>
      a.date > b.date ? 1 : b.date > a.date ? -1 : 0
    );

    for (let i = 0; i < dataSorted.length; i++) {
      const c = dataSorted[i];
      const line = `<div class="wrapperHeader">#${i + 1}</div>
      <!-- DEBUT wrapper-->
      <div class="wrapper">
        <!-- DEBUT div2Cols -->
        <div class="div2Cols">
          <div class="label">${c.role}</div>
          <div class="value bold">${c.name}</div>
        </div>
        <!-- FIN div2Cols -->

        <!-- DEBUT div2Cols -->
        <div class="div2Cols">
          <div class="label">${await customFullDateWithHour({
            timeStamp: c.date,
          })}</div>
          <div class="value bold">${c.avis}</div>
        </div>
        <!-- FIN div2Cols -->

        <!-- DEBUT div1Col -->
        <div class="div1Col">
          <div class="label">Commentaire</div>
          <div class="value">${c.message}</div>
        </div>
        <!-- FIN div1Col -->

        <!-- DEBUT signatureBlock -->
        <div class="signatureBlock">
          <div class="signatureImg">
            <img
              alt=""
              src="${SERVER_URL}/public_upload/${c.signature}"
            />
          </div>
          <div class="signatureName">${c.name}</div>
        </div>
        <!-- FIN signatureBlock -->
      </div>
      <!-- FIN wrapper-->`;
      avisArr.push(line);
    }
  } else {
    avisArr.push(`<div class="div1Col">
    <div class="paragraph">Aucune donnée disponible</div>
    </div>`);
  }
  //
  avisArr.map((av) => {
    avisBlock = avisBlock + av;
  });

  // observations
  if ((await loan.observations.length) > 0) {
    /*
    for (let index = 0; index < (await loan.observations.length); index++) {
      const o = await loan.observations[index];
      const obj = {
        date: o.timeStamp,
        name: o.userFullName,
        role: `${o.roleName} (${o.comiteLevelId})`,
        signature: o.signature,
        message: o.note,
        avis: o.isFavorable == true ? "Avis favorable" : "Avis défavorable",
      };
      commentTemp.push(obj);
    }
    */
  }

  // decisions des comités
  let decisionsTemp = [];
  let decisionsArr = [];
  let decicionsBlock = "";

  // sessionDecisions
  if ((await loan.sessionDecisions.length) > 0) {
    for (let index = 0; index < (await loan.sessionDecisions.length); index++) {
      const c = await loan.sessionDecisions[index];
      const obj = {
        date: c.timeStamp,
        name: c.userFullName,
        role: `${c.roleName} (${c.comiteLevelId})`,
        signature: c.signature,
        message: c.note,
        avis: c.isFavorable == true ? "Avis favorable" : "Avis défavorable",
      };
      decisionsTemp.push(obj);
    }
  }

  if (decisionsTemp.length > 0) {
    // sort by timeStamp ASC
    const dataSorted = decisionsTemp.sort((a, b) =>
      a.date > b.date ? 1 : b.date > a.date ? -1 : 0
    );
    //console.log(dataSorted);

    for (let i = 0; i < dataSorted.length; i++) {
      const c = dataSorted[i];
      const line = `<div class="wrapperHeader">#${i + 1}</div>
      <!-- DEBUT wrapper-->
      <div class="wrapper">
        <!-- DEBUT div2Cols -->
        <div class="div2Cols">
          <div class="label">${c.role}</div>
          <div class="value bold">${c.name}</div>
        </div>
        <!-- FIN div2Cols -->

        <!-- DEBUT div2Cols -->
        <div class="div2Cols">
          <div class="label">${await customFullDateWithHour({
            timeStamp: c.date,
          })}</div>
          <div class="value bold">${c.avis}</div>
        </div>
        <!-- FIN div2Cols -->

        <!-- DEBUT div1Col -->
        <div class="div1Col">
          <div class="label">Commentaire</div>
          <div class="value">${c.message}</div>
        </div>
        <!-- FIN div1Col -->

        <!-- DEBUT signatureBlock -->
        <div class="signatureBlock">
          <div class="signatureImg">
            <img
              alt=""
              src="${SERVER_URL}/public_upload/${c.signature}"
            />
          </div>
          <div class="signatureName">${c.name}</div>
        </div>
        <!-- FIN signatureBlock -->
      </div>
      <!-- FIN wrapper-->`;
      decisionsArr.push(line);
    }
  } else {
    avisArr.push(`<div class="div1Col">
    <div class="paragraph">Aucune donnée disponible</div>
    </div>`);
  }

  decisionsArr.map((d) => {
    decicionsBlock = decicionsBlock + d;
  });

  // visites
  let visitesArr = [];
  let visitesBlock = "";
  if ((await loan.visites.length) > 0) {
    for (let i = 0; i < (await loan.visites.length); i++) {
      const visite = await loan.visites[i];
      const line = `
        <div class="wrapperHeader">${visite.lieu}</div>
        <!-- DEBUT wrapper-->
        <div class="wrapper">
          <!-- DEBUT div3Cols -->
          <div class="div2Cols">
            <div class="label">Date et heure</div>
            <div class="value bold">${await customFullDateWithHour({
              timeStamp: visite.timeStamp,
            })}</div>
          </div>
          <!-- FIN div3Cols -->
          <!-- DEBUT div3Cols -->
          <div class="div2Cols">
            <div class="label">Adresse</div>
            <div class="value bold">${visite.commentaireAutre}</div>
          </div>
          <!-- FIN div3Cols -->

          <!-- DEBUT div2Cols -->
          <div class="div2Cols">
            <div class="label">Motif</div>
            <div class="value bold">${visite.motif}</div>
          </div>
          <!-- FIN div2Cols -->

          <!-- DEBUT div2Cols -->
          <div class="div2Cols">
            <div class="label">Action suivante</div>
            <div class="value bold">${visite.suiteSuivite}</div>
          </div>
          <!-- FIN div2Cols -->

          <!-- DEBUT div1Col-->
          <div class="div1Col">
            <div class="label">Observations</div>
            <div class="value">${visite.commentaireCompteRendu}</div>
          </div>
          <!-- FIN div1Col -->
        </div>
        <!-- FIN wrapper-->`;
      visitesArr.push(line);
    }
    visitesArr.map((v) => {
      visitesBlock = visitesBlock + v;
    });
  } else {
    visitesBlock = `<div class="div1Col">
   <div class="paragraph center">Aucune donnée disponible</div>
 </div>`;
  }

  // gage doc list
  let gageDocsListArr = [];
  let gageDocsListBlock = "";
  if ((await loan.gages.length) > 0) {
    for (let i = 0; i < (await loan.gages.length); i++) {
      const document = await loan.gages[i].documents;
      for (let dci = 0; dci < document.length; dci++) {
        const doc = document[dci];
        const line = `<div class="listSimple">${doc}</div>`;
        gageDocsListArr.push(line);
      }
    }
    gageDocsListArr.map((d) => {
      gageDocsListBlock = gageDocsListBlock + d;
    });
  }

  // gage docs
  let gageDocsBlock =
    (await loan.gages.length) > 0
      ? `<div class="wrapper">
  <!-- DEBUT div2Cols -->
  <div class="div2Cols">
    <div class="innerWrapperLabel">LISTE DES DOCUMENTS MIS EN GAGE</div>
    <!-- DEBUT paragraph -->
    <div class="paragraph">
      Je soussigné <strong>${await loan.clientKey[
        "fullName"
      ]}</strong>, profession
      <strong>${await loan.clientKey[
        "activities"
      ]}</strong>, demeurant à <strong>${await loan.clientKey[
          "quartier"
        ]}</strong>,
      téléphone <strong>${await loan.clientKey[
        "phone"
      ]}</strong>, reconnais avoir remis à la
      Coopérative d'Épargne et de Crédit pour le Soutien aux Initiatives
      des Femmes pour l'Autopromotion (COOPEC-SIFA) les documents sous
      cités comme garanties de mon crédit de <strong>${await loan.montantCreditDemande.toLocaleString(
        "fr-FR"
      )}</strong> :
    </div>
    <!-- FIN paragraph -->
    ${gageDocsListBlock}
    <div class="paragraph">
      Au terme du contrat de ce crédit, s'il est constaté que le prêt
      demeure vivant dans le portefeuille de la coopérative et que je me
      trouve dans l'incapacité de le rembourser, j'autorise la
      COOPEC-SIFA à procéder à la saisie et vente dudit (desdits)
      immeuble(s) sans protocoles afin de solder le prêt et me reverser
      le reliquat s'il y a lieu.
    </div>
    <div class="paragraph">
      Tout comme mes ayant causes et ayant droits, je m'interdis
      formellement de m'opposer d'une manière ou d'une autre à cette
      réalisation.
    </div>
    <div class="paragraph">
      Fait à <strong>${await loan.officeKey["officeName"]}</strong>, 
      le <strong>${await customFullDate({
        timeStamp: await loan.gages[0].timeStamp,
      })}</strong>
    </div>

    <!-- DEBUT signatureBlock -->
    <div class="signatureBlock">
      <div class="signatureImg">
        <img
          alt=""
          src="${SERVER_URL}/public_upload/${await loan.clientKey["signature"]}"
        />
      </div>
      <div class="signatureName">${await loan.clientKey["fullName"]}</div>
    </div>
    <!-- FIN signatureBlock -->
  </div>
  <!-- FIN div2Cols -->

  <!-- DEBUT div2Cols -->
  <div class="div2Cols">
    <div class="innerWrapperLabel">
      AUTORISATION DE MISE EN GAGE DE GARANTIES
    </div>
    <div class="paragraph">
      Je soussigné <strong>${await loan.gages[0].fullName}</strong> demeurant à
      <strong>${await loan.gages[0].quartier}</strong>,
      téléphone: <strong>${await loan.gages[0]
        .phone}</strong>, reconnais avoir remis à
      <strong>${await loan.clientKey["fullName"]}</strong>, profession:
      <strong>${await loan.clientKey["activities"]}</strong> demeurant 
      à <strong>${await loan.clientKey["quartier"]}</strong>, les
      documents sus mentionnés matérialisant l'immeuble m'appartenant
      pour garatir un prêt de <strong>${await loan.montantCreditDemande.toLocaleString(
        "fr-FR"
      )}</strong> sollicité auprès
      de la Coopérative d'Epargne et de Crédit pour le soutien aux
      Initiatives des Femmes pour l'Autopromotion (COOPEC-SIFA).
    </div>
    <div class="paragraph">
      En foi de quoi, je lui delivre ce papier pour servir et valoir ce
      que de droit.
    </div>

    <div class="paragraph">
    Fait à <strong>${await loan.officeKey["officeName"]}</strong> 
    le <strong>${await customFullDate({
      timeStamp: await loan.gages[0].timeStamp,
    })}</strong>
  </div>

  <!-- DEBUT signatureBlock -->
  <div class="signatureBlock">
    <div class="signatureImg">
      <img
        alt=""
        src="${SERVER_URL}/public_upload/${await loan.gages[0].signatureClient}"
      />
    </div>
    <div class="signatureName">${await loan.gages[0].fullName}</div>
  </div>
  <!-- FIN signatureBlock -->
  </div>
  <!-- FIN div2Cols -->`
      : `<div class="wrapper">
    <div class="div1Col">
      <div class="paragraph center">Aucune donnée disponible</div>
    </div>
  </div>`;

  // evaluations des garanties
  let evaluationsArr = [];
  let evaluationsBlock = "";

  if ((await loan.gages.length) > 0) {
    for (let i = 0; i < (await loan.gages.length); i++) {
      const evaluation = await loan.gages[i].evaluations;

      for (let evi = 0; evi < evaluation.length; evi++) {
        const ev = evaluation[evi];
        const line = `<!-- DEBUT wrapper-->
        <div class="wrapper">
          <!-- DEBUT div1Col -->
          <div class="div1Col">
            <!-- DBUT div4Cols -->
            <div class="div4Cols">
              <div class="label">Nature du bien</div>
              <div class="value bold">${ev.nature}</div>
            </div>
            <!-- FIN div4Cols -->
            <!-- DBUT div4Cols -->
            <div class="div4Cols">
              <div class="label">Dimensions</div>
              <div class="value bold">${ev.dimensions}</div>
            </div>
            <!-- FIN div4Cols -->
            <!-- DBUT div4Cols -->
            <div class="div4Cols">
              <div class="label">References</div>
              <div class="value bold">${ev.references}</div>
            </div>
            <!-- FIN div4Cols -->
            <!-- DBUT div4Cols -->
            <div class="div4Cols">
              <div class="label">Zone d'implantation</div>
              <div class="value bold">${ev.zone}</div>
            </div>
            <!-- FIN div4Cols -->
          </div>
          <!-- FIN div1Col-->
      
          <!-- DEBUT div1Col -->
          <div class="div1Col">
            <!-- DBUT div4Cols -->
            <div class="div4Cols">
              <div class="label">Valeur d'acquisition</div>
              <div class="value bold">${ev.valeurA}</div>
            </div>
            <!-- FIN div4Cols -->
            <!-- DBUT div4Cols -->
            <div class="div4Cols">
              <div class="label">Valeur actuelle</div>
              <div class="value bold">${ev.valeurB}</div>
            </div>
            <!-- FIN div4Cols -->
            <!-- DBUT div4Cols -->
            <div class="div4Cols">
              <div class="label">Valeur marchande</div>
              <div class="value bold">${ev.valeurC}</div>
            </div>
            <!-- FIN div4Cols -->
            <!-- DBUT div4Cols -->
            <div class="div4Cols">
              <div class="label">Observations</div>
              <div class="value bold">${ev.observations}</div>
            </div>
            <!-- FIN div4Cols -->
          </div>
          <!-- FIN div1Col -->
      
          <div class="div1Cols">
            <div class="div2Cols">
              <!-- DEBUT signatureBlock -->
              <div class="signatureBlock">
                <div class="paragraph">L'agent de crédit</div>
                <div class="signatureImg">
                  <img
                    alt=""
                    src="${SERVER_URL}/public_upload/${loan.montageParSignature}"
                  />
                </div>
                <div class="signatureName">${loan.montageParFullName}</div>
              </div>
              <!-- FIN signatureBlock -->
            </div>
            <div class="div2Cols">
              <!-- DEBUT signatureBlock -->
              <div class="signatureBlock">
                <div class="paragraph">Le demandeur</div>
                <div class="signatureImg">
                  <img
                    alt=""
                    src="${SERVER_URL}/public_upload/${loan.clientKey["signature"]}"
                  />
                </div>
                <div class="signatureName">${loan.clientKey["fullName"]}</div>
              </div>
              <!-- FIN signatureBlock -->
            </div>
          </div>
        </div>
        <!-- FIN wrapper-->`;
        evaluationsArr.push(line);
      }
    }
  } else {
    const line = `
    <div class="wrapper">
      <div class="div1Col">
        <div class="paragraph center">Aucune donnée disponible</div>
      </div>
    </div>`;
    evaluationsArr.push(line);
  }
  evaluationsArr.map((c) => {
    evaluationsBlock = evaluationsBlock + c;
  });

  // garanties == GAGES
  let garantiesArr = [];
  let garantiesBlock = "";
  if ((await loan.gages.length) > 0) {
    for (let i = 0; i < (await loan.gages.length); i++) {
      const garantie = await loan.gages[i].garanties;

      for (let gi = 0; gi < garantie.length; gi++) {
        const g = garantie[gi];
        const line = `<!-- DEBUT div1Col -->
        <div>
          <div class="table4Cols">
            <div class="table4ColsBody">${g.type.replaceAll('"', "")}</div>
          </div>
          <div class="table4Cols">
            <div class="table4ColsBody">${g.description.replaceAll(
              '"',
              ""
            )}</div>
          </div>
          <div class="table4Cols">
            <div class="table4ColsBody">${g.valeurA.replaceAll('"', "")}</div>
          </div>
          <div class="table4Cols">
            <div class="table4ColsBody">${g.valeurB.replaceAll('"', "")}</div>
          </div>
        </div>
        <!-- FIN div1Col -->`;
        garantiesArr.push(line);
      }
    }
  } else {
    const line = `<div class="paragraph center">Aucune donnée disponible</div>`;
    garantiesArr.push(line);
  }
  garantiesArr.map((c) => {
    garantiesBlock = garantiesBlock + c;
  });

  // patrimoines > actifs
  let patrimoineActifsArr = [];
  let patrimoineActifs = 0;
  let patrimoineActifsBlock = "";
  if ((await loan.patrimoineActifs.length) > 0) {
    for (let i = 0; i < (await loan.patrimoineActifs.length); i++) {
      const p = await loan.patrimoineActifs[i];
      if (p.montant > 0) {
        patrimoineActifs = patrimoineActifs + p.montant;
        const line = `<!-- DEBUT div3LinesWrapper -->
        <div class="div3LinesWrapper">
          <!-- DEBUT div3LinesLabelWrapper -->
          <div class="div3LinesLabelWrapper">
            <div class="div3LinesLabel1">${p.category}</div>
            <div class="div3LinesLabel2">${p.description}</div>
          </div>
          <!-- FIN div3LinesLabelWrapper -->
          <!-- DEBUT div3LinesValue -->
          <div class="div3LinesValue">${p.montant.toLocaleString("fr-FR")}</div>
          <!-- FIN div3LinesValue -->
        </div>
        <!-- FIN div3LinesWrapper -->`;
        patrimoineActifsArr.push(line);
      }
    }
  } else {
    const line = `<div class="paragraph">Aucune donnée disponible</div>`;
    patrimoineActifsArr.push(line);
  }
  patrimoineActifsArr.map((c) => {
    patrimoineActifsBlock = patrimoineActifsBlock + c;
  });

  // patrimoines > passifs
  let patrimoinePassifsArr = [];
  let patrimoinePassifs = 0;
  let patrimoinePassifsBlock = "";
  if ((await loan.patrimoinePassifs.length) > 0) {
    for (let i = 0; i < (await loan.patrimoinePassifs.length); i++) {
      const p = await loan.patrimoinePassifs[i];
      if (p.montant > 0) {
        patrimoinePassifs = patrimoinePassifs + p.montant;
        const line = `<!-- DEBUT div3LinesWrapper -->
        <div class="div3LinesWrapper">
          <!-- DEBUT div3LinesLabelWrapper -->
          <div class="div3LinesLabelWrapper">
            <div class="div3LinesLabel1">${p.category}</div>
            <div class="div3LinesLabel2">${p.description}</div>
          </div>
          <!-- FIN div3LinesLabelWrapper -->
          <!-- DEBUT div3LinesValue -->
          <div class="div3LinesValue">${p.montant.toLocaleString("fr-FR")}</div>
          <!-- FIN div3LinesValue -->
        </div>
        <!-- FIN div3LinesWrapper -->`;
        patrimoinePassifsArr.push(line);
      }
    }
  } else {
    const line = `<div class="paragraph">Aucune donnée disponible</div>`;
    patrimoinePassifsArr.push(line);
  }
  patrimoinePassifsArr.map((c) => {
    patrimoinePassifsBlock = patrimoinePassifsBlock + c;
  });

  // budget familial > charges
  let familleDepensesArr = [];
  let familleDepenses = 0;
  let familleDepensesBlock = "";
  if ((await loan.familleDepenses.length) > 0) {
    for (let i = 0; i < (await loan.familleDepenses.length); i++) {
      const r = await loan.familleDepenses[i];
      if (r.montant > 0) {
        familleDepenses = familleDepenses + r.montant * 12;
        const line = `<!-- DEBUT div1Col -->
        <div class="div1Col">
          <div class="label">${r.description}</div>
          <div class="value">(${r.montant.toLocaleString("fr-FR")} x 12) = ${(
          r.montant * 12
        ).toLocaleString("fr-FR")}</div>
        </div>
        <!-- FIN div1Col -->`;
        familleDepensesArr.push(line);
      }
    }
  } else {
    const line = `<div class="paragraph">Aucune donnée disponible</div>`;
    familleDepensesArr.push(line);
  }
  familleDepensesArr.map((c) => {
    familleDepensesBlock = familleDepensesBlock + c;
  });

  // budget familial > revenus
  let familleRevenusArr = [];
  let familleRevenus = 0;
  let familleRevenusBlock = "";
  if ((await loan.familleRevenus.length) > 0) {
    for (let i = 0; i < (await loan.familleRevenus.length); i++) {
      const r = await loan.familleRevenus[i];
      if (r.montant > 0) {
        familleRevenus = familleRevenus + r.montant * 12;
        const line = `<!-- DEBUT div1Col -->
        <div class="div1Col">
          <div class="label">${r.description}</div>
          <div class="value">(${r.montant.toLocaleString("fr-FR")} x 12) = ${(
          r.montant * 12
        ).toLocaleString("fr-FR")}</div>
        </div>
        <!-- FIN div1Col -->`;
        familleRevenusArr.push(line);
      }
    }
  } else {
    const line = `<div class="paragraph">Aucune donnée disponible</div>`;
    familleRevenusArr.push(line);
  }
  familleRevenusArr.map((c) => {
    familleRevenusBlock = familleRevenusBlock + c;
  });

  // liste des activites
  let activitiesArr = [];
  let activitiesBlock = "";
  let actitiviesCharges = 0;
  let activitiesRecettes = 0;

  if ((await loan.activityAgrKeys.length) > 0) {
    for (let index = 0; index < (await loan.activityAgrKeys.length); index++) {
      const a = await loan.activityAgrKeys[index];

      if (a.charges.length > 0) {
        const activityDuration = Math.ceil(
          (a.exploitationDateEnd - a.exploitationDateStart) / 2629800000
        );
        let totalCharges = 0; // sur la periode de l'activité
        let totalRecettes = 0; // sur la periode de l'activité
        let recettesMoyennesMensuelles = 0;
        let depensesMoyennesMensuelles = 0;
        let fluxNet = 0;

        // charges
        //  charges d'exploitation
        let activityChargesArr = [];
        let activityChargesBlock = "";

        for (let chix = 0; chix < (await a.charges.length); chix++) {
          const c = await a.charges[chix];
          if (c.total > 0) {
            totalCharges = totalCharges + c.total;
            actitiviesCharges = actitiviesCharges + c.total;
            const line = `<div class="div1Col">
          <div class="label">${c.designation}</div>
          <div class="value bold">(${Math.ceil(
            c.prixUnit / activityDuration
          ).toLocaleString("fr-FR")} x ${
              c.quantity * activityDuration
            }) = ${c.total.toLocaleString("fr-FR")}</div>
          </div>`;
            activityChargesArr.push(line);
          }
        }
        activityChargesArr.map((c) => {
          activityChargesBlock = activityChargesBlock + c;
        });

        // recettes
        // recettes d'exploitation
        let activityRecettesArry = [];
        let activityRecettesBlock = "";
        for (let rix = 0; rix < (await a.recettes.length); rix++) {
          const r = await a.recettes[rix];
          if (r.total > 0) {
            totalRecettes = totalRecettes + r.total;
            activitiesRecettes = activitiesRecettes + r.total;
            const line = `<div class="div1Col">
          <div class="label">${r.designation}</div>
          <div class="value bold">(${Math.ceil(
            r.prixUnit / activityDuration
          ).toLocaleString("fr-FR")} x ${
              r.quantity * activityDuration
            }) = ${r.total.toLocaleString("fr-FR")}</div>
          </div>`;
            activityRecettesArry.push(line);
          }
        }
        activityRecettesArry.map((r) => {
          activityRecettesBlock = activityRecettesBlock + r;
        });

        const line = `<div>
      <div class="wrapperHeader">${a.activityName}</div>
      <!-- DEBUT wrapper-->
      <div class="wrapper">
        <!-- DEBUT innerWrapperLabel -->
        <div class="innerWrapperLabel">
          RECETTES ET DÉPENSES DU ${await customFullDate({
            timeStamp: a.exploitationDateStart,
          })} au ${await customFullDate({
          timeStamp: a.exploitationDateEnd,
        })} (${activityDuration} mois)
        </div>
        <!-- FIN innerWrapperLabel -->

        <!-- DeBUT table2Cols (left) -->
        <div class="table2Cols left">
          <!-- tableHeader -->
          <div class="tableHeader">RECETTES</div>
          <div class="tableBody">
            <!-- DEBUT TABLE 2 COLS -->
            ${activityRecettesBlock}
            <!-- FIN div1Col -->
          </div>
          <!-- FIN tableBody -->
          <div class="tableFooter">TOTAL (R) ${totalRecettes.toLocaleString(
            "fr-FR"
          )}</div>
        </div>
        <!-- FIN TABLE 2 COLS -->

        <div class="table2Cols right">
          <!-- DEBUT TABLE 2 COLS -->
          <div class="tableHeader">DÉPENSES</div>
          <div class="tableBody">
            ${activityChargesBlock}
          </div>
          <!-- FIN TABLE 2 COLS -->
          <div class="tableFooter">TOTAL (D) ${totalCharges.toLocaleString(
            "fr-FR"
          )}</div>
        </div>
        <!-- FIN TABLE 2 COLS -->

        <!-- DEBUT div1Col -->
          <div class="div1Col">
            <!-- DEBUT div3Cols-->
            <div class="div3Cols">
              <div class="label">Recettes moyennes mensuelles (RMM)</div>
              <div class="value bold">${Math.ceil(
                totalRecettes / activityDuration
              ).toLocaleString("fr-FR")}</div>
            </div>
            <!-- FIN div3Cols -->
            <!-- DEBUT div3Cols-->
            <div class="div3Cols">
              <div class="label">Dépenses moyennes mensuelles (DMM)</div>
              <div class="value bold">${Math.ceil(
                totalCharges / activityDuration
              ).toLocaleString("fr-FR")}</div>
            </div>
            <!-- FIN div3Cols -->

            <!-- DEBUT div3Cols-->
            <div class="div3Cols">
              <div class="label">Flux Net (R-D)</div>
              <div class="value bold">${Math.ceil(
                totalRecettes - totalCharges
              ).toLocaleString("fr-FR")}</div>
            </div>
            <!-- FIN div3Cols -->
          </div>
          <!-- FIN div1Col -->

          <!-- DEBUT RATIO DE LA CAPACITE -->
              <!-- DEBUT innerWrapperLabel -->
              <div class="innerWrapperLabel">
                RATIO DE LA CAPACITÉ À REMBOURSER DE L'ACTIVITÉ
              </div>
              <!-- FIN innerWrapperLabel -->
              <!-- DEBUT listCheckWrapper -->
              <div class="listCheckWrapper">
                <!-- DEBUT listCheckLabel  -->
                <div class="listCheckLabel">
                  Marge nette mensuelle de l'activité (RMM - DMM)
                </div>
                <!-- FIN listCheckLabel -->
                <!-- DEBUT listCheckValue -->
                <div class="listCheckValue">
                ${Math.ceil(
                  (totalRecettes - totalCharges) / activityDuration
                ).toLocaleString("fr-FR")}
                </div>
                <!-- FIN listCheckValue -->
              </div>
              <!-- FIN listCheckWrapper -->

              <!-- DEBUT listCheckWrapper -->
              <div class="listCheckWrapper">
                <!-- DEBUT listCheckLabel  -->
                <div class="listCheckLabel">Flux net moyen mensuel (FNM)</div>
                <!-- FIN listCheckLabel -->
                <!-- DEBUT listCheckValue -->
                <div class="listCheckValue">
                ${(
                  Math.ceil(totalRecettes - totalCharges) / activityDuration
                ).toLocaleString("fr-FR")}
                </div>
                <!-- FIN listCheckValue -->
              </div>
              <!-- FIN listCheckWrapper -->

              <!-- DEBUT listCheckWrapper -->
              <div class="listCheckWrapper">
                <!-- DEBUT listCheckLabel  -->
                <div class="listCheckLabel">
                  Échéance moyenne mensuelle (EMM)
                </div>
                <!-- FIN listCheckLabel -->
                <!-- DEBUT listCheckValue -->
                <div class="listCheckValue">${(
                  Math.floor(
                    (await loan.montantCreditDemande) + (await loan.interets)
                  ) / (await loan.dureeCreditDemande)
                ).toLocaleString("fr-FR")}</div>
                <!-- FIN listCheckValue -->
              </div>
              <!-- FIN listCheckWrapper -->

              <!-- DEBUT listCheckWrapper -->
              <div class="listCheckWrapper">
                <!-- DEBUT listCheckLabel  -->
                <div class="listCheckLabel">
                  Capacité à rembourser (CR = EMM/FNM). Satisfaisant si CR < 1
                </div>
                <!-- FIN listCheckLabel -->
                <!-- DEBUT listCheckValue -->
                <div class="listCheckValue">
                ${(
                  ((await loan.montantCreditDemande) + (await loan.interets)) /
                  (await loan.dureeCreditDemande) /
                  ((totalRecettes - totalCharges) / activityDuration)
                ).toPrecision(2)}
                
                </div>
                <!-- FIN listCheckValue -->
              </div>
              <!-- FIN listCheckWrapper -->

              <!-- FIN RATIO DE LA CAPACITE-->

      </div>
      <!-- FIN wrapper-->
    </div>`;
        activitiesArr.push(line);
      }
    }
  } else {
    const line = `<div class="paragraph">Aucune donnée disponible</div>`;
    activitiesArr.push(line);
  }
  activitiesArr.map((c) => {
    activitiesBlock = activitiesBlock + c;
  });

  // allocation par filiere
  let allocationBlock = "";
  let filieres = [];
  if ((await loan.filieres.length) > 0) {
    for (let i = 0; i < (await loan.filieres.length); i++) {
      const f = await loan.filieres[i];
      const ligne = `<!-- DEBUT listCheckWrapper -->
      <div class="listCheckWrapper">
        <!-- DEBUT listCheckLabel  -->
        <div class="listCheckLabel">${f.filiereName}</div>
        <!-- FIN listCheckLabel -->
        <!-- DEBUT listCheckValue -->
        <div class="listCheckValue">${f.montant.toLocaleString("fr-FR")}</div>
        <!-- FIN listCheckValue -->
      </div>
      <!-- FIN listCheckWrapper -->`;
      filieres.push(ligne);
    }
  } else {
    const ligne = `<div class="paragraph">Aucune filière configurée</div>`;
    filieres.push(ligne);
  }
  filieres.map((alc) => {
    allocationBlock = allocationBlock + alc;
  });

  // cautions solidaires
  let cautionsBlock = "";
  let cautionsArr = [];
  if ((await loan.cautions.length) > 0) {
    for (let i = 0; i < (await loan.cautions.length); i++) {
      const caution = await loan.cautions[i];
      const line = `<!-- DEBUT table2Cols -->
      <div class="table2Cols">
        <!-- DEBUT tableHeader-->
        <div class="tableHeader">${caution.fullName}</div>
        <!-- FIN tableHeader-->
        <div class="tableBody">
          <!-- DEBUT div1Col -->
          <div class="div1Col">
            <!-- DEBUT div4Cols-->
            <div class="div4Cols">
              <!-- DEBUT img4 -->
              <div class="img4">
                <img
                  alt=""
                  src="${SERVER_URL}/public_upload/${caution.photo}"
                />
              </div>
              <!-- FIN img4-->
            </div>
            <!-- FIN div4Cols-->
            <div class="div4Cols">
              <!-- DEBUT img4 -->
              <div class="img4">
                <img
                  alt=""
                  src="${SERVER_URL}/public_upload/${caution.photo1}"
                />
              </div>
              <!-- FIN img4-->
            </div>
          </div>
          <!-- FIN div1Col -->
          <!-- DEBUT div1Col -->
          <div class="paragraph">
            Je soussigné <strong>${caution.fullName}</strong>,
          </div>
    
          <!-- DEBUT div1Col -->
          <div class="div1Col">
            <div class="div4Cols">
              <div class="label">Date de naissance</div>
              <div class="value bold">${await customFullDate({
                timeStamp: caution.naissanceDate,
              })}</div>
            </div>
            <div class="div4Cols">
              <div class="label">Lieu de naissance</div>
              <div class="value bold">${caution.naissanceLieu}</div>
            </div>
          </div>
          <!-- FIN div1Col -->
    
          <!-- DEBUT div1Col -->
          <div class="div1Col">
            <div class="div4Cols">
              <div class="label">Nationalité</div>
              <div class="value bold">${caution.nationalite}</div>
            </div>
            <div class="div4Cols">
              <div class="label">Profession</div>
              <div class="value bold">${caution.profession}</div>
            </div>
          </div>
          <!-- FIN div1Col -->
    
          <!-- DEBUT div1Col -->
          <div class="div1Col">
            <div class="div4Cols">
              <div class="label">Employeur</div>
              <div class="value bold">${caution.employeur}</div>
            </div>
            <div class="div4Cols">
              <div class="label">Revenu mensuel</div>
              <div class="value bold">${caution.renvenuNet.toLocaleString(
                "fr-FR"
              )}</div>
            </div>
          </div>
          <!-- FIN div1Col -->
    
          <!-- DEBUT div1Col -->
          <div class="div1Col">
            <div class="div4Cols">
              <div class="label">Autres revenus</div>
              <div class="value bold">${caution.revenuAutres.toLocaleString(
                "fr-FR"
              )}</div>
            </div>
            <div class="div4Cols">
              <div class="label">Provenance</div>
              <div class="value bold">${
                caution.revenuAutresProvenance != ""
                  ? caution.revenuAutresProvenance
                  : "-"
              }</div>
            </div>
          </div>
          <!-- FIN div1Col -->
    
          <!-- DEBUT div1Col -->
          <div class="div1Col">
            <div class="label">Adresse</div>
            <div class="value bold">${caution.adressePerso}</div>
          </div>
          <!-- FIN div1Col -->

          <!-- DEBUT div1Col -->
          <div class="div1Col">
            <div class="label">Lien de filiation avec le client</div>
            <div class="value bold">${caution.filiation}</div>
          </div>
          <!-- FIN div1Col -->
    
          <!-- DEBUT div1Col -->
          <div class="div1Col">
            <div class="div4Cols">
              <div class="label">${caution.pieceType}</div>
              <div class="value bold">${caution.pieceNumero}</div>
            </div>
            <div class="div4Cols">
              <div class="label">Date d'établissement</div>
              <div class="value bold">${await customFullDate({
                timeStamp: caution.pieceDateDebut,
              })}</div>
            </div>
          </div>
          <!-- FIN div1Col -->
    
          <!-- DEBUT div1Col -->
          <div class="div1Col">
            <div class="div4Cols">
              <div class="label">Membre de la SIFA</div>
              <div class="value bold">${caution.membreImf}</div>
            </div>
            <div class="div4Cols">
              <div class="label">Numéro de compte</div>
              <div class="value bold">${
                caution.numeroCompteImf != "" ? caution.numeroCompteImf : "-"
              }</div>
            </div>
          </div>
          <!-- FIN div1Col -->
    
          <div class="paragraph">
            Me porte par conséquent caution solidaire d'un prêt (capital +
            intéret) de <strong>${Math.ceil(
              (await loan.montantCreditDemande) + (await loan.interets)
            ).toLocaleString("fr-FR")}</strong> que sollicite
            <strong>${caution.fullName}</strong>.
          </div>
          <div class="paragraph">
            Je m'engage à payer l'intégralité dudit prêt, intérêts et
            capital compris, sans autres conditions, en cas de défaillance
            de l'emprunteur.
          </div>
          <div class="paragraph">
            J'accepte en outre de payer toute échéance en retard entrainant
            des intérets moratoires ainsi que tout autre frais en découlant.
          </div>
    
          <div class="paragraph italic">
            Fait à <strong>${await loan.officeKey["officeName"]}</strong>, 
            le <strong>${await customFullDate({
              timeStamp: caution.timeStamp,
            })}</strong>
          </div>
    
          <!-- DEBUT signatureBlock -->
          <div class="signatureBlock">
            <div class="signatureImg">
              <img
                alt=""
                src="${SERVER_URL}/public_upload/${caution.signature}"
              />
            </div>
            <div class="signatureName">${caution.fullName}</div>
          </div>
          <!-- FIN signatureBlock -->
        </div>
        <!-- FIN tableBody -->
      </div>
      <!-- FIN table2Cols -->`;
      cautionsArr.push(line);
    }
  } else {
    const line = `<div class="div1Col">
      <div class="paragraph">
        Aucune donnée disponible
      </div>
    </div>`;
    cautionsArr.push(line);
  }
  cautionsArr.map((c) => {
    cautionsBlock = cautionsBlock + c;
  });

  // analyse de la demande (agent de credit)
  const analyseAgentBlock = `
  <!-- DEBUT listCheckWrapper -->
  <div class="listCheckWrapper">
    <!-- DEBUT listCheckLabel  -->
    <div class="listCheckLabel">
      Analyse de la conformité à la politique de crédit
    </div>
    <!-- FIN listCheckLabel -->
    <!-- DEBUT listCheckValue -->
    <div class="listCheckValue">${await loan.analyseConforme}</div>
    <!-- FIN listCheckValue -->
  </div>
  <!-- FIN listCheckWrapper -->

  <!-- DEBUT listCheckWrapper -->
  <div class="listCheckWrapper">
    <!-- DEBUT listCheckLabel  -->
    <div class="listCheckLabel">
      Respecte le plafond individuel de crédit
    </div>
    <!-- FIN listCheckLabel -->
    <!-- DEBUT listCheckValue -->
    <div class="listCheckValue">${await loan.analyseRespectPlafond}</div>
    <!-- FIN listCheckValue -->
  </div>
  <!-- FIN listCheckWrapper -->

  <!-- DEBUT listCheckWrapper -->
  <div class="listCheckWrapper">
    <!-- DEBUT listCheckLabel  -->
    <div class="listCheckLabel">
      Respecte les types d'activités éligibles
    </div>
    <!-- FIN listCheckLabel -->
    <!-- DEBUT listCheckValue -->
    <div class="listCheckValue">${await loan.analyseRespecteActivity}</div>
    <!-- FIN listCheckValue -->
  </div>
  <!-- FIN listCheckWrapper -->

  <!-- DEBUT listCheckWrapper -->
  <div class="listCheckWrapper">
    <!-- DEBUT listCheckLabel  -->
    <div class="listCheckLabel">Volonté de payer de l'emprunteur</div>
    <!-- FIN listCheckLabel -->
    <!-- DEBUT listCheckValue -->
    <div class="listCheckValue">${await loan.riskVolontePayeur}</div>
    <!-- FIN listCheckValue -->
  </div>
  <!-- FIN listCheckWrapper -->

  <!-- DEBUT listCheckWrapper -->
  <div class="listCheckWrapper">
    <!-- DEBUT listCheckLabel  -->
    <div class="listCheckLabel">
      Stabilité et sécurité du revenu ou de l'emploi
    </div>
    <!-- FIN listCheckLabel -->
    <!-- DEBUT listCheckValue -->
    <div class="listCheckValue">${await loan.riskStabiliteRevenu}</div>
    <!-- FIN listCheckValue -->
  </div>
  <!-- FIN listCheckWrapper -->

  <!-- DEBUT listCheckWrapper -->
  <div class="listCheckWrapper">
    <!-- DEBUT listCheckLabel  -->
    <div class="listCheckLabel">Stabilité d'adresse</div>
    <!-- FIN listCheckLabel -->
    <!-- DEBUT listCheckValue -->
    <div class="listCheckValue">${await loan.riskStabiliteAdresse}</div>
    <!-- FIN listCheckValue -->
  </div>
  <!-- FIN listCheckWrapper -->

  <!-- DEBUT listCheckWrapper -->
  <div class="listCheckWrapper">
    <!-- DEBUT listCheckLabel  -->
    <div class="listCheckLabel">Pouvoir actuel de remboursement</div>
    <!-- FIN listCheckLabel -->
    <!-- DEBUT listCheckValue -->
    <div class="listCheckValue">${await loan.riskPouvoirRemboursement}</div>
    <!-- FIN listCheckValue -->
  </div>
  <!-- FIN listCheckWrapper -->

  <!-- DEBUT listCheckWrapper -->
  <div class="listCheckWrapper">
    <!-- DEBUT listCheckLabel  -->
    <div class="listCheckLabel">Niveau et qualité des garanties</div>
    <!-- FIN listCheckLabel -->
    <!-- DEBUT listCheckValue -->
    <div class="listCheckValue">${await loan.riskQuaniteGaranties}</div>
    <!-- FIN listCheckValue -->
  </div>
  <!-- FIN listCheckWrapper -->

  <!-- DEBUT listCheckWrapper -->
  <div class="listCheckWrapper">
    <!-- DEBUT listCheckLabel  -->
    <div class="listCheckLabel">
      Ratio de la capacité de remboursement
    </div>
    <!-- FIN listCheckLabel -->
    <!-- DEBUT listCheckValue -->
    <div class="listCheckValue">${await loan.riskRatioRemboursement}</div>
    <!-- FIN listCheckValue -->
  </div>
  <!-- FIN listCheckWrapper -->

  <!-- DEBUT listCheckWrapper -->
  <div class="listCheckWrapper">
    <!-- DEBUT listCheckLabel  -->
    <div class="listCheckLabel">
      Réputation du membre dans le milieu
    </div>
    <!-- FIN listCheckLabel -->
    <!-- DEBUT listCheckValue -->
    <div class="listCheckValue">${await loan.riskReputationDuClient}</div>
    <!-- FIN listCheckValue -->
  </div>
  <!-- FIN listCheckWrapper -->

  <!-- DEBUT listCheckWrapper -->
  <div class="listCheckWrapper">
    <!-- DEBUT listCheckLabel  -->
    <div class="listCheckLabel">Antécédents de crédit</div>
    <!-- FIN listCheckLabel -->
    <!-- DEBUT listCheckValue -->
    <div class="listCheckValue">${await loan.riskAntecedentsCredit}</div>
    <!-- FIN listCheckValue -->
  </div>
  <!-- FIN listCheckWrapper -->
`;

  const analyseComiteBlock = `<!-- DEBUT clear (ANALYSE DU COMITÉ) -->
  <div class="clear">
    <div class="wrapperHeader">AVIS DU COMITÉ DE CRÉDIT</div>
    <!-- DEBUT WRAPPER-->
    <div class="wrapper">
      <div class="innerWrapperLabel">ÉLÉMENTS D'ANALYSE</div>
      <!-- DEBUT listCheckWrapper -->
      <div class="listCheckWrapper">
        <!-- DEBUT listCheckLabel  -->
        <div class="listCheckLabel">
          Le dossier présenté par l'agent de crédit est-il complet ?
        </div>
        <!-- FIN listCheckLabel -->
        <!-- DEBUT listCheckValue -->
        <div class="listCheckValue">${
          (await loan.comiteAnalyse1) != null ? await loan.comiteAnalyse1 : "-"
        }</div>
        <!-- FIN listCheckValue -->
      </div>
      <!-- FIN listCheckWrapper -->

      <!-- DEBUT listCheckWrapper -->
      <div class="listCheckWrapper">
        <!-- DEBUT listCheckLabel  -->
        <div class="listCheckLabel">
          La demande respecte-t-elle les politiques et procédures de la COOPEC-SIFA ?
        </div>
        <!-- FIN listCheckLabel -->
        <!-- DEBUT listCheckValue -->
        <div class="listCheckValue">${
          (await loan.comiteAnalyse2) != null ? await loan.comiteAnalyse2 : "-"
        }</div>
        <!-- FIN listCheckValue -->
      </div>
      <!-- FIN listCheckWrapper -->

      <!-- DEBUT listCheckWrapper -->
      <div class="listCheckWrapper">
        <!-- DEBUT listCheckLabel  -->
        <div class="listCheckLabel">
          Les garanties sont-elles suffisantes ?
        </div>
        <!-- FIN listCheckLabel -->
        <!-- DEBUT listCheckValue -->
        <div class="listCheckValue">${
          (await loan.comiteAnalyse3) != null ? await loan.comiteAnalyse3 : "-"
        }</div>
        <!-- FIN listCheckValue -->
      </div>
      <!-- FIN listCheckWrapper -->

      <!-- DEBUT listCheckWrapper -->
      <div class="listCheckWrapper">
        <!-- DEBUT listCheckLabel  -->
        <div class="listCheckLabel">
          Est-ce que l'emprunteur est crédible ?
        </div>
        <!-- FIN listCheckLabel -->
        <!-- DEBUT listCheckValue -->
        <div class="listCheckValue">${
          (await loan.comiteAnalyse4) != null ? await loan.comiteAnalyse4 : "-"
        }</div>
        <!-- FIN listCheckValue -->
      </div>
      <!-- FIN listCheckWrapper -->

      <!-- DEBUT listCheckWrapper -->
      <div class="listCheckWrapper">
        <!-- DEBUT listCheckLabel  -->
        <div class="listCheckLabel">
          L'emprunteur offre-t-il toutes les garanties et stabilité professionnelles requises ?
        </div>
        <!-- FIN listCheckLabel -->
        <!-- DEBUT listCheckValue -->
        <div class="listCheckValue">${
          (await loan.comiteAnalyse5) != null ? await loan.comiteAnalyse5 : "-"
        }</div>
        <!-- FIN listCheckValue -->
      </div>
      <!-- FIN listCheckWrapper -->

      <!-- DEBUT listCheckWrapper -->
      <div class="listCheckWrapper">
        <!-- DEBUT listCheckLabel  -->
        <div class="listCheckLabel">
          L'activité à financer est-elle rentable ? Ou est-ce que son budget familial pourra rembourser le crédit ?
        </div>
        <!-- FIN listCheckLabel -->
        <!-- DEBUT listCheckValue -->
        <div class="listCheckValue">${
          (await loan.comiteAnalyse6) != null ? await loan.comiteAnalyse6 : "-"
        }</div>
        <!-- FIN listCheckValue -->
      </div>
      <!-- FIN listCheckWrapper -->

      <!-- DEBUT listCheckWrapper -->
      <div class="listCheckWrapper">
        <!-- DEBUT listCheckLabel  -->
        <div class="listCheckLabel">
          Le crédit demandé repond-il au besoin réel en crédit du membre ?
        </div>
        <!-- FIN listCheckLabel -->
        <!-- DEBUT listCheckValue -->
        <div class="listCheckValue">${
          (await loan.comiteAnalyse7) != null ? await loan.comiteAnalyse7 : "-"
        }</div>
        <!-- FIN listCheckValue -->
      </div>
      <!-- FIN listCheckWrapper -->

      <!-- DEBUT listCheckWrapper -->
      <div class="listCheckWrapper">
        <!-- DEBUT listCheckLabel  -->
        <div class="listCheckLabel">
          Ses antécédents sont-ils positifs ?
        </div>
        <!-- FIN listCheckLabel -->
        <!-- DEBUT listCheckValue -->
        <div class="listCheckValue">${
          (await loan.comiteAnalyse8) != null ? await loan.comiteAnalyse8 : "-"
        }</div>
        <!-- FIN listCheckValue -->
      </div>
      <!-- FIN listCheckWrapper -->

      <!-- DEBUT listCheckWrapper -->
      <div class="listCheckWrapper">
        <!-- DEBUT listCheckLabel  -->
        <div class="listCheckLabel">
          Est-il capable de rembourser le crédit à l'interieur des délais définis ?
        </div>
        <!-- FIN listCheckLabel -->
        <!-- DEBUT listCheckValue -->
        <div class="listCheckValue">${
          (await loan.comiteAnalyse9) != null ? await loan.comiteAnalyse9 : "-"
        }</div>
        <!-- FIN listCheckValue -->
      </div>
      <!-- FIN listCheckWrapper -->

      <!-- DEBUT listCheckWrapper -->
      <div class="listCheckWrapper">
        <!-- DEBUT listCheckLabel  -->
        <div class="listCheckLabel">
          Le risque de la COOPEC-SIFA est-il raisonnable ?
        </div>
        <!-- FIN listCheckLabel -->
        <!-- DEBUT listCheckValue -->
        <div class="listCheckValue">${
          (await loan.comiteAnalyse10) != null
            ? await loan.comiteAnalyse10
            : "-"
        }</div>
        <!-- FIN listCheckValue -->
      </div>
      <!-- FIN listCheckWrapper -->

      <!-- DEBUT listCheckWrapper -->
      <div class="listCheckWrapper">
        <!-- DEBUT listCheckLabel  -->
        <div class="listCheckLabel">
          Le secteur d'activité est-il porteur ?
        </div>
        <!-- FIN listCheckLabel -->
        <!-- DEBUT listCheckValue -->
        <div class="listCheckValue">${
          (await loan.comiteAnalyse11) != null
            ? await loan.comiteAnalyse11
            : "-"
        }</div>
        <!-- FIN listCheckValue -->
      </div>
      <!-- FIN listCheckWrapper -->

      <!-- DEBUT listCheckWrapper -->
      <div class="listCheckWrapper">
        <!-- DEBUT listCheckLabel  -->
        <div class="listCheckLabel">
          La recommandation de l'agent de crédit est-elle claire ?
        </div>
        <!-- FIN listCheckLabel -->
        <!-- DEBUT listCheckValue -->
        <div class="listCheckValue">${
          (await loan.comiteAnalyse12) != null
            ? await loan.comiteAnalyse12
            : "-"
        }</div>
        <!-- FIN listCheckValue -->
      </div>
      <!-- FIN listCheckWrapper -->

      <div class="innerWrapperLabel">DÉCISION FINALE</div>

      <!-- DEBUT div1Col -->
      <div class="div1Col">
        <div class="div3Cols">
          <div class="label">Statut final</div>
          <div class="value bold">${await loan.status}</div>
        </div>
        <div class="div3Cols">
          <div class="label">Montant accordé</div>
          <div class="value bold">${
            (await loan.montantCreditAccorde) != null
              ? await loan.montantCreditAccorde.toLocaleString("fr-FR")
              : "-"
          }</div>
        </div>
        <div class="div3Cols">
          <div class="label">Durée</div>
          <div class="value bold">${
            (await loan.dureeCreditAccorde) != null
              ? await loan.dureeCreditAccorde
              : "-"
          } mois</div>
        </div>
      </div>
      <!-- FIN  div1Col-->

      <!-- DEBUT div1Col -->
      <div class="div1Col">
        <div class="div3Cols">
          <div class="label">Différé</div>
          <div class="value bold">${await loan.differe} mois</div>
        </div>
        <div class="div3Cols">
          <div class="label">Taux</div>
          <div class="value bold">${await loan.tauxInterets}%</div>
        </div>
        <div class="div3Cols">
          <div class="label">Périodicité</div>
          <div class="value bold">${await loan.frequenceRemboursement}</div>
        </div>
      </div>
      <!-- FIN  div1Col-->
    </div>
    <!-- FIN WRAPPER-->
  </div>
  <!-- FIN clear (ANALYSE DU COMITÉ) -->`;

  let docContent = `<html>
  <head>
    <style>
      html,
      body {
        margin: 20x;
        padding: 15px;
        font-family: "Times New Roman";
        font-size: 7px;
        background: #ffffff;
        box-sizing: border-box;
      }

      .h1 {
        position: relative;
        display: block;
        width: auto;
        margin: 3px;
        padding: 5px 0px;
        background-color: #ffffff;
        font-size: 14px;
        font-family: "Times New Roman";
        font-weight: bold;
      }

      .paragraph {
        padding: 3px 6px;
        font-size: 9px;
      }

      .italic {
        font-style: italic;
      }

      .left {
        float: left;
      }
      .right {
        float: right;
      }

      #app {
        max-width: 21cm;
        margin: 0 auto;
      }

      .clear {
        clear: both;
        height: fit-content;
        display: block;
        overflow: auto;
      }

      .header {
        position: relative;
        display: block;
        background: #dddddd;
        page-break-after: auto;
        margin: 0px 0px 5px 0px;
        font-size: 13px;
        overflow: hidden;
        text-align: center;
        padding: 5px 10px;
        font-weight: bold;
        border: solid 1px #b5b5b5;
        font-family: "Times New Roman";
        width: 481px;
      }

      .center {
        text-align: center;
        display: block;
        margin-left: auto;
        margin-right: auto;
        width: auto;
      }

      .bold {
        font-weight: bold !important;
      }

      .logo {
        width: 500px;
        text-align: center;
        margin-bottom: 6px;
      }

      .logo img {
        height: 50px;
      }

      .superWrapper {
        width: 500px;
        margin: 0px 0px 10px 0px;
        clear: both;
        height: fit-content;
        display: block;
        overflow: auto;
        background-color: #c3e0fa;
        padding: 4px 4px;
      }

      .superWrapperHeader {
        font-weight: bold;
        font-size: 10px;
        color: #000000;
        padding-left: 5px;
        padding-top: 5px;
        padding-bottom: 3px;
        max-width: 492px;
        min-width: 492px;
      }

      .wrapper {
        max-width: 500px;
        border: solid 1px #747f8f !important;
        background-color: #ffffff;
        font-family: "Times New Roman";
        margin: 0px 0px 3px 0px;
        clear: both;
        height: fit-content;
        display: block;
        overflow: auto;
      }

      .wrapperHeader {
        font-weight: bold;
        font-size: 10px;
        background-color: #747f8f;
        color: #ffffff;
        padding: 5px 5px 3px 5px;
        max-width: 492px;
      }

      .div1Col {
        max-width: 95%;
        min-width: 95%;
        float: left;
        padding: 2px 5px;
        margin: 1px;
        font-family: "Times New Roman";
        background-color: #ffffff;
      }
      .div2Cols {
        max-width: 230px;
        min-width: 230px;
        float: left;
        padding: 2px 5px;
        margin: 1px;
        font-family: "Times New Roman";
      }

      .div3Cols {
        max-width: 150px;
        min-width: 140px;
        float: left;
        padding: 2px 5px;
        margin: 1px;
        font-family: "Times New Roman";
      }

      .div4Cols {
        width: 110px;
        float: left;
        padding: 0px;
        margin: 1px;
        font-family: "Times New Roman";
      }

      .label {
        width: 100%;
        font-size: 9px;
        color: #7e8a96;
        padding-bottom: 1px;
      }

      .value {
        width: 100%;
        font-size: 9px;
        border-top: solid 1px #e0e0e0;
        color: #000000;
        padding-top: 1px;
      }

      .marginBottom {
        margin-bottom: 6px;
      }

      .table2Cols {
        max-width: 238px;
        min-width: 235px;
        padding: 0px;
        margin: 2px 5px;
        font-family: "Times New Roman";
        border: solid 1px #e0e0e0;
        overflow: hidden;
        float: left;
      }

      .table4Cols {
        width: 122px;
        float: left;
        padding: 0px;
        margin: 0px;
        font-family: "Times New Roman";
        border: solid 1px #e0e0e0;
      }

      .tableHeader {
        background-color: #e0e0e0;
        padding: 3px 6px;
        font-weight: bold;
        font-size: 9px;
        color: #000;
      }
      .tableFooter {
        background-color: #e0e0e0;
        padding: 4px 6px;
        font-weight: bold;
        font-size: 9px;
        color: #000;
      }
      .tableBody {
        background-color: #ffffffff;
        clear: both;
        height: fit-content;
        display: block;
        overflow: auto;
        padding: 0px;
      }

      .table4ColsBody {
        background-color: #ffffff;
        clear: both;
        height: fit-content;
        display: block;
        overflow: auto;
        padding: 2px 5px;
        font-size: 9px;
      }

      .listCheckWrapper {
        max-width: 500px;
        margin: 3px 5px;
        clear: both;
        height: fit-content;
        display: block;
        overflow: auto;
        background-color: #d4d4d4;
        border: solid 1px #e6e3e3;
      }

      .listCheckLabel {
        width: 80%;
        padding: 3px 6px;
        font-size: 9px;
        float: left;
        background-color: #e8e8e8;
      }
      .listCheckValue {
        width: 15%;
        font-size: 9px;
        font-weight: bold;
        float: right;
        padding: 3px 6px;
      }

      .div3LinesWrapper {
        max-width: 100%;
        margin: 2px 2px;
        clear: both;
        height: fit-content;
        display: block;
        overflow: auto;
        background-color: #ffffff;
        border: solid 1px #c9d6d5;
        padding: 2px 3px;
      }
      .div3LinesLabelWrapper {
        width: 70%;
        padding: 3px 0px;
        font-size: 9px;
        float: left;
      }
      .div3LinesLabel1 {
        width: 100%;
        font-size: 8px;
        border-bottom: solid 0px #dce6e5;
      }
      .div3LinesLabel2 {
        width: 100%;
        font-size: 8px;
      }
      .div3LinesValue {
        width: 20%;
        font-size: 8px;
        font-weight: bold;
        float: right;
        padding: 3px 6px;
        background-color: #c9d6d5;
      }

      .signature img {
        max-height: 30px;
      }

      .photo {
        border: solid 4px #ddd;
        width: 180px;
        height: 180px;
        border-radius: 100%;
        text-align: center;
        float: left;
        overflow: hidden;
        margin: 10px auto;
      }

      .img4 img {
        width: 100px;
        height: 100px;
        overflow: hidden;
        border: solid 1px #c4c4c4;
        background-color: #fff;
        padding: 3px;
      }

      .innerWrapperLabel {
        margin-top: 2px;
        margin-right: 5px;
        margin-left: 5px;
        clear: both;
        height: fit-content;
        display: block;
        overflow: auto;
        background-color: #cae2fa;
        border-bottom: solid 0px #3474e3;
        color: #000;
        padding: 3px 6px;
        font-size: 9px;
        font-weight: bold;
      }

      .sepHeight5 {
        width: 100%;
        clear: both;
        height: fit-content;
        display: block;
        height: 5px;
        background-color: #ffffff;
      }

      .listSimple {
        max-width: 100%;
        padding: 2px 5px;
        background-color: #e0e0e0;
        color: #000;
        font-size: 9px;
        margin: 1px 5px;
      }

      .signatureBlock {
        max-width: 200px;
        clear: both;
        height: fit-content;
        display: block;
        overflow: auto;
        float: right;
        text-align: center !important;
        margin: 2px 10px;
      }
      .signatureImg {
        text-align: center !important;
        margin-bottom: 5px;
      }
      .signatureImg img {
        max-height: 40px;
      }
      .signatureName {
        font-size: 9px;
        text-align: center !important;
        font-weight: bold;
      }

      .entete {
        font-size: 9px;
        line-height: 12px;
      }

      .signatureBlockLeft {
        width: 200px;
        clear: both;
        float: left;
        height: fit-content;
        display: block;
        overflow: auto;
        text-align: center !important;
        margin: 2px 10px;
        background-color: #ffffff;
      }
      .signatureBlockRight {
        width: 200px;
        clear: both;
        height: fit-content;
        display: block;
        overflow: auto;
        text-align: center !important;
        margin: 2px 10px;
        float: right;
        background-color: #ffffff;
      }

    </style>
  </head>

  <body>
    <div id="app"> 
    ${enteteBlock}
      <div class="header">${loan.loanProductKey[
        "productName"
      ].toUpperCase()} </div>

      <!-- DEBUT CLEAR (IDENTIFICATION) -->
      <div class="clear">
        <!-- DEBUT HEADER-->
        <div class="wrapperHeader">IDENTIFICATION DE L'EMPRUNTEUR</div>
        <!-- FIN HEADER-->
        <!-- DEBUT WRAPPER-->
        <div class="wrapper">
          <!-- DEBUT div3Cols-->
          <div class="div3Cols">
            <div class="label">Agence/Guichet</div>
            <div class="value bold">${loan.officeKey["officeName"]}</div>
          </div>
          <!-- FIN div3Cols-->

          <!-- DEBUT div3Cols-->
          <div class="div3Cols">
            <div class="label">Intitulé du compte</div>
            <div class="value bold">
            ${
              loan.clientKey["intituleDuCompte"] != null &&
              loan.clientKey["intituleDuCompte"] != undefined &&
              loan.clientKey["intituleDuCompte"] != ""
                ? loan.clientKey["intituleDuCompte"]
                : loan.clientKey["fullName"]
            }
            </div>
          </div>
          <!-- FIN div3Cols-->

          <!-- DEBUT div3Cols-->
          <div class="div3Cols">
            <div class="label">Numéro de compte</div>
            <div class="value bold">${loan.clientKey["codeSig"]}</div>
          </div>
          <!-- FIN div3Cols-->
          <!-- DEBUT div3Cols-->
          <div class="div3Cols">
            <div class="label">Solde (${await customFullDate({
              timeStamp: loan.soldeClientDate,
            })})</div>
            <div class="value bold">${loan.soldeClient.toLocaleString(
              "fr-FR"
            )}</div>
          </div>
          <!-- FIN div3Cols-->

          <!-- DEBUT div3Cols-->
          <div class="div3Cols">
            <div class="label">Entité</div>
            <div class="value bold">${loan.personneType}</div>
          </div>
          <!-- FIN div3Cols-->

          <!-- DEBUT div3Cols-->
          <div class="div3Cols">
            <div class="label">Activité principale</div>
            <div class="value bold">${loan.clientKey["activities"]}</div>
          </div>
          <!-- FIN div3Cols-->

          <!-- DEBUT div3Cols-->
          <div class="div3Cols">
            <div class="label">Anciennté de l'activité</div>
            <div class="value bold">${
              loan.clientKey["activitiesSinceWhen"]
            }</div>
          </div>
          <!-- FIN div3Cols-->

          <!-- DEBUT div3Cols-->
          <div class="div3Cols">
            <div class="label">Sexe</div>
            <div class="value bold">${loan.clientKey["gender"]}</div>
          </div>
          <!-- FIN div2Cols-->

          <!-- DEBUT div3Cols-->
          <div class="div3Cols">
            <div class="label">${loan.clientKey["idType"]}</div>
            <div class="value bold">${loan.clientKey["idNumber"]}</div>
          </div>
          <!-- FIN div3Cols-->

          <!-- DEBUT div3Cols-->
          <div class="div3Cols">
            <div class="label">Date d'établissement</div>
            <div class="value bold">${await customFullDate({
              timeStamp: loan.clientKey["idDateStart"],
            })}</div>
          </div>
          <!-- FIN div3Cols-->

          <!-- DEBUT div3Cols-->
          <div class="div3Cols">
            <div class="label">Téléphone(x)</div>
            <div class="value bold">
            ${loan.clientKey["phone"]}/${loan.clientKey["phoneAlt"]}
            </div>
          </div>
          <!-- FIN div3Cols-->

          <!-- DEBUT div3Cols-->
          <div class="div3Cols">
            <div class="label">Propriétaire ou locataire ?</div>
            <div class="value bold">${loan.clientKey["addressFiliation"]}</div>
          </div>
          <!-- FIN div3Cols-->

          <!-- DEBUT div3Cols-->
          <div class="div3Cols">
            <div class="label">Situation maritale</div>
            <div class="value bold">${loan.clientKey["maritalStatus"]}</div>
          </div>
          <!-- FIN div3Cols-->

          <!-- DEBUT div3Cols-->
          <div class="div3Cols">
            <div class="label">Personnes à charge</div>
            <div class="value bold">${
              loan.clientKey["peopleInCharge"]
            } personne(s)</div>
          </div>
          <!-- FIN div3Cols-->

          <!-- DEBUT div3Cols-->
          <div class="div3Cols">
            <div class="label">Nom et prénom du père</div>
            <div class="value bold">${loan.clientKey["fatherFullName"]}</div>
          </div>
          <!-- FIN div3Cols-->

          <!-- DEBUT div2Cols-->
          <div class="div2Cols">
            <div class="label">Nom et prénom du conjoint</div>
            <div class="value bold">${loan.clientKey["motherFullName"]}</div>
          </div>
          <div class="div2Cols">
            <div class="label">Nom et prénom de la mère</div>
            <div class="value bold">${loan.clientKey["motherFullName"]}</div>
          </div>
          <!-- FIN div2Cols-->

          <!-- DEBUT div1Cols-->
          <div class="div1Col">
            <div class="label">Adresse habitée depuis ${
              loan.clientKey["addressSinceWhen"]
            }</div>
            <div class="value">${loan.clientKey["address"]}</div>
          </div>
          <!-- FIN div1Cols-->
 
        </div>
        <!-- FIN WRAPPER-->
      </div>
      <!-- FIN CLEAR (IDENTIFICATION) -->

      ${photosBlock}

      <!-- DEBUT CLEAR (NATURE DU CRÉDIT) -->
      <div class="clear">
        <!-- DEBUT HEADER-->
        <div class="wrapperHeader">NATURE DU CRÉDIT</div>
        <!-- FIN HEADER-->
        <!-- DEBUT WRAPPER-->
        <div class="wrapper">

          <div class="div1Col">
            <div class="label">Objet du crédit</div>
            <div class="value bold">${loan.creditObjet}</div>
          </div>

          <!-- DEBUT div3Cols-->
          <div class="div3Cols">
            <div class="label">Montant sollicité</div>
            <div class="value bold">${loan.montantCreditDemande.toLocaleString(
              "fr-FR"
            )}</div>
          </div>
          <!-- FIN div3Cols-->

          <!-- DEBUT div3Cols-->
          <div class="div3Cols">
            <div class="label">Durée du crédit</div>
            <div class="value bold">${loan.dureeCreditDemande} mois</div>
          </div>
          <!-- FIN div3Cols-->

          <!-- DEBUT div3Cols-->
          <div class="div3Cols">
            <div class="label">Nombre d'échéance(s)</div>
            <div class="value bold">${loan.nombreEcheances} échéance(s)</div>
          </div>
          <!-- FIN div3Cols-->

          <!-- DEBUT div3Cols-->
          <div class="div3Cols">
            <div class="label">Montant par échéance</div>
            <div class="value bold">${loan.montantParEcheance.toLocaleString(
              "fr-FR"
            )}</div>
          </div>
          <!-- FIN div3Cols-->

          <!-- DEBUT div3Cols-->
          <div class="div3Cols">
            <div class="label">Fréquence de remboursement</div>
            <div class="value bold">${loan.frequenceRemboursement}</div>
          </div>
          <!-- FIN div3Cols-->

          <!-- DEBUT div3Cols-->
          <div class="div3Cols">
            <div class="label">Différé</div>
            <div class="value bold">${loan.differe} mois</div>
          </div>
          <!-- FIN div3Cols-->
        </div>
        <!-- FIN WRAPPER-->
      </div>
      <!-- FIN CLEAR (NATURE DU CREDIT) -->

      <!-- DEBUT CLEAR (ALLOCATION PAR FILIERE) -->
      <div class="clear">
        <!-- DEBUT HEADER-->
        <div class="wrapperHeader">ALLOCATION DES FONDS PAR FILIÈRE</div>
        <!-- FIN HEADER-->
        <!-- DEBUT WRAPPER-->
        <div class="wrapper">
          ${allocationBlock}
        </div>
        <!-- FIN WRAPPER-->
      </div>
      <!-- FIN CLEAR (ALLOCATION PAR FILIERE) -->

      <!-- DEBUT CLEAR (HABITUDES EN EPARGNE) -->
      <div class="clear">
        <div class="wrapperHeader">HABITUDES EN ÉPARGNE ET CRÉDIT</div>
        <!-- DEBUT WRAPPER-->
        <div class="wrapper">
          <!-- DEBUT div3Cols-->
          <div class="div3Cols">
            <div class="label">Avez-vous déjà bénéficié d'un crédit ?</div>
            <div class="value bold">${
              loan.dejaCreditYesNo != null && loan.dejaCreditYesNo != ""
                ? loan.dejaCreditYesNo
                : "-"
            }</div>
          </div>
          <!-- FIN div3Cols -->

          <!-- DEBUT div3Cols-->
          <div class="div3Cols">
            <div class="label">Si non pourquoi ?</div>
            <div class="value bold">${
              loan.dejaCreditNoWhy != null && loan.dejaCreditNoWhy != ""
                ? loan.dejaCreditNoWhy
                : "-"
            }</div>
          </div>
          <!-- FIN div3Cols -->

          <!-- DEBUT div3Cols-->
          <div class="div3Cols">
            <div class="label">Si oui, avec quelle institution ?</div>
            <div class="value bold">${
              loan.dejaCreditInstitution != null &&
              loan.dejaCreditInstitution != ""
                ? loan.dejaCreditInstitution
                : "-"
            }</div>
          </div>
          <!-- FIN div3Cols -->

          <!-- DEBUT div3Cols-->
          <div class="div3Cols">
            <div class="label">Montant obtenu</div>
            <div class="value bold">${
              loan.dejaCreditMontant != null
                ? loan.dejaCreditMontant.toLocaleString("fr-FR")
                : "-"
            }</div>
          </div>
          <!-- FIN div3Cols -->

          <!-- DEBUT div3Cols-->
          <div class="div3Cols">
            <div class="label">Qu'en avez-vous fait?</div>
            <div class="value bold">${
              loan.dejaCreditObjet != null && loan.dejaCreditObjet != ""
                ? loan.dejaCreditObjet
                : "-"
            }</div>
          </div>
          <!-- FIN div3Cols -->

          <!-- DEBUT div3Cols-->
          <div class="div3Cols">
            <div class="label">Crédit totalement remboursé ?</div>
            <div class="value bold">${
              loan.previousLoanTotallyPaid != null &&
              loan.previousLoanTotallyPaid != ""
                ? loan.previousLoanTotallyPaid
                : "-"
            }</div>
          </div>
          <!-- FIN div3Cols -->

          <!-- DEBUT div3Cols-->
          <div class="div3Cols">
            <div class="label">Si oui, avec nantissement ?</div>
            <div class="value bold">${
              loan.previousLoanPaidWithNant != null &&
              loan.previousLoanPaidWithNant != ""
                ? loan.previousLoanPaidWithNant
                : "-"
            }</div>
          </div>
          <!-- FIN div3Cols -->

          <!-- DEBUT div3Cols-->
          <div class="div3Cols">
            <div class="label">Avez-vous respecté les échéances?</div>
            <div class="value bold">${
              loan.previousLoanDifficulty != null &&
              loan.previousLoanDifficulty != ""
                ? loan.previousLoanDifficulty
                : "-"
            }</div>
          </div>
          <!-- FIN div3Cols -->

          <!-- DEBUT div3Cols-->
          <div class="div3Cols">
            <div class="label">Si non, pourquoi ?</div>
            <div class="value bold">${
              loan.previousLoanDifficultyReason != "" &&
              loan.previousLoanDifficultyReason != null
                ? loan.previousLoanDifficultyReason
                : "-"
            }</div>
          </div>
          <!-- FIN div3Cols -->
        </div>
        <!-- FIN WRAPPER-->
      </div>
      <!-- FIN CLEAR (HABITUDES EN EPARGNE ET CREDIT) -->


      <!-- DEBUT CLEAR (DESCRIPTION DE L'ACTIVITE) -->
      <div class="clear">
        <div class="wrapperHeader">DESCRIPTION DE L'ACTIVITÉ</div>
        <!-- DEBUT WRAPPER-->
        <div class="wrapper">
          <!-- DEBUT div1Col-->
          <div class="div1Col">
            <div class="label">
              Intitulé de l'activité
            </div>
            <div class="value bold">${
              loan.activityAgrKeys[0].activityName
            }</div>
          </div>
          <!-- FIN div1Col -->

          <!-- DEBUT div1Col-->
          <div class="div1Col">
            <div class="label">
              Bref historique et description de l'activité
            </div>
            <div class="value bold">${
              loan.activityAgrKeys[0].activityDesc1
            }</div>
          </div>
          <!-- FIN div1Col -->

          <!-- DEBUT div1Col-->
          <div class="div1Col">
            <div class="label">
              Marchés, concurrents, clients, prix de vente, volume de vente ...
            </div>
            <div class="value bold">${
              loan.activityAgrKeys[0].activityDesc2
            }</div>
          </div>
          <!-- FIN div1Col -->

          <!-- DEBUT div1Col-->
          <div class="div1Col">
            <div class="label">
              Autres informations pertinents (difficultés, atouts, opportunités,
              menaces)
            </div>
            <div class="value bold">${
              loan.activityAgrKeys[0].activityDesc3
            }</div>
          </div>
          <!-- FIN div1Col -->

          <!-- DEBUT div1Col-->
          <div class="div1Col">
            <div class="label">
              Besoin de renforcement de capacité pour réussir l'activité
            </div>
            <div class="value bold">${
              loan.activityAgrKeys[0].activityDesc4
            }</div>
          </div>
          <!-- FIN div1Col -->
        </div>
        <!-- FIN WRAPPER-->
      </div>
      <!-- FIN CLEAR (DESCRIPTION DE L'ACTIVITE) -->


      <!-- DEBUT clear (activites) -->
      <div class="clear">
        <div class="superWrapperHeader">ACTIVITÉS</div>
        <!-- DEBUT superWrapper-->
        <div class="superWrapper">
          <!-- DEBUT activity -->
          ${activitiesBlock}
          <!-- FIN activity -->
        </div>
        <!-- FIN superWrapper-->
      </div>
      <!-- FIN clear (activites) -->


      <!-- DEBUT clear (revenus et depenses familiales) -->
      <div class="clear">
        <div class="wrapperHeader">REVENUS ET DÉPENSES DE LA FAMILLE</div>
        <!-- DEBUT wrapper-->
        <div class="wrapper">
          <!-- DeBUT table2Cols (left) -->
          <div class="table2Cols left">
            <!-- tableHeader -->
            <div class="tableHeader">REVENUS</div>
            <div class="tableBody">
               ${familleRevenusBlock}
            </div>
            <!-- FIN tableBody -->
            <div class="tableFooter">TOTAL (R) ${familleRevenus.toLocaleString(
              "fr-FR"
            )}</div>
          </div>
          <!-- FIN TABLE 2 COLS left -->

          <!-- DeBUT table2Cols (right) -->
          <div class="table2Cols right">
            <!-- DEBUT TABLE 2 COLS -->
            <div class="tableHeader">DÉPENSES</div>
            <div class="tableBody">
               ${familleDepensesBlock}
            </div>
            <!-- FIN tableBody -->
            <div class="tableFooter">TOTAL (D) ${familleDepenses.toLocaleString(
              "fr-FR"
            )}</div>
          </div>
          <!-- FIN TABLE 2 COLS right -->
        </div>
        <!-- FIN wrapper-->
      </div>
      <!-- FIN clear (revenus et depenses familiales) -->


      <!-- DEBUT clear (patrimoine) -->
      <div class="clear">
        <div class="wrapperHeader">PATRIMOINE DU MEMBRE</div>
        <!-- DEBUT wrapper-->
        <div class="wrapper">
          <!-- DEBUT table2Cols (left) -->
          <div class="table2Cols left">
            <!-- DEBUT tableHeader -->
            <div class="tableHeader">ACTIFS</div>
            <!-- FIN tableHeader -->
            <!-- DEBUT tableBody -->
            <div class="tableBody">
               ${patrimoineActifsBlock}
            </div>
            <!-- FIN tableBody -->
            <div class="tableFooter">TOTAL ACTIF : ${patrimoineActifs.toLocaleString(
              "fr-FR"
            )}</div>
          </div>
          <!-- FIN table2Cols left -->

          <!-- DEBUT table2Cols (right) -->
          <div class="table2Cols right">
            <!-- DEBUT tableHeader -->
            <div class="tableHeader">PASSIFS</div>
            <!-- FIN tableHeader -->
            <!-- DEBUT tableBody -->
            <div class="tableBody">
               ${patrimoinePassifsBlock}
            </div>
            <!-- FIN tableBody -->
            <div class="tableFooter">TOTAL PASSIF : ${patrimoinePassifs.toLocaleString(
              "fr-FR"
            )}</div>
          </div>
          <!-- FIN table2Cols right -->
        </div>
        <!-- FIN wrapper-->
      </div>
      <!-- FIN clear (patrimoine) -->



      <!-- DEBUT clear (ratio du pret) -->
      <div class="clear">
        <div class="wrapperHeader">
          RATIO DU PRÊT SOLLICITÉ SUR LE TOTAL DES ACTIFS
        </div>
        <!-- DEBUT wrapper-->
        <div class="wrapper">
          <!-- DEBUT listCheckWrapper -->
          <div class="listCheckWrapper">
            <!-- DEBUT listCheckLabel  -->
            <div class="listCheckLabel">Montant du prêt sollicité</div>
            <!-- FIN listCheckLabel -->
            <!-- DEBUT listCheckValue -->
            <div class="listCheckValue">${loan.montantCreditDemande.toLocaleString(
              "fr-FR"
            )}</div>
            <!-- FIN listCheckValue -->
          </div>
          <!-- FIN listCheckWrapper -->

          <!-- DEBUT listCheckWrapper -->
          <div class="listCheckWrapper">
            <!-- DEBUT listCheckLabel  -->
            <div class="listCheckLabel">Total des actifs</div>
            <!-- FIN listCheckLabel -->
            <!-- DEBUT listCheckValue -->
            <div class="listCheckValue">${patrimoineActifs.toLocaleString(
              "fr-FR"
            )}</div>
            <!-- FIN listCheckValue -->
          </div>
          <!-- FIN listCheckWrapper -->

          <!-- DEBUT listCheckWrapper -->
          <div class="listCheckWrapper">
            <!-- DEBUT listCheckLabel  -->
            <div class="listCheckLabel">
              Prêt sollicité / Total des actifs : Satisfaisant si <= 0,2
            </div>
            <!-- FIN listCheckLabel -->
            <!-- DEBUT listCheckValue -->
            <div class="listCheckValue">${(
              loan.montantCreditDemande / patrimoineActifs
            ).toPrecision(2)}</div>
            <!-- FIN listCheckValue -->
          </div>
          <!-- FIN listCheckWrapper -->
        </div>
        <!-- FIN wrapper-->
      </div>
      <!-- FIN clear (ratio du pret) -->


      <!-- DEBUT clear (Garanties) -->
      <div class="clear">
        <div class="wrapperHeader">GARANTIES</div>
        <!-- DEBUT wrapper-->
        <div class="wrapper">
          <div>
            <!-- DEBUT table4Cols-->
            <div class="table4Cols">
              <div class="tableHeader">Garanties</div>
            </div>
            <div class="table4Cols">
              <div class="tableHeader">Nature</div>
            </div>
            <div class="table4Cols">
              <div class="tableHeader">Valeur de la garantie</div>
            </div>
            <div class="table4Cols">
              <div class="tableHeader">Valeur retenue</div>
            </div>
            <!-- FIN table4Cols -->
          </div>
          <!-- FIN div1Col -->
          ${garantiesBlock}
        </div>
        <!-- FIN wrapper-->
      </div>
      <!-- FIN clear (Garanties) -->


      <!-- DEBUT clear (Evaluation des garanties) -->
      <div class="clear">
        <div class="wrapperHeader">ÉVALUATION DES GARANTIES</div>
        ${evaluationsBlock}
      </div>
      <!-- FIN clear (Evaluation des garanties) -->


      <!-- DEBUT clear (SUPER WRAPPER HEADER / GAGES) -->
      <div class="clear">
        <div class="wrapperHeader">GAGES</div>
        <!-- DEBUT wrapper-->
        ${gageDocsBlock}
        </div>
        <!-- FIN wrapper-->
      </div>
      <!-- FIN clear (SUPER WRAPPER HEADER / GAGES) -->

      ${loanSignaturesBlock}


      <!-- DEBUT clear (visites) -->
      <div class="clear">
        <div class="superWrapperHeader">VISITES DE TERRAIN</div>
        <!-- DEBUT superWrapper-->
        <div class="superWrapper">
        ${visitesBlock}
        </div>
        <!-- FIN superWrapper--> 
      </div>
      <!-- FIN clear (visites) -->


      <!-- DEBUT clear (ANALYSE DE LA DEMANDE) -->
      <div class="clear">
        <div class="wrapperHeader">ANALYSE DE LA DEMANDE</div>
        <!-- DEBUT WRAPPER-->
        <div class="wrapper">
          ${analyseAgentBlock}
        </div>
        <!-- FIN WRAPPER-->
      </div>
      <!-- FIN clear (ANALYSE DE LA DEMANDE) -->

      <div class="clear">
        <div class="superWrapperHeader">AVIS ET COMMENTAIRES</div>
        <!-- DEBUT superWrapper-->
        <div class="superWrapper">
           ${avisBlock}
        </div>
        <!-- FIN superWrapper-->
      </div>
      <!-- FIN clear (COMMENTAIRES) -->


      <!-- DEBUT clear (Cautions Solidaires) -->
      <div class="clear">
        <!-- DEBUT wraperHeader -->
        <div class="wrapperHeader">ATTESTATIONS DE CAUTIONS SOLIDAIRES</div>
        <!-- DEBUT wrapper -->
        <div class="wrapper">
          ${cautionsBlock}
        </div>
        <!-- FIN wrapper -->
      </div>
      <!-- FIN clear (Cautions Solidaires) -->
      

      <div class="clear">
        <div class="superWrapperHeader">DÉCICIONS ET VOTES</div>
        <!-- DEBUT superWrapper-->
        <div class="superWrapper">
           ${decicionsBlock}
        </div>
        <!-- FIN superWrapper-->
      </div>
      <!-- FIN clear (DÉCICIONS ET VOTES) -->

      ${analyseComiteBlock}
  
      
    </div>
    <!-- FIN app-->
  </body>
</html>
`;

  return new Promise((resolve, reject) => {
    var options = {
      format: "A4",
      border: {
        top: "40px", // default is 0, units: mm, cm, in, px
        right: "5",
        bottom: "40px",
        left: "5",
      },
      orientation: "portrait",
      footer: {
        height: "20mm",
        contents: {
          default:
            '<span style="color: #444; font-size: 12px">Page {{page}} sur {{pages}} | DOGA KABA</span>', // fallback value
        },
      },
      childProcessOptions: {
        env: {
          OPENSSL_CONF: "/dev/null",
        },
      },
    };
    pdf
      .create(docContent, options)
      .toFile(`${pdfFolder}/${pdfName}`, function (err, result) {
        if (result) {
          //const pdfFile = result.filename.split(`${pdfFolder}`)[1];
          resolve(pdfName);
        } else {
          resolve(null);
        }
      });
  });
}

// credit de groupe

export async function _loanFileShort({ pdfName, date, loan }) {
  //console.log(loan);
  // signature client
  const signatureClient =
    loan.clientSignature != null && loan.clientSignature != undefined
      ? `<img style="width: 95px" src="${SERVER_URL}/public_upload/${loan.clientSignature}" />`
      : "Non signé";

  // client picture
  const pictureClient = `<div style="width: 100%">
  <div style="border: solid 4px #ddd; 
  width: 200px; height: 200px; 
  border-radius: 100%; 
  text-align: center;
  float: left;
  overflow: hidden; margin: 10px auto;">
  <img src="${SERVER_URL}/public_upload/${loan.clientKey["photo"]}" height="200px" />
  </div>
  <div style="border: solid 4px #ddd; 
  width: 200px; height: 200px; 
  border-radius: 100%; 
  text-align: center;
  float: right;
  overflow: hidden; margin: 10px auto;">
  <img src="${SERVER_URL}/public_upload/${loan.clientKey["photo1"]}" height="200px" />
  </div>
</div>`;

  // signature animateur
  const signatureAnimateur =
    loan.montageParSignature != null && loan.montageParSignature != undefined
      ? `<img style="width: 95px" src="${SERVER_URL}/public_upload/${loan.montageParSignature}" />`
      : "Non signé";
  // commentaires
  let commentaires = [];
  let commentairesBlock = "";
  if ((await loan.avis.length) > 0) {
    for (let index = 0; index < (await loan.avis.length); index++) {
      const c = await loan.avis[index];
      const line = `<div class="pannel_inner">
      <div class="pannel_inner_label">${c.userKey["lastName"]} ${c.userKey["firstName"]}</div>
      <div class="pannel_inner_value">${c.message}</div>
      </div>`;
      commentaires.push(line);
    }
  } else {
    const line = `<div class="pannel_inner">
    <div class="pannel_inner_label">Désolé!</div>
    <div class="pannel_inner_value">Aucun commentaire</div>
    </div>`;
    commentaires.push(line);
  }
  commentaires.map((c) => {
    commentairesBlock = commentairesBlock + c;
  });

  let participants = [];
  let participantsBlock = "";
  for (let index = 0; index < (await loan.sessionDecisions.length); index++) {
    const p = await loan.sessionDecisions[index];
    const signature =
      p.signature != null && p.signature != undefined
        ? `<img style="width: 45px" src="${SERVER_URL}/public_upload/${p.signature}" />`
        : "Non signé";
    const line = `
    <div class="table_wrapper">
      <div class="table_col" style="width: 25%; height: 45px;">${
        p.userFullName
      }</div>

      <div class="table_col" style="width: 25%; height: 45px;">${
        p.roleName
      }</div>
      <div class="table_col" style="width: 10%; height: 45px;">${
        p.isFavorable == true ? "Pour" : "Contre"
      }</div>
      <div class="table_col" style="width: 20%; height: 45px;">${signature}</div>
    </div>`;
    participants.push(line);
  }
  participants.map((c) => {
    participantsBlock = participantsBlock + c;
  });

  let docContent = `<html> 
  <head>
  <style>
    html, body {
      margin: 20x;
      padding: 15px;
      font-family: "Times New Roman"; 
      font-size: 7px;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      box-sizing: border-box;
    }

    .table_wrapper {
      width: auto;
      margin: 6;
      position: relative;
      display: block;
    }

    .table_header { 
      background-color: #4d4d4d;
      padding: 5px 8px;
      display: inline-block;
      font-weight: bold;
      color: #ffffff;
      font-family: "Times New Roman";
      font-size: 12px;
    }

    .table_col { 
      background-color: #ffffff;
      padding-top: 4px;
      padding-bottom: 0px;
      padding-left: 8px;
      padding-right: 8px;
      margin: 0px;
      display: inline-block;
      font-weight: normal;
      color: #000000;
      font-family: "Times New Roman";
      font-size: 12px;
      border-top: 1px solid #6e6e6e;
      vertical-align: middle;
    }

    .table_col img {
      vertical-align: baseline;
    }

    .h1 {
      position: relative;
      display: block;
      width: auto;
      margin: 3px;
      padding: 5px 0px;
      background-color: #ffffff;
      font-size: 14px;
      font-family: "Times New Roman";
      font-weight: bold;
    }

    #app {
      max-width: 21cm;
      margin: 0 auto;
    } 

    .header {
      position: relative;
      display: block;
      background: #dddddd;
      page-break-after: auto;
      margin: 0px 0px 10px 0px;
      font-size: 13px;
      overflow: hidden;
      text-align: center;
      padding: 5px 10px;
      font-weight: bold;
      border: solid 1px #b5b5b5;
      font-family: "Times New Roman";
    }

    .div_line_wrapper {
      position: relative;
      display: block;
      width: auto;
      margin: 3px;
      padding: 3px;
      background-color: #ebebeb;
      font-size: 12px;
      font-family: "Times New Roman";
    }

    .pannel_wrapper {
      width: 100%;
      background-color: #ffffff;
      border: solid 1px #b3b3b3;
      margin-bottom: 5px;
      display: table;
    }

    .pannel_wrapper_sub {
      width: 100%;
      background-color: #ffffff;
      border: solid 1px #649ae1;
      margin-bottom: 4px;
      display: table;
    }

    .pannel_wrapper_sub_sub {
      width: 100%;
      background-color: #ffffff;
      border: solid 1px #932108;
      margin-bottom: 4px;
      display: table;
    }

    .panel_header {
      padding: 3px 5px;
      font-size: 13px;
      color: #ffffff;
      background-color: #3b3b3b;
      font-weight: bold;
      font-family: "Times New Roman";
      border: 0px;
    }

    .panel_header_sub {
      padding: 4px 8px;
      font-size: 15px;
      color: #ffffff;
      background-color: #145dbd;
      font-weight: bold;
      border: 0px;
    }

    .panel_header_sub_sub {
      padding: 4px 8px;
      font-size: 14px;
      color: #ffffff;
      background-color: #b72a0a;
      font-weight: bold;
      border: 0px;
    }

    .panel_header_sub_sub_black {
      padding: 4px 8px;
      font-size: 14px;
      color: #ffffff;
      background-color: #ed7b00;
      font-weight: bold;
      border: 0px;
      display: inline-block;
      width: 87%;
    }

    .pannel_inner {
      padding: 3px 5px;
      display: inline-block;
      word-break: break-all;
      overflow-wrap: break-word;
      hyphens: manual; 
      width: 95%;
    }

    .pannel_left {
      float: left;
      width: 49%;
    }

    .pannel_right {
      float: right;
      width: 49%;
    }

    .pannel_inner_label {
      font-size: 10px;
      font-family: "Times New Roman";
      color: #686868;
    }

    .pannel_inner_value {
      font-size: 10px;
      font-weight: bold;
      color: #000000;
      font-family: "Times New Roman";
      border-bottom: solid 1px #c2c2c2;
      padding-bottom: 2px;
    }

    .pannel_inner_pair {
      font-size: 10px;
      font-family: "Times New Roman";
      color: #686868;
    }

    .pannel_inner_par_value {
      font-size: 12px;
      font-weight: bold;
      color: #000000;
      font-family: "Times New Roman";
    }

    .center {
      text-align: center;
      display: block;
      margin-left: auto;
      margin-right: auto;
      width: auto;
    }
    
    </style>
    </head>

  <body>
      <div id="app">
      <div class="center">
        <img style="height: 40px; " src="${SERVER_URL}/public_files/logos/logo_assilassime.png" />
      </div>
          <div class="header">FICHE DE DEMANDE DE : ${loan.loanProductKey[
            "productName"
          ].toUpperCase()} </div>
          <div class="pannel_wrapper">
              <div class="panel_header">Sommaire</div>
              <div class="pannel_left">
                  <div class="pannel_inner">
                      <div class="pannel_inner_label">Date d'introduction</div>
                      <div class="pannel_inner_value">${date}</div>
                  </div>
                  <div class="pannel_inner">
                      <div class="pannel_inner_label">N. dossier (post décaissement)</div>
                      <div class="pannel_inner_value">${loan.codePRT}</div>
                  </div>
              </div>
  
              <div class="pannel_right">
                  <div class="pannel_inner">
                      <div class="pannel_inner_label">Animateur actuel</div>
                      <div class="pannel_inner_value">${
                        loan.animateurKey["lastName"]
                      } ${loan.animateurKey["firstName"]}</div>
                  </div>
                  <div class="pannel_inner">
                      <div class="pannel_inner_label">Agence</div>
                      <div class="pannel_inner_value">${loan.officeKey[
                        "officeName"
                      ].toUpperCase()}</div>
                  </div>
              </div>
          </div>

          ${pictureClient} 
  
          <!-- IDENTIFICATION -->
          <div class="pannel_wrapper">
              <div class="panel_header">Identification</div>
              <div class="pannel_left">
                  <div class="pannel_inner">
                      <div class="pannel_inner_label">Code SIG</div>
                      <div class="pannel_inner_value">${
                        loan.clientKey["code"]
                      }</div>
                  </div>
                  <div class="pannel_inner">
                      <div class="pannel_inner_label">Bénéficiaire</div>
                      <div class="pannel_inner_value">${
                        loan.clientKey["fullName"]
                      }</div>
                  </div>
                  <div class="pannel_inner">
                      <div class="pannel_inner_label">Groupement</div>
                      <div class="pannel_inner_value">${
                        loan.clientKey["groupName"]
                      }</div>
                  </div>
                  <div class="pannel_inner">
                      <div class="pannel_inner_label">Contacts</div>
                      <div class="pannel_inner_value">${
                        loan.clientKey["phone"]
                      }/${loan.clientKey["phoneAlt"]}</div>
                  </div>
              </div>
  
              <div class="pannel_right">
                  <div class="pannel_inner">
                      <div class="pannel_inner_label">Cycle de crédit</div>
                      <div class="pannel_inner_value">Numéro #${
                        loan.creditCycle
                      }</div>
                  </div>
                  <div class="pannel_inner">
                      <div class="pannel_inner_label">Montant du dernier crédit</div>
                      <div class="pannel_inner_value">${loan.previousLoanAmount.toLocaleString(
                        "fr-FR"
                      )}</div>
                  </div>
                  <div class="pannel_inner">
                      <div class="pannel_inner_label">Date de clôture du dernier crédit</div>
                      <div class="pannel_inner_value">${await customFullDate({
                        timeStamp: loan.previousLoanStartDate,
                      })}
                      </div>
                  </div>
                   
                   <div class="pannel_inner">
                      <div class="pannel_inner_label">${
                        loan.clientKey["contactsType"]
                      }</div>
                      <div class="pannel_inner_value">${
                        loan.clientKey["contactsTypeWho"]
                      }</div>
                  </div>
              </div>
          </div>
 
      <!-- AVIS ET COMMENTAIRES -->
      <div class="pannel_wrapper">
        <div class="panel_header">Avis et commentaires</div>
          ${commentairesBlock}
      </div> 

      <!-- ACCORD -->
      <div class="pannel_wrapper">
        <div class="panel_header">Décision du comité</div>
        <div class="pannel_inner">
          <div class="pannel_inner_label">Montant accordé</div>
          <div class="pannel_inner_value">${loan.montantCreditAccorde.toLocaleString(
            "fr-FR"
          )} </div>
        </div>
        <div class="pannel_inner">
          <div class="pannel_inner_label">Durée de remboursement</div>
          <div class="pannel_inner_value">${loan.dureeCreditAccorde} mois</div>
        </div>
      </div>

      <!-- SIGNATURES -->
      <div class="pannel_wrapper">
        <div class="panel_header">Signatures</div>

        <div class="pannel_left">
          <div class="pannel_inner">
            <div class="pannel_inner_label">Agent de crédit</div>
            <div class="pannel_inner_value">
            ${loan.montageParFullName}
            </div>
            ${signatureAnimateur}
          </div>
        </div>

        <div class="pannel_right">
          <div class="pannel_inner">
            <div class="pannel_inner_label">Le client</div>
            <div class="pannel_inner_value">${loan.clientKey["fullName"]}</div>
            ${signatureClient}
          </div>
        </div>

      </div>
      <!-- SIGNATURES -->


    <div class="h1">Ont pris part à la session</div>
    <div class="table_wrapper">
      <div class="table_header" style="width: 25%;">Identité</div>
      <div class="table_header" style="width: 25%;">Fonction</div>
      <div class="table_header" style="width: 10%;">Vote</div>
      <div class="table_header" style="width: 20%;">Signature</div>
    </div>
    ${participantsBlock}

  </body>
  </html>`;

  return new Promise((resolve, reject) => {
    var options = {
      format: "A4",
      border: {
        top: "40px", // default is 0, units: mm, cm, in, px
        right: "10",
        bottom: "40px",
        left: "10",
      },
      orientation: "portrait",
      footer: {
        height: "20mm",
        contents: {
          default:
            '<span style="color: #444; font-size: 12px">Page {{page}} sur {{pages}}</span>', // fallback value
        },
      },
      childProcessOptions: {
        env: {
          OPENSSL_CONF: "/dev/null",
        },
      },
    };
    pdf
      .create(docContent, options)
      .toFile(`public_docs/${pdfName}`, function (err, result) {
        if (result) {
          //const pdfFile = result.filename.split("/public_docs/")[1];
          resolve(pdfName);
        } else {
          resolve(null);
        }
      });
  });
}

// pour la CAISSE
export async function _loanFilesPDF_Caisse({
  pdfName,
  dateIntervalle,
  loanArr,
  paging,
}) {
  // commentaires
  let loans = [];
  let loansBlock = "";
  for (let index = 0; index < (await loanArr.length); index++) {
    const loan = await loanArr[index];
    const line = `<div class="pannel_wrapper">
    <div class="panel_header">${loan.activite}</div>
    <div class="pannel_left">
        <div class="pannel_inner">
            <div class="pannel_inner_label">Date probable décaissement</div>
            <div class="pannel_inner_value">${loan.dateDecaissement}</div>
        </div>
        <div class="pannel_inner">
            <div class="pannel_inner_label">Bénéficiaire (${
              loan.clientCode
            })</div>
            <div class="pannel_inner_value">${loan.clientFullName}</div>
        </div>
        <div class="pannel_inner">
            <div class="pannel_inner_label">Montant demandé</div>
            <div class="pannel_inner_value">${loan.amount.toLocaleString(
              "fr-FR"
            )}</div>
        </div>
        <div class="pannel_inner">
            <div class="pannel_inner_label">Produit</div>
            <div class="pannel_inner_value">${loan.produit}</div>
        </div>
        
    </div>

    <div class="pannel_right">
        <div class="pannel_inner">
            <div class="pannel_inner_label">Credit precedent</div>
            <div class="pannel_inner_value">${loan.montantCreditPrecedent.toLocaleString(
              "fr-FR"
            )}</div>
        </div>
        <div class="pannel_inner">
            <div class="pannel_inner_label">Agent de crédit</div>
            <div class="pannel_inner_value">${loan.animateurFullName}</div>
        </div>
        <div class="pannel_inner">
            <div class="pannel_inner_label">Durée</div>
            <div class="pannel_inner_value">${loan.duree} mois</div>
        </div>
        <div class="pannel_inner">
            <div class="pannel_inner_label">Cycle, différé</div>
            <div class="pannel_inner_value">#${loan.cycle}, ${
      loan.differe
    } mois de différé</div>
        </div>
    </div>
</div> `;
    loans.push(line);
  }
  loans.map((c) => {
    loansBlock = loansBlock + c;
  });

  let docContent = `<html> 
  <head>
  <style>
    html, body {
      margin: 20x;
      padding: 15px;
      font-family: "Times New Roman"; 
      font-size: 7px;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      box-sizing: border-box;
    }

    .table_wrapper {
      width: auto;
      margin: 6;
      position: relative;
      display: block;
    }

    .table_header { 
      background-color: #4d4d4d;
      padding: 5px 8px;
      display: inline-block;
      font-weight: bold;
      color: #ffffff;
      font-family: "Times New Roman";
      font-size: 12px;
    }

    .table_col { 
      background-color: #ffffff;
      padding-top: 4px;
      padding-bottom: 0px;
      padding-left: 8px;
      padding-right: 8px;
      margin: 0px;
      display: inline-block;
      font-weight: normal;
      color: #000000;
      font-family: "Times New Roman";
      font-size: 12px;
      border-top: 1px solid #6e6e6e;
      vertical-align: middle;
    }

    .table_col img {
      vertical-align: baseline;
    }

    .h1 {
      position: relative;
      display: block;
      width: auto;
      margin: 3px;
      padding: 5px 0px;
      background-color: #ffffff;
      font-size: 14px;
      font-family: "Times New Roman";
      font-weight: bold;
    }

    #app {
      max-width: 21cm;
      margin: 0 auto;
    } 

    .header {
      position: relative;
      display: block;
      background: #dddddd;
      page-break-after: auto;
      margin: 0px 0px 10px 0px;
      font-size: 13px;
      overflow: hidden;
      text-align: center;
      padding: 5px 10px;
      font-weight: bold;
      border: solid 1px #b5b5b5;
      font-family: "Times New Roman";
    }

    .div_line_wrapper {
      position: relative;
      display: block;
      width: auto;
      margin: 3px;
      padding: 3px;
      background-color: #ebebeb;
      font-size: 12px;
      font-family: "Times New Roman";
    }

    .pannel_wrapper {
      width: 100%;
      background-color: #ffffff;
      border: solid 1px #b3b3b3;
      margin-bottom: 5px;
      display: table;
    }

    .pannel_wrapper_sub {
      width: 100%;
      background-color: #ffffff;
      border: solid 1px #649ae1;
      margin-bottom: 4px;
      display: table;
    }

    .pannel_wrapper_sub_sub {
      width: 100%;
      background-color: #ffffff;
      border: solid 1px #932108;
      margin-bottom: 2x; 
      display: table;
    }

    .panel_header {
      padding: 3px 5px;
      font-size: 12px;
      color: #ffffff;
      background-color: #3b3b3b;
      font-weight: bold;
      font-family: "Times New Roman";
      border: 0px;
    }

    .panel_header_sub {
      padding: 4px 8px;
      font-size: 12px;
      color: #ffffff;
      background-color: #145dbd;
      font-weight: bold;
      border: 0px;
    }

    .panel_header_sub_sub {
      padding: 4px 8px;
      font-size: 12px;
      color: #ffffff;
      background-color: #b72a0a;
      font-weight: bold;
      border: 0px;
    }

    .panel_header_sub_sub_black {
      padding: 4px 8px;
      font-size: 12px;
      color: #ffffff;
      background-color: #ed7b00;
      font-weight: bold;
      border: 0px;
      display: inline-block;
      width: 87%;
    }

    .pannel_inner {
      padding: 3px 5px;
      display: inline-block;
      word-break: break-all;
      overflow-wrap: break-word;
      hyphens: manual; 
      width: 95%;
    }

    .pannel_left {
      float: left;
      width: 49%;
    }

    .pannel_right {
      float: right;
      width: 49%;
    }

    .pannel_inner_label {
      font-size: 10px;
      font-family: "Times New Roman";
      color: #686868;
      margin-bottom: 2px;
    }

    .pannel_inner_value {
      font-size: 10px;
      font-weight: bold;
      color: #000000;
      font-family: "Times New Roman";
      border-top: solid 1px #dbdbdb;
      padding-bottom: 2px;
    }

    .pannel_inner_pair {
      font-size: 10px;
      font-family: "Times New Roman";
      color: #686868;
    }

    .pannel_inner_par_value {
      font-size: 12px;
      font-weight: bold;
      color: #000000;
      font-family: "Times New Roman";
    }

    .center {
      text-align: center;
      display: block;
      margin-left: auto;
      margin-right: auto;
      width: auto;
    }
    
    </style>
  </head>

  <body>
      <div id="app">
      <div class="center">
      <img style="height: 60px; margin-bottom: 10px;" src="${SERVER_URL}/public_files/logos/logo_imf.png" />
      </div>
          <div class="header">DEMANDES DE CRÉDIT : ${loanArr[0].status}<br />
            ${dateIntervalle}<br />Agence : ${loanArr[0].antenne} (${paging})
          </div> 
          ${loansBlock}
      </div>
  </body>
  </html>`;

  return new Promise((resolve, reject) => {
    var options = {
      format: "A4",
      border: {
        top: "25px", // default is 0, units: mm, cm, in, px
        right: "10",
        bottom: "25px",
        left: "10",
      },
      orientation: "portrait",
      footer: {
        height: "20mm",
        contents: {
          default:
            '<span style="color: #444; font-size: 12px">Page {{page}} sur {{pages}}</span> | DOGA KABA', // fallback value
        },
      },
      childProcessOptions: {
        env: {
          OPENSSL_CONF: "/dev/null",
        },
      },
    };
    pdf
      .create(docContent, options)
      .toFile(`public_docs/${pdfName}`, function (err, result) {
        if (result) {
          //const pdfFile = result.filename.split("/public_docs/")[1];
          resolve(pdfName);
        } else {
          resolve(null);
        }
      });
  });
}

// tableau d'amortissement
// https://www.npmjs.com/package/convertir-nombre-lettre
export async function _downloadPayCalendar({
  pdfName,
  pdfFolder,
  loan,
  product,
  client,
  group,
}) {
  // commentaires
  let loans = [];
  let loansBlock = "";
  // 2592000000 miliseconds = 30 days = 1 month
  // const oneMonth = 2592000000;
  let sumMensualite = 0;

  const oneMonth = 2629800000; // 1 mois
  let freqValue = 0;

  switch (await loan.frequenceRemboursement) {
    case "Hebdomadaire":
      freqValue = oneMonth / 4;
      break;
    case "Bimensuelle":
      freqValue = oneMonth / 2;
      break;
    case "Mensuelle":
      freqValue = oneMonth;
      break;
    case "Bimestrielle":
      freqValue = oneMonth * 2;
      break;
    case "Trimestrielle":
      freqValue = oneMonth * 3;
      break;

    case "Quadrimestrielle":
      freqValue = oneMonth * 4;
      break;
    case "Semestrielle":
      freqValue = oneMonth * 6;
      break;
    case "Annuelle":
      freqValue = oneMonth * 12;
      break;
    case "In-fine":
      freqValue = 0;
      break;
    default:
      break;
  }

  const _montantCredit = await loan.montantCreditDemande;

  if ((await loan.frequenceRemboursement) != "In-fine") {
    for (let i = 0; i < (await loan.nombreEcheances); i++) {
      const inter = (await loan.interets) / (await loan.nombreEcheances);
      const interet = parseInt(inter.toFixed(0)).toLocaleString("fr-FR");
      const capital = _montantCredit / (await loan.nombreEcheances);
      const mens = (
        (_montantCredit + (await loan.interets)) /
        (await loan.nombreEcheances)
      ).toFixed(0);
      const mensualite = parseInt(mens).toLocaleString("fr-FR");
      sumMensualite = sumMensualite + parseInt(mens);
      const date =
        (await loan.dateDecaissement) != null &&
        (await loan.dateDecaissement) > 0
          ? await dateShotCutAmortissement({
              timeStamp: (await loan.dateDecaissement) + freqValue,
              frequence: await loan.frequenceRemboursement,
              index: i + 1, // 1, 3, 4, 5 ...
              nextPaymentStamp: freqValue * i,
            })
          : "--/--/----";
      //
      /*const krest =
        (await loan.montantCreditDemande) -
        ((await loan.montantCreditDemande) / (await loan.dureeCreditDemande)) *
          ((i + 1) * 1);*/

      const krest = _montantCredit - capital * (i + 1);
      console.log(krest);
      //const filiere = await loan.filieres[index];
      const line = `<div class="table_col_wrapper">
            <div class="table_col_col1">${i + 1}</div>
            <div class="table_col_col2">${date}</div>
            <div class="table_col_col3">${mensualite}</div>
            <div class="table_col_col4">${interet}</div>
            <div class="table_col_col5">${capital.toLocaleString("fr-FR")}</div>
            <div class="table_col_col6">${krest.toLocaleString("fr-FR")}</div>
          </div>`;
      loans.push(line);
    }
    loans.map((c) => {
      loansBlock = loansBlock + c;
    });
  } else {
    // In-fine
    let capital = 0;
    let mensualite = 0;
    let mens = 0;
    let inter = 0;
    let interet = 0;
    let krest = 0;

    if (
      product.interestFrequency ==
        "À toutes les échéances y compris la dernière" &&
      product.kapitalFrenquency ==
        "À toutes les échéances y compris la dernière"
    ) {
      //
    } else if (
      product.interestFrequency ==
        "À toutes les échéances y compris la dernière" &&
      product.kapitalFrenquency == "À toutes les échéances sauf la dernière"
    ) {
      //
    } else if (
      product.interestFrequency ==
        "À toutes les échéances y compris la dernière" &&
      product.kapitalFrenquency == "Uniquement à la dernière échéance"
    ) {
      //
    } else if (
      product.interestFrequency == "À toutes les échéances sauf la dernière" &&
      product.kapitalFrenquency ==
        "À toutes les échéances y compris la dernière"
    ) {
      //
    } else if (
      product.interestFrequency == "À toutes les échéances sauf la dernière" &&
      product.kapitalFrenquency == "Uniquement à la dernière échéance"
    ) {
      //
    }

    for (let i = 0; i < (await loan.nombreEcheances); i++) {
      if (i == (await loan.nombreEcheances) - 1) {
        capital = (await loan.montantCreditDemande).toLocaleString("fr-FR");

        inter = 0;
        interet = 0;
        krest = 0;
      } else {
        capital = 0;
        inter = (await loan.interets) / (await loan.nombreEcheances);
        interet = parseInt(inter.toFixed(0)).toLocaleString("fr-FR");
        krest = await loan.montantCreditDemande;
      }

      if (i == (await loan.nombreEcheances) - 1) {
        mens = (await loan.nombreEcheances).toFixed(0);
        mensualite = parseInt(mens).toLocaleString("fr-FR");
        sumMensualite = sumMensualite + parseInt(mens);
      } else {
        mens = ((await loan.interets) / (await loan.nombreEcheances)).toFixed(
          0
        );
        mensualite = parseInt(mens).toLocaleString("fr-FR");
        //sumMensualite = sumMensualite + parseInt(mens);
      }

      const date =
        (await loan.timeStamp) != null && (await loan.timeStamp) > 0
          ? await dateShotCutAmortissement({
              timeStamp: await loan.timeStamp,
              index: i + 1,
              differe: await loan.differe,
            })
          : "--/--/----";
      //

      //const filiere = await loan.filieres[index];
      const line = `<div class="table_col_wrapper">
            <div class="table_col_col1">${i + 1}</div>
            <div class="table_col_col2">${date}</div>
            <div class="table_col_col3">${mensualite}</div>
            <div class="table_col_col4">${interet}</div>
            <div class="table_col_col5">${capital}</div>
            <div class="table_col_col6">${krest.toLocaleString("fr-FR")}</div>
          </div>`;
      loans.push(line);
    }
    loans.map((c) => {
      loansBlock = loansBlock + c;
    });
  }

  /*
  for (let i = 0; i < (await loan.dureeCreditDemande); i++) {
    const inter = (await loan.interets) / (await loan.dureeCreditDemande);
    const interet = parseInt(inter.toFixed(0)).toLocaleString("fr-FR");
    const capital = (
      (await loan.montantCreditDemande) / (await loan.dureeCreditDemande)
    ).toLocaleString("fr-FR");
    const mens = (
      ((await loan.montantCreditDemande) + (await loan.interets)) /
      (await loan.dureeCreditDemande)
    ).toFixed(0);
    const mensualite = parseInt(mens).toLocaleString("fr-FR");
    sumMensualite = sumMensualite + parseInt(mens);
    const date =
      (await loan.timeStamp) != null && (await loan.timeStamp) > 0
        ? await dateShotCutAmortissement({
            timeStamp: await loan.timeStamp,
            index: i + 1,
            differe: await loan.differe,
          })
        : "--/--/----";
    //
    const krest =
      (await loan.montantCreditDemande) -
      ((await loan.montantCreditDemande) / (await loan.dureeCreditDemande)) *
        ((i + 1) * 1);
    //const filiere = await loan.filieres[index];
    const line = `<div class="table_col_wrapper">
          <div class="table_col_col1">${i + 1}</div>
          <div class="table_col_col2">${date}</div>
          <div class="table_col_col3">${mensualite}</div>
          <div class="table_col_col4">${interet}</div>
          <div class="table_col_col5">${capital}</div>
          <div class="table_col_col6">${krest.toLocaleString("fr-FR")}</div>
        </div>`;
    loans.push(line);
  }
  loans.map((c) => {
    loansBlock = loansBlock + c;
  });*/

  let docContent = `<html>
  <head>
    <style>
      html,
      body {
        margin: 20x;
        padding: 15px;
        font-family: "Times New Roman";
        font-size: 7px;
        background: #ffffff;
        -webkit-print-color-adjust: exact;
        box-sizing: border-box;
      }

      .h1 {
        position: relative;
        display: block;
        width: auto;
        margin: 3px;
        padding: 5px 0px;
        background-color: #ffffff;
        font-size: 14px;
        font-family: "Times New Roman";
        font-weight: bold;
      }

      #app {
        max-width: 21cm;
        margin: 0 auto;
      }

      .header {
        position: relative;
        display: block;
        background: #dddddd;
        page-break-after: auto;
        margin: 0px 0px 0px 0px;
        font-size: 13px;
        overflow: hidden;
        text-align: center;
        padding: 5px 10px;
        font-weight: bold;
        border: solid 1px #b5b5b5;
        font-family: "Times New Roman";
      }

      .center {
        text-align: center;
        display: block;
        margin-left: auto;
        margin-right: auto;
        width: auto;
      }

      .client {
        width: 500px;
        border: solid 0px #e40909;
        background-color: #ffffff;
        height: 20px;
        font-family: "Times New Roman";
      }

      .clt_col_1 {
        width: 145px;
        float: left;
        padding: 3px 8px;
        font-size: 10px;
        border: 1px solid #686868;
        margin: 1px;
        font-family: "Times New Roman";
      }
      .clt_col_2 {
        width: 310px;
        float: left;
        padding: 3px 8px;
        font-size: 10px;
        border: 1px solid #686868;
        margin: 1px;
        font-family: "Times New Roman";
      }

      .sommaire {
        width: 500px;
        border: solid 0px #e40909;
        background-color: #ffffff;
        height: 45px;
        font-family: "Times New Roman";
      }

      .som_col_1 {
        width: 144px;
        float: left;
        padding: 3px 8px;
        font-size: 10px;
        border: 1px solid #686868;
        margin: 1px;
        font-family: "Times New Roman";
      }
      .som_col_2 {
        width: 144px;
        float: left;
        padding: 3px 8px;
        font-size: 10px;
        border: 1px solid #686868;
        margin: 1px;
        font-family: "Times New Roman";
      }
      .som_col_3 {
        width: 144px;
        float: left;
        padding: 3px 8px;
        font-size: 10px;
        border: 1px solid #686868;
        margin: 1px;
        font-family: "Times New Roman";
      }

      .table_header_wrapper {
        width: 500px;
        border: solid 0px #ff0f0f;
        height: 22px;
        font-family: "Times New Roman";
      }
      .table_header_col1 {
        width: 25px;
        float: left;
        font-size: 10px;
        font-weight: bold;
        background-color: #e6e6e6;
        color: #000000;
        margin: 1px;
        padding: 3px 6px;
        border: solid 1px #c2c2c2;
        font-family: "Times New Roman";
      }
      .table_header_col2 {
        width: 75px;
        float: left;
        font-size: 10px;
        font-weight: bold;
        background-color: #e6e6e6;
        color: #000000;
        margin: 1px;
        padding: 3px 6px;
        border: solid 1px #c2c2c2;
        font-family: "Times New Roman";
      }
      .table_header_col3 {
        width: 75px;
        float: left;
        font-size: 10px;
        font-weight: bold;
        background-color: #e6e6e6;
        color: #000000;
        margin: 1px;
        padding: 3px 6px;
        border: solid 1px #c2c2c2;
        font-family: "Times New Roman";
      }
      .table_header_col4 {
        width: 75px;
        float: left;
        font-size: 10px;
        font-weight: bold;
        background-color: #e6e6e6;
        color: #000000;
        margin: 1px;
        padding: 3px 6px;
        border: solid 1px #c2c2c2;
        font-family: "Times New Roman";
      }
      .table_header_col5 {
        width: 75px;
        float: left;
        font-size: 10px;
        font-weight: bold;
        background-color: #e6e6e6;
        color: #000000;
        margin: 1px;
        padding: 3px 6px;
        border: solid 1px #c2c2c2;
        font-family: "Times New Roman";
      }
      .table_header_col6 {
        width: 75px;
        float: left;
        font-size: 10px;
        font-weight: bold;
        background-color: #e6e6e6;
        color: #000000;
        margin: 1px;
        padding: 3px 6px;
        border: solid 1px #c2c2c2;
        font-family: "Times New Roman";
      }

      .table_col_wrapper {
        width: 500px;
        border: solid 0px #014ae6;
        height: 20px;
        font-family: "Times New Roman";
      }
      .table_col_col1 {
        width: 25px;
        float: left;
        font-size: 10px; 
        background-color: #fff;
        color: #000000;
        margin: 1px;
        padding: 3px 6px;
        border: solid 1px #c2c2c2;
        font-family: "Times New Roman";
      }
      .table_col_col2 {
        width: 75px;
        float: left;
        font-size: 10px;
        background-color: #fff;
        color: #000000;
        margin: 1px;
        padding: 3px 6px;
        border: solid 1px #c2c2c2;
        font-family: "Times New Roman";
      }
      .table_col_col3 {
        width: 75px;
        float: left;
        font-size: 10px;
        background-color: #fff;
        color: #000000;
        margin: 1px;
        padding: 3px 6px;
        border: solid 1px #c2c2c2;
        font-family: "Times New Roman";
      }
      .table_col_col4 {
        width: 75px;
        float: left;
        font-size: 10px;
        background-color: #fff;
        color: #000000;
        margin: 1px;
        padding: 3px 6px;
        border: solid 1px #c2c2c2;
        font-family: "Times New Roman";
      }
      .table_col_col5 {
        width: 75px;
        float: left;
        font-size: 10px;
        background-color: #fff;
        color: #000000;
        margin: 1px;
        padding: 3px 6px;
        border: solid 1px #c2c2c2;
        font-family: "Times New Roman";
      }
      .table_col_col6 {
        width: 75px;
        float: left;
        font-size: 10px;
        background-color: #fff;
        color: #000000;
        margin: 1px;
        padding: 3px 6px;
        border: solid 1px #c2c2c2;
        font-family: "Times New Roman";
      }
    </style>
  </head>

  <body>
    <div id="app">
      <div class="center">
      <img style="height: 60px; margin-bottom: 10px;" src="${SERVER_URL}/public_files/logos/logo_imf.png" />
      </div>
      <div class="header">TABLEAU D'AMORTISSEMENT</div>

      <div class="h1 center">${product.productName}</div>

      <!-- CLIENT  -->
      <div class="client">
        <div class="clt_col_1">Code SIG: <strong>${
          client != null ? client.codeSig : group.groupCode
        }</strong></div>
        <div class="clt_col_2">
          Identité: <strong>${
            client != null ? client.fullName : group.groupName
          }</strong>
        </div>
      </div>
      <!-- CLIENT FIN -->

      <!-- SOMMAIRE -->
      <div class="sommaire">
        <div>
          <div class="som_col_1">Prêt: <strong>${loan.montantCreditDemande.toLocaleString(
            "fr-FR"
          )}</strong></div>
          <div class="som_col_2">Périodicité: <strong>${
            loan.frequenceRemboursement
          }</strong></div>
          <div class="som_col_3"<strong>${
            loan.nombreEcheances
          }</strong> échéances | <strong>${
    loan.dureeCreditDemande
  }</strong> mois</div>
        </div>
        <div>
          <div class="som_col_1">Taux annuel: <strong>${
            loan.tauxInterets
          }%</strong></div>
          <div class="som_col_2">Intérêts: <strong> ${loan.interets.toLocaleString(
            "fr-FR"
          )}</strong></div>
          <div class="som_col_3">Différé: <strong>${
            loan.differe
          } mois</strong></div>
        </div>
      </div>
      <!-- TABLE HEADER DEBUT -->
      <div class="table_header_wrapper">
        <div class="table_header_col1">N.</div>
        <div class="table_header_col2">Date</div>
        <div class="table_header_col3">Mensualité</div>
        <div class="table_header_col4">Intérêts</div>
        <div class="table_header_col5">Capital</div>
        <div class="table_header_col6">K restant</div>
      </div>
      <!-- TABLE HEADER FIN -->
      <!-- TABLE COL DEBUT -->
      ${loansBlock}
      <!-- TABLE COL FIN -->

      <div class="table_header_wrapper">
        <div class="table_header_col1">-</div>
        <div class="table_header_col2">-</div>
        <div class="table_header_col3">${sumMensualite.toLocaleString(
          "fr-FR"
        )}</div>
        <div class="table_header_col4">${await loan.interets.toLocaleString(
          "fr-FR"
        )}</div>
        <div class="table_header_col5">${(
          await loan.montantCreditDemande
        ).toLocaleString("fr-FR")}</div>
        <div class="table_header_col6">-</div>
      </div>
    </div>
  </body>
</html>
`;

  return new Promise((resolve, reject) => {
    var options = {
      format: "A4",
      border: {
        top: "25px", // default is 0, units: mm, cm, in, px
        right: "10",
        bottom: "25px",
        left: "10",
      },
      orientation: "portrait",
      footer: {
        height: "20mm",
        contents: {
          default:
            '<span style="color: #444; font-size: 12px">Page {{page}} sur {{pages}} | DOGA KABA</span>', // fallback value
        },
      },
      childProcessOptions: {
        env: {
          OPENSSL_CONF: "/dev/null",
        },
      },
    };
    pdf
      .create(docContent, options)
      .toFile(`public_docs/${pdfName}`, function (err, result) {
        if (result) {
          //const pdfFile = result.filename.split("/public_docs/")[1];
          resolve(pdfName);
        } else {
          resolve(null);
        }
      });
  });
}
