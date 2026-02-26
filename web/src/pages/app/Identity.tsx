import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ShieldCheck, CheckCircle2, XCircle, Info } from 'lucide-react';
import { useAccount, useReadContract } from 'wagmi';
import { QRCodeSVG } from 'qrcode.react';
import PayRouteIdentityGateABI from '@/lib/abis/PayRouteIdentityGate.json';
import { CONTRACT_ADDRESSES } from '@/lib/constants';

const IDENTITY_GATE_ADDRESS = CONTRACT_ADDRESSES.IDENTITY_GATE;

export default function Identity() {
  const { address, isConnected } = useAccount();
  const [showQR, setShowQR] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Read Request IDs and Verifier Address
  const { data: humanityRequestId } = useReadContract({
    address: IDENTITY_GATE_ADDRESS,
    abi: PayRouteIdentityGateABI,
    functionName: 'humanityRequestId',
  });

  const { data: universalVerifierAddress } = useReadContract({
    address: IDENTITY_GATE_ADDRESS,
    abi: PayRouteIdentityGateABI,
    functionName: 'universalVerifier',
  });

  // Read Access Status
  const { data: isHuman, refetch: refetchHumanStatus } = useReadContract({
    address: IDENTITY_GATE_ADDRESS,
    abi: PayRouteIdentityGateABI,
    functionName: 'isHuman',
    args: [address],
    query: {
      enabled: !!address,
      refetchInterval: 5000, // Poll every 5s
    }
  });



  // Construct QR Code Data (Privado ID Proof Request)
  const qrCodeData = JSON.stringify({
    id: "c811849d-6bfb-4d85-935e-3d7697ef83c5",
    typ: "application/iden3-comm",
    type: "https://iden3-communication.io/proofs/1.0/contract-invoke-request",
    body: {
      reason: "Verify Liveness",
      transaction_data: {
        contract_address: universalVerifierAddress,
        method_id: "b68967e2", // submitResponse signature
        chain_id: 137,
        network: "polygon-mainnet"
      },
      scope: [
        {
          id: humanityRequestId ? Number(humanityRequestId) : 1,
          circuitId: "credentialAtomicQuerySigV2",
          query: {
            allowedIssuers: ["*"],
            type: "LivenessCredential",
            context: "ipfs://QmcomGJQwJDCg3RE6FjsFYCjjMSTWJXY3fUWeq43Mc5CCJ",
            credentialSubject: {
              // Liveness credential usually just checks existence/possession, 
              // but we can add specific checks if needed. 
              // For now, just checking possession of the credential is enough.
            }
          }
        }
      ]
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-display font-bold">Self-Sovereign Identity</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Verify that you're a real human, over 18, and allowed to use certain corridors – without ever handing over raw documents to PayRoute.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Your Status */}
        <div className="space-y-6">
          <Card className="p-6 glass-card">
            <h2 className="font-display text-xl font-bold mb-6">Your Status</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isHuman ? 'bg-secondary/20' : 'bg-muted'}`}>
                    {isHuman ? <CheckCircle2 className="w-5 h-5 text-secondary" /> : <XCircle className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <div>
                    <p className="font-medium">Human Verification</p>
                    <p className="text-xs text-muted-foreground">Proof of personhood</p>
                  </div>
                </div>
                {isHuman ? (
                  <Badge className="bg-secondary/20 text-secondary border-secondary/30">Verified</Badge>
                ) : (
                  <Badge variant="secondary">Not Verified</Badge>
                )}
              </div>

              {/* Age Verification */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/50 opacity-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Age Check</p>
                    <p className="text-xs text-muted-foreground">18+ verification (Coming Soon)</p>
                  </div>
                </div>
                <Badge variant="secondary">Not Verified</Badge>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-3">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Powered by open-source ZK identity tooling. Your credentials stay in your own wallet.
                </p>
              </div>
              {!isHuman && (
                <div className="space-y-3">
                  <Button className="w-full" onClick={() => setShowQR(true)} disabled={!isConnected}>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    {isConnected ? 'Verify with Privado ID' : 'Connect Wallet to Verify'}
                  </Button>
                  <div className="text-center text-xs text-muted-foreground">
                    Don't have a credential?{' '}
                    <a
                      href="https://web-wallet-demo.privado.id"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      Get Liveness Credential
                    </a>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6 glass-card bg-gradient-to-br from-secondary/10 to-primary/10 border-secondary/20">
            <h3 className="font-display text-lg font-bold mb-4">Current Access</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Global USDC Vault</span>
                <CheckCircle2 className="w-4 h-4 text-secondary" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">LatAm Corridor</span>
                {isHuman ? <CheckCircle2 className="w-4 h-4 text-secondary" /> : <XCircle className="w-4 h-4 text-muted-foreground" />}
              </div>
            </div>
          </Card>
        </div>

        {/* Why This Matters */}
        <div className="space-y-6">
          <Card className="p-6 glass-card">
            <h2 className="font-display text-xl font-bold mb-6">Why This Matters</h2>
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold">No KYC PDFs or Databases</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Never upload your passport or driver's license to a central server. Your documents never leave your control.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold">Prove Facts, Not Identity</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Share only what's needed: "I'm over 18" or "I'm a human" without revealing your name, birthdate, or address.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div >

      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan with Privado ID</DialogTitle>
            <DialogDescription>
              Scan this QR code with your Privado ID mobile app to generate a zero-knowledge proof.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <div className="bg-white p-4 rounded-xl">
              <QRCodeSVG value={qrCodeData} size={256} />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Waiting for verification...
            </p>

          </div>
        </DialogContent>
      </Dialog>
    </motion.div >
  );
}
