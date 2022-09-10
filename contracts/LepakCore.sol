pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import { ByteHasher } from "./helpers/ByteHasher.sol";
import { IWorldID } from "./Interfaces/IWorldId.sol";
import { ILepakMembership } from "./Interfaces/ILepakMembership.sol";

struct shortProposal {
    address targetContract;
    string call;
}

contract LepakCore is Ownable{
    using ByteHasher for bytes;
    using SafeMath for uint256;

    mapping(address => string) public UserInfoURI;
    mapping(address => bool) public usersPaid;
    mapping(address => bool) public isMod;
    uint256 public MembershipPrice = 0.01 ether;
    uint8 public modLimit = 5;
    ILepakMembership immutable membership;
    address[] public mods;
    
    /**
    ** @dev worldcoin verification
    **/
    
    IWorldID internal immutable worldId;
    uint256 internal immutable groupId = 1;
    mapping(uint256 => bool) internal nullifierHashes;
    error InvalidNullifier();

    constructor(IWorldID _worldId, address _membershipAddr) {
        worldId = _worldId;
        membership = ILepakMembership(_membershipAddr);
    }

    modifier onlyMod () {
        require (isMod[msg.sender], "caller is not a moderator");
        _;
    }

    modifier onlyModOrOwner () {
        require (isMod[msg.sender] || super.owner() == msg.sender, "caller is not a moderator or owner");
        _;
    }

    function payForTeam(address[] calldata _members) external payable {
        uint256 len = _members.length;     
        require(msg.value >= len.mul(membership.currentPriceEth()),"Not enough funds");
        for(uint i=0;i<len;i++){
            usersPaid[_members[i]] = true;
        }
    }

    function joinWithoutEth(
        string memory infoURI
        // uint256 root,
        // uint256 nullifierHash,
        // uint256[8] calldata proof
    ) external {
        require(usersPaid[msg.sender],"user hasnt paid yet");
        // _verifyPoP(infoURI,root,nullifierHash,proof);
        UserInfoURI[msg.sender] = infoURI;
        membership.provide(msg.sender);
    }

    function joinWithEth(
        string memory infoURI
        // uint256 root,
        // uint256 nullifierHash,
        // uint256[8] calldata proof
    ) external payable {
        require(msg.value >= membership.currentPriceEth(),"Not enough funds");
        // _verifyPoP(infoURI,root,nullifierHash,proof);
        UserInfoURI[msg.sender] = infoURI;
        membership.provide(msg.sender);
    }

    /**
    ** @dev worldcoin verification
    **/

    function _verifyPoP(
        bytes32 infoURI,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) internal {

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

    }

    function setMods(address[] calldata _newMods) external onlyOwner {
        uint256 len = _newMods.length;
        uint256 prev_len = mods.length;
        address[] memory temp = new address[](len);

        require(len <= modLimit, "max number of mods is 5");

        for(uint256 i=0;i<prev_len;i++){
            isMod[mods[i]] = false;
        }
        for(uint256 i=0;i<len;i++){
            temp[i] = (_newMods[i]);
            isMod[_newMods[i]] = true;
        }

        mods = temp;
    }
    function setMembershipPrice(uint256 _newPrice) external  onlyModOrOwner {
        membership.setPriceEth(_newPrice);
    }

    function getMods() external view returns (address[] memory){
        return mods;
    }
    function isMember(address _user) external view returns (bool){
        return (membership.balanceOf(_user) > uint256(0)
                || super.owner() == _user
                || isMod[_user]);
    }
}