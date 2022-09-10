const { expect } = require("chai");
const { ethers } = require("hardhat");
const {defaultFixture} = require('./_fixture');
const {loadFixture} = require('../utils/helpers');
const { parseUnits, parseEther } = require("ethers/lib/utils");

describe("Lepak Membership", async () => {
  describe("Mint", async ()=>{
    it("owner can mint", async () => {
      const { cLepakMembership, deployer, account1 } = await loadFixture(defaultFixture);
      await cLepakMembership.connect(deployer).provide(account1.address);
    });
    it("not owner cant mint", async () => {
      const { cLepakMembership, account2, account1 } = await loadFixture(defaultFixture);
      await expect(cLepakMembership.connect(account2).provide(account1.address)).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("cant mint twice", async () => {
      const { cLepakMembership, deployer, account1 } = await loadFixture(defaultFixture);
      await cLepakMembership.connect(deployer).provide(account1.address);
      await expect(cLepakMembership.connect(deployer).provide(account1.address)).to.be.revertedWith("user already has membership");
    });
    it("owner can revoke, not owner cant revoke", async () => {
      const { cLepakMembership, deployer, account2, account1} = await loadFixture(defaultFixture);
      await cLepakMembership.connect(deployer).provide(account1.address);
      await expect(cLepakMembership.connect(account2).revoke(account1.address)).to.be.revertedWith("Ownable: caller is not the owner")
      await cLepakMembership.connect(deployer).revoke(account1.address);
    });
    it("cannot revoke if not minted", async () => {
      const { cLepakMembership, deployer, account1} = await loadFixture(defaultFixture);
      await expect(cLepakMembership.connect(deployer).revoke(account1.address)).to.be.revertedWith("user doesnt have membership")
    });
  });
  describe("URI", async ()=>{
    it("returns right URI", async () => {
      const { cLepakMembership, deployer, account1 } = await loadFixture(defaultFixture);
      await cLepakMembership.connect(deployer).provide(account1.address);
      let uri = await cLepakMembership.tokenURI(await cLepakMembership.tokenOfOwnerByIndex(account1.address,0));
      expect(uri).to.equal("baseuri/3");

      await cLepakMembership.connect(deployer).updateThresholds([parseEther("0.05"),parseEther("0.09"),parseEther("0.2")]);
      uri = await cLepakMembership.tokenURI(await cLepakMembership.tokenOfOwnerByIndex(account1.address,0));
      expect(uri).to.equal("baseuri/2");

      await cLepakMembership.connect(deployer).updateThresholds([parseEther("0.05"),parseEther("0.3"),parseEther("0.3")]);
      uri = await cLepakMembership.tokenURI(await cLepakMembership.tokenOfOwnerByIndex(account1.address,0));
      expect(uri).to.equal("baseuri/1");
    });
  })
});
