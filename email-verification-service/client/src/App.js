import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Paper,
  TextField,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Email as EmailIcon,
  Upload as UploadIcon,
  History as HistoryIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  CheckCircle,
  Cancel,
  Warning
} from '@mui/icons-material';
import './App.css';

// ========== THEME ==========
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// ========== COMPONENTS ==========

// Layout Component
const Layout = ({ children, onLogout, credits }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Single Verify', icon: <EmailIcon />, path: '/verify/single' },
    { text: 'Bulk Verify', icon: <UploadIcon />, path: '/verify/bulk' },
    { text: 'History', icon: <HistoryIcon />, path: '/history' },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            sx={{ mr: 2 }}
            onClick={() => setDrawerOpen(!drawerOpen)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Email Verification Service
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Credits: <strong>{credits}</strong>
          </Typography>
          <IconButton color="inherit" onClick={onLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem 
              button 
              key={item.text}
              component={Link}
              to={item.path}
              onClick={() => setDrawerOpen(false)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar /> {/* Spacer for AppBar */}
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>
    </Box>
  );
};

// Login Component
const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Mock API call
    setTimeout(() => {
      localStorage.setItem('token', 'mock_jwt_token');
      localStorage.setItem('user', JSON.stringify({ 
        email, 
        credits: 100,
        name: 'Admin User'
      }));
      setIsAuthenticated(true);
      setLoading(false);
    }, 1000);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Email Verification Service
        </Typography>
        <Typography variant="h6" align="center" gutterBottom color="primary">
          Login
        </Typography>

        <form onSubmit={handleLogin}>
          <TextField
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            disabled={loading}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            disabled={loading}
          />
          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </form>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            <strong>Demo Credentials:</strong><br />
            Email: admin@example.com<br />
            Password: admin123
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

// Dashboard Component
const Dashboard = () => {
  const stats = [
    { label: 'Total Verified', value: '150', color: 'primary', icon: <EmailIcon /> },
    { label: 'Valid Emails', value: '120', color: 'success.main', icon: <CheckCircle /> },
    { label: 'Invalid Emails', value: '30', color: 'error.main', icon: <Cancel /> },
    { label: 'Credits Left', value: '95', color: 'warning.main', icon: <Warning /> },
  ];

  const recentVerifications = [
    { email: 'test@gmail.com', status: 'valid', time: '2 min ago' },
    { email: 'admin@company.com', status: 'role', time: '5 min ago' },
    { email: 'temp@mailinator.com', status: 'disposable', time: '10 min ago' },
    { email: 'invalid-email', status: 'invalid', time: '15 min ago' },
  ];

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ color: stat.color, mb: 1 }}>
                  {stat.icon}
                </Box>
                <Typography variant="h4" color={stat.color}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Verifications
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentVerifications.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={row.status}
                          size="small"
                          color={
                            row.status === 'valid' ? 'success' :
                            row.status === 'invalid' ? 'error' :
                            row.status === 'disposable' ? 'warning' : 'info'
                          }
                        />
                      </TableCell>
                      <TableCell>{row.time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button 
                variant="contained" 
                component={Link}
                to="/verify/single"
                startIcon={<EmailIcon />}
                fullWidth
              >
                Single Verification
              </Button>
              <Button 
                variant="contained" 
                color="success"
                component={Link}
                to="/verify/bulk"
                startIcon={<UploadIcon />}
                fullWidth
              >
                Bulk Verification
              </Button>
              <Button 
                variant="outlined"
                component={Link}
                to="/history"
                startIcon={<HistoryIcon />}
                fullWidth
              >
                View History
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

// Single Verification Component
const SingleVerify = () => {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!email) {
      alert('Please enter an email address');
      return;
    }

    setLoading(true);
    
    // Mock API call
    setTimeout(() => {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const isDisposable = email.includes('tempmail') || email.includes('mailinator');
      const isRoleAccount = email.startsWith('admin@') || email.startsWith('support@');
      
      let status = 'valid';
      if (!isValid) status = 'invalid_format';
      else if (isDisposable) status = 'disposable';
      else if (isRoleAccount) status = 'role_account';
      
      setResult({
        email,
        isValid,
        isDisposable,
        isRoleAccount,
        status,
        mxRecords: isValid ? [{ exchange: 'mx.example.com', priority: 10 }] : [],
        timestamp: new Date().toISOString()
      });
      setLoading(false);
    }, 1500);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'valid': return 'success';
      case 'invalid_format': return 'error';
      case 'disposable': return 'warning';
      case 'role_account': return 'info';
      default: return 'default';
    }
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
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
            disabled={loading}
          />
          <Button
            variant="contained"
            onClick={handleVerify}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <EmailIcon />}
            sx={{ minWidth: '120px', height: '56px' }}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </Button>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Enter any email address to verify its validity
        </Typography>
      </Paper>

      {result && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Verification Results
          </Typography>
          
          <Alert 
            severity={result.isValid ? 'success' : 'error'}
            sx={{ mb: 3 }}
            icon={result.isValid ? <CheckCircle /> : <Cancel />}
          >
            <strong>
              {result.status === 'valid' ? 'Valid Email' :
               result.status === 'disposable' ? 'Disposable Email' :
               result.status === 'role_account' ? 'Role Account' :
               'Invalid Email Format'}
            </strong>
          </Alert>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography variant="body1">{result.email}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Chip 
                  label={result.status.toUpperCase()} 
                  color={getStatusColor(result.status)}
                  size="small"
                />
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">Format</Typography>
                <Typography variant="h6" color={result.isValid ? 'success.main' : 'error.main'}>
                  {result.isValid ? '✓ Valid' : '✗ Invalid'}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">Disposable</Typography>
                <Typography variant="h6" color={result.isDisposable ? 'warning.main' : 'success.main'}>
                  {result.isDisposable ? 'Yes' : 'No'}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">Role Account</Typography>
                <Typography variant="h6" color={result.isRoleAccount ? 'info.main' : 'success.main'}>
                  {result.isRoleAccount ? 'Yes' : 'No'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Test Examples */}
      <Paper elevation={1} sx={{ p: 2, mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Try these examples:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {[
            'test@gmail.com',
            'admin@company.com',
            'temp@mailinator.com',
            'invalid-email',
            'support@organization.org'
          ].map((example) => (
            <Chip
              key={example}
              label={example}
              onClick={() => setEmail(example)}
              variant="outlined"
              size="small"
            />
          ))}
        </Box>
      </Paper>
    </>
  );
};

// Bulk Verification Component
const BulkVerify = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      alert('Please select a CSV file');
    }
  };

  const handleUpload = () => {
    if (!file) {
      alert('Please select a CSV file first');
      return;
    }

    setUploading(true);
    
    // Mock upload
    setTimeout(() => {
      alert(`File "${file.name}" uploaded successfully!\nMock verification started.`);
      setUploading(false);
      setFile(null);
      document.getElementById('csv-upload').value = '';
    }, 2000);
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Bulk Email Verification
      </Typography>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Upload CSV File
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Upload a CSV file containing email addresses. Each email should be in a column named "email".
          Maximum file size: 10MB
        </Alert>
        
        <Box sx={{ 
          border: '2px dashed #ccc', 
          borderRadius: '8px',
          p: 4,
          textAlign: 'center',
          mb: 3
        }}>
          <input
            accept=".csv"
            style={{ display: 'none' }}
            id="csv-upload"
            type="file"
            onChange={handleFileSelect}
          />
          <label htmlFor="csv-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<UploadIcon />}
              size="large"
              disabled={uploading}
            >
              {file ? 'Change File' : 'Choose CSV File'}
            </Button>
          </label>
          
          {file && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1">
                Selected: <strong>{file.name}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Size: {(file.size / 1024).toFixed(2)} KB
              </Typography>
            </Box>
          )}
        </Box>
        
        <Button
          variant="contained"
          color="success"
          onClick={handleUpload}
          disabled={!file || uploading}
          startIcon={uploading ? <CircularProgress size={20} /> : null}
          fullWidth
          size="large"
        >
          {uploading ? 'Processing...' : 'Start Verification'}
        </Button>
      </Paper>

      {/* CSV Format Guide */}
      <Paper elevation={1} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          CSV Format Requirements
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2">Required Format:</Typography>
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '10px', 
              borderRadius: '4px',
              overflow: 'auto'
            }}>
{`email
test1@gmail.com
test2@yahoo.com
admin@company.com
user@organization.org
contact@business.com`}
            </pre>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2">Tips:</Typography>
            <ul>
              <li>First row should contain column headers</li>
              <li>Email column must be named "email" (case insensitive)</li>
              <li>One email per line</li>
              <li>Maximum 10,000 emails per file</li>
              <li>Empty lines will be ignored</li>
              <li>Invalid emails will be marked accordingly</li>
            </ul>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
};

// History Component
const History = () => {
  const [verifications] = useState([
    { id: 1, email: 'test@gmail.com', status: 'valid', type: 'single', date: '2024-01-15 10:30', credits: 1 },
    { id: 2, email: 'admin@company.com', status: 'role_account', type: 'single', date: '2024-01-15 09:15', credits: 1 },
    { id: 3, email: 'temp@mailinator.com', status: 'disposable', type: 'single', date: '2024-01-14 16:45', credits: 1 },
    { id: 4, email: 'batch_001.csv', status: 'completed', type: 'bulk', date: '2024-01-14 14:20', credits: 50 },
    { id: 5, email: 'invalid-email', status: 'invalid_format', type: 'single', date: '2024-01-13 11:10', credits: 1 },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'valid': return 'success';
      case 'invalid_format': return 'error';
      case 'disposable': return 'warning';
      case 'role_account': return 'info';
      case 'completed': return 'primary';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'valid': return 'Valid';
      case 'invalid_format': return 'Invalid Format';
      case 'disposable': return 'Disposable';
      case 'role_account': return 'Role Account';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Verification History
      </Typography>

      <Paper elevation={2} sx={{ p: 0 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Email / Batch</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Credits</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {verifications.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>#{row.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {row.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={row.type.toUpperCase()}
                      size="small"
                      variant="outlined"
                      color={row.type === 'bulk' ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusText(row.status)}
                      size="small"
                      color={getStatusColor(row.status)}
                    />
                  </TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="text.secondary">
                      {row.credits} credit{row.credits !== 1 ? 's' : ''}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Stats Summary */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Summary
            </Typography>
            <Typography variant="body2">
              Showing {verifications.length} verification records
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Total Credits Used
            </Typography>
            <Typography variant="h5" color="primary">
              {verifications.reduce((sum, row) => sum + row.credits, 0)} credits
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

// Private Route Component
const PrivateRoute = ({ children, isAuthenticated }) => {
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// ========== MAIN APP COMPONENT ==========
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });
  const [user, setUser] = useState(() => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : { credits: 100 };
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser({ credits: 100 });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster position="top-right" />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" /> : 
                <Login setIsAuthenticated={setIsAuthenticated} />
            } 
          />

          {/* Protected Routes */}
          <Route 
            path="/" 
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Layout onLogout={handleLogout} credits={user.credits}>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Layout onLogout={handleLogout} credits={user.credits}>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/verify/single" 
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Layout onLogout={handleLogout} credits={user.credits}>
                  <SingleVerify />
                </Layout>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/verify/bulk" 
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Layout onLogout={handleLogout} credits={user.credits}>
                  <BulkVerify />
                </Layout>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/history" 
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Layout onLogout={handleLogout} credits={user.credits}>
                  <History />
                </Layout>
              </PrivateRoute>
            } 
          />

          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;