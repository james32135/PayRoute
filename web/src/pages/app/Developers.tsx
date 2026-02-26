import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code, Zap, ShieldCheck, Brain, Copy, ExternalLink } from 'lucide-react';

export default function Developers() {
  const codeExample = `import { PayRoute } from '@payroute/sdk';

const client = new PayRoute({
  network: 'polygon',
  apiKey: process.env.PAYROUTE_API_KEY
});

// Send a payment by username
await client.sendPayment({
  from: walletAddress,
  toUsername: '@maria_santos',
  amountUSDC: 100,
  useAIRouting: true
});`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <Code className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-display font-bold">Build on PayRoute Rails</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Drop-in payment infrastructure for your Polygon app. Username payments, ZK identity, and AI routing out of the box.
        </p>
      </div>

      {/* Key Features */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            icon: Zap,
            title: 'Username Payments',
            description: 'Let users send USDC to @usernames instead of hex addresses. Better UX, zero setup.',
          },
          {
            icon: ShieldCheck,
            title: 'ZK Identity SDK',
            description: 'Request verifiable credentials from users without storing sensitive data.',
          },
          {
            icon: Brain,
            title: 'AI Routing API',
            description: 'Get AI-recommended payment routes as a service for your own flows.',
          },
        ].map((feature, index) => (
          <Card key={index} className="p-6 glass-card">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <feature.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display text-lg font-bold mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </Card>
        ))}
      </div>

      {/* Code Example */}
      <Card className="glass-card overflow-hidden">
        <div className="p-6 border-b border-border/50 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Quick Start</h2>
          <Button size="sm" variant="outline" className="gap-2">
            <Copy className="w-4 h-4" />
            Copy
          </Button>
        </div>
        <pre className="p-6 overflow-x-auto text-sm bg-background/50">
          <code className="text-primary font-mono">{codeExample}</code>
        </pre>
      </Card>

      {/* SDK Features */}
      <div>
        <h2 className="text-2xl font-display font-bold mb-6">Coming Soon: SDKs & Tools</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 glass-card space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Code className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold mb-2">JavaScript/TypeScript SDK</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Full-featured client for web and Node.js applications
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span>Username resolution and payment sending</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span>ZK credential verification flows</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span>Webhook handlers for payment events</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-6 glass-card space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold mb-2">React Components</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Drop-in UI components for common payment flows
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 flex-shrink-0" />
                    <span>&lt;SendPaymentWidget /&gt; for quick integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 flex-shrink-0" />
                    <span>&lt;IdentityVerify /&gt; for ZK credential flows</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 flex-shrink-0" />
                    <span>Fully customizable with Tailwind CSS</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Use Cases */}
      <div>
        <h2 className="text-2xl font-display font-bold mb-6">What You Can Build</h2>
        <div className="space-y-4">
          {[
            {
              title: 'Payroll Platforms',
              description: 'Pay global contractors in stablecoins with instant settlement and minimal fees',
            },
            {
              title: 'Marketplace Escrow',
              description: 'Hold payments in vaults until goods/services are delivered',
            },
            {
              title: 'DAO Treasury Management',
              description: 'Batch payments to contributors across multiple corridors',
            },
            {
              title: 'Remittance Apps',
              description: 'Consumer-facing apps for cross-border money transfers',
            },
          ].map((useCase, index) => (
            <Card key={index} className="p-4 glass-card hover:glow-primary transition-all duration-300 cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{useCase.title}</h3>
                  <p className="text-sm text-muted-foreground">{useCase.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Card className="p-8 glass-card bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-display font-bold">Get Early Access</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            SDKs and documentation are coming soon. Join the waitlist to be notified when we launch developer tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2">
              Join Developer Waitlist
              <ExternalLink className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              View API Docs
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
