<div align="center">

<img src="https://img.shields.io/badge/🔷-PayRoute-0066FF?style=for-the-badge&labelColor=000000" alt="PayRoute" />

# PayRoute

### AI-Routed Stablecoin Payment Infrastructure on Polygon

[![Polygon Mainnet](https://img.shields.io/badge/Polygon_Mainnet-Live-7B3FE4?style=for-the-badge&logo=polygon&logoColor=white)](https://polygonscan.com)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?style=for-the-badge&logo=solidity)](https://soliditylang.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge)](LICENSE)

**Non-custodial USDC payments with AI routing, zero-knowledge identity, delegated AI agents, recurring subscriptions, and yield vaults — all live on Polygon Mainnet.**

[🚀 Launch App](https://pay-route.netlify.app) · [📜 Smart Contracts](#-smart-contracts--polygon-mainnet) · [🏗️ Architecture](#-architecture) · [📖 Docs](#-how-it-works)

</div>

---

## 🌐 The Problem

Traditional cross-border payments are broken:
- **High fees** — Banks and remittance services charge 5-10% per transaction
- **Slow settlement** — Wire transfers take 2-5 business days
- **No transparency** — Hidden exchange rates, opaque routing
- **Identity friction** — Full KYC for even small amounts
- **No programmability** — Can't automate, delegate, or compose payments

## 💡 The Solution

PayRoute is a **Polygon-native payment protocol** that replaces traditional payment rails with six interconnected smart contracts. It uses AI to find the cheapest route, zero-knowledge proofs for privacy-preserving identity, and ERC-4626 vaults for yield generation — all non-custodial, all on-chain.

---

## ✨ Features

| Feature | Description | Contract | Status |
|:--------|:------------|:---------|:------:|
| 💸 **Smart Payments** | Send USDC with AI-optimized routing (cheapest vs fastest) | PayRouteRouter | ✅ Live |
| 🤖 **AI Payment Agents** | Delegate spending to autonomous agents with per-tx & daily limits | PayRoutePaymentAgent | ✅ Live |
| 🏦 **Yield Vaults** | ERC-4626 vaults that earn real yield from payment corridor liquidity | PayRouteVault | ✅ Live |
| 🔐 **ZK Identity Gate** | Verify humanness & age via Privado ID zero-knowledge proofs | PayRouteIdentityGate | ✅ Live |
| 📊 **Tiered Limits** | Identity-based tx ceilings: $100 anon → unlimited for verified users | PayRouteTieredLimits | ✅ Live |
| 🔄 **Recurring Payments** | On-chain subscriptions with keeper automation & executor tips | PayRouteRecurringPayments | ✅ Live |
| 🌍 **LATAM Corridors** | Brazil, Mexico, Argentina, Colombia with live FX rates | Backend Service | ✅ Live |
| 📈 **Analytics Dashboard** | Volume, savings, vault deposits, activity tracking | Dashboard | ✅ Live |

---

## 🔗 Smart Contracts — Polygon Mainnet

All 6 contracts are deployed and verified on **Polygon PoS (Chain ID 137)**:

| Contract | Address | PolygonScan |
|:---------|:--------|:------------|
| **PayRouteRouter** | `0x85bB3a8b849C0F8cC9664174D60ccfeA5c5C161C` | [View ↗](https://polygonscan.com/address/0x85bB3a8b849C0F8cC9664174D60ccfeA5c5C161C) |
| **PayRouteVault** | `0x86442aF11147A4b32c5577cC701899e7696ca290` | [View ↗](https://polygonscan.com/address/0x86442aF11147A4b32c5577cC701899e7696ca290) |
| **PayRouteIdentityGate** | `0x5d8C5Ba1cb7e8aC241C3878C12f30D123D40f919` | [View ↗](https://polygonscan.com/address/0x5d8C5Ba1cb7e8aC241C3878C12f30D123D40f919) |
| **PayRoutePaymentAgent** | `0xE3CFA9B66b02536D3653b08e296B9CCc6a4575F5` | [View ↗](https://polygonscan.com/address/0xE3CFA9B66b02536D3653b08e296B9CCc6a4575F5) |
| **PayRouteTieredLimits** | `0x9cb15e3B0E1feEC12D90F792f09E8D9204E13Bc4` | [View ↗](https://polygonscan.com/address/0x9cb15e3B0E1feEC12D90F792f09E8D9204E13Bc4) |
| **PayRouteRecurringPayments** | `0x4E1ee2689A996974D275f69d4621090A18581DaB` | [View ↗](https://polygonscan.com/address/0x4E1ee2689A996974D275f69d4621090A18581DaB) |
| **USDC (Native)** | `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359` | [View ↗](https://polygonscan.com/address/0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359) |

---

## 📖 How It Works

### 1. PayRouteRouter — Smart Payment Routing
The core payment contract. Users send USDC through the router, which calculates fees (configurable basis points), splits them to the treasury, and delivers the net amount to the recipient. The AI backend scores routes for cost vs speed.

**Key Functions:**
- `sendPayment(recipient, amount, routeId)` — Execute a routed USDC payment
- `setFeeBps(bps)` — Owner sets fee (max 5%)
- `setTreasury(address)` — Owner updates fee treasury

### 2. PayRouteVault — ERC-4626 Yield Vault
A standard ERC-4626 tokenized vault backed by USDC. Depositors receive share tokens (prUSDC) representing their position. Yield is generated from payment corridor liquidity fees.

**Key Functions:**
- `deposit(assets, receiver)` — Deposit USDC, receive prUSDC shares
- `withdraw(assets, receiver, owner)` — Burn shares, withdraw USDC
- `totalAssets()` — View total vault TVL
- `balanceOf(address)` — View user's share balance

### 3. PayRouteIdentityGate — ZK Identity Verification
Integrates with Privado ID's Universal Verifier to check zero-knowledge proof credentials. Users prove they're human or over 18 without revealing personal data.

**Key Functions:**
- `hasAccess(user)` — Check if user has base access (human proof)
- `isHuman(user)` — Verify liveness/humanity credential
- `isAdult(user)` — Verify age credential (18+)
- `setVerifier(address)` — Owner updates verifier contract
- `setRequestIds(humanity, age)` — Configure proof request IDs

### 4. PayRoutePaymentAgent — AI Delegated Payments
Inspired by the x402 protocol pattern. Wallet owners create agent policies that allow external addresses (AI bots) to spend USDC on their behalf — within strict limits.

**Key Functions:**
- `createAgent(agent, maxPerTx, maxDaily, recipients, duration)` — Create a delegated agent policy
- `revokeAgent(agent)` — Immediately revoke an agent's permissions
- `executeAgentPayment(owner, recipient, token, amount, memo)` — Agent executes payment within policy
- `executeAgentPaymentWithSignature(...)` — Gasless execution via EIP-712 signature
- `getAgentPolicy(owner, agent)` — Read full policy details
- `isAgentActive(owner, agent)` — Check if agent is valid

**Policy Enforcement:**
- Per-transaction maximum amount
- Rolling 24-hour daily spending cap (auto-resets)
- Optional recipient whitelist
- Configurable expiration date
- Supported token whitelist

### 5. PayRouteTieredLimits — Identity-Gated Transaction Limits
Combines ZK identity verification with progressive transaction ceilings:

| Tier | Requirement | Daily Limit |
|:-----|:------------|:------------|
| 0 | No verification | $100 |
| 1 | Human proof (liveness) | $1,000 |
| 2 | Age + Country verified | $10,000 |
| 3 | Full verification (human + age + country) | Unlimited |

**Key Functions:**
- `getUserTier(user)` — Calculate user's current tier from ZK proofs
- `getDailyLimit(user)` — Get user's daily transaction limit
- `getRemainingDailyLimit(user)` — How much the user can still spend today
- `checkLimit(user, amount)` — Boolean check before transaction
- `recordUsage(user, amount)` — Record spend against daily limit
- `getIdentityStatus(user)` — Full status: tier, limits, verified flags
- `getMissingVerifications(user)` — What proofs user still needs
- `setSanctionedCountry(code, bool)` — Compliance: block specific countries

### 6. PayRouteRecurringPayments — On-Chain Subscriptions
Fully autonomous subscription system. Users define parameters, then anyone can trigger execution when a payment is due (earning a tip for the service).

**Key Functions:**
- `createSubscription(recipient, token, amount, interval, maxExecutions, tipBps, startTime, memo)` — Set up recurring payment
- `cancelSubscription(id)` — Permanently cancel
- `pauseSubscription(id)` / `resumeSubscription(id)` — Temporary pause/resume
- `updateSubscription(id, newAmount, newInterval)` — Modify parameters
- `executeSubscription(id)` — Anyone triggers a due payment (earns tip)
- `batchExecute(ids[])` — Execute multiple due subscriptions at once
- `isDue(id)` — Check if subscription is ready to execute
- `getDueSubscriptions(ids[])` — Filter which subscriptions are due (for keepers)

**Configuration:**
- Interval range: 1 hour to 365 days
- Executor tip: 0-5% (incentivizes timely execution)
- Protocol fee: 0-1% (to treasury)
- Unlimited or fixed number of executions

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Frontend (Netlify)                               │
│                    React 18 · Vite · TypeScript                         │
│  ┌──────────┬────────┬───────────┬────────┬──────────┬──────────────┐  │
│  │Dashboard │ Send   │ Corridors │ Vaults │ AI Agents│  Recurring   │  │
│  │          │        │           │        │          │              │  │
│  │ Identity │Analytics│Developers│        │          │              │  │
│  └──────────┴────────┴───────────┴────────┴──────────┴──────────────┘  │
│                     Wagmi v2 · Viem · Shadcn UI                         │
├─────────────────────────────────────────────────────────────────────────┤
│                      Backend API (Render)                               │
│                    Express · Node.js · TypeScript                       │
│  ┌──────────┬─────────┬───────────┬──────────┬───────────┬──────────┐ │
│  │/payments │ /vaults │/analytics │/corridors│ /identity │ /agents  │ │
│  └──────────┴─────────┴───────────┴──────────┴───────────┴──────────┘ │
│       AI Route Scoring · FX Rates · LATAM Corridor Quotes              │
├─────────────────────────────────────────────────────────────────────────┤
│                  Smart Contracts (Polygon PoS)                          │
│  ┌────────────┬───────────┬─────────────┬────────────┬──────────────┐ │
│  │   Router   │   Vault   │IdentityGate │  Agent     │  Recurring   │ │
│  │  (USDC)    │ (ERC4626) │  (ZK/iden3) │ (x402)     │  (Keeper)    │ │
│  └────────────┴───────────┴─────────────┴────────────┴──────────────┘ │
│                      TieredLimits (ZK-gated)                           │
├─────────────────────────────────────────────────────────────────────────┤
│                     External Integrations                               │
│    Privado ID (ZK Proofs) · OpenAI (AI Routing) · PolygonScan          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Why Polygon?

| Advantage | Details |
|:----------|:--------|
| **Sub-cent gas fees** | Payments cost < $0.01 in gas — makes micro-payments viable |
| **1-2 second finality** | Transactions confirm in seconds, near-instant settlement |
| **Native USDC** | Circle's official USDC is natively issued on Polygon |
| **Privado ID integration** | ZK identity infrastructure lives natively on Polygon |
| **EVM compatible** | Full Solidity + OpenZeppelin support |
| **Massive adoption** | 400M+ transactions, proven at scale |
| **AggLayer ready** | Future-proof for Polygon's unified liquidity layer |

---

## 🖥️ Frontend Pages

| Page | Description |
|:-----|:------------|
| **Dashboard** | Overview: total sent, fee savings, vault deposits, identity badge, recent activity, quick actions |
| **Send** | USDC payments with AI route scoring (cheapest vs fastest), address/username resolution, real-time quotes |
| **Corridors** | LATAM payment corridors (Brazil, Mexico, Argentina, Colombia, Global) with live FX rates |
| **Vaults** | ERC-4626 vault deposits/withdrawals, real on-chain TVL via `totalAssets()`, share balance tracking |
| **AI Agents** | Create/manage delegated payment agents, set per-tx limits, daily caps, recipient whitelists |
| **Recurring** | Set up on-chain subscriptions, choose interval/amount, pause/resume/cancel, view execution history |
| **Identity** | ZK identity verification via Privado ID, tier display, missing verifications checklist |
| **Analytics** | Transaction volume, unique recipients, savings vs banks, activity timeline |
| **Developers** | Contract addresses, ABI documentation, code examples, integration guide |

---

## 🛠️ Tech Stack

| Layer | Technology |
|:------|:-----------|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Shadcn/UI, Wagmi v2, Viem, TanStack Query |
| **Backend** | Node.js, Express, TypeScript, Zod validation |
| **Smart Contracts** | Solidity 0.8.24, Hardhat, OpenZeppelin 5.x, @iden3/contracts |
| **Identity** | Privado ID — zero-knowledge human/age/country proofs |
| **Blockchain** | Polygon PoS (Chain ID 137), Native USDC |
| **Deployment** | Netlify (frontend), Render (backend API) |

---

## 📁 Project Structure

```
PayRoute/
├── web/                         # Frontend (React + Vite)
│   ├── src/pages/               # 9 application pages + landing
│   ├── src/components/ui/       # 40+ Shadcn UI components
│   ├── src/hooks/               # React Query data hooks
│   ├── src/layouts/             # Dashboard + Marketing layouts
│   ├── src/lib/                 # Wallet config, ABIs, API client, constants
│   └── src/types/               # TypeScript type definitions
│
├── backend/                     # API Server (Express)
│   ├── src/routes/              # 6 route modules (payments, vaults, analytics, corridors, identity, agents)
│   ├── src/services/            # AI route scoring engine
│   ├── src/lib/                 # Database layer, integrations
│   └── src/config/              # Environment config with Zod validation
│
├── contracts/                   # Smart Contracts (Hardhat)
│   ├── src/                     # 6 Solidity contracts + MockERC20
│   ├── deploy/                  # Deployment scripts
│   ├── test/                    # Hardhat test suite
│   ├── typechain-types/         # Auto-generated TypeScript bindings
│   └── artifacts/               # Compiled ABIs
│
├── shared/                      # Shared TypeScript types
├── scripts/                     # Utility scripts
├── netlify.toml                 # Frontend deployment config
└── render.yaml                  # Backend deployment config
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **npm** or **pnpm**
- **MetaMask** or **Rabby** wallet with Polygon network

### 1. Clone & Install

```bash
git clone https://github.com/james32135/PayRoute.git
cd PayRoute
npm install
```

### 2. Run Backend

```bash
cd backend
npm run dev
```

### 3. Run Frontend

```bash
cd web
npm run dev
```

Open **http://localhost:5173** — connect your wallet on Polygon network.

### 4. Contract Addresses (Pre-deployed)

All contracts are already live on Polygon Mainnet. The frontend defaults point to them automatically:

```
Router:             0x85bB3a8b849C0F8cC9664174D60ccfeA5c5C161C
Vault:              0x86442aF11147A4b32c5577cC701899e7696ca290
Identity Gate:      0x5d8C5Ba1cb7e8aC241C3878C12f30D123D40f919
Payment Agent:      0xE3CFA9B66b02536D3653b08e296B9CCc6a4575F5
Tiered Limits:      0x9cb15e3B0E1feEC12D90F792f09E8D9204E13Bc4
Recurring Payments: 0x4E1ee2689A996974D275f69d4621090A18581DaB
USDC (Native):      0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359
```

---

## 🔒 Security

- **Non-custodial** — Users maintain full control of their funds at all times
- **ReentrancyGuard** — All payment/transfer functions protected against reentrancy
- **SafeERC20** — All token operations use OpenZeppelin's SafeERC20
- **Ownable** — Administrative functions restricted to contract owner
- **Daily limit auto-reset** — Tiered limits and agent policies auto-reset every 24 hours
- **Signature verification** — Agent payments support EIP-712 signed approvals
- **CORS protection** — Backend only accepts requests from the production frontend

---

## 🗺️ Roadmap

- [x] 6 Smart contracts deployed on Polygon Mainnet
- [x] Full frontend with 9 pages + landing page
- [x] AI route scoring (cheapest vs fastest)
- [x] LATAM corridors with live FX rates
- [x] ERC-4626 vault with on-chain reads
- [x] ZK identity gate (Privado ID)
- [x] Recurring payments with keeper execution
- [x] Deployed: Netlify (frontend) + Render (backend)
- [ ] Multi-token support (USDT, DAI)
- [ ] AggLayer cross-chain corridors
- [ ] Chainlink Automation for subscription keepers
- [ ] Fiat on/off ramp integration
- [ ] Mobile PWA

---

## 📄 License

MIT

---

<div align="center">

**Built on Polygon PoS · Deployed on Mainnet · Powered by AI**

[🌐 Live App](https://pay-route.netlify.app) · [🔷 Polygon](https://polygon.technology) · [🔐 Privado ID](https://privado.id) · [🛡️ OpenZeppelin](https://openzeppelin.com)

*PayRoute — The future of payments is programmable.*

</div>
