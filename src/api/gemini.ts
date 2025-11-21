/**
 * Gemini 3 Pro Preview API client via OpenAI-compatible endpoint
 * 
 * Uses OpenAI SDK to call gemini-3-pro-preview model for generating
 * diverse image generation prompts.
 */

import OpenAI from 'openai';
import { openaiClient } from './client.js';

export interface GeneratePromptsArgs {
  systemPrompt: Record<string, unknown>;
  userPrompt: string;
  imageData: string; // base64 data URL
}

export async function generatePromptsWithGemini3(
  args: GeneratePromptsArgs
): Promise<string[]> {
  try {
    console.log('[Gemini 3] Calling vertex_ai/gemini-3-pro-preview via OpenAI API...');

    // Construct the system prompt
    const systemPromptText = `You are a cold start image prompt generator. Follow this specification exactly:\n\n${JSON.stringify(args.systemPrompt, null, 2)}\n\nIMPORTANT: Return ONLY a JSON object with the structure specified in the system prompt. The JSON must include an "Image Prompts" array with 8-12 prompt strings.`;

    // Prepare the messages with image
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: systemPromptText,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `User's Channel Theme:\n${args.userPrompt}`,
          },
          {
            type: "image_url",
            image_url: {
              url: args.imageData,
            },
          },
        ],
      },
    ];

    const response = await openaiClient.chat.completions.create({
      model: "vertex_ai/gemini-3-pro-preview",
      messages: messages,
      temperature: 0.7,
      max_tokens: 8192,
    });

    const text = response.choices[0]?.message?.content || '';
    console.log('[Gemini 3] Received response, parsing...');

    // Try to extract JSON from the response
    let parsedData;
    try {
      // Try to parse as pure JSON first
      parsedData = JSON.parse(text);
    } catch (e) {
      // If that fails, try to extract JSON from markdown code blocks
      const jsonMatch = text.match(/```json\n?([\s\S]+?)\n?```/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[1]);
      } else {
        // Try to find any JSON object in the text
        const objectMatch = text.match(/\{[\s\S]+\}/);
        if (objectMatch) {
          parsedData = JSON.parse(objectMatch[0]);
        } else {
          console.error('[Gemini 3] Could not parse JSON from response:', text);
          throw new Error('Failed to parse JSON response from Gemini 3');
        }
      }
    }

    // Extract image prompts from the response
    const imagePrompts = parsedData['Image Prompts'] || parsedData.imagePrompts || parsedData.image_prompts;
    
    if (!imagePrompts || !Array.isArray(imagePrompts)) {
      console.error('[Gemini 3] No valid image prompts found in response:', parsedData);
      throw new Error('No valid image prompts returned from Gemini 3');
    }

    console.log(`[Gemini 3] Successfully generated ${imagePrompts.length} prompts`);
    return imagePrompts;

  } catch (error) {
    console.error('[Gemini 3] Error:', error);
    throw new Error(`Gemini 3 API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
