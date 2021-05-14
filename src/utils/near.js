const nearAPI = require("near-api-js");
const { PublicKey } = require("near-api-js/lib/utils");
const { KeyType } = require("near-api-js/lib/utils/key_pair");
const getConfig = require("./config");

function getKeyStore() {
  // Directory where Near credentials are going to be stored
  // const credentialsPath = "./.near-credentials";
  const credentialsPath = process.env.HOME + "/.near-credentials/";

  // Configure the keyStore to be used with the SDK
  const UnencryptedFileSystemKeyStore = nearAPI.keyStores.UnencryptedFileSystemKeyStore;
  return new UnencryptedFileSystemKeyStore(credentialsPath);
}

async function connect() {
  const keyStore = getKeyStore();
  const env = process.env.NEAR_ENV || "testnet";
  const opitons = getConfig(env);
  opitons.deps = {
    keyStore
  }
  return await nearAPI.connect(opitons);
}

async function getAccount(accountId) {
  const client = await connect();
  return await client.account(accountId);
}

function getContract(account, contractName, methods) {
	return new nearAPI.Contract(account, contractName, { ...methods });
}

async function accountExists(accountId) {
  if (accountId.length === 44) {
    let key = new PublicKey({keyType: KeyType.ED25519, data: Buffer.from(accountId, 'hex')});
    return !!(key.toString())
  }

  try {
    const client = await connect();
    const account = await client.account(accountId);
    await account.state();
    return true;
  } catch (error) {
      return false;
  }
}

module.exports = {
  getAccount,
  getContract,
  accountExists
}
