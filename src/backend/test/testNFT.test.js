const { expect } = require('chai');

// Import utilities from Test Helpers
const { BN, expectEvent, expectRevert, constants } = require('@openzeppelin/test-helpers');


const Nft = artifacts.require("NFT");

contract ("NFT",(accounts) => {
    let nft 
    let URI = "Sample URI"
    const COUNT1 = new BN('1')
    const BALANCE = new BN('1')
    const COUNT2 = new BN('2')


    before(async() => {
        nft = await Nft.deployed();
    });

    describe("Deployment", async () => {
        it("Should track name and symbol of the nft collection", async function(){
            expect(await nft.name()).to.be.equal("Dapp NFT")
            expect(await nft.symbol()).to.be.equal("DAPP")
        });
    });

    describe("Minting NFTs", function(){
        it("Should track each minted NFT", async function(){
            //addr1 mints an NFT
            await nft.mint(URI,{from: accounts[0]});
            expect(await nft.tokenCount()).to.be.bignumber.equal(COUNT1);
            expect(await nft.balanceOf(accounts[0])).to.be.bignumber.equal(BALANCE);
            expect(await nft.tokenURI(1)).to.be.equal(URI);
            //addr2 mints an NFT
            await nft.mint(URI,{from: accounts[1]})
            expect(await nft.tokenCount()).to.be.bignumber.equal(COUNT2);
            expect(await nft.balanceOf(accounts[1])).to.be.bignumber.equal(BALANCE);
            expect(await nft.tokenURI(2)).to.be.equal(URI);
        });
    });
});