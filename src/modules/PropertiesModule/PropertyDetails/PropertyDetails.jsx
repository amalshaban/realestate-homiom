import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'react-toastify';
import NavBar from '../../SharedModule/NavBar/NavBar.jsx';
import Footer from '../../SharedModule/Footer/Footer.jsx';
import usePropertyDetails from '../usePropertyDetails.js';
import profileimg from '../../../assets/imgs/profile.png';
import '../../../modules/PropertiesModule/PropertyDetails.css';

// ─── Fix Leaflet Icon ─────────────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_IMG    = 'https://realstate.niledevelopers.com';
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
    if (result.success) toast.success('Visit request sent!');
    else toast.error(result.message || 'Failed to send request.');
  }, [sendVisitRequest]);

  const handlePurchaseRequest = useCallback(async () => {
    if (property?.forRent) {
      toast.warning('This property is for rent only!');
      return;
    }
    const result = await sendPurchaseRequest(offeredPrice, notes);
    if (result.success) toast.success('Purchase request sent!');
    else toast.error(result.message || 'Failed to send request.');
  }, [property, offeredPrice, notes, sendPurchaseRequest]);

  const handleRentalRequest = useCallback(async () => {
    if (!property?.forRent) {
      toast.warning('This property is for purchase only!');
      return;
    }
    const result = await sendRentalRequest(offeredPrice, notes, property?.realStateRentTypeId);
    if (result.success) toast.success('Rental request sent!');
    else toast.error(result.message || 'Failed to send request.');
  }, [property, offeredPrice, notes, sendRentalRequest]);

  const handleWhatsApp = useCallback(() => {
    const phone = property?.contactPhone?.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}`, '_blank');
  }, [property]);

  const images = property?.images || [];
  const mainImg = property?.mainImageUrl
    ? `${BASE_IMG}${property.mainImageUrl}`
    : null;

  return (
    <div className="pd-page">

      {loading && <SkeletonLoader />}

      {error && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#e53e3e' }}>
          <i className="fa-solid fa-circle-exclamation" style={{ fontSize: 40, marginBottom: 12, display: 'block' }} />
          <p>Failed to load property details.</p>
        </div>
      )}

      {!loading && !error && property && (
        <>
          {/* ── Image Gallery ── */}
          <div className="pd-gallery">
            <div className="pd-gallery-main">
              {mainImg
                ? <img src={mainImg} alt={property.title} />
                : <div style={{ background: '#f0f0f0', height: '100%' }} />
              }
            </div>
            {images.slice(0, 2).map((img, idx) => (
              <div key={idx} className="pd-gallery-thumb">
                <img src={`${BASE_IMG}${img.imageUrl}`} alt={`img-${idx}`} />
                {idx === 1 && images.length > 3 && (
                  <div className="pd-gallery-more">+{images.length - 2} more</div>
                )}
              </div>
            ))}
          </div>

          {/* ── Main Content ── */}
          <div className="pd-main">

            {/* ── Left Side ── */}
            <div className="pd-left">

              {/* Badges */}
              <div className="pd-badges">
                <span className="pd-badge new">New on Market</span>
                {property.isAvailable && <span className="pd-badge verified">Verified Listing</span>}
                <span className={`pd-badge ${property.forRent ? 'rent' : 'sale'}`}>
                  {property.forRent ? 'For Rent' : 'For Sale'}
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
                  <p className="pd-price-guide">Price Guide</p>
                  <p className="pd-price">SAR {property.price?.toLocaleString()}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="pd-stats">
                <div className="pd-stat-card">
                  <i className="fa-solid fa-bed" />
                  <p className="pd-stat-label">Bedrooms</p>
                  <p className="pd-stat-value">{property.bedrooms || 0} Units</p>
                </div>
                <div className="pd-stat-card">
                  <i className="fa-solid fa-bath" />
                  <p className="pd-stat-label">Bathrooms</p>
                  <p className="pd-stat-value">{property.bathrooms || 0} Baths</p>
                </div>
                <div className="pd-stat-card">
                  <i className="fa-solid fa-vector-square" />
                  <p className="pd-stat-label">Floor Area</p>
                  <p className="pd-stat-value">{property.area || 0} m²</p>
                </div>
                <div className="pd-stat-card">
                  <i className="fa-solid fa-square-parking" />
                  <p className="pd-stat-label">Parking</p>
                  <p className="pd-stat-value">
                    {property.parking || 0} Cars
                  </p>
                </div>
              </div>

              {/* Overview */}
              <div className="pd-section">
                <h2 className="pd-section-title">Overview</h2>
                <p className="pd-description">
                  {property.description || 'No description available for this property.'}
                </p>
              </div>

              {/* Request Section */}
              <div className="pd-section">
                <h2 className="pd-section-title">Make an Offer</h2>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <input
                    className="pd-form-input"
                    type="number"
                    placeholder="Offered Price (SAR)"
                    value={offeredPrice}
                    onChange={e => setOfferedPrice(e.target.value)}
                    style={{ marginBottom: 0 }}
                  />
                  <input
                    className="pd-form-input"
                    type="text"
                    placeholder="Notes"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    style={{ marginBottom: 0 }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {!property.forRent && (
                    <button
                      className="pd-btn-primary"
                      onClick={handlePurchaseRequest}
                      disabled={submitting}
                      style={{ margin: 0 }}
                    >
                      <i className="fa-solid fa-hand-holding-dollar me-2" />
                      Send Purchase Request
                    </button>
                  )}
                  {property.forRent && (
                    <button
                      className="pd-btn-primary"
                      onClick={handleRentalRequest}
                      disabled={submitting}
                      style={{ margin: 0 }}
                    >
                      <i className="fa-solid fa-key me-2" />
                      Ask to Rent
                    </button>
                  )}
                </div>
              </div>

              {/* The Neighborhood */}
              <div className="pd-section">
                <div className="pd-map-header">
                  <h2 className="pd-section-title" style={{ margin: 0 }}>The Neighborhood</h2>
                  <a href="#" className="pd-neighborhood-link">View Neighborhood Guide</a>
                </div>

                <div className="pd-map-wrapper">
                  <MapContainer
                    center={DEFAULT_POS}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={true}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; OpenStreetMap contributors'
                    />
                    <Marker position={DEFAULT_POS} />
                  </MapContainer>
                </div>

                {/* Scores */}
                <div className="pd-scores">
                  <div className="pd-score-card">
                    <p className="pd-score-label">Walk Score</p>
                    <p className="pd-score-value">88 / 100</p>
                    <p className="pd-score-desc">Very Walkable area</p>
                  </div>
                  <div className="pd-score-card">
                    <p className="pd-score-label">Transit Score</p>
                    <p className="pd-score-value">64 / 100</p>
                    <p className="pd-score-desc">Good access to Metro</p>
                  </div>
                  <div className="pd-score-card">
                    <p className="pd-score-label">Market Trend</p>
                    <p className="pd-score-value" style={{ color: '#16a34a' }}>+12.4%</p>
                    <p className="pd-score-desc">Property value YOY</p>
                  </div>
                </div>
              </div>

              {/* Property History */}
              <div className="pd-section">
                <h2 className="pd-section-title">Property History</h2>
                <div className="pd-history-item">
                  <div>
                    <p className="pd-history-title">Listed for Sale</p>
                    <p className="pd-history-sub">Homiom.com Exclusive</p>
                  </div>
                  <span className="pd-history-date">{formatDate(property.insertedDate)}</span>
                </div>
                <div className="pd-history-item inactive">
                  <div>
                    <p className="pd-history-title" style={{ color: '#aaa' }}>Construction Completed</p>
                    <p className="pd-history-sub">{property.agentName}</p>
                  </div>
                  <span className="pd-history-date">—</span>
                </div>
              </div>

            </div>

            {/* ── Right Side ── */}
            <div className="pd-right">

              {/* Contact Card */}
              <div className="pd-contact-card">

                {/* Agent */}
                <div className="pd-agent">
                  <img src={profileimg} alt={property.agentName} className="pd-agent-img" />
                  <div>
                    <p className="pd-agent-name">{property.agentName}</p>
                    <p className="pd-agent-title">Premium Portfolio Director</p>
                    <p className="pd-agent-rating">
                      <i className="fa-solid fa-star" /> Top Rated Agent
                    </p>
                  </div>
                </div>

                {/* Form */}
                <label className="pd-form-label">Full Name</label>
                <input
                  className="pd-form-input"
                  placeholder="Your Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />

                <label className="pd-form-label">Email Address</label>
                <input
                  type="email"
                  className="pd-form-input"
                  placeholder="email@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />

                <label className="pd-form-label">Message</label>
                <textarea
                  className="pd-form-input"
                  rows={4}
                  value={message || `I am interested in ${property.title}. Please send more details.`}
                  onChange={e => setMessage(e.target.value)}
                />

                {/* Buttons */}
                <button
                  className="pd-btn-primary"
                  onClick={handleVisitRequest}
                  disabled={submitting}
                >
                  {submitting
                    ? <><span className="spinner-border spinner-border-sm me-2" />Sending...</>
                    : 'Request Private Viewing'
                  }
                </button>

                <button className="pd-btn-whatsapp" onClick={handleWhatsApp}>
                  <i className="fa-brands fa-whatsapp" style={{ color: '#25D366', fontSize: 18 }} />
                  Chat via WhatsApp
                </button>

                <p className="pd-disclaimer">
                  By clicking "Request Private Viewing", you agree to our Terms of Use and
                  Privacy Policy. You may be contacted by {property.agentName} regarding this property.
                </p>
              </div>

              {/* Insight Box */}
              <div className="pd-insight-box">
                <p className="pd-insight-title">
                  <i className="fa-solid fa-chart-line" /> Homiom Insight
                </p>
                <p className="pd-insight-text">
                  This property is priced competitively for the {property.district} area.
                  High investor demand noted in this sector.
                </p>
              </div>

            </div>
          </div>

       
        </>
      )}
    </div>
  );
}