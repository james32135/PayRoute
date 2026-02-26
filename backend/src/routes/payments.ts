import { Router } from 'express';
import { z } from 'zod';
import { fxClient, defiAggregatorClient } from '../lib/integrations';
import { scoreRouteWithAI } from '../services/aiRouter';

const router: Router = Router();

const quoteSchema = z.object({
    amount: z.string(),
    asset: z.string(),
    recipientType: z.enum(['address', 'username', 'link']),
    routePreference: z.enum(['ai', 'cheapest', 'fastest']).optional()
});

router.post('/quote', async (req, res) => {
    try {
        const { amount, asset, recipientType } = quoteSchema.parse(req.body);

        // 1. Get FX rates
        const fxRates = await fxClient.getFxRates('USD', ['EUR', 'BRL']);

        // 2. Get DeFi Quote (Mocking toToken as same asset for now, or USDC->USDC transfer)
        // In reality, we might swap if asset != USDC
        const quote = await defiAggregatorClient.getQuote({
            fromToken: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", // USDC
            toToken: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
            amount
        });

        // 3. AI Scoring & Strategy Adjustment
        const isFastest = req.body.routePreference === 'fastest';

        // Simulate different routes based on strategy
        const estimatedNetworkFee = isFastest ? "0.15" : "0.05"; // Faster is more expensive
        const estimatedTime = isFastest ? "~5s" : "~30s";        // Faster is quicker
        const aiScore = isFastest ? 92 : 98;                     // Score might vary

        const routeOption = {
            id: isFastest ? "route-fast-1" : "route-cheap-1",
            aggregator: isFastest ? "Uniswap" : "1inch",
            path: ["USDC"],
            estimatedGas: quote.estimatedGas || "100000",
            estimatedSlippage: 0.01,
            expectedOutput: quote.toAmount || amount
        };

        const aiEvaluation = await scoreRouteWithAI(routeOption, {});

        res.json({
            estimatedNetworkFee,
            estimatedDappFee: "0.10",
            estimatedSlippage: "0.01%",
            estimatedTime, // Pass this back to frontend
            routeId: routeOption.id,
            routeDescription: isFastest ? "Direct Polygon -> Uniswap -> Recipient" : "Direct Polygon -> 1inch -> Recipient",
            aiScore: aiScore, // Use simulated score for distinctness
            fiatEstimates: {
                EUR: (Number(amount) * fxRates.EUR).toFixed(2),
                BRL: (Number(amount) * fxRates.BRL).toFixed(2)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Invalid request" });
    }
});

router.post('/resolve-username', (req, res) => {
    const { username } = req.body;
    // Mock resolution
    if (username === 'maria_santos') {
        return res.json({ address: '0x742d35Cc6634C0532925a3b844Bc9e7595f11989' });
    }
    res.json({ address: null });
});

import { db } from '../lib/db';

router.post('/record', async (req, res) => {
    try {
        const { hash, from, to, amount, asset, type } = req.body;

        console.log(`[Payment] Recording transaction: ${type} ${amount} ${asset} from ${from} to ${to}`);

        const normalizedFrom = from.toLowerCase();
        const normalizedTo = to.toLowerCase();

        const transaction = db.createTransaction({
            hash,
            from: normalizedFrom,
            to: normalizedTo,
            amount: parseFloat(amount),
            asset,
            type: type || 'send',
            status: 'completed',
            userId: null
        });

        // Update vault position if it's a deposit
        if (type === 'deposit') {
            console.log(`[Payment] Updating vault position for ${normalizedFrom} in ${normalizedTo}`);
            const user = db.upsertUser(normalizedFrom);
            db.upsertVaultPosition(user.id, normalizedTo, parseFloat(amount));
        }

        res.json({ success: true, transaction });
    } catch (error) {
        console.error('Transaction recording error:', error);
        res.status(500).json({ error: 'Failed to record transaction' });
    }
});

export default router;
