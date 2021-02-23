const nearAPI = require("near-api-js");
const { getAccount } = require("./account");

async function transfer(receiver, amount) {
  const sender = await getAccount(process.env.NEAR_ACCOUNT);
  const parsedAmount = nearAPI.utils.format.parseNearAmount(amount.toString())
  await sender.sendMoney(receiver, parsedAmount);
  console.log(`sent ${amount} Ⓝ  to ${receiver}`);
}

transfer("bot.testnet", 1)
