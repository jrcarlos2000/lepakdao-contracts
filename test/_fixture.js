const { ethers } = require("hardhat");
const hre = require("hardhat");

async function defaultFixture() {
    await deployments.fixture();
    const cLepakMembership = await ethers.getContract('LepakMembership');
    const cLepakCore = await ethers.getContract('LepakCore');
    const cLepakLifestyle = await ethers.getContract('LepakLifestyle');
    const signers = await ethers.getSigners();
    const deployer = signers[0];
    const account1 = signers[1];
    const account2 = signers[2];
    const account3 = signers[3];
    const account4 = signers[4];

    return {
        cLepakMembership,
        cLepakCore,
        cLepakLifestyle,
        deployer,
        account1,
        account2,
        account3,
        account4
    }
}

module.exports = {
    defaultFixture
}