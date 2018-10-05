const FabricClient = require('fabric-client');
const path = require('path');


let fabricClient;
let channel;
let peer;
let orderer;

async function setup() {
  console.log('Setting fabric client');
  // Setting up the network
  fabricClient = new FabricClient();
  channel = fabricClient.newChannel("mychannel");
  peer = fabricClient.newPeer("grpc://localhost:7051");
  channel.addPeer(peer);
  orderer = fabricClient.newOrderer("grpc://localhost:7050");
  channel.addOrderer(orderer);

  console.log('Added peer');
  let memberUser;
  let storePath = path.join(__dirname, '.hfc-key-store');

  let stateStore = await FabricClient.newDefaultKeyValueStore({ path: storePath });
  fabricClient.setStateStore(stateStore);
  let cryptoSuite = FabricClient.newCryptoSuite();
  let cryptoStore = FabricClient.newCryptoKeyStore({ path: storePath });
  cryptoSuite.setCryptoKeyStore(cryptoStore);
  fabricClient.setCryptoSuite(cryptoSuite);

  console.log('created crypto suite');

  let userFromStore = await fabricClient.getUserContext('user1', true);
  console.log("Got user context");
  if (!userFromStore || !userFromStore.isEnrolled()) {
    console.log("User not setup!");
    throw new Error("Invalid user - run registerUser.js");
  }
}

async function get_medicine(medicineID) {
  let request = {
    chaincodeId: "pharmasc",
    fcn: "get_medicine",
    args: [medicineID]
  };

  let response = await channel.queryByChaincode(request);

  if (response && response.length === 1) {
    if (response[0] instanceof Error) {
      throw new Error(`Failed to get response. Error: ${response[0]}`);
    }

    let responseJSON = Buffer.from(response[0], "base64").toString();
    if (!responseJSON) {
      return null;
    }

    return JSON.parse(responseJSON);
  }
}

async function get_medicines() {
  let request = {
    chaincodeId: "pharmasc",
    fcn: "get_medicines",
    args: []
  };

  console.log("Invoking get_medicines");
  let response = await channel.queryByChaincode(request);

  if (response && response.length === 1) {
    if (response[0] instanceof Error) {
      throw new Error(`Failed to get response. Error: ${response[0]}`);
    }
    let responseJSON = JSON.parse(response[0]);
    let medicines = responseJSON.medicines
      .map((medicine) => Buffer.from(medicine, 'base64').toString())
      .filter((x) => x !== "0")
      .map((medicine) => JSON.parse(medicine));
    return {
      medicines
    };
  } else {
    throw new Error("Failed to get any response");
  }
}

async function add_medicine(name, timestamp, type, description) {
  let txId = fabricClient.newTransactionID();
  let transactionProposal = {
    chaincodeId: "pharmasc",
    fcn: "add_medicine",
    args: [name, timestamp, type, description],
    txId: txId,
  };

  console.log("Adding medicine");
  let proposalResults = await channel.sendTransactionProposal(transactionProposal);
  let proposalResponses = proposalResults[0];
  let proposal = proposalResults[1];

  if (!(proposalResponses && proposalResponses[0].response && proposalResponses[0].response.status === 200)) {
    throw new Error("Transaction proposal not accepted");
  }

  console.log(`Successfully sent proposal and received proposal response. Status - ${proposalResponses[0].response.status}'
              Message: ${proposalResponses[0].response.message}`);

  let orderingRequest = {
    proposalResponses: proposalResponses,
    proposal: proposal,
  };

  let transactionIDString = txId.getTransactionID();
  let promises = [];

  console.log("Sending transaction");
  let sendPromise = channel.sendTransaction(orderingRequest);
  promises.push(sendPromise);

  let eventHub = channel.newChannelEventHub(peer);

  console.log("Setting up 2 promises");

  let txPromise = new Promise((resolve, reject) => {
    let handle = setTimeout(() => {
      eventHub.unregisterTxEvent(transactionIDString);
      eventHub.disconnect();
      resolve({event_status: 'TIMEOUT'})
    }, 3000);
    eventHub.registerTxEvent(transactionIDString, (tx, code) => {
        clearTimeout(handle);
        let returnStatus = {event_status: code, txId: transactionIDString};
        if (code !== 'VALID') {
          console.error("Transaction was invalid");
          resolve(returnStatus);
        } else {
          resolve(returnStatus);
        }
      }, (err) => {
        reject(new Error("There was a problem with the eventhub: " + err));
      },
      {disconnect: true}
    );
    eventHub.connect();
  });
  promises.push(txPromise);
  console.log("Waiting for 2 promises");
  let results = await Promise.all(promises);

  console.log('Both promises terminated');

  if (results && results[0] && results[0].status === "SUCCESS") {
    console.log("Successfully sent transaction to the orderer");
  } else {
    throw new Error("Failed to order the transaction. Error code: " + results[0].status);
  }
}

async function add_batch(medicineID, count, manufacturer, timestamp) {
  let txId = fabricClient.newTransactionID();
  let transactionProposal = {
    chaincodeId: "pharmasc",
    fcn: "add_batch",
    args: [medicineID, count, manufacturer, timestamp],
    txId: txId,
  };

  console.log('Sending proposal to add batch');
  let proposalResults = await channel.sendTransactionProposal(transactionProposal);
  let proposalResponses = proposalResults[0];
  let proposal = proposalResults[1];

  if (!(proposalResponses && proposalResponses[0].response && proposalResponses[0].response.status === 200)) {
    throw new Error("Transaction proposal not accepted");
  }

  console.log(`Successfully sent proposal and received proposal response. Status - ${proposalResponses[0].response.status}'
              Message: ${proposalResponses[0].response.message}`);

  let orderingRequest = {
    proposalResponses: proposalResponses,
    proposal: proposal
  };

  console.log('Sending endorsed proposal to orderer');
  let transactionIDString = txId.getTransactionID();
  let promises = [];

  let sendPromise = channel.sendTransaction(orderingRequest);
  promises.push(sendPromise);

  let eventHub = channel.newChannelEventHub(peer);

  let txPromise = new Promise((resolve, reject) => {
    let handle = setTimeout(() => {
      eventHub.unregisterTxEvent(transactionIDString);
      eventHub.disconnect();
      resolve({ event_status: 'TIMEOUT' })
    }, 3000);
    eventHub.registerTxEvent(transactionIDString, (tx, code) => {
        clearTimeout(handle);
        let returnStatus = {event_status: code, txId: transactionIDString};
        if (code !== 'VALID') {
          console.error("Transaction was invalid");
          resolve(returnStatus);
        } else {
          resolve(returnStatus);
        }
      }, (err) => {
        reject(new Error("There was a problem with the eventhub: " + err));
      },
      {disconnect: true}
    );
    eventHub.connect();
  });

  promises.push(txPromise);

  let results = await Promise.all(promises);

  console.log('Both promises terminated');

  if (results && results[0] && results[0].status === "SUCCESS") {
    console.log("Successfully sent transaction to the orderer");
  } else {
    throw new Error("Failed to order the transaction. Error code: " + results[0].status);
  }
}

async function get_batches_for_medicine(medicineID) {
  let request = {
    chaincodeId: "pharmasc",
    fcn: "get_batches_for_medicine",
    args: [medicineID]
  };

  let response = await channel.queryByChaincode(request);

  if (response && response.length === 1) {
    if (response[0] instanceof Error) {
      throw new Error(`Failed to get response. Error: ${response[0]}`);
    }

    let responseJSON = Buffer.from(response[0], "base64").toString();
    return JSON.parse(responseJSON);
  }
}


async function get_medicines_of_type(medicineType) {
  let request = {
    chaincodeId: "pharmasc",
    fcn: "get_medicines_of_type",
    args: [medicineType]
  };

  let response = channel.queryByChaincode(request);

  if (response && response.length === 1) {
    if (response[0] instanceof Error) {
      throw new Error(`Failed to get response. Error: ${response[0]}`);
    }

    let responseJSON = Buffer.from(response[0], "base64").toString();
    return JSON.parse(responseJSON);
  }
}

module.exports = {
  setup,
  get_medicines,
  add_medicine,
  get_medicine,
  add_batch,
  get_batches_for_medicine,
  get_medicines_of_type,
};