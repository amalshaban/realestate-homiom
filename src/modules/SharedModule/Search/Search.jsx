import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Authorization, apiKey } from '../../../constants/Validations';
import { LOCATIONS_URLs, GENERAL_URLs, BASE_URL } from '../../../constants/EndPoints';
import useSearch from './useSearch.js';

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_IMG = BASE_URL;

// ─── Sub Components ───────────────────────────────────────────────────────────
const SkeletonResults = () => (
  <>
    {[1, 2, 3].map(i => (
      <div key={i} className="search-result-skeleton">
        <div className="sr-skeleton" style={{ width: 120, height: 90, flexShrink: 0, borderRadius: 10 }} />
        <div style={{ flex: 1 }}>
          <div className="sr-skeleton mb-2" style={{ height: 18, width: '60%' }} />
          <div className="sr-skeleton mb-2" style={{ height: 14, width: '40%' }} />
          <div className="sr-skeleton"      style={{ height: 20, width: '30%' }} />
        </div>
      </div>
    ))}
  </>
);

const ResultCard = ({ property, onView }) => {
  const { t } = useTranslation();

  const imageUrl = property.mainImageUrl
    ? `${BASE_IMG}${property.mainImageUrl}`
    : `${BASE_IMG}/${property.image}`;

  return (
    <div className="property-card" onClick={() => onView(property.id)}>
      <div style={{ position: 'relative' }}>
        <div className="card-img-wrapper">
          <img
            src={imageUrl}
            alt={property.title}
            loading="lazy"
            onError={e => { e.target.style.display = 'none'; }}
          />
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
export default function Search() {

  const { t } = useTranslation();
  const [listingType,    setListingType]    = useState('buy');
  const [countries,      setCountries]      = useState([]);
  const [realStateTypes, setRealStateTypes] = useState([]);
  const [countryId,      setCountryId]      = useState('');
  const [typeId,         setTypeId]         = useState('');
  const [priceRange,     setPriceRange]     = useState(0);
  const [showModal,      setShowModal]      = useState(false);

  const { results, loading, error, total, priceRanges, search, clearResults } = useSearch();
  const navigate = useNavigate();

  // ── Fetch Dropdowns ──
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [countriesRes, typesRes] = await Promise.all([
          axios.get(LOCATIONS_URLs.Countries, Authorization),
          axios.get(GENERAL_URLs.RealStateTypes, {
            headers: { Authorization: `Bearer ${sessionStorage.token}`, apiKey },
          }),
        ]);
        setCountries(countriesRes.data  || []);
        setRealStateTypes(typesRes.data || []);
      } catch {}
    };
    fetchDropdowns();
  }, []);

  // ── Search ──
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    const selectedRange = priceRanges[priceRange] || priceRanges[0];
    search({
      countryId:       countryId || 0,
      realStateTypeId: typeId    || 0,
      minPrice:        selectedRange.min,
      maxPrice:        selectedRange.max,
      forRent:         listingType === 'rent',
    });
    setShowModal(true);
  }, [countryId, typeId, priceRange, priceRanges, listingType, search]);

  // ── Close ──
  const handleClose = useCallback(() => {
    setShowModal(false);
    clearResults();
  }, [clearResults]);

  // ── Navigate ──
  const handleViewProperty = useCallback((id) => {
    handleClose();
    navigate(`/properties/property/${id}`);
  }, [handleClose, navigate]);

  // ── Escape Key ──
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  return (
    <>
      <div className="container">
        <div className="search-container">

          {/* ── Buy / Rent Toggle ── */}
          <div className="toggle-container">
            <button
              className={`toggle-btn ${listingType === 'buy' ? 'active' : ''}`}
              onClick={() => setListingType('buy')}
            >
              {t('buy')}
            </button>
            <button
              className={`toggle-btn ${listingType === 'rent' ? 'active' : ''}`}
              onClick={() => setListingType('rent')}
            >
              {t('rent')}
            </button>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSearch}>
            <div className="row g-1 align-items-center">

              {/* Country */}
              <div className="col-lg-4 col-md-6">
                <div className="search-box-wrapper">
                  <select className="form-select border-0 bg-transparent"
                    value={countryId} onChange={e => setCountryId(e.target.value)}>
                    <option value="">{t('select_country')}</option>
                    {countries.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Type */}
              <div className="col-lg-3 col-md-6">
                <div className="search-box-wrapper">
                  <select className="form-select border-0 bg-transparent"
                    value={typeId} onChange={e => setTypeId(e.target.value)}>
                    <option value="">{t('any_type')}</option>
                    {realStateTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price */}
              <div className="col-lg-3 col-md-6">
                <div className="search-box-wrapper">
                  <select className="form-select border-0 bg-transparent"
                    value={priceRange} onChange={e => setPriceRange(Number(e.target.value))}>
                    {priceRanges.map((range, idx) => (
                      <option key={idx} value={idx}>{range.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Button */}
              <div className="col-lg-2 col-md-6">
                <button type="submit" className="btn-search-main">
                  <i className="fa-solid fa-magnifying-glass" />
                  {t('search')}
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>

      {/* ── Results Modal ── */}
      {showModal && (
        <div className="search-modal-overlay" onClick={handleClose}>
          <div className="search-modal" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="search-modal-header">
              <div>
                <p className="search-modal-title">{t('search_results')}</p>
                {!loading && (
                  <p className="search-modal-count">
                    {total} {total === 1 ? t('property') : t('properties')} {t('found')}
                  </p>
                )}
              </div>
              <button className="search-modal-close" onClick={handleClose}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* Body */}
            <div className="search-modal-body">

              {loading && <SkeletonResults />}

              {error && (
                <div className="search-modal-empty">
                  <i className="fa-solid fa-circle-exclamation" style={{ color: '#e53e3e' }} />
                  <p>{t('failed_load_results')}</p>
                </div>
              )}

              {!loading && !error && results.length > 0 && (
                <div className="search-results-grid">
                  {results.map(property => (
                    <ResultCard
                      key={property.id}
                      property={property}
                      onView={handleViewProperty}
                    />
                  ))}
                </div>
              )}

              {!loading && !error && results.length === 0 && (
                <div className="search-modal-empty">
                  <i className="fa-solid fa-house-circle-xmark" />
                  <p>{t('no_properties_found')}</p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}