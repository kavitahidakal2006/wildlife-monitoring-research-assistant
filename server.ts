import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    const aiConnected = Boolean(getGeminiClient());
    res.json({
      ok: true,
      aiConnected,
      model: aiConnected ? 'gemini-4-hydrogen' : null,
    });
  });

  app.post('/api/analyze', async (req: Request, res: Response) => {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'AI backend not connected. Configure GEMINI_API_KEY in Secrets to enable live camera-trap vision analysis.',
        code: 'BACKEND_NOT_CONNECTED',
      });
      return;
    }

    const body = req.body as {
      imageBase64?: string;
      mimeType?: string;
      filename?: string;
    };

    if (!body?.imageBase64) {
      res.status(400).json({ error: 'Missing imageBase64 payload.' });
      return;
    }

    const cleanBase64 = body.imageBase64.includes(',')
      ? body.imageBase64.split(',')[1]
      : body.imageBase64;
    const mimeType = body.mimeType || 'image/jpeg';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            {
              text: [
                'Analyse this wildlife camera-trap photograph for ecological research.',
                'Supported primary wildlife species: Bengal Tiger, Asian Elephant, Indian Leopard, Spotted Deer, Wild Boar, Indian Gaur, Sloth Bear.',
                'If another clearly identifiable wild species is present, name it concisely. If no animal is present, classify as Empty Frame. If humans or vehicles are present, classify as Human / Vehicle. If motion blur or foliage obscures the subject, classify as Unclear.',
                'Provide an honest confidence percentage (0-100) and a brief 1-sentence field observation note.',
              ].join(' '),
            },
          ],
        },
        config: {
          systemInstruction:
            'You are a careful wildlife camera-trap image classifier assisting conservation biologists. Never guess with high confidence when an image is blurry, distant, or empty.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              detectionStatus: {
                type: Type.STRING,
                description:
                  'One of: animal_detected, empty_frame, human_or_vehicle, unclear',
              },
              predictedSpecies: {
                type: Type.STRING,
                description:
                  'Species name (e.g., Bengal Tiger, Asian Elephant, Indian Leopard, Spotted Deer, Wild Boar, Indian Gaur, Sloth Bear) or Empty Frame / Human / Vehicle / Unidentifiable.',
              },
              confidence: {
                type: Type.INTEGER,
                description: 'Integer confidence score from 0 to 100.',
              },
              reviewRecommendation: {
                type: Type.STRING,
                description:
                  'One of: high_confidence, needs_review, empty_frame',
              },
              notes: {
                type: Type.STRING,
                description: 'Brief single-sentence visual observation note.',
              },
            },
            required: [
              'detectionStatus',
              'predictedSpecies',
              'confidence',
              'reviewRecommendation',
              'notes',
            ],
          },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);
      res.json({
        ...parsed,
        source: 'gemini_vision',
        filename: body.filename || 'camera_trap_image.jpg',
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Upstream AI analysis failed.';
      res.status(502).json({
        error: message,
        code: 'UPSTREAM_ERROR',
      });
    }
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      const indexHtml = path.join(distPath, 'index.html');
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Wildlife Monitoring server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
