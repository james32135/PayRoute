import { Router } from 'express';

const router: Router = Router();

// In-memory store for demo
const verifiedUsers = new Set<string>();

router.post('/mark-verified', (req, res) => {
    const { address } = req.body;
    if (address) {
        verifiedUsers.add(address.toLowerCase());
        res.json({ success: true });
    } else {
        res.status(400).json({ error: "Address required" });
    }
});

router.get('/status/:address', (req, res) => {
    const { address } = req.params;
    const isVerified = verifiedUsers.has(address.toLowerCase());
    res.json({
        human: isVerified,
        age: isVerified, // Mock: if human verified, assume age verified for demo
        region: true
    });
});

export default router;
