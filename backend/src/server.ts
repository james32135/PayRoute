import express, { Application } from 'express';
import cors from 'cors';
import { config } from './config/env';
import paymentRoutes from './routes/payments';
import vaultRoutes from './routes/vaults';
import analyticsRoutes from './routes/analytics';
import identityRoutes from './routes/identity';
import agentRoutes from './routes/agents';
import corridorRoutes from './routes/corridors';

const app: Application = express();
const port = config.PORT;

// CORS configuration – allow Netlify + Render + local
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:8080',
    process.env.FRONTEND_URL,                       // set in Render env
].filter(Boolean) as string[];

const corsOptions = {
    origin: (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
        // allow requests with no origin (mobile, curl, etc)
        if (!origin) return cb(null, true);
        if (allowedOrigins.some(o => origin.startsWith(o)) || origin.endsWith('.netlify.app'))
            return cb(null, true);
        cb(new Error('CORS not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-owner-address', 'x-agent-address']
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: "ok", network: config.POLYGON_CHAIN_ID, version: "wave4" });
});

app.use('/api/payments', paymentRoutes);
app.use('/api/vaults', vaultRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/identity', identityRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/corridors', corridorRoutes);

// Export for Vercel serverless
export default app;

// Local development server
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}
