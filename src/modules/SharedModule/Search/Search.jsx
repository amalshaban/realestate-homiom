import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Authorization, apiKey } from '../../../constants/Validations';
import { LOCATIONS_URLs, GENERAL_URLs } from '../../../constants/EndPoints';
import useSearch from './useSearch.js';

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Search() {

  const { t } = useTranslation();
  const [listingType,  
      setListingType]    = useState('buy');
  const [countries,      setCountries]      = useState([]);
  const [realStateTypes, setRealStateTypes] = useState([]);
  const [countryId,      setCountryId]      = useState('');
  const [typeId,         setTypeId]         = useState('');
  const [priceRange,     setPriceRange]     = useState(0);

  const { priceRanges } = useSearch();
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

  // ── Search → Navigate ──
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    const selectedRange = priceRanges[priceRange] || priceRanges[0];
    const params = new URLSearchParams({
      countryId:  countryId      || 0,
      typeId:     typeId         || 0,
      minPrice:   selectedRange?.min || 0,
      maxPrice:   selectedRange?.max || 0,
      forRent:    listingType === 'rent',
    });
    navigate(`/properties/search?${params.toString()}`);
  }, [countryId, typeId, priceRange, priceRanges, listingType, navigate]);

  return (
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
  );
}