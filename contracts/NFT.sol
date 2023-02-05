// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;


import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFT is ERC721URIStorage{
    //Variabile che conta il numero di NFT, è una variabile salvata all'interno della blockchain
    uint public tokenCount;
    //Chiamo il costruttore del contratto che sto ereditando.
    //nome e simbolo dell'NFT
    constructor() ERC721("Dapp NFT","DAPP"){}

    //mint produrrà nuovi NFT
    //tokenURI sono i metadati dell'NFT, cioè è il link al contenuto dell'nft che si trova in IPFS
    function mint(string memory _tokenURI) external returns(uint){
        tokenCount++;
        //producto l'nft chiamando la funzione ereditata da erc721
        _safeMint(msg.sender, tokenCount);
        //setta i metadata per il nuovo NFT creato
        _setTokenURI(tokenCount, _tokenURI);
        //retiruiamo l'id del nuovo NFT creato
        return(tokenCount);
    }
}