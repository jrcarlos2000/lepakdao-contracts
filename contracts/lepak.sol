pragma solidity ^0.8.0;

import "@openzeppelin/contracts/Access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import { ByteHasher } from "./helpers/ByteHasher.sol";
import { IWorldID } from "./interfaces/IWorldID.sol";

contract LepakImplementation is Ownable{
    using ByteHasher for bytes;
    using SafeMath for uint256;


    mapping(address => bytes32) UserInfoURI;

    // @dev  worldcoin id integration
    IWorldID internal immutable worldId;
    uint256 internal immutable groupId = 1;
    mapping(uint256 => bool) internal nullifierHashes;
    error InvalidNullifier();

    constructor(IWorldID _worldId) {
        worldId = _worldId;
    }

    function joinWithETH(bytes32 infoURI,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof) external payable {

        //worlcoin check
        if (nullifierHashes[nullifierHash]) revert InvalidNullifier();
        worldId.verifyProof(
            root,
            groupId,
            abi.encodePacked(infoURI).hashToField(),
            nullifierHash,
            abi.encodePacked(address(this)).hashToField(),
            proof
        );

        // finally, we record they've done this, so they can't do it again (proof of uniqueness)
        nullifierHashes[nullifierHash] = true;

        //add user to the list for their info
        UserInfoURI[msg.sender] = infoURI;
    }
    // function joinWithToken(bytes32 infoURI) external {

    // }
}