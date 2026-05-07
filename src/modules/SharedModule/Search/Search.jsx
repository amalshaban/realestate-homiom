import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Authorization, apiKey } from '../../../constants/Validations';
import { LOCATIONS_URLs } from '../../../constants/EndPoints';
import useSearch from './useSearch.js';


// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_IMG = 'https://realstate.niledevelopers.com';
const BASE_URL = 'https://realstate.niledevelopers.com';

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

const ResultCard = ({ property, onView }) => (
  <div className="search-result-card" onClick={() => onView(property.id)}>
    <img
      src={property.mainImageUrl
        ? `${BASE_IMG}${property.mainImageUrl}`
        : `${BASE_IMG}/${property.image}`
      }
      alt={property.title}
      className="search-result-img"
      loading="lazy"
      onError={e => { e.target.style.display = 'none'; }}
    />
    <div className="search-result-info">
      <div className="d-flex align-items-center justify-content-between mb-1">
        <p className="search-result-title">{property.title}</p>
        <span className={`search-result-badge ${property.forRent ? 'rent' : 'sale'}`}>
          {property.forRent ? 'For Rent' : 'For Sale'}
        </span>
      </div>
      <p className="search-result-location">
        <i className="fa-solid fa-location-dot" style={{ color: '#0088BD' }} />
        {property.district}, {property.city}
      </p>
      <p className="search-result-price">
        {property.price?.toLocaleString()} SAR
        {property.forRent && (
          <span style={{ fontSize: '13px', fontWeight: 400, color: '#888' }}> /month</span>
        )}
      </p>
      <div className="search-result-specs">
        {property.bedrooms  > 0 && <span><i className="fa-solid fa-bed"           /> {property.bedrooms}</span>}
        {property.bathrooms > 0 && <span><i className="fa-solid fa-bath"          /> {property.bathrooms}</span>}
        {property.area      > 0 && <span><i className="fa-solid fa-vector-square" /> {property.area} m²</span>}
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Search() {

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
          axios.get(`${BASE_URL}/General/RealStateTypes`, {
            headers: { Authorization: `Bearer ${sessionStorage.token}`, apiKey },
          }),
        ]);
        setCountries(countriesRes.data   || []);
        setRealStateTypes(typesRes.data  || []);
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
              Buy
            </button>
            <button
              className={`toggle-btn ${listingType === 'rent' ? 'active' : ''}`}
              onClick={() => setListingType('rent')}
            >
              Rent
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
                    <option value="">Select Country</option>
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
                    <option value="">Any Type</option>
                    {realStateTypes.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
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
                  Search
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
                <p className="search-modal-title">Search Results</p>
                {!loading && (
                  <p className="search-modal-count">
                    {total} {total === 1 ? 'property' : 'properties'} found
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
                  <p>Failed to load results. Please try again.</p>
                </div>
              )}

              {!loading && !error && results.length > 0 && (
                results.map(property => (
                  <ResultCard
                    key={property.id}
                    property={property}
                    onView={handleViewProperty}
                  />
                ))
              )}

              {!loading && !error && results.length === 0 && (
                <div className="search-modal-empty">
                  <i className="fa-solid fa-house-circle-xmark" />
                  <p>No properties found matching your search.</p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}