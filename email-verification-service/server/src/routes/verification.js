const express = require('express');
const router = express.Router();
const multer = require('multer');
const verificationController = require('../controllers/verificationController');
const { authMiddleware } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.csv')
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Protected routes (require authentication)
router.post('/single', authMiddleware, verificationController.verifySingle);
router.post('/bulk', authMiddleware, upload.single('file'), verificationController.verifyBulk);
router.get('/batch/:batchId', authMiddleware, verificationController.getBatchResults);
router.get('/history', authMiddleware, verificationController.getHistory);
router.post('/export', authMiddleware, verificationController.exportResults);

// API key routes (for programmatic access)
router.post('/api/single', require('../middleware/auth').apiKeyAuth, verificationController.verifySingle);
router.post('/api/bulk', require('../middleware/auth').apiKeyAuth, upload.single('file'), verificationController.verifyBulk);

module.exports = router;