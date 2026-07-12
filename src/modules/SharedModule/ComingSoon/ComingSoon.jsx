import React from 'react';
import comingSoonImage from '../../../assets/imgs/comingsoon.png';

export default function ComingSoonPage({ title = 'Coming Soon', subtitle = 'This page is under construction.' }) {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'linear-gradient(135deg, #f8fafc 0%, #eef4ff 100%)',
    }}>
      <div style={{
        maxWidth: 560,
        width: '100%',
        textAlign: 'center',
        background: '#fff',
        borderRadius: 24,
        padding: '32px 24px',
        boxShadow: '0 16px 48px rgba(15, 23, 42, 0.08)',
      }}>
        <div style={{ marginBottom: 20 }}>
          <img src={comingSoonImage} alt="Coming soon" style={{ width: 180, maxWidth: '100%', height: 'auto' }} />
        </div>
        <h2 style={{ marginBottom: 8, fontSize: 30, color: '#0f172a' }}>{title}</h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: 16, lineHeight: 1.7 }}>{subtitle}</p>
      </div>
    </div>
  );
}
