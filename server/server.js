const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');

const ledger = require('./ledger');


(async () => {
  try {
    await ledger.setup();
  } catch (e) {
    throw new Error("Failed to setup")
  }

  console.log('Setup client');
})();


let app = express();
app.use(cors({ credentials: true, origin: true }));
app.use(bodyparser.json());


app.get("/medicines", async function (request, response) {
  try {
    let medicines;
    if (request.query.type) {
      medicines = await ledger.get_medicines_of_type(request.query.type);
    } else {
      medicines = await ledger.get_medicines();
    }
    response.send(medicines);
  } catch (error) {
    response.status(500);
    response.send({"error": error.toString()});
  };
});


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
    await ledger.add_medicine(medicineData.name, medicineData.timestamp.toString(), medicineData.type, medicineDescription);
    response.status(200);
    response.send(false);
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
    return;
  }
  if (!medicine) {
    response.status(400);
  } else {
    response.status(200);
    response.json(medicine);
  }
});


app.get("/medicine/:id/batches", async function (request, response) {
  let batches;
  try {
    let medicineID = Number(request.params.id);
    batches = await ledger.get_batches_for_medicine(medicineID);
  } catch (error) {
    console.log("Error while getting batches: " + error);
    response.status(500);
    return;
  }

  response.send({batches: batches});
});


app.post("/medicine/:id/batch", async function (request, response) {
  let batchData = request.body;
  if (!(batchData.count && batchData.mannufacturer)) {
    response.status(400);
    return;
  }

  let batchTS = batchData.timestamp;
  if (!batchTS) {
    batchTS = (new Date()).getSeconds()
  }

  try {
    await ledger.add_batch(request.params.id, batchData.count.toString(), batchData.manufacturer, batchTS.toString());
  } catch (error) {
    console.log(`Error while adding batch: ` + error);
    response.status(500);
    return;
  }

  response.status(200);
  response.send(false);
});

app.listen(9300);