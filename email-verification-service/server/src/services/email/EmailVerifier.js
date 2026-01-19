const dns = require('dns').promises;
const net = require('net');
const validator = require('validator');
const { promisify } = require('util');

class EmailVerifier {
  constructor() {
    this.timeout = 10000; // 10 seconds timeout
    this.smtpPort = 25;
    
    // Expanded list of disposable email domains
    this.disposableDomains = [
      'tempmail.com', 'mailinator.com', 'guerrillamail.com',
      '10minutemail.com', 'throwawaymail.com', 'yopmail.com',
      'trashmail.com', 'fakeinbox.com', 'mailnesia.com',
      'sharklasers.com', 'getairmail.com', 'maildrop.cc',
      'temp-mail.org', 'tempail.com', 'tempmail.net',
      'discard.email', 'tempmailaddress.com', 'mail.tm',
      'tmpmail.org', 'throwawaymail.com', 'mytemp.email',
      'maildu.de', 'spamgourmet.com', 'spambox.us',
      'deadaddress.com', 'disposablemail.com', 'mailcatch.com'
    ];
    
    // Role-based email addresses
    this.roleAccounts = [
      'admin', 'administrator', 'webmaster', 'info', 'contact',
      'support', 'sales', 'help', 'hello', 'noreply', 'no-reply',
      'postmaster', 'hostmaster', 'abuse', 'security', 'billing',
      'accounts', 'accounting', 'hr', 'humanresources', 'jobs',
      'careers', 'media', 'press', 'marketing', 'newsletter',
      'notifications', 'alerts', 'service', 'services', 'team'
    ];
    
    // Common free email providers (for SMTP optimization)
    this.freeEmailProviders = [
      'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
      'aol.com', 'icloud.com', 'protonmail.com', 'zoho.com',
      'gmx.com', 'yandex.com', 'mail.com', 'inbox.com'
    ];
  }

  /**
   * Verify a single email address
   * @param {string} email - Email address to verify
   * @returns {Promise<Object>} Verification result
   */
  async verifyEmail(email) {
    const result = {
      email,
      isValidFormat: false,
      isDisposable: false,
      hasMXRecords: false,
      isRoleAccount: false,
      canConnectSMTP: false,
      isCatchAll: false,
      status: 'invalid',
      mxRecords: [],
      smtpResponse: null,
      verificationTime: null,
      error: null
    };

    const startTime = Date.now();

    try {
      // 1. Format validation
      if (!validator.isEmail(email)) {
        result.status = 'invalid_format';
        return result;
      }
      result.isValidFormat = true;

      const domain = email.split('@')[1].toLowerCase();
      const localPart = email.split('@')[0].toLowerCase();

      // 2. Check disposable email domains
      if (await this.isDisposableDomain(domain)) {
        result.isDisposable = true;
        result.status = 'disposable';
        return result;
      }

      // 3. Check for role accounts
      if (this.isRoleAccount(localPart)) {
        result.isRoleAccount = true;
      }

      // 4. Check MX records
      const mxRecords = await this.checkMXRecords(domain);
      if (mxRecords.length > 0) {
        result.hasMXRecords = true;
        result.mxRecords = mxRecords;
      } else {
        result.status = 'no_mx_records';
        return result;
      }

      // 5. Try SMTP connection (skip for well-known providers to speed up)
      if (this.freeEmailProviders.includes(domain)) {
        // Known providers are assumed to be valid
        result.canConnectSMTP = true;
        result.status = 'valid';
      } else {
        // Try SMTP connection for other domains
        const smtpResult = await this.trySmtpConnection(mxRecords[0].exchange, email);
        result.canConnectSMTP = smtpResult.success;
        result.smtpResponse = smtpResult.response;
        result.isCatchAll = smtpResult.isCatchAll;
        
        if (result.canConnectSMTP) {
          result.status = 'valid';
        } else {
          result.status = 'cannot_connect';
        }
      }

    } catch (error) {
      console.error(`Error verifying ${email}:`, error.message);
      result.status = 'error';
      result.error = error.message;
    } finally {
      result.verificationTime = Date.now() - startTime;
    }

    return result;
  }

  /**
   * Check if domain is disposable
   * @param {string} domain - Email domain
   * @returns {Promise<boolean>}
   */
  async isDisposableDomain(domain) {
    // Check against local list first
    if (this.disposableDomains.includes(domain)) {
      return true;
    }

    // Check subdomains of disposable domains
    for (const disposableDomain of this.disposableDomains) {
      if (domain.endsWith(`.${disposableDomain}`)) {
        return true;
      }
    }

    // Could add API call to external disposable email check here
    return false;
  }

  /**
   * Check if email is a role account
   * @param {string} localPart - Local part of email (before @)
   * @returns {boolean}
   */
  isRoleAccount(localPart) {
    // Remove numbers and special characters for better matching
    const cleanLocalPart = localPart.replace(/[0-9._-]/g, '');
    
    // Check exact matches
    if (this.roleAccounts.includes(localPart)) {
      return true;
    }
    
    // Check partial matches
    for (const role of this.roleAccounts) {
      if (cleanLocalPart.includes(role) || localPart.includes(role)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Get MX records for domain
   * @param {string} domain - Domain name
   * @returns {Promise<Array>} MX records sorted by priority
   */
  async checkMXRecords(domain) {
    try {
      const addresses = await dns.resolveMx(domain);
      return addresses.sort((a, b) => a.priority - b.priority);
    } catch (error) {
      // Try alternative DNS servers or fallback
      return [];
    }
  }

  /**
   * Try SMTP connection to verify email
   * @param {string} host - SMTP host
   * @param {string} email - Email to verify
   * @returns {Promise<Object>} SMTP connection result
   */
  async trySmtpConnection(host, email) {
    return new Promise((resolve) => {
      const result = {
        success: false,
        response: null,
        isCatchAll: false
      };

      const socket = new net.Socket();
      let response = '';
      let timeoutId;

      // Set timeout
      timeoutId = setTimeout(() => {
        socket.destroy();
        result.response = 'Timeout';
        resolve(result);
      }, this.timeout);

      // Connect to SMTP server
      socket.connect(this.smtpPort, host, () => {
        clearTimeout(timeoutId);
        response += 'Connected\n';
      });

      // Handle data
      socket.on('data', (data) => {
        response += data.toString();
        
        // Send HELO command
        if (response.includes('220')) {
          socket.write(`HELO verify.local\r\n`);
        }
        
        // Send MAIL FROM
        if (response.includes('250')) {
          socket.write(`MAIL FROM:<verify@verify.local>\r\n`);
        }
        
        // Send RCPT TO (the email we're verifying)
        if (response.includes('250') && response.includes('MAIL')) {
          socket.write(`RCPT TO:<${email}>\r\n`);
        }
        
        // Check response for RCPT TO
        if (response.includes('RCPT')) {
          if (response.includes('250') || response.includes('550')) {
            clearTimeout(timeoutId);
            
            // 250 = Accepted, 550 = Rejected
            const lines = response.split('\n');
            const lastLine = lines[lines.length - 1];
            
            result.success = response.includes('250');
            result.response = lastLine.trim();
            
            // Check for catch-all domain (accepts any email)
            if (result.success && lastLine.includes('250')) {
              // Try a non-existent email to check if it's catch-all
              this.checkCatchAll(host, domain).then(isCatchAll => {
                result.isCatchAll = isCatchAll;
                socket.destroy();
                resolve(result);
              });
            } else {
              socket.destroy();
              resolve(result);
            }
          }
        }
      });

      // Handle errors
      socket.on('error', (err) => {
        clearTimeout(timeoutId);
        result.response = `Error: ${err.message}`;
        socket.destroy();
        resolve(result);
      });

      // Handle close
      socket.on('close', () => {
        clearTimeout(timeoutId);
        if (!result.response) {
          result.response = 'Connection closed';
        }
        resolve(result);
      });

      // Set socket timeout
      socket.setTimeout(this.timeout, () => {
        socket.destroy();
        result.response = 'Socket timeout';
        resolve(result);
      });
    });
  }

  /**
   * Check if domain is catch-all (accepts any email)
   * @param {string} host - SMTP host
   * @param {string} domain - Domain name
   * @returns {Promise<boolean>}
   */
  async checkCatchAll(host, domain) {
    return new Promise((resolve) => {
      // Generate a random, likely non-existent email
      const randomEmail = `nonexistent-${Date.now()}@${domain}`;
      
      const socket = new net.Socket();
      let timeoutId;

      timeoutId = setTimeout(() => {
        socket.destroy();
        resolve(false);
      }, 5000);

      socket.connect(this.smtpPort, host, () => {
        // Quick check - if it accepts a random email, it's likely catch-all
        socket.write(`HELO verify.local\r\n`);
        setTimeout(() => {
          socket.write(`MAIL FROM:<verify@verify.local>\r\n`);
        }, 100);
        setTimeout(() => {
          socket.write(`RCPT TO:<${randomEmail}>\r\n`);
        }, 200);
      });

      socket.on('data', (data) => {
        const response = data.toString();
        if (response.includes('RCPT TO')) {
          clearTimeout(timeoutId);
          // If random email is accepted (250), it's catch-all
          resolve(response.includes('250'));
          socket.destroy();
        }
      });

      socket.on('error', () => {
        clearTimeout(timeoutId);
        resolve(false);
        socket.destroy();
      });

      socket.setTimeout(3000, () => {
        socket.destroy();
        resolve(false);
      });
    });
  }

  /**
   * Verify multiple emails in bulk
   * @param {Array<string>} emails - Array of email addresses
   * @param {number} batchSize - Number of emails to process concurrently
   * @returns {Promise<Array>} Array of verification results
   */
  async verifyBulk(emails, batchSize = 5) {
    const results = [];
    const validEmails = [];
    
    // Filter out invalid formats first
    for (const email of emails) {
      if (validator.isEmail(email)) {
        validEmails.push(email);
      } else {
        results.push({
          email,
          isValidFormat: false,
          status: 'invalid_format',
          error: 'Invalid email format'
        });
      }
    }

    // Process valid emails in batches
    for (let i = 0; i < validEmails.length; i += batchSize) {
      const batch = validEmails.slice(i, i + batchSize);
      const batchPromises = batch.map(email => this.verifyEmail(email));
      
      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      } catch (error) {
        // Handle individual failures
        for (const email of batch) {
          results.push({
            email,
            isValidFormat: true,
            status: 'error',
            error: error.message
          });
        }
      }
      
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < validEmails.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results.sort((a, b) => {
      // Sort by status priority
      const statusOrder = {
        'valid': 1,
        'disposable': 2,
        'role_account': 3,
        'no_mx_records': 4,
        'cannot_connect': 5,
        'invalid_format': 6,
        'error': 7
      };
      
      return (statusOrder[a.status] || 8) - (statusOrder[b.status] || 8);
    });
  }

  /**
   * Generate verification statistics
   * @param {Array} results - Verification results
   * @returns {Object} Statistics
   */
  generateStatistics(results) {
    const stats = {
      total: results.length,
      valid: 0,
      invalid: 0,
      disposable: 0,
      roleAccounts: 0,
      formatInvalid: 0,
      noMx: 0,
      cannotConnect: 0,
      errors: 0,
      validPercentage: 0
    };

    for (const result of results) {
      switch (result.status) {
        case 'valid':
          stats.valid++;
          break;
        case 'disposable':
          stats.disposable++;
          stats.invalid++;
          break;
        case 'no_mx_records':
          stats.noMx++;
          stats.invalid++;
          break;
        case 'cannot_connect':
          stats.cannotConnect++;
          stats.invalid++;
          break;
        case 'invalid_format':
          stats.formatInvalid++;
          stats.invalid++;
          break;
        case 'error':
          stats.errors++;
          break;
      }
      
      if (result.isRoleAccount) {
        stats.roleAccounts++;
      }
    }

    if (stats.total > 0) {
      stats.validPercentage = ((stats.valid / stats.total) * 100).toFixed(2);
    }

    return stats;
  }
}

// Export singleton instance
module.exports = new EmailVerifier();