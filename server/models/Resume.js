const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    candidateIdString: String,
    fileName: { type: String, required: true },
    fileType: { type: String, default: 'application/pdf' },
    fileSize: { type: Number, default: 0 },
    rawText: { type: String, default: '' },
    extractionStatus: {
      type: String,
      enum: ['uploaded', 'validating', 'extracting_text', 'analyzing_document', 'detecting_sections', 'extracting_content', 'awaiting_confirmation', 'confirmed', 'completed', 'failed'],
      default: 'uploaded'
    },
    extractedCandidate: {
      fullName: String,
      email: String,
      phone: String,
      location: String,
      headline: String
    },
    extractedSections: [
      {
        id: String,
        sectionType: String,
        title: String,
        selected: { type: Boolean, default: true },
        confidence: { type: Number, default: 0.95 },
        content: String,
        items: [mongoose.Schema.Types.Mixed],
        source: {
          pages: [Number]
        }
      }
    ],
    processingMetadata: {
      pageCount: { type: Number, default: 1 },
      totalSectionsDetected: { type: Number, default: 0 },
      resumeQualityScore: { type: Number, default: 85 },
      latencyMs: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);
