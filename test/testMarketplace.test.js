const { expect } = require('chai');

// Import utilities from Test Helpers
const { BN, expectEvent, expectRevert, constants } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');

const Marketplace = artifacts.require("Marketplace")
const Nft = artifacts.require("NFT");

contract ("Marketplace",(accounts) => {
    let nft 
    let marketplace 
    const FEE_PERCENT = new BN('1')
    let URI = "Sample URI"
    let MARKETPLACE_ITEM = new BN('1')
    let ITEM_ID = new BN('1')
    let TOKEN_ID = new BN('1')
    let priceBN = new BN('1')
    let price = '1'
    //user that deply the marketplace smart contracts
    let marketplace_deployer = accounts[0]
    //is the minter of nft and the seller
    let nft_creator = accounts[1]


    before(async() => {
        marketplace = await Marketplace.deployed(1,{from: marketplace_deployer});
        nft = await Nft.deployed();
    });

    it("Should track feeAccount and feePercent of the marketplace", async function(){
        expect(await marketplace.feeAccount()).to.be.equal(marketplace_deployer);
        expect(await marketplace.feePercent()).to.be.bignumber.equal(FEE_PERCENT)
    });

    beforeEach(async function(){
        //addr1 mints an nft
        await nft.mint(URI,{from: nft_creator})
        //addr1 approves marketplace to spend nft
        //abbiamo bisogno della funzione di approvazione, poichè per far si che la funzione transferFrom funzioni, chi chiama la funziona ha bisogno di avere l'approvazione dallo smart contract Marketplace per trasferire il suo NFT al marketplace
        await nft.setApprovalForAll(marketplace.address, true, {from: nft_creator})
    });
    it("Should track newly created item, transfer NFT from seller to marketplace and emit Offered event", async function(){
        //addr1 offers their nft at a price of 1 ether
        //passiamo wei invece di ether poichè in solidity non si possono rappresentare i valori decimali, possiamo solo rappresentare interi. Quindi bisogna rappresentare gli ether negli smart contract con la più piccola suddivisione, cioè in wei.
        const receipt = await marketplace.makeItem(nft.address,1,web3.utils.toWei(price), {from: nft_creator})
        expectEvent(receipt,"Offered",{itemId:ITEM_ID,nft: nft.address,tokenId:TOKEN_ID,price:web3.utils.toWei(price),seller:nft_creator})
        //Owner of NFT should now be the marketplace
        expect(await nft.ownerOf(1)).to.be.equal(marketplace.address);
        //Item count should now equal 1
        expect(await marketplace.itemCount()).to.be.bignumber.equal(MARKETPLACE_ITEM)
        //Get item from items mapping then check fields to ensure they are correct
        const item = await marketplace.items(1)
        expect(item.itemId).to.be.bignumber.equal(ITEM_ID)
        expect(item.nft).to.be.equal(nft.address)
        expect(item.tokenId).to.be.bignumber.equal(TOKEN_ID)
        expect(item.price).to.be.bignumber.equal(web3.utils.toWei(priceBN))
        expect(item.sold).to.be.equal(false)
    });
    //Check if we pass 0 as price, the item isn't inserted
    it("Should fail if price is set to zero", async function(){
        //await expect(marketplace.makeItem(nft.address,1,0)).to.be.revertedWith("Price must be greater than zero");
            await expectRevert(marketplace.makeItem(nft.address,1,0),"Price must be greater than zero")
    });
});
