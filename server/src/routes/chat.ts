import { Router } from 'express';
import { POLARGUARD_SYSTEM_PROMPT } from '../knowledge/system_prompt.js';

const router = Router();

router.post('/chat', async (req, res, next) => {
  try {
    const rawMessages = req.body?.messages || [];
    let replyText = '';

    // ─── 1. Primary AI Provider: xAI Grok API ─────────────────────
    const xaiApiKey = process.env.XAI_API_KEY ? process.env.XAI_API_KEY.trim() : '';
    if (xaiApiKey) {
      const grokMessages = [
        { role: 'system', content: POLARGUARD_SYSTEM_PROMPT },
        ...rawMessages
          .map((m: any) => {
            const content = String(m.text || m.content || '').trim();
            const role = m.role === 'user' || m.type === 'user' ? 'user' : 'assistant';
            return { role, content };
          })
          .filter((m: any) => m.content.length > 0),
      ];

      if (grokMessages.length === 1) {
        grokMessages.push({ role: 'user', content: 'Hello, what auto insurance services do you offer?' });
      }

      const grokModels = ['grok-2', 'grok-2-1212', 'grok-beta', 'grok-2-latest'];
      for (const grokModel of grokModels) {
        try {
          const grokRes = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${xaiApiKey}`,
            },
            body: JSON.stringify({
              model: grokModel,
              messages: grokMessages,
              temperature: 0.7,
              max_tokens: 600,
              stream: false,
            }),
          });

          if (grokRes.ok) {
            const grokData = await grokRes.json();
            replyText = grokData.choices?.[0]?.message?.content || '';
            if (replyText) {
              console.log(`[chat-route] Responded via xAI Grok (${grokModel})`);
              break;
            }
          }
        } catch (e) {}
      }
    }

    // ─── 2. Fallback AI Provider: Google Gemini API ────────────────
    if (!replyText) {
      const geminiApiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '';
      if (geminiApiKey) {
        const contents = rawMessages
          .map((m: any) => {
            const textVal = String(m.text || m.content || '').trim();
            const roleVal = m.role === 'user' || m.type === 'user' ? 'user' : 'model';
            return {
              role: roleVal,
              parts: [{ text: textVal }],
            };
          })
          .filter((m: any) => m.parts[0].text.length > 0);

        if (contents.length === 0) {
          contents.push({
            role: 'user',
            parts: [{ text: 'Hello, what auto insurance services do you offer?' }],
          });
        }

        const modelsToTry = ['gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-2.5-flash'];

        for (const modelName of modelsToTry) {
          try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`;
            const geminiRes = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                systemInstruction: {
                  parts: [{ text: POLARGUARD_SYSTEM_PROMPT }],
                },
                contents,
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 600,
                },
              }),
            });

            if (geminiRes.ok) {
              const data = await geminiRes.json();
              replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
              if (replyText) {
                console.log(`[chat-route] Responded via Gemini API (${modelName})`);
                break;
              }
            }
          } catch (e) {}
        }
      }
    }

    if (!replyText) {
      res.status(503).json({
        error: 'AI Provider is temporarily unavailable. Please verify API key credits.',
      });
      return;
    }

    res.json({ text: replyText });
  } catch (err) {
    next(err);
  }
});

export default router;
