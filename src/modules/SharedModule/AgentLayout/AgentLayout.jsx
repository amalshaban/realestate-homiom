import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AgentNav from '../../UsersModule/RealEstateAgents/AgentNav/AgentNav';
import ComingSoonPage from '../ComingSoon/ComingSoon.jsx';

export default function AgentLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex' }}>
      <SideBar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <div
        style={{
          marginLeft: collapsed ? '80px' : '250px',
          transition: 'margin-left 0.3s ease',
          padding: '20px',
          width: '100%',
        }}
        className="container-fluid"
      >
        <AgentNav />
        <div className="row mt-3">
          <div className="col-12">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

function SideBar({ collapsed, setCollapsed }) {
  return <ComingSoonPage title="Agent Sidebar" subtitle="This section is currently being prepared." />;
}
