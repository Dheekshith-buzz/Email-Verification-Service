import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

const SingleVerify = () => {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!email) return;
    
    setLoading(true);
    // Mock API call
    setTimeout(() => {
      setResult({
        email,
        isValid: email.includes('@'),
        status: email.includes('@') ? 'valid' : 'invalid',
        message: email.includes('@') ? 'Email is valid' : 'Invalid email format'
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h5" gutterBottom>
        Single Email Verification
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <TextField
            fullWidth
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@domain.com"
          />
          <Button
            variant="contained"
            onClick={handleVerify}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
            sx={{ minWidth: '120px' }}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </Button>
        </Box>
      </Paper>

      {result && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Result
          </Typography>
          <Alert 
            severity={result.isValid ? 'success' : 'error'}
            sx={{ mb: 2 }}
          >
            {result.message}
          </Alert>
          <Typography><strong>Email:</strong> {result.email}</Typography>
          <Typography><strong>Status:</strong> {result.status}</Typography>
          <Typography><strong>Valid:</strong> {result.isValid ? 'Yes' : 'No'}</Typography>
        </Paper>
      )}
    </Container>
  );
};

export default SingleVerify;
