/**
 * Utility functions for formatting Experience and Salary for Recruiter & Candidate views.
 */

/**
 * Format Experience Required
 * @param {Object} exp - Structured experience object { min, max, unit }
 * @param {string} legacyExpLevel - Fallback string experience level
 * @returns {string} Formatted experience string
 */
export const formatExperience = (exp, legacyExpLevel) => {
  if (exp && typeof exp.min === 'number' && typeof exp.max === 'number') {
    if (exp.min === 0 && exp.max === 0) {
      return 'Fresher / No experience required';
    }
    const unitStr = exp.unit === 'months' ? 'Months' : 'Years';
    if (exp.min === exp.max) {
      return `${exp.min} ${unitStr}`;
    }
    return `${exp.min}–${exp.max} ${unitStr}`;
  }
  if (legacyExpLevel && typeof legacyExpLevel === 'string' && legacyExpLevel.trim()) {
    return legacyExpLevel.trim();
  }
  return 'Not specified';
};

/**
 * Format Salary Compensation
 * @param {Object} sal - Structured salary object { min, max, currency, period }
 * @param {string} legacySalary - Fallback string salary
 * @returns {string} Formatted salary string (e.g. ₹4 LPA – ₹8 LPA)
 */
export const formatSalary = (sal, legacySalary) => {
  if (sal && typeof sal.min === 'number' && typeof sal.max === 'number' && (sal.min > 0 || sal.max > 0)) {
    const currency = sal.currency || 'INR';
    const symbol = currency === 'INR' ? '₹' : (currency === 'USD' ? '$' : (currency === 'EUR' ? '€' : (currency === 'GBP' ? '£' : currency + ' ')));
    const periodStr = sal.period === 'month' ? '/month' : '';

    // If INR and >= 100,000, format in LPA
    if (currency === 'INR' && sal.min >= 100000) {
      const minLpa = (sal.min / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 });
      const maxLpa = (sal.max / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 });
      if (sal.min === sal.max) {
        return `${symbol}${minLpa} LPA${periodStr}`;
      }
      return `${symbol}${minLpa} LPA – ${symbol}${maxLpa} LPA${periodStr}`;
    }

    // Standard number formatting
    const minFormatted = sal.min.toLocaleString('en-IN');
    const maxFormatted = sal.max.toLocaleString('en-IN');
    if (sal.min === sal.max) {
      return `${symbol}${minFormatted}${periodStr}`;
    }
    return `${symbol}${minFormatted} – ${symbol}${maxFormatted}${periodStr}`;
  }

  if (legacySalary && typeof legacySalary === 'string' && legacySalary.trim()) {
    return legacySalary.trim();
  }

  return 'Not specified';
};
