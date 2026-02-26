import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Send,
  Vault,
  ShieldCheck,
  BarChart3,
  Code,
  Settings,
  HelpCircle,
  Menu,
  X,
  Wallet,
  Bot,
  Globe,
  Repeat,
} from 'lucide-react';

function PayRouteLogo({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="32" height="32" rx="8" fill="url(#pr-grad)" />
      <path d="M9 11h6.5a4 4 0 0 1 0 8H13v4H9V11z" fill="#fff" fillOpacity=".95" />
      <path d="M16 17l6 6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M19.5 13.5l3.5-3.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeOpacity=".6" />
      <defs>
        <linearGradient id="pr-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4A7BF7" />
          <stop offset="1" stopColor="#2DD4A8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const navigation = [
  { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
  { name: 'Send', href: '/app/send', icon: Send },
  { name: 'Corridors', href: '/app/corridors', icon: Globe },
  { name: 'Vaults', href: '/app/vaults', icon: Vault },
  { name: 'AI Agents', href: '/app/agents', icon: Bot },
  { name: 'Recurring', href: '/app/recurring', icon: Repeat, badge: 'NEW' },
  { name: 'Identity', href: '/app/identity', icon: ShieldCheck },
  { name: 'Analytics', href: '/app/analytics', icon: BarChart3 },
  { name: 'Developers', href: '/app/developers', icon: Code },
];

const secondaryNav = [
  { name: 'Settings', href: '/app/settings', icon: Settings },
  { name: 'Help', href: '/app/help', icon: HelpCircle },
];

import { useAccount, useConnect, useDisconnect } from 'wagmi';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    const connector = connectors[0];
    if (connector) {
      connect({ connector });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-60 bg-background border-r border-border/30 transform transition-transform duration-200 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-14 flex items-center justify-between px-5 border-b border-border/30">
            <Link to="/app" className="flex items-center gap-2.5">
              <PayRouteLogo className="w-8 h-8" />
              <span className="text-lg font-bold tracking-tight">PayRoute</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                    isActive
                      ? 'bg-white/[0.06] text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                  {(item as any).badge && (
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-semibold">
                      {(item as any).badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Secondary navigation */}
          <div className="px-3 py-4 border-t border-border/30 space-y-0.5">
            {secondaryNav.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                    isActive
                      ? 'bg-white/[0.06] text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-60">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-14 bg-background/80 backdrop-blur-md border-b border-border/30">
          <div className="h-full px-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3 ml-auto">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] text-xs text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                Polygon
              </div>

              {isConnected ? (
                <Button size="sm" variant="outline" onClick={() => disconnect()} className="gap-2 text-xs h-8 border-border/40">
                  <Wallet className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                </Button>
              ) : (
                <Button size="sm" onClick={handleConnect} className="gap-2 h-8 text-xs">
                  <Wallet className="w-3.5 h-3.5" /> Connect
                </Button>
              )}
            </div>
          </div>
        </header>

        <main className="p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
