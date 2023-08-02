import pdf from "html-pdf"; // https://www.npmjs.com/package/html-pdf?activeTab=readme

import { customFullDate } from "../../../helpers/date.js";
import dotenv from "dotenv";
dotenv.config();
const SERVER_URL = `http://localhost:${process.env.PORT_SERVER_APP}`; // do not change localhost, even on production mode

export async function _clientPerfectDownload({ pdfName, pdfFolder, data }) {
  const signature =
    data.signature != null
      ? `<img src="${SERVER_URL}/public_upload/${data.signature}" height="90px" />`
      : `<img src="${SERVER_URL}/public_files/images/no_signature.png" />`;
  const fingerPrint =
    data.fingerPrint != null
      ? `<img src="${SERVER_URL}/public_upload/${data.fingerPrint}" height="90px" />`
      : `<img src="${SERVER_URL}/public_files/images/no_fingerprint.png" />`;
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
      margin: 10px;
      position: relative;
      display: block;
    }

    .table_header { 
      background-color: #4d4d4d;
      padding: 10px 10px;
      display: inline-block;
      font-weight: bold;
      color: #ffffff;
      font-family: "Times New Roman";
      font-size: 12px;
    }

    .table_col { 
      background-color: #ffffff;
      padding: 10px 10px;
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
      margin: 6px;
      padding: 10px 0px;
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
      background: #fff;
      page-break-after: auto;
      margin: 0px;
      font-size: 16px;
      overflow: hidden;
      text-align: center;
      padding: 10px 0px;
      font-weight: bold;
      border: solid 0px #fff;
      font-family: "Times New Roman";
    }

    .div_line_wrapper {
      position: relative;
      display: block;
      width: auto;
      margin: 6px;
      padding: 5px;
      background-color: #ebebeb;
      font-size: 12px;
      font-family: "Times New Roman";
    }

    .pannel_wrapper {
      width: 100%;
      background-color: #ffffff;
      border: solid 1px #b3b3b3;
      margin-bottom: 7px;
      display: table;
    }

    .pannel_wrapper_sub {
      width: 100%;
      background-color: #ffffff;
      border: solid 1px #649ae1;
      margin-bottom: 8px;
      display: table;
    }

    .pannel_wrapper_sub_sub {
      width: 100%;
      background-color: #ffffff;
      border: solid 1px #932108;
      margin-bottom: 8px;
      display: table;
    }

    .panel_header {
      padding: 8px 15px;
      font-size: 16px;
      color: #ffffff;
      background-color: #3b3b3b;
      font-weight: bold;
      font-family: "Times New Roman";
      border: 0px;
    }

    .panel_header_sub {
      padding: 8px 15px;
      font-size: 15px;
      color: #ffffff;
      background-color: #145dbd;
      font-weight: bold;
      border: 0px;
    }

    .panel_header_sub_sub {
      padding: 8px 15px;
      font-size: 14px;
      color: #ffffff;
      background-color: #b72a0a;
      font-weight: bold;
      border: 0px;
    }

    .panel_header_sub_sub_black {
      padding: 8px 15px;
      font-size: 14px;
      color: #ffffff;
      background-color: #ed7b00;
      font-weight: bold;
      border: 0px;
      display: inline-block;
      width: 87%;
    }

    .pannel_inner {
      padding: 6px 5px;
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
      font-size: 11px;
      font-family: "Times New Roman";
      color: #686868;
    }

    .pannel_inner_value {
      font-size: 13px;
      font-weight: bold;
      color: #000000;
      font-family: "Times New Roman";
      border-bottom: solid 1px #bfbfbf;
      padding-bottom: 4px;
    }

    .pannel_inner_val0 {
      font-size: 13px;
      font-weight: bold;
      color: #000000;
      font-family: "Times New Roman";
      border-bottom: solid 0px #bfbfbf;
      padding-bottom: 4px;
    }

    .pannel_inner_pair {
      font-size: 11px;
      font-family: "Times New Roman";
      color: #686868;
    }

    .pannel_inner_par_value {
      font-size: 13px;
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
            <img style="height: 80px; " src="${SERVER_URL}/public_files/logos/logo_imf.png" />
          </div>
          <div class="header">${data.fullName}</div> 

          <table>
          <tr>
              <td style="width: 140px; text-align: center; border: none;">
                <div style="border: solid 4px #ddd; 
                  width: 140px; height: 140px; 
                  border-radius: 100%; 
                  text-align: center;
                  overflow: hidden; margin: 10px auto;">
                  <img src="${SERVER_URL}/public_upload/${
    data.photo
  }" height="140px" />
                </div>
              </td>

              <td style="width: 140px; text-align: center; border: none;">
                <div style="border: solid 4px #ddd; 
                  width: 140px; height: 140px; 
                  border-radius: 100%; 
                  text-align: center;
                  overflow: hidden; margin: 10px auto;">
                  <img src="${SERVER_URL}/public_upload/${
    data.photo1
  }" height="140px" />
                </div>
              </td>

              <td style="width: 140px; text-align: center; border: none;">
                <div style="border: solid 4px #ddd; 
                  width: 140px; height: 140px; 
                  border-radius: 100%; 
                  text-align: center;
                  overflow: hidden; margin: 10px auto;">
                  <img src="${SERVER_URL}/public_upload/${
    data.photo2
  }" height="140px" />
                </div>
              </td>
              
            </tr>
        </table>

          
 


<!-- DONNEES DU SIG -->
<div class="pannel_wrapper">
    <div class="panel_header">Données du SIG</div>

    <div class="pannel_left">
        <div class="pannel_inner">
            <div class="pannel_inner_label">Personne</div>
            <div class="pannel_inner_value">${data.personne} (${
    data.gender
  })</div>
        </div>
    </div>

    <div class="pannel_right">
      <div class="pannel_inner">
        <div class="pannel_inner_label">Code SIG</div>
        <div class="pannel_inner_value">${data.codeSig}</div>
      </div>
    </div>

    <div class="pannel_left">
        <div class="pannel_inner">
            <div class="pannel_inner_label">Solde</div>
            <div class="pannel_inner_val0">${data.soldeEpargne.toLocaleString(
              "fr-FR"
            )}</div>
        </div>
    </div>

    <div class="pannel_right">
      <div class="pannel_inner">
        <div class="pannel_inner_label">Date du solde</div>
        <div class="pannel_inner_val0">${await customFullDate({
          timeStamp: data.soldeDate,
        })} </div>
      </div>
    </div>

</div>
<!-- FIN DONNEES DU SIG -->

<!-- DONNEES PERSONNELLES -->
<div class="pannel_wrapper">
    <div class="panel_header">Données personnelles</div>

    <div class="pannel_left">
        <div class="pannel_inner">
            <div class="pannel_inner_label">Nom et prénom(s)</div>
            <div class="pannel_inner_value">${data.fullName} (${
    data.gender
  })</div>
        </div>
    </div>

    <div class="pannel_right">
      <div class="pannel_inner">
        <div class="pannel_inner_label">Téléphone(s)</div>
        <div class="pannel_inner_value">${data.phone} / ${data.phoneAlt}</div>
      </div>
    </div>

    <div class="pannel_left">
        <div class="pannel_inner">
            <div class="pannel_inner_label">Date de naissance</div>
            <div class="pannel_inner_value">${await customFullDate({
              timeStamp: data.naissanceDate,
            })}</div>
        </div>
    </div>

    <div class="pannel_right">
      <div class="pannel_inner">
        <div class="pannel_inner_label">Lieu de naissance</div>
        <div class="pannel_inner_value">${data.naissanceLieu}</div>
      </div>
    </div>

    ////
    <div class="pannel_left">
        <div class="pannel_inner">
            <div class="pannel_inner_label">Activité principale</div>
            <div class="pannel_inner_val0">${data.activities}</div>
        </div>
    </div>

    <div class="pannel_right">
      <div class="pannel_inner">
        <div class="pannel_inner_label">Ancienneté de l'activité</div>
        <div class="pannel_inner_val0">${data.activitiesSinceWhen}</div>
      </div>
    </div>

</div>
<!-- FIN DONNEES PERSONNELLES -->

<!-- IDENTITE -->
<div class="pannel_wrapper">
    <div class="panel_header">Identité</div>

    <div class="pannel_left">
        <div class="pannel_inner">
            <div class="pannel_inner_label">Pièce d'identité</div>
            <div class="pannel_inner_value">${data.idType}</div>
        </div>
    </div>

    <div class="pannel_right">
      <div class="pannel_inner">
        <div class="pannel_inner_label">Numéro de la pièce</div>
        <div class="pannel_inner_value">${data.idNumber}</div>
      </div>
    </div> 

    <div class="pannel_left">
        <div class="pannel_inner">
            <div class="pannel_inner_label">Date d'établissement</div>
            <div class="pannel_inner_value">${await customFullDate({
              timeStamp: data.idDateStart,
            })}</div>
        </div>
    </div>

    <div class="pannel_right">
      <div class="pannel_inner">
        <div class="pannel_inner_label">Date d'expiration</div>
        <div class="pannel_inner_value">${await customFullDate({
          timeStamp: data.idDateEnd,
        })}</div>
      </div>
    </div> 

    <div class="pannel_left">
        <div class="pannel_inner">
            <div class="pannel_inner_label">Nom du père</div>
            <div class="pannel_inner_val0">${data.fatherFullName}</div>
        </div>
    </div>

    <div class="pannel_right">
      <div class="pannel_inner">
        <div class="pannel_inner_label">Nom de la mère</div>
        <div class="pannel_inner_val0">${data.motherFullName}</div>
      </div>
    </div> 

</div>
<!-- FIN IDENTITE -->

<!-- SITUATION FAMILIALE -->
<div class="pannel_wrapper">
    <div class="panel_header">Situation familiale</div>

    <div class="pannel_left">
        <div class="pannel_inner">
            <div class="pannel_inner_label">Statut matrimonial</div>
            <div class="pannel_inner_val0">${data.maritalStatus} (${
    data.numberOfChildren
  }enfants)</div>
        </div>
    </div>

    <div class="pannel_right">
      <div class="pannel_inner">
        <div class="pannel_inner_label">Personnes à charge</div>
        <div class="pannel_inner_val0">${data.peopleInCharge} personnes</div>
      </div>
    </div> 

</div>
<!-- FIN SITUATION FAMILIALE -->

<!-- ADRESSE -->
<div class="pannel_wrapper">
    <div class="panel_header">Adresse</div>

    <div class="pannel_left">
        <div class="pannel_inner">
            <div class="pannel_inner_label">Localité</div>
            <div class="pannel_inner_value">${
              data.cityKey != null ? data.cityKey["cityName"] : "-"
            }, ${data.countryKey["countryName"]} (${data.quartier})</div>
        </div>
    </div>

    <div class="pannel_right">
      <div class="pannel_inner">
        <div class="pannel_inner_label">Situation géographique</div>
        <div class="pannel_inner_value">${data.address}</div>
      </div>
    </div> 

    <div class="pannel_left">
        <div class="pannel_inner">
            <div class="pannel_inner_label">Habite ici depuis</div>
            <div class="pannel_inner_val0">${data.addressSinceWhen}</div>
        </div>
    </div>

    <div class="pannel_right">
      <div class="pannel_inner">
        <div class="pannel_inner_label">Propriétaire ou locataire</div>
        <div class="pannel_inner_val0">${data.addressFiliation}</div>
      </div>
    </div> 

</div>
<!-- FIN ADRESSE -->

<!-- PERSONNE A CONTACTER -->
<div class="pannel_wrapper">
    <div class="panel_header">Personne à contacter</div>

    <div class="pannel_left">
        <div class="pannel_inner">
            <div class="pannel_inner_label">Identité</div>
            <div class="pannel_inner_value">${
              data.personneRessourceFullName
            }</div>
        </div>
    </div>

    <div class="pannel_right">
      <div class="pannel_inner">
        <div class="pannel_inner_label">Lien de filiation</div>
        <div class="pannel_inner_value">${data.personneRessourceFiliation}</div>
      </div>
    </div> 

    <div class="pannel_left">
        <div class="pannel_inner">
            <div class="pannel_inner_label">Téléphone 1</div>
            <div class="pannel_inner_val0">${data.personneRessourcePhone}</div>
        </div>
    </div>

    <div class="pannel_right">
      <div class="pannel_inner">
        <div class="pannel_inner_label">Téléphone 2</div>
        <div class="pannel_inner_val0">${data.personneRessourcePhoneAlt}</div>
      </div>
    </div> 

</div>
<!-- FIN PERSONNE A CONTACTER -->

<!-- SIGNATURE -->
<div class="pannel_wrapper">
    <div class="panel_header">Signature et empreinte</div>

    <table>
          <tr>
              <td style="width: 400px; text-align: center; border: none;">
              ${signature}
              </td>

              <td style="width: 400px; text-align: center; border: none;">
              ${fingerPrint}
              </td> 
              
            </tr>
        </table>
     

</div>
<!-- FIN SIGNATURE -->


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
      .toFile(`${pdfFolder}/${pdfName}`, function (err, result) {
        if (result) {
          //const pdfFile = result.filename.split(`/${pdfFolder}/`)[1];
          resolve(pdfName);
        } else {
          resolve(null);
        }
      });
  });
}
