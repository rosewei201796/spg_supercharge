/**
 * Unified OpenAI client configuration
 * 
 * Uses OpenAI SDK to connect to OpenAI-compatible endpoint
 * Supports both Gemini 3 Pro Preview and Gemini 2.5 Flash Image models
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Get API configuration from environment variables
const API_KEY = process.env.OPENAI_API_KEY || process.env.API_KEY;
const BASE_URL = process.env.OPENAI_BASE_URL || process.env.BASE_URL || 'https://llm.jp.one2x.ai';

if (!API_KEY) {
  console.warn('[API Client] Warning: No API key found. Please set OPENAI_API_KEY or API_KEY environment variable.');
}

// Initialize OpenAI client with custom endpoint
export const openaiClient = new OpenAI({
  apiKey: API_KEY,
  baseURL: BASE_URL,
});

// Export configuration for reference
export const API_CONFIG = {
  apiKey: API_KEY ? '***' + API_KEY.slice(-4) : 'NOT_SET',
  baseURL: BASE_URL,
};

