/**
 * Gemini 3 Pro Image Preview API client via OpenAI-compatible endpoint
 * 
 * Uses OpenAI SDK to call vertex_ai/gemini-3-pro-image-preview model for generating
 * images from text prompts.
 */

import { openaiClient } from './client.js';

export async function generateImageWithNanoBanana(
  prompt: string
): Promise<string> {
  try {
    console.log('[Gemini Image] Generating image with vertex_ai/gemini-3-pro-image-preview...');

    const response = await openaiClient.chat.completions.create({
      model: "vertex_ai/gemini-3-pro-image-preview",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    console.log('[Gemini Image] Received response, extracting image...');

    // Extract images from the response
    const choice = response.choices[0];
    if (!choice || !choice.message) {
      throw new Error('No message in response');
    }

    // Access images directly from message (Nano Banana structure)
    const message = choice.message as any;
    const images = message.images || [];

    if (images.length === 0) {
      console.warn('[Gemini Image] No images found in response');
      // Fallback to placeholder
      const seed = Math.random().toString(36).substring(7);
      return `https://picsum.photos/seed/${seed}/800/600`;
    }

    // Get the first image
    const img = images[0];
    let imageUrl = img.image_url;

    // Handle nested structure
    if (typeof imageUrl === 'object' && imageUrl.url) {
      imageUrl = imageUrl.url;
    }

    // Ensure it's a data URL
    if (typeof imageUrl === 'string') {
      console.log('[Gemini Image] Successfully generated image');
      return imageUrl;
    }

    throw new Error('Invalid image URL format');

  } catch (error) {
    console.error('[Gemini Image] Error:', error);
    
    // Fallback to placeholder image if there's an error
    console.warn('[Gemini Image] Falling back to placeholder image due to error');
    const seed = Math.random().toString(36).substring(7);
    return `https://picsum.photos/seed/${seed}/800/600`;
  }
}
