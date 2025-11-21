/**
 * Express server for Channel Cold Start Image Generator
 * 
 * This server exposes a single POST endpoint: /api/generate
 * 
 * Uses OpenAI-compatible API endpoint at https://llm.jp.one2x.ai
 * 
 * Models:
 * - vertex_ai/gemini-3-pro-preview: For generating diverse image prompts
 * - gemini/gemini-2.5-flash-image: For generating images from prompts
 * 
 * Environment variables:
 * - PORT: Server port (default: 3001)
 */

import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
dotenv.config();
import { SYSTEM_PROMPT } from './systemPrompt.js';
import { generatePromptsWithGemini3 } from './api/gemini.js';
import { generateImageWithNanoBanana } from './api/nanoBanana.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve static files from the frontend build directory in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../dist-frontend');
  app.use(express.static(frontendPath));
} // Increased limit for base64 images

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main generation endpoint
app.post('/api/generate', async (req, res) => {
  try {
    const { userPrompt, imageData } = req.body;

    // Validate input
    if (!userPrompt || typeof userPrompt !== 'string' || userPrompt.trim().length === 0) {
      return res.status(400).json({ error: 'userPrompt is required and must be a non-empty string' });
    }

    if (!imageData || typeof imageData !== 'string') {
      return res.status(400).json({ error: 'imageData is required and must be a base64 data URL string' });
    }

    console.log('[Server] Starting generation for prompt:', userPrompt.substring(0, 50) + '...');

    // Step 1: Generate image prompts using Gemini 3
    console.log('[Server] Step 1: Generating prompts with Gemini 3...');
    const imagePrompts = await generatePromptsWithGemini3({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      imageData,
    });

    console.log(`[Server] Generated ${imagePrompts.length} prompts`);

    // Step 2: Generate images for each prompt using Nano Banana
    console.log('[Server] Step 2: Generating images with Nano Banana...');
    const results = await Promise.all(
      imagePrompts.map(async (prompt) => {
        const imageUrl = await generateImageWithNanoBanana(prompt);
        return {
          prompt,
          imageUrl,
        };
      })
    );

    console.log(`[Server] Successfully generated ${results.length} images`);

    // Return results
    res.json({ results });
  } catch (error) {
    console.error('[Server] Error during generation:', error);
    res.status(500).json({
      error: 'Failed to generate images',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Start server
// Catch-all route to serve index.html for client-side routing in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist-frontend/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/generate`);
  console.log(`\n✅ Using OpenAI-compatible API:`);
  console.log(`   - Endpoint: https://llm.jp.one2x.ai`);
  console.log(`   - vertex_ai/gemini-3-pro-preview (prompt generation)`);
  console.log(`   - vertex_ai/gemini-3-pro-image-preview (image generation)`);
  console.log(`\n💡 Ready to generate channel images!\n`);
});

