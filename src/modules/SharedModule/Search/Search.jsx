import React, { useState, useEffect } from 'react';
import { Authorization } from '../../../constants/Validations';
import { LOCATIONS_URLs } from '../../../constants/EndPoints';
import axios from 'axios';

export default function Search({ listingType, onListingTypeChange, onSearch }) {

  const [countries, setCountries] = useState([]);
  const [country,   setCountry]   = useState('');
  const [type,      setType]      = useState('');
  const [price,     setPrice]     = useState('');

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get(LOCATIONS_URLs.Countries, Authorization);
        setCountries(response.data);
      } catch {}
    };
    fetchCountries();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch?.({ country, type, price, listingType });
  };

  return (
    <div className="container mt-5">
      <div className="search-container">

        {/* ── Buy / Rent Toggle ── */}
        <div className="toggle-container">
          <button
            className={`toggle-btn ${listingType === 'buy' ? 'active' : ''}`}
            onClick={() => onListingTypeChange('buy')}
          >
            Buy
          </button>
          <button
            className={`toggle-btn ${listingType === 'rent' ? 'active' : ''}`}
            onClick={() => onListingTypeChange('rent')}
          >
            Rent
          </button>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSearch}>
          <div className="row g-1 align-items-center">

            <div className="col-lg-4 col-md-6">
              <div className="search-box-wrapper">
                <select className="form-select border-0 bg-transparent"
                  value={country} onChange={e => setCountry(e.target.value)}>
                  <option value="" disabled>Select Country</option>
                  {countries.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="search-box-wrapper">
                <select className="form-select border-0 bg-transparent"
                  value={type} onChange={e => setType(e.target.value)}>
                  <option value="">Any Type</option>
                  <option value="1">Apartment</option>
                  <option value="2">Villa</option>
                  <option value="3">Compound</option>
                  <option value="4">Land</option>
                </select>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="search-box-wrapper">
                <select className="form-select border-0 bg-transparent"
                  value={price} onChange={e => setPrice(e.target.value)}>
                  <option value="">Any Price</option>
                  <option value="1000-5000">1,000 - 5,000 SAR</option>
                  <option value="5000-10000">5,000 - 10,000 SAR</option>
                  <option value="10000-50000">10,000 - 50,000 SAR</option>
                </select>
              </div>
            </div>

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
  );
}