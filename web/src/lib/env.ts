export const frontendConfig = {
    backendUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    alchemyApiKey: import.meta.env.VITE_PUBLIC_ALCHEMY_API_KEY || '',
    walletConnectProjectId: import.meta.env.VITE_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
    routerAddress: (import.meta.env.VITE_PUBLIC_ROUTER_ADDRESS as `0x${string}`) || '0x85bB3a8b849C0F8cC9664174D60ccfeA5c5C161C',
    vaultAddress: (import.meta.env.VITE_PUBLIC_VAULT_ADDRESS as `0x${string}`) || '0x86442aF11147A4b32c5577cC701899e7696ca290',
    identityGateAddress: (import.meta.env.VITE_PUBLIC_IDENTITY_GATE_ADDRESS as `0x${string}`) || '0x5d8C5Ba1cb7e8aC241C3878C12f30D123D40f919',
    usdcAddress: (import.meta.env.VITE_PUBLIC_USDC_CONTRACT_ADDRESS as `0x${string}`) || '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    paymentAgentAddress: (import.meta.env.VITE_PUBLIC_PAYMENT_AGENT_ADDRESS as `0x${string}`) || '0xE3CFA9B66b02536D3653b08e296B9CCc6a4575F5',
    tieredLimitsAddress: (import.meta.env.VITE_PUBLIC_TIERED_LIMITS_ADDRESS as `0x${string}`) || '0x9cb15e3B0E1feEC12D90F792f09E8D9204E13Bc4',
    recurringPaymentsAddress: (import.meta.env.VITE_PUBLIC_RECURRING_PAYMENTS_ADDRESS as `0x${string}`) || '0x4E1ee2689A996974D275f69d4621090A18581DaB',
};
