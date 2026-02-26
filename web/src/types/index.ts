export interface PaymentActivity {
  id: string;
  type: 'sent' | 'received' | 'vault_deposit' | 'vault_withdraw';
  counterparty: string;
  amount: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
}

export interface Vault {
  id: string;
  name: string;
  apy: number;
  tvl: string;
  utilization: number;
  description: string;
  badge?: string;
}

export interface RouteOption {
  name: string;
  networkFee: string;
  dexFee: string;
  slippage: string;
  aiScore: number;
  path: string;
}

export interface IdentityStatus {
  humanVerified: boolean;
  ageVerified: boolean;
  regionAllowed: boolean;
}

export interface FAQ {
  question: string;
  answer: string;
}
