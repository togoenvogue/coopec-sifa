import pdf from "html-pdf"; // https://www.npmjs.com/package/html-pdf?activeTab=readme
import numeral from "numeral";

import dotenv from "dotenv";
dotenv.config();
const SERVER_URL = `http://localhost:${process.env.PORT_SERVER_APP}`; // do not change localhost, even on production mode

export async function _printLoanReporting({
  labels,
  counts,
  type,
  product,
  activityCategory,
  totaux,
  status,
  pdfName,
  pdfFolder,
  coverage,
  date,
  antenne,
}) {
  let labelsArr = [];
  let labelsBlock = "";
  for (let index = 0; index < labels.length; index++) {
    const name = labels[index];
    const count = counts[index];
    const percent = ((counts[index] * 100) / totaux).toFixed(2);

    const line = `
    <div class="table_wrapper">
      <div class="table_col" style="width: 67%;">${name}</div>
      <div class="table_col" style="width: 15%;">${numeral(count).format(
        "0,0"
      )}</div>
      <div class="table_col" style="width: 10%;">${percent}%</div> 
    </div>`;
    labelsArr.push(line);
  }
  labelsArr.map((c) => {
    labelsBlock = labelsBlock + c;
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
      margin: 10px 0px;
      position: relative;
      display: block;
    }

    .table_header { 
      background-color: #787878;
      padding: 5px 5px;
      display: inline-block;
      font-weight: bold;
      color: #ffffff;
      font-family: "Times New Roman";
      font-size: 12px;
    }

    .table_col { 
      background-color: #ffffff;
      padding: 0px 5px 5px 5px;
      display: inline-block;
      font-weight: normal;
      color: #000000;
      font-family: "Times New Roman";
      font-size: 12px;
      border-bottom: 1px solid #6e6e6e;
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
      font-size: 17px;
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
      padding: 5px 5px 0 5px;
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
      font-size: 11px;
      font-weight: bold;
      color: #000000;
      font-family: "Times New Roman";
      border-bottom: solid 1px #c2c2c2;
      padding-bottom: 4px;
    }

    .pannel_inner_pair {
      font-size: 11px;
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
        <img style="height: 30px; margin-bottom: 10px;" src="${SERVER_URL}/public_files/logos/logo_assilassime.png" />
      </div>
          <div class="header">STATISTIQUES DE GESTION DES DEMANDES DE CRÉDIT</div>
          <div class="pannel_wrapper">
              <div class="panel_header">Sommaire</div>
              <div class="pannel_left">
                  <div class="pannel_inner">
                      <div class="pannel_inner_label">Année / période</div>
                      <div class="pannel_inner_value">${date}</div>
                  </div>
                  <div class="pannel_inner">
                      <div class="pannel_inner_label">Statut des dossiers</div>
                      <div class="pannel_inner_value">${status}</div>
                  </div>
                  <div class="pannel_inner">
                      <div class="pannel_inner_label">Produit(s)</div>
                      <div class="pannel_inner_value">${product}</div>
                  </div>
              </div>
  
              <div class="pannel_right">
                  <div class="pannel_inner">
                      <div class="pannel_inner_label">Type</div>
                      <div class="pannel_inner_value">${type}</div>
                  </div>
                  <div class="pannel_inner">
                      <div class="pannel_inner_label">Total</div>
                      <div class="pannel_inner_value">${numeral(totaux).format(
                        "0,0"
                      )} dossiers</div>
                  </div>
                  <div class="pannel_inner">
                      <div class="pannel_inner_label">Étendue</div>
                      <div class="pannel_inner_value">${coverage} (${antenne})</div>
                  </div>
              </div>
          </div>
 
    <div class="table_wrapper">
      <div class="table_header" style="width: 67%;">Identité</div>
      <div class="table_header" style="width: 15%;">Dossiers</div>
      <div class="table_header" style="width: 10%;">Parts</div> 
    </div>
    ${labelsBlock}

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
