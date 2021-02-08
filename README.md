# NEAR Scripts

Commonly used NEAR scripts built with [near-api-js](https://docs.near.org/docs/develop/front-end/near-api-js)

## Install

Clone project and install dependencies

`git clone https://github.com/near-x/near-scripts`
`cd near-scripts`
`yarn`

## Configure

Create Symbolic Link for Crendentials

`ln -s ~/.near-credentials/ .near-credentials`

## Run Scripts

Configure Environment Variables

1. `export NEAR_ENV=testnet`
2. `export NEAR_ACCOUNT=<your account>`

Run a specific script

- Batch Airdrop: `node src/bulk-airdrop.js`
