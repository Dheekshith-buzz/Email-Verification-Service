const { EmailVerifier } = require('../services/email');
const { VerificationRequest, VerificationStats } = require('../models');
const crypto = require('crypto');
const csv = require('csv-parser');
const fs = require('fs').promises;

const verificationController = {
  // Verify single email
  verifySingle: async (req, res) => {
    try {
      const { email } = req.body;
      const userId = req.user.id;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Verify email
      const result = await EmailVerifier.verifyEmail(email);

      // Save to database
      const verification = await VerificationRequest.create({
        userId,
        email,
        status: 'completed',
        isValid: result.status === 'valid',
        isDisposable: result.isDisposable,
        isRoleAccount: result.isRoleAccount,
        mxRecords: result.mxRecords,
        smtpResponse: result.smtpResponse,
        validationSource: 'single'
      });

      // Update stats
      await updateVerificationStats(userId, result);

      // Deduct credit
      await req.user.decrement('credits', { by: 1 });

      res.json({
        success: true,
        message: `Email verification ${result.status === 'valid' ? 'successful' : 'failed'}`,
        data: {
          verification: {
            id: verification.id,
            email: verification.email,
            isValid: verification.isValid,
            isDisposable: verification.isDisposable,
            isRoleAccount: verification.isRoleAccount,
            status: result.status,
            mxRecords: result.mxRecords,
            smtpResponse: result.smtpResponse,
            createdAt: verification.createdAt
          },
          creditsRemaining: req.user.credits - 1
        }
      });

    } catch (error) {
      console.error('Single verification error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Verification failed',
        message: error.message 
      });
    }
  },

  // Verify bulk emails
  verifyBulk: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'CSV file is required' });
      }

      const userId = req.user.id;
      const batchId = `batch_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const emails = [];

      // Parse CSV file
      const results = await new Promise((resolve, reject) => {
        const rows = [];
        require('fs').createReadStream(req.file.path)
          .pipe(csv())
          .on('data', (row) => {
            // Extract email from CSV row
            const email = row.email || row.Email || row.EMAIL || Object.values(row)[0];
            if (email && typeof email === 'string') {
              emails.push(email.trim());
              rows.push(row);
            }
          })
          .on('end', () => resolve(rows))
          .on('error', reject);
      });

      // Limit batch size
      const maxBatchSize = 1000;
      if (emails.length > maxBatchSize) {
        await fs.unlink(req.file.path);
        return res.status(400).json({ 
          error: `Batch size too large. Maximum ${maxBatchSize} emails allowed.` 
        });
      }

      // Check credits
      if (req.user.credits < emails.length) {
        await fs.unlink(req.file.path);
        return res.status(402).json({ 
          error: 'Insufficient credits',
          required: emails.length,
          available: req.user.credits
        });
      }

      res.json({
        success: true,
        message: 'Bulk verification started',
        data: {
          batchId,
          totalEmails: emails.length,
          estimatedCost: emails.length,
          creditsRemaining: req.user.credits - emails.length
        }
      });

      // Process verification asynchronously
      processBulkVerification(userId, batchId, emails, req.file.path);

    } catch (error) {
      console.error('Bulk verification error:', error);
      
      // Clean up uploaded file
      if (req.file && req.file.path) {
        await fs.unlink(req.file.path).catch(() => {});
      }
      
      res.status(500).json({ 
        success: false, 
        error: 'Bulk verification failed',
        message: error.message 
      });
    }
  },

  // Get verification results by batch
  getBatchResults: async (req, res) => {
    try {
      const { batchId } = req.params;
      const userId = req.user.id;

      const verifications = await VerificationRequest.findAll({
        where: { userId, batchId },
        order: [['createdAt', 'DESC']],
        limit: 1000
      });

      const stats = verifications.reduce((acc, v) => {
        acc.total++;
        if (v.isValid) acc.valid++;
        if (v.isDisposable) acc.disposable++;
        if (v.isRoleAccount) acc.roleAccounts++;
        return acc;
      }, { total: 0, valid: 0, disposable: 0, roleAccounts: 0 });

      stats.validPercentage = stats.total > 0 
        ? ((stats.valid / stats.total) * 100).toFixed(2) 
        : 0;

      res.json({
        success: true,
        data: {
          batchId,
          verifications,
          statistics: stats,
          count: verifications.length
        }
      });

    } catch (error) {
      console.error('Get batch results error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch results' 
      });
    }
  },

  // Get verification history
  getHistory: async (req, res) => {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20, status } = req.query;
      const offset = (page - 1) * limit;

      const where = { userId };
      if (status) where.status = status;

      const { count, rows } = await VerificationRequest.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: {
          verifications: rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count,
            pages: Math.ceil(count / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get history error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch history' 
      });
    }
  },

  // Export results
  exportResults: async (req, res) => {
    try {
      const { batchId, format = 'csv' } = req.body;
      const userId = req.user.id;

      const where = { userId };
      if (batchId) where.batchId = batchId;

      const verifications = await VerificationRequest.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: 5000 // Export limit
      });

      if (format === 'csv') {
        const csvData = verifications.map(v => ({
          email: v.email,
          status: v.isValid ? 'Valid' : 'Invalid',
          disposable: v.isDisposable ? 'Yes' : 'No',
          role_account: v.isRoleAccount ? 'Yes' : 'No',
          verified_at: v.createdAt.toISOString()
        }));

        // Convert to CSV
        const csv = convertToCSV(csvData);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=verification_results_${batchId || Date.now()}.csv`);
        res.send(csv);
      } else {
        res.json({
          success: true,
          data: verifications
        });
      }

    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Export failed' 
      });
    }
  }
};

// Helper functions
async function updateVerificationStats(userId, result) {
  const stats = await VerificationStats.findOne({ where: { userId } }) 
    || await VerificationStats.create({ userId });

  stats.totalVerified += 1;
  if (result.status === 'valid') stats.validCount += 1;
  if (result.isDisposable) stats.disposableCount += 1;
  if (result.isRoleAccount) stats.roleAccountCount += 1;
  stats.invalidCount = stats.totalVerified - stats.validCount;
  stats.lastVerification = new Date();

  await stats.save();
}

async function processBulkVerification(userId, batchId, emails, filePath) {
  try {
    // Process in smaller chunks
    const chunkSize = 10;
    let processed = 0;
    let validCount = 0;
    let disposableCount = 0;

    for (let i = 0; i < emails.length; i += chunkSize) {
      const chunk = emails.slice(i, i + chunkSize);
      
      // Verify chunk
      const results = await EmailVerifier.verifyBulk(chunk, 5);
      
      // Save results
      for (const result of results) {
        await VerificationRequest.create({
          userId,
          batchId,
          email: result.email,
          status: 'completed',
          isValid: result.status === 'valid',
          isDisposable: result.isDisposable,
          isRoleAccount: result.isRoleAccount,
          mxRecords: result.mxRecords,
          smtpResponse: result.smtpResponse,
          validationSource: 'bulk'
        });

        if (result.status === 'valid') validCount++;
        if (result.isDisposable) disposableCount++;
        processed++;
      }

      // Update progress in database or send WebSocket update
      // (Implement real-time updates if needed)
    }

    // Update stats
    const stats = await VerificationStats.findOne({ where: { userId } }) 
      || await VerificationStats.create({ userId });

    stats.totalVerified += processed;
    stats.validCount += validCount;
    stats.disposableCount += disposableCount;
    stats.invalidCount += (processed - validCount);
    stats.lastVerification = new Date();
    await stats.save();

    // Deduct credits
    await User.decrement('credits', { 
      by: processed, 
      where: { id: userId } 
    });

    // Clean up file
    await fs.unlink(filePath).catch(() => {});

    console.log(`Batch ${batchId} completed: ${processed} emails processed`);

  } catch (error) {
    console.error(`Batch ${batchId} processing error:`, error);
    
    // Clean up file on error
    if (filePath) {
      await fs.unlink(filePath).catch(() => {});
    }
  }
}

function convertToCSV(data) {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const rows = data.map(row => 
    headers.map(header => `"${row[header] || ''}"`).join(',')
  );
  
  return [headers.join(','), ...rows].join('\n');
}

module.exports = verificationController;