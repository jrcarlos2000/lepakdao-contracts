pragma solidity ^0.8.0;

interface ILepakCore {
    function isMod(address _mod) external view returns (bool);
    function isMember(address _user) external view returns (bool);
}