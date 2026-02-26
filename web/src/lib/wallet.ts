import { createConfig, http } from 'wagmi';
import { polygon } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
    chains: [polygon],
    transports: {
        [polygon.id]: http('https://polygon-bor-rpc.publicnode.com'),
    },
    connectors: [
        injected(),
    ],
});
