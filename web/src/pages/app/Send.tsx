import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  ArrowRight,
  Info,
  TrendingDown,
  Clock,
  CheckCircle2,
  Loader2,
  Wallet,
  AlertTriangle
} from 'lucide-react';
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSendTransaction,
  useBalance,
  useSwitchChain,
  useEstimateFeesPerGas
} from 'wagmi';
import { parseUnits, formatUnits, erc20Abi, maxUint256, getAddress } from 'viem';
import PayRouteRouterABI from '@/lib/abis/PayRouteRouter.json';
import { CONTRACT_ADDRESSES } from '@/lib/constants';
import { frontendConfig } from '@/lib/env';

const ROUTER_ADDRESS = CONTRACT_ADDRESSES.ROUTER;
const USDC_ADDRESS = CONTRACT_ADDRESSES.USDC;
const BACKEND_URL = frontendConfig.backendUrl;
const POLYGON_CHAIN_ID = 137;

type Asset = 'USDC' | 'POL';
type RoutePreference = 'cheapest' | 'fastest';

export default function Send() {
  const { address, isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { toast } = useToast();
  const { data: feeData } = useEstimateFeesPerGas();

  const [asset, setAsset] = useState<Asset>('USDC');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [routePreference, setRoutePreference] = useState<RoutePreference>('cheapest');
  const [isApproving, setIsApproving] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Quote State
  const [quote, setQuote] = useState<any>(null);
  const [isQuoting, setIsQuoting] = useState(false);

  // Checksum addresses to avoid viem errors
  const checksummedRouterAddress = ROUTER_ADDRESS ? getAddress(ROUTER_ADDRESS) : undefined;
  const checksummedUsdcAddress = USDC_ADDRESS ? getAddress(USDC_ADDRESS) : undefined;

  // --- 1. Balances ---
  const { data: polBalance } = useBalance({ address });
  const { data: usdcBalance } = useReadContract({
    address: checksummedUsdcAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!checksummedUsdcAddress }
  });

  // --- 2. Allowance (USDC only) ---
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: checksummedUsdcAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: (address && checksummedRouterAddress) ? [address, checksummedRouterAddress] : undefined,
    query: { enabled: !!address && asset === 'USDC' && !!checksummedUsdcAddress && !!checksummedRouterAddress }
  });

  // --- 3. Contract Writes ---
  const { writeContractAsync: writeApprove } = useWriteContract();
  const { writeContractAsync: writeSendPayment } = useWriteContract();
  const { sendTransactionAsync } = useSendTransaction();

  // --- 4. Effects ---
  useEffect(() => {
    const fetchQuote = async () => {
      if (!amount || parseFloat(amount) <= 0) {
        setQuote(null);
        return;
      }

      setIsQuoting(true);
      try {
        const res = await fetch(`${BACKEND_URL}/api/payments/quote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount,
            asset,
            recipientType: 'address',
            routePreference
          })
        });
        const data = await res.json();
        setQuote(data);
      } catch (error) {
        console.error("Failed to fetch quote:", error);
      } finally {
        setIsQuoting(false);
      }
    };

    const debounce = setTimeout(fetchQuote, 500);
    return () => clearTimeout(debounce);
  }, [amount, asset, routePreference]);

  // --- 5. Handlers ---
  const handleSwitchNetwork = async () => {
    try {
      await switchChainAsync({ chainId: POLYGON_CHAIN_ID });
    } catch (error) {
      console.error("Failed to switch network:", error);
      toast({ title: "Network Switch Failed", description: "Please switch to Polygon manually.", variant: "destructive" });
    }
  };

  const handleSend = async () => {
    if (!address || !amount || !recipient) return;

    // Enforce Network
    if (chainId !== POLYGON_CHAIN_ID) {
      toast({
        title: "Wrong Network",
        description: "Switching to Polygon Mainnet...",
      });
      try {
        await handleSwitchNetwork();
        // Re-check chainId after switch attempt (though it might take a moment to update state)
        // Ideally we return here and let the user click again, or we wait.
        // For safety, let's return and ask user to click again if it didn't happen immediately.
        return;
      } catch (e) {
        return;
      }
    }

    setIsSending(true);
    try {
      let txHash;
      const parsedAmount = parseUnits(amount, asset === 'USDC' ? 6 : 18);

      // Calculate Gas Overrides for "Fastest"
      let gasOverrides = {};
      if (routePreference === 'fastest' && feeData?.maxFeePerGas && feeData?.maxPriorityFeePerGas) {
        // Boost gas by 30% for fastest route
        const boostedMaxFee = (feeData.maxFeePerGas * 130n) / 100n;
        const boostedPriorityFee = (feeData.maxPriorityFeePerGas * 130n) / 100n;
        gasOverrides = {
          maxFeePerGas: boostedMaxFee,
          maxPriorityFeePerGas: boostedPriorityFee
        };
        console.log("Applying gas boost:", gasOverrides);
      }

      if (asset === 'POL') {
        // Native Transfer
        txHash = await sendTransactionAsync({
          to: getAddress(recipient),
          value: parsedAmount,
          chainId: POLYGON_CHAIN_ID, // Explicitly request chain ID if supported by connector
          ...gasOverrides
        });
      } else {
        // USDC Transfer via Router
        if (!checksummedUsdcAddress || !checksummedRouterAddress) {
          throw new Error("Contract addresses not configured correctly");
        }

        // Check Allowance
        if (!allowance || allowance < parsedAmount) {
          setIsApproving(true);
          toast({ title: "Approving USDC...", description: "Please confirm the approval in your wallet." });
          const approveHash = await writeApprove({
            address: checksummedUsdcAddress,
            abi: erc20Abi,
            functionName: 'approve',
            args: [checksummedRouterAddress, maxUint256]
          });
          // Wait for approval (simple wait, ideally useWaitForTransactionReceipt)
          setIsApproving(false);
        }

        toast({ title: "Sending Payment...", description: "Please confirm the transaction." });
        txHash = await writeSendPayment({
          address: checksummedRouterAddress,
          abi: PayRouteRouterABI.abi,
          functionName: 'sendPayment',
          args: [getAddress(recipient), parsedAmount, `ai-route-${routePreference}`],
          ...gasOverrides
        });
      }

      // Record in Backend
      if (txHash) {
        toast({ title: "Transaction Sent!", description: "Waiting for confirmation..." });
        await fetch(`${BACKEND_URL}/api/payments/record`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hash: txHash,
            from: address,
            to: recipient,
            amount: amount,
            asset: asset,
            type: 'send'
          })
        });
        toast({ title: "Success!", description: "Payment recorded." });
        setAmount('');
        setRecipient('');
        setQuote(null);
      }

    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message || "Transaction failed",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
      setIsApproving(false);
      refetchAllowance();
    }
  };

  const getBalanceDisplay = () => {
    if (asset === 'POL') {
      return polBalance ? `${parseFloat(formatUnits(polBalance.value, 18)).toFixed(4)} POL` : '0.00 POL';
    }
    return usdcBalance ? `${parseFloat(formatUnits(usdcBalance as bigint, 6)).toFixed(2)} USDC` : '0.00 USDC';
  };

  const isWrongNetwork = isConnected && chainId !== POLYGON_CHAIN_ID;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Send Payment</h1>
        <p className="text-muted-foreground">Send crypto with AI-optimized routing on Polygon</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 glass-card space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">Payment Details</h2>
              <Badge variant="secondary">Step 1 of 3</Badge>
            </div>

            {/* Network Warning */}
            {isWrongNetwork && (
              <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Wrong Network</span>
                </div>
                <Button size="sm" variant="destructive" onClick={handleSwitchNetwork}>
                  Switch to Polygon
                </Button>
              </div>
            )}

            {/* Asset Selector */}
            <div className="space-y-2">
              <Label>Asset</Label>
              <div className="flex gap-4">
                <Button
                  variant={asset === 'USDC' ? 'default' : 'outline'}
                  onClick={() => setAsset('USDC')}
                  className="flex-1"
                >
                  USDC
                </Button>
                <Button
                  variant={asset === 'POL' ? 'default' : 'outline'}
                  onClick={() => setAsset('POL')}
                  className="flex-1"
                >
                  POL
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-right">
                Balance: {getBalanceDisplay()}
              </p>
            </div>

            {/* Recipient */}
            <div className="space-y-2">
              <Label>Recipient Address</Label>
              <Input
                placeholder="0x..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-2xl h-14 font-bold"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border/50 space-y-2">
            <p className="text-xs text-muted-foreground">Compare routes:</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={routePreference === 'cheapest' ? 'default' : 'outline'}
                className="flex-1 text-xs relative overflow-hidden"
                onClick={() => setRoutePreference('cheapest')}
              >
                <div className="flex items-center justify-center z-10 relative">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  Cheapest
                </div>
                {routePreference === 'cheapest' && quote && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500/50" />
                )}
              </Button>
              <Button
                size="sm"
                variant={routePreference === 'fastest' ? 'default' : 'outline'}
                className="flex-1 text-xs relative overflow-hidden"
                onClick={() => setRoutePreference('fastest')}
              >
                <div className="flex items-center justify-center z-10 relative">
                  <Clock className="w-3 h-3 mr-1" />
                  Fastest
                </div>
                {routePreference === 'fastest' && quote && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500/50" />
                )}
              </Button>
            </div>

            {/* Dynamic Quote Info */}
            {isQuoting ? (
              <div className="flex items-center justify-center py-2 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin mr-2" />
                Finding best route...
              </div>
            ) : quote ? (
              <div className="grid grid-cols-3 gap-2 mt-2 text-xs bg-muted/30 p-2 rounded-lg">
                <div className="text-center">
                  <p className="text-muted-foreground">Est. Fee</p>
                  <p className="font-medium text-primary">${quote.estimatedNetworkFee}</p>
                </div>
                <div className="text-center border-l border-border/50">
                  <p className="text-muted-foreground">Time</p>
                  <p className="font-medium text-primary">{quote.estimatedTime || '~15s'}</p>
                </div>
                <div className="text-center border-l border-border/50">
                  <p className="text-muted-foreground">Slippage</p>
                  <p className="font-medium text-primary">{quote.estimatedSlippage}</p>
                </div>
              </div>
            ) : null}
          </div>
        </Card>

        {/* Summary */}
        <Card className="p-6 glass-card space-y-4">
          <h3 className="font-display font-bold">Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">You send</span>
              <span className="font-medium">{amount || '0'} {asset}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recipient receives</span>
              <span className="font-bold text-lg text-secondary">
                {amount ? (asset === 'USDC' ? (parseFloat(amount) * 0.999).toFixed(2) : amount) : '0'} {asset}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-border/50">
              <span className="text-muted-foreground">Route Strategy</span>
              <Badge variant="outline" className="capitalize">{routePreference}</Badge>
            </div>
            {quote && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">AI Score</span>
                <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                  {quote.aiScore}/100
                </Badge>
              </div>
            )}
          </div>

          <Button
            className="w-full group"
            size="lg"
            disabled={!amount || !recipient || !isConnected || isSending || isApproving || isWrongNetwork}
            onClick={handleSend}
          >
            {isApproving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Approving...
              </>
            ) : isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                Send Payment
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>

          {!isConnected && (
            <p className="text-xs text-center text-destructive">
              Please connect your wallet first.
            </p>
          )}
        </Card>
      </div>
    </motion.div>
  );
}
