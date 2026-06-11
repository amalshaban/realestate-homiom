import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { apiKey } from '../../../../constants/Validations.js';
import { USERS_URLs } from '../../../../constants/EndPoints.js';

// ─── Constants ────────────────────────────────────────────────────────────────
const headers = () => ({
  Authorization: `Bearer ${sessionStorage.token}`,
  apiKey,
  'Content-Type': 'application/json',
});

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PurchaseRequestsUser() {

  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get(USERS_URLs.PurchaseRequests, { headers: headers() });
        setRequests(response.data || []);
      } catch (err) {
        setError(err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 1: return <span className="badge" style={{ background: '#fff3cd', color: '#856404', borderRadius: 20, padding: '4px 12px' }}>{t('pending')}</span>;
      case 2: return <span className="badge" style={{ background: '#d1e7dd', color: '#0a3622', borderRadius: 20, padding: '4px 12px' }}>{t('accepted')}</span>;
      case 3: return <span className="badge" style={{ background: '#f8d7da', color: '#842029', borderRadius: 20, padding: '4px 12px' }}>{t('rejected')}</span>;
      default: return <span>{status}</span>;
    }
  };

  if (loading) return (
    <div className="p-4">
      {[1,2,3].map(i => (
        <div key={i} className="skeleton mb-3" style={{ height: 48, borderRadius: 8 }} />
      ))}
    </div>
  );

  if (error) return (
    <div className="alert alert-danger m-4">{t('failed_load_data')}</div>
  );

  return (
    <div className="p-4">

      {/* ── Header ── */}
      <div className="d-flex align-items-center gap-2 mb-4">
        <i className="fa-solid fa-hand-holding-dollar" style={{ color: '#0088BD', fontSize: 20 }} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0b0d2a', margin: 0 }}>
          {t('purchase_requests')}
        </h2>
        <span style={{
          background: '#e8f4fd', color: '#0088BD',
          borderRadius: 20, padding: '2px 12px', fontSize: 13, fontWeight: 600,
        }}>
          {requests.length}
        </span>
      </div>

      {/* ── Empty ── */}
      {requests.length === 0 && (
        <div className="text-center py-5 text-muted">
          <i className="fa-solid fa-hand-holding-dollar" style={{ fontSize: 40, marginBottom: 12, display: 'block', color: '#ddd' }} />
          <p>{t('no_purchase_requests')}</p>
        </div>
      )}

      {/* ── Table ── */}
      {requests.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table className="table table-hover align-middle">
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th>{t('property_name')}</th>
                <th>{t('request_date')}</th>
                <th>{t('offered_price')}</th>
                <th>{t('status')}</th>
                <th>{t('notes')}</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.requestId}>
                  <td style={{ fontWeight: 600 }}>{req.propertyName}</td>
                  <td style={{ color: '#888', fontSize: 13 }}>{formatDate(req.requestDate)}</td>
                  <td>{req.offeredPrice?.toLocaleString()} SAR</td>
                  <td>{getStatusBadge(req.status)}</td>
                  <td style={{ color: '#888', fontSize: 13 }}>{req.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}