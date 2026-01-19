import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import './App.css';

// Create a simple Login component
const Login = ({ setIsAuthenticated }) => {
  const handleLogin = () => {
    localStorage.setItem('token', 'mock_token');
    setIsAuthenticated(true);
    window.location.href = '/dashboard';
  };

  return (
    <div style={{ 
      maxWidth: '400px', 
      margin: '100px auto', 
      padding: '20px',
      border: '1px solid #ccc',
      borderRadius: '8px',
      textAlign: 'center'
    }}>
      <h2>Email Verification Service</h2>
      <p>Please login to continue</p>
      <button 
        onClick={handleLogin}
        style={{
          padding: '10px 20px',
          background: '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Login (Demo)
      </button>
      <div style={{ marginTop: '20px', color: '#666' }}>
        <p>Email: admin@example.com</p>
        <p>Password: admin123</p>
      </div>
    </div>
  );
};

// Create a simple Dashboard component
const Dashboard = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginTop: '20px'
      }}>
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
          <h3>Single Email Verification</h3>
          <p>Verify individual email addresses</p>
          <button style={{ padding: '8px 16px', marginTop: '10px' }}>
            Start
          </button>
        </div>
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
          <h3>Bulk Verification</h3>
          <p>Upload CSV with multiple emails</p>
          <button style={{ padding: '8px 16px', marginTop: '10px' }}>
            Upload CSV
          </button>
        </div>
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
          <h3>Verification History</h3>
          <p>View past verification results</p>
          <button style={{ padding: '8px 16px', marginTop: '10px' }}>
            View History
          </button>
        </div>
      </div>
    </div>
  );
};

// PrivateRoute component
const PrivateRoute = ({ children, isAuthenticated }) => {
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Main App component
function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(
    !!localStorage.getItem('token')
  );

  const theme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#1976d2',
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster position="top-right" />
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={
            <Login setIsAuthenticated={setIsAuthenticated} />
          } />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Dashboard />
            </PrivateRoute>
          } />
          
          {/* Default route */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;