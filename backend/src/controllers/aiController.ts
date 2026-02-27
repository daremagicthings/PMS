import { Request, Response } from 'express';
import { getChatResponse } from '../services/aiService';

export const chatWithAi = async (req: Request, res: Response) => {
    try {
        const { prompt } = req.body;
        const organizationId = (req as any).user?.organizationId;

        if (!prompt) {
            return res.status(400).json({ success: false, message: 'Prompt is required' });
        }

        const reply = await getChatResponse(prompt, organizationId);
        
        res.json({ success: true, data: { reply } });
    } catch (error: any) {
        console.error('chatWithAi error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to get AI response' });
    }
};
