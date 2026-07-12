import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAgentProfile } from '../useAgentData.js';
import { BASE_URL } from '../../../../constants/EndPoints.js';
import '../../RealEstateAgents/AgentPannel.css';
import ComingSoonPage from '../../../SharedModule/ComingSoon/ComingSoon.jsx';

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AgentRightPanel() {

  const { profile, loading, error } = useAgentProfile();
  const { t } = useTranslation();

  if (loading) return (
    <div className="agent-right-panel">
      <div className="arp-skeleton" style={{ height: '32px', width: '140px', alignSelf: 'flex-end' }} />
      <div className="arp-skeleton" style={{ height: '180px', borderRadius: '14px' }} />
      <div className="arp-skeleton" style={{ height: '16px', width: '80%' }} />
      <div className="arp-skeleton" style={{ height: '16px', width: '60%' }} />
    </div>
  );

  if (error) return <ComingSoonPage title="Agent Profile" subtitle="The profile panel is temporarily unavailable." />;

  return (
    <div className="agent-right-panel">

      {/* ── Verified Badge ── */}
      {profile?.isActive && (
        <div className="arp-verified-badge">
          <i className="fa-solid fa-circle-check" />
          {t('re_broker_verified')}
        </div>
      )}

      {/* ── Logo Card ── */}
      <div className="arp-logo-card">
        {profile?.logoPath && (
          <img
            src={`${BASE_URL}/images/${profile.logoPath}`}
            alt={profile.nameEn}
            loading="lazy"
          />
        )}
        <div className="arp-logo-card-overlay">
          <p className="arp-logo-card-label">{t('live_preview')}</p>
          <p className="arp-logo-card-name">{profile?.nameEn || t('agent_office')}</p>
        </div>
      </div>

      {/* ── Info Rows ── */}
      <div>
        <div className="arp-info-row">
          <span className="arp-info-label">{t('license_number')}</span>
          <span className="arp-info-value">{profile?.licenseNumber || '—'}</span>
        </div>
        <div className="arp-info-row">
          <span className="arp-info-label">{t('cr_number')}</span>
          <span className="arp-info-value">{profile?.cr || '—'}</span>
        </div>
        <div className="arp-info-row">
          <span className="arp-info-label">{t('verification_tier')}</span>
          <span className="arp-info-value elite">
            <i className="fa-solid fa-circle-check" /> {t('elite')}
          </span>
        </div>
      </div>

      {/* ── Agent Tip ── */}
      <div className="arp-tip-box">
        <i className="fa-solid fa-circle-info" />
        <div>
          <p className="arp-tip-title">{t('agent_tip')}</p>
          <p className="arp-tip-text">{t('agent_tip_text')}</p>
        </div>
      </div>

      {/* ── License Box ── */}
      <div className="arp-license-box">
        <i className="fa-solid fa-qrcode" />
        <p className="arp-license-text">{t('ejar_ready')}</p>
      </div>

    </div>
  );
}