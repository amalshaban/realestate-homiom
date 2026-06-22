import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAgentProperties } from '../useAgentData.js';
import DeleteProperty from '../../../PropertiesModule/DeleteProperty/DeleteProperty.jsx';
import '../AgentPannel.css';

// ─── Sub Components ───────────────────────────────────────────────────────────
const SkeletonRows = () => (
  <tbody>
    {[1, 2, 3, 4, 5].map(i => (
      <tr key={i}>
        <td colSpan={5}>
          <div className="ap-skeleton-row">
            <div className="ap-skeleton" style={{ width: '30%' }} />
            <div className="ap-skeleton" style={{ width: '15%' }} />
            <div className="ap-skeleton" style={{ width: '15%' }} />
            <div className="ap-skeleton" style={{ width: '15%' }} />
            <div className="ap-skeleton" style={{ width: '10%' }} />
          </div>
        </td>
      </tr>
    ))}
  </tbody>
);

const PropertyRow = ({ property, onView, onEdit, onDelete, t }) => (
  <tr>
    <td>
      <p className="ap-table-title">{property.title}</p>
      <p className="ap-table-desc">{property.description}</p>
    </td>
    <td>
      <span className="ap-table-price">
        {property.price?.toLocaleString()} SAR
      </span>
    </td>
    <td>
      <span className={`ap-badge ${property.forRent ? 'rent' : 'sale'}`}>
        {property.forRent ? t('for_rent') : t('for_sale')}
      </span>
    </td>
    <td>
      <span className={`ap-badge ${property.status?.toLowerCase() === 'active' ? 'active' : 'inactive'}`}>
        {property.status || t('active')}
      </span>
    </td>
    <td>
      <div className="ap-actions">
        <button className="ap-action-btn view" onClick={() => onView(property.id)} title={t('view')}>
          <i className="fa-solid fa-eye" />
        </button>
        <button className="ap-action-btn edit" onClick={() => onEdit(property.id)} title={t('edit')}>
          <i className="fa-solid fa-pen" />
        </button>
        <button className="ap-action-btn delete" onClick={() => onDelete(property)} title={t('delete')}>
          <i className="fa-solid fa-trash" />
        </button>
      </div>
    </td>
  </tr>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AgentProperties() {

  const { t } = useTranslation();
  const { properties, loading, error, refetch } = useAgentProperties();
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const navigate = useNavigate();

  const handleView   = useCallback((id) => navigate(`/properties/property/${id}`), [navigate]);
  const handleEdit   = useCallback((id) => navigate(`/agentpannel/editproperty/${id}`), [navigate]);
  const handleDelete = useCallback((property) => setPropertyToDelete(property), []);
  const handleCloseDelete = useCallback(() => setPropertyToDelete(null), []);
  const handleDeleted     = useCallback(async () => {
    await refetch();
    setPropertyToDelete(null);
  }, [refetch]);

  return (
    <div className="agent-properties-page">

      {/* ── Header ── */}
      <div className="agent-properties-header">
        <div>
          <h2 className="agent-properties-title">{t('my_properties')}</h2>
          <p className="agent-properties-count">
            {properties.length} {t('properties_listed')}
          </p>
        </div>
        <button
          className="ap-action-btn"
          style={{ width: 'auto', padding: '10px 20px', background: '#0b0d2a', color: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: 600 }}
          onClick={() => navigate('/agentpannel/addproperty')}
        >
          <i className="fa-solid fa-plus me-2" />
          {t('add_property')}
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="ap-error">
          <i className="fa-solid fa-circle-exclamation" />
          {t('failed_load_properties')}
          <button
            onClick={refetch}
            style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {t('try_again')}
          </button>
        </div>
      )}

      {/* ── Table ── */}
      <table className="agent-properties-table">
        <thead>
          <tr>
            <th>{t('property')}</th>
            <th>{t('offered_price')}</th>
            <th>{t('listing_category')}</th>
            <th>{t('status')}</th>
            <th>{t('action')}</th>
          </tr>
        </thead>

        {loading ? <SkeletonRows /> : (
          <tbody>
            {properties.length > 0 ? (
              properties.map(property => (
                <PropertyRow
                  key={property.id}
                  property={property}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  t={t}
                />
              ))
            ) : (
              <tr>
                <td colSpan={5}>
                  <div className="ap-empty">
                    <i className="fa-solid fa-building-circle-xmark" />
                    <p>{t('no_properties_found')}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        )}
      </table>

      {/* ── Delete Modal ── */}
      {propertyToDelete && (
        <DeleteProperty
          propertyId={propertyToDelete.id}
          propertyTitle={propertyToDelete.title}
          onClose={handleCloseDelete}
          onDeleted={handleDeleted}
        />
      )}

    </div>
  );
}