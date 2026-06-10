import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { apiKey } from '../../../constants/Validations.js';
import { PROPERTIES_URLS, USERS_URLs } from '../../../constants/EndPoints.js';

const headers = () => ({
  Authorization: `Bearer ${sessionStorage.token}`,
  apiKey,
  'Content-Type': 'application/json',
  'Accept-Language': 'browserLanguage',
});

export default function useProperties() {

  const [properties, setProperties] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(PROPERTIES_URLS.activeProperties, {
        headers: headers(),
      });
      setProperties(response.data.properties || []);
    } catch (err) {
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendView = useCallback(async (id) => {
    try {
      await axios.post(
        USERS_URLs.AddWatch,
        { propertyId: id },
        { headers: headers() }
      );
    } catch {
      // silent fail
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return { properties, loading, error, sendView };
}