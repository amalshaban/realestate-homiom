import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { apiKey } from '../../../constants/Validations.js';
import { PROPERTIES_URLS } from '../../../constants/EndPoints.js';

const headers = () => ({
  Authorization: `Bearer ${sessionStorage.token}`,
  apiKey,
  'Content-Type': 'application/json',
});

export default function useSearch() {

  const [results,   setResults]   = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [total,     setTotal]     = useState(0);
  const [allPrices, setAllPrices] = useState([]);

  // ── جيب الأسعار ──
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await axios.get(PROPERTIES_URLS.activeProperties, {
          headers: headers(),
        });
        const properties = response.data.properties || response.data || [];
        const prices = properties
          .map(p => p.price)
          .filter(Boolean)
          .sort((a, b) => a - b);
        setAllPrices(prices);
      } catch {}
    };
    fetchPrices();
  }, []);

  // ── Price Options ──
  const priceRanges = useMemo(() => {
    if (!allPrices.length) return [{ label: 'Any Price', min: 0, max: 0 }];

    const unique = [...new Set(allPrices)];

    return [
      { label: 'Any Price', min: 0, max: 0 },
      ...unique.map(price => ({
        label: `${price.toLocaleString()} SAR`,
        min:   price,
        max:   price,
      })),
    ];
  }, [allPrices]);

  // ── Search ──
  const search = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(PROPERTIES_URLS.propertySearch, {
        countryId:           params.countryId       || 0,
        cityId:              0,
        districtId:          0,
        realStateTypeId:     params.realStateTypeId || 0,
        realStatePurposeId:  0,
        realStateRentTypeId: 0,
        minPrice:            params.minPrice        || 0,
        maxPrice:            params.maxPrice        || 0,
        minArea:             0,
        maxArea:             0,
        agentId:             0,
        searchText:          '',
        forRent:             params.forRent,
        page:                1,
        pageSize:            12,
        sortBy:              '',
        sortDescending:      true,
      }, { headers: headers() });

      setResults(response.data.properties || response.data || []);
      setTotal(response.data.totalCount   || 0);
    } catch (err) {
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Clear ──
  const clearResults = useCallback(() => {
    setResults([]);
    setTotal(0);
    setError(null);
  }, []);

  return {
    results, loading, error, total,
    priceRanges,
    search, clearResults,
  };
}