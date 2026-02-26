import { Router } from 'express';

const router: Router = Router();

import { prisma } from '../lib/db';

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
            try {
                const normalizedUserId = userId.toLowerCase();
                const user = await prisma.user.findUnique({
                    where: { address: normalizedUserId }
                });
                if (user) {
                    const positions = await prisma.vaultPosition.findMany({
                        where: { userId: user.id }
                    });
                    positions.forEach(p => {
                        userPositions[p.vaultId] = p.balance;
                    });
                }
            } catch (dbError) {
                console.log('[Vaults] DB query skipped:', (dbError as any).message?.slice(0, 80));
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

        const position = await prisma.vaultPosition.findUnique({
            where: {
                userId_vaultId: {
                    userId,
                    vaultId: vaultAddress
                }
            }
        });

        if (!position || position.balance < parseFloat(amount)) {
            return res.status(400).json({ error: "Insufficient balance" });
        }

        await prisma.vaultPosition.update({
            where: {
                userId_vaultId: {
                    userId,
                    vaultId: vaultAddress
                }
            },
            data: {
                balance: { decrement: parseFloat(amount) }
            }
        });

        // Record transaction
        await prisma.transaction.create({
            data: {
                hash: `mock-withdraw-${Date.now()}`,
                from: vaultAddress,
                to: userId,
                amount: parseFloat(amount),
                asset: 'USDC',
                type: 'withdraw',
                status: 'completed'
            }
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Withdraw error:", error);
        res.status(500).json({ error: "Withdrawal failed" });
    }
});

export default router;
