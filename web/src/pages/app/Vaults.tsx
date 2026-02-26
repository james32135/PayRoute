import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Vault as VaultIcon, ArrowUpRight, ArrowDownRight, Loader2, Wallet } from 'lucide-react';
import { useVaults } from '@/hooks/useVaults';
import { useAccount, useReadContract, useWriteContract, useSwitchChain } from 'wagmi';
import { parseUnits, formatUnits, erc20Abi, maxUint256, getAddress } from 'viem';
import PayRouteRouterABI from '@/lib/abis/PayRouteRouter.json';
import { apiClient } from '@/lib/apiClient';
import { CONTRACT_ADDRESSES } from '@/lib/constants';

const ROUTER_ADDRESS = CONTRACT_ADDRESSES.ROUTER;
const USDC_ADDRESS = CONTRACT_ADDRESSES.USDC;
const POLYGON_CHAIN_ID = 137;

export default function Vaults() {
  const { address, isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { data: vaults, isLoading, refetch } = useVaults(address);
  const { toast } = useToast();

  const [selectedVault, setSelectedVault] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [actionType, setActionType] = useState<'deposit' | 'withdraw'>('deposit');

  // Checksum addresses
  const checksummedRouterAddress = ROUTER_ADDRESS ? getAddress(ROUTER_ADDRESS) : undefined;
  const checksummedUsdcAddress = USDC_ADDRESS ? getAddress(USDC_ADDRESS) : undefined;

  // Contract Writes
  const { writeContractAsync: writeApprove } = useWriteContract();
  const { writeContractAsync: writeSendPayment } = useWriteContract();

  // Allowance Check
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: checksummedUsdcAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: (address && checksummedRouterAddress) ? [address, checksummedRouterAddress] : undefined,
    query: { enabled: !!address && !!checksummedUsdcAddress && !!checksummedRouterAddress }
  });

  const handleAction = async () => {
    if (!address || !amount || !selectedVault) return;

    if (chainId !== POLYGON_CHAIN_ID) {
      try {
        await switchChainAsync({ chainId: POLYGON_CHAIN_ID });
      } catch (e) {
        toast({ title: "Wrong Network", description: "Please switch to Polygon.", variant: "destructive" });
        return;
      }
    }

    try {
      if (actionType === 'deposit') {
        setIsDepositing(true);
        const parsedAmount = parseUnits(amount, 6);

        // 1. Approve
        if (!allowance || allowance < parsedAmount) {
          setIsApproving(true);
          toast({ title: "Approving USDC...", description: "Please confirm approval." });
          await writeApprove({
            address: checksummedUsdcAddress!,
            abi: erc20Abi,
            functionName: 'approve',
            args: [checksummedRouterAddress!, maxUint256]
          });
          setIsApproving(false);
        }

        // 2. Deposit (Send to Vault Address via Router)
        toast({ title: "Depositing...", description: "Confirm transaction." });
        const txHash = await writeSendPayment({
          address: checksummedRouterAddress!,
          abi: PayRouteRouterABI.abi,
          functionName: 'sendPayment',
          args: [getAddress(selectedVault.address), parsedAmount, `vault-deposit-${selectedVault.id}`]
        });

        // 3. Record
        toast({ title: "Syncing...", description: "Recording deposit." });
        await fetch(`${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/payments/record`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hash: txHash,
            from: address,
            to: selectedVault.address, // Use vault address as ID
            amount: amount,
            asset: 'USDC',
            type: 'deposit'
          })
        });

        toast({ title: "Deposit Successful!", description: `You deposited ${amount} USDC.` });

      } else {
        // Withdraw
        setIsWithdrawing(true);
        await apiClient.withdrawFromVault({
          userId: address,
          vaultAddress: selectedVault.address,
          amount: amount
        });
        toast({ title: "Withdrawal Successful!", description: `Withdrew ${amount} USDC.` });
      }

      setAmount('');
      setSelectedVault(null);
      refetch(); // Refresh vault data

    } catch (error: any) {
      console.error(error);
      toast({ title: "Error", description: error.message || "Action failed", variant: "destructive" });
    } finally {
      setIsDepositing(false);
      setIsWithdrawing(false);
      setIsApproving(false);
    }
  };

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-display font-bold">Corridor Vaults</h1>
        <Card className="p-6 glass-card bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <VaultIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold mb-2">Productive liquidity for real payments</h2>
              <p className="text-muted-foreground">
                Deposit stablecoins into regional payment corridors. Your capital earns real fees from stablecoin flows.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Vaults Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {vaults?.map((vault: any, index: number) => (
          <motion.div
            key={vault.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 glass-card hover:glow-primary transition-all duration-300 group">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-xl font-bold">{vault.name}</h3>
                    <p className="text-sm text-muted-foreground">Polygon Network</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-2xl font-bold text-green-500">{vault.apy}%</h3>
                    <p className="text-xs text-muted-foreground">APY</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">TVL</span>
                    <span className="font-medium">${vault.tvl?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Your Balance</span>
                    <span className="font-bold text-primary">{vault.userBalance ? `$${vault.userBalance.toFixed(2)}` : '$0.00'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Dialog open={selectedVault?.id === vault.id} onOpenChange={(open) => !open && setSelectedVault(null)}>
                    <DialogTrigger asChild>
                      <Button className="group" size="sm" onClick={() => { setSelectedVault(vault); setActionType('deposit'); }}>
                        <ArrowUpRight className="w-4 h-4 mr-1" /> Deposit
                      </Button>
                    </DialogTrigger>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="group" onClick={() => { setSelectedVault(vault); setActionType('withdraw'); }}>
                        <ArrowDownRight className="w-4 h-4 mr-1" /> Withdraw
                      </Button>
                    </DialogTrigger>

                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{actionType === 'deposit' ? 'Deposit to' : 'Withdraw from'} {vault.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Amount (USDC)</Label>
                          <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                          />
                          <p className="text-xs text-muted-foreground text-right">
                            {actionType === 'withdraw'
                              ? `Available: $${vault.userBalance || 0}`
                              : 'Wallet Balance: Check Wallet'}
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleAction} disabled={isDepositing || isWithdrawing || isApproving || !amount}>
                          {isApproving ? 'Approving...' : (isDepositing || isWithdrawing) ? 'Processing...' : 'Confirm'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
