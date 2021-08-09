const nearAPI = require("near-api-js");
const { getAccount, getContract, isValidAccount } = require("./utils/near");
const { BN } = require('bn.js');
const readline = require('readline');

const CONTRACT_NAME = process.env.NEAR_ENV === 'mainnet'
  ? 'multisender.app.near'
  : 'dev-1609348608630-8665489';

const ACCOUNT_NAME = process.env.NEAR_ACCOUNT;

const DEFAULT_GAS = 300000000000000;
const FRAC_DIGITS = 5;
const CHUNK_SIZE = 100;

const getMultiSenderContract = (account) => {
  return getContract(account, CONTRACT_NAME, {
    // View methods are read only. They don't modify the state, but usually return some value.
    viewMethods: ['get_deposit'],
    // Change methods can modify the state. But you don't receive the returned value when called.
    changeMethods: ['deposit', 'multisend_from_balance', 'multisend_attached_tokens', 'multisend_from_balance_unsafe'],
  })
}

function convertToYoctoNear(amount) {
    return new BN(Math.round(amount * 100000000)).mul(new BN("10000000000000000")).toString();
}

const readCSV = async (filename) => {
  const csv = require('csv-parser');
  const fs = require('fs');

  return new Promise((resolve, reject) => {
    const table = [];
    fs.createReadStream(filename)
    .pipe(csv())
    .on('data', (row) => {
        // console.log(row);
        table.push(row);
    })
    .on('end', () => {
        console.log('CSV file successfully processed');
        console.log(`Total # of accounts from CSV: ${table.length}`);
        resolve(table);
    });
  })
}

const writeCSV = async (filename, data) => {
  const createCsvWriter = require('csv-writer').createObjectCsvWriter;
  const csvWriter = createCsvWriter({
      path: filename,
      header: [
        { id: 'account', title: 'account' },
        { id: 'amount', title: 'amount' },
      ]
    });
    await csvWriter.writeRecords(data);
    // console.log('The CSV file was written successfully')
}

const parseAccounts = (accounts) => {
  return accounts.map(a => ({
    account: a.account.toLowerCase().replace(' ', '').replace(/^http(s):.*\//, '').replace(/^@/, '').trim(),
    amount: parseFloat(a.amount.replace(',', '.').replace(' ', ''))
  }));
}

const filterAccounts = async (accounts, filename) => {
  let valid = [];
  let invalid = [];
  const chunkSize = CHUNK_SIZE;
  for (let i = 0; i < accounts.length; i += chunkSize) {
    const chunk = accounts.slice(i, i + chunkSize);
    const exists = await Promise.all(chunk.map(a => isValidAccount(a.account)));
    valid = valid.concat(chunk.filter((a, i) => exists[i]));
    invalid = invalid.concat(chunk.filter((a, i) => !exists[i]))
  }
  console.log('# of valid accounts', valid.length);
  if (filename) {
    await writeCSV(filename.replace(".csv", "_valid.tmp.csv"), valid);
    await writeCSV(filename.replace(".csv", "_invalid.tmp.csv"), invalid);
  }
  return valid;
}

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function bulkTransfer(filename) {
  let accounts = await readCSV(filename);
  accounts = parseAccounts(accounts);
  const validAccounts = await filterAccounts(accounts, filename);

  const total = validAccounts.reduce((sum, a) => sum + a.amount, 0);
  console.log(`Total distribution: ${total} Ⓝ`);

  const accountId = ACCOUNT_NAME;
  const sender = await getAccount(accountId);
  const contract = getMultiSenderContract(sender);

  console.log(`Using account ${accountId}`);

  // double confirm
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  await new Promise((res) => {
    rl.question('Kick off bulk transfer?', () => {
      rl.close();
      res();
    });
  });

  const accountDeposit = await contract.get_deposit({
    account_id: accountId
  });
  const deposit = nearAPI.utils.format.formatNearAmount(accountDeposit, FRAC_DIGITS).replace(",", "");
  const to_deposit = convertToYoctoNear(total - deposit);
  if (to_deposit > 0) {
    console.log(`Will deposit ${to_deposit} yocto Ⓝ`);
    await contract.deposit({}, DEFAULT_GAS, to_deposit);
  } else {
    console.log(`Have sufficient App Balance ${deposit} Ⓝ to cover deposit ${total} Ⓝ`);
  }

  const chunkSize = CHUNK_SIZE;
  for (let i = 0; i < validAccounts.length; i += chunkSize) {
    const chunk = validAccounts.slice(i, i + chunkSize).map(a => ({
      account_id: a.account,
      amount: convertToYoctoNear(a.amount)
    }));
    await contract.multisend_from_balance_unsafe({
      accounts: chunk
    }, DEFAULT_GAS);
    console.log(`Bulk transferred to ${chunk.length} accounts`);
    await sleep(500);
  }
  console.log(`Bulk transfer Ⓝ successfully to ${validAccounts.length} accounts`);
}

/*
Usage: node src/bulk-transfer.js <path/to/accounts.csv>

The accounts.csv file format should be:

account,amount
"alice.testnet",0.001
"bob.testnet",0.001
"claire.testnet",0.001
"david.testnet",0.001
"edward.testnet",0.001

*/
const csvFilePath = process.argv[2];

if (!csvFilePath) {
  console.error('Bad arguments');
  console.error('Usage: node src/bulk-transfer.js <path/to/accounts.csv>');
  process.exit(1);
}
if (!ACCOUNT_NAME) {
  console.error('Missing NEAR_ACCOUNT environ');
  process.exit(2);
}

bulkTransfer(csvFilePath).catch(console.error);
