var AEProof = artifacts.require("./AEProof.sol");

module.exports = function(deployer) {
  deployer.deploy(AEProof, '0x35d8830ea35e6Df033eEdb6d5045334A4e34f9f9'); //kovan
};
