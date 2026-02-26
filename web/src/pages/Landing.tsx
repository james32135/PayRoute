import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import MarketingLayout from '@/layouts/MarketingLayout';
import {
  ArrowRight,
  Users,
  Briefcase,
  TrendingUp,
  ShieldCheck,
  Brain,
  Vault,
  Zap,
  Globe,
  CheckCircle2,
  Repeat,
  Bot,
} from 'lucide-react';

export default function Landing() {
  const fade = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };
  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="relative pt-24 pb-20 md:pt-36 md:pb-28">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl mx-auto text-center space-y-8">
            <motion.p variants={fade} className="text-sm uppercase tracking-widest text-muted-foreground">
              Non-custodial &middot; AI-routed &middot; Polygon-native
            </motion.p>
            <motion.h1 variants={fade} className="text-5xl md:text-7xl font-bold leading-[1.08] tracking-tight">
              Smart payment rails<br />
              <span className="gradient-text">for the open economy</span>
            </motion.h1>
            <motion.p variants={fade} className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
              Send USDC globally, verify identity with ZK proofs, earn yield on corridor liquidity, and automate recurring payments — all from one dashboard.
            </motion.p>
            <motion.div variants={fade} className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild className="group px-8">
                <Link to="/app">
                  Launch App
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-border/50">
                <a href="https://github.com/james32135/PayRoute" target="_blank" rel="noopener noreferrer">
                  View on GitHub
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-border/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Network', value: 'Polygon' },
              { label: 'Contracts', value: '6 Live' },
              { label: 'Identity', value: 'Privado ZK' },
              { label: 'Stablecoin', value: 'USDC' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl md:text-3xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold">Explore by category</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Six on-chain modules that work together as a complete payment infrastructure.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {[
              {
                icon: Zap,
                title: 'Smart Router',
                desc: 'AI-optimized USDC routing with automatic fee splitting and MEV protection on Polygon.',
              },
              {
                icon: ShieldCheck,
                title: 'Identity Gate',
                desc: 'Verify personhood and age using Privado ID zero-knowledge proofs — no docs uploaded.',
              },
              {
                icon: Bot,
                title: 'Payment Agents',
                desc: 'Delegate USDC spending to AI agents with per-tx limits, daily caps, and recipient whitelists.',
              },
              {
                icon: Vault,
                title: 'Yield Vaults',
                desc: 'ERC-4626 corridor vaults that earn real fees from payment flows — productive TVL.',
              },
              {
                icon: Globe,
                title: 'Tiered Limits',
                desc: 'Identity-gated transaction ceilings: $100/day for anon, up to unlimited for fully verified.',
              },
              {
                icon: Repeat,
                title: 'Recurring Payments',
                desc: 'Set up on-chain subscriptions with flexible intervals. Executors trigger them when due.',
                badge: 'NEW',
              },
            ].map((f, i) => (
              <motion.div key={i} variants={fade}>
                <Card className="p-6 h-full bg-card/40 border-border/30 hover:border-primary/30 transition-colors group">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <f.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{f.title}</h3>
                        {(f as any).badge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-semibold">
                            {(f as any).badge}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1.5">{f.desc}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="py-20 border-t border-border/30">
        <div className="container mx-auto px-4 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold">Built for everyone</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Users, title: 'People & Families', desc: 'Send money across borders in minutes using USDC on Polygon. No banks, no surprise fees.' },
              { icon: Briefcase, title: 'Builders & Wallets', desc: 'Drop-in rails for Polygon payments and identity. Let users pay with usernames, not hex addresses.' },
              { icon: TrendingUp, title: 'Liquidity Providers', desc: 'Fund corridor vaults and earn real fees from productive capital, not mercenary emissions.' },
            ].map((item, i) => (
              <Card key={i} className="p-6 bg-card/40 border-border/30 hover:border-primary/30 transition-colors">
                <item.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 border-t border-border/30">
        <div className="container mx-auto px-4 space-y-12">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold">How it works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { step: '01', title: 'Connect & Verify', desc: 'Connect your wallet and optionally prove "I\'m human" or "I\'m 18+" using self-sovereign ZK credentials. No raw documents shared.' },
              { step: '02', title: 'Send or Deposit', desc: 'Send USDC to any address, fund a corridor vault, set up recurring payments, or delegate to an AI agent.' },
              { step: '03', title: 'AI Routes, You Save', desc: 'The AI engine picks the best path across Polygon DeFi, minimizing fees and slippage automatically.' },
            ].map((item, i) => (
              <div key={i} className="space-y-3">
                <span className="text-5xl font-bold text-primary/20">{item.step}</span>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem */}
      <section className="py-14 border-y border-border/30">
        <div className="container mx-auto px-4 text-center space-y-6">
          <p className="text-sm text-muted-foreground uppercase tracking-widest">Built for the Polygon ecosystem</p>
          <div className="flex flex-wrap justify-center gap-10 text-xl font-semibold text-muted-foreground/60">
            <span>Polygon PoS</span>
            <span>Privado ID</span>
            <span>USDC</span>
            <span>OpenZeppelin</span>
            <span>ERC-4626</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to build?</h2>
            <p className="text-muted-foreground">
              Deploy real payment rails — not just dashboards. Open source, non-custodial, Polygon-native.
            </p>
            <Button size="lg" asChild className="group px-8">
              <Link to="/app">
                Launch App
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
