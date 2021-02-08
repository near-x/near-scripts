const BOATLOAD_OF_GAS = '100000000000000'
const getWalletLink = (keyPair) => `https://redpacket.near.org/${keyPair.secretKey}`

async function createLinkdrops(number, amount) {
  const rootAccount = process.env.NEAR_ENV === "testnet" ? "testnet" : "near";
  const parsedAmount = nearAPI.utils.format.parseNearAmount(amount.toString())
  for (let i = 0; i < number; i++) {
    const keyPair = nearAPI.KeyPair.fromRandom('ed25519');
    console.log(getWalletLink(keyPair));
    await account.functionCall(rootAccount, 'send', { public_key: keyPair.publicKey.toString() }, BOATLOAD_OF_GAS, parsedAmount);
  }
}
