const Groq = require('groq-sdk');
const jsonParser = require('../utils/jsonParser');

/**
 * Groq AI Provider for CandidateIQ
 * Uses fast ultra-low-latency Groq AI models with JSON response enforcement.
 */

class GroqProvider {
  constructor() {
    this.name = 'groq';
    this.modelName = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
    this.apiKey = process.env.GROQ_API_KEY;

    if (this.apiKey) {
      this.groq = new Groq({ apiKey: this.apiKey });
    } else {
      console.warn('[GroqProvider] GROQ_API_KEY not configured.');
    }
  }

  isAvailable() {
    return Boolean(this.apiKey && this.groq);
  }

  async generateJSON(prompt, systemInstruction = '') {
    if (!this.isAvailable()) {
      throw new Error('Groq API Provider unavailable: Missing GROQ_API_KEY');
    }

    const startTime = Date.now();
    
    // Active Groq model fallback hierarchy for this account
    const modelsToTry = [
      this.modelName,
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b',
      'qwen/qwen3.8-27b'
    ];

    let lastError = null;

    for (const modelCandidate of modelsToTry) {
      try {
        const chatCompletion = await this.groq.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: systemInstruction || 'You are CandidateIQ AI Assistant. You MUST respond ONLY with valid JSON. Do not include markdown headers or explanatory prose.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          model: modelCandidate,
          max_tokens: 2000,
          response_format: { type: 'json_object' }
        });

        const latencyMs = Date.now() - startTime;
        const rawText = chatCompletion.choices[0]?.message?.content || '{}';
        
        let parsedJson;
        try {
          parsedJson = jsonParser.parse(rawText);
        } catch (parseErr) {
          console.error(`[GroqProvider] Raw response from ${modelCandidate} could not be parsed:`, rawText.substring(0, 300));
          throw parseErr;
        }

        return {
          rawText,
          json: parsedJson,
          latencyMs,
          provider: this.name,
          model: modelCandidate
        };
      } catch (err) {
        lastError = err;
        console.warn(`[GroqProvider] Model ${modelCandidate} failed: ${err.message}. Trying next candidate...`);
      }
    }

    throw lastError || new Error('Groq Provider failed across all model candidates.');
  }
}

module.exports = new GroqProvider();
