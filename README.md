# NEAR Scripts

Commonly used NEAR scripts built with [near-api-js](https://docs.near.org/docs/develop/front-end/near-api-js)

## Install

Clone project and install dependencies

1. `git clone https://github.com/near-x/near-scripts`
2. `cd near-scripts`
3. `yarn`

## Login

Login with [`near-cli`](https://docs.near.org/docs/tools/near-cli).

`near login`

## Run Scripts

Configure environment variables

1. `export NEAR_ENV=testnet`
2. `export NEAR_ACCOUNT=<your account>`

Run a specific script

- Send Airdrop / Redpacket in batch: `node src/bulk-airdrop.js`
- Transfer NEAR to a specific account: `node src/transfer.js`
- Distribute NEAR tokens in batch: `node src/bulk-transfer.js`
