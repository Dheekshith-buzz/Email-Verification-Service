import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Paper
} from '@mui/material';
import {
  Email as EmailIcon,
  Upload as UploadIcon,
  History as HistoryIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const navigate = useNavigate();

  const stats = [
    { label: 'Total Verified', value: '150', color: 'primary' },
    { label: 'Valid Emails', value: '120', color: 'success.main' },
    { label: 'Invalid Emails', value: '30', color: 'error.main' },
    { label: 'Credits Left', value: '95', color: 'warning.main' }
  ];

  const features = [
    {
      title: 'Single Verification',
      description: 'Verify individual email addresses',
      icon: <EmailIcon fontSize="large" color="primary" />,
      action: () => navigate('/verify/single'),
      buttonText: 'Start Verification'
    },
    {
      title: 'Bulk Verification',
      description: 'Upload CSV with multiple emails',
      icon: <UploadIcon fontSize="large" color="success" />,
      action: () => navigate('/verify/bulk'),
      buttonText: 'Upload CSV'
    },
    {
      title: 'Verification History',
      description: 'View past verification results',
      icon: <HistoryIcon fontSize="large" color="action" />,
      action: () => navigate('/history'),
      buttonText: 'View History'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color={stat.color}>
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Features */}
      <Grid container spacing={3}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {feature.description}
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={feature.action}
                  fullWidth
                >
                  {feature.buttonText}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Dashboard;
