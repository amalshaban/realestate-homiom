import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useAddProperty from '../../UsersModule/RealEstateAgents/useAddProperty.js';
import DeleteProperty from '../DeleteProperty/DeleteProperty.jsx';
import { apiKey } from '../../../constants/Validations.js';
import { LOCATIONS_URLs, AGENT_URLs, BASE_URL } from '../../../constants/EndPoints.js';


// ─── Fix Leaflet Icon ──────────────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ─── Constants ────────────────────────────────────────────────────────────────
const AMENITY_KEYS = [
  { id: 1, key: 'private_pool', icon: 'fa-solid fa-water-ladder'  },
  { id: 2, key: 'elevator',     icon: 'fa-solid fa-elevator'       },
  { id: 3, key: 'driver_room',  icon: 'fa-solid fa-car'            },
  { id: 4, key: 'roof_deck',    icon: 'fa-solid fa-building'       },
  { id: 5, key: 'gym',          icon: 'fa-solid fa-dumbbell'       },
  { id: 6, key: 'parking',      icon: 'fa-solid fa-square-parking' },
  { id: 7, key: 'garden',       icon: 'fa-solid fa-tree'           },
];

const DEFAULT_CENTER = [24.7136, 46.6753];

// ─── Map Click Handler ────────────────────────────────────────────────────────
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) { onLocationSelect(e.latlng.lat, e.latlng.lng); },
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
export default function EditProperty() {

  const { t }  = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    realStateTypes, purposeTypes, rentTypes,
    countries, cities, districts,
    fetchCities, fetchDistricts,
  } = useAddProperty();

  const [markerPos,         setMarkerPos]         = useState(null);
  const [bedrooms,          setBedrooms]           = useState(0);
  const [bathrooms,         setBathrooms]          = useState(0);
  const [selectedAmenities, setSelectedAmenities]  = useState([]);
  const [ejarEnabled,       setEjarEnabled]        = useState(true);
  const [images,            setImages]             = useState([]);
  const [imagePreviews,     setImagePreviews]      = useState([]);
  const [isVisible,         setIsVisible]          = useState(true);
  const [isActive,          setIsActive]           = useState(true);
  const [submitting,        setSubmitting]         = useState(false);
  const [loadingProperty,   setLoadingProperty]    = useState(true);
  const [showDeleteModal,   setShowDeleteModal]    = useState(false);

  const {
    register, handleSubmit, watch, control, setValue, reset,
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

  const handleOpenDelete  = useCallback(() => setShowDeleteModal(true), []);
  const handleCloseDelete = useCallback(() => setShowDeleteModal(false), []);
  const handleDeleted     = useCallback(() => {
    setShowDeleteModal(false);
    navigate('/agentpannel/properties');
  }, [navigate]);

  useEffect(() => { fetchCities(watchedCountryId);  }, [watchedCountryId, fetchCities]);
  useEffect(() => { fetchDistricts(watchedCityId);  }, [watchedCityId,    fetchDistricts]);

  // ── Fetch Property Data ──
  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) {
        toast.error(t('invalid_property_id'));
        setLoadingProperty(false);
        return;
      }

      setLoadingProperty(true);
      try {
        const response = await axios.get(`${BASE_URL}/agent/property/${id}`, {
          headers: { Authorization: `Bearer ${sessionStorage.token}`, apiKey },
        });
        const payload = response?.data;
        const propertyData = payload?.property
          ?? payload?.data?.property
          ?? payload?.data
          ?? payload?.result
          ?? payload;
        const p = Array.isArray(propertyData) ? propertyData[0] : propertyData;

        if (!p || typeof p !== 'object') {
          toast.error(t('failed_load_property'));
          return;
        }

        reset({
          title:               p.title               || '',
          description:         p.description         || '',
          price:               p.price               || '',
          area:                p.area                || '',
          contactPhone:        p.contactPhone        || '',
          locationDescription: p.locationDescription || '',
          forRent:             p.forRent             ?? false,
          isNegotiable:        p.isNegotiable        ?? false,
          realStateTypeId:     String(p.realStateTypeId    || '0'),
          realStatePurposeId:  String(p.realStatePurposeId || '0'),
          realStateRentTypeId: String(p.realStateRentTypeId || '0'),
          countryId:           String(p.countryId    || '0'),
          cityId:              String(p.cityId       || '0'),
          districtId:          String(p.districtId   || '0'),
        });

        setBedrooms(p.bedrooms   || 0);
        setBathrooms(p.bathrooms || 0);
        setIsVisible(p.isAvailable ?? true);
        setIsActive(p.isActive   ?? true);

        if (p.locationLat && p.locationLng) {
          setMarkerPos([p.locationLat, p.locationLng]);
        }
      } catch {
        toast.error(t('failed_load_property'));
      } finally {
        setLoadingProperty(false);
      }
    };
    fetchProperty();
  }, [id, reset, t]);

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
    } catch { return null; }
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
          `${LOCATIONS_URLs.Cities}${matchedCountry.id}`,
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
              `${LOCATIONS_URLs.Districts}${matchedCity.id}`,
              { headers: { Authorization: `Bearer ${sessionStorage.token}`, apiKey } }
            );
            const districtsList = distRes.data || [];
            const matchedDistrict = districtsList.find(d =>
              d.name.toLowerCase().includes(location.district.toLowerCase()) ||
              location.district.toLowerCase().includes(d.name.toLowerCase())
            );
            if (matchedDistrict) setValue('districtId', String(matchedDistrict.id));
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
      () => toast.error(t('location_error'))
    );
  }, [handleMapClick, t]);

  // ── Image Handlers ──
  const handleImages = useCallback((e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  }, []);

  const removeImage = useCallback((idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  }, []);

  // ── Amenities ──
  const toggleAmenity = useCallback((amenityId) => {
    setSelectedAmenities(prev =>
      prev.includes(amenityId) ? prev.filter(a => a !== amenityId) : [...prev, amenityId]
    );
  }, []);

  // ── Submit ──
  const onSubmit = useCallback(async (data) => {
    setSubmitting(true);
    const toastId = toast.loading(t('updating_property'));
    try {
      const numericId = Number(id);
      if (!id || Number.isNaN(numericId)) {
        toast.update(toastId, {
          render: t('invalid_property_id'),
          type: 'error', isLoading: false, autoClose: 3000,
        });
        setSubmitting(false);
        return;
      }

      const formData = new FormData();
      const boolToString = (value) => (value ? 'true' : 'false');

      formData.append('propertyId', numericId);
      formData.append('id', numericId);
      formData.append('title', data.title ?? '');
      formData.append('description', data.description ?? '');
      formData.append('forRent', boolToString(Boolean(data.forRent)));
      formData.append('price', Number(data.price ?? 0));
      formData.append('area', Number(data.area ?? 0));
      formData.append('isNegotiable', boolToString(Boolean(data.isNegotiable)));
      formData.append('realStateTypeId', Number(data.realStateTypeId));
      formData.append('realStatePurposeId', Number(data.realStatePurposeId));
      formData.append('realStateRentTypeId', Number(data.realStateRentTypeId || 0));
      formData.append('countryId', Number(data.countryId));
      formData.append('cityId', Number(data.cityId));
      formData.append('districtId', Number(data.districtId));
      formData.append('contactPhone', data.contactPhone ?? '');
      formData.append('locationDescription', data.locationDescription || '');
      formData.append('bedrooms', Number(bedrooms ?? 0));
      formData.append('bathrooms', Number(bathrooms ?? 0));
      formData.append('setPropertyVisible', boolToString(Boolean(isVisible)));
      formData.append('setPropertyActive', boolToString(Boolean(isActive)));
      formData.append('isVisible', boolToString(Boolean(isVisible)));
      formData.append('isActive', boolToString(Boolean(isActive)));

      if (markerPos) {
        formData.append('locationLat', markerPos[0]);
        formData.append('locationLng', markerPos[1]);
      }

      await axios.post(AGENT_URLs.UpdateProperty, formData, {
        headers: {
          Authorization: `Bearer ${sessionStorage.token}`,
          apiKey,
        },
      });

      toast.update(toastId, {
        render: t('property_updated'),
        type: 'success', isLoading: false, autoClose: 2000,
      });
      setTimeout(() => navigate('/agentpannel/properties'), 500);
    } catch (err) {
      console.error('Update property error:', err.response?.data || err.message);
      toast.update(toastId, {
        render: err.response?.data?.message || err.response?.data || t('failed_update_property'),
        type: 'error', isLoading: false, autoClose: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  }, [id, bedrooms, bathrooms, markerPos, isVisible, isActive, navigate, t]);

  if (loadingProperty) return (
    <div className="add-prop-page">
      {[1,2,3].map(i => (
        <div key={i} className="add-prop-section">
          <div className="ap-skeleton" style={{ height: 24, width: '40%', marginBottom: 16 }} />
          <div className="ap-skeleton" style={{ height: 44, marginBottom: 12 }} />
          <div className="ap-skeleton" style={{ height: 44 }} />
        </div>
      ))}
    </div>
  );

  return (
    <div className="add-prop-page">
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">

        {/* ══════════════════════════════════════
            Section 1 — Property Foundation
        ══════════════════════════════════════ */}
        <div className="add-prop-section">
          <h2 className="add-prop-title">{t('edit_property')}</h2>
          <p className="add-prop-subtitle">{t('property_foundation_subtitle')}</p>

          <Row className="g-2 align-items-center">
            <Col md={6}>
              <label className="add-prop-label">{t('property_type')}</label>
              <select className={`add-prop-input ${errors.realStateTypeId ? 'is-invalid' : ''}`}
                {...register('realStateTypeId', { validate: v => v !== '0' || t('required') })}>
                <option value="0">{t('select_type')}</option>
                {realStateTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
              </select>
              {errors.realStateTypeId && <p className="add-prop-error-text">{errors.realStateTypeId.message}</p>}
            </Col>

            <Col md={6}>
              <label className="add-prop-label">{t('listing_category')}</label>
              <Controller
                name="forRent"
                control={control}
                render={({ field }) => (
                  <div className="add-prop-toggle">
                    <button type="button"
                      className={`add-prop-toggle-btn ${!field.value ? 'active' : ''}`}
                      onClick={() => field.onChange(false)}>{t('for_sale')}</button>
                    <button type="button"
                      className={`add-prop-toggle-btn ${field.value ? 'active' : ''}`}
                      onClick={() => field.onChange(true)}>{t('for_rent')}</button>
                  </div>
                )}
              />
            </Col>

            {watchedForRent && (
              <Col md={6}>
                <label className="add-prop-label">{t('rent_type')}</label>
                <select className="add-prop-input" {...register('realStateRentTypeId')}>
                  <option value="0">{t('select_rent_type')}</option>
                  {rentTypes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </Col>
            )}

            <Col md={watchedForRent ? 6 : 12}>
              <label className="add-prop-label">{t('purpose')}</label>
              <select className={`add-prop-input ${errors.realStatePurposeId ? 'is-invalid' : ''}`}
                {...register('realStatePurposeId', { validate: v => v !== '0' || t('required') })}>
                <option value="0">{t('select_purpose')}</option>
                {purposeTypes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {errors.realStatePurposeId && <p className="add-prop-error-text">{errors.realStatePurposeId.message}</p>}
            </Col>
          </Row>

          {/* ── Visibility & Active Toggles ── */}
          <div className="add-prop-broker-box">
            <p className="add-prop-broker-title">
              <i className="fa-solid fa-sliders" style={{ color: '#0088BD' }} />
              {t('property_settings')}
            </p>
            <Row className="g-2">
              <Col md={6}>
                <label className="add-prop-label">{t('property_visible')}</label>
                <div className="add-prop-ejar-wrapper">
                  <span className="add-prop-ejar-label">
                    {isVisible ? t('visible') : t('hidden')}
                  </span>
                  <label className="add-prop-ejar-toggle">
                    <input type="checkbox" checked={isVisible} onChange={e => setIsVisible(e.target.checked)} />
                    <span className="add-prop-ejar-slider" />
                  </label>
                </div>
              </Col>
              <Col md={6}>
                <label className="add-prop-label">{t('property_active')}</label>
                <div className="add-prop-ejar-wrapper">
                  <span className="add-prop-ejar-label">
                    {isActive ? t('active') : t('inactive')}
                  </span>
                  <label className="add-prop-ejar-toggle">
                    <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
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
              <h2 className="add-prop-title">{t('precise_location')}</h2>
              <p className="add-prop-subtitle" style={{ margin: 0 }}>{t('precise_location_subtitle')}</p>
            </div>
            <button type="button" className="add-prop-use-location" onClick={handleUseCurrentLocation}>
              <i className="fa-solid fa-location-crosshairs" />
              {t('use_current_location')}
            </button>
          </div>

          <div className="add-prop-map-wrapper">
            <MapContainer center={markerPos || DEFAULT_CENTER} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
              <MapClickHandler onLocationSelect={handleMapClick} />
              {markerPos && <Marker position={markerPos} />}
            </MapContainer>
          </div>

          <Row className="g-2 mt-2">
            <Col md={4}>
              <label className="add-prop-label">{t('country')}</label>
              <select className="add-prop-input" {...register('countryId', { validate: v => v !== '0' || t('required') })}>
                <option value="0">{t('select_country')}</option>
                {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.countryId && <p className="add-prop-error-text">{errors.countryId.message}</p>}
            </Col>

            <Col md={4}>
              <label className="add-prop-label">{t('city')}</label>
              <select className="add-prop-input"
                disabled={!watchedCountryId || watchedCountryId === '0'}
                {...register('cityId', { validate: v => v !== '0' || t('required') })}>
                <option value="0">{t('select_city')}</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.cityId && <p className="add-prop-error-text">{errors.cityId.message}</p>}
            </Col>

            <Col md={4}>
              <label className="add-prop-label">{t('district')}</label>
              <select className="add-prop-input"
                disabled={!watchedCityId || watchedCityId === '0'}
                {...register('districtId', { validate: v => v !== '0' || t('required') })}>
                <option value="0">{t('select_district')}</option>
                {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              {errors.districtId && <p className="add-prop-error-text">{errors.districtId.message}</p>}
            </Col>

            <Col md={12}>
              <label className="add-prop-label">{t('location_description')}</label>
              <input className="add-prop-input" placeholder={t('location_description_placeholder')} {...register('locationDescription')} />
            </Col>
          </Row>
        </div>

        {/* ══════════════════════════════════════
            Section 3 — Dimensions & Value
        ══════════════════════════════════════ */}
        <div className="add-prop-section">
          <h2 className="add-prop-title">{t('dimensions_value')}</h2>

          <Row className="g-3">
            <Col md={6}>
              <label className="add-prop-label">{t('asking_price')}</label>
              <div className="add-prop-price-wrapper">
                <input type="number"
                  className={`add-prop-input ${errors.price ? 'is-invalid' : ''}`}
                  placeholder="3,250,000"
                  {...register('price', { required: t('price_required'), min: 1 })} />
                <span className="add-prop-price-unit">SAR</span>
              </div>
              {errors.price && <p className="add-prop-error-text">{errors.price.message}</p>}
            </Col>

            <Col md={6}>
              <label className="add-prop-label">{t('total_area')}</label>
              <div className="add-prop-price-wrapper">
                <input type="number" className="add-prop-input" placeholder="450" {...register('area')} />
                <span className="add-prop-price-unit">m²</span>
              </div>
            </Col>

            <Col md={6}>
              <label className="add-prop-label">{t('bedrooms')}</label>
              <Counter value={bedrooms} onChange={setBedrooms} />
            </Col>

            <Col md={6}>
              <label className="add-prop-label">{t('bathrooms')}</label>
              <Counter value={bathrooms} onChange={setBathrooms} />
            </Col>

            <Col md={12}>
              <label className="add-prop-label">{t('title')}</label>
              <input className={`add-prop-input ${errors.title ? 'is-invalid' : ''}`}
                placeholder={t('title_placeholder')}
                {...register('title', { required: t('title_required') })} />
              {errors.title && <p className="add-prop-error-text">{errors.title.message}</p>}
            </Col>

            <Col md={12}>
              <label className="add-prop-label">{t('description')}</label>
              <textarea className={`add-prop-input ${errors.description ? 'is-invalid' : ''}`}
                rows={3} placeholder={t('description_placeholder')}
                {...register('description', { required: t('description_required') })} />
              {errors.description && <p className="add-prop-error-text">{errors.description.message}</p>}
            </Col>

            <Col md={6}>
              <label className="add-prop-label">{t('contact_phone')}</label>
              <input className={`add-prop-input ${errors.contactPhone ? 'is-invalid' : ''}`}
                placeholder="+966 5xx xxx xxx"
                {...register('contactPhone', { required: t('phone_required') })} />
              {errors.contactPhone && <p className="add-prop-error-text">{errors.contactPhone.message}</p>}
            </Col>

            <Col md={6}>
              <label className="add-prop-label">{t('negotiable')}</label>
              <Controller
                name="isNegotiable"
                control={control}
                render={({ field }) => (
                  <div className="add-prop-toggle">
                    <button type="button"
                      className={`add-prop-toggle-btn ${!field.value ? 'active' : ''}`}
                      onClick={() => field.onChange(false)}>{t('no')}</button>
                    <button type="button"
                      className={`add-prop-toggle-btn ${field.value ? 'active' : ''}`}
                      onClick={() => field.onChange(true)}>{t('yes')}</button>
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
          <h2 className="add-prop-title">{t('key_amenities')}</h2>
          <div className="add-prop-amenities-grid">
            {AMENITY_KEYS.map(amenity => (
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
                <span>{t(amenity.key)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════
            Section 5 — Property Images
        ══════════════════════════════════════ */}
        <div className="add-prop-section">
          <h2 className="add-prop-title">{t('property_images')}</h2>
          <p className="add-prop-subtitle">{t('property_images_subtitle')}</p>

          <label className="add-prop-image-upload" htmlFor="property-images">
            <i className="fa-solid fa-cloud-arrow-up" />
            <p>{t('click_to_upload')}</p>
            <span>{t('image_format_hint')}</span>
            <input id="property-images" type="file" multiple accept="image/*"
              style={{ display: 'none' }} onChange={handleImages} />
          </label>

          {imagePreviews.length > 0 && (
            <div className="add-prop-image-preview">
              {imagePreviews.map((src, idx) => (
                <div key={idx} className="add-prop-image-thumb">
                  <img src={src} alt={`preview-${idx}`} />
                  <button type="button" className="add-prop-image-thumb-remove" onClick={() => removeImage(idx)}>
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
          <button type="button" className="add-prop-prev-btn" onClick={() => navigate(-1)}>
            {t('previous')}
          </button>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              type="button"
              className="add-prop-submit-btn"
              style={{ background: '#d32f2f' }}
              onClick={handleOpenDelete}
              disabled={submitting}
            >
              <i className="fa-solid fa-trash-can me-2" />
              {t('delete')}
            </button>
            <button type="submit" className="add-prop-submit-btn" disabled={submitting}>
              {submitting
                ? <><span className="spinner-border spinner-border-sm" /> {t('updating')}</>
                : <><i className="fa-solid fa-floppy-disk me-2" /> {t('save_changes')}</>
              }
            </button>
          </div>
        </div>

      </form>

      {showDeleteModal && (
        <DeleteProperty
          propertyId={id}
          propertyTitle={watch('title') || t('property')}
          onClose={handleCloseDelete}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}