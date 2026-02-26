import { Router } from 'express';

const router: Router = Router();

import { db } from '../lib/db';

router.get('/summary', async (req, res) => {
    try {
        const { userId } = req.query;
        const normalizedUserId = typeof userId === 'string' ? userId.toLowerCase() : undefined;

        // 1. Total Sent
        const totalSent = normalizedUserId
            ? db.sumTransactions({ from: normalizedUserId, type: 'send', status: 'completed' })
            : db.sumTransactions({ type: 'send', status: 'completed' });

        // 2. Active Vault Deposits
        let activeVaultDeposits = 0;
        if (normalizedUserId) {
            const user = db.findUserByAddress(normalizedUserId);
            if (user) activeVaultDeposits = db.sumVaultBalance(user.id);
        } else {
            activeVaultDeposits = db.sumVaultBalance();
        }

        // 3. Recent Activity
        const recentActivity = normalizedUserId
            ? db.getTransactionsForUser(normalizedUserId).slice(0, 10)
            : db.getTransactions().slice(0, 10);

        // 4. Unique recipients
        const uniqueRecipientsCount = normalizedUserId
            ? db.uniqueRecipients({ from: normalizedUserId, type: 'send', status: 'completed' })
            : db.uniqueRecipients({ type: 'send', status: 'completed' });

        res.json({
            totalSent,
            avgFeeSaved: 72,
            activeVaultDeposits,
            recentActivity: recentActivity.map(tx => ({
                id: tx.id,
                type: tx.type,
                counterparty: tx.type === 'send' ? tx.to : tx.from,
                amount: `${tx.amount.toFixed(2)} ${tx.asset}`,
                status: tx.status,
                timestamp: new Date(tx.timestamp).toLocaleDateString()
            })),
            analytics: {
                totalVolume: totalSent,
                uniqueRecipients: uniqueRecipientsCount,
                savings: 72
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
