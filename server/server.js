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
    response.send(medicines);
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


app.post("/medicine", async function (request, response) {
  let medicineData = request.body;
  if (!(medicineData.name && medicineData.timestamp && medicineData.type)) {
    response.status(400);
    return
  };

  let medicineDescription = medicineData.description;
  if (!medicineDescription) {
    medicineDescription = ""
  };

  try {
    // TODO - figure out how to get ID back
    await ledger.add_medicine(medicineData.name, medicineData.timestamp, medicineData.type, medicineDescription);
    response.status(200);
    response.send(false);
    console.log('finished');
  } catch (error) {
    console.log("Error while adding medicine: " + error);
    response.status(500);
  }
});


app.get("/medicine/:id", async function (request, response) {
  let medicine;
  try {
    medicine = await ledger.get_medicine(request.params.id);
  } catch (error) {
    console.log("Error while getting medicine: " + error);
    response.status(500);
  }
  if (!medicine) {
    response.status(400);
  } else {
    response.status(200);
    response.json(medicine);
  }
});


app.listen(9300);