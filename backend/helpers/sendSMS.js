import dotenv from "dotenv";
dotenv.config();

export async function _sendSMS({
  senderId,
  dest,
  message,
  isUnicode,
  userKey,
}) {
  //const username = process.env.SMS_API_USERNAME;
  //const apiKey = process.env.SMS_API_KEY;
  return new Promise((resolve, reject) => {
    const body = {
      userKey: userKey,
      dest: dest,
      message: message,
      senderId: senderId,
      isUnicode: isUnicode,
    };
    /*try {
      fetch(`${process.env.SMS_API_ENDPOINT}/api/sms/internal`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => res.json())
        .then((res) => {
          console.log(JSON.stringify(res));
          if (res) {
            resolve(res);
          } else {
            console.log(`res: ${res}`);
            reject({ result: "error" });
          }
        })
        .catch((error) => {
          console.log(`fech error: ${error}`);
          throw error;
        });
    } catch (error) {
      console.log(`errorrrr: ${error}`);
      resolve(true);
      throw error;
    }*/
  });
}
