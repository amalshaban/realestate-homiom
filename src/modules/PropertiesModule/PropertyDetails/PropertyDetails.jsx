import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'react-toastify';
import NavBar from '../../SharedModule/NavBar/NavBar.jsx';
import Footer from '../../SharedModule/Footer/Footer.jsx';
import usePropertyDetails from '../usePropertyDetails.js';
import profileimg from '../../../assets/imgs/profile.png';
import { BASE_URL } from '../../../constants/EndPoints.js';
import '../PropertyDetails.css';

// ─── Fix Leaflet Icon ─────────────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_POS = [24.7136, 46.6753];

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

// ─── Sub Components ───────────────────────────────────────────────────────────
const SkeletonLoader = () => (
  <div>
    <div className="pd-skeleton" style={{ height: '480px', borderRadius: 0 }} />
    <div style={{ maxWidth: 1200, margin: '32px auto', padding: '0 24px' }}>
      <div className="pd-skeleton mb-3" style={{ height: '40px', width: '60%' }} />
      <div className="pd-skeleton mb-2" style={{ height: '20px', width: '40%' }} />
      <div className="pd-skeleton"      style={{ height: '20px', width: '30%' }} />
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PropertyDetails() {

  const { id: rawId } = useParams();
  const id = rawId?.startsWith(':') ? rawId.slice(1) : rawId;
  const { t } = useTranslation();

  const {
    property, loading, error, submitting,
    sendVisitRequest, sendPurchaseRequest, sendRentalRequest,
  } = usePropertyDetails(id);

  const [name,         setName]         = useState('');
  const [email,        setEmail]        = useState('');
  const [message,      setMessage]      = useState('');
  const [offeredPrice, setOfferedPrice] = useState('');
  const [notes,        setNotes]        = useState('');

  const handleVisitRequest = useCallback(async () => {
    const result = await sendVisitRequest();
    if (result.success) toast.success(t('visit_request_sent'));
    else toast.error(result.message || t('failed_send_request'));
  }, [sendVisitRequest, t]);

  const handlePurchaseRequest = useCallback(async () => {
    if (property?.forRent) {
      toast.warning(t('property_rent_only'));
      return;
    }
    const result = await sendPurchaseRequest(offeredPrice, notes);
    if (result.success) toast.success(t('purchase_request_sent'));
    else toast.error(result.message || t('failed_send_request'));
  }, [property, offeredPrice, notes, sendPurchaseRequest, t]);

  const handleRentalRequest = useCallback(async () => {
    if (!property?.forRent) {
      toast.warning(t('property_sale_only'));
      return;
    }
    const result = await sendRentalRequest(offeredPrice, notes, property?.realStateRentTypeId);
    if (result.success) toast.success(t('rental_request_sent'));
    else toast.error(result.message || t('failed_send_request'));
  }, [property, offeredPrice, notes, sendRentalRequest, t]);

  const handleWhatsApp = useCallback(() => {
    const phone = property?.contactPhone?.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}`, '_blank');
  }, [property]);

  const images  = property?.images || [];
  const mainImg = property?.mainImageUrl ? `${BASE_URL}${property.mainImageUrl}` : null;

  return (
    <div className="pd-page">

      {loading && <SkeletonLoader />}

      {error && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#e53e3e' }}>
          <i className="fa-solid fa-circle-exclamation" style={{ fontSize: 40, marginBottom: 12, display: 'block' }} />
          <p>{t('failed_load_property')}</p>
        </div>
      )}

      {!loading && !error && property && (
        <>
          {/* ── Image Gallery ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gridTemplateRows: '240px 240px',
            gap: '4px',
            height: '480px',
          }}>
            <div style={{ gridColumn: 1, gridRow: '1 / span 2', overflow: 'hidden' }}>
              {mainImg
                ? <img src={mainImg} alt={property.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ background: '#f0f0f0', height: '100%' }} />
              }
            </div>
            <div style={{ gridColumn: 2, gridRow: 1, overflow: 'hidden' }}>
              {images[0]
                ? <img src={`${BASE_URL}${images[0].imageUrl}`} alt="img-1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ background: '#e0e0e0', height: '100%' }} />
              }
            </div>
            <div style={{ gridColumn: 2, gridRow: 2, overflow: 'hidden', position: 'relative' }}>
              {images[1]
                ? <img src={`${BASE_URL}${images[1].imageUrl}`} alt="img-2" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ background: '#d0d0d0', height: '100%' }} />
              }
              {images.length > 3 && (
                <div className="pd-gallery-more">+{images.length - 2} {t('more')}</div>
              )}
            </div>
          </div>

          {/* ── Main Content ── */}
          <div className="pd-main">

            {/* ── Left Side ── */}
            <div className="pd-left">

              {/* Badges */}
              <div className="pd-badges">
                <span className="pd-badge new">{t('new_on_market')}</span>
                {property.isAvailable && <span className="pd-badge verified">{t('verified_listing')}</span>}
                <span className={`pd-badge ${property.forRent ? 'rent' : 'sale'}`}>
                  {property.forRent ? t('for_rent') : t('for_sale')}
                </span>
              </div>

              {/* Title + Price */}
              <div className="pd-price-row">
                <div>
                  <h1 className="pd-title">{property.title}</h1>
                  <p className="pd-location">
                    <i className="fa-solid fa-location-dot" style={{ color: '#16a34a' }} />
                    {property.district}, {property.city}, {property.country}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p className="pd-price-guide">{t('price_guide')}</p>
                  <p className="pd-price">SAR {property.price?.toLocaleString()}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="pd-stats">
                
                <div className="pd-stat-card">
                  <i className="fa-solid fa-bed" />
                  <p className="pd-stat-label">{t('bedrooms')}</p>
                  <p className="pd-stat-value">{property.bedrooms || 0} {t('units')}</p>
                </div>
                <div className="pd-stat-card">
                  <i className="fa-solid fa-bath" />
                  <p className="pd-stat-label">{t('bathrooms')}</p>
                  <p className="pd-stat-value">{property.bathrooms || 0} {t('baths')}</p>
                </div>
                <div className="pd-stat-card">
                  <i className="fa-solid fa-vector-square" />
                  <p className="pd-stat-label">{t('floor_area')}</p>
                  <p className="pd-stat-value">{property.area || 0} m²</p>
                </div>
                <div className="pd-stat-card">
                  <i className="fa-solid fa-square-parking" />
                  <p className="pd-stat-label">{t('parking')}</p>
                  <p className="pd-stat-value">{property.parking || 0} {t('cars')}</p>
                </div>
              </div>

              {/* Overview */}
              <div className="pd-section">
                <h2 className="pd-section-title">{t('overview')}</h2>
                <p className="pd-description">
                  {property.description || t('no_description')}
                </p>
              </div>

              {/* Request Section */}
              <div className="pd-section">
                <h2 className="pd-section-title">{t('make_an_offer')}</h2>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <input
                    className="pd-form-input"
                    type="number"
                    placeholder={t('offered_price')}
                    value={offeredPrice}
                    onChange={e => setOfferedPrice(e.target.value)}
                    style={{ marginBottom: 0 }}
                  />
                  <input
                    className="pd-form-input"
                    type="text"
                    placeholder={t('notes')}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    style={{ marginBottom: 0 }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {!property.forRent && (
                    <button className="pd-btn-primary" onClick={handlePurchaseRequest} disabled={submitting} style={{ margin: 0 }}>
                      <i className="fa-solid fa-hand-holding-dollar me-2" />
                      {t('send_purchase_request')}
                    </button>
                  )}
                  {property.forRent && (
                    <button className="pd-btn-primary" onClick={handleRentalRequest} disabled={submitting} style={{ margin: 0 }}>
                      <i className="fa-solid fa-key me-2" />
                      {t('ask_to_rent')}
                    </button>
                  )}
                </div>
              </div>

              {/* The Neighborhood */}
              <div className="pd-section">
                <div className="pd-map-header">
                  <h2 className="pd-section-title" style={{ margin: 0 }}>{t('the_neighborhood')}</h2>
                  <a href="#" className="pd-neighborhood-link">{t('view_neighborhood_guide')}</a>
                </div>
                <div className="pd-map-wrapper">
                  <MapContainer center={DEFAULT_POS} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={true}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
                    <Marker position={DEFAULT_POS} />
                  </MapContainer>
                </div>
                <div className="pd-scores">
                  <div className="pd-score-card">
                    <p className="pd-score-label">{t('walk_score')}</p>
                    <p className="pd-score-value">88 / 100</p>
                    <p className="pd-score-desc">{t('very_walkable')}</p>
                  </div>
                  <div className="pd-score-card">
                    <p className="pd-score-label">{t('transit_score')}</p>
                    <p className="pd-score-value">64 / 100</p>
                    <p className="pd-score-desc">{t('good_transit')}</p>
                  </div>
                  <div className="pd-score-card">
                    <p className="pd-score-label">{t('market_trend')}</p>
                    <p className="pd-score-value" style={{ color: '#16a34a' }}>+12.4%</p>
                    <p className="pd-score-desc">{t('property_value_yoy')}</p>
                  </div>
                </div>
              </div>

              {/* Property History */}
              <div className="pd-section">
                <h2 className="pd-section-title">{t('property_history')}</h2>
                <div className="pd-history-item">
                  <div>
                    <p className="pd-history-title">{t('listed_for_sale')}</p>
                    <p className="pd-history-sub">Homiom.com Exclusive</p>
                  </div>
                  <span className="pd-history-date">{formatDate(property.insertedDate)}</span>
                </div>
                <div className="pd-history-item inactive">
                  <div>
                    <p className="pd-history-title" style={{ color: '#aaa' }}>{t('construction_completed')}</p>
                    <p className="pd-history-sub">{property.agentName}</p>
                  </div>
                  <span className="pd-history-date">—</span>
                </div>
              </div>

            </div>

            {/* ── Right Side ── */}
            <div className="pd-right">
              <div className="pd-contact-card">

                {/* Agent */}
                <div className="pd-agent">
                  <img src={profileimg} alt={property.agentName} className="pd-agent-img" />
                  <div>
                    <p className="pd-agent-name">{property.agentName}</p>
                    <p className="pd-agent-title">{t('premium_portfolio_director')}</p>
                    <p className="pd-agent-rating">
                      <i className="fa-solid fa-star" /> {t('top_rated_agent')}
                    </p>
                  </div>
                </div>

                {/* Form */}
                <label className="pd-form-label">{t('full_name')}</label>
                <input className="pd-form-input" placeholder={t('your_name')} value={name} onChange={e => setName(e.target.value)} />

                <label className="pd-form-label">{t('email_address')}</label>
                <input type="email" className="pd-form-input" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} />

                <label className="pd-form-label">{t('message')}</label>
                <textarea
                  className="pd-form-input"
                  rows={4}
                  value={message || `${t('interested_in')} ${property.title}. ${t('please_send_details')}`}
                  onChange={e => setMessage(e.target.value)}
                />

                {/* Buttons */}
                <button className="pd-btn-primary" onClick={handleVisitRequest} disabled={submitting}>
                  {submitting
                    ? <><span className="spinner-border spinner-border-sm me-2" />{t('sending')}</>
                    : t('request_private_viewing')
                  }
                </button>

                <button className="pd-btn-whatsapp" onClick={handleWhatsApp}>
                  <i className="fa-brands fa-whatsapp" style={{ color: '#25D366', fontSize: 18 }} />
                  {t('chat_whatsapp')}
                </button>

                <p className="pd-disclaimer">
                  {t('disclaimer_text')} {property.agentName} {t('disclaimer_text2')}
                </p>
              </div>

              {/* Insight Box */}
              <div className="pd-insight-box">
                <p className="pd-insight-title">
                  <i className="fa-solid fa-chart-line" /> {t('homiom_insight')}
                </p>
                <p className="pd-insight-text">
                  {t('insight_text')} {property.district} {t('insight_text2')}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}