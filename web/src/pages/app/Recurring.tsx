import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Repeat, Plus, Pause, Play, XCircle, Clock, DollarSign, Loader2, Wallet } from 'lucide-react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits, erc20Abi } from 'viem';
import PayRouteRecurringABI from '@/lib/abis/PayRouteRecurringPayments.json';
import { CONTRACT_ADDRESSES } from '@/lib/constants';

const RECURRING_ADDRESS = CONTRACT_ADDRESSES.RECURRING_PAYMENTS;
const USDC_ADDRESS = CONTRACT_ADDRESSES.USDC;

const INTERVALS: Record<string, number> = {
  'Daily': 86400,
  'Weekly': 604800,
  'Bi-weekly': 1209600,
  'Monthly': 2592000,
  'Quarterly': 7776000,
};

export default function Recurring() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [interval, setInterval] = useState('Monthly');
  const [maxExecutions, setMaxExecutions] = useState('0');
  const [memo, setMemo] = useState('');

  // Contract interactions
  const { writeContractAsync } = useWriteContract();

  // Read user subscription count
  const { data: subscriptionIds, refetch: refetchSubs } = useReadContract({
    address: RECURRING_ADDRESS,
    abi: PayRouteRecurringABI.abi,
    functionName: 'getUserSubscriptionIds',
    args: [address],
    query: { enabled: !!address },
  });

  const handleCreateSubscription = async () => {
    if (!recipient || !amount || !isConnected) return;
    setCreating(true);

    try {
      const amountWei = parseUnits(amount, 6); // USDC has 6 decimals

      // First approve the recurring contract to spend USDC
      toast({ title: 'Approving USDC...', description: 'Please confirm the approval transaction.' });
      await writeContractAsync({
        address: USDC_ADDRESS,
        abi: erc20Abi,
        functionName: 'approve',
        args: [RECURRING_ADDRESS, amountWei * BigInt(1000)], // Approve enough for many executions
      });

      // Create subscription
      toast({ title: 'Creating subscription...', description: 'Please confirm the subscription transaction.' });
      await writeContractAsync({
        address: RECURRING_ADDRESS,
        abi: PayRouteRecurringABI.abi,
        functionName: 'createSubscription',
        args: [
          recipient as `0x${string}`,
          USDC_ADDRESS,
          amountWei,
          BigInt(INTERVALS[interval]),
          BigInt(maxExecutions || '0'),
          BigInt(10), // 0.1% executor tip
          BigInt(0), // start now
          memo,
        ],
      });

      toast({ title: 'Subscription created!', description: `${amount} USDC ${interval.toLowerCase()} to ${recipient.slice(0, 8)}...` });
      setShowCreate(false);
      setRecipient('');
      setAmount('');
      setMemo('');
      refetchSubs();
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message?.slice(0, 100) || 'Transaction failed', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const subIds = (subscriptionIds as bigint[]) || [];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recurring Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Set up automated on-chain subscriptions with USDC.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} disabled={!isConnected} className="gap-2">
          <Plus className="w-4 h-4" /> New Subscription
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 bg-card/40 border-border/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Repeat className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{subIds.length}</p>
              <p className="text-xs text-muted-foreground">Active Subscriptions</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-card/40 border-border/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">USDC</p>
              <p className="text-xs text-muted-foreground">Payment Token</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-card/40 border-border/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">On-chain</p>
              <p className="text-xs text-muted-foreground">Execution Model</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Subscriptions list */}
      {!isConnected ? (
        <Card className="p-12 bg-card/40 border-border/30 text-center">
          <Wallet className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Connect your wallet to manage subscriptions.</p>
        </Card>
      ) : subIds.length === 0 ? (
        <Card className="p-12 bg-card/40 border-border/30 text-center">
          <Repeat className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No subscriptions yet.</p>
          <Button onClick={() => setShowCreate(true)} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" /> Create your first subscription
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {subIds.map((id) => (
            <SubscriptionRow key={id.toString()} subscriptionId={id} recurringAddress={RECURRING_ADDRESS} />
          ))}
        </div>
      )}

      {/* How it works */}
      <Card className="p-6 bg-card/40 border-border/30">
        <h3 className="font-semibold mb-4">How Recurring Payments Work</h3>
        <div className="grid md:grid-cols-3 gap-6 text-sm text-muted-foreground">
          <div className="space-y-2">
            <p className="text-foreground font-medium">1. Create</p>
            <p>Set recipient, amount, and interval. Approve USDC spending once.</p>
          </div>
          <div className="space-y-2">
            <p className="text-foreground font-medium">2. Execute</p>
            <p>Anyone can trigger your payment when it's due. Executors earn a small tip.</p>
          </div>
          <div className="space-y-2">
            <p className="text-foreground font-medium">3. Manage</p>
            <p>Pause, resume, update, or cancel anytime. You stay in full control.</p>
          </div>
        </div>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Subscription</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Recipient Address</Label>
              <Input placeholder="0x..." value={recipient} onChange={(e) => setRecipient(e.target.value)} className="mt-1.5 font-mono text-sm" />
            </div>
            <div>
              <Label>Amount (USDC)</Label>
              <Input type="number" placeholder="100" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>Interval</Label>
              <Select value={interval} onValueChange={setInterval}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(INTERVALS).map((key) => (
                    <SelectItem key={key} value={key}>{key}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Max Payments (0 = unlimited)</Label>
              <Input type="number" placeholder="0" value={maxExecutions} onChange={(e) => setMaxExecutions(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>Memo (optional)</Label>
              <Input placeholder="e.g., Monthly rent" value={memo} onChange={(e) => setMemo(e.target.value)} className="mt-1.5" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreateSubscription} disabled={creating || !recipient || !amount} className="gap-2">
              {creating && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

// Sub-component for individual subscription rows
function SubscriptionRow({ subscriptionId, recurringAddress }: { subscriptionId: bigint; recurringAddress: `0x${string}` }) {
  const { data: sub } = useReadContract({
    address: recurringAddress,
    abi: PayRouteRecurringABI.abi,
    functionName: 'getSubscription',
    args: [subscriptionId],
  });

  const subscription = sub as any;
  if (!subscription) return null;

  const amount = subscription.amount ? formatUnits(subscription.amount, 6) : '0';
  const isActive = subscription.isActive;
  const recipient = subscription.recipient as string;
  const intervalSecs = Number(subscription.interval || 0);

  const intervalLabel = intervalSecs <= 86400 ? 'Daily'
    : intervalSecs <= 604800 ? 'Weekly'
    : intervalSecs <= 1209600 ? 'Bi-weekly'
    : intervalSecs <= 2592000 ? 'Monthly'
    : 'Quarterly';

  return (
    <Card className="p-4 bg-card/40 border-border/30 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isActive ? 'bg-secondary/10' : 'bg-muted'}`}>
        <Repeat className={`w-5 h-5 ${isActive ? 'text-secondary' : 'text-muted-foreground'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm truncate font-mono">{recipient?.slice(0, 10)}...{recipient?.slice(-6)}</p>
          <Badge variant={isActive ? 'default' : 'secondary'} className="text-[10px]">
            {isActive ? 'Active' : 'Paused'}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{amount} USDC &middot; {intervalLabel} &middot; {subscription.memo || 'No memo'}</p>
      </div>
      <p className="text-sm font-medium">{amount} USDC</p>
    </Card>
  );
}
