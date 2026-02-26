import { Router } from 'express';

const router: Router = Router();

import { db } from '../lib/db';

const VAULT_DATA = [
    {
        id: "vault-payroute",
        name: "PayRoute USDC Vault",
        apy: 4.8,
        tvl: 0,
        utilization: 0,
        address: "0x86442aF11147A4b32c5577cC701899e7696ca290",
        symbol: "prUSDC",
        network: "Polygon"
    }
];

router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        console.log(`[Vaults] Fetching vaults for user: ${userId}`);

        let userPositions: Record<string, number> = {};

        if (userId && typeof userId === 'string') {
            const normalizedUserId = userId.toLowerCase();
            const user = db.findUserByAddress(normalizedUserId);
            if (user) {
                const positions = db.getVaultPositions(user.id);
                positions.forEach(p => {
                    userPositions[p.vaultId] = p.balance;
                });
            }
        }

        const response = VAULT_DATA.map(vault => ({
            ...vault,
            userBalance: userPositions[vault.address.toLowerCase()] || 0
        }));

        res.json(response);
    } catch (error) {
        console.error("Vaults fetch error:", error);
        res.status(500).json({ error: "Failed to fetch vaults" });
    }
});

router.post('/withdraw', async (req, res) => {
    try {
        const { userId, vaultAddress, amount } = req.body;

        const pos = db.findVaultPosition(userId, vaultAddress);
        if (!pos || pos.balance < parseFloat(amount)) {
            return res.status(400).json({ error: "Insufficient balance" });
        }

        db.decrementVaultPosition(userId, vaultAddress, parseFloat(amount));

        db.createTransaction({
            hash: `withdraw-${Date.now()}`,
            from: vaultAddress,
            to: userId,
            amount: parseFloat(amount),
            asset: 'USDC',
            type: 'withdraw',
            status: 'completed',
            userId: null
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Withdraw error:", error);
        res.status(500).json({ error: "Withdrawal failed" });
    }
});

export default router;
