const { GoogleGenerativeAI } = require('@google/generative-ai');
const jsonParser = require('../utils/jsonParser');

/**
 * Gemini Provider Layer for CandidateIQ
 */

class GeminiProvider {
  constructor() {
    this.name = 'gemini';
    this.modelName = 'gemini-1.5-flash';
    this.apiKey = process.env.GEMINI_API_KEY;

    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    } else {
      console.warn('[GeminiProvider] GEMINI_API_KEY not configured.');
    }
  }

  isAvailable() {
    return Boolean(this.apiKey && this.genAI);
  }

  async generateJSON(prompt, systemInstruction = '') {
    if (!this.isAvailable()) {
      throw new Error('Gemini API Provider unavailable: Missing GEMINI_API_KEY');
    }

    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      generationConfig: { responseMimeType: 'application/json' },
      systemInstruction: systemInstruction || 'You are CandidateIQ AI Assistant. You MUST respond ONLY with valid JSON.'
    });

    const startTime = Date.now();
    const response = await model.generateContent(prompt);
    const latencyMs = Date.now() - startTime;
    const rawText = response.response.text();

    const parsedJson = jsonParser.parse(rawText);

    return {
      rawText,
      json: parsedJson,
      latencyMs,
      provider: this.name,
      model: this.modelName
    };
  }
}

module.exports = new GeminiProvider();
