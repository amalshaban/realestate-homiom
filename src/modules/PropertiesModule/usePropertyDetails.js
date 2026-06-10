import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { apiKey } from '../../constants/Validations.js';
import { PROPERTIES_URLS, USERS_URLs } from '../../constants/EndPoints.js';

const headers = () => ({
  Authorization: `Bearer ${sessionStorage.token}`,
  apiKey,
  'Content-Type': 'application/json',
  'Accept-Language': 'en',
});

export default function usePropertyDetails(id) {

  const [property,   setProperty]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${PROPERTIES_URLS.propertyDetails}/${id}`, {
          headers: headers(),
        });
        setProperty(response.data.property);
      } catch (err) {
        setError(err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const sendVisitRequest = useCallback(async () => {
    setSubmitting(true);
    try {
      await axios.post(
        USERS_URLs.VisitRequest,
        { propertyId: id },
        { headers: headers() }
      );
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    } finally {
      setSubmitting(false);
    }
  }, [id]);

  const sendPurchaseRequest = useCallback(async (offeredPrice, notes) => {
    setSubmitting(true);
    try {
      await axios.post(
        USERS_URLs.PurchaseRequests,
        { propertyId: id, offeredPrice, notes },
        { headers: headers() }
      );
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    } finally {
      setSubmitting(false);
    }
  }, [id]);

  const sendRentalRequest = useCallback(async (offeredPrice, notes, rentTypeId) => {
    setSubmitting(true);
    try {
      await axios.post(
        USERS_URLs.RentalRequests,
        { propertyId: id, rentTypeId, offeredPrice, notes },
        { headers: headers() }
      );
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    } finally {
      setSubmitting(false);
    }
  }, [id]);

  return {
    property, loading, error, submitting,
    sendVisitRequest, sendPurchaseRequest, sendRentalRequest,
  };
}