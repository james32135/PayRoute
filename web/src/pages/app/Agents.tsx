import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import {
    Bot, Plus, Trash2, Settings, Shield, Clock,
    DollarSign, Users, CheckCircle, AlertCircle, Loader2
} from 'lucide-react';
import { api } from '../../lib/api';

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
    const [agents, setAgents] = useState<AgentPolicy[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);

    // Create form state
    const [agentAddress, setAgentAddress] = useState('');
    const [maxPerTx, setMaxPerTx] = useState('100');
    const [maxDaily, setMaxDaily] = useState('1000');
    const [durationDays, setDurationDays] = useState('30');
    const [allowedRecipients, setAllowedRecipients] = useState('');

    useEffect(() => {
        if (address) {
            fetchAgents();
        }
    }, [address]);

    const fetchAgents = async () => {
        try {
            const response = await api.get(`/agents/${address}`);
            setAgents(response.data.agents || []);
        } catch (error) {
            console.error('Failed to fetch agents:', error);
        } finally {
            setLoading(false);
        }
    };

    const createAgent = async () => {
        if (!agentAddress || !address) return;

        setCreating(true);
        try {
            const recipients = allowedRecipients
                .split(',')
                .map(r => r.trim())
                .filter(r => r.startsWith('0x'));

            await api.post('/agents/create', {
                ownerAddress: address,
                agentAddress,
                maxAmountPerTx: maxPerTx,
                maxDailyAmount: maxDaily,
                allowedRecipients: recipients.length > 0 ? recipients : undefined,
                durationDays: parseInt(durationDays)
            }, {
                headers: { 'x-owner-address': address }
            });

            setShowCreateModal(false);
            setAgentAddress('');
            fetchAgents();
        } catch (error) {
            console.error('Failed to create agent:', error);
        } finally {
            setCreating(false);
        }
    };

    const revokeAgent = async (agentAddr: string) => {
        try {
            await api.post('/agents/revoke', {
                ownerAddress: address,
                agentAddress: agentAddr
            });
            fetchAgents();
        } catch (error) {
            console.error('Failed to revoke agent:', error);
        }
    };

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Bot className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Connect Wallet</h2>
                    <p className="text-gray-400">Connect your wallet to manage AI payment agents</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-center mb-8"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Bot className="w-8 h-8 text-purple-500" />
                            AI Payment Agents
                        </h1>
                        <p className="text-gray-400 mt-2">
                            Delegate payments to AI agents with bounded policies (x402 Protocol)
                        </p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        Create Agent
                    </motion.button>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Active Agents', value: agents.filter(a => a.isActive).length, icon: Bot, color: 'purple' },
                        { label: 'Total Delegated', value: `$${agents.reduce((sum, a) => sum + parseFloat(a.maxDailyAmount), 0).toLocaleString()}`, icon: DollarSign, color: 'green' },
                        { label: 'Daily Spent', value: `$${agents.reduce((sum, a) => sum + parseFloat(a.dailySpent), 0).toFixed(2)}`, icon: Clock, color: 'blue' },
                        { label: 'Whitelisted Recipients', value: agents.reduce((sum, a) => sum + a.allowedRecipients.length, 0), icon: Users, color: 'pink' }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm">{stat.label}</p>
                                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                                </div>
                                <stat.icon className={`w-10 h-10 text-${stat.color}-500 opacity-50`} />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Agents List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                    </div>
                ) : agents.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-gray-800/30 rounded-2xl p-12 text-center border border-gray-700 border-dashed"
                    >
                        <Bot className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No Agents Yet</h3>
                        <p className="text-gray-400 mb-6">Create your first AI payment agent to automate transactions</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-3 bg-purple-600 rounded-xl text-white font-medium hover:bg-purple-700 transition"
                        >
                            Create Your First Agent
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {agents.map((agent, i) => (
                            <motion.div
                                key={agent.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                            <Bot className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-mono text-white">
                                                    {agent.agent.slice(0, 6)}...{agent.agent.slice(-4)}
                                                </p>
                                                {agent.isActive ? (
                                                    <span className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                                                        <CheckCircle className="w-3 h-3" /> Active
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
                                                        <AlertCircle className="w-3 h-3" /> Revoked
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-400 text-sm mt-1">
                                                Created {new Date(agent.createdAt).toLocaleDateString()}
                                                {agent.expiresAt && ` • Expires ${new Date(agent.expiresAt).toLocaleDateString()}`}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => revokeAgent(agent.agent)}
                                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition"
                                        disabled={!agent.isActive}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mt-6">
                                    <div className="bg-gray-900/50 rounded-lg p-4">
                                        <p className="text-gray-400 text-sm">Max per Transaction</p>
                                        <p className="text-xl font-bold text-white">${parseFloat(agent.maxAmountPerTx).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-gray-900/50 rounded-lg p-4">
                                        <p className="text-gray-400 text-sm">Daily Limit</p>
                                        <p className="text-xl font-bold text-white">${parseFloat(agent.maxDailyAmount).toLocaleString()}</p>
                                    </div>
                                    <div className="bg-gray-900/50 rounded-lg p-4">
                                        <p className="text-gray-400 text-sm">Spent Today</p>
                                        <p className="text-xl font-bold text-green-400">${parseFloat(agent.dailySpent).toFixed(2)}</p>
                                        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                                            <div
                                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                                                style={{ width: `${(parseFloat(agent.dailySpent) / parseFloat(agent.maxDailyAmount)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {agent.allowedRecipients.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-700">
                                        <p className="text-gray-400 text-sm mb-2">
                                            <Shield className="w-4 h-4 inline mr-1" />
                                            Whitelisted Recipients ({agent.allowedRecipients.length})
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {agent.allowedRecipients.map((r, i) => (
                                                <span key={i} className="text-xs font-mono bg-gray-700 px-2 py-1 rounded">
                                                    {r.slice(0, 6)}...{r.slice(-4)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Create Agent Modal */}
                <AnimatePresence>
                    {showCreateModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                            onClick={() => setShowCreateModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full"
                                onClick={e => e.stopPropagation()}
                            >
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Bot className="w-6 h-6 text-purple-500" />
                                    Create AI Payment Agent
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-gray-400 text-sm mb-2">Agent Wallet Address</label>
                                        <input
                                            type="text"
                                            value={agentAddress}
                                            onChange={e => setAgentAddress(e.target.value)}
                                            placeholder="0x..."
                                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white font-mono focus:border-purple-500 outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-gray-400 text-sm mb-2">Max per Transaction ($)</label>
                                            <input
                                                type="number"
                                                value={maxPerTx}
                                                onChange={e => setMaxPerTx(e.target.value)}
                                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-400 text-sm mb-2">Daily Limit ($)</label>
                                            <input
                                                type="number"
                                                value={maxDaily}
                                                onChange={e => setMaxDaily(e.target.value)}
                                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-gray-400 text-sm mb-2">Duration (days)</label>
                                        <input
                                            type="number"
                                            value={durationDays}
                                            onChange={e => setDurationDays(e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-400 text-sm mb-2">
                                            Allowed Recipients (optional, comma-separated)
                                        </label>
                                        <textarea
                                            value={allowedRecipients}
                                            onChange={e => setAllowedRecipients(e.target.value)}
                                            placeholder="0x..., 0x..., 0x..."
                                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-purple-500 outline-none h-20 resize-none"
                                        />
                                        <p className="text-gray-500 text-xs mt-1">Leave empty to allow any recipient</p>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 py-3 bg-gray-700 rounded-xl text-white font-medium hover:bg-gray-600 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={createAgent}
                                        disabled={!agentAddress || creating}
                                        className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {creating ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Plus className="w-5 h-5" />
                                                Create Agent
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
