const FabricClient = require('fabric-client');
const FabricCAClient = require('fabric-ca-client');

const path = require('path');


let fabricClient = new FabricClient();
let fabricCAClient = null;
let memberUser = null;
let adminUser;

let storePath = path.join(__dirname, '.hfc-key-store');

FabricClient.newDefaultKeyValueStore({ path: storePath })
  .then((stateStore) => {
    fabricClient.setStateStore(stateStore);

    let cryptoSuite = FabricClient.newCryptoSuite();
    let cryptoStore = FabricClient.newCryptoKeyStore({path: storePath});
    cryptoSuite.setCryptoKeyStore(cryptoStore);
    fabricClient.setCryptoSuite(cryptoSuite);
    fabricCAClient = new FabricCAClient("http://localhost:7054", null, "", cryptoSuite);
    return fabricClient.getUserContext("admin", true);
  })
  .then((userFromStore) => {
    if (userFromStore && userFromStore.isEnrolled()) {
      console.log("Successfully loaded admin");
      adminUser = userFromStore;
    } else {
      throw new Error("Failed to get admin");
    }

    return fabricCAClient.register({ enrollmentID: "user1", affiliation: "org1.department1", role: "client"}, adminUser);
  })
  .then((secret) => {
    console.log("Successfully registered user1 - secret: " + secret);
    return fabricCAClient.enroll({ enrollmentID: "user1", enrollmentSecret: secret });
  })
  .then((enrollment) => {
    console.log("Successfully enrolled member user1");
    return fabricClient.createUser({
      username: "user1",
      mspid: "Org1MSP",
      cryptoContent: {
        privateKeyPEM: enrollment.key.toBytes(),
        signedCertPEM: enrollment.certificate
      }
    });
  })
  .then((user) => {
    memberUser = user;
    return fabricClient.setUserContext(memberUser);
  })
  .then(() => {
    console.log("User1 registered and enrolled")
  })
  .catch((err) => {
    console.log("Failed to register: " + err);
    if (err.toString().indexOf('Authorization') > -1) {
      console.error('Authorization failures may be caused by having admin credentials from a previous CA instance.\n' +
        'Try again after deleting the contents of the store directory '+store_path);
    }
  })