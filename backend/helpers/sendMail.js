const e = require("express");
const fetch = require("node-fetch");

async function _welcome({
  server,
  email,
  subject,
  fullName,
  username,
  password,
  webUrl,
  brandName,
  brandMail,
  brandPhone,
}) {
  const emailContent = `<!DOCTYPE html>
    <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
        xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
        <meta charset="utf-8"> <!-- utf-8 works for most cases -->
        <meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn't be necessary -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->
        <meta name="x-apple-disable-message-reformatting"> <!-- Disable auto-scale in iOS 10 Mail entirely -->
        <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
        <meta name="color-scheme" content="light">
        <meta name="supported-color-schemes" content="light">
        <title></title> <!--   The title tag shows in email notifications, like Android 4.4. -->
        <style>
            :root {
                color-scheme: light;
                supported-color-schemes: light;
            }
            html,
            body {
                margin: 0 auto !important;
                padding: 0 !important;
                height: 100% !important;
                width: 100% !important;
                background-color: #ffffff !important;
                font-size: 13px !important;
            }
            * {
                -ms-text-size-adjust: 100%;
                -webkit-text-size-adjust: 100%;
            }
            div[style*="margin: 16px 0"] {
                margin: 0 !important;
            }
            #MessageViewBody,
            #MessageWebViewDiv {
                width: 100% !important;
            }
            table,
            td {
                mso-table-lspace: 0pt !important;
                mso-table-rspace: 0pt !important;
                font-size: 13px !important;
            }
            table {
                border-spacing: 0 !important;
                border-collapse: collapse !important;
                table-layout: fixed !important;
                margin: 0 auto !important;
            }
            img {
                -ms-interpolation-mode: bicubic;
            }
            a {
                text-decoration: none;
            }
            a[x-apple-data-detectors],
            /* iOS */
            .unstyle-auto-detected-links a,
            .aBn {
                border-bottom: 0 !important;
                cursor: default !important;
                color: inherit !important;
                text-decoration: none !important;
                font-size: inherit !important;
                font-family: inherit !important;
                font-weight: inherit !important;
                line-height: inherit !important;
            }
            .a6S {
                display: none !important;
                opacity: 0.01 !important;
            }
            .im {
                color: inherit !important;
            }
            img.g-img+div {
                display: none !important;
            }
            @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
                u~div .email-container {
                    min-width: 320px !important;
                    font-size: 13px !important;
                }
            }
            @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
                u~div .email-container {
                    min-width: 375px !important;
                    font-size: 13px !important;
                }
            }
            @media only screen and (min-device-width: 414px) {
                u~div .email-container {
                    min-width: 414px !important;
                    font-size: 13px !important;
                }
            }
        </style>
        <style>
            .button-td,
            .button-a {
                transition: all 100ms ease-in;
            }
    
            .button-td-primary:hover,
            .button-a-primary:hover {
                background: #555555 !important;
                border-color: #555555 !important;
            }
    
            @media screen and (max-width: 600px) {
                .email-container p {
                    font-size: 13px !important;
                }
            }
        </style>
    </head>
    
    
    <body width="100%"
        style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #ffffff !important;">
        <center role="article" aria-roledescription="email" lang="en"
            style="width: 100%; background-color: #ffffff !important;">
    
            <div
                style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: 'Trebuchet MS', Geneva, Tahoma;">
                &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
            </div>
    
            <div style="max-width: 420px; margin: 0 auto; border-radius: 10px;" class="email-container">
    
                <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
                    style="margin: auto;">
                    <!-- Email Header : BEGIN -->
                    <tr>
                        <td style="padding: 10px 0; text-align: center;">
                            <img style="margin-top: 20px;" src="https://mastercash.network/_letaviapp/logo.png"
                                width="55px" alt="" border="0">
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #ffffff; margin:6px 20px !important; border-radius: 10px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="padding: 20px 30px 0 30px; font-family: 'Trebuchet MS', Tahoma, monospace; font-size: 14px; 
                                        line-height: 20px; color: #272921;">
    
                                        <p style="margin: 0;">
                                            Bonjour <strong>${fullName}</strong>, </p>
    
                                        <p>Nous sommes heureux de vous accueillir sur notre plateforme d'envoi Web SMS <strong>${brandName}</strong><p>
    
                                        <p>
                                            Utilisez les informations suivantes pour vous connecter :
                                        </p>
    
                                        <p>
                                            <table style="width: 100%">
      
                                                <tr>
                                                  <td style="width: 100px ; margin-bottom: 1px; padding: 7px 16px; background-color: #dbdbdb; font-size: 12px; font-family: 'Trebuchet MS' ">Username</td>
                                                  <td style="padding: 7px 16px; margin-bottom: 1px; background-color: #9c9a9a; font-size: 12px; font-family: 'Trebuchet MS'; color: #fff; ">${username}</td>
                                                </tr>
    
                                                <tr>
                                                    <td style="width: 100px ; margin-bottom: 1px; padding: 7px 16px; background-color: #dbdbdb; font-size: 12px; font-family: 'Trebuchet MS' ">Mot de passe</td>
                                                    <td style="padding: 7px 16px; margin-bottom: 1px; background-color: #9c9a9a; font-size: 12px; font-family: 'Trebuchet MS'; color: #fff; ">${password}</td>
                                                </tr>
    
                                                <tr>
                                                <td style="width: 100px ; margin-bottom: 1px; padding: 7px 16px; background-color: #dbdbdb; font-size: 12px; font-family: 'Trebuchet MS' ">Lien</td>
                                                <td style="padding: 7px 16px; margin-bottom: 1px; background-color: #9c9a9a; font-size: 12px; font-family: 'Trebuchet MS'; color: #fff; ">${webUrl}</td>
                                                </tr> 
                                                  
                                                </table>
                                        </p>  
    
                                        <p>
                                            Si vous rencontrez un quelconque problème ou si vous souhaitez recharger votre compte, cotactez-nous à tout moment pour assistance
                                        </p> 
    
                                        <p>
                                            <a class="button-a button-a-primary" target="_blank"
                                                href="${webUrl}" 
                                                style="background: #40686e; border: 0px solid #2483d1; 
                                                font-weight: normal; font-family: 'Trebuchet MS', sans-serif; 
                                                font-size: 14px; line-height: 13px; 
                                                text-decoration: none; padding: 13px 17px; 
                                                color: #ffffff; display: block; 
                                                text-align: center;
                                                border-radius: 8px;">
                                                Connectez-vous
                                            </a>
                                        </p>
                                        
                                        <p>Salutations!<br />
                                        <strong>${brandName}</strong><br />
                                        <strong>${brandPhone}</strong><br />
                                        <strong>${brandMail}</strong>
                                        </p>

                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </div>
        </center>
    </body>
    
    </html>`;

  const emailBody = {
    from: `${brandName}<${brandMail}>`,
    to: email,
    replyTo: `${brandMail}`,
    subject: subject,
    html: emailContent,
  };
  //console.log(emailBody);
  return new Promise((resolve, reject) => {
    fetch(server, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailBody),
    })
      .then(() => {
        resolve(true);
      })
      .catch(() => {
        resolve(true);
      });
  });
}

async function _downloadAddressBook({
  server,
  email,
  subject,
  fullName,
  addressBookName,
  fileFormat,
  downloadLink,
  brandName,
  brandMail,
  brandPhone,
}) {
  const emailContent = `<!DOCTYPE html>
  <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
      xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
      <meta charset="utf-8"> <!-- utf-8 works for most cases -->
      <meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn't be necessary -->
      <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->
      <meta name="x-apple-disable-message-reformatting"> <!-- Disable auto-scale in iOS 10 Mail entirely -->
      <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
      <meta name="color-scheme" content="light">
      <meta name="supported-color-schemes" content="light">
      <title></title> <!--   The title tag shows in email notifications, like Android 4.4. -->
      <style>
          :root {
              color-scheme: light;
              supported-color-schemes: light;
          }
          html,
          body {
              margin: 0 auto !important;
              padding: 0 !important;
              height: 100% !important;
              width: 100% !important;
              background-color: #ffffff !important;
              font-size: 13px !important;
          }
          * {
              -ms-text-size-adjust: 100%;
              -webkit-text-size-adjust: 100%;
          }
          div[style*="margin: 16px 0"] {
              margin: 0 !important;
          }
          #MessageViewBody,
          #MessageWebViewDiv {
              width: 100% !important;
          }
          table,
          td {
              mso-table-lspace: 0pt !important;
              mso-table-rspace: 0pt !important;
              font-size: 13px !important;
          }
          table {
              border-spacing: 0 !important;
              border-collapse: collapse !important;
              table-layout: fixed !important;
              margin: 0 auto !important;
          }
          img {
              -ms-interpolation-mode: bicubic;
          }
          a {
              text-decoration: none;
          }
          a[x-apple-data-detectors],
          /* iOS */
          .unstyle-auto-detected-links a,
          .aBn {
              border-bottom: 0 !important;
              cursor: default !important;
              color: inherit !important;
              text-decoration: none !important;
              font-size: inherit !important;
              font-family: inherit !important;
              font-weight: inherit !important;
              line-height: inherit !important;
          }
          .a6S {
              display: none !important;
              opacity: 0.01 !important;
          }
          .im {
              color: inherit !important;
          }
          img.g-img+div {
              display: none !important;
          }
          @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
              u~div .email-container {
                  min-width: 320px !important;
                  font-size: 13px !important;
              }
          }
          @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
              u~div .email-container {
                  min-width: 375px !important;
                  font-size: 13px !important;
              }
          }
          @media only screen and (min-device-width: 414px) {
              u~div .email-container {
                  min-width: 414px !important;
                  font-size: 13px !important;
              }
          }
      </style>
      <style>
          .button-td,
          .button-a {
              transition: all 100ms ease-in;
          }
          .button-td-primary:hover,
          .button-a-primary:hover {
              background: #555555 !important;
              border-color: #555555 !important;
          }
          @media screen and (max-width: 600px) {
              .email-container p {
                  font-size: 13px !important;
              }
          }
      </style>
  </head>
  <body width="100%"
      style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #ffffff !important;">
      <center role="article" aria-roledescription="email" lang="en"
          style="width: 100%; background-color: #ffffff !important;">
  
          <div
              style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: 'Trebuchet MS', Geneva, Tahoma;">
              &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
          </div>
  
          <div style="max-width: 420px; margin: 0 auto; border-radius: 10px;" class="email-container">
  
              <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
                  style="margin: auto;">
                  <!-- Email Header : BEGIN -->
                  <tr>
                      <td style="padding: 10px 0; text-align: center;">
                          <img style="margin-top: 20px;" src="https://mastercash.network/_letaviapp/logo.png"
                              width="55px" alt="" border="0">
                      </td>
                  </tr>
                  <tr>
                      <td style="background-color: #ffffff; margin:6px 20px !important; border-radius: 10px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                              <tr>
                                  <td style="padding: 20px 30px 0 30px; font-family: 'Trebuchet MS', Tahoma, monospace; font-size: 14px; 
                                      line-height: 20px; color: #272921;">
  
                                      <p style="margin: 0;">
                                          Bonjour <strong>${fullName}</strong>, </p>
  
                                      <p>Vous avez initié le téléchargement de votre carnet d'adresse 
                                          <strong style="color: #e42b16;">${addressBookName}</strong> 
                                          au format <strong style="color: #e42b16;">${fileFormat}</strong>
                                      <p>
  
                                      <p>
                                          Il vous suffit de cliquer sur le bouton suivant pour le télécharger
                                      </p> 
  
                                      <p>
                                          <a class="button-a button-a-primary" target="_blank"
                                              href="${downloadLink}" 
                                              style="background: #40686e; border: 0px solid #2483d1; 
                                              font-weight: normal; font-family: 'Trebuchet MS', sans-serif; 
                                              font-size: 14px; line-height: 13px; 
                                              text-decoration: none; padding: 13px 17px; 
                                              color: #ffffff; display: block; 
                                              text-align: center;
                                              border-radius: 8px;">
                                              Cliquez pour télecharger
                                          </a>
                                      </p>
                                      <p>Salutations!<br />
                                      <strong>${brandName}</strong><br />
                                      <strong>${brandPhone}</strong><br />
                                      <strong>${brandMail}</strong>
                                      </p>
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr>
              </table>
          </div>
      </center>
  </body>
  </html>`;
  const emailBody = {
    from: `${brandName}<${brandMail}>`,
    to: email,
    replyTo: `${brandMail}`,
    subject: subject,
    html: emailContent,
  };
  //console.log(emailBody);
  return new Promise((resolve, reject) => {
    fetch(server, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailBody),
    })
      .then(() => {
        resolve(true);
      })
      .catch(() => {
        resolve(true);
      });
  });
}

async function _downloadSMSReport({
  server,
  email,
  subject,
  sentDate,
  fullName,
  smsContent,
  smsTotalSent,
  smsTotalPending,
  smsTotalSuccess,
  smsTotalFailed,
  fileFormat,
  downloadLink,
  brandName,
  brandMail,
  brandPhone,
}) {
  const emailContent = `<!DOCTYPE html>
  <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
      xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
      <meta charset="utf-8"> <!-- utf-8 works for most cases -->
      <meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn't be necessary -->
      <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->
      <meta name="x-apple-disable-message-reformatting"> <!-- Disable auto-scale in iOS 10 Mail entirely -->
      <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
      <meta name="color-scheme" content="light">
      <meta name="supported-color-schemes" content="light">
      <title></title> <!--   The title tag shows in email notifications, like Android 4.4. -->
      <style>
          :root {
              color-scheme: light;
              supported-color-schemes: light;
          }
          html,
          body {
              margin: 0 auto !important;
              padding: 0 !important;
              height: 100% !important;
              width: 100% !important;
              background-color: #ffffff !important;
              font-size: 13px !important;
          }
          * {
              -ms-text-size-adjust: 100%;
              -webkit-text-size-adjust: 100%;
          }
          div[style*="margin: 16px 0"] {
              margin: 0 !important;
          }
          #MessageViewBody,
          #MessageWebViewDiv {
              width: 100% !important;
          }
          table,
          td {
              mso-table-lspace: 0pt !important;
              mso-table-rspace: 0pt !important;
              font-size: 13px !important;
          }
          table {
              border-spacing: 0 !important;
              border-collapse: collapse !important;
              table-layout: fixed !important;
              margin: 0 auto !important;
          }
          img {
              -ms-interpolation-mode: bicubic;
          }
          a {
              text-decoration: none;
          }
          a[x-apple-data-detectors],
          /* iOS */
          .unstyle-auto-detected-links a,
          .aBn {
              border-bottom: 0 !important;
              cursor: default !important;
              color: inherit !important;
              text-decoration: none !important;
              font-size: inherit !important;
              font-family: inherit !important;
              font-weight: inherit !important;
              line-height: inherit !important;
          }
          .a6S {
              display: none !important;
              opacity: 0.01 !important;
          }
          .im {
              color: inherit !important;
          }
          img.g-img+div {
              display: none !important;
          }
          @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
              u~div .email-container {
                  min-width: 320px !important;
                  font-size: 13px !important;
              }
          }
          @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
              u~div .email-container {
                  min-width: 375px !important;
                  font-size: 13px !important;
              }
          }
          @media only screen and (min-device-width: 414px) {
              u~div .email-container {
                  min-width: 414px !important;
                  font-size: 13px !important;
              }
          }
      </style>
      <style>
          .button-td,
          .button-a {
              transition: all 100ms ease-in;
          }
  
          .button-td-primary:hover,
          .button-a-primary:hover {
              background: #555555 !important;
              border-color: #555555 !important;
          }
  
          @media screen and (max-width: 600px) {
              .email-container p {
                  font-size: 13px !important;
              }
          }
      </style>
  </head>
  
  
  <body width="100%"
      style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #ffffff !important;">
      <center role="article" aria-roledescription="email" lang="en"
          style="width: 100%; background-color: #ffffff !important;">
  
          <div
              style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: 'Trebuchet MS', Geneva, Tahoma;">
              &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
          </div>
  
          <div style="max-width: 420px; margin: 0 auto; border-radius: 10px;" class="email-container">
  
              <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
                  style="margin: auto;">
                  <!-- Email Header : BEGIN -->
                  <tr>
                      <td style="padding: 10px 0; text-align: center;">
                          <img style="margin-top: 20px;" src="https://mastercash.network/_letaviapp/logo.png"
                              width="55px" alt="" border="0">
                      </td>
                  </tr>
                  <tr>
                      <td style="background-color: #ffffff; margin:6px 20px !important; border-radius: 10px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                              <tr>
                                  <td style="padding: 20px 30px 0 30px; font-family: 'Trebuchet MS', Tahoma, monospace; font-size: 14px; 
                                      line-height: 20px; color: #272921;">
  
                                      <p style="margin: 0;">
                                          Bonjour <strong>${fullName}</strong>, </p>
  
                                      <p>Vous avez initié le téléchargement du rapport de livraison 
                                          d'un de vos envois SMS dont voici le contenu :<p>
  
                                      <div style="font-size: 13px; border: solid 1px; padding: 5px 15px; 
                                      line-height: 20px;">${smsContent}</div>
  
                                      <p>
                                          <table style="width: 100%">
    
                                              <tr>
                                                <td style="width: 100px ; margin-bottom: 1px; padding: 7px 16px; background-color: #dbdbdb; font-size: 12px; font-family: 'Trebuchet MS' ">Date d'envoi</td>
                                                  <td style="padding: 7px 16px; margin-bottom: 1px; background-color: #9c9a9a; font-size: 12px; font-family: 'Trebuchet MS'; color: #fff; ">${sentDate}</td>
                                                </tr>
                                                
                                              <tr>
                                                <td style="width: 100px ; margin-bottom: 1px; padding: 7px 16px; background-color: #c7eeff; font-size: 12px; font-family: 'Trebuchet MS' ">Envoyés</td>
                                                  <td style="padding: 7px 16px; margin-bottom: 1px; background-color: #4ba9d1; font-size: 12px; font-family: 'Trebuchet MS'; color: #fff; ">${smsTotalSent}</td>
                                                </tr>
                                                
                                              <tr>
                                                <td style="width: 100px ; margin-bottom: 1px; padding: 7px 16px; background-color: #b5ffcb; font-size: 12px; font-family: 'Trebuchet MS' ">Succès</td>
                                                  <td style="padding: 7px 16px; margin-bottom: 1px; background-color: #36b376; font-size: 12px; font-family: 'Trebuchet MS'; color: #fff; ">${smsTotalSuccess}</td>
                                              </tr>
                                                
                                                  <tr>
                                                  <td style="width: 100px ; margin-bottom: 1px; padding: 7px 16px; background-color: #ffc7d6; font-size: 12px; font-family: 'Trebuchet MS' ">Echec</td>
                                                  <td style="padding: 7px 16px; margin-bottom: 1px; background-color: #f2114d; font-size: 12px; font-family: 'Trebuchet MS'; color: #fff; ">${smsTotalFailed}</td>
                                                  </tr>
                                               
                                                
                                                <tr>
                                                <td style="width: 100px ; margin-bottom: 1px; padding: 7px 16px; background-color: #feffd9; font-size: 12px; font-family: 'Trebuchet MS' ">En attente</td>
                                                  <td style="padding: 7px 16px; margin-bottom: 1px; background-color: #bec229; font-size: 12px; font-family: 'Trebuchet MS'; color: #fff; ">${smsTotalPending}</td>
                                              </tr>
                                                
                                              </table>
                                      </p>  
  
                                      <p>
                                          Il vous suffit de cliquer sur le bouton suivant pour 
                                          télécharger le fichier au format <strong style="color: #e42b16;">${fileFormat}</strong>
                                      </p> 
  
                                      <p>
                                          <a class="button-a button-a-primary" target="_blank"
                                              href="${downloadLink}" 
                                              style="background: #40686e; border: 0px solid #2483d1; 
                                              font-weight: normal; font-family: 'Trebuchet MS', sans-serif; 
                                              font-size: 14px; line-height: 13px; 
                                              text-decoration: none; padding: 13px 17px; 
                                              color: #ffffff; display: block; 
                                              text-align: center;
                                              border-radius: 8px;">
                                              Cliquez pour télecharger
                                          </a>
                                      </p>
                                      <p>Salutations!<br />
                                      <strong>${brandName}</strong><br />
                                      <strong>${brandPhone}</strong><br />
                                      <strong>${brandMail}</strong>
                                      </p>
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr>
              </table>
          </div>
      </center>
  </body>
  </html>`;

  const emailBody = {
    from: `${brandName}<${brandMail}>`,
    to: email,
    replyTo: `${brandMail}`,
    subject: subject,
    html: emailContent,
  };
  //console.log(emailBody);
  return new Promise((resolve, reject) => {
    fetch(server, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailBody),
    })
      .then(() => {
        resolve(true);
      })
      .catch(() => {
        resolve(true);
      });
  });
}

async function _notify({
  server,
  email,
  subject,
  fullName,
  content,
  brandName,
  brandMail,
  brandPhone,
}) {
  const emailContent = `<!DOCTYPE html>
  <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
      xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
      <meta charset="utf-8"> <!-- utf-8 works for most cases -->
      <meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn't be necessary -->
      <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->
      <meta name="x-apple-disable-message-reformatting"> <!-- Disable auto-scale in iOS 10 Mail entirely -->
      <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
      <meta name="color-scheme" content="light">
      <meta name="supported-color-schemes" content="light">
      <title></title> <!--   The title tag shows in email notifications, like Android 4.4. -->
      <style>
          :root {
              color-scheme: light;
              supported-color-schemes: light;
          }
          html,
          body {
              margin: 0 auto !important;
              padding: 0 !important;
              height: 100% !important;
              width: 100% !important;
              background-color: #ffffff !important;
              font-size: 13px !important;
          }
          * {
              -ms-text-size-adjust: 100%;
              -webkit-text-size-adjust: 100%;
          }
          div[style*="margin: 16px 0"] {
              margin: 0 !important;
          }
          #MessageViewBody,
          #MessageWebViewDiv {
              width: 100% !important;
          }
          table,
          td {
              mso-table-lspace: 0pt !important;
              mso-table-rspace: 0pt !important;
              font-size: 13px !important;
          }
          table {
              border-spacing: 0 !important;
              border-collapse: collapse !important;
              table-layout: fixed !important;
              margin: 0 auto !important;
          }
          img {
              -ms-interpolation-mode: bicubic;
          }
          a {
              text-decoration: none;
          }
          a[x-apple-data-detectors],
          /* iOS */
          .unstyle-auto-detected-links a,
          .aBn {
              border-bottom: 0 !important;
              cursor: default !important;
              color: inherit !important;
              text-decoration: none !important;
              font-size: inherit !important;
              font-family: inherit !important;
              font-weight: inherit !important;
              line-height: inherit !important;
          }
          .a6S {
              display: none !important;
              opacity: 0.01 !important;
          }
          .im {
              color: inherit !important;
          }
          img.g-img+div {
              display: none !important;
          }
          @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
              u~div .email-container {
                  min-width: 320px !important;
                  font-size: 13px !important;
              }
          }
          @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
              u~div .email-container {
                  min-width: 375px !important;
                  font-size: 13px !important;
              }
          }
          @media only screen and (min-device-width: 414px) {
              u~div .email-container {
                  min-width: 414px !important;
                  font-size: 13px !important;
              }
          }
      </style>
      <style>
          .button-td,
          .button-a {
              transition: all 100ms ease-in;
          }
  
          .button-td-primary:hover,
          .button-a-primary:hover {
              background: #555555 !important;
              border-color: #555555 !important;
          }
  
          @media screen and (max-width: 600px) {
              .email-container p {
                  font-size: 13px !important;
              }
          }
      </style>
  </head>
  
  
  <body width="100%"
      style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #ffffff !important;">
      <center role="article" aria-roledescription="email" lang="en"
          style="width: 100%; background-color: #ffffff !important;">
  
          <div
              style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: 'Trebuchet MS', Geneva, Tahoma;">
              &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
          </div>
  
          <div style="max-width: 420px; margin: 0 auto; border-radius: 10px;" class="email-container">
  
              <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
                  style="margin: auto;">
                  <!-- Email Header : BEGIN -->
                  <tr>
                      <td style="padding: 10px 0; text-align: center;">
                          <img style="margin-top: 20px;" src="https://mastercash.network/_letaviapp/logo.png"
                              width="55px" alt="" border="0">
                      </td>
                  </tr>
                  <tr>
                      <td style="background-color: #ffffff; margin:6px 20px !important; border-radius: 10px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                              <tr>
                                  <td style="padding: 20px 30px 0 30px; font-family: 'Trebuchet MS', Tahoma, monospace; font-size: 14px; 
                                      line-height: 20px; color: #272921;">
  
                                      <p style="margin: 0;">
                                          Bonjour <strong>${fullName}</strong>,</p>
                                      
                                      <p>${content}</p> 
  
                                      <p style="color: rgb(57, 91, 206);">
                                      Pour tous vos besoins d'assistance, contactez votre gestionnaire.
                                      </p>
                                      <p>Salutations!<br />
                                      <strong>${brandName}</strong><br />
                                      <strong>${brandPhone}</strong><br />
                                      <strong>${brandMail}</strong>
                                      </p>
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr>
              </table>
          </div>
      </center>
  </body>
  </html>`;

  const emailBody = {
    from: `${brandName}<${brandMail}>`,
    to: email,
    replyTo: `${brandMail}`,
    subject: subject,
    html: emailContent,
  };
  //console.log(emailBody);
  return new Promise((resolve, reject) => {
    fetch(server, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailBody),
    })
      .then(() => {
        resolve(true);
      })
      .catch(() => {
        resolve(true);
      });
  });
}

module.exports = {
  _downloadAddressBook,
  _downloadSMSReport,
  _notify,
  _welcome,
};
