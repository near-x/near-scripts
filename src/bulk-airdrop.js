const nearAPI = require("near-api-js");
const { getAccount } = require("./utils/near");

const FUND_ACCOUNT = process.env.NEAR_ENV === "mainnet" ? "near" : "testnet";

const BOATLOAD_OF_GAS = '100000000000000'
const getWalletLink = (keyPair) => {
  const host = process.env.NEAR_ENV === 'mainnet' ? 'https://redpacket.near.org' : `https://wallet.testnet.near.org/create/${FUND_ACCOUNT}`;
  return `${host}/${keyPair.secretKey}`;
}

// ref: the script by @picturepan2: https://gist.github.com/picturepan2/9f902cad51dd2c2e0f173160ef5302ce

async function createLinkdrops(number, amount) {
  const account = await getAccount(process.env.NEAR_ACCOUNT);
  const parsedAmount = nearAPI.utils.format.parseNearAmount(amount.toString())
  for (let i = 0; i < number; i++) {
    const keyPair = nearAPI.KeyPair.fromRandom('ed25519');
    console.log(getWalletLink(keyPair));
    await account.functionCall(FUND_ACCOUNT, 'send', { public_key: keyPair.publicKey.toString() }, BOATLOAD_OF_GAS, parsedAmount);
  }
}

createLinkdrops(1, 2)
