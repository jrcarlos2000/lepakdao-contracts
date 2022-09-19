require("hardhat");
const { utils } = require("ethers");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { parseUnits, formatUnits } = require("ethers").utils;
const { getTokenAddresses, isFork, isPolygon, isMumbai } = require("../utils/helpers");
const {
  deployWithConfirmation,
  withConfirmation,
  log,
} = require("../utils/deploy");

const deployCore = async () => {
  const { deployerAddr, governorAddr } = await getNamedAccounts();
  const dLepakMembership = await deployWithConfirmation("LepakMembership", ["Lepak SBT", "LPK", "baseuri/"]);
  const dLepakCore = await deployWithConfirmation("LepakCore",[deployerAddr,dLepakMembership.address]);
  await deployWithConfirmation("LepakLifestyle",[dLepakCore.address]);
  const sGovernor = await ethers.provider.getSigner(governorAddr);

  let cLepakMembership = await ethers.getContractAt('LepakMembership',dLepakMembership.address);
  let cLepakCore = await ethers.getContractAt('LepakCore',dLepakCore.address);

  console.log("Deployed contracts");

  if(isPolygon || isMumbai){
    await cLepakMembership.transferOwnership(cLepakCore.address);
    await withConfirmation(
      cLepakCore.connect(sGovernor).joinWithoutEth("emerson")
    );
  }

  const isMember = await cLepakCore.isMember(governorAddr);
  console.log(governorAddr, isMember);
};

const main = async () => {
  await deployCore();
};

main.id = "001_core";
main.skip = () => isFork;
module.exports = main;
