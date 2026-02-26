import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { TrendingUp, Globe, DollarSign, Users, MapPin, Clock, Briefcase, Loader2 } from 'lucide-react';

import { useAccount } from 'wagmi';
import { useAnalyticsSummary } from '@/hooks/useAnalyticsSummary';

export default function Analytics() {
  const { address } = useAccount();
  const { data: stats, isLoading } = useAnalyticsSummary(address);

  if (isLoading) return (
    <div className="flex items-center justify-center p-16">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <span className="ml-3 text-muted-foreground">Loading analytics...</span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Your Impact on Real Users</h1>
        <p className="text-muted-foreground">See how your usage contributes to the PayRoute ecosystem</p>
      </div>

      {/* Payment Impact */}
      <div>
        <h2 className="text-xl font-display font-bold mb-4">Payment Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 glass-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Total Remittance Volume</p>
            <p className="text-3xl font-bold">${stats?.analytics?.totalVolume?.toLocaleString() || "0"}</p>
            <p className="text-xs text-muted-foreground mt-2">Lifetime sent via PayRoute</p>
          </Card>

          <Card className="p-6 glass-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-secondary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Average Savings vs Bank</p>
            <p className="text-3xl font-bold text-secondary">{stats?.analytics?.savings || 0}%</p>
            <p className="text-xs text-muted-foreground mt-2">Across all your payments</p>
          </Card>

          <Card className="p-6 glass-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Countries Reached</p>
            <p className="text-3xl font-bold">{stats?.analytics?.uniqueRecipients || 0}</p>
            <p className="text-xs text-muted-foreground mt-2">Unique recipient addresses</p>
          </Card>
        </div>
      </div>

      {/* Network Metrics */}
      <div>
        <h2 className="text-xl font-display font-bold mb-4">Network Level Metrics</h2>
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6 glass-card">
            <h3 className="font-display font-bold mb-4">How It Works</h3>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <DollarSign className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">AI-Optimized Routing</p>
                  <p>Every payment is routed through the best available path on Polygon DeFi to minimize fees and slippage.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <TrendingUp className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Productive Vault Capital</p>
                  <p>Corridor vaults deploy idle capital into real DeFi yield while backing payment flows.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Globe className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Global Coverage</p>
                  <p>Supporting LATAM, APAC, and Africa corridors with real-time FX data.</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 glass-card">
            <h3 className="font-display font-bold mb-4">Your Activity Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm text-muted-foreground">Total Volume</span>
                <span className="font-bold text-primary">${stats?.analytics?.totalVolume?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm text-muted-foreground">Avg Savings vs Banks</span>
                <span className="font-bold text-secondary">{stats?.analytics?.savings || 0}%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm text-muted-foreground">Unique Recipients</span>
                <span className="font-bold">{stats?.analytics?.uniqueRecipients || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm text-muted-foreground">Total Payments</span>
                <span className="font-bold">{stats?.totalPayments || 0}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Use Cases */}
      <div>
        <h2 className="text-xl font-display font-bold mb-4">What People Build with PayRoute</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Users,
              story: 'Cross-border remittances with lower fees',
              description: 'Support families across borders without losing money to intermediaries',
            },
            {
              icon: Briefcase,
              story: 'Multi-country contractor payroll',
              description: 'Streamlined payroll with instant settlement and minimal overhead',
            },
            {
              icon: Globe,
              story: 'Instant stablecoin transfers globally',
              description: 'No more waiting for bank transfers to clear across borders',
            },
            {
              icon: TrendingUp,
              story: 'Productive vault deposits',
              description: 'Earn real yield from capital deployed into payment corridor flows',
            },
            {
              icon: Clock,
              story: 'Automated payment processing',
              description: 'AI routing and instant confirmations eliminate manual work',
            },
            {
              icon: MapPin,
              story: 'Better payment rails everywhere',
              description: 'Financial infrastructure that doesn\'t discriminate by geography',
            },
          ].map((item, index) => (
            <Card key={index} className="p-6 glass-card hover:glow-primary transition-all duration-300">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="font-semibold mb-2">{item.story}</p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Ecosystem Contribution */}
      <Card className="p-8 glass-card bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-display font-bold">Your Ecosystem Contribution</h2>
          <div className="grid md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            <div>
              <p className="text-3xl font-bold text-primary">${stats?.analytics?.totalVolume?.toLocaleString() || '0'}</p>
              <p className="text-sm text-muted-foreground">Volume Enabled</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-secondary">{stats?.totalPayments || 0}</p>
              <p className="text-sm text-muted-foreground">Payments Sent</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">${stats?.activeVaultDeposits?.toLocaleString() || '0'}</p>
              <p className="text-sm text-muted-foreground">Vault TVL</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-secondary">{stats?.analytics?.uniqueRecipients || 0}</p>
              <p className="text-sm text-muted-foreground">Recipients</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            You're part of a movement building better financial rails for everyone. Thank you for being an early adopter.
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
