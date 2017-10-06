module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    ropsten: {
      network_id: 3,
      host: "localhost",
      port: 8545
    },
    kovan: {
      network_id: 42,
      host: "localhost",
      port: 8545,
      from: "0x429E2ff164D9f48CC27b505Be097504B00F29995"
    }
  }
};
