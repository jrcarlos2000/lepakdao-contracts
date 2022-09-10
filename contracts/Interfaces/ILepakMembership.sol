pragma solidity ^0.8.0;

interface ILepakMembership {
    function provide(address _user) external;
    function revoke(address _user) external;
    function tokenURI(uint256 tokenId) external view;
    function setPriceEth(uint256 _newPrice) external;
    function updateThresholds(uint256[3] memory _newThresholds) external;
    function currentPriceEth() external view returns (uint256);
    function balanceOf(address _user) external view returns (uint256);
}