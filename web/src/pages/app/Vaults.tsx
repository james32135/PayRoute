import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Vault as VaultIcon, ArrowUpRight, ArrowDownRight, Loader2, Wallet, TrendingUp, Shield, Zap, ExternalLink } from 'lucide-react';
import { useVaults } from '@/hooks/useVaults';
import { useAccount, useReadContract, useWriteContract, useSwitchChain } from 'wagmi';
import { parseUnits, formatUnits, erc20Abi, maxUint256, getAddress } from 'viem';
import PayRouteVaultABI from '@/lib/abis/PayRouteVault.json';
import { CONTRACT_ADDRESSES } from '@/lib/constants';

const VAULT_ADDRESS = CONTRACT_ADDRESSES.VAULT as `0x${string}`;
const USDC_ADDRESS = CONTRACT_ADDRESSES.USDC as `0x${string}`;
const POLYGON_CHAIN_ID = 137;

export default function Vaults() {
  const { address, isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { data: vaults, isLoading, refetch } = useVaults(address);
  const { toast } = useToast();

  const [showDialog, setShowDialog] = useState(false);
  const [amount, setAmount] = useState('');
  const [actionType, setActionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [processing, setProcessing] = useState(false);

  // Read on-chain vault data
  const { data: totalAssets } = useReadContract({
    address: VAULT_ADDRESS,
    abi: PayRouteVaultABI.abi,
    functionName: 'totalAssets',
    query: { enabled: true },
  });

  const { data: userShares } = useReadContract({
    address: VAULT_ADDRESS,
    abi: PayRouteVaultABI.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address ? [address, VAULT_ADDRESS] : undefined,
    query: { enabled: !!address },
  });

  const { writeContractAsync } = useWriteContract();

  const tvl = totalAssets ? formatUnits(totalAssets as bigint, 6) : '0';
  const shares = userShares ? formatUnits(userShares as bigint, 18) : '0';

  const handleAction = async () => {
    if (!address || !amount) return;

    if (chainId !== POLYGON_CHAIN_ID) {
      try {
        await switchChainAsync({ chainId: POLYGON_CHAIN_ID });
      } catch {
        toast({ title: "Wrong Network", description: "Please switch to Polygon.", variant: "destructive" });
        return;
      }
    }

    setProcessing(true);
    try {
      const parsedAmount = parseUnits(amount, 6);

      if (actionType === 'deposit') {
        // Check allowance & approve if needed
        if (!allowance || (allowance as bigint) < parsedAmount) {
          toast({ title: "Approving USDC...", description: "Confirm in your wallet." });
          await writeContractAsync({
            address: USDC_ADDRESS,
            abi: erc20Abi,
            functionName: 'approve',
            args: [VAULT_ADDRESS, maxUint256],
          });
          await refetchAllowance();
        }

        toast({ title: "Depositing...", description: "Confirm transaction." });
        await writeContractAsync({
          address: VAULT_ADDRESS,
          abi: PayRouteVaultABI.abi,
          functionName: 'deposit',
          args: [parsedAmount, address],
        });

        toast({ title: "Deposit Successful!", description: `Deposited ${amount} USDC into vault.` });
      } else {
        toast({ title: "Withdrawing...", description: "Confirm transaction." });
        await writeContractAsync({
          address: VAULT_ADDRESS,
          abi: PayRouteVaultABI.abi,
          functionName: 'withdraw',
          args: [parsedAmount, address, address],
        });

        toast({ title: "Withdrawal Successful!", description: `Withdrew ${amount} USDC from vault.` });
      }

      setAmount('');
      setShowDialog(false);
      refetch();
    } catch (error: any) {
      toast({ title: "Error", description: error?.shortMessage || "Transaction failed", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Yield Vaults</h1>
        <p className="text-muted-foreground mt-1">
          Deposit USDC into ERC-4626 vaults and earn real yield from payment flows
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Value Locked', value: `$${Number(tvl).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, icon: VaultIcon, color: 'text-primary' },
          { label: 'Your Shares', value: Number(shares).toFixed(4), icon: Wallet, color: 'text-secondary' },
          { label: 'Vault APY', value: '4.8%', icon: TrendingUp, color: 'text-emerald-400' },
          { label: 'Standard', value: 'ERC-4626', icon: Shield, color: 'text-blue-400' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-5 bg-card/50 border-border/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-white/[0.04] flex items-center justify-center">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Vault Card */}
      <Card className="p-6 bg-card/50 border-border/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
              <VaultIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">PayRoute USDC Vault</h2>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium">prUSDC</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                ERC-4626 vault that earns fees from PayRoute payment flows on Polygon
              </p>
              <a
                href={`https://polygonscan.com/address/${VAULT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-2"
              >
                View on PolygonScan <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="flex gap-3 shrink-0">
            <Button
              onClick={() => { setActionType('deposit'); setShowDialog(true); }}
              className="gap-2"
              disabled={!isConnected}
            >
              <ArrowUpRight className="w-4 h-4" /> Deposit
            </Button>
            <Button
              variant="outline"
              onClick={() => { setActionType('withdraw'); setShowDialog(true); }}
              className="gap-2"
              disabled={!isConnected}
            >
              <ArrowDownRight className="w-4 h-4" /> Withdraw
            </Button>
          </div>
        </div>

        {/* Vault Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <div className="rounded-lg bg-white/[0.03] p-4">
            <p className="text-xs text-muted-foreground">TVL</p>
            <p className="text-lg font-bold mt-1">${Number(tvl).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          </div>
          <div className="rounded-lg bg-white/[0.03] p-4">
            <p className="text-xs text-muted-foreground">APY</p>
            <p className="text-lg font-bold text-emerald-400 mt-1">4.8%</p>
          </div>
          <div className="rounded-lg bg-white/[0.03] p-4">
            <p className="text-xs text-muted-foreground">Your Shares</p>
            <p className="text-lg font-bold mt-1">{Number(shares).toFixed(4)} prUSDC</p>
          </div>
          <div className="rounded-lg bg-white/[0.03] p-4">
            <p className="text-xs text-muted-foreground">Network</p>
            <p className="text-lg font-bold mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary" /> Polygon
            </p>
          </div>
        </div>
      </Card>

      {/* How it works */}
      <Card className="p-6 bg-card/30 border-border/30">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          How Yield Vaults Work
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Deposit USDC', desc: 'Deposit USDC and receive prUSDC vault shares representing your position.' },
            { step: '02', title: 'Earn Fees', desc: 'The vault collects real fees from PayRoute payment flows. Your shares appreciate over time.' },
            { step: '03', title: 'Withdraw Anytime', desc: 'Redeem your prUSDC shares for USDC plus accumulated yield. No lockup period.' },
          ].map((item, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-3xl font-bold text-primary/20 shrink-0">{item.step}</span>
              <div>
                <h4 className="font-medium text-sm">{item.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Deposit/Withdraw Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === 'deposit' ? <ArrowUpRight className="w-5 h-5 text-primary" /> : <ArrowDownRight className="w-5 h-5 text-secondary" />}
              {actionType === 'deposit' ? 'Deposit to Vault' : 'Withdraw from Vault'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Amount (USDC)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
              {actionType === 'withdraw' && (
                <p className="text-xs text-muted-foreground">
                  Your shares: {Number(shares).toFixed(4)} prUSDC
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleAction} disabled={processing || !amount} className="gap-2">
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {processing ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
