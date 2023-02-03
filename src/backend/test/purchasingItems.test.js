const { expect } = require('chai');
const eventemitter2 = require('chai-eventemitter2');

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
    let ITEM_ID = new BN('1')
    let TOKEN_ID = new BN('1')
    let marketplace_deployer = accounts[0]
    let nft_creator = accounts[1]
    let nft_buyer = accounts[2]

    before(async() => {
        marketplace = await Marketplace.deployed(1,{from: marketplace_deployer});
        nft = await Nft.deployed();
    });

    describe("Purchasing marketplace items", function(){
        let price = '2'
        beforeEach(async function(){
            await nft.mint(URI,{from: nft_creator})
            await nft.setApprovalForAll(marketplace.address, true,{from: nft_creator})
            await marketplace.makeItem(nft.address,1,web3.utils.toWei(price),{from: nft_creator})
        });
        it("Should update item as sold, pay seller, transfer NFT to buyer, charge fees and emit Bought event", async function(){
            const sellerInitialEthBal = await web3.eth.getBalance(nft_creator)
            const feeAccountInitialEthBal = await web3.eth.getBalance(marketplace_deployer) 
            // fetch items total price (market fees + item price)
            let totalPriceInWei = await marketplace.getTotalPrice(1);
            //addr2 purchases item.
            const receipt = await marketplace.purchaseItem(1,{from: nft_buyer,value: totalPriceInWei})
            expectEvent(receipt,"Bought",{itemId:ITEM_ID,nft:nft.address,tokenId:TOKEN_ID,price:web3.utils.toWei(price),seller:nft_creator,buyer:nft_buyer})
            const sellerFinalEthBal = await web3.eth.getBalance(nft_creator)
            const feeAccountFinalEthBal = await web3.eth.getBalance(marketplace_deployer)
            //Seller should receive payment for the price of the NFT sold.
            expect(+web3.utils.fromWei(sellerFinalEthBal)).to.be.equal(+price+ +web3.utils.fromWei(sellerInitialEthBal))
            //Calculate fee
            const fee = (feePercent /100) * price
            //feeAccount should receive fee
            expect(+web3.utils.fromWei(feeAccountFinalEthBal)).to.be.equal(+fee+ +web3.utils.fromWei(feeAccountInitialEthBal))
            //the buyer should now own the nft
            expect(await nft.ownerOf(1)).to.be.equal(nft_buyer);
            //Item should be marked as sold
            expect((await marketplace.items(1)).sold).to.be.equal(true)
        });
    })
});