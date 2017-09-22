var AEProof = artifacts.require("./AEProof.sol");
var AEProof2 = artifacts.require("./AEProof2.sol");

module.exports = function(deployer) {
  deployer.deploy(AEProof);
  deployer.deploy(AEProof2);
};
