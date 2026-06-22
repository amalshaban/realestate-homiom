import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from '../../../constants/EndPoints.js';


// ─── Fix Leaflet Icon ─────────────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_CENTER = [24.7136, 46.6753]; // Riyadh

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PropertiesMap({ properties, onView }) {
  console.log('Properties received:', properties);
  console.log('Sample property:', properties[0]);
  const { t } = useTranslation();

  // ── بس الـ properties اللي عندها lat/lng صحيحة ──
  const validProperties = useMemo(() =>
    properties.filter(p => p.locationLat && p.locationLng),
    [properties]
  );

  const center = useMemo(() => {
    if (validProperties.length === 0) return DEFAULT_CENTER;
    return [validProperties[0].locationLat, validProperties[0].locationLng];
  }, [validProperties]);

  if (validProperties.length === 0) {
    return (
      <div className="pm-empty">
        <i className="fa-solid fa-map-location-dot" />
        <p>{t('no_locations_available')}</p>
      </div>
    );
  }

  return (
    <div className="pm-wrapper">
      <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {validProperties.map(property => (
          <Marker key={property.id} position={[property.locationLat, property.locationLng]}>
            <Popup>
              <div className="pm-popup" onClick={() => onView(property.id)}>
                {(property.mainImageUrl || property.image) && (
                  <img
                    src={`${BASE_URL}${property.mainImageUrl || property.image}`}
                    alt={property.title}
                    className="pm-popup-img"
                  />
                )}
                <p className="pm-popup-title">{property.title}</p>
                <p className="pm-popup-price">
                  {property.price?.toLocaleString()} SAR
                  {property.forRent && <span> /{t('month')}</span>}
                </p>
                <p className="pm-popup-location">
                  <i className="fa-solid fa-location-dot" /> {property.district}, {property.city}
                </p>
                <button className="pm-popup-btn">{t('view_details')}</button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}