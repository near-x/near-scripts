const nearAPI = require("near-api-js");
const getConfig = require("./config");

function getKeyStore() {
  // Directory where Near credentials are going to be stored
  // const credentialsPath = "./.near-credentials";
  const credentialsPath = process.env.HOME + "/.near-credentials/";

  // Configure the keyStore to be used with the SDK
  const UnencryptedFileSystemKeyStore = nearAPI.keyStores.UnencryptedFileSystemKeyStore;
  return new UnencryptedFileSystemKeyStore(credentialsPath);
}

async function getAccount(accountId) {
  const keyStore = getKeyStore();
  const env = process.env.NEAR_ENV || "testnet";
  const opitons = getConfig(env);
  opitons.accountId = accountId
  opitons.deps = {
    keyStore
  }
  const client = await nearAPI.connect(opitons);
  return await client.account(accountId);
}

module.exports = {
  getAccount
}
