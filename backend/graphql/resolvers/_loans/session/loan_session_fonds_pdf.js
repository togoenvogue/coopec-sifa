import pdf from "html-pdf";
import numeral from "numeral";

export async function _loanSessionFondsPdf({ pdfName, data }) {
  // participants list
  let payments = [];
  for (let index = 0; index < (await data.payments.length); index++) {
    const p = await data.payments[index];

    const line = `
    <div class="table_wrapper">
      <div class="table_col" style="width: 45%;">${p.date}</div>
      <div class="table_col" style="width: 45%;">${numeral(p.amount).format(
        0,
        0.0
      )}  <br />
      <span>Solde coffre : ${numeral(p.coffreAmount).format(0, 0.0)}</span>
      
      </div>
    </div>`;
    payments.push(line);
  }

  // Don’t ever use await with forEach. Use a for-loop (or any loop without a callback) instead.
  // If you want to execute await calls in series, use a for-loop (or any loop without a callback).
  // Don’t await inside filter and reduce. Always await an array of promises with map, then filter or reduce accordingly.
  // https://zellwk.com/blog/async-await-in-loops/

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
        font-size: 18px;
        overflow: hidden;
        text-align: center;
        padding: 20px;
        font-weight: bold;
        border: solid 1px #b5b5b5;
        font-family: "Times New Roman"; 
      } 

      .div_line_wrapper {
        position: relative;
        display: block;
        width: auto;
        margin: 6px;
        padding: 10px;
        background-color: #ebebeb;
        font-size: 15px;
        font-family: "Times New Roman";
      }

      .h1 {
        position: relative;
        display: block;
        width: auto;
        margin: 6px;
        padding: 10px 0px;
        background-color: #ffffff;
        font-size: 20px;
        font-family: "Times New Roman";
        font-weight: bold;
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
        font-size: 15px;
      }

      .table_col { 
        background-color: #ffffff;
        padding: 10px 10px;
        display: inline-block;
        font-weight: normal;
        color: #000000;
        font-family: "Times New Roman";
        font-size: 16px;
        border-bottom: 1px solid #6e6e6e; 
      }

      .red {
        color: red;
      }
 

    </style>
  </head>
  <body>
    <div class="header">
    DEMANDE DE FONDS<br />
    ${data.sessionLabel != null ? data.sessionLabel.toUpperCase() : ""}
    </div>

    <div class="div_line_wrapper">
    Date: <strong>${
      data.sessionDate != null ? data.sessionDate : " - "
    }</strong>
    </div>

    <div class="div_line_wrapper">
    Agence : <strong>${data.agence}</strong>
    </div>

    <div class="div_line_wrapper">
    Total à décaisser : <strong>${numeral(data.total).format(0, 0.0)}</strong>
    </div>

     
    <br />
    <br />

    <div class="table_wrapper">
      <div class="table_header" style="width: 45%;">Dates</div>
      <div class="table_header" style="width: 45%;">Montant à décaisser</div>
    </div>
    ${payments}

 
  </body>
</html>`;

  return new Promise((resolve, reject) => {
    var options = {
      format: "A4",
      orientation: "portrait", // landscape
      /*border: {
        top: "2in", // default is 0, units: mm, cm, in, px
        right: "1in",
        bottom: "2in",
        left: "1.5in",
      },*/
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
          //console.log(`PDF ERROR: ${err}`);
          resolve(null);
        }
      });
  });
}
