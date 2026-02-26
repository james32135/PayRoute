import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Vault,
  DollarSign,
  Percent,
  ArrowDownLeft,
  Wallet,
  ShieldCheck,
  Activity,
  Loader2
} from 'lucide-react';
import { useAnalyticsSummary } from '@/hooks/useAnalyticsSummary';

import { useAccount } from 'wagmi';

export default function Dashboard() {
  const { address } = useAccount();
  const { data: stats, isLoading } = useAnalyticsSummary(address);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-3 text-muted-foreground">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          Your PayRoute payment activity at a glance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 space-y-2 bg-card/50 backdrop-blur border-primary/10">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-primary/20 rounded-lg">
              <span className="text-primary font-bold">$</span>
            </div>
            <ArrowUpRight className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Sent</p>
            <h3 className="text-2xl font-bold">${stats?.totalSent?.toLocaleString() || "0.00"}</h3>
            {stats?.totalSent > 0 && <p className="text-xs text-green-500">Active sender</p>}
          </div>
        </Card>

        <Card className="p-6 space-y-2 bg-card/50 backdrop-blur border-primary/10">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <span className="text-blue-500 font-bold">%</span>
            </div>
            <ArrowDownLeft className="h-4 w-4 text-blue-500" />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Avg. Fee Saved vs Bank</p>
            <h3 className="text-2xl font-bold">{stats?.avgFeeSaved || 0}%</h3>
            <p className="text-xs text-muted-foreground">Across all corridors</p>
          </div>
        </Card>

        <Card className="p-6 space-y-2 bg-card/50 backdrop-blur border-primary/10">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Wallet className="h-4 w-4 text-purple-500" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Active Vault Deposits</p>
            <h3 className="text-2xl font-bold">${stats?.activeVaultDeposits?.toLocaleString() || "0"}</h3>
            {stats?.activeVaultDeposits > 0 && <p className="text-xs text-green-500">Earning yield</p>}
          </div>
        </Card>

        <Card className="p-6 space-y-2 bg-card/50 backdrop-blur border-primary/10">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-400/20 rounded-lg">
              <ShieldCheck className="h-4 w-4 text-blue-400" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Verified Users Badge</p>
            <h3 className="text-xl font-bold">Human Verified</h3>
            <span className="inline-flex items-center rounded-full bg-blue-400/10 px-2 py-1 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-400/20">
              Active
            </span>
          </div>
        </Card>
      </div>


      {/* Recent Activity */}
      <Card className="glass-card">
        <div className="p-6 border-b border-border/50">
          <h2 className="text-xl font-display font-bold">Recent Activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Counterparty</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Time</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentActivity?.length > 0 ? (
                stats.recentActivity.map((activity: any) => (
                  <tr key={activity.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {activity.type === 'send' || activity.type === 'deposit' ? (
                          <ArrowUpRight className="w-4 h-4 text-destructive" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-secondary" />
                        )}
                        <span className="text-sm capitalize">{activity.type}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm">{activity.counterparty}</td>
                    <td className="p-4 text-sm font-medium">{activity.amount}</td>
                    <td className="p-4">
                      <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                        {activity.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{activity.timestamp}</td>
                  </tr>
                ))) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">No recent activity found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6 glass-card">
        <h2 className="text-xl font-display font-bold mb-4">Quick Actions</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Get started with PayRoute's core features
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Send Payment', icon: ArrowUpRight, href: '/app/send', color: 'from-primary to-secondary' },
            { label: 'Explore Vaults', icon: Vault, href: '/app/vaults', color: 'from-purple-500 to-pink-500' },
            { label: 'Verify Identity', icon: ShieldCheck, href: '/app/identity', color: 'from-blue-500 to-cyan-500' },
            { label: 'View Analytics', icon: Activity, href: '/app/analytics', color: 'from-green-500 to-emerald-500' },
          ].map((action, index) => (
            <a
              key={index}
              href={action.href}
              className="flex flex-col items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/50 hover:bg-muted/50 transition-all duration-300 group cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium">{action.label}</span>
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}
