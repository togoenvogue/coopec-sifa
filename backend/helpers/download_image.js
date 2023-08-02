import fs from "fs";
import request from "request";

export async function downloadImage({ uri, fileName, callback }) {
  request.head(uri, function (err, res, body) {
    //console.log("content-type:", res.headers["content-type"]);
    //console.log("content-length:", res.headers["content-length"]);
    request(uri).pipe(fs.createWriteStream(fileName)).on("close", callback);
  });
}
