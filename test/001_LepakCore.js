const { expect } = require("chai");
const { ethers } = require("hardhat");
const {defaultFixture} = require('./_fixture');
const {loadFixture} = require('../utils/helpers');
const { parseUnits, parseEther } = require("ethers/lib/utils");

describe("Lepak Core", async () => {
  describe("Joining as Team", async ()=>{
    it("cannot join is someone hasnt paid for you", async () => {
      const { cLepakCore, cLepakMembership, account2, account1 } = await loadFixture(defaultFixture);
      await cLepakMembership.transferOwnership(cLepakCore.address);
      await expect(cLepakCore.connect(account2).joinWithoutEth('11212')).to.be.revertedWith("user hasnt paid yet");
    });
    it("cannot pay for a team if funds not enough", async () => {
        const { cLepakCore, cLepakMembership, deployer, account2, account1 } = await loadFixture(defaultFixture);
        await cLepakMembership.transferOwnership(cLepakCore.address);
        await cLepakCore.connect(deployer).setMembershipPrice(parseEther("0.1"));
        await expect(cLepakCore.connect(account2).payForTeam([account1.address,account2.address],{value : parseEther("0.1")})).to.be.revertedWith("Not enough funds");
      });
      it("can join a team", async () => {
        const { cLepakCore, cLepakMembership, deployer, account2, account1, account3} = await loadFixture(defaultFixture);
        await cLepakMembership.transferOwnership(cLepakCore.address);
        await cLepakCore.connect(deployer).setMembershipPrice(parseEther("0.1"));
        await cLepakCore.connect(account2).payForTeam([account1.address,account2.address,account3.address],{value : parseEther("0.30000001")});

        await cLepakCore.connect(account1).joinWithoutEth("myinfo");
        await cLepakCore.connect(account2).joinWithoutEth("myinfo");
        await cLepakCore.connect(account3).joinWithoutEth("myinfo");

      });
    it("join and mint NFT", async () => {
        const { cLepakCore, cLepakMembership, deployer, account2, account1, account3} = await loadFixture(defaultFixture);
        await cLepakMembership.transferOwnership(cLepakCore.address);
        await cLepakCore.connect(deployer).setMembershipPrice(parseEther("0.1"));
        await cLepakCore.connect(account2).payForTeam([account1.address,account2.address,account3.address],{value : parseEther("0.30000001")});

        const balance0 = await cLepakMembership.balanceOf(account1.address);
        expect(balance0).to.equal(0);

        await cLepakCore.connect(account1).joinWithoutEth("myinfo1");
        const balance = await cLepakMembership.balanceOf(account1.address);
        expect(balance).to.equal(1);
    });
    it("retrive right user URI", async () => {
        const { cLepakCore, cLepakMembership, deployer, account2, account1, account3} = await loadFixture(defaultFixture);
        await cLepakMembership.transferOwnership(cLepakCore.address);
        await cLepakCore.connect(deployer).setMembershipPrice(parseEther("0.1"));
        await cLepakCore.connect(account2).payForTeam([account1.address,account2.address,account3.address],{value : parseEther("0.30000001")});

        await cLepakCore.connect(account1).joinWithoutEth("myinfo1");
        const userURI = await cLepakCore.UserInfoURI(account1.address);
        expect(userURI).to.equal("myinfo1");
    });
    it("owner set mods and mod can perform : twice", async () => {
        const { cLepakCore, cLepakMembership, deployer, account2, account1, account3} = await loadFixture(defaultFixture);
        await cLepakMembership.transferOwnership(cLepakCore.address);
        await cLepakCore.connect(deployer).setMembershipPrice(parseEther("0.1"));
        await expect(cLepakCore.connect(account1).setMembershipPrice(parseEther("0.1"))).to.be.revertedWith("caller is not a moderator or owner");
        await expect(cLepakCore.connect(deployer).setMods([account1.address,account1.address,account1.address,account1.address,account1.address,account1.address,account1.address])).to.be.revertedWith("max number of mods is 5");
        await cLepakCore.connect(deployer).setMods([account1.address,account2.address,account3.address]);
        await cLepakCore.connect(account1).setMembershipPrice(parseEther("0.1"));
    });

    it("change mods correctly", async () => {
        const { cLepakCore, cLepakMembership, deployer, account2, account1, account3} = await loadFixture(defaultFixture);
        await cLepakMembership.transferOwnership(cLepakCore.address);
        await cLepakCore.connect(deployer).setMods([account1.address,account2.address,account3.address]);
        let curr_mods;
        curr_mods = await cLepakCore.getMods();
        expect(curr_mods[0]).to.equal(account1.address);
        expect(curr_mods[1]).to.equal(account2.address);
        expect(curr_mods[2]).to.equal(account3.address);

        await cLepakCore.connect(deployer).setMods([account2.address,account1.address]);
        curr_mods = await cLepakCore.getMods();
        expect(curr_mods[0]).to.equal(account2.address);
        expect(curr_mods[1]).to.equal(account1.address);
    });

    it("owner , mod or nft holder is member of the dao", async () => {
      const { cLepakCore, cLepakMembership, deployer, account2, account1, account3} = await loadFixture(defaultFixture);
      await cLepakMembership.transferOwnership(cLepakCore.address);
      const Mcost = await cLepakMembership.currentPriceEth();
      await cLepakCore.connect(deployer).setMods([account1.address,account2.address]);
      await cLepakCore.connect(account3).joinWithEth('11212',{value : Mcost})
      const check1 = await cLepakCore.isMember(deployer.address);
      const check2 = await cLepakCore.isMember(account1.address);
      const check3 = await cLepakCore.isMember(account3.address);
      expect(check1 && check2 && check3).to.equal(true);
      
  });
    it("not owner , mod nor nft holder is not member of the dao", async () => {
      const { cLepakCore, cLepakMembership, deployer, account2, account1, account3} = await loadFixture(defaultFixture);
      await cLepakMembership.connect(deployer).provide(account1.address);
      const check0 = await cLepakCore.isMember(account1.address);
      await cLepakMembership.connect(deployer).revoke(account1.address);
      const check1 = await cLepakCore.isMember(account1.address);
      await cLepakMembership.transferOwnership(cLepakCore.address);
      const check3 = await cLepakCore.isMember(account2.address);
      const check4 = await cLepakCore.isMember(account1.address);
      const check5 = await cLepakCore.isMember(account3.address);

      expect (check0 && !check1);
      expect(!check3 && !check4 && !check5).to.equal(true);
      
  });

  });
});
