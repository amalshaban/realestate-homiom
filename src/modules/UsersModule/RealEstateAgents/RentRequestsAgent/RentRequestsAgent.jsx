import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useRentalRequests } from '../hooks/useAgentData.js';

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RentRequestsAgent() {

  const { t } = useTranslation();
  const { requests, loading, error, accepting, acceptRequest } = useRentalRequests();

  const handleAccept = useCallback(async (id) => {
    await acceptRequest(id);
    toast.success(t('rent_request_accepted'));
  }, [acceptRequest, t]);

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
        <i className="fa-solid fa-key" style={{ color: '#0088BD', fontSize: 20 }} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0b0d2a', margin: 0 }}>
          {t('rent_requests')}
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
          <i className="fa-solid fa-key" style={{ fontSize: 40, marginBottom: 12, display: 'block', color: '#ddd' }} />
          <p>{t('no_rent_requests')}</p>
        </div>
      )}

      {/* ── Table ── */}
      {requests.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table className="table table-hover align-middle">
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th>{t('property_name')}</th>
                <th>{t('offered_price')}</th>
                <th>{t('user_name')}</th>
                <th>{t('user_phone')}</th>
                <th>{t('notes')}</th>
                <th>{t('action')}</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.requestId}>
                  <td style={{ fontWeight: 600 }}>{req.propertyName}</td>
                  <td>{req.offeredPrice?.toLocaleString()} SAR</td>
                  <td>{req.userName}</td>
                  <td>{req.userPhone}</td>
                  <td style={{ color: '#888', fontSize: 13 }}>{req.notes || '—'}</td>
                  <td>
                    <button
                      className="btn btn-sm"
                      style={{
                        background: '#0b0d2a', color: '#fff',
                        borderRadius: 8, padding: '5px 16px', fontSize: 13,
                      }}
                      onClick={() => handleAccept(req.requestId)}
                      disabled={accepting === req.requestId}
                    >
                      {accepting === req.requestId
                        ? <span className="spinner-border spinner-border-sm" />
                        : t('accept')
                      }
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}