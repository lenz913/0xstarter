<img src="https://github.com/0xProject/branding/blob/master/0x_Black_CMYK.png" width="200px" >

# 0x Starter Project

![cli](https://user-images.githubusercontent.com/27389/42074402-6dcc5ccc-7baf-11e8-84f1-9a27f1a96b08.png)

# 0x Starter modified

This project is meant to isolate the maker and taker scenario for interecting with a Standard Relayer, by running these 2 scenarios from the command-line:

## Scenarios

- Maker
- Taker

Below are the descriptions that you can find from the 0x-starter-kit to help you build the project.
If you are interested in trying out other scenarios, you can go to (https://github.com/0xProject/0x-starter-project) and check out the other provided scenarios.

## Getting Started

By default this project uses the 0x development mnemonic running against Ganache. This project can be configured to use a different mnenonic and also run against Kovan testnet.

You may choose to update the mnemonic in `src/configs.ts` or use the one provided (note if many people use this mnemonic on Kovan then the funds may be drained). When changing the mnemonic ensure that the account has available funds (ETH and ZRX) on the respective network. You can request ZRX and ETH from the 0x Faucet located in [0x Portal](https://0xproject.com/portal/account).

Install dependencies:

```
yarn install
```

Build this package:

```
yarn build
```

Download the Ganache snapshot and load it on to a Ganache node:

```
yarn download_snapshot
yarn ganache-cli
```

Start the Standard Relayer in another terminal:

```
yarn scenario:fake_sra_server
```

Start the Maker scenario, to deploy contracts to the orderbook:

```
yarn scenario:maker
```

Start the Taker scenario, to take the most optimal contract offered by the makers:

```
yarn scenario:taker
```

All the scenarios commands can be found in the `package.json`'s `scripts` section and begin with `scenario:`.

### Switching to Kovan

To switch between Kovan/ganache, change the last line in `src/configs.ts` and re-build. Ganache is enabled by default.

For Ganache:

```
export const NETWORK_CONFIGS = GANACHE_CONFIGS;
```

For Kovan:

```
export const NETWORK_CONFIGS = KOVAN_CONFIGS;
```

### Windows Development Setup

If you're setting up Node.js for the first time on Windows, you may find the following [StackOverflow guide](https://stackoverflow.com/questions/15126050/running-python-on-windows-for-node-js-dependencies/39648550#39648550) useful. There are a few build tools required for Node.js on Windows which are not installed by default (such as Python). Please follow that guide before running through the tutorials.
