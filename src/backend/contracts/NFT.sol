// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;


import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFT is ERC721URIStorage{
    //Variabile che conta il numero di NFT, è una variabile salvata all'interno della blockchain
    uint public tokenCount;
    //Chiamo il costruttore del contratto che sto ereditando.
    //nome e simbolo dell'NFT
    constructor() ERC721("Dapp NFT","DAPP"){}

    //tokenURI sono i metadati dell'NFT, cioè è il link al contenuto dell'nft che si trova in IPFS
    function mint(string _tokenURI)
}