import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../../AuthModule/context/AuthContext';
import profileimg from '../../../../assets/imgs/profile.png';
import { BASE_URL } from '../../../../constants/EndPoints.js';

// ─── Main Component ───────────────────────────────────────────────────────────
export default function UserNav() {

  const { loginData } = useContext(AuthContext);
  const { t } = useTranslation();

  const photo     = loginData?.Photo || '';
  const photoLink = photo ? `${BASE_URL}/images/${photo}` : profileimg;

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="pannel-nav p-1 d-flex flex-column flex-md-row justify-content-between w-100">

          {/* ── Search ── */}
          <div className="search-side w-75">
            <i className="fa-solid fa-magnifying-glass" />
            <span className="ms-1">{t('search')}</span>
          </div>

          {/* ── Icons ── */}
          <div className="icons-side w-100 d-flex justify-content-end align-items-center gap-3">
            <i className="fa-regular fa-bell" style={{ fontSize: 18, cursor: 'pointer', color: '#555' }} />
            <i className="fa-regular fa-envelope" style={{ fontSize: 18, cursor: 'pointer', color: '#555' }} />
            <img
              className="profile"
              src={photoLink}
              alt="Profile"
              style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }}
            />
          </div>

        </div>
      </div>
    </div>
  );
}