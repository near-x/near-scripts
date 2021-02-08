const nearAPI = require("near-api-js");
const getConfig = require("./config");

const BOATLOAD_OF_GAS = '100000000000000'
const getWalletLink = (keyPair) => `https://redpacket.near.org/${keyPair.secretKey}`

function getKeyStore() {
  // Directory where Near credentials are going to be stored
  const credentialsPath = "./.near-credentials";

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

async function createLinkdrops(number, amount) {
  const account = await getAccount(process.env.NEAR_ACCOUNT);
  const rootAccount = process.env.NEAR_ENV === "mainnet" ? "near" : "testnet";
  const parsedAmount = nearAPI.utils.format.parseNearAmount(amount.toString())
  for (let i = 0; i < number; i++) {
    const keyPair = nearAPI.KeyPair.fromRandom('ed25519');
    console.log(getWalletLink(keyPair));
    await account.functionCall(rootAccount, 'send', { public_key: keyPair.publicKey.toString() }, BOATLOAD_OF_GAS, parsedAmount);
  }
}

createLinkdrops(1, 2)
