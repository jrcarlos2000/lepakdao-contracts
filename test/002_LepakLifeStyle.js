const { expect } = require("chai");
const { ethers } = require("hardhat");
const {defaultFixture} = require('./_fixture');
const {loadFixture} = require('../utils/helpers');
const { parseUnits, parseEther } = require("ethers/lib/utils");

describe("Lepak LifeStyle", async () => {
  describe("Add stay", async ()=>{
    it("mod can add stay", async () => {
      const { cLepakCore, cLepakMembership,cLepakLifestyle, deployer, account1, account2 } = await loadFixture(defaultFixture);
      await cLepakMembership.transferOwnership(cLepakCore.address);
      await cLepakCore.connect(deployer).setMods([account1.address]);
      await cLepakLifestyle.connect(account1).addStay('stay1',[parseEther('1.0', parseEther("0.1"))]);
    });
    it("non mod cant add stay", async () => {
      const { cLepakCore, cLepakMembership,cLepakLifestyle, deployer, account1, account2 } = await loadFixture(defaultFixture);
      await cLepakMembership.transferOwnership(cLepakCore.address);
      await cLepakCore.connect(deployer).setMods([account1.address]);
      await expect(cLepakLifestyle.connect(deployer).addStay('Stay1',[parseEther('1.0',parseEther("0.2"))])).to.be.revertedWith("caller is not a mod");
    });
  });
  describe("Apply for stay", async ()=>{
    it("members of DAO can apply for stay", async () => {
      const { cLepakCore, cLepakMembership,cLepakLifestyle, deployer, account1, account2 , account3} = await loadFixture(defaultFixture);
      await cLepakMembership.transferOwnership(cLepakCore.address);
      const priceOfMembership = await cLepakMembership.currentPriceEth();
      await cLepakCore.connect(account1).joinWithEth('member1',{value : priceOfMembership});
      await expect(cLepakLifestyle.connect(account1).applyForStay(1)).to.be.revertedWith("this stay id doesnt exist");

      await cLepakCore.connect(deployer).setMods([account3.address, account2.address]);
      await cLepakLifestyle.connect(account2).addStay('Stay1',[parseEther('1.0','2.0')]);
      await cLepakLifestyle.connect(account1).applyForStay(1);

      const addr = await cLepakLifestyle.stayApplications(1,0);
      expect(addr).to.equal(account1.address);

    });
    it("non members of DAO cant apply for stay", async () => {
      const { cLepakCore, cLepakMembership,cLepakLifestyle, deployer, account1, account2 , account3} = await loadFixture(defaultFixture);
      await cLepakMembership.transferOwnership(cLepakCore.address);
      const priceOfMembership = await cLepakMembership.currentPriceEth();
      await cLepakCore.connect(deployer).setMods([account3.address, account2.address]);
      await cLepakLifestyle.connect(account2).addStay('Stay1',[parseEther('1.0','2.0')]);
      await expect(cLepakLifestyle.connect(account1).applyForStay(1)).to.be.revertedWith("caller is not a member");

    });
  });
  describe("Approve for stay", async ()=>{
    it("mods can approve members", async () => {
      const { cLepakCore, cLepakMembership,cLepakLifestyle, deployer, account1, account2 , account3} = await loadFixture(defaultFixture);
      await cLepakMembership.transferOwnership(cLepakCore.address);
      const priceOfMembership = await cLepakMembership.currentPriceEth();
      await cLepakCore.connect(account1).joinWithEth('member1',{value : priceOfMembership});
      await cLepakCore.connect(deployer).setMods([account3.address, account2.address]);
      await cLepakLifestyle.connect(account2).addStay('Stay1',[parseEther('1.0','2.0')]);
      await cLepakLifestyle.connect(account1).applyForStay(1);
      const addr = await cLepakLifestyle.stayApplications(1,0);
      expect(addr).to.equal(account1.address);

      const isApproved = await cLepakLifestyle.isApprovedForStay(1,account1.address);
      expect(isApproved).to.equal(false);

      //approve
      await cLepakLifestyle.connect(account2).approveForStay(1,[account1.address, deployer.address]);
      const isApproved1 = await cLepakLifestyle.isApprovedForStay(1,account1.address);
      const isApproved2 = await cLepakLifestyle.isApprovedForStay(1,deployer.address);

      expect(isApproved1 && isApproved2).to.equal(true);
    });
  });
});
