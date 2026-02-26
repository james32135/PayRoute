<div align="center">

# PayRoute

### AI-Routed Stablecoin Payment Infrastructure on Polygon

[![Polygon](https://img.shields.io/badge/Network-Polygon_PoS-7B3FE4?style=flat-square&logo=polygon)](https://polygon.technology)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?style=flat-square&logo=solidity)](https://soliditylang.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

Non-custodial USDC payments with AI routing, zero-knowledge identity, recurring subscriptions, and yield vaults — all on Polygon.

[Launch App](#getting-started) · [Contracts](#smart-contracts) · [Architecture](#architecture)

</div>

---

## Overview

PayRoute is a **Polygon-native payment infrastructure** with six on-chain modules:

- **Smart Router** — AI-optimized USDC routing with automatic fee splitting
- **Identity Gate** — Verify humanness via Privado ID zero-knowledge proofs
- **Payment Agents** — Delegate USDC spending to AI agents with per-tx limits and daily caps
- **Yield Vaults** — ERC-4626 corridor vaults that earn real fees from payment flows
- **Tiered Limits** — Identity-gated transaction ceilings ($100 anon → unlimited verified)
- **Recurring Payments** — On-chain subscriptions with flexible intervals and keeper execution

---

## Features

| Feature | Description | Status |
|:--------|:------------|:------:|
| USDC Payments | Send/receive Native USDC on Polygon | Live |
| AI Routing | Cheapest vs fastest route optimization | Live |
| ZK Identity | Privado ID liveness credential verification | Live |
| Yield Vaults | ERC-4626 corridor vaults with real yield | Live |
| Payment Agents | x402 autonomous payment delegation | Live |
| Tiered Limits | Identity-gated tx ceilings | Live |
| Recurring Payments | On-chain subscriptions & automation | Live |
| Analytics | Volume, savings, vault deposits tracking | Live |

---

## Smart Contracts

Deployed on **Polygon Mainnet** (Chain ID 137):

| Contract | Address | Purpose |
|:---------|:--------|:--------|
| PayRouteRouter | [`0x85bB3a...161C`](https://polygonscan.com/address/0x85bB3a8b849C0F8cC9664174D60ccfeA5c5C161C) | USDC payment routing with fee collection |
| PayRouteVault | [`0x86442a...a290`](https://polygonscan.com/address/0x86442aF11147A4b32c5577cC701899e7696ca290) | ERC-4626 yield vault |
| PayRouteIdentityGate | [`0x5d8C5B...f919`](https://polygonscan.com/address/0x5d8C5Ba1cb7e8aC241C3878C12f30D123D40f919) | Privado ID ZK verification gate |
| PayRoutePaymentAgent | [`0xE3CFA9...75F5`](https://polygonscan.com/address/0xE3CFA9B66b02536D3653b08e296B9CCc6a4575F5) | AI agent payment delegation |
| PayRouteTieredLimits | [`0x9cb15e...Bc4`](https://polygonscan.com/address/0x9cb15e3B0E1feEC12D90F792f09E8D9204E13Bc4) | Identity-tiered tx limits |
| PayRouteRecurringPayments | [`0x4E1ee2...1DaB`](https://polygonscan.com/address/0x4E1ee2689A996974D275f69d4621090A18581DaB) | On-chain recurring subscriptions |
| USDC (Native) | [`0x3c499c...3359`](https://polygonscan.com/address/0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359) | Native USDC on Polygon |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                      │
│  Dashboard · Send · Corridors · Vaults · Agents · Recurring     │
├──────────────────────────────────────────────────────────────────┤
│                  Backend API (Express + Prisma)                   │
│  /payments · /vaults · /analytics · /corridors · /agents         │
├──────────────────────────────────────────────────────────────────┤
│                  Smart Contracts (Polygon PoS)                    │
│  Router · Vault · IdentityGate · Agent · Limits · Recurring     │
├──────────────────────────────────────────────────────────────────┤
│                     External Services                            │
│  OpenAI (routing) · Privado ID (ZK) · 1inch (DEX aggregation)   │
└──────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|:------|:-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Shadcn UI |
| Blockchain | Polygon PoS, Wagmi v2, Viem, Hardhat, OpenZeppelin 5.x |
| Backend | Node.js, Express, Prisma ORM |
| Identity | Privado ID — zero-knowledge proof verification |
| AI | OpenAI API for route optimization |

---

## Project Structure

```
payroute/
├── web/                    # Frontend application
│   ├── src/
│   │   ├── pages/          # Dashboard, Send, Corridors, Vaults, Agents, Recurring, Identity
│   │   ├── components/     # Shadcn UI components
│   │   ├── hooks/          # React Query hooks
│   │   ├── layouts/        # DashboardLayout, MarketingLayout
│   │   └── lib/            # API client, wallet config, ABIs, constants
│   └── public/
│
├── backend/                # API server
│   ├── src/routes/         # payments, vaults, analytics, corridors, identity, agents
│   ├── src/services/       # AI router
│   └── prisma/             # Database schema
│
├── contracts/              # Solidity smart contracts
│   ├── src/                # 6 PayRoute contracts
│   ├── deploy/             # Hardhat deployment scripts
│   └── test/               # Test suite
│
├── shared/                 # Shared TypeScript types
└── scripts/                # Utility scripts
```

---

## Getting Started

### Prerequisites

- **Node.js** v18+
- **pnpm** — `npm install -g pnpm`
- **Wallet** — MetaMask or Rabby with Polygon network

### 1. Clone & Install

```bash
git clone https://github.com/james32135/PayRoute.git
cd PayRoute
pnpm install
```

### 2. Configure Environment

Copy `.env.example` files in `web/`, `backend/`, and `contracts/` directories and fill in your keys.

**Key addresses (already set as defaults):**
```env
ROUTER=0x85bB3a8b849C0F8cC9664174D60ccfeA5c5C161C
VAULT=0x86442aF11147A4b32c5577cC701899e7696ca290
IDENTITY_GATE=0x5d8C5Ba1cb7e8aC241C3878C12f30D123D40f919
PAYMENT_AGENT=0xE3CFA9B66b02536D3653b08e296B9CCc6a4575F5
TIERED_LIMITS=0x9cb15e3B0E1feEC12D90F792f09E8D9204E13Bc4
RECURRING_PAYMENTS=0x4E1ee2689A996974D275f69d4621090A18581DaB
USDC=0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359
```

### 3. Run

```bash
# Backend
cd backend && pnpm dev

# Frontend
cd web && pnpm dev
```

Open **http://localhost:5173**.

---

## License

MIT

---

<div align="center">

**Built on Polygon.**

[Polygon](https://polygon.technology) · [Privado ID](https://privado.id) · [OpenZeppelin](https://openzeppelin.com)

</div>
