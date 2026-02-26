import { Router } from 'express';
import { z } from 'zod';

const router: Router = Router();

// Agent policy schema
const createAgentSchema = z.object({
    agentAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    maxAmountPerTx: z.string(),
    maxDailyAmount: z.string(),
    allowedRecipients: z.array(z.string().regex(/^0x[a-fA-F0-9]{40}$/)).optional(),
    durationDays: z.number().optional()
});

const executePaymentSchema = z.object({
    ownerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    recipientAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    tokenAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    amount: z.string(),
    memo: z.string().optional()
});

// In-memory store for demo (use DB in production)
const agentPolicies: Map<string, any[]> = new Map();

/**
 * @route POST /api/agents/create
 * @desc Create an AI payment agent policy
 */
router.post('/create', async (req, res) => {
    try {
        const data = createAgentSchema.parse(req.body);
        const { agentAddress, maxAmountPerTx, maxDailyAmount, allowedRecipients, durationDays } = data;
        
        // Get owner from header or body (in production, verify signature)
        const ownerAddress = req.headers['x-owner-address'] as string || req.body.ownerAddress;
        
        if (!ownerAddress) {
            return res.status(400).json({ error: 'Owner address required' });
        }

        const policy = {
            id: `agent-${Date.now()}`,
            agent: agentAddress,
            owner: ownerAddress.toLowerCase(),
            maxAmountPerTx,
            maxDailyAmount,
            dailySpent: '0',
            allowedRecipients: allowedRecipients || [],
            isActive: true,
            createdAt: new Date().toISOString(),
            expiresAt: durationDays ? new Date(Date.now() + durationDays * 86400000).toISOString() : null
        };

        // Store policy
        const key = ownerAddress.toLowerCase();
        const userPolicies = agentPolicies.get(key) || [];
        userPolicies.push(policy);
        agentPolicies.set(key, userPolicies);

        console.log(`[Agent] Created agent ${agentAddress} for owner ${ownerAddress}`);

        res.json({
            success: true,
            policy,
            message: 'Agent policy created. Approve tokens on-chain to enable payments.'
        });

    } catch (error) {
        console.error('[Agent] Create error:', error);
        res.status(400).json({ error: 'Invalid request' });
    }
});

/**
 * @route GET /api/agents/:ownerAddress
 * @desc Get all agents for a user
 */
router.get('/:ownerAddress', async (req, res) => {
    try {
        const { ownerAddress } = req.params;
        const key = ownerAddress.toLowerCase();
        const policies = agentPolicies.get(key) || [];
        
        // Filter active policies
        const activePolicies = policies.filter(p => p.isActive);
        
        res.json({
            agents: activePolicies,
            count: activePolicies.length
        });

    } catch (error) {
        console.error('[Agent] Get error:', error);
        res.status(500).json({ error: 'Failed to get agents' });
    }
});

/**
 * @route POST /api/agents/execute
 * @desc Execute a payment through an agent
 */
router.post('/execute', async (req, res) => {
    try {
        const data = executePaymentSchema.parse(req.body);
        const agentAddress = req.headers['x-agent-address'] as string;
        
        if (!agentAddress) {
            return res.status(400).json({ error: 'Agent address required in header' });
        }

        const { ownerAddress, recipientAddress, tokenAddress, amount, memo } = data;
        
        // Verify agent policy exists and is active
        const key = ownerAddress.toLowerCase();
        const policies = agentPolicies.get(key) || [];
        const policy = policies.find(p => 
            p.agent.toLowerCase() === agentAddress.toLowerCase() && p.isActive
        );
        
        if (!policy) {
            return res.status(403).json({ error: 'Agent not authorized for this owner' });
        }

        // Check expiration
        if (policy.expiresAt && new Date(policy.expiresAt) < new Date()) {
            return res.status(403).json({ error: 'Agent policy expired' });
        }

        // Check amount limits
        const amountNum = parseFloat(amount);
        if (amountNum > parseFloat(policy.maxAmountPerTx)) {
            return res.status(403).json({ error: 'Amount exceeds per-transaction limit' });
        }

        const newDailySpent = parseFloat(policy.dailySpent) + amountNum;
        if (newDailySpent > parseFloat(policy.maxDailyAmount)) {
            return res.status(403).json({ error: 'Amount exceeds daily limit' });
        }

        // Check recipient whitelist
        if (policy.allowedRecipients.length > 0) {
            const isAllowed = policy.allowedRecipients.some(
                (r: string) => r.toLowerCase() === recipientAddress.toLowerCase()
            );
            if (!isAllowed) {
                return res.status(403).json({ error: 'Recipient not in whitelist' });
            }
        }

        // Update daily spent
        policy.dailySpent = newDailySpent.toString();

        // Return transaction data for on-chain execution
        res.json({
            success: true,
            approved: true,
            transaction: {
                owner: ownerAddress,
                recipient: recipientAddress,
                token: tokenAddress,
                amount,
                memo: memo || '',
                agentPolicy: {
                    remainingDaily: (parseFloat(policy.maxDailyAmount) - newDailySpent).toString(),
                    maxPerTx: policy.maxAmountPerTx
                }
            },
            message: 'Payment approved. Execute on-chain transaction.'
        });

    } catch (error) {
        console.error('[Agent] Execute error:', error);
        res.status(400).json({ error: 'Invalid request' });
    }
});

/**
 * @route POST /api/agents/revoke
 * @desc Revoke an agent's permission
 */
router.post('/revoke', async (req, res) => {
    try {
        const { ownerAddress, agentAddress } = req.body;
        
        const key = ownerAddress.toLowerCase();
        const policies = agentPolicies.get(key) || [];
        const policy = policies.find(p => 
            p.agent.toLowerCase() === agentAddress.toLowerCase()
        );
        
        if (!policy) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        policy.isActive = false;

        console.log(`[Agent] Revoked agent ${agentAddress} for owner ${ownerAddress}`);

        res.json({
            success: true,
            message: 'Agent revoked successfully'
        });

    } catch (error) {
        console.error('[Agent] Revoke error:', error);
        res.status(500).json({ error: 'Failed to revoke agent' });
    }
});

/**
 * @route GET /api/agents/policy/:ownerAddress/:agentAddress
 * @desc Get specific agent policy details
 */
router.get('/policy/:ownerAddress/:agentAddress', async (req, res) => {
    try {
        const { ownerAddress, agentAddress } = req.params;
        
        const key = ownerAddress.toLowerCase();
        const policies = agentPolicies.get(key) || [];
        const policy = policies.find(p => 
            p.agent.toLowerCase() === agentAddress.toLowerCase()
        );
        
        if (!policy) {
            return res.status(404).json({ error: 'Policy not found' });
        }

        res.json({
            policy,
            status: {
                isActive: policy.isActive,
                isExpired: policy.expiresAt ? new Date(policy.expiresAt) < new Date() : false,
                remainingDaily: (parseFloat(policy.maxDailyAmount) - parseFloat(policy.dailySpent)).toString()
            }
        });

    } catch (error) {
        console.error('[Agent] Get policy error:', error);
        res.status(500).json({ error: 'Failed to get policy' });
    }
});

export default router;
