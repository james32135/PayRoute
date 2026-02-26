import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Network, Globe, ShieldCheck } from 'lucide-react';

export default function Settings() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your PayRoute preferences and configuration</p>
      </div>

      {/* Network Settings */}
      <Card className="p-6 glass-card space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Network className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">Network</h2>
            <p className="text-sm text-muted-foreground">Choose which blockchain network to use</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-primary/30">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <div>
                <p className="font-medium">Polygon</p>
                <p className="text-xs text-muted-foreground">Primary network - currently active</p>
              </div>
            </div>
            <Button size="sm" disabled>Active</Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/30 opacity-60">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-muted-foreground" />
              <div>
                <p className="font-medium">AggLayer</p>
                <p className="text-xs text-muted-foreground">Coming soon</p>
              </div>
            </div>
            <Button size="sm" variant="outline" disabled>Soon</Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/30 opacity-60">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-muted-foreground" />
              <div>
                <p className="font-medium">Katana</p>
                <p className="text-xs text-muted-foreground">Future integration</p>
              </div>
            </div>
            <Button size="sm" variant="outline" disabled>Soon</Button>
          </div>
        </div>
      </Card>

      {/* Display Preferences */}
      <Card className="p-6 glass-card space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
            <Globe className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">Display Preferences</h2>
            <p className="text-sm text-muted-foreground">Customize how information is displayed</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/30">
            <div>
              <Label htmlFor="currency-usd" className="font-medium">USD</Label>
              <p className="text-xs text-muted-foreground">United States Dollar</p>
            </div>
            <Switch id="currency-usd" defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/30">
            <div>
              <Label htmlFor="currency-eur" className="font-medium">EUR</Label>
              <p className="text-xs text-muted-foreground">Euro</p>
            </div>
            <Switch id="currency-eur" />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/30">
            <div>
              <Label htmlFor="currency-brl" className="font-medium">BRL</Label>
              <p className="text-xs text-muted-foreground">Brazilian Real</p>
            </div>
            <Switch id="currency-brl" />
          </div>
        </div>
      </Card>

      {/* Privacy Settings */}
      <Card className="p-6 glass-card space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">Privacy</h2>
            <p className="text-sm text-muted-foreground">Control your data sharing and visibility</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/30">
            <div className="flex-1 pr-4">
              <Label htmlFor="share-stats" className="font-medium">Share Anonymized Stats</Label>
              <p className="text-xs text-muted-foreground">
                Help improve AI routes by sharing anonymized transaction data
              </p>
            </div>
            <Switch id="share-stats" defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/30">
            <div className="flex-1 pr-4">
              <Label htmlFor="hide-address" className="font-medium">Hide Address from Leaderboards</Label>
              <p className="text-xs text-muted-foreground">
                Don't display your wallet address on public leaderboards or stats
              </p>
            </div>
            <Switch id="hide-address" />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/30">
            <div className="flex-1 pr-4">
              <Label htmlFor="analytics" className="font-medium">Analytics & Performance</Label>
              <p className="text-xs text-muted-foreground">
                Allow basic analytics to help us improve the app performance
              </p>
            </div>
            <Switch id="analytics" defaultChecked />
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>Save Changes</Button>
      </div>
    </motion.div>
  );
}
