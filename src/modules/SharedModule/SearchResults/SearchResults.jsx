import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from '../../../constants/EndPoints.js';
import useSearch from '../../SharedModule/Search/useSearch.js';
import PropertiesMap from '../PropertiesMap/PropertiesMap.jsx';

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_IMG = BASE_URL;

// ─── Geocode Cache ────────────────────────────────────────────────────────────
const geocodeCache = {};

const geocodeLocation = async (district, city, country) => {
  const key = `${district},${city},${country}`;
  if (geocodeCache[key]) return geocodeCache[key];
  try {
    let query = encodeURIComponent(`${district}, ${city}, ${country}`);
    let res   = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`);
    let data  = await res.json();
    if (!data || data.length === 0) {
      query = encodeURIComponent(`${city}, ${country}`);
      res   = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`);
      data  = await res.json();
    }
    if (data && data.length > 0) {
      const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      geocodeCache[key] = coords;
      return coords;
    }
  } catch {}
  return null;
};

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
  const [searchParams]              = useSearchParams();
  const navigate                    = useNavigate();
  const { results, loading, error, total, search } = useSearch();
  const [geoResults,   setGeoResults]   = useState([]);
  const [geoLoading,   setGeoLoading]   = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);

  // ── Search ──
  useEffect(() => {
    const countryId = Number(searchParams.get('countryId')) || 0;
    const typeId    = Number(searchParams.get('typeId'))    || 0;
    const minPrice  = Number(searchParams.get('minPrice'))  || 0;
    const maxPrice  = Number(searchParams.get('maxPrice'))  || 0;
    const forRent   = searchParams.get('forRent') === 'true';
    search({ countryId, realStateTypeId: typeId, minPrice, maxPrice, forRent });
    setSelectedCity(null);
  }, [searchParams]);

  // ── Geocode ──
  useEffect(() => {
    if (!results.length) {
      setGeoResults([]);
      return;
    }
    const geocodeAll = async () => {
      setGeoLoading(true);
      const geocoded = await Promise.all(
        results.map(async (property) => {
          if (property.locationLat && property.locationLng) {
            return { ...property, lat: property.locationLat, lng: property.locationLng };
          }
          const coords = await geocodeLocation(
            property.district || '',
            property.city     || '',
            property.country  || 'Saudi Arabia'
          );
          if (coords) return { ...property, lat: coords.lat, lng: coords.lng };
          return null;
        })
      );
      setGeoResults(geocoded.filter(Boolean));
      setGeoLoading(false);
    };
    geocodeAll();
  }, [results]);

  // ── Filter by selected city ──
  const filteredResults = selectedCity
    ? results.filter(p => p.city === selectedCity)
    : results;

  const handleViewProperty = useCallback((id) => {
    navigate(`/properties/property/${id}`);
  }, [navigate]);

  const handleAreaSelect = useCallback((city) => {
    setSelectedCity(prev => prev === city ? null : city);
  }, []);

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
              {filteredResults.length} {filteredResults.length === 1 ? t('property') : t('properties')} {t('found')}
            </p>
          )}
        </div>

        {/* ── Clear Filter ── */}
        {selectedCity && (
          <button
            onClick={() => setSelectedCity(null)}
            style={{
              marginLeft: 'auto',
              background: '#0088BD',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <i className="fa-solid fa-xmark" />
            {selectedCity} — {t('show_all')}
          </button>
        )}
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

      {/* ── Split View ── */}
      {!loading && !error && results.length > 0 && (
        <div className="sr-split">

          {/* ── Left: Grid ── */}
          <div className="sr-split-grid">
            {filteredResults.length > 0 ? (
              filteredResults.map(property => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onView={handleViewProperty}
                />
              ))
            ) : (
              <div className="sr-empty">
                <i className="fa-solid fa-house-circle-xmark" />
                <p>{t('no_properties_found')}</p>
              </div>
            )}
          </div>

          {/* ── Right: Map ── */}
          <div className="sr-split-map">
            {geoLoading ? (
              <div className="pm-loading">
                <div className="spinner-border text-primary" />
                <p>{t('loading_map')}</p>
              </div>
            ) : (
              <PropertiesMap
                properties={geoResults}
                onView={handleViewProperty}
                onAreaSelect={handleAreaSelect}
                selectedCity={selectedCity}
              />
            )}
          </div>

        </div>
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