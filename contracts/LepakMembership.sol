pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LepakMembership is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {

    using Counters for Counters.Counter;
    bool private initialized;
    string public baseTokenURI;
    Counters.Counter private _tokenIds;
    uint256[3] public thresholds;
    uint256 public currentPriceEth = 0.0 ether;

    constructor (string memory name , string memory symbol, string memory _baseTokenURI) ERC721 (name,symbol) {
        baseTokenURI = _baseTokenURI;
    }

    function provide(address _user) external onlyOwner{
        require(balanceOf(_user) == 0, "user already has membership");
        _tokenIds.increment();
        uint256 id = _tokenIds.current();
        _mint(_user, id);
        _setTokenURI(id,baseTokenURI);
    } 

    function revoke(address _user) external onlyOwner{
        require(balanceOf(_user) > 0, "user doesnt have membership");
        _tokenIds.decrement();
        uint256 id = tokenOfOwnerByIndex(_user, 0);
        _burn(id);
    }  
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        require(from == address(0) || to == address(0), "This token is SBT");
        super._beforeTokenTransfer(from, to, tokenId);
    }
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function updateThresholds(uint256[3] memory _newThresholds) external onlyOwner{
        thresholds[0] = _newThresholds[0];
        thresholds[1] = _newThresholds[1];
        thresholds[2] = _newThresholds[2];
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        bytes1 suffix;
        uint256 price = _getPriceUsd();
        if(price > thresholds[2]){
            suffix = "3";
        }else if(price > thresholds[1]){
            suffix = "2";
        }else if (price > thresholds[0]){
            suffix = "1";
        }else{
            suffix = "0";
        }
        return string(abi.encodePacked(super.tokenURI(tokenId),suffix));
    }

    function setPriceEth(uint256 _newPrice) external onlyOwner () {
        currentPriceEth = _newPrice;
    }
    function _getPriceUsd() internal pure returns(uint256){
        return 0.1 ether;
        // return amount X price of Ether - TELLOR
    }
  
}