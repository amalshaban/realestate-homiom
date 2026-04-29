import React from 'react';
import { NavLink } from 'react-router-dom';
import '../../RealEstateAgents/AgentPannel.css';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../AuthModule/context/AuthContext.jsx';

// ─── Constants ────────────────────────────────────────────────────────────────
const SIDEBAR_LINKS = [
  { label: 'Overview',          to: '/agentpannel/overview',          icon: 'fa-solid fa-chart-pie'       },
  { label: 'My Properties',     to: '/agentpannel/properties',        icon: 'fa-solid fa-building'        },
  { label: 'Visit Requests',    to: '/agentpannel/visitrequests',     icon: 'fa-solid fa-calendar-check'  },
  { label: 'Purchase Requests', to: '/agentpannel/purchaserequests',  icon: 'fa-solid fa-hand-holding-dollar' },
  { label: 'Rent Requests',     to: '/agentpannel/rentrequests',      icon: 'fa-solid fa-file-contract'   },
  { label: 'Rents',             to: '/agentpannel/rents',             icon: 'fa-solid fa-key'             },
];


// ─── Main Component ───────────────────────────────────────────────────────────
export default function AgentSidebar({onClose}) {
  const { logOut } = useContext(AuthContext);
const navigate   = useNavigate();

const handleLogout = () => {
  logOut();
  navigate('/home');
};
  return (
    <div className="agent-sidebar">
<div className="d-md-none d-flex justify-content-end mb-2">
  <button
    style={{ background: 'none', border: 'none', fontSize: '20px', color: '#888' }}
    onClick={onClose}
  >
    <i className="fa-solid fa-xmark" />
  </button>
</div>

      {/* ── Header ── */}
      <div>
        <h5 className="ap-sidebar-title">Agent Dashboard</h5>
<p className="ap-sidebar-subtitle">Real Estate Management</p>
      </div>

      {/* ── Links ── */}
      <ul className="ap-sidebar-links">
        {SIDEBAR_LINKS.map(link => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) => `ap-sidebar-link ${isActive ? 'active' : ''}`}
            >
              <i className={link.icon} />
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>



<div className="ap-sidebar-bottom">
  <NavLink
    to="/agentpannel/help"
    className={({ isActive }) => `ap-sidebar-link ${isActive ? 'active' : ''}`}
  >
    <i className="fa-regular fa-circle-question" />
    Help Center
  </NavLink>

  {/* ── Sign Out ── */}
  <button className="ap-sidebar-link ap-signout-btn" onClick={handleLogout}>
    <i className="fa-solid fa-arrow-right-from-bracket" />
    Sign Out
  </button>
</div>
    </div>
  );
}