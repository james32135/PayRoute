import { Router } from 'express';
import { z } from 'zod';
import axios from 'axios';

const router: Router = Router();

// LATAM currencies and corridors
const LATAM_CURRENCIES = ['BRL', 'MXN', 'ARS', 'COP', 'CLP', 'PEN', 'UYU'];

const CORRIDORS = {
    'latam-brazil': {
        id: 'latam-brazil',
        name: 'Brazil Corridor',
        country: 'Brazil',
        currency: 'BRL',
        flag: '🇧🇷',
        description: 'Send USDC to Brazil, recipient receives BRL equivalent',
        avgFee: '0.3%',
        avgTime: '< 5 seconds',
        monthlyVolume: '$2.4M',
        popularRoutes: ['USA → Brazil', 'EU → Brazil']
    },
    'latam-mexico': {
        id: 'latam-mexico',
        name: 'Mexico Corridor',
        country: 'Mexico',
        currency: 'MXN',
        flag: '🇲🇽',
        description: 'Send USDC to Mexico, recipient receives MXN equivalent',
        avgFee: '0.3%',
        avgTime: '< 5 seconds',
        monthlyVolume: '$3.1M',
        popularRoutes: ['USA → Mexico', 'Canada → Mexico']
    },
    'latam-argentina': {
        id: 'latam-argentina',
        name: 'Argentina Corridor',
        country: 'Argentina',
        currency: 'ARS',
        flag: '🇦🇷',
        description: 'Send USDC to Argentina, recipient receives at blue dollar rate',
        avgFee: '0.5%',
        avgTime: '< 10 seconds',
        monthlyVolume: '$890K',
        popularRoutes: ['USA → Argentina', 'EU → Argentina'],
        note: 'Uses parallel (blue) exchange rate for better value'
    },
    'latam-colombia': {
        id: 'latam-colombia',
        name: 'Colombia Corridor',
        country: 'Colombia',
        currency: 'COP',
        flag: '🇨🇴',
        description: 'Send USDC to Colombia',
        avgFee: '0.4%',
        avgTime: '< 5 seconds',
        monthlyVolume: '$520K',
        popularRoutes: ['USA → Colombia']
    },
    'global': {
        id: 'global',
        name: 'Global Corridor',
        country: 'Worldwide',
        currency: 'USD',
        flag: '🌍',
        description: 'Send USDC globally with lowest fees',
        avgFee: '0.3%',
        avgTime: '< 5 seconds',
        monthlyVolume: '$5.2M',
        popularRoutes: ['Any → Any']
    }
};

// FX rate cache
let fxCache: { rates: Record<string, number>, timestamp: number } | null = null;
const FX_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch FX rates from API
 */
async function fetchFxRates(): Promise<Record<string, number>> {
    // Check cache
    if (fxCache && Date.now() - fxCache.timestamp < FX_CACHE_DURATION) {
        return fxCache.rates;
    }

    try {
        // Using free FX API
        const response = await axios.get(
            'https://api.freecurrencyapi.com/v1/latest',
            {
                params: {
                    apikey: process.env.FX_API_KEY || 'fca_live_demo',
                    base_currency: 'USD',
                    currencies: LATAM_CURRENCIES.join(',') + ',EUR,GBP,PHP,INR'
                },
                timeout: 5000
            }
        );

        const rates = response.data.data || {};

        // Add fallback rates if API fails
        const finalRates = {
            BRL: rates.BRL || 5.05,
            MXN: rates.MXN || 17.25,
            ARS: rates.ARS || 1050, // Official rate
            ARS_BLUE: (rates.ARS || 1050) * 1.35, // Blue dollar ~35% premium
            COP: rates.COP || 4100,
            CLP: rates.CLP || 920,
            PEN: rates.PEN || 3.75,
            UYU: rates.UYU || 39.5,
            EUR: rates.EUR || 0.92,
            GBP: rates.GBP || 0.79,
            PHP: rates.PHP || 56.5,
            INR: rates.INR || 83.5
        };

        fxCache = { rates: finalRates, timestamp: Date.now() };
        return finalRates;

    } catch (error) {
        console.error('[LATAM] FX API error, using fallback rates:', error);

        // Return fallback rates
        return {
            BRL: 5.05,
            MXN: 17.25,
            ARS: 1050,
            ARS_BLUE: 1420,
            COP: 4100,
            CLP: 920,
            PEN: 3.75,
            UYU: 39.5,
            EUR: 0.92,
            GBP: 0.79,
            PHP: 56.5,
            INR: 83.5
        };
    }
}

/**
 * @route GET /api/corridors
 * @desc Get all available corridors
 */
router.get('/', async (req, res) => {
    try {
        const rates = await fetchFxRates();

        const corridorsWithRates = Object.values(CORRIDORS).map(corridor => ({
            ...corridor,
            currentRate: corridor.currency !== 'USD' ? rates[corridor.currency] : 1,
            rateDisplay: corridor.currency !== 'USD'
                ? `1 USD = ${rates[corridor.currency]?.toFixed(2)} ${corridor.currency}`
                : 'USD Stablecoin'
        }));

        res.json({
            corridors: corridorsWithRates,
            lastUpdated: fxCache?.timestamp ? new Date(fxCache.timestamp).toISOString() : new Date().toISOString()
        });

    } catch (error) {
        console.error('[LATAM] Get corridors error:', error);
        res.status(500).json({ error: 'Failed to get corridors' });
    }
});

/**
 * @route GET /api/corridors/:corridorId
 * @desc Get specific corridor details
 */
router.get('/:corridorId', async (req, res) => {
    try {
        const { corridorId } = req.params;
        const corridor = CORRIDORS[corridorId as keyof typeof CORRIDORS];

        if (!corridor) {
            return res.status(404).json({ error: 'Corridor not found' });
        }

        const rates = await fetchFxRates();

        res.json({
            corridor: {
                ...corridor,
                currentRate: corridor.currency !== 'USD' ? rates[corridor.currency] : 1,
                rateDisplay: corridor.currency !== 'USD'
                    ? `1 USD = ${rates[corridor.currency]?.toFixed(2)} ${corridor.currency}`
                    : 'USD Stablecoin',
                // Argentina special: show blue rate
                blueRate: corridor.currency === 'ARS' ? rates['ARS_BLUE'] : null
            }
        });

    } catch (error) {
        console.error('[LATAM] Get corridor error:', error);
        res.status(500).json({ error: 'Failed to get corridor' });
    }
});

/**
 * @route POST /api/corridors/quote
 * @desc Get payment quote for a corridor
 */
const quoteSchema = z.object({
    corridorId: z.string(),
    amountUSD: z.number().positive(),
    recipientCountry: z.string().optional()
});

router.post('/quote', async (req, res) => {
    try {
        const { corridorId, amountUSD, recipientCountry } = quoteSchema.parse(req.body);

        const corridor = CORRIDORS[corridorId as keyof typeof CORRIDORS];
        if (!corridor) {
            return res.status(404).json({ error: 'Corridor not found' });
        }

        const rates = await fetchFxRates();
        const rate = corridor.currency !== 'USD' ? rates[corridor.currency] : 1;
        const blueRate = corridor.currency === 'ARS' ? rates['ARS_BLUE'] : null;

        // Calculate fees
        const protocolFeePercent = corridor.currency === 'ARS' ? 0.5 : 0.3;
        const protocolFee = amountUSD * (protocolFeePercent / 100);
        const networkFee = 0.01; // ~$0.01 on Polygon
        const totalFees = protocolFee + networkFee;
        const amountAfterFees = amountUSD - totalFees;

        // Calculate local currency amount
        const localAmount = amountAfterFees * rate;
        const localAmountBlue = blueRate ? amountAfterFees * blueRate : null;

        // Compare with traditional remittance
        const westernUnionFee = amountUSD * 0.065; // ~6.5% 
        const wiseFee = amountUSD * 0.035; // ~3.5%
        const savingsVsWU = westernUnionFee - totalFees;
        const savingsVsWise = wiseFee - totalFees;

        res.json({
            quote: {
                corridorId,
                amountUSD,
                amountAfterFees,
                localAmount: localAmount.toFixed(2),
                localCurrency: corridor.currency,
                localAmountBlue: localAmountBlue?.toFixed(2) || null,
                fees: {
                    protocol: protocolFee.toFixed(4),
                    network: networkFee.toFixed(4),
                    total: totalFees.toFixed(4),
                    percentage: `${protocolFeePercent}%`
                },
                rate: rate.toFixed(4),
                blueRate: blueRate?.toFixed(2) || null,
                estimatedTime: corridor.avgTime,
                comparison: {
                    westernUnion: {
                        fee: westernUnionFee.toFixed(2),
                        savings: savingsVsWU.toFixed(2),
                        savingsPercent: ((savingsVsWU / westernUnionFee) * 100).toFixed(1) + '%'
                    },
                    wise: {
                        fee: wiseFee.toFixed(2),
                        savings: savingsVsWise.toFixed(2),
                        savingsPercent: ((savingsVsWise / wiseFee) * 100).toFixed(1) + '%'
                    }
                },
                display: {
                    youSend: `$${amountUSD.toFixed(2)} USD`,
                    theyReceive: `${corridor.flag} ${localAmount.toFixed(2)} ${corridor.currency}`,
                    theyReceiveBlue: localAmountBlue ? `${corridor.flag} ${localAmountBlue.toFixed(2)} ${corridor.currency} (blue rate)` : null
                }
            },
            validFor: 60, // seconds
            expiresAt: new Date(Date.now() + 60000).toISOString()
        });

    } catch (error) {
        console.error('[LATAM] Quote error:', error);
        res.status(400).json({ error: 'Invalid request' });
    }
});

/**
 * @route GET /api/corridors/fx/rates
 * @desc Get current FX rates for all LATAM currencies
 */
router.get('/fx/rates', async (req, res) => {
    try {
        const rates = await fetchFxRates();

        const formattedRates = Object.entries(rates).map(([currency, rate]) => ({
            currency,
            rate: rate as number,
            display: `1 USD = ${(rate as number).toFixed(2)} ${currency}`,
            flag: getFlagForCurrency(currency)
        }));

        res.json({
            base: 'USD',
            rates: formattedRates,
            lastUpdated: fxCache?.timestamp ? new Date(fxCache.timestamp).toISOString() : new Date().toISOString()
        });

    } catch (error) {
        console.error('[LATAM] FX rates error:', error);
        res.status(500).json({ error: 'Failed to get FX rates' });
    }
});

/**
 * @route GET /api/corridors/stats
 * @desc Get corridor statistics
 */
router.get('/stats/overview', async (req, res) => {
    try {
        // In production, aggregate from database
        const stats = {
            totalVolume24h: '$142,350',
            totalTransactions24h: 847,
            avgTransactionSize: '$168',
            topCorridor: 'Mexico',
            avgSavingsVsBanks: '72%',
            corridorBreakdown: [
                { corridor: 'Mexico', volume: '$52,400', percentage: 36.8 },
                { corridor: 'Brazil', volume: '$45,200', percentage: 31.8 },
                { corridor: 'Argentina', volume: '$22,100', percentage: 15.5 },
                { corridor: 'Colombia', volume: '$12,650', percentage: 8.9 },
                { corridor: 'Global', volume: '$10,000', percentage: 7.0 }
            ]
        };

        res.json(stats);

    } catch (error) {
        console.error('[LATAM] Stats error:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

// Helper function
function getFlagForCurrency(currency: string): string {
    const flags: Record<string, string> = {
        BRL: '🇧🇷',
        MXN: '🇲🇽',
        ARS: '🇦🇷',
        ARS_BLUE: '🇦🇷',
        COP: '🇨🇴',
        CLP: '🇨🇱',
        PEN: '🇵🇪',
        UYU: '🇺🇾',
        EUR: '🇪🇺',
        GBP: '🇬🇧',
        PHP: '🇵🇭',
        INR: '🇮🇳',
        USD: '🇺🇸'
    };
    return flags[currency] || '🌍';
}

export default router;
