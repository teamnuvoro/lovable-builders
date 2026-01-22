
import express from 'express';
import axios from 'axios';

const router = express.Router();

const BOLNA_API_KEY = process.env.BOLNA_API_KEY;
const BOLNA_API_URL = 'https://api.bolna.ai/agent';

router.post('/api/bolna/agent', async (req, res) => {
    try {
        if (!BOLNA_API_KEY) {
            return res.status(500).json({ error: 'Bolna API Key not configured' });
        }

        // 1. Create or Get Agent Configuration
        // Wrapped in agent_config as per validation error
        const agentPayload = {
            agent_config: {
                agent_name: "Riya",
                agent_welcome_message: "Hello, I am Riya. How can I help you?",
                tasks: [
                    {
                        task_type: "conversation",
                        toolchain: {
                            execution: "parallel",
                            pipelines: [
                                [
                                    {
                                        name: "llm",
                                        model: "gpt-3.5-turbo",
                                        provider: "openai"
                                    }
                                ]
                            ]
                        }
                    }
                ]
            }
        };

        const response = await axios.post(BOLNA_API_URL, agentPayload, {
            headers: {
                'Authorization': `Bearer ${BOLNA_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    } catch (error: any) {
        console.error('Bolna API Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to create/fetch Bolna agent', details: error.response?.data });
    }
});

export default router;
