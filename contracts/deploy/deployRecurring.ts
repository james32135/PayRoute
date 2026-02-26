import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    const USDC = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";
    const TREASURY = deployer.address;

    console.log("Deploying PayRouteRecurringPayments...");
    const Recurring = await ethers.getContractFactory("PayRouteRecurringPayments");
    const recurring = await Recurring.deploy(TREASURY, 5);
    await recurring.waitForDeployment();
    const addr = await recurring.getAddress();
    console.log("PayRouteRecurringPayments:", addr);

    const tx = await recurring.setSupportedToken(USDC, true);
    await tx.wait();
    console.log("USDC enabled for recurring payments");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
