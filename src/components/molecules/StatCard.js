import React from 'react';
import Card from '../atoms/Card';
import Avatar from '../atoms/Avatar';
import mascot from '../../assets/mascot.png';
import './StatCard.css';

const StatCard = ({ value, label }) => (
  <Card className="stat-card">
    <div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
    <Avatar src={mascot} alt="Mascot" size={48} />
  </Card>
);

export default StatCard; 