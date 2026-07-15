import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useAddProperty from '../useAddProperty.js';
import { apiKey } from '../../../../constants/Validations.js';
import { LOCATIONS_URLs, BASE_URL } from '../../../../constants/EndPoints.js';
import '../AgentPannel.css';

// ─── Fix Leaflet default icon ──────────────────────────────────────────────────
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
export default function AddProperty() {

  const { t, i18n } = useTranslation();

  const {
    realStateTypes, purposeTypes, rentTypes,
    countries, cities, districts,
    submitting, error,
    fetchCities, fetchDistricts, submitProperty,
  } = useAddProperty();

  const [markerPos,         setMarkerPos]         = useState(null);
  const [bedrooms,          setBedrooms]           = useState(0);
  const [bathrooms,         setBathrooms]          = useState(0);
  const [selectedAmenities, setSelectedAmenities]  = useState([]);
  const [ejarEnabled,       setEjarEnabled]        = useState(true);
  const [images,            setImages]             = useState([]);
  const [imagePreviews,     setImagePreviews]      = useState([]);
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

  useEffect(() => { fetchCities(watchedCountryId);  }, [watchedCountryId, fetchCities]);
  useEffect(() => { fetchDistricts(watchedCityId);  }, [watchedCityId,    fetchDistricts]);

  // ── Reverse Geocoding ──
  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const currentLang = i18n.language?.startsWith('ar') ? 'ar' : 'en';
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=${currentLang}`
      );
      const data = await res.json();
      return {
        country:  data.address?.country || '',
        city:     data.address?.city || data.address?.town || data.address?.state || '',
        district: data.address?.suburb || data.address?.district || data.address?.neighbourhood || '',
      };
    } catch { return null; }
  }, [i18n.language]);

  const normalizeLocationValue = useCallback((value = '') => {
    return String(value)
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }, []);

  const findBestLocationMatch = useCallback((list, target) => {
    const normalizedTarget = normalizeLocationValue(target);
    if (!normalizedTarget || !Array.isArray(list) || list.length === 0) return null;

    const scoredMatches = list
      .map((item) => {
        const itemName = item?.name || '';
        const normalizedName = normalizeLocationValue(itemName);
        if (!normalizedName) return null;

        let score = 0;
        if (normalizedName === normalizedTarget) score = 100;
        else if (normalizedName.includes(normalizedTarget) || normalizedTarget.includes(normalizedName)) score = 80;
        else {
          const targetTokens = normalizedTarget.split(' ');
          const nameTokens = normalizedName.split(' ');
          const overlap = targetTokens.filter((token) => nameTokens.includes(token)).length;
          if (overlap > 0) score = 40 + overlap * 10;
        }

        return score > 0 ? { item, score } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score);

    if (scoredMatches.length === 0) return list.length === 1 ? list[0] : null;
    return scoredMatches[0].score >= 40 ? scoredMatches[0].item : (list.length === 1 ? list[0] : null);
  }, [normalizeLocationValue]);

  // ── Map Click ──
  const handleMapClick = useCallback(async (lat, lng) => {
    setMarkerPos([lat, lng]);
    const location = await reverseGeocode(lat, lng);
    if (!location) return;

    const matchedCountry = findBestLocationMatch(countries, location.country);
    const isArabic = i18n.language?.startsWith('ar');
    const locationLabelPrefix = isArabic ? 'المدينة' : 'City';
    const locationLabelDistrict = isArabic ? 'الحي' : 'District';

    if (matchedCountry) {
      setValue('countryId', String(matchedCountry.id));
      await fetchCities(matchedCountry.id);

      setTimeout(async () => {
        const cityRes = await axios.get(
          `${LOCATIONS_URLs.Cities}${matchedCountry.id}`,
          { headers: { Authorization: `Bearer ${sessionStorage.token}`, apiKey } }
        );
        const citiesList = cityRes.data || [];
        const matchedCity = findBestLocationMatch(citiesList, location.city);

        if (matchedCity) {
          setValue('cityId', String(matchedCity.id));
          await fetchDistricts(matchedCity.id);

          setTimeout(async () => {
            const distRes = await axios.get(
              `${LOCATIONS_URLs.Districts}${matchedCity.id}`,
              { headers: { Authorization: `Bearer ${sessionStorage.token}`, apiKey } }
            );
            const districtsList = distRes.data || [];
            const matchedDistrict = findBestLocationMatch(districtsList, location.district);
            if (matchedDistrict) {
              setValue('districtId', String(matchedDistrict.id));
            } else if (districtsList.length === 1) {
              setValue('districtId', String(districtsList[0].id));
            }
          }, 500);
        }
      }, 500);
    }

    const fallbackDescription = isArabic
      ? `${t('district')}, ${t('city')}, ${t('country')}`
      : `${t('district')}, ${t('city')}, ${t('country')}`;

    setValue('locationDescription', fallbackDescription);
  }, [countries, fetchCities, fetchDistricts, findBestLocationMatch, reverseGeocode, setValue]);

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
  const toggleAmenity = useCallback((id) => {
    setSelectedAmenities(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  }, []);

  // ── Submit ──
  const onSubmit = useCallback(async (data) => {
    if (images.length === 0) {
      toast.error(t('add_image_required'));
      return;
    }
    const toastId = toast.loading(t('adding_property'));
    const success = await submitProperty({
      ...data, bedrooms, bathrooms,
      locationLat: markerPos?.[0] || '',
      locationLng: markerPos?.[1] || '',
    }, images);

    if (success) {
      toast.update(toastId, {
        render: t('property_added'),
        type: 'success', isLoading: false, autoClose: 2000,
      });
      setTimeout(() => navigate('/agentpannel/properties'), 500);
    } else {
      toast.update(toastId, {
        render: error || t('failed_add_property'),
        type: 'error', isLoading: false, autoClose: 3000,
      });
    }
  }, [images, bedrooms, bathrooms, markerPos, submitProperty, error, navigate, t]);

  return (
    <div className="add-prop-page">
      <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">

        {/* ══════════════════════════════════════
            Section 1 — Property Foundation
        ══════════════════════════════════════ */}
        <div className="add-prop-section">
          <h2 className="add-prop-title">{t('property_foundation')}</h2>
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

          {/* Broker Compliance Box */}
          <div className="add-prop-broker-box">
            <p className="add-prop-broker-title">
              <i className="fa-solid fa-file-contract" style={{ color: '#0088BD' }} />
              {t('broker_compliance')}
            </p>
            <Row className="g-2">
              <Col md={6}>
                <label className="add-prop-label">{t('broker_license')}</label>
                <input className="add-prop-input" placeholder="SA-9942-X03" {...register('brokerLicense')} />
              </Col>
              <Col md={6}>
                <label className="add-prop-label">{t('ejar_mode')}</label>
                <div className="add-prop-ejar-wrapper">
                  <span className="add-prop-ejar-label">
                    {ejarEnabled ? t('auto_sync_enabled') : t('auto_sync_disabled')}
                  </span>
                  <label className="add-prop-ejar-toggle">
                    <input type="checkbox" checked={ejarEnabled} onChange={() => setEjarEnabled(v => !v)} />
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
              <p style={{ fontSize: '12px', color: '#0088BD', marginTop: '6px' }}>{t('suggested_market_value')}</p>
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
          <button type="submit" className="add-prop-submit-btn" disabled={submitting}>
            {submitting
              ? <><span className="spinner-border spinner-border-sm" /> {t('adding')}</>
              : <>{t('submit_property')} <i className="fa-solid fa-check" /></>
            }
          </button>
        </div>

      </form>
    </div>
  );
}