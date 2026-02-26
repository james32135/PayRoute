import { Router } from 'express';

const router: Router = Router();

import { prisma } from '../lib/db';

const VAULT_DATA = [
    {
        id: "vault-1",
        name: "Global USDC Vault",
        apy: 4.3,
        tvl: 2400000,
        utilization: 68,
        address: "0x742d35Cc6634C0532925a3b844Bc9e7595f11989" // Mock Vault Address
    },
    {
        id: "vault-2",
        name: "LatAm Remittance Vault",
        apy: 5.1,
        tvl: 820000,
        utilization: 45,
        address: "0x1234567890123456789012345678901234567890" // Mock Vault Address
    }
];

router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        console.log(`[Vaults] Fetching vaults for user: ${userId}`);

        let userPositions: Record<string, number> = {};

        if (userId && typeof userId === 'string') {
            const normalizedUserId = userId.toLowerCase();

            // Find user first
            const user = await prisma.user.findUnique({
                where: { address: normalizedUserId }
            });

            if (user) {
                const positions = await prisma.vaultPosition.findMany({
                    where: { userId: user.id }
                });
                console.log(`[Vaults] Found positions:`, positions);
                positions.forEach(p => {
                    userPositions[p.vaultId] = p.balance;
                });
            }
        }

        const response = VAULT_DATA.map(vault => {
            // Ensure vault address is compared in lowercase
            const vaultAddressLower = vault.address.toLowerCase();
            return {
                ...vault,
                userBalance: userPositions[vaultAddressLower] || 0
            };
        });

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
