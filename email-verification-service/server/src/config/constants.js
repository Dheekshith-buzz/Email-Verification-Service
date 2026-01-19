module.exports = {
  // Email verification statuses
  VERIFICATION_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed'
  },
  
  // Email validation statuses
  VALIDATION_STATUS: {
    VALID: 'valid',
    INVALID: 'invalid',
    DISPOSABLE: 'disposable',
    ROLE_ACCOUNT: 'role_account',
    NO_MX_RECORDS: 'no_mx_records',
    CANNOT_CONNECT: 'cannot_connect',
    INVALID_FORMAT: 'invalid_format'
  },
  
  // Rate limits
  RATE_LIMITS: {
    SINGLE_VERIFICATION: 100, // per minute
    BULK_VERIFICATION: 10,    // per hour
    API_REQUESTS: 1000        // per day
  },
  
  // Default values
  DEFAULTS: {
    USER_CREDITS: 100,
    BATCH_SIZE: 100,
    SMTP_TIMEOUT: 10000 // 10 seconds
  }
};