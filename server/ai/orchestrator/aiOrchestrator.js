const aiModelRouter = require('../router/aiModelRouter');
const fallbackProvider = require('../providers/fallbackProvider');
const aiLogger = require('../utils/aiLogger');

/**
 * AI Orchestrator for CandidateIQ
 * Manages request routing, prompt execution, schema validation, retries, logging, and universal envelope wrap.
 */

class AIOrchestrator {
  async executeOperation({ operation, prompt, schema, fallbackFn, metadata = {} }) {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const startTime = Date.now();
    let attempt = 1;
    let primaryProvider = aiModelRouter.selectProvider();
    let fallbackUsed = false;
    let result = null;
    let providerName = primaryProvider.name;
    let modelName = primaryProvider.modelName;

    try {
      // 1. Primary Attempt (if primary provider available and prompt provided)
      if (primaryProvider.name !== 'fallback' && prompt) {
        try {
          const providerRes = await primaryProvider.generateJSON(prompt);
          providerName = providerRes.provider;
          modelName = providerRes.model;

          // 2. Validate with Zod Schema
          if (schema) {
            result = schema.parse(providerRes.json);
          } else {
            result = providerRes.json;
          }
        } catch (primaryErr) {
          console.warn(`[AIOrchestrator] Primary provider (${primaryProvider.name}) failed on operation "${operation}". Error: ${primaryErr.message}. Triggering retry / fallback...`);
          attempt = 2;
        }
      }

      // 3. Fallback Execution if primary failed or unavailable
      if (!result && fallbackFn) {
        fallbackUsed = true;
        providerName = 'fallback';
        modelName = fallbackProvider.modelName;
        const rawFallback = await fallbackFn();

        if (schema) {
          result = schema.parse(rawFallback);
        } else {
          result = rawFallback;
        }
      }

      if (!result) {
        throw new Error(`Execution failed for operation "${operation}": Unable to generate schema-compliant result.`);
      }

      const processingTimeMs = Date.now() - startTime;

      aiLogger.log({
        requestId,
        operation,
        provider: providerName,
        model: modelName,
        attempt,
        latencyMs: processingTimeMs,
        fallbackUsed,
        status: 'success'
      });

      return {
        requestId,
        operation,
        status: 'success',
        provider: providerName,
        model: modelName,
        attempt,
        fallbackUsed,
        processingTimeMs,
        result,
        error: null,
        metadata
      };

    } catch (error) {
      const processingTimeMs = Date.now() - startTime;

      aiLogger.log({
        requestId,
        operation,
        provider: providerName,
        model: modelName,
        attempt,
        latencyMs: processingTimeMs,
        fallbackUsed,
        status: 'failed',
        error
      });

      return {
        requestId,
        operation,
        status: 'failed',
        provider: providerName,
        model: modelName,
        attempt,
        fallbackUsed,
        processingTimeMs,
        result: null,
        error: {
          code: 'AI_PROCESSING_ERROR',
          message: error.message || 'AI processing failed.'
        },
        metadata
      };
    }
  }
}

module.exports = new AIOrchestrator();
