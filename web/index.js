const express = require("express");
const app = express();
const port = 55442;

app.use(express.static("./"));

app.listen(port, () => {
  console.log(`DOGA KABA  [WEB] ${port}`);
});

// kill port 4444 running id
// fuser -k 4444/tcp
