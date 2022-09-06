require("hardhat");
const { utils } = require("ethers");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { parseUnits, formatUnits } = require("ethers").utils;
const { getTokenAddresses, isFork } = require("../utils/helpers");
const {
  deployWithConfirmation,
  withConfirmation,
  log,
} = require("../utils/deploy");

const deployCore = async () => {
  const { deployerAddr, governorAddr } = await getNamedAccounts();
  await deployWithConfirmation("DummyToken", ["Test Token", "TEST"]);
  const cDummyToken = await ethers.getContract("DummyToken");
  const cLepakDAO = await deployWithConfirmation('LepakDao');
};

const main = async () => {
  await deployCore();
};

main.id = "001_core";
main.skip = () => isFork;
module.exports = main;
