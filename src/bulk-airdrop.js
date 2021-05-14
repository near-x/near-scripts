const nearAPI = require("near-api-js");
const { getAccount } = require("./account");

const BOATLOAD_OF_GAS = '100000000000000'
const getWalletLink = (env, keyPair) => {
  const host = env === 'mainnet' ? 'https://redpacket.near.org' : 'http://wallet.testnet.near.org/create/testnet';
  return `${host}/${keyPair.secretKey}`;
}

// ref: the script by @picturepan2: https://gist.github.com/picturepan2/9f902cad51dd2c2e0f173160ef5302ce

async function createLinkdrops(number, amount) {
  const account = await getAccount(process.env.NEAR_ACCOUNT);
  const env = process.env.NEAR_ENV;
  const rootAccount = env === "mainnet" ? "near" : "testnet";
  const parsedAmount = nearAPI.utils.format.parseNearAmount(amount.toString())
  for (let i = 0; i < number; i++) {
    const keyPair = nearAPI.KeyPair.fromRandom('ed25519');
    console.log(getWalletLink(env, keyPair));
    await account.functionCall(rootAccount, 'send', { public_key: keyPair.publicKey.toString() }, BOATLOAD_OF_GAS, parsedAmount);
  }
}

createLinkdrops(1, 2)
