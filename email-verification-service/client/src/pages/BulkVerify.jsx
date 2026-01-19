import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';

const BulkVerify = () => {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      alert(`File selected: ${file.name}\nMock upload started...`);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h5" gutterBottom>
        Bulk Email Verification
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Upload CSV File
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Upload a CSV file with emails. Each email should be in a column named "email"
        </Alert>
        
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <input
            accept=".csv"
            style={{ display: 'none' }}
            id="csv-upload"
            type="file"
            onChange={handleFileUpload}
          />
          <label htmlFor="csv-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<UploadIcon />}
              size="large"
            >
              Choose CSV File
            </Button>
          </label>
        </Box>
        
        <Typography variant="body2" color="text.secondary">
          <strong>CSV Format Example:</strong><br />
          email<br />
          test1@gmail.com<br />
          test2@yahoo.com<br />
          admin@company.com
        </Typography>
      </Paper>
    </Container>
  );
};

export default BulkVerify;
