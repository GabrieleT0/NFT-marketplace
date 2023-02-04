const { expect } = require('chai');

// Import utilities from Test Helpers
const { BN, expectEvent, expectRevert, constants } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');

const Marketplace = artifacts.require("Marketplace")
const Nft = artifacts.require("NFT");

contract ("Marketplace",(accounts) => {
    let nft 
    let marketplace 
    let feePercent = 1
    let URI = "Sample URI"
    let marketplace_deployer = accounts[0]
    let nft_creator = accounts[1]
    let nft_buyer = accounts[2]
    let price = '3'
    let totalPriceInWei;

    beforeEach(async() => {
        marketplace = await Marketplace.deployed(feePercent,{from: marketplace_deployer});
        nft = await Nft.deployed();
        await nft.mint(URI,{from: nft_creator})
        await nft.setApprovalForAll(marketplace.address, true,{from: nft_creator})
        await marketplace.makeItem(nft.address,1,web3.utils.toWei(price),{from: nft_creator})
    });

    it("Should fail for invalid item ids, sold items and when ether is paid", async function(){
        //fails for invalid item ids
        await expectRevert(marketplace.purchaseItem(2,{from: nft_buyer, value: totalPriceInWei}),"item doesn't exist");
        await expectRevert(marketplace.purchaseItem(0,{from: nft_buyer, value:totalPriceInWei}),"item doesn't exist");
        //fails when not enougt ether is paid with the transaction
        await expectRevert(marketplace.purchaseItem(1,{from: nft_buyer, value: web3.utils.toWei(price)}),"not enough ether to cover item price and market fee");
        //nft_buyer purchases item 1
        totalPriceInWei = await marketplace.getTotalPrice(1);
        expect(await marketplace.purchaseItem(1,{from: nft_buyer, value: totalPriceInWei}));
        //marketplace_deployer tries purchasing item 1 after its been sold
        await expectRevert(marketplace.purchaseItem(1,{from: marketplace_deployer, value: totalPriceInWei}),"item already sold");
    });
});