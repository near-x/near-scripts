const { getAccount, getContract } = require("./utils/near");
const { BN } = require('bn.js');

const CONTRACT_NAME = process.env.NEAR_ENV === 'mainnet'
  ? 'berryclub.ek.near'
  : 'berryclub.testnet';

const getBerryClubContract = (account) => {
  return getContract(account, CONTRACT_NAME, {
    // View methods are read only. They don't modify the state, but usually return some value.
    viewMethods: ['get_lines'],
    // Change methods can modify the state. But you don't receive the returned value when called.
    changeMethods: ['draw'],
  })
}

const BOARD_WIDTH = 50;
const ExpectedLineLength = 4 + 8 * BOARD_WIDTH;

const decodeLine = (line) => {
    let buf = Buffer.from(line, 'base64');
    if (buf.length !== ExpectedLineLength) {
      throw new Error("Unexpected encoded line length");
    }
    let pixels = []
    for (let i = 4; i < buf.length; i += 8) {
      let color = buf.readUInt32LE(i);
      let ownerIndex = buf.readUInt32LE(i + 4);
      pixels.push({
        color,
        ownerIndex,
      })
    }
    return pixels;
};

const readLines = async (contract, lines) => {
  const data = await contract.get_lines({ lines });
  let result = [];
  if (data && data.length > 0) {
      result = data.map(line => decodeLine(line));
  }
  return result;
}

async function drawPixels(number = 1) {
  const accountId = process.env.NEAR_ACCOUNT;
  const sender = await getAccount(accountId);
  const contract = getBerryClubContract(sender);

  // get top-left corner's color
  let topLeftCorner = (await readLines(contract, [0]))[0][0].color;
  console.log('top-left corner', topLeftCorner);

  // change the color at top-left corner
  const newColor = topLeftCorner === 0 ? 16777215 : 0;
  const pixels = [];
  for (let i = 0; i < number; i++) {
    pixels.push({
      x: 0,
      y: i,
      color: newColor
    });
  }
  await contract.draw({
    pixels
  }, new BN("75000000000000"));

  // fetch the latest color
  topLeftCorner = (await readLines(contract, [0]))[0][0].color;
  console.log('top-left corner', topLeftCorner);

  console.log("success?", newColor === topLeftCorner);
}

drawPixels().catch(console.error);
