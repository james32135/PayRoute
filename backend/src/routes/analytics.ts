import { Router } from 'express';

const router: Router = Router();

import { prisma } from '../lib/db';

router.get('/summary', async (req, res) => {
    try {
        const { userId } = req.query;
        const normalizedUserId = typeof userId === 'string' ? userId.toLowerCase() : undefined;

        // Base filter
        const txFilter = normalizedUserId ? {
            OR: [
                { from: normalizedUserId },
                { to: normalizedUserId }
            ]
        } : {};

        const sentFilter = normalizedUserId ? { from: normalizedUserId, type: 'send', status: 'completed' } : { type: 'send', status: 'completed' };

        // 1. Total Sent
        const totalSentAgg = await prisma.transaction.aggregate({
            where: sentFilter,
            _sum: { amount: true }
        });
        const totalSent = totalSentAgg._sum.amount ? totalSentAgg._sum.amount : 0;

        // 2. Active Vault Deposits
        let activeVaultDeposits = 0;
        if (normalizedUserId) {
            // Need to find User ID first to query VaultPosition
            const user = await prisma.user.findUnique({ where: { address: normalizedUserId } });
            if (user) {
                const depositsAgg = await prisma.vaultPosition.aggregate({
                    where: { userId: user.id },
                    _sum: { balance: true }
                });
                activeVaultDeposits = depositsAgg._sum.balance ? depositsAgg._sum.balance : 0;
            }
        } else {
            // Global deposits
            const depositsAgg = await prisma.vaultPosition.aggregate({
                _sum: { balance: true }
            });
            activeVaultDeposits = depositsAgg._sum.balance ? depositsAgg._sum.balance : 0;
        }

        // 3. Recent Activity
        const recentActivity = await prisma.transaction.findMany({
            where: txFilter,
            orderBy: { timestamp: 'desc' },
            take: 10
        });

        // 4. Analytics Page Metrics
        // Unique recipients (proxy for "People/Countries Reached")
        const uniqueRecipients = await prisma.transaction.groupBy({
            by: ['to'],
            where: sentFilter,
        });

        res.json({
            totalSent,
            avgFeeSaved: 72, // Mocked for now
            activeVaultDeposits,
            recentActivity: recentActivity.map(tx => ({
                id: tx.id,
                type: tx.type,
                counterparty: tx.type === 'send' ? tx.to : tx.from,
                amount: `${tx.amount.toFixed(2)} ${tx.asset}`,
                status: tx.status,
                timestamp: new Date(tx.timestamp).toLocaleDateString() // Simple formatting
            })),
            analytics: {
                totalVolume: totalSent,
                uniqueRecipients: uniqueRecipients.length,
                savings: 72 // Mocked
            },
            stories: [
                "Ali sends $200/month home with 70% lower fees.",
                "A small dev shop pays 5 contractors across 3 countries."
            ]
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

export default router;
