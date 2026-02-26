import { FAQ } from '@/types';

export const FAQS: FAQ[] = [
  {
    question: 'Is PayRoute custodial?',
    answer: 'No. PayRoute is completely non-custodial. You maintain full control of your funds at all times. Your private keys never leave your wallet, and all transactions require your explicit approval.',
  },
  {
    question: 'Which networks are supported?',
    answer: 'PayRoute currently operates on Polygon, with future support for AggLayer and other Polygon ecosystem chains planned. All transactions use USDC as the primary stablecoin.',
  },
  {
    question: 'How does identity verification work?',
    answer: 'We use self-sovereign identity through zero-knowledge proofs (Privado ID). You prove facts like "I\'m over 18" or "I\'m human" without sharing raw documents. Your credentials stay in your own wallet.',
  },
  {
    question: 'What fees do I pay?',
    answer: 'You pay only the network gas fees and DEX/aggregator fees for routing. PayRoute\'s AI optimization helps minimize these costs. There are no hidden platform fees for basic payments. Vault deposits may have small performance fees.',
  },
  {
    question: 'How does AI routing save me money?',
    answer: 'Our AI engine analyzes live liquidity depth, gas prices, and DEX spreads across Polygon DeFi to find the most cost-efficient path for your transaction. This often saves 30-70% compared to manual routing.',
  },
  {
    question: 'What are Corridor Vaults?',
    answer: 'Corridor Vaults are liquidity pools that back specific payment routes (e.g., US to LatAm). By depositing stablecoins, you earn real fees from actual payment flows, not artificial emissions.',
  },
  {
    question: 'How do Recurring Payments work?',
    answer: 'Set up automated subscriptions for any amount at any interval. Payments are executed on-chain by keepers when due. You can pause, resume, or cancel anytime. Executors earn small tips for triggering payments.',
  },
];

// Contract Addresses (Polygon Mainnet) — deployed fresh for PayRoute
export const CONTRACT_ADDRESSES = {
  ROUTER: '0x85bB3a8b849C0F8cC9664174D60ccfeA5c5C161C' as `0x${string}`,
  VAULT: '0x86442aF11147A4b32c5577cC701899e7696ca290' as `0x${string}`,
  IDENTITY_GATE: '0x5d8C5Ba1cb7e8aC241C3878C12f30D123D40f919' as `0x${string}`,
  PAYMENT_AGENT: '0xE3CFA9B66b02536D3653b08e296B9CCc6a4575F5' as `0x${string}`,
  TIERED_LIMITS: '0x9cb15e3B0E1feEC12D90F792f09E8D9204E13Bc4' as `0x${string}`,
  RECURRING_PAYMENTS: '0x4E1ee2689A996974D275f69d4621090A18581DaB' as `0x${string}`,
  USDC: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359' as `0x${string}`,
};
