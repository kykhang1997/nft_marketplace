// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

struct NFTListing {
    uint256 price;
    address seller;
}

contract NFTMarket is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    using SafeMath for uint256;

    Counters.Counter private _tokenIDs;

    mapping(uint256 => NFTListing) private _listings;

    address private _owner;

    constructor() ERC721("KaoKey NFTs", "KNFT") {
        _owner = msg.sender;
    }

    /*
     * if tokenURI is not an empty string => an NFT was created
     * if price is not 0 => an NFT was listed
     * if price is 0 && tokenURI is not an empty string => an NFT was transferred (either bought, or the listing was cancelled)
     */

    event NFTTransfer(
        uint256 tokenID,
        address from,
        address to,
        string tokenURI,
        uint256 price
    );

    function createNFT(string calldata tokenURI) public {
        _tokenIDs.increment();
        uint256 currentID = _tokenIDs.current();
        _safeMint(msg.sender, currentID);
        _setTokenURI(currentID, tokenURI);
        emit NFTTransfer(currentID, address(this), msg.sender, tokenURI, 0);
    }

    //listNFT
    function listNFT(uint256 tokenID, uint256 price) public {
        require(price > 0, "NFTMarket: price must be greater than 0");
        _transfer(msg.sender, address(this), tokenID);
        _listings[tokenID] = NFTListing(price, msg.sender);
        emit NFTTransfer(tokenID, address(this), msg.sender, "", price);
    }

    //buyNFT
    function buyNFT(uint256 tokenID) public payable {
        NFTListing memory listing = _listings[tokenID];
        require(listing.price > 0, "NFTMarket: nft not listed for sale");
        require(msg.value == listing.price, "NFTMarket: incorrect price");
        ERC721(address(this)).transferFrom(address(this), msg.sender, tokenID);
        payable(msg.sender).transfer(listing.price.mul(95).div(100));
        emit NFTTransfer(tokenID, address(this), msg.sender, "", 0);
    }

    // cancel Listing
    function cancelListing(uint256 tokenID) public {
        NFTListing memory listing = _listings[tokenID];
        require(listing.price > 0, "NFTMarket: nft not listed for sale");
        require(listing.seller == msg.sender, "NFTMarket: you're not owner");
        _transfer(address(this), msg.sender, tokenID);
        emit NFTTransfer(tokenID, address(this), msg.sender, "", 0);
    }

    // withdraw funds
    function widthdrawFunds() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "NFTMarket: balance is zero");
        payable(owner()).transfer(balance);
    }

    // clear listing
    function clearListing(uint256 tokenID) public {
        _listings[tokenID].price = 0;
        _listings[tokenID].seller = address(0);
    }
}
