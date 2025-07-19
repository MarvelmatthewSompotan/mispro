import React from 'react';
import HeaderBar from '../molecules/HeaderBar';
import SidebarMenu from '../molecules/SidebarMenu';

const Main = ({ children }) => {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <HeaderBar />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <SidebarMenu />
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto', backgroundColor: '#f5f5f5', marginTop: '76px' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Main; 