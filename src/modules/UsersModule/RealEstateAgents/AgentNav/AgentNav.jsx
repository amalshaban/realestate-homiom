import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../AuthModule/context/AuthContext';
import profileimg from '../../../../assets/imgs/profile.png';
import '../../RealEstateAgents/AgentPannel.css';

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_URL = 'https://realstate.niledevelopers.com/images/';

const NAV_LINKS = [
  { label: 'Marketplace', to: '/agentlayout/marketplace' },
  { label: 'Insights',    to: '/agentlayout/insights'    },
  { label: 'Concierge',   to: '/agentlayout/concierge'   },
];


// ─── Main Component ───────────────────────────────────────────────────────────
export default function AgentNav({onMenuClick}) {

  const { loginData } = useContext(AuthContext);
  const navigate = useNavigate();

  const photo     = loginData?.Photo || '';
  const photoLink = photo ? `${BASE_URL}${photo}` : profileimg;

  return (
    <nav className="agent-nav">
<button
  className="d-md-none me-3"
  style={{ background: 'none', border: 'none', fontSize: '20px', color: '#0b0d2a' }}
  onClick={onMenuClick}
>
  <i className="fa-solid fa-bars" />
</button>
      {/* ── Brand ── */}
      <Link to="/agentlayout/overview" className="agent-nav-brand">
        Homiom
      </Link>

      {/* ── Center Links ── */}
      <ul className="agent-nav-links">
        {NAV_LINKS.map(link => (
          <li key={link.label}>
            <Link to={link.to}>{link.label}</Link>
          </li>
        ))}
      </ul>

      {/* ── Right Side ── */}
      <div className="agent-nav-right">

        {/* Bell */}
        <button className="agent-nav-bell" title="Notifications">
          <i className="fa-regular fa-bell" />
        </button>

        {/* List Property */}
        <Link to="/agentlayout/addproperty" className="agent-nav-list-btn">
          List Property
        </Link>

        {/* Avatar */}
        <img
          src={photoLink}
          alt="Profile"
          className="agent-nav-avatar"
          onClick={() => navigate('/agentlayout/profile')}
        />

      </div>
    </nav>
  );
}