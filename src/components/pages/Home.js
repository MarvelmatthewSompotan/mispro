import React from 'react';
import WelcomeBanner from '../molecules/WelcomeBanner';
import StatCard from '../molecules/StatCard';
import ColorGrid from '../molecules/ColorGrid';
import Avatar from '../atoms/Avatar';
import userAvatar from '../../assets/user.png'; // Placeholder, ganti jika ada gambar user

const Home = () => (
  <>
    {/* Avatar user kanan atas dihilangkan karena sudah ada di HeaderBar */}
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingTop: 90 }}>
      <div style={{ marginBottom: 32 }}>
        <WelcomeBanner name="Sarah" />
      </div>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 24 }}>
        <div style={{ flex: 2, minWidth: 320 }}>
          <ColorGrid />
        </div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <StatCard value="1200" label="Total active students" />
        </div>
      </div>
      <div style={{ minHeight: 120 }}>
        {/* Placeholder untuk card kosong kanan bawah */}
        <div style={{ background: '#fff', borderRadius: 20, minHeight: 120, boxShadow: '0 2px 12px #0001' }} />
      </div>
    </div>
  </>
);

export default Home; 