import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import axios from 'axios';
import { apiKey } from '../../../../constants/Validations.js';
import { BASE_URL } from '../../../../constants/EndPoints.js';

// ─── Constants ────────────────────────────────────────────────────────────────
const headers = () => ({
  Authorization: `Bearer ${sessionStorage.token}`,
  apiKey,
  'Content-Type': 'application/json',
});

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VisitRequestUser() {

  const { t } = useTranslation();
  const [requests,       setRequests]       = useState([]);
  const [suggestedDates, setSuggestedDates] = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/User/VisitRequests`, { headers: headers() });
        setRequests(response.data || []);
      } catch (err) {
        setError(err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const viewSuggestedDates = useCallback(async (visitRequestId) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/User/VisitRequests/SuggestedDates`,
        { visitRequestId },
        { headers: headers() }
      );
      setSuggestedDates(response.data || []);
    } catch {}
  }, []);

  const handleSelectDate = useCallback(async (suggestedDateId) => {
    try {
      await axios.post(
        `${BASE_URL}/User/VisitRequests/SelectDate`,
        { suggestedDateId },
        { headers: headers() }
      );
      toast.success(t('date_selected'));
    } catch {
      toast.error(t('failed_select_date'));
    }
  }, [t]);

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
        <i className="fa-solid fa-calendar-check" style={{ color: '#0088BD', fontSize: 20 }} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0b0d2a', margin: 0 }}>
          {t('visit_requests')}
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
          <i className="fa-solid fa-calendar-check" style={{ fontSize: 40, marginBottom: 12, display: 'block', color: '#ddd' }} />
          <p>{t('no_visit_requests')}</p>
        </div>
      )}

      {/* ── Table ── */}
      {requests.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table className="table table-hover align-middle">
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th>{t('request_id')}</th>
                <th>{t('property_name')}</th>
                <th>{t('agent_id')}</th>
                <th>{t('status')}</th>
                <th>{t('available_dates')}</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.requestId}>
                  <td style={{ color: '#888', fontSize: 13 }}>#{req.requestId}</td>
                  <td style={{ fontWeight: 600 }}>{req.propertyName}</td>
                  <td style={{ color: '#888', fontSize: 13 }}>{req.agentId}</td>
                  <td>{getStatusBadge(req.status)}</td>
                  <td>
                    <button
                      className="btn btn-sm"
                      style={{
                        background: '#f5f7fa', color: '#0b0d2a',
                        borderRadius: 8, padding: '5px 16px', fontSize: 13, border: '1px solid #e0e0e0',
                      }}
                      onClick={() => viewSuggestedDates(req.requestId)}
                      data-bs-toggle="modal"
                      data-bs-target="#datesModal"
                    >
                      <i className="fa-solid fa-calendar me-2" />
                      {t('view_available_dates')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal ── */}
      <div className="modal fade" id="datesModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content" style={{ borderRadius: 16 }}>

            <div className="modal-header" style={{ borderBottom: '1px solid #f0f0f0' }}>
              <h5 className="modal-title" style={{ fontWeight: 700, color: '#0b0d2a' }}>
                <i className="fa-solid fa-calendar-days me-2" style={{ color: '#0088BD' }} />
                {t('available_dates_title')}
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" />
            </div>

            <div className="modal-body">
              {suggestedDates.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="fa-solid fa-calendar-xmark" style={{ fontSize: 32, marginBottom: 8, display: 'block', color: '#ddd' }} />
                  <p>{t('no_suggested_dates')}</p>
                </div>
              ) : (
                <table className="table table-hover align-middle">
                  <thead style={{ background: '#f9fafb' }}>
                    <tr>
                      <th>#</th>
                      <th>{t('date_available')}</th>
                      <th>{t('select')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suggestedDates.map(date => (
                      <tr key={date.id}>
                        <td style={{ color: '#888', fontSize: 13 }}>{date.id}</td>
                        <td style={{ fontWeight: 600 }}>{formatDate(date.suggestedDateTime)}</td>
                        <td>
                          <input
                            type="checkbox"
                            style={{ width: 18, height: 18, cursor: 'pointer' }}
                            onChange={() => handleSelectDate(date.id)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid #f0f0f0' }}>
              <button
                type="button"
                className="btn"
                style={{ background: '#0b0d2a', color: '#fff', borderRadius: 10, padding: '8px 24px' }}
                data-bs-dismiss="modal"
              >
                {t('close')}
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}