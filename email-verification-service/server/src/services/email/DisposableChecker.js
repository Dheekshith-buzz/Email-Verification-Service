const axios = require('axios');

class DisposableChecker {
  constructor() {
    // Initial list of disposable domains
    this.disposableDomains = new Set([
      'tempmail.com', 'mailinator.com', 'guerrillamail.com',
      '10minutemail.com', 'throwawaymail.com', 'yopmail.com',
      // Add more as needed
    ]);
    
    // Cache for API responses
    this.cache = new Map();
    this.cacheDuration = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Check if email is from disposable provider
   * @param {string} email - Email address
   * @returns {Promise<Object>} Disposable check result
   */
  async check(email) {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) {
      return { isDisposable: false, reason: 'Invalid domain' };
    }

    // Check local list first
    if (this.isInLocalList(domain)) {
      return { 
        isDisposable: true, 
        reason: 'Found in local disposable list',
        domain 
      };
    }

    // Check subdomains
    if (this.isSubdomainOfDisposable(domain)) {
      return { 
        isDisposable: true, 
        reason: 'Subdomain of disposable domain',
        domain 
      };
    }

    // Check with external API (optional)
    try {
      const apiResult = await this.checkWithAPI(domain);
      if (apiResult.isDisposable) {
        // Add to local list for future use
        this.disposableDomains.add(domain);
        return apiResult;
      }
    } catch (error) {
      // API failed, continue with local check only
      console.warn(`API check failed for ${domain}:`, error.message);
    }

    return { isDisposable: false, domain };
  }

  /**
   * Check local disposable domain list
   * @param {string} domain - Domain to check
   * @returns {boolean}
   */
  isInLocalList(domain) {
    return this.disposableDomains.has(domain);
  }

  /**
   * Check if domain is subdomain of disposable domain
   * @param {string} domain - Domain to check
   * @returns {boolean}
   */
  isSubdomainOfDisposable(domain) {
    const parts = domain.split('.');
    if (parts.length < 2) return false;
    
    // Check different combinations
    for (let i = 1; i < parts.length; i++) {
      const testDomain = parts.slice(i).join('.');
      if (this.disposableDomains.has(testDomain)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Check domain with external API (optional)
   * @param {string} domain - Domain to check
   * @returns {Promise<Object>} API result
   */
  async checkWithAPI(domain) {
    const cacheKey = `api_${domain}`;
    const cached = this.cache.get(cacheKey);
    
    // Return cached result if still valid
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.result;
    }

    try {
      // Example using MailChecker API (you'll need an API key)
      // Uncomment and configure if you have an API key
      /*
      const response = await axios.get(
        `https://api.mailcheck.ai/domain/${domain}`,
        {
          headers: { 'Authorization': `Bearer ${process.env.MAILCHECK_API_KEY}` }
        }
      );
      
      const result = {
        isDisposable: response.data.disposable || false,
        reason: response.data.reason || 'Checked via API',
        domain
      };
      */

      // For now, return false (no API configured)
      const result = { 
        isDisposable: false, 
        reason: 'API not configured',
        domain 
      };

      // Cache the result
      this.cache.set(cacheKey, {
        timestamp: Date.now(),
        result
      });

      return result;

    } catch (error) {
      throw new Error(`API check failed: ${error.message}`);
    }
  }

  /**
   * Add domain to disposable list
   * @param {string} domain - Domain to add
   */
  addToDisposableList(domain) {
    this.disposableDomains.add(domain.toLowerCase());
  }

  /**
   * Remove domain from disposable list
   * @param {string} domain - Domain to remove
   */
  removeFromDisposableList(domain) {
    this.disposableDomains.delete(domain.toLowerCase());
  }

  /**
   * Get all disposable domains
   * @returns {Array} List of disposable domains
   */
  getAllDisposableDomains() {
    return Array.from(this.disposableDomains);
  }

  /**
   * Load disposable domains from file or API
   */
  async loadDisposableDomains() {
    try {
      // You can load from a JSON file or API
      // Example:
      // const response = await axios.get('https://raw.githubusercontent.com/disposable/disposable-email-domains/master/disposable_email_blocklist.conf');
      // const domains = response.data.split('\n').filter(d => d.trim());
      // this.disposableDomains = new Set(domains);
      
      console.log('Loaded disposable domains:', this.disposableDomains.size);
    } catch (error) {
      console.warn('Failed to load disposable domains:', error.message);
    }
  }
}

module.exports = new DisposableChecker();