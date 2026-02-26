import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { parseUnits, formatUnits, erc20Abi } from 'viem';
import {
    Bot, Plus, Trash2, Shield, Clock,
    DollarSign, Users, CheckCircle, AlertCircle, Loader2, Zap, ArrowRight, Wallet
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import PayRoutePaymentAgentABI from '@/lib/abis/PayRoutePaymentAgent.json';
import { CONTRACT_ADDRESSES } from '@/lib/constants';

const AGENT_ADDRESS = CONTRACT_ADDRESSES.PAYMENT_AGENT as `0x${string}`;
const USDC_ADDRESS = CONTRACT_ADDRESSES.USDC as `0x${string}`;

interface AgentPolicy {
    id: string;
    agent: string;
    owner: string;
    maxAmountPerTx: string;
    maxDailyAmount: string;
    dailySpent: string;
    allowedRecipients: string[];
    isActive: boolean;
    createdAt: string;
    expiresAt: string | null;
}

export default function Agents() {
    const { address, isConnected } = useAccount();
    const { toast } = useToast();
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);

    // Create form state
    const [agentAddress, setAgentAddress] = useState('');
    const [maxPerTx, setMaxPerTx] = useState('100');
    const [maxDaily, setMaxDaily] = useState('1000');
    const [durationDays, setDurationDays] = useState('30');
    const [allowedRecipients, setAllowedRecipients] = useState('');

    // Contract write
    const { writeContractAsync } = useWriteContract();

    // Read policies from contract
    const { data: policyData, refetch: refetchPolicies } = useReadContract({
        address: AGENT_ADDRESS,
        abi: PayRoutePaymentAgentABI.abi,
        functionName: 'getPolicy',
        args: address && agentAddress ? [address, agentAddress] : undefined,
        query: { enabled: false },
    });

    // Local agents state (from backend or contract reads)
    const [agents, setAgents] = useState<AgentPolicy[]>([]);
    const [loading, setLoading] = useState(false);

    const stats = [
        { label: 'Active Agents', value: agents.filter(a => a.isActive).length, icon: Bot, color: 'text-primary' },
        { label: 'Total Delegated', value: `$${agents.reduce((sum, a) => sum + parseFloat(a.maxDailyAmount || '0'), 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400' },
        { label: 'Daily Spent', value: `$${agents.reduce((sum, a) => sum + parseFloat(a.dailySpent || '0'), 0).toFixed(2)}`, icon: Clock, color: 'text-blue-400' },
        { label: 'Whitelisted', value: agents.reduce((sum, a) => sum + a.allowedRecipients.length, 0), icon: Users, color: 'text-secondary' },
    ];

    const handleCreate = async () => {
        if (!agentAddress || !address) return;
        setCreating(true);
        try {
            // Approve USDC spending
            const dailyAmount = parseUnits(maxDaily, 6);
            await writeContractAsync({
                address: USDC_ADDRESS,
                abi: erc20Abi,
                functionName: 'approve',
                args: [AGENT_ADDRESS, dailyAmount],
            });

            // Create policy on-chain
            await writeContractAsync({
                address: AGENT_ADDRESS,
                abi: PayRoutePaymentAgentABI.abi,
                functionName: 'createPolicy',
                args: [
                    agentAddress as `0x${string}`,
                    parseUnits(maxPerTx, 6),
                    dailyAmount,
                    allowedRecipients
                        .split(',')
                        .map(r => r.trim())
                        .filter(r => r.startsWith('0x')) as `0x${string}`[],
                ],
            });

            toast({ title: 'Agent Created', description: `Delegated $${maxDaily}/day to agent.` });
            setShowCreate(false);
            setAgentAddress('');
            setMaxPerTx('100');
            setMaxDaily('1000');
            setAllowedRecipients('');
        } catch (err: any) {
            toast({ title: 'Error', description: err?.shortMessage || 'Failed to create agent', variant: 'destructive' });
        } finally {
            setCreating(false);
        }
    };

    if (!isConnected) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="p-12 text-center bg-card/50 border-border/30 max-w-md">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                        <Wallet className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Connect Wallet</h2>
                    <p className="text-muted-foreground">Connect your wallet to manage AI payment agents</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">AI Agents</h1>
                    <p className="text-muted-foreground mt-1">
                        Delegate payments to AI agents with bounded policies (x402 Protocol)
                    </p>
                </div>
                <Button onClick={() => setShowCreate(true)} className="gap-2 shrink-0">
                    <Plus className="w-4 h-4" />
                    Create Agent
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
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

            {/* Agent List / Empty State */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : agents.length === 0 ? (
                <Card className="p-12 text-center bg-card/30 border-border/30 border-dashed">
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-5">
                        <Bot className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Agents Yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Create your first AI payment agent to automate USDC transactions with configurable limits and recipient whitelists.
                    </p>
                    <Button onClick={() => setShowCreate(true)} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Create Your First Agent
                    </Button>
                </Card>
            ) : (
                <div className="space-y-4">
                    {agents.map((agent, i) => (
                        <motion.div
                            key={agent.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                        >
                            <Card className="p-6 bg-card/50 border-border/30 hover:border-primary/20 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                                            <Bot className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-mono text-sm">{agent.agent.slice(0, 6)}...{agent.agent.slice(-4)}</p>
                                                {agent.isActive ? (
                                                    <Badge variant="outline" className="text-emerald-400 border-emerald-400/30 text-[10px]">
                                                        <CheckCircle className="w-3 h-3 mr-1" /> Active
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-red-400 border-red-400/30 text-[10px]">
                                                        <AlertCircle className="w-3 h-3 mr-1" /> Revoked
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Created {new Date(agent.createdAt).toLocaleDateString()}
                                                {agent.expiresAt && ` · Expires ${new Date(agent.expiresAt).toLocaleDateString()}`}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                        disabled={!agent.isActive}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-3 gap-3 mt-5">
                                    <div className="rounded-lg bg-white/[0.03] p-4">
                                        <p className="text-xs text-muted-foreground">Max per Transaction</p>
                                        <p className="text-lg font-bold mt-1">${parseFloat(agent.maxAmountPerTx).toLocaleString()}</p>
                                    </div>
                                    <div className="rounded-lg bg-white/[0.03] p-4">
                                        <p className="text-xs text-muted-foreground">Daily Limit</p>
                                        <p className="text-lg font-bold mt-1">${parseFloat(agent.maxDailyAmount).toLocaleString()}</p>
                                    </div>
                                    <div className="rounded-lg bg-white/[0.03] p-4">
                                        <p className="text-xs text-muted-foreground">Spent Today</p>
                                        <p className="text-lg font-bold text-emerald-400 mt-1">${parseFloat(agent.dailySpent).toFixed(2)}</p>
                                        <div className="w-full bg-white/[0.06] rounded-full h-1.5 mt-2">
                                            <div
                                                className="bg-gradient-to-r from-primary to-secondary h-1.5 rounded-full transition-all"
                                                style={{ width: `${Math.min((parseFloat(agent.dailySpent) / parseFloat(agent.maxDailyAmount)) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {agent.allowedRecipients.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-border/30">
                                        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                                            <Shield className="w-3.5 h-3.5" />
                                            Whitelisted Recipients ({agent.allowedRecipients.length})
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {agent.allowedRecipients.map((r, i) => (
                                                <Badge key={i} variant="secondary" className="font-mono text-[10px] bg-white/[0.04]">
                                                    {r.slice(0, 6)}...{r.slice(-4)}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* How it works */}
            <Card className="p-6 bg-card/30 border-border/30">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    How AI Agents Work
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { step: '01', title: 'Create Policy', desc: 'Set per-tx limits, daily caps, and optional recipient whitelists for your agent.' },
                        { step: '02', title: 'Delegate USDC', desc: 'Approve USDC spending. The agent can only spend within your defined policy bounds.' },
                        { step: '03', title: 'Autonomous Payments', desc: 'Your AI agent executes payments on your behalf via the x402 protocol.' },
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

            {/* Create Dialog */}
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Bot className="w-5 h-5 text-primary" />
                            Create AI Payment Agent
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Agent Wallet Address</Label>
                            <Input
                                value={agentAddress}
                                onChange={e => setAgentAddress(e.target.value)}
                                placeholder="0x..."
                                className="font-mono"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Max per Tx (USDC)</Label>
                                <Input
                                    type="number"
                                    value={maxPerTx}
                                    onChange={e => setMaxPerTx(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Daily Limit (USDC)</Label>
                                <Input
                                    type="number"
                                    value={maxDaily}
                                    onChange={e => setMaxDaily(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Duration (days)</Label>
                            <Input
                                type="number"
                                value={durationDays}
                                onChange={e => setDurationDays(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Allowed Recipients (optional)</Label>
                            <Input
                                value={allowedRecipients}
                                onChange={e => setAllowedRecipients(e.target.value)}
                                placeholder="0x..., 0x..., 0x..."
                                className="font-mono text-xs"
                            />
                            <p className="text-xs text-muted-foreground">Comma-separated. Leave empty to allow any recipient.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={!agentAddress || creating} className="gap-2">
                            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            {creating ? 'Creating...' : 'Create Agent'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
