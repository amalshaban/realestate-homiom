
import React from 'react';
 import {useAgentProfile} from "../useAgentData.js";
import '../../RealEstateAgents/AgentPannel.css';


const BASE_IMG = 'https://realstate.niledevelopers.com/images/';

export default function AgentRightPanel() {

  const { profile, loading, error } = useAgentProfile();

  if (loading) return (
    <div className="agent-right-panel">
      <div className="arp-skeleton" style={{ height: '32px', width: '140px', alignSelf: 'flex-end' }} />
      <div className="arp-skeleton" style={{ height: '180px', borderRadius: '14px' }} />
      <div className="arp-skeleton" style={{ height: '16px', width: '80%' }} />
      <div className="arp-skeleton" style={{ height: '16px', width: '60%' }} />
    </div>
  );

  if (error) return (
    <div className="agent-right-panel">
      <p style={{ fontSize: '13px', color: '#e74c3c' }}>Failed to load profile</p>
    </div>
  );

  return (
    <div className="agent-right-panel">

      {/* ── Verified Badge ── */}
      {profile?.isActive && (
        <div className="arp-verified-badge">
          <i className="fa-solid fa-circle-check" />
          RE-Broker Verified
        </div>
      )}

      {/* ── Logo Card ── */}
      <div className="arp-logo-card">
        {profile?.logoPath && (
          <img
            src={`${BASE_IMG}${profile.logoPath}`}
            alt={profile.nameEn}
            loading="lazy"
          />
        )}
        <div className="arp-logo-card-overlay">
          <p className="arp-logo-card-label">Live Preview</p>
          <p className="arp-logo-card-name">{profile?.nameEn || 'Agent Office'}</p>
        </div>
      </div>

      {/* ── Info Rows ── */}
      <div>
        <div className="arp-info-row">
          <span className="arp-info-label">License Number</span>
          <span className="arp-info-value">{profile?.licenseNumber || '—'}</span>
        </div>
        <div className="arp-info-row">
          <span className="arp-info-label">CR Number</span>
          <span className="arp-info-value">{profile?.cr || '—'}</span>
        </div>
        <div className="arp-info-row">
          <span className="arp-info-label">Verification Tier</span>
          <span className="arp-info-value elite">
            <i className="fa-solid fa-circle-check" /> Elite
          </span>
        </div>
      </div>

      {/* ── Agent Tip ── */}
      <div className="arp-tip-box">
        <i className="fa-solid fa-circle-info" />
        <div>
          <p className="arp-tip-title">Agent Tip</p>
          <p className="arp-tip-text">
            Listing as a Licensed Agent increases lead quality by up to 45% in the Riyadh market.
          </p>
        </div>
      </div>

      {/* ── License Box ── */}
      <div className="arp-license-box">
        <i className="fa-solid fa-qrcode" />
        <p className="arp-license-text">Ejar Contract Auto-Fill Ready</p>
      </div>

    </div>
  );
}