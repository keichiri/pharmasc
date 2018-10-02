const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');

const ledger = require('./ledger');

let app = express();
app.use(cors({ credentials: true, origin: true }));
app.use(bodyparser.json());


app.get("/medicines", async function (request, response) {
  try {
    medicines = await ledger.get_medicines();
    response.send({"medicines": medicines});
  } catch (error) {
    response.status(500);
    response.send({"error": error.toString()});
  };
});

(async () => {
  try {
    await ledger.setup();
  } catch (e) {
    throw new Error("Failed to setup")
  }

  console.log('Setup client');
})();


app.listen(9300);