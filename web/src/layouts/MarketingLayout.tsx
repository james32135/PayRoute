import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

function PayRouteLogo({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="32" height="32" rx="8" fill="url(#pr-grad-m)" />
      <path d="M9 11h6.5a4 4 0 0 1 0 8H13v4H9V11z" fill="#fff" fillOpacity=".95" />
      <path d="M16 17l6 6" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M19.5 13.5l3.5-3.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeOpacity=".6" />
      <defs>
        <linearGradient id="pr-grad-m" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4A7BF7" />
          <stop offset="1" stopColor="#2DD4A8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30">
        <nav className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <PayRouteLogo className="w-8 h-8" />
            <span className="text-lg font-bold tracking-tight">PayRoute</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="https://github.com/james32135/PayRoute" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">GitHub</a>
          </div>

          <Button size="sm" asChild>
            <Link to="/app">Launch App</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1 pt-14">{children}</main>

      <footer className="border-t border-border/30 py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <PayRouteLogo className="w-6 h-6" />
                <span className="font-bold">PayRoute</span>
              </div>
              <p className="text-sm text-muted-foreground">AI-routed stablecoin payment rails on Polygon.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/app" className="hover:text-foreground transition-colors">Dashboard</Link></li>
                <li><Link to="/app/send" className="hover:text-foreground transition-colors">Send</Link></li>
                <li><Link to="/app/vaults" className="hover:text-foreground transition-colors">Vaults</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Developers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/app/developers" className="hover:text-foreground transition-colors">API Docs</Link></li>
                <li><a href="https://github.com/james32135/PayRoute" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-3">Contracts</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="https://polygonscan.com/address/0x85bB3a8b849C0F8cC9664174D60ccfeA5c5C161C" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Router</a></li>
                <li><a href="https://polygonscan.com/address/0x86442aF11147A4b32c5577cC701899e7696ca290" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Vault</a></li>
                <li><a href="https://polygonscan.com/address/0x4E1ee2689A996974D275f69d4621090A18581DaB" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Recurring</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border/30 text-center text-xs text-muted-foreground">
            &copy; 2025 PayRoute. Built on Polygon.
          </div>
        </div>
      </footer>
    </div>
  );
}
