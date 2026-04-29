import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AgentNav        from '../AgentNav/AgentNav.jsx';
import AgentSideBar    from '../AgentSideBar/AgentSideBar.jsx';
import AgentRightPannel from '../AgentRightPannel/AgentRightPannel.jsx';
import '../../RealEstateAgents/AgentPannel.css';

export default function AgentPannel() {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <AgentNav onMenuClick={() => setSidebarOpen(true)} />

      <div className="container-fluid px-0 agent-panel-page">
        <div className="row g-0 h-100">

          {/* ── Overlay ── */}
          <div
            className={`agent-panel-overlay ${sidebarOpen ? 'open' : ''}`}
            onClick={() => setSidebarOpen(false)}
          />

          {/* ── Sidebar ── */}
          <div className={`col-md-2 agent-panel-sidebar ${sidebarOpen ? 'open' : ''}`}>
            <AgentSideBar onClose={() => setSidebarOpen(false)} />
          </div>

          {/* ── Main Content ── */}
          <div className="col-md-8 agent-panel-content">
            <Outlet />
          </div>

          {/* ── Right Panel ── */}
          <div className="col-md-2 agent-panel-right">
            <AgentRightPannel />
          </div>

        </div>
      </div>
    </>
  );
}