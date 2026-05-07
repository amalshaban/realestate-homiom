import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { apiKey } from '../../../constants/Validations.js';

const BASE_URL = 'https://realstate.niledevelopers.com';

const headers = () => ({
  Authorization: `Bearer ${sessionStorage.token}`,
  apiKey,
  'Content-Type': 'application/json',
});

// ─── useAgentStats ────────────────────────────────────────────────────────────
export function useAgentStats() {

  const [stats,       setStats]       = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}/Agent/Dashboard/Stats`, {
        headers: headers(),
      });
      setStats(response.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return { stats, loading, error, lastUpdated, refetch: fetchStats };
}

// ─── useAgentProfile ──────────────────────────────────────────────────────────
export function useAgentProfile() {

  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}/Agent/Profile`, {
        headers: headers(),
      });
      setProfile(response.data);
    } catch (err) {
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data, photo) => {
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append('id',     data.id);
      formData.append('nameAr', data.nameAr);
      formData.append('nameEn', data.nameEn);
      if (photo) formData.append('photo', photo);

      await axios.put(`${BASE_URL}/agent/group/update`, formData, {
        headers: {
          Authorization: `Bearer ${sessionStorage.token}`,
          apiKey,
        },
      });
      await fetchProfile();
      return true;
    } catch {
      return false;
    } finally {
      setUpdating(false);
    }
  }, [fetchProfile]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  return { profile, loading, error, updating, updateProfile };
}

// ─── useAgentProperties ───────────────────────────────────────────────────────
export function useAgentProperties() {

  const [properties, setProperties] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}/agent/properties`, {
        headers: headers(),
      });
      setProperties(response.data.properties || response.data || []);
    } catch (err) {
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  return { properties, loading, error, refetch: fetchProperties };
}

// ─── useVisitRequests ─────────────────────────────────────────────────────────
export function useVisitRequests() {

  const [requests,       setRequests]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [suggestedDates, setSuggestedDates] = useState({});
  const [adding,         setAdding]         = useState(null);
  const [deleting,       setDeleting]       = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}/Agent/VisitRequests`, {
        headers: headers(),
      });
      setRequests(response.data || []);
    } catch (err) {
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSuggestedDates = useCallback(async (visitRequestId) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/Agent/VisitRequests/SuggestedDates/List`,
        { visitRequestId },
        { headers: headers() }
      );
      setSuggestedDates(prev => ({ ...prev, [visitRequestId]: response.data || [] }));
    } catch {}
  }, []);

  const addSuggestedDate = useCallback(async (propertyVisitRequestId, suggestedDateTime) => {
    setAdding(propertyVisitRequestId);
    try {
      await axios.post(
        `${BASE_URL}/Agent/VisitRequests/SuggestedDates`,
        { propertyVisitRequestId, suggestedDateTime },
        { headers: headers() }
      );
      await fetchSuggestedDates(propertyVisitRequestId);
    } catch {} finally {
      setAdding(null);
    }
  }, [fetchSuggestedDates]);

  const deleteSuggestedDate = useCallback(async (suggestedDateId, visitRequestId) => {
    setDeleting(suggestedDateId);
    try {
      await axios.post(
        `${BASE_URL}/Agent/VisitRequests/SuggestedDates/Delete`,
        { suggestedDateId },
        { headers: headers() }
      );
      await fetchSuggestedDates(visitRequestId);
    } catch {} finally {
      setDeleting(null);
    }
  }, [fetchSuggestedDates]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  return {
    requests, loading, error,
    suggestedDates, adding, deleting,
    fetchSuggestedDates, addSuggestedDate, deleteSuggestedDate,
    refetch: fetchRequests,
  };
}

// ─── usePurchaseRequests ──────────────────────────────────────────────────────
export function usePurchaseRequests() {

  const [requests,  setRequests]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [accepting, setAccepting] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}/Agent/PurchaseRequests`, {
        headers: headers(),
      });
      setRequests(response.data || []);
    } catch (err) {
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const acceptRequest = useCallback(async (purchaseRequestId) => {
    setAccepting(purchaseRequestId);
    try {
      await axios.post(
        `${BASE_URL}/Agent/PurchaseRequests/Accept`,
        { purchaseRequestId },
        { headers: headers() }
      );
      await fetchRequests();
    } catch (err) {
      setError(err.response?.data || err.message);
    } finally {
      setAccepting(null);
    }
  }, [fetchRequests]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  return { requests, loading, error, accepting, acceptRequest, refetch: fetchRequests };
}

// ─── useRentalRequests ────────────────────────────────────────────────────────
export function useRentalRequests() {

  const [requests,  setRequests]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [accepting, setAccepting] = useState(null);
  const [creating,  setCreating]  = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}/Agent/RentalRequests`, {
        headers: headers(),
      });
      setRequests(response.data || []);
    } catch (err) {
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const acceptRequest = useCallback(async (rentalRequestId) => {
    setAccepting(rentalRequestId);
    try {
      await axios.post(
        `${BASE_URL}/Agent/RentalRequests/Accept`,
        { rentalRequestId },
        { headers: headers() }
      );
      await fetchRequests();
    } catch (err) {
      setError(err.response?.data || err.message);
    } finally {
      setAccepting(null);
    }
  }, [fetchRequests]);

  const createRent = useCallback(async (data) => {
    setCreating(true);
    try {
      await axios.post(
        `${BASE_URL}/Agent/Rent/Create`,
        data,
        { headers: headers() }
      );
      await fetchRequests();
      return true;
    } catch (err) {
      setError(err.response?.data || err.message);
      return false;
    } finally {
      setCreating(false);
    }
  }, [fetchRequests]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  return {
    requests, loading, error,
    accepting, creating,
    acceptRequest, createRent,
    refetch: fetchRequests,
  };
}

// ─── useRents ─────────────────────────────────────────────────────────────────
export function useRents() {

  const [rents,   setRents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchRents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}/Agent/Rents`, {
        headers: headers(),
      });
      setRents(response.data || []);
    } catch (err) {
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRents(); }, [fetchRents]);

  return { rents, loading, error, refetch: fetchRents };
}