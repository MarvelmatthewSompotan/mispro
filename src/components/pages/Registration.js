import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../atoms/Button';

const Registration = () => {
  const navigate = useNavigate();

  const handlePrintClick = () => {
    navigate('/print');
  };

  return (
    <div style={{ padding: 32 }}>
      <h1>Registration Page</h1>
      <p>This is the Registration page content.</p>
      <Button onClick={handlePrintClick}>
        Go to Print Page
      </Button>
    </div>
  );
};

export default Registration; 