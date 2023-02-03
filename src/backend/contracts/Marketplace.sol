// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";



//ReentrancyGuard per proteggere lo smart contract dal reentrancy attacks
contract Marketplace is ReentrancyGuard{
    address payable public immutable feeAccount; //the account that receives fees
    uint public immutable feePercent; //the fee percentage on sale
    uint public itemCount;

    struct Item{
        uint itemId;
        IERC721 nft; //istanza del contratto NFT associato all'NFT
        uint tokenId;
        uint price;
        address payable seller;
        bool sold;
    }

    //indexed ci permette di cercare l'evento usando l'indirizzo dell'nft e del venditore come filtro
    event Offered (
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller
    );

    // itemId (key) -> Item (value)
    mapping(uint => Item) public items;

    constructor(uint _feePercent){
        feeAccount = payable(msg.sender);
        feePercent = _feePercent;
    }
    //nonReentrant previene che utenti malintenzionait chiamino questa funzione e poi rientrino dinuovo dentro prima che la prima chiamata della funzione sia terminata.
    function makeItem(IERC721 _nft, uint _tokenId, uint _price) external nonReentrant{
        require(_price > 0, "Price must be greater than zero");
        itemCount++;
        //transfer nft
        _nft.transferFrom(msg.sender, address(this), _tokenId);
        // add new item to items mapping
        items[itemCount] = Item(
            itemCount,
            _nft,
            _tokenId,
            _price,
            payable(msg.sender),
            false
        );
        //emit Offered event
        //un envento permette di eseguire il log dei dati della blockchain.
        emit Offered(
            itemCount,
            address(_nft),
            _tokenId,
            _price,
            msg.sender
        );
    }
}   