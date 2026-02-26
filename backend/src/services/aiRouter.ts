import { config } from '../config/env';
import axios from 'axios';

export interface RouteOption {
    id: string;
    aggregator: string;
    path: string[];
    estimatedGas: string;
    estimatedSlippage: number;
    expectedOutput: string;
}

export interface RouteEvaluation {
    routeId: string;
    score: number;
    reasoning: string;
}

export async function scoreRouteWithAI(route: RouteOption, context: any): Promise<RouteEvaluation> {
    if (config.AI_PROVIDER === 'openai' && config.AI_API_KEY) {
        try {
            const prompt = `
        Evaluate this payment route on Polygon:
        - Aggregator: ${route.aggregator}
        - Path: ${route.path.join(' -> ')}
        - Gas: ${route.estimatedGas}
        - Slippage: ${route.estimatedSlippage}
        
        Return a JSON object with:
        - score (0-100)
        - reasoning (short sentence)
      `;

            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.3
            }, {
                headers: { 'Authorization': `Bearer ${config.AI_API_KEY}` }
            });

            const content = response.data.choices[0].message.content;
            // Simple parsing
            const json = JSON.parse(content.replace(/```json/g, '').replace(/```/g, ''));

            return {
                routeId: route.id,
                score: json.score || 85,
                reasoning: json.reasoning || "AI analyzed route efficiency."
            };
        } catch (e) {
            console.error("AI Error", e);
        }
    }

    // Fallback heuristic
    const gasScore = 100 - (Number(route.estimatedGas) / 100000);
    const slippageScore = 100 - (route.estimatedSlippage * 100);
    const score = (gasScore + slippageScore) / 2;

    return {
        routeId: route.id,
        score: Math.min(Math.max(score, 0), 100),
        reasoning: "Scored based on gas and slippage heuristics (Fallback)",
    };
}
