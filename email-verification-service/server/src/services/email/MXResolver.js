const dns = require('dns').promises;

class MXResolver {
  constructor() {
    this.dnsServers = [
      '8.8.8.8',     // Google DNS
      '1.1.1.1',     // Cloudflare DNS
      '208.67.222.222', // OpenDNS
      '9.9.9.9'      // Quad9
    ];
  }

  /**
   * Resolve MX records with fallback DNS servers
   * @param {string} domain - Domain name
   * @returns {Promise<Array>} MX records
   */
  async resolveMX(domain) {
    let lastError = null;
    
    // Try system DNS first
    try {
      const records = await dns.resolveMx(domain);
      return this.sortMXRecords(records);
    } catch (error) {
      lastError = error;
    }
    
    // Try with custom DNS servers if available
    for (const dnsServer of this.dnsServers) {
      try {
        const resolver = new dns.Resolver();
        resolver.setServers([dnsServer]);
        
        const records = await promisify(resolver.resolveMx.bind(resolver))(domain);
        return this.sortMXRecords(records);
      } catch (error) {
        lastError = error;
        continue;
      }
    }
    
    // All attempts failed
    throw lastError || new Error(`Could not resolve MX records for ${domain}`);
  }

  /**
   * Sort MX records by priority
   * @param {Array} records - MX records
   * @returns {Array} Sorted records
   */
  sortMXRecords(records) {
    return records.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get primary MX record
   * @param {string} domain - Domain name
   * @returns {Promise<string>} Primary MX host
   */
  async getPrimaryMX(domain) {
    const records = await this.resolveMX(domain);
    return records.length > 0 ? records[0].exchange : null;
  }

  /**
   * Check if domain has valid MX records
   * @param {string} domain - Domain name
   * @returns {Promise<boolean>} True if has MX records
   */
  async hasMXRecords(domain) {
    try {
      const records = await this.resolveMX(domain);
      return records.length > 0;
    } catch (error) {
      return false;
    }
  }
}

// Helper function for promisify
const promisify = (fn) => {
  return (...args) => {
    return new Promise((resolve, reject) => {
      fn(...args, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };
};

module.exports = new MXResolver();