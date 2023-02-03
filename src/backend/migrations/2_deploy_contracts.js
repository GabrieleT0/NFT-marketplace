var nft = artifacts.require("NFT");
var marketplace = artifacts.require('Marketplace')

module.exports = function(deployer) {
  deployer.deploy(nft);
  deployer.deploy(marketplace,1);
};