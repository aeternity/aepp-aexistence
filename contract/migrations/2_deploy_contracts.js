var AEProof = artifacts.require("./AEProof.sol");
var AEProof2 = artifacts.require("./AEProof2.sol");

module.exports = function(deployer) {
  deployer.deploy(AEProof);
  deployer.deploy(AEProof2, '0x35d8830ea35e6Df033eEdb6d5045334A4e34f9f9');
};
