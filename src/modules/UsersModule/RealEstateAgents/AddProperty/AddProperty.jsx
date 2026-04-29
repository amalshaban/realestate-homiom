import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useAddProperty from '../useAddProperty.js';
import { apiKey } from '../../../../constants/Validations.js';
import '../../RealEstateAgents/AgentPannel.css';

// ─── Fix Leaflet default icon ──────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ─── Constants ────────────────────────────────────────────────────────────────
const AMENITIES = [
  { id: 1, label: 'Private Pool',  icon: 'fa-solid fa-water-ladder'  },
  { id: 2, label: 'Elevator',      icon: 'fa-solid fa-elevator'       },
  { id: 3, label: 'Driver Room',   icon: 'fa-solid fa-car'            },
  { id: 4, label: 'Roof Deck',     icon: 'fa-solid fa-building'       },
  { id: 5, label: 'Gym',           icon: 'fa-solid fa-dumbbell'       },
  { id: 6, label: 'Parking',       icon: 'fa-solid fa-square-parking' },
  { id: 7, label: 'Garden',        icon: 'fa-solid fa-tree'           },
];

const DEFAULT_CENTER = [24.7136, 46.6753];

// ─── Map Click Handler ────────────────────────────────────────────────────────
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// ─── Sub Components ───────────────────────────────────────────────────────────
const Counter = ({ value, onChange }) => (
  <div className="add-prop-counter">
    <button type="button" className="add-prop-counter-btn"
      onClick={() => onChange(Math.max(0, value - 1))}>−</button>
    <span className="add-prop-counter-value">{value}</span>
    <button type="button" className="add-prop-counter-btn"
      onClick={() => onChange(value + 1)}>+</button>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AddProperty() {

  const {
    realStateTypes, purposeTypes, rentTypes,
    countries, cities, districts,
    submitting, error,
    fetchCities, fetchDistricts, submitProperty,
  } = useAddProperty();

  const [markerPos,          setMarkerPos]          = useState(null);
  const [bedrooms,           setBedrooms]            = useState(0);
  const [bathrooms,          setBathrooms]           = useState(0);
  const [selectedAmenities,  setSelectedAmenities]   = useState([]);
  const [ejarEnabled,        setEjarEnabled]         = useState(true);
  const [images,             setImages]              = useState([]);
  const [imagePreviews,      setImagePreviews]       = useState([]);
  const navigate = useNavigate();

  const {
    register, handleSubmit, watch, control, setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      forRent:             false,
      isNegotiable:        false,
      realStateTypeId:     '0',
      realStatePurposeId:  '0',
      realStateRentTypeId: '0',
      countryId:           '0',
      cityId:              '0',
      districtId:          '0',
    },
  });

  const watchedCountryId = watch('countryId');
  const watchedCityId    = watch('cityId');
  const watchedForRent   = watch('forRent');

  useEffect(() => { fetchCities(watchedCountryId);   }, [watchedCountryId, fetchCities]);
  useEffect(() => { fetchDistricts(watchedCityId);   }, [watchedCityId,    fetchDistricts]);

  // ── Reverse Geocoding ──
  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`
      );
      const data = await res.json();
      return {
        country:  data.address?.country || '',
        city:     data.address?.city || data.address?.town || data.address?.state || '',
        district: data.address?.suburb || data.address?.district || data.address?.neighbourhood || '',
      };
    } catch {
      return null;
    }
  }, []);

  // ── Map Click ──
  const handleMapClick = useCallback(async (lat, lng) => {
    setMarkerPos([lat, lng]);
    const location = await reverseGeocode(lat, lng);
    if (!location) return;

    const matchedCountry = countries.find(c =>
      c.name.toLowerCase().includes(location.country.toLowerCase()) ||
      location.country.toLowerCase().includes(c.name.toLowerCase())
    );

    if (matchedCountry) {
      setValue('countryId', String(matchedCountry.id));
      await fetchCities(matchedCountry.id);

      setTimeout(async () => {
        const cityRes = await axios.get(
          `https://realstate.niledevelopers.com/Locations/Cities?id=${matchedCountry.id}`,
          { headers: { Authorization: `Bearer ${sessionStorage.token}`, apiKey } }
        );
        const citiesList = cityRes.data || [];
        const matchedCity = citiesList.find(c =>
          c.name.toLowerCase().includes(location.city.toLowerCase()) ||
          location.city.toLowerCase().includes(c.name.toLowerCase())
        );

        if (matchedCity) {
          setValue('cityId', String(matchedCity.id));
          await fetchDistricts(matchedCity.id);

          setTimeout(async () => {
            const distRes = await axios.get(
              `https://realstate.niledevelopers.com/Locations/Districts?id=${matchedCity.id}`,
              { headers: { Authorization: `Bearer ${sessionStorage.token}`, apiKey } }
            );
            const districtsList = distRes.data || [];
            const matchedDistrict = districtsList.find(d =>
              d.name.toLowerCase().includes(location.district.toLowerCase()) ||
              location.district.toLowerCase().includes(d.name.toLowerCase())
            );
            if (matchedDistrict) {
              setValue('districtId', String(matchedDistrict.id));
            }
          }, 500);
        }
      }, 500);
    }

    setValue('locationDescription', `${location.district}, ${location.city}, ${location.country}`);
  }, [countries, fetchCities, fetchDistricts, reverseGeocode, setValue]);

  // ── Current Location ──
  const handleUseCurrentLocation = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => handleMapClick(pos.coords.latitude, pos.coords.longitude),
      () => toast.error('Could not get your location')
    );
  }, [handleMapClick]);

  // ── Image Handlers ──
  const handleImages = useCallback((e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
    const previews = files.map(f => URL.createObjectURL(f));
    setImagePreviews(prev => [...prev, ...previews]);
  }, []);

  const removeImage = useCallback((idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  }, []);

  // ── Amenities ──
  const toggleAmenity = useCallback((id) => {
    setSelectedAmenities(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  }, []);

  // ── Submit ──
  const onSubmit = useCallback(async (data) => {
    if (images.length === 0) {
      toast.error('Please add at least one image');
      return;
    }
    const toastId = toast.loading('Adding property...');
    const success = await submitProperty({
      ...data,
      bedrooms,
      bathrooms,
      locationLat: markerPos?.[0] || '',
      locationLng: markerPos?.[1] || '',
    }, images);

    if (success) {
      toast.update(toastId, {
        render: 'Property added successfully! 🎉',
        type: 'success',
        isLoading: false,
        autoClose: 2000,
      });
      setTimeout(() => navigate('/agentpannel/properties'), 500);
    } else {
      toast.update(toastId, {
        render: error || 'Failed to add property.',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    }
  }, [images, bedrooms, bathrooms, markerPos, submitProperty, error, navigate]);

  return (
    <div className="add-prop-page">
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">

        {/* ══════════════════════════════════════
            Section 1 — Property Foundation
        ══════════════════════════════════════ */}
        <div className="add-prop-section">
          <h2 className="add-prop-title">Property Foundation</h2>
          <p className="add-prop-subtitle">Provide the core technical details for your Riyadh-based listing.</p>

          <Row className="g-2 align-items-center">
            <Col md={6}>
              <label className="add-prop-label">Property Type</label>
              <select className={`add-prop-input ${errors.realStateTypeId ? 'is-invalid' : ''}`}
                {...register('realStateTypeId', { validate: v => v !== '0' || 'Required' })}>
                <option value="0">Select Type</option>
                {realStateTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              {errors.realStateTypeId && <p className="add-prop-error-text">{errors.realStateTypeId.message}</p>}
            </Col>

            <Col md={6}>
              <label className="add-prop-label">Listing Category</label>
              <Controller
                name="forRent"
                control={control}
                render={({ field }) => (
                  <div className="add-prop-toggle">
                    <button type="button"
                      className={`add-prop-toggle-btn ${!field.value ? 'active' : ''}`}
                      onClick={() => field.onChange(false)}>For Sale</button>
                    <button type="button"
                      className={`add-prop-toggle-btn ${field.value ? 'active' : ''}`}
                      onClick={() => field.onChange(true)}>For Rent</button>
                  </div>
                )}
              />
            </Col>

            {watchedForRent && (
              <Col md={6}>
                <label className="add-prop-label">Rent Type</label>
                <select className="add-prop-input" {...register('realStateRentTypeId')}>
                  <option value="0">Select Rent Type</option>
                  {rentTypes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </Col>
            )}

            <Col md={watchedForRent ? 6 : 12}>
              <label className="add-prop-label">Purpose</label>
              <select className={`add-prop-input ${errors.realStatePurposeId ? 'is-invalid' : ''}`}
                {...register('realStatePurposeId', { validate: v => v !== '0' || 'Required' })}>
                <option value="0">Select Purpose</option>
                {purposeTypes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {errors.realStatePurposeId && <p className="add-prop-error-text">{errors.realStatePurposeId.message}</p>}
            </Col>
          </Row>

          {/* Broker Compliance Box */}
          <div className="add-prop-broker-box">
            <p className="add-prop-broker-title">
              <i className="fa-solid fa-file-contract" style={{ color: '#0088BD' }} />
              Broker Compliance Information
            </p>
            <Row className="g-2">
              <Col md={6}>
                <label className="add-prop-label">RE-Broker License #</label>
                <input className="add-prop-input"
                  placeholder="SA-9942-X03"
                  {...register('brokerLicense')} />
              </Col>
              <Col md={6}>
                <label className="add-prop-label">Ejar Integration Mode</label>
                <div className="add-prop-ejar-wrapper">
                  <span className="add-prop-ejar-label">
                    {ejarEnabled ? 'Auto-Sync Enabled' : 'Auto-Sync Disabled'}
                  </span>
                  <label className="add-prop-ejar-toggle">
                    <input type="checkbox" checked={ejarEnabled}
                      onChange={() => setEjarEnabled(v => !v)} />
                    <span className="add-prop-ejar-slider" />
                  </label>
                </div>
              </Col>
            </Row>
          </div>
        </div>

        {/* ══════════════════════════════════════
            Section 2 — Precise Location
        ══════════════════════════════════════ */}
        <div className="add-prop-section">
          <div className="add-prop-location-header">
            <div>
              <h2 className="add-prop-title">Precise Location</h2>
              <p className="add-prop-subtitle" style={{ margin: 0 }}>
                Select the district and pin the exact location.
              </p>
            </div>
            <button type="button" className="add-prop-use-location"
              onClick={handleUseCurrentLocation}>
              <i className="fa-solid fa-location-crosshairs" />
              Use Current Location
            </button>
          </div>

          <div className="add-prop-map-wrapper">
            <MapContainer
              center={markerPos || DEFAULT_CENTER}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              <MapClickHandler onLocationSelect={handleMapClick} />
              {markerPos && <Marker position={markerPos} />}
            </MapContainer>
          </div>

          <Row className="g-2 mt-2">
            <Col md={4}>
              <label className="add-prop-label">Country</label>
              <select className="add-prop-input"
                {...register('countryId', { validate: v => v !== '0' || 'Required' })}>
                <option value="0">Select Country</option>
                {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.countryId && <p className="add-prop-error-text">{errors.countryId.message}</p>}
            </Col>

            <Col md={4}>
              <label className="add-prop-label">City</label>
              <select className="add-prop-input"
                disabled={!watchedCountryId || watchedCountryId === '0'}
                {...register('cityId', { validate: v => v !== '0' || 'Required' })}>
                <option value="0">Select City</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.cityId && <p className="add-prop-error-text">{errors.cityId.message}</p>}
            </Col>

            <Col md={4}>
              <label className="add-prop-label">District</label>
              <select className="add-prop-input"
                disabled={!watchedCityId || watchedCityId === '0'}
                {...register('districtId', { validate: v => v !== '0' || 'Required' })}>
                <option value="0">Select District</option>
                {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              {errors.districtId && <p className="add-prop-error-text">{errors.districtId.message}</p>}
            </Col>

            <Col md={12}>
              <label className="add-prop-label">Location Description</label>
              <input className="add-prop-input"
                placeholder="e.g. Near King Fahd Road"
                {...register('locationDescription')} />
            </Col>
          </Row>
        </div>

        {/* ══════════════════════════════════════
            Section 3 — Dimensions & Value
        ══════════════════════════════════════ */}
        <div className="add-prop-section">
          <h2 className="add-prop-title">Dimensions & Value</h2>

          <Row className="g-3">
            <Col md={6}>
              <label className="add-prop-label">Asking Price (SAR)</label>
              <div className="add-prop-price-wrapper">
                <input type="number"
                  className={`add-prop-input ${errors.price ? 'is-invalid' : ''}`}
                  placeholder="3,250,000"
                  {...register('price', { required: 'Price is required', min: 1 })} />
                <span className="add-prop-price-unit">SAR</span>
              </div>
              {errors.price && <p className="add-prop-error-text">{errors.price.message}</p>}
              <p style={{ fontSize: '12px', color: '#0088BD', marginTop: '6px' }}>
                Suggested market value for this area: 3.1M - 3.4M SAR
              </p>
            </Col>

            <Col md={6}>
              <label className="add-prop-label">Total Area (M²)</label>
              <div className="add-prop-price-wrapper">
                <input type="number" className="add-prop-input"
                  placeholder="450"
                  {...register('area')} />
                <span className="add-prop-price-unit">m²</span>
              </div>
            </Col>

            <Col md={6}>
              <label className="add-prop-label">Bedrooms</label>
              <Counter value={bedrooms} onChange={setBedrooms} />
            </Col>

            <Col md={6}>
              <label className="add-prop-label">Bathrooms</label>
              <Counter value={bathrooms} onChange={setBathrooms} />
            </Col>

            <Col md={12}>
              <label className="add-prop-label">Title</label>
              <input className={`add-prop-input ${errors.title ? 'is-invalid' : ''}`}
                placeholder="e.g. Luxury Villa in Riyadh"
                {...register('title', { required: 'Title is required' })} />
              {errors.title && <p className="add-prop-error-text">{errors.title.message}</p>}
            </Col>

            <Col md={12}>
              <label className="add-prop-label">Description</label>
              <textarea className={`add-prop-input ${errors.description ? 'is-invalid' : ''}`}
                rows={3} placeholder="Describe the property..."
                {...register('description', { required: 'Description is required' })} />
              {errors.description && <p className="add-prop-error-text">{errors.description.message}</p>}
            </Col>

            <Col md={6}>
              <label className="add-prop-label">Contact Phone</label>
              <input className={`add-prop-input ${errors.contactPhone ? 'is-invalid' : ''}`}
                placeholder="+966 5xx xxx xxx"
                {...register('contactPhone', { required: 'Phone is required' })} />
              {errors.contactPhone && <p className="add-prop-error-text">{errors.contactPhone.message}</p>}
            </Col>

            <Col md={6}>
              <label className="add-prop-label">Negotiable</label>
              <Controller
                name="isNegotiable"
                control={control}
                render={({ field }) => (
                  <div className="add-prop-toggle">
                    <button type="button"
                      className={`add-prop-toggle-btn ${!field.value ? 'active' : ''}`}
                      onClick={() => field.onChange(false)}>No</button>
                    <button type="button"
                      className={`add-prop-toggle-btn ${field.value ? 'active' : ''}`}
                      onClick={() => field.onChange(true)}>Yes</button>
                  </div>
                )}
              />
            </Col>
          </Row>
        </div>

        {/* ══════════════════════════════════════
            Section 4 — Key Amenities
        ══════════════════════════════════════ */}
        <div className="add-prop-section">
          <h2 className="add-prop-title">Key Amenities</h2>
          <div className="add-prop-amenities-grid">
            {AMENITIES.map(amenity => (
              <div
                key={amenity.id}
                className={`add-prop-amenity-card ${selectedAmenities.includes(amenity.id) ? 'selected' : ''}`}
                onClick={() => toggleAmenity(amenity.id)}
              >
                {selectedAmenities.includes(amenity.id) && (
                  <div className="add-prop-amenity-check">
                    <i className="fa-solid fa-check" />
                  </div>
                )}
                <i className={amenity.icon} />
                <span>{amenity.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════
            Section 5 — Property Images
        ══════════════════════════════════════ */}
        <div className="add-prop-section">
          <h2 className="add-prop-title">Property Images</h2>
          <p className="add-prop-subtitle">Add at least one image for your listing.</p>

          {/* Upload Area */}
          <label className="add-prop-image-upload" htmlFor="property-images">
            <i className="fa-solid fa-cloud-arrow-up" />
            <p>Click to upload images</p>
            <span>PNG, JPG up to 10MB each</span>
            <input
              id="property-images"
              type="file"
              multiple
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImages}
            />
          </label>

          {/* Previews */}
          {imagePreviews.length > 0 && (
            <div className="add-prop-image-preview">
              {imagePreviews.map((src, idx) => (
                <div key={idx} className="add-prop-image-thumb">
                  <img src={src} alt={`preview-${idx}`} />
                  <button
                    type="button"
                    className="add-prop-image-thumb-remove"
                    onClick={() => removeImage(idx)}
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════
            Footer
        ══════════════════════════════════════ */}
        <div className="add-prop-footer">
          <button type="button" className="add-prop-prev-btn"
            onClick={() => navigate(-1)}>
            Previous: Identity
          </button>
          <button type="submit" className="add-prop-submit-btn" disabled={submitting}>
            {submitting
              ? <><span className="spinner-border spinner-border-sm" /> Adding...</>
              : <>Submit Property <i className="fa-solid fa-check" /></>
            }
          </button>
        </div>

      </form>
    </div>
  );
}