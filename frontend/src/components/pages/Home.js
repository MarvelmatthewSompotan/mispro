import React from 'react';
import StatCard from '../molecules/StatCard';
import WelcomeBanner from '../molecules/WelcomeBanner';

const Home = () => (
  <div >
    <WelcomeBanner name="Admin" />
    
    <div>
      <h2>Dashboard Statistics</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginTop: 16 }}>
        <StatCard value="150" label="Total Students" />
        <StatCard value="25" label="Total Teachers" />
        <StatCard value="8" label="Homerooms" />
        <StatCard value="95%" label="Attendance Rate" />
      </div>
    </div>
    
    <div style={{ background: '#fff', padding: 20, borderRadius: 8, marginTop: 32 }}>
      <h2>Dashboard Content</h2>
      <p>This is the main content area of the home page.</p>
    </div>
  </div>
);

export default Home; 