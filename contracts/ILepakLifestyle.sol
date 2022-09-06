pragma solidity ^0.8.0;

interface ILepakLifestyle {

    struct LepakStay {
        address addr;
        uint256 dateJoined;
    }

    function addStay() external;
    function removeStay() external;
    function applyForStay() external;
    function reviewForStay() external;
    function whitelistForStay() external;

    //readers 
    function getStay(uint idx) external view returns(LepakStay memory);
}