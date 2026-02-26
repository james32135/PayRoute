import { ethers, network } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("=".repeat(60));
    console.log("  PAYROUTE — FULL DEPLOYMENT");
    console.log("=".repeat(60));
    console.log("  Deployer :", deployer.address);
    console.log("  Network  :", network.name);
    console.log("  Chain ID :", (await ethers.provider.getNetwork()).chainId.toString());
    console.log("=".repeat(60));

    // ─── Config ───
    const USDC = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359"; // Polygon Mainnet USDC
    const TREASURY = deployer.address;
    const UNIVERSAL_VERIFIER = "0xf2d01ee818509a9540d8622b56e780c1075ebbdb"; // Polygon Mainnet
    const HUMANITY_REQ = 1;
    const AGE_REQ = 2;
    const COUNTRY_REQ = 3;

    // ─── 1. Router ───
    console.log("\n[1/6] Deploying PayRouteRouter...");
    const Router = await ethers.getContractFactory("PayRouteRouter");
    const router = await Router.deploy(USDC, TREASURY, 10); // 0.1% fee
    await router.waitForDeployment();
    const routerAddr = await router.getAddress();
    console.log("  -> PayRouteRouter:", routerAddr);

    // ─── 2. Vault ───
    console.log("\n[2/6] Deploying PayRouteVault...");
    const Vault = await ethers.getContractFactory("PayRouteVault");
    const vault = await Vault.deploy(USDC, "PayRoute Vault", "prUSDC");
    await vault.waitForDeployment();
    const vaultAddr = await vault.getAddress();
    console.log("  -> PayRouteVault:", vaultAddr);

    // ─── 3. IdentityGate ───
    console.log("\n[3/6] Deploying PayRouteIdentityGate...");
    const Gate = await ethers.getContractFactory("PayRouteIdentityGate");
    const gate = await Gate.deploy(UNIVERSAL_VERIFIER, HUMANITY_REQ, AGE_REQ);
    await gate.waitForDeployment();
    const gateAddr = await gate.getAddress();
    console.log("  -> PayRouteIdentityGate:", gateAddr);

    // ─── 4. PaymentAgent ───
    console.log("\n[4/6] Deploying PayRoutePaymentAgent...");
    const Agent = await ethers.getContractFactory("PayRoutePaymentAgent");
    const agent = await Agent.deploy(TREASURY, 30); // 0.3% fee
    await agent.waitForDeployment();
    const agentAddr = await agent.getAddress();
    console.log("  -> PayRoutePaymentAgent:", agentAddr);

    // Add USDC as supported token for agent
    const tx1 = await agent.setSupportedToken(USDC, true);
    await tx1.wait();
    console.log("     USDC enabled for agent payments");

    // ─── 5. TieredLimits ───
    console.log("\n[5/6] Deploying PayRouteTieredLimits...");
    const Limits = await ethers.getContractFactory("PayRouteTieredLimits");
    const limits = await Limits.deploy(UNIVERSAL_VERIFIER, HUMANITY_REQ, AGE_REQ, COUNTRY_REQ);
    await limits.waitForDeployment();
    const limitsAddr = await limits.getAddress();
    console.log("  -> PayRouteTieredLimits:", limitsAddr);

    // ─── 6. RecurringPayments ───
    console.log("\n[6/6] Deploying PayRouteRecurringPayments...");
    const Recurring = await ethers.getContractFactory("PayRouteRecurringPayments");
    const recurring = await Recurring.deploy(TREASURY, 5); // 0.05% fee
    await recurring.waitForDeployment();
    const recurringAddr = await recurring.getAddress();
    console.log("  -> PayRouteRecurringPayments:", recurringAddr);

    // Add USDC as supported recurring token
    const tx2 = await recurring.setSupportedToken(USDC, true);
    await tx2.wait();
    console.log("     USDC enabled for recurring payments");

    // ─── Summary ───
    console.log("\n" + "=".repeat(60));
    console.log("  DEPLOYMENT COMPLETE");
    console.log("=".repeat(60));
    console.log(`
  Contract Addresses:
  -------------------
  PayRouteRouter:            ${routerAddr}
  PayRouteVault:             ${vaultAddr}
  PayRouteIdentityGate:      ${gateAddr}
  PayRoutePaymentAgent:      ${agentAddr}
  PayRouteTieredLimits:      ${limitsAddr}
  PayRouteRecurringPayments: ${recurringAddr}

  Config:
  -------
  USDC:               ${USDC}
  Treasury:           ${TREASURY}
  Universal Verifier: ${UNIVERSAL_VERIFIER}
  Network:            ${network.name}

  Next Steps:
  -----------
  1. Copy addresses to frontend .env
  2. Verify contracts on PolygonScan:
     npx hardhat verify --network polygon ${routerAddr} "${USDC}" "${TREASURY}" 10
     npx hardhat verify --network polygon ${vaultAddr} "${USDC}" "PayRoute Vault" "prUSDC"
     npx hardhat verify --network polygon ${gateAddr} "${UNIVERSAL_VERIFIER}" ${HUMANITY_REQ} ${AGE_REQ}
     npx hardhat verify --network polygon ${agentAddr} "${TREASURY}" 30
     npx hardhat verify --network polygon ${limitsAddr} "${UNIVERSAL_VERIFIER}" ${HUMANITY_REQ} ${AGE_REQ} ${COUNTRY_REQ}
     npx hardhat verify --network polygon ${recurringAddr} "${TREASURY}" 5
`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
