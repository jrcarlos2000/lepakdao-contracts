pragma solidity ^0.8.0;

interface ILepak {

    struct DaoMember {
        address addr;
        uint256 dateJoined;
    }
    // core function
    function joinDAO() external;
    // get data of one member by index // we keep track of all users thru the graph
    function getDaoMember(uint idx) external view returns (DaoMember memory);
    // change moderators // moderators can be named by the community DAO
    function changeMods(address newMod) external;
    // add some proposal to be decided by the DAO
    // proposal should expire after a fixedTime
    function submitProposal(bytes32 ipfsURI) external;
    // vote for proposal ONLY MODS
    function reviewProposal(uint proposalIdx) external;
    //reader for proposal
    function getProposal(uint idx) external view returns (bytes32 ipfsURI);
}
