import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from '../../../constants/EndPoints.js';
import useSearch from '../../SharedModule/Search/useSearch.js';
import PropertiesMap from '../PropertiesMap/PropertiesMap.jsx';

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_IMG = BASE_URL;

// ─── Sub Components ───────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton" style={{ height: '220px' }} />
    <div className="p-3">
      <div className="skeleton mb-2" style={{ height: '24px', width: '60%' }} />
      <div className="skeleton mb-2" style={{ height: '16px', width: '40%' }} />
      <div className="skeleton"      style={{ height: '16px', width: '80%' }} />
    </div>
  </div>
);

const PropertyCard = ({ property, onView }) => {
  const { t } = useTranslation();
  const imageUrl = property.mainImageUrl
    ? `${BASE_IMG}${property.mainImageUrl}`
    : `${BASE_IMG}/${property.image}`;

  return (
    <div className="property-card" onClick={() => onView(property.id)}>
      <div style={{ position: 'relative' }}>
        <div className="card-img-wrapper">
          <img src={imageUrl} alt={property.title} loading="lazy"
            onError={e => { e.target.style.display = 'none'; }} />
        </div>
        <span className={`badge-listing ${property.forRent ? 'badge-for-rent' : 'badge-for-sale'}`}>
          {property.forRent ? t('for_rent') : t('for_sale')}
        </span>
      </div>
      <div className="p-3">
        <div className="property-price">
          {property.price?.toLocaleString()} SAR
          {property.forRent && (
            <span style={{ fontSize: '13px', fontWeight: 400, color: '#888' }}> /{t('month')}</span>
          )}
        </div>
        <div className="d-flex align-items-center justify-content-between mb-1">
          <div className="property-location">
            <i className="fa-solid fa-location-dot" style={{ color: '#0088BD' }} />
            {property.district}, {property.city}
          </div>
          <span className="property-type-badge">{property.realStatePurpose || t('property')}</span>
        </div>
        <div className="property-specs">
          {property.bedrooms  > 0 && <span><i className="fa-solid fa-bed"           /> {property.bedrooms}</span>}
          {property.bathrooms > 0 && <span><i className="fa-solid fa-bath"          /> {property.bathrooms}</span>}
          {property.area      > 0 && <span><i className="fa-solid fa-vector-square" /> {property.area} m²</span>}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SearchResults() {

  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { results, loading, error, total, search } = useSearch();
  const [viewMode, setViewMode] = useState('grid');

  // ── جيب الـ params من الـ URL وابحث تلقائي ──
  useEffect(() => {
    const countryId  = Number(searchParams.get('countryId'))  || 0;
    const typeId     = Number(searchParams.get('typeId'))      || 0;
    const minPrice   = Number(searchParams.get('minPrice'))    || 0;
    const maxPrice   = Number(searchParams.get('maxPrice'))    || 0;
    const forRent    = searchParams.get('forRent') === 'true';

    search({ countryId, realStateTypeId: typeId, minPrice, maxPrice, forRent });
  }, [searchParams]);

  const handleViewProperty = useCallback((id) => {
    navigate(`/properties/property/${id}`);
  }, [navigate]);

  return (
    <div className="sr-page">

      {/* ── Header ── */}
      <div className="sr-header">
        <button className="sr-back-btn" onClick={() => navigate(-1)}>
          <i className="fa-solid fa-arrow-left" /> {t('back')}
        </button>
        <div>
          <h2 className="sr-title">{t('search_results')}</h2>
          {!loading && (
            <p className="sr-count">
              {total} {total === 1 ? t('property') : t('properties')} {t('found')}
            </p>
          )}
        </div>
        <div className="d-flex gap-2 ms-auto">
          <button
            className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title={t('grid_view')}
          >
            <i className="fa-solid fa-grip" />
          </button>
          <button
            className={`view-toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
            title={t('map_view')}
          >
            <i className="fa-solid fa-map" />
          </button>
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="sr-grid">
          {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="sr-empty">
          <i className="fa-solid fa-circle-exclamation" style={{ color: '#e53e3e' }} />
          <p>{t('failed_load_results')}</p>
        </div>
      )}

      {/* ── Grid View ── */}
      {!loading && !error && viewMode === 'grid' && results.length > 0 && (
        <div className="sr-grid">
          {results.map(property => (
            <PropertyCard
              key={property.id}
              property={property}
              onView={handleViewProperty}
            />
          ))}
        </div>
      )}

      {/* ── Map View ── */}
      {!loading && !error && viewMode === 'map' && results.length > 0 && (
        <PropertiesMap properties={results} onView={handleViewProperty} />
      )}

      {/* ── Empty ── */}
      {!loading && !error && results.length === 0 && (
        <div className="sr-empty">
          <i className="fa-solid fa-house-circle-xmark" />
          <p>{t('no_properties_found')}</p>
        </div>
      )}

    </div>
  );
}