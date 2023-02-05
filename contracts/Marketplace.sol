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

    event Bought (
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller,
        address indexed buyer
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
    //gli utenti che chiamano questa funzinone, inviano ether e questi dovrebbero andare al venditore dell'item e una porzione al feeaccounts
    function purchaseItem(uint _itemId) external payable nonReentrant{
        uint _totalPrice = getTotalPrice(_itemId);
        //storage ci assicura di prendere l'oggetto direttamente dalla struttura Item e non di farne una copia in memoria
        Item storage item = items[_itemId];
        require(_itemId > 0 && _itemId <= itemCount, "item doesn't exist");
        require(msg.value >= _totalPrice, "not enough ether to cover item price and market fee");
        require(!item.sold, "item already sold");
        //pay seller and feeAccount
        item.seller.transfer(item.price);
        feeAccount.transfer(_totalPrice - item.price);
        //update item to sold
        item.sold = true;
        //transfer nft to buyer
        item.nft.transferFrom(address(this),msg.sender,item.tokenId);
        //emit Bought event
        emit Bought(
            _itemId,
            address(item.nft),
            item.tokenId,
            item.price,
            item.seller,
            msg.sender
        );
    }

    //prezzo totale, che va a comprendere il prezzo dell'item più le fee
    //è pubblica perchè abbiamo bisogno che sia chiamabile da purchaseItem e anche al di fuori del contratto perchè 
    //chiunque voglia comprare un item, ha bisogno di sapere quanti ether deve inviare a purchaseItem() per comprare l'item, includendo prezzo dell'NFT e le fee.
    function getTotalPrice(uint _itemId) view public returns(uint){
        return ((items[_itemId].price*(100 + feePercent))/100);
    }
}   