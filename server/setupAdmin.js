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
    let cryptoStore = FabricClient.newCryptoKeyStore({ path: storePath });
    cryptoSuite.setCryptoKeyStore(cryptoStore);
    fabricClient.setCryptoSuite(cryptoSuite);

    let tlsOptions = {
      trustedRoots: [],
      verify: false
    };

    fabricCAClient = new FabricCAClient("http://localhost:7054", tlsOptions, "ca.example.com", cryptoSuite);
    return fabricClient.getUserContext("admin", true);
  }).then((userFromStore) => {
    if (userFromStore && userFromStore.isEnrolled()) {
      console.log("Successfully loaded admin from persistence");
      adminUser = userFromStore;
      return null;
    } else {
      return fabricCAClient.enroll({
        enrollmentID: "admin",
        enrollmentSecret: "adminpw"
      }).then((enrollment) => {
        console.log("Successfully enrolled admin user");
        return fabricClient.createUser({
          username: "admin",
          mspid: "Org1MSP",
          cryptoContent: {
            privateKeyPEM: enrollment.key.toBytes(),
            signedCertPEM: enrollment.certificate
          }
        });
      }).then((user) => {
        adminUser = user;
        return fabricClient.setUserContext(adminUser);
      }).catch((err) => {
        console.error('Failed to enroll and persist admin. Error: ' + err.stack ? err.stack : err);
        throw new Error('Failed to enroll admin');
      })
    }
}).then(() => {
  console.log('Assigned the admin user to the fabric client ::' + adminUser.toString());
}).catch((err) => {
  console.error('Failed to enroll admin: ' + err);
});