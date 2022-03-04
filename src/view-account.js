const nearAPI = require("near-api-js");
const { getAccount } = require("./utils/near");

async function state(name) {
  const account = await getAccount(name);
  const response = await account.state();
  console.log(response);
}

state("guest-book.testnet")
