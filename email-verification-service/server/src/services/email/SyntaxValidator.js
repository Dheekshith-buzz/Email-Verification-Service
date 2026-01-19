const validator = require('validator');

class SyntaxValidator {
  constructor() {
    // RFC 5322 compliant regex (simplified)
    this.emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    // Common invalid patterns
    this.invalidPatterns = [
      /\.\./,  // Double dots
      /^\./,   // Starts with dot
      /\.$/,   // Ends with dot
      /@.*@/,  // Multiple @ symbols
      /\s/,    // Contains spaces
    ];
  }

  /**
   * Validate email syntax
   * @param {string} email - Email to validate
   * @returns {Object} Validation result
   */
  validate(email) {
    const result = {
      email,
      isValid: false,
      errors: [],
      warnings: [],
      normalizedEmail: null
    };

    // Basic checks
    if (!email || typeof email !== 'string') {
      result.errors.push('Email is required and must be a string');
      return result;
    }

    // Trim and lowercase
    const trimmedEmail = email.trim();
    const lowerEmail = trimmedEmail.toLowerCase();
    result.normalizedEmail = lowerEmail;

    // Check length
    if (trimmedEmail.length > 254) {
      result.errors.push('Email is too long (max 254 characters)');
    }

    if (trimmedEmail.length === 0) {
      result.errors.push('Email cannot be empty');
    }

    // Check for invalid patterns
    for (const pattern of this.invalidPatterns) {
      if (pattern.test(trimmedEmail)) {
        result.errors.push('Email contains invalid characters or pattern');
        break;
      }
    }

    // Split into local and domain parts
    const parts = trimmedEmail.split('@');
    if (parts.length !== 2) {
      result.errors.push('Email must contain exactly one @ symbol');
      return result;
    }

    const [localPart, domain] = parts;

    // Validate local part
    if (localPart.length > 64) {
      result.errors.push('Local part is too long (max 64 characters)');
    }

    if (localPart.length === 0) {
      result.errors.push('Local part cannot be empty');
    }

    // Validate domain
    if (domain.length > 255) {
      result.errors.push('Domain is too long (max 255 characters)');
    }

    if (domain.length === 0) {
      result.errors.push('Domain cannot be empty');
    }

    // Check domain parts
    const domainParts = domain.split('.');
    if (domainParts.length < 2) {
      result.errors.push('Domain must have at least two parts');
    }

    for (const part of domainParts) {
      if (part.length > 63) {
        result.errors.push('Domain part is too long (max 63 characters)');
      }
      
      if (part.length === 0) {
        result.errors.push('Domain part cannot be empty');
      }
      
      if (!/^[a-zA-Z0-9-]+$/.test(part)) {
        result.errors.push('Domain part contains invalid characters');
      }
      
      if (part.startsWith('-') || part.endsWith('-')) {
        result.errors.push('Domain part cannot start or end with hyphen');
      }
    }

    // Check TLD (Top Level Domain)
    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2) {
      result.errors.push('TLD is too short');
    }

    // Check for consecutive special characters in local part
    if (/(\.\.|--|__)/.test(localPart)) {
      result.errors.push('Local part contains consecutive special characters');
    }

    // Check for common typos
    const commonTypos = {
      'gmial.com': 'gmail.com',
      'gmal.com': 'gmail.com',
      'gmsil.com': 'gmail.com',
      'yahooo.com': 'yahoo.com',
      'yaho.com': 'yahoo.com',
      'outllok.com': 'outlook.com',
      'hotmal.com': 'hotmail.com',
      'hotmai.com': 'hotmail.com'
    };

    if (commonTypos[domain]) {
      result.warnings.push(`Did you mean ${commonTypos[domain]}?`);
    }

    // Use validator library for comprehensive check
    if (!validator.isEmail(trimmedEmail)) {
      result.errors.push('Email format is invalid');
    }

    // If no errors, email is valid
    result.isValid = result.errors.length === 0;

    return result;
  }

  /**
   * Validate multiple emails
   * @param {Array} emails - Array of emails
   * @returns {Array} Validation results
   */
  validateBulk(emails) {
    if (!Array.isArray(emails)) {
      throw new Error('Emails must be an array');
    }

    const results = [];
    const seenEmails = new Set();

    for (const email of emails) {
      const result = this.validate(email);
      
      // Check for duplicates
      if (result.normalizedEmail && seenEmails.has(result.normalizedEmail)) {
        result.warnings.push('Duplicate email detected');
      } else if (result.normalizedEmail) {
        seenEmails.add(result.normalizedEmail);
      }
      
      results.push(result);
    }

    return results;
  }

  /**
   * Normalize email (trim, lowercase)
   * @param {string} email - Email to normalize
   * @returns {string} Normalized email
   */
  normalize(email) {
    if (!email || typeof email !== 'string') {
      return '';
    }
    return email.trim().toLowerCase();
  }

  /**
   * Extract domain from email
   * @param {string} email - Email address
   * @returns {string} Domain or empty string
   */
  extractDomain(email) {
    const normalized = this.normalize(email);
    const parts = normalized.split('@');
    return parts.length === 2 ? parts[1] : '';
  }

  /**
   * Extract local part from email
   * @param {string} email - Email address
   * @returns {string} Local part or empty string
   */
  extractLocalPart(email) {
    const normalized = this.normalize(email);
    const parts = normalized.split('@');
    return parts.length === 2 ? parts[0] : '';
  }
}

module.exports = new SyntaxValidator();