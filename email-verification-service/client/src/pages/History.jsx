import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';

const History = () => {
  const mockData = [
    { id: 1, email: 'test@gmail.com', status: 'valid', date: '2024-01-15' },
    { id: 2, email: 'admin@company.com', status: 'role_account', date: '2024-01-14' },
    { id: 3, email: 'user@tempmail.com', status: 'disposable', date: '2024-01-14' },
    { id: 4, email: 'invalid-email', status: 'invalid', date: '2024-01-13' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'valid': return 'success';
      case 'invalid': return 'error';
      case 'disposable': return 'warning';
      case 'role_account': return 'info';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h5" gutterBottom>
        Verification History
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockData.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={row.status} 
                    color={getStatusColor(row.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{row.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default History;
