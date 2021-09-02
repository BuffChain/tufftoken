require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.6.12",
      },
      {
        version: "0.8.4",
        settings: {},
      },
    ],
    overrides: {
      "contracts/v6": {
        version: "0.6.12",
        settings: {}
      }
    }
  },
  networks: {
    hardhat: {
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMAPI_KEY}`,

        //Feel free to update at any time. This just make local development and caching easier
        blockNumber: 13089820
      }
    },
    mainnet_cloudflare: {
      url: "https://cloudflare-eth.com"
    },
  }
};
