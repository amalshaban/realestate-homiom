import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Row, Col } from 'react-bootstrap';
import useProperties from './useProperties.js';
import { BASE_URL } from '../../../constants/EndPoints.js';
import '../PropertyDetails.css';

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

const ImageSlider = ({ images, title }) => {
  const [current, setCurrent] = useState(0);

  const prev = useCallback((e) => {
    e.stopPropagation();
    setCurrent(i => (i === 0 ? images.length - 1 : i - 1));
  }, [images.length]);

  const next = useCallback((e) => {
    e.stopPropagation();
    setCurrent(i => (i === images.length - 1 ? 0 : i + 1));
  }, [images.length]);

  return (
    <div className="card-img-wrapper">
      <img
        src={`${BASE_URL}${images[current]}`}
        alt={title}
        loading="lazy"
        decoding="async"
      />
      {images.length > 1 && <>
        <button className="slider-arrow left"  onClick={prev}>
          <i className="fa-solid fa-chevron-left" />
        </button>
        <button className="slider-arrow right" onClick={next}>
          <i className="fa-solid fa-chevron-right" />
        </button>
        <div className="slider-dots">
          {images.map((_, i) => (
            <div key={i} className={`slider-dot ${i === current ? 'active' : ''}`} />
          ))}
        </div>
      </>}
    </div>
  );
};

const PropertyCard = ({ property, onView }) => {
  const { t } = useTranslation();
  const images = property.image ? [property.image] : [];

  return (
    <div className="property-card" onClick={() => onView(property.id)}>
      <div style={{ position: 'relative' }}>
        <ImageSlider images={images} title={property.title} />
        <span className={`badge-listing ${property.forRent ? 'badge-for-rent' : 'badge-for-sale'}`}>
          {property.forRent ? t('for_rent') : t('for_sale')}
        </span>
        <button className="heart-btn" onClick={e => e.stopPropagation()}>
          <i className="fa-regular fa-heart" />
        </button>
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
          <span className="property-type-badge">{property.realStatePurpose}</span>
        </div>
        <div className="property-specs">
          {property.bedrooms > 0 && (
            <span><i className="fa-solid fa-bed" /> {property.bedrooms}</span>
          )}
          {property.bathrooms > 0 && (
            <span><i className="fa-solid fa-bath" /> {property.bathrooms}</span>
          )}
          {property.area > 0 && (
            <span><i className="fa-solid fa-vector-square" /> {property.area} m²</span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ViewProperties() {

  const { t } = useTranslation();
  const { properties, loading, error, loadingMore, hasMore, total, loadMore, sendView } = useProperties();
  const [viewMode, setViewMode] = useState('grid');
  const navigate = useNavigate();

  const handleViewProperty = useCallback((id) => {
    sendView(id);
    navigate(`/properties/property/${id}`);
  }, [sendView, navigate]);

  return (
    <div className="p-4 p-lg-5">

      {/* ── Header ── */}
      <div className="vp-header d-flex align-items-start justify-content-between mb-4">
        <div>
          <h3>{t('featured_properties')}</h3>
          <p>{total} {t('properties_available')}</p>
        </div>
        <div className="d-flex gap-2">
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

      {/* ── Error ── */}
      {error && (
        <div className="alert alert-danger">
          {t('failed_load_properties')}
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <Row className="g-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Col key={i} md={4}><SkeletonCard /></Col>
          ))}
        </Row>
      )}

      {/* ── Grid View ── */}
      {!loading && !error && viewMode === 'grid' && (
        <Row className="g-4">
          {properties.length > 0 ? (
            properties.map(property => (
              <Col key={property.id} md={4}>
                <PropertyCard property={property} onView={handleViewProperty} />
              </Col>
            ))
          ) : (
            <div className="empty-state">
              <i className="fa-solid fa-house-circle-xmark" />
              <p>{t('no_properties_found')}</p>
            </div>
          )}

          {/* ── Load More ── */}
          {hasMore && (
            <Col xs={12} className="text-center mt-4">
              <button
                className="btn btn-outline-dark px-5 py-2 rounded-pill"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore
                  ? <><span className="spinner-border spinner-border-sm me-2" />{t('loading')}</>
                  : t('load_more')
                }
              </button>
            </Col>
          )}
        </Row>
      )}

      {/* ── Map View ── */}
      {!loading && !error && viewMode === 'map' && (
        <div className="d-flex align-items-center justify-content-center"
          style={{ height: '400px', background: '#f5f5f5', borderRadius: '16px' }}>
          <p className="text-muted">{t('map_coming_soon')}</p>
        </div>
      )}

    </div>
  );
}