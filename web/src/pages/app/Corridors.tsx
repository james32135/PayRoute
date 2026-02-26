import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import {
    Globe, TrendingUp, ArrowRight, DollarSign, Clock,
    Percent, RefreshCw, Loader2, MapPin, Zap
} from 'lucide-react';
import { api } from '../../lib/api';

interface Corridor {
    id: string;
    name: string;
    country: string;
    currency: string;
    flag: string;
    description: string;
    avgFee: string;
    avgTime: string;
    monthlyVolume: string;
    currentRate: number;
    rateDisplay: string;
    note?: string;
}

interface Quote {
    corridorId: string;
    amountUSD: number;
    localAmount: string;
    localCurrency: string;
    fees: {
        total: string;
        percentage: string;
    };
    rate: string;
    display: {
        youSend: string;
        theyReceive: string;
    };
    comparison: {
        westernUnion: { fee: string; savings: string; savingsPercent: string };
        wise: { fee: string; savings: string };
    };
}

export default function Corridors() {
    const { address } = useAccount();
    const [corridors, setCorridors] = useState<Corridor[]>([]);
    const [selectedCorridor, setSelectedCorridor] = useState<string>('latam-mexico');
    const [amount, setAmount] = useState('100');
    const [quote, setQuote] = useState<Quote | null>(null);
    const [loading, setLoading] = useState(true);
    const [quoteLoading, setQuoteLoading] = useState(false);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetchCorridors();
        fetchStats();
    }, []);

    useEffect(() => {
        if (amount && selectedCorridor) {
            const timer = setTimeout(() => {
                fetchQuote();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [amount, selectedCorridor]);

    const fetchCorridors = async () => {
        try {
            const response = await api.get('/corridors');
            setCorridors(response.data.corridors || []);
        } catch (error) {
            console.error('Failed to fetch corridors:', error);
            setCorridors([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/corridors/stats/overview');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const fetchQuote = async () => {
        if (!amount || parseFloat(amount) <= 0) return;

        setQuoteLoading(true);
        try {
            const response = await api.post('/corridors/quote', {
                corridorId: selectedCorridor,
                amountUSD: parseFloat(amount)
            });
            setQuote(response.data.quote);
        } catch (error) {
            console.error('Failed to fetch quote:', error);
        } finally {
            setQuoteLoading(false);
        }
    };

    const selectedCorridorData = corridors.find(c => c.id === selectedCorridor);

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Globe className="w-8 h-8 text-purple-500" />
                        LATAM Remittance Corridors
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Send USDC to Latin America with real-time FX rates
                    </p>
                </motion.div>

                {/* Stats Bar */}
                {stats && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
                    >
                        {[
                            { label: '24h Volume', value: stats.totalVolume24h, icon: DollarSign },
                            { label: 'Transactions', value: stats.totalTransactions24h, icon: TrendingUp },
                            { label: 'Avg Size', value: stats.avgTransactionSize, icon: Zap },
                            { label: 'Top Corridor', value: stats.topCorridor, icon: MapPin },
                            { label: 'Avg Savings', value: stats.avgSavingsVsBanks, icon: Percent }
                        ].map((stat, i) => (
                            <div key={i} className="glass-card rounded-xl p-4">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                                    <stat.icon className="w-4 h-4" />
                                    {stat.label}
                                </div>
                                <p className="text-xl font-bold">{stat.value}</p>
                            </div>
                        ))}
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Corridor Selection */}
                    <div className="lg:col-span-1 space-y-4">
                        <h2 className="text-lg font-semibold mb-4">Select Corridor</h2>

                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            </div>
                        ) : corridors.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>No corridors available.</p>
                                <p className="text-sm mt-1">Check back later or try refreshing.</p>
                            </div>
                        ) : (
                            corridors.map((corridor, i) => (
                                <motion.button
                                    key={corridor.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    onClick={() => setSelectedCorridor(corridor.id)}
                                    className={`w-full text-left p-4 rounded-xl border transition ${selectedCorridor === corridor.id
                                            ? 'bg-primary/20 border-primary'
                                            : 'glass-card hover:border-primary/30'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{corridor.flag}</span>
                                        <div className="flex-1">
                                            <p className="font-semibold">{corridor.name}</p>
                                            <p className="text-sm text-muted-foreground">{corridor.rateDisplay}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-green-400 font-medium">{corridor.avgFee}</p>
                                            <p className="text-muted-foreground text-xs">{corridor.avgTime}</p>
                                        </div>
                                    </div>
                                </motion.button>
                            ))
                        )}
                    </div>

                    {/* Quote Calculator */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="glass-card backdrop-blur-sm rounded-2xl p-6"
                        >
                            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-primary" />
                                Calculate Transfer
                            </h2>

                            {/* Amount Input */}
                            <div className="mb-6">
                                <label className="block text-muted-foreground text-sm mb-2">You Send (USD)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xl">$</span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-4 text-2xl font-bold focus:border-primary outline-none transition-colors"
                                        placeholder="100"
                                    />
                                    <button
                                        onClick={fetchQuote}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <RefreshCw className={`w-5 h-5 ${quoteLoading ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Quote Result */}
                            {quote && selectedCorridorData && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    {/* They Receive */}
                                    <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl p-6 border border-primary/30">
                                        <p className="text-muted-foreground text-sm mb-2">They Receive</p>
                                        <div className="flex items-center gap-4">
                                            <span className="text-4xl">{selectedCorridorData.flag}</span>
                                            <div>
                                                <p className="text-3xl font-bold">
                                                    {parseFloat(quote.localAmount).toLocaleString()} {quote.localCurrency}
                                                </p>
                                                <p className="text-muted-foreground text-sm">@ {quote.rate} rate</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Fee Breakdown */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-muted/30 rounded-xl p-4">
                                            <p className="text-muted-foreground text-sm">Total Fee</p>
                                            <p className="text-xl font-bold text-green-400">${quote.fees.total}</p>
                                            <p className="text-muted-foreground text-xs">{quote.fees.percentage}</p>
                                        </div>
                                        <div className="bg-muted/30 rounded-xl p-4">
                                            <p className="text-muted-foreground text-sm">Exchange Rate</p>
                                            <p className="text-xl font-bold">{parseFloat(quote.rate).toFixed(2)}</p>
                                            <p className="text-muted-foreground text-xs">{quote.localCurrency}/USD</p>
                                        </div>
                                        <div className="bg-muted/30 rounded-xl p-4">
                                            <p className="text-muted-foreground text-sm">Delivery</p>
                                            <p className="text-xl font-bold text-primary">~5 sec</p>
                                            <p className="text-muted-foreground text-xs">Instant</p>
                                        </div>
                                    </div>

                                    {/* Comparison */}
                                    <div className="bg-muted/30 rounded-xl p-4">
                                        <p className="text-muted-foreground text-sm mb-3">vs Traditional Remittance</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Western Union</span>
                                                <span className="text-green-400 font-semibold">
                                                    Save ${quote.comparison.westernUnion.savings}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">Wise</span>
                                                <span className="text-green-400 font-semibold">
                                                    Save ${quote.comparison.wise.savings}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Send Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full py-4 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-semibold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                                        onClick={() => window.location.href = `/app/send?corridor=${selectedCorridor}&amount=${amount}`}
                                    >
                                        Send to {selectedCorridorData.country}
                                        <ArrowRight className="w-5 h-5" />
                                    </motion.button>
                                </motion.div>
                            )}

                            {quoteLoading && (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                </div>
                            )}
                        </motion.div>

                        {/* Corridor Info */}
                        {selectedCorridorData && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-6 glass-card rounded-xl p-4"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">{selectedCorridorData.flag}</span>
                                    <div>
                                        <h3 className="font-semibold">{selectedCorridorData.name} Corridor</h3>
                                        <p className="text-muted-foreground text-sm mt-1">{selectedCorridorData.description}</p>
                                        {selectedCorridorData.note && (
                                            <p className="text-primary text-sm mt-2 flex items-center gap-1">
                                                <Zap className="w-4 h-4" />
                                                {selectedCorridorData.note}
                                            </p>
                                        )}
                                        <p className="text-muted-foreground text-xs mt-2">
                                            Monthly Volume: {selectedCorridorData.monthlyVolume}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
