import React from 'react';
import Card from '../atoms/Card';
import Avatar from '../atoms/Avatar';
import mascot from '../../assets/mascot.png';
import '../styles/WelcomeBanner.css';

const WelcomeBanner = ({ name = 'Sarah' }) => (
  <Card className="welcome-banner">
    <div>
      <div className="welcome-banner-title">Hello {name}!</div>
      <div className="welcome-banner-subtitle">Welcome back</div>
    </div>
    <Avatar src={mascot} alt="Mascot" size={80} />
  </Card>
);

export default WelcomeBanner; 