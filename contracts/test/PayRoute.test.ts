import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("PayRoute", function () {
    async function deployFixture() {
        const [owner, recipient, treasury] = await ethers.getSigners();

        // Deploy Mock USDC
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        const usdc = await MockERC20.deploy("USD Coin", "USDC");

        // Deploy Router
        const Router = await ethers.getContractFactory("PayRouteRouter");
        const router = await Router.deploy(await usdc.getAddress(), await treasury.getAddress(), 10); // 0.1% fee

        // Deploy Vault
        const Vault = await ethers.getContractFactory("PayRouteVault");
        const vault = await Vault.deploy(await usdc.getAddress(), "PayRoute Vault", "prUSDC");

        // Deploy IdentityGate (with dummy verifier address for testing)
        const Gate = await ethers.getContractFactory("PayRouteIdentityGate");
        const gate = await Gate.deploy(await owner.getAddress(), 1, 2);

        return { usdc, router, vault, gate, owner, recipient, treasury };
    }

    it("Should send payment and collect fee", async function () {
        const { usdc, router, owner, recipient, treasury } = await loadFixture(deployFixture);

        const amount = ethers.parseUnits("100", 18);
        const fee = (amount * 10n) / 10000n;
        const amountAfterFee = amount - fee;

        await usdc.approve(await router.getAddress(), amount);

        await expect(router.sendPayment(await recipient.getAddress(), amount, "route1"))
            .to.emit(router, "PaymentSent")
            .withArgs(await owner.getAddress(), await recipient.getAddress(), await usdc.getAddress(), amountAfterFee, fee, "route1");

        expect(await usdc.balanceOf(await recipient.getAddress())).to.equal(amountAfterFee);
        expect(await usdc.balanceOf(await treasury.getAddress())).to.equal(fee);
    });

    it("Should deposit into vault", async function () {
        const { usdc, vault, owner } = await loadFixture(deployFixture);
        const amount = ethers.parseUnits("100", 18);

        await usdc.approve(await vault.getAddress(), amount);
        await vault.deposit(amount, await owner.getAddress());

        expect(await vault.balanceOf(await owner.getAddress())).to.equal(amount); // 1:1 initially
    });

    it("Should have identity gate deployed", async function () {
        const { gate, recipient } = await loadFixture(deployFixture);

        // By default no one is verified (no ZK proof submitted)
        expect(await gate.isHuman(await recipient.getAddress())).to.be.false;
    });
});
