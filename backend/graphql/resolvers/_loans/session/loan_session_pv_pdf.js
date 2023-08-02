import numeral from "numeral";
import pdf from "html-pdf";

import dotenv from "dotenv";
dotenv.config();
const SERVER_URL = `http://localhost:${process.env.PORT_SERVER_APP}`; // do not change localhost, even on production mode

export async function _loanSessionPvPdf({ pdfName, date, data, pdfFolder }) {
  console.log();
  // participants list
  let participants = [];
  let participantsBlock = "";
  for (let index = 0; index < (await data.participantKeys.length); index++) {
    const p = await data.participantKeys[index];
    const signature =
      p.signature != null && p.signature != undefined
        ? `<img style="width: 45px" src="${SERVER_URL}/public_upload/${p.signature}" />`
        : "Non signé";
    const roleName = p.roleKey["label"];
    const line = `
    <div class="table_wrapper">
      <div class="table_col" style="width: 19%; height: 45px;">${p.lastName}</div>
      <div class="table_col" style="width: 27%; height: 45px;">${p.firstName}</div>
      <div class="table_col" style="width: 23%; height: 45px;">${roleName}</div>
      <div class="table_col" style="width: 13%; height: 45px;">${signature}</div>
    </div>`;
    participants.push(line);
  }
  participants.map((r) => {
    participantsBlock = participantsBlock + r;
  });

  // Don’t ever use await with forEach. Use a for-loop (or any loop without a callback) instead.
  // If you want to execute await calls in series, use a for-loop (or any loop without a callback).
  // Don’t await inside filter and reduce. Always await an array of promises with map, then filter or reduce accordingly.
  // https://zellwk.com/blog/async-await-in-loops/
  let fileList = [];
  let fileListBlock = "";
  for (let index = 0; index < data.fileKeys.length; index++) {
    const p = await data.fileKeys[index];
    var line = `<div class="table_wrapper">
    <div class="table_col" style="width: 16%; height: 28px;">
    ${p.loanProductKey["productName"]}
    </div>
    <div class="table_col" style="width: 19%; height: 28px;">
      ${p.animateurKey.lastName}<br />
      ${p.animateurKey.firstName}<br />
      +${p.animateurKey.username}
    </div>
    
    <div class="table_col" style="width: 21%; height: 28px;">
      <strong>${p.filieres[0]["clientName"]}</strong><br />
      Code Sig: ${p.filieres[0]["clientAccount"]}<br /> 
      Tél: ${p.filieres[0]["clientContact"]}
    </div>
    <div class="table_col" style="width: 10%; height: 28px;">
      ${numeral(p.montantCreditDemande).format(0, 0.0)}<br />
      ${numeral(p.montantCreditAccorde).format(0, 0.0)}<br />
      <strong>${p.status}</strong>
    </div>
    <div class="table_col" style="width: 4%; height: 28px;">${
      p.dureeCreditAccorde
    }</div>
    <div class="table_col" style="width: 4%; height: 28px;">${
      p.differe != null ? p.differe : "-"
    }</div>
  </div>`;
    fileList.push(line);
  }
  fileList.map((r) => {
    fileListBlock = fileListBlock + r;
  });

  // content
  let docContent = `<html>
  <head>
    <meta charset="utf8"> 
    <style>
      html, body {
        margin: 20x;
        padding: 15px;
        font-family: "Times New Roman";
        font-weight: 500;
        font-size: 7px;
        background: #ffffff;
        -webkit-print-color-adjust: exact;
        box-sizing: border-box;
      }

      .header {
        position: relative;
        display: block;
        background: #dddddd;
        page-break-after: auto;
        margin: 5px;
        font-size: 21px;
        overflow: hidden;
        text-align: center;
        padding: 15px;
        font-weight: bold;
        border: solid 1px #a8a8a8;
        font-family: "Times New Roman"; 
      } 

      .div_line_wrapper {
        position: relative;
        display: block;
        width: auto;
        margin: 6px;
        padding: 6px 10px;
        background-color: #ebebeb;
        border: solid 1px #9e9e9e;
        font-size: 13px;
        font-family: "Times New Roman";
      }

      .h1 {
        position: relative;
        display: block;
        width: auto;
        margin: 3px;
        padding: 5px 0px;
        background-color: #ffffff;
        font-size: 13px;
        font-family: "Times New Roman";
        font-weight: bold;
      }

      .table_wrapper {
        width: auto;
        margin: 0px;
        position: relative;
        display: block;
      }

      .table_header { 
        background-color: #4d4d4d;
        padding: 6px 10px;
        display: inline-block;
        font-weight: bold;
        color: #ffffff;
        font-family: "Times New Roman";
        font-size: 11px;
      }

      .table_col { 
        background-color: #ffffff;
        padding: 10px 10px;
        display: inline-block;
        font-weight: normal;
        color: #000000;
        font-family: "Times New Roman";
        font-size: 10px;
        border-bottom: 1px solid #6e6e6e;
        vertical-align: middle;
      }

      .table_col img {
        vertical-align: baseline;
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
    <div class="center">
      <img style="height: 60px; " src="${SERVER_URL}/public_files/logos/logo_imf.png" />
    </div>
    <div class="header">
    PROCÈS VERBAL<br />
    ${data.sessionLabel.toUpperCase()}
    </div>

    <div class="div_line_wrapper">
    Session : <strong>${data._key}</strong>
    </div>

    <div class="div_line_wrapper">
    Date: <strong>${date}</strong>
    </div>

    <div class="div_line_wrapper">
    Agence : <strong>${data.officeKey["officeName"]}</strong>
    </div>

    <div class="div_line_wrapper">
    Nombre de dossiers étudiés : <strong>${data.fileKeys.length}</strong>
    </div>

    <div class="div_line_wrapper">
    Montant total des dossiers étudiés : <strong>${numeral(
      data.totalMontantAnaylse
    ).format(0, 0.0)}</strong>
    </div>

    <div class="div_line_wrapper">
    Montant total des dossiers accordés : <strong>${numeral(
      data.totalMontantAccorde
    ).format(0, 0.0)}</strong>
    </div>

    <div class="div_line_wrapper">
    Montant total des dossiers rejetés : <strong>${numeral(
      data.totalMontantRejete
    ).format(0, 0.0)}</strong>
    </div>

    <div class="div_line_wrapper">
    Montant total des dossiers ajournés : <strong>${numeral(
      data.totalMontantAjourne
    ).format(0, 0.0)}</strong>
    </div>

    

    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    <div class="h1">
    Liste des décideurs
    </div>

    <div class="table_wrapper">
      <div class="table_header" style="width: 19%;">Nom</div>
      <div class="table_header" style="width: 27%;">Prénom(s)</div>
      <div class="table_header" style="width: 23%;">Fonction</div>
      <div class="table_header" style="width: 13%;">Signature</div>
    </div>
    ${participantsBlock}


    <br />
    <br />
    <div class="h1">
    Liste des dossiers étudés (${fileList.length})
    </div>
    <div class="table_wrapper">
      <div class="table_header" style="width: 16%;">Groupe/Produit</div>
      <div class="table_header" style="width: 19%;">Animateur</div>
      <div class="table_header" style="width: 21%;">Bénéficiaire</div>
      <div class="table_header" style="width: 10%;">Montants</div>
      <div class="table_header" style="width: 4%;">Dur</div>
      <div class="table_header" style="width: 4%;">Dif</div>
    </div>
    ${fileListBlock}


  </body>
</html>`;
  //console.log(`docContent: ${docContent}`);

  return new Promise((resolve, reject) => {
    // portrait or landscape
    var options = {
      format: "A4",
      orientation: "landscape",
      border: {
        top: "30px", // default is 0, units: mm, cm, in, px
        right: "20px",
        bottom: "30px",
        left: "20px",
      },
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
          //const pdfFile = result.filename.split(`/${pdfFolder}/`)[1];
          resolve(pdfName);
        } else {
          console.log(`PDF ERROR: ${err}`);
          resolve(null);
        }
      });
  });
}
