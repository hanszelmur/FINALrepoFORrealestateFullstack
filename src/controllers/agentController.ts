import { Response } from 'express';
import * as agentService from '../services/agentService';
import { AuthRequest } from '../types';

export const getAllAgents = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const agents = await agentService.getAllAgents();
        res.json(agents);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getAgentById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const agent = await agentService.getAgentById(id);

        if (!agent) {
            res.status(404).json({ error: 'Agent not found' });
            return;
        }

        res.json(agent);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getAgentStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const agentId = req.query.agent_id ? parseInt(req.query.agent_id as string) : undefined;
        const stats = await agentService.getAgentStats(agentId);
        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
