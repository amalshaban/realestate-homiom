import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { apiKey } from '../../../constants/Validations.js';

const BASE_URL = 'https://realstate.niledevelopers.com';

const headers = () => ({
  Authorization: `Bearer ${sessionStorage.token}`,
  apiKey,
  'Content-Type': 'application/json',
});

const multipartHeaders = () => ({
  Authorization: `Bearer ${sessionStorage.token}`,
  apiKey,
});

export default function useAddProperty() {

  const [realStateTypes, setRealStateTypes] = useState([]);
  const [purposeTypes,   setPurposeTypes]   = useState([]);
  const [rentTypes,      setRentTypes]      = useState([]);
  const [countries,      setCountries]      = useState([]);
  const [cities,         setCities]         = useState([]);
  const [districts,      setDistricts]      = useState([]);
  const [submitting,     setSubmitting]     = useState(false);
  const [error,          setError]          = useState(null);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [typesRes, purposeRes, rentRes, countriesRes] = await Promise.all([
          axios.get(`${BASE_URL}/General/RealStateTypes`, { headers: headers() }),
          axios.get(`${BASE_URL}/General/PurposeTypes`,   { headers: headers() }),
          axios.get(`${BASE_URL}/General/RentTypes`,      { headers: headers() }),
          axios.get(`${BASE_URL}/Locations/Countries`,    { headers: headers() }),
        ]);
        setRealStateTypes(typesRes.data   || []);
        setPurposeTypes(purposeRes.data   || []);
        setRentTypes(rentRes.data         || []);
        setCountries(countriesRes.data    || []);
      } catch (err) {
        setError(err.response?.data || err.message);
      }
    };
    fetchDropdowns();
  }, []);

  const fetchCities = useCallback(async (countryId) => {
    setCities([]);
    setDistricts([]);
    if (!countryId || countryId === '0') return;
    try {
      const res = await axios.get(`${BASE_URL}/Locations/Cities?id=${countryId}`, { headers: headers() });
      setCities(res.data || []);
    } catch {}
  }, []);

  const fetchDistricts = useCallback(async (cityId) => {
    setDistricts([]);
    if (!cityId || cityId === '0') return;
    try {
      const res = await axios.get(`${BASE_URL}/Locations/Districts?id=${cityId}`, { headers: headers() });
      setDistricts(res.data || []);
    } catch {}
  }, []);

  const submitProperty = useCallback(async (data, images) => {
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('title',               data.title);
      formData.append('description',         data.description);
      formData.append('ForRent',             data.forRent);
      formData.append('price',               data.price);
      formData.append('isNegotiable',        data.isNegotiable);
      formData.append('realStateTypeId',     data.realStateTypeId);
      formData.append('realStatePurposeId',  data.realStatePurposeId);
      formData.append('realStateRentTypeId', data.realStateRentTypeId || '');
      formData.append('countryId',           data.countryId);
      formData.append('cityId',              data.cityId);
      formData.append('districtId',          data.districtId);
      formData.append('contactPhone',        data.contactPhone);
      formData.append('LocationDiscription', data.locationDescription || '');

      images.forEach((img, idx) => {
        formData.append(`images[${idx}].imageUrl`, img);
      });

      await axios.post(`${BASE_URL}/Agent/Property/Add`, formData, {
        headers: multipartHeaders(),
      });
      return true;
    } catch (err) {
      setError(err.response?.data || err.message);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return {
    realStateTypes, purposeTypes, rentTypes,
    countries, cities, districts,
    submitting, error,
    fetchCities, fetchDistricts, submitProperty,
  };
}