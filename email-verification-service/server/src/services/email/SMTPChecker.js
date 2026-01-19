const net = require('net');
const { promisify } = require('util');

class SMTPChecker {
  constructor() {
    this.timeout = 8000;
    this.ports = [25, 587, 465]; // Common SMTP ports
  }

  /**
   * Check SMTP server availability
   * @param {string} host - SMTP host
   * @returns {Promise<Object>} SMTP check result
   */
  async checkSMTP(host) {
    const results = [];
    
    for (const port of this.ports) {
      const result = await this.tryPort(host, port);
      results.push(result);
      
      if (result.success) {
        break; // Found working port
      }
    }
    
    // Return best result
    const working = results.find(r => r.success);
    return working || results[0] || {
      success: false,
      port: null,
      response: 'No ports available',
      host
    };
  }

  /**
   * Try specific port
   * @param {string} host - SMTP host
   * @param {number} port - Port number
   * @returns {Promise<Object>} Port check result
   */
  async tryPort(host, port) {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      let response = '';
      let timeoutId;

      timeoutId = setTimeout(() => {
        socket.destroy();
        resolve({
          success: false,
          port,
          response: 'Timeout',
          host
        });
      }, this.timeout);

      socket.connect(port, host, () => {
        response += 'Connected\n';
      });

      socket.on('data', (data) => {
        response += data.toString();
        
        // Send test command
        if (response.includes('220')) {
          socket.write(`EHLO verify.local\r\n`);
        }
        
        // Check for response
        if (response.includes('250')) {
          clearTimeout(timeoutId);
          socket.destroy();
          resolve({
            success: true,
            port,
            response: response.split('\n')[0].trim(),
            host,
            banner: response
          });
        }
      });

      socket.on('error', (err) => {
        clearTimeout(timeoutId);
        resolve({
          success: false,
          port,
          response: `Error: ${err.message}`,
          host
        });
      });

      socket.on('close', () => {
        clearTimeout(timeoutId);
        if (!response.includes('250')) {
          resolve({
            success: false,
            port,
            response: 'Connection closed',
            host
          });
        }
      });

      socket.setTimeout(this.timeout, () => {
        socket.destroy();
        resolve({
          success: false,
          port,
          response: 'Socket timeout',
          host
        });
      });
    });
  }
}

module.exports = new SMTPChecker();