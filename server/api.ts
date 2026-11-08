import express from 'express';
import { geminiService } from './gemini';

const router = express.Router();

router.post('/vet/chat', async (req, res) => {
  try {
    const { history, message, language } = req.body;
    const response = await geminiService.chatWithVet(history, message, language);
    res.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to chat with AI Vet' });
  }
});

router.post('/food/analyze', async (req, res) => {
  try {
    const { images, language } = req.body; // Array of { mimeType, data }
    const result = await geminiService.analyzeFood(images, language);
    res.json(result);
  } catch (error) {
    console.error('Food analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze pet food' });
  }
});

export default router;
