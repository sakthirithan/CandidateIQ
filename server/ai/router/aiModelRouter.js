const groqProvider = require('../providers/groqProvider');
const geminiProvider = require('../providers/geminiProvider');
const fallbackProvider = require('../providers/fallbackProvider');

/**
 * AI Model Router for CandidateIQ
 * Selects primary provider (Groq -> Gemini -> Fallback) based on configuration and availability.
 */

class AIModelRouter {
  selectProvider() {
    const preferred = (process.env.AI_PROVIDER || 'groq').toLowerCase();

    if (preferred === 'groq' && groqProvider.isAvailable()) {
      return groqProvider;
    }

    if (preferred === 'gemini' && geminiProvider.isAvailable()) {
      return geminiProvider;
    }

    if (groqProvider.isAvailable()) {
      return groqProvider;
    }

    if (geminiProvider.isAvailable()) {
      return geminiProvider;
    }

    return fallbackProvider;
  }

  getFallbackProvider() {
    return fallbackProvider;
  }
}

module.exports = new AIModelRouter();
