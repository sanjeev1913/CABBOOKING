import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

// Fix leaflet marker icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom colored markers
const createIcon = (color) =>
    new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });

export const greenIcon = createIcon('green');
export const redIcon = createIcon('red');
export const blueIcon = createIcon('blue');
export const orangeIcon = createIcon('orange');

// Component to handle map click events
const MapClickHandler = ({ onMapClick }) => {
    useMapEvents({
        click: (e) => {
            if (onMapClick) onMapClick(e.latlng);
        },
    });
    return null;
};

const MapView = ({
    center = [28.6139, 77.2090], // Default: New Delhi
    zoom = 13,
    pickup,
    drop,
    driverLocation,
    route,
    onMapClick,
    height = '400px',
    className = '',
}) => {
    return (
        <div style={{ height }} className={`w-full rounded-xl overflow-hidden ${className}`}>
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {onMapClick && <MapClickHandler onMapClick={onMapClick} />}

                {/* Pickup marker */}
                {pickup && (
                    <Marker position={[pickup.lat, pickup.lng]} icon={greenIcon}>
                        <Popup>
                            <div className="text-sm font-medium">📍 Pickup</div>
                            <div className="text-xs text-gray-500">{pickup.address || `${pickup.lat.toFixed(4)}, ${pickup.lng.toFixed(4)}`}</div>
                        </Popup>
                    </Marker>
                )}

                {/* Drop marker */}
                {drop && (
                    <Marker position={[drop.lat, drop.lng]} icon={redIcon}>
                        <Popup>
                            <div className="text-sm font-medium">🏁 Destination</div>
                            <div className="text-xs text-gray-500">{drop.address || `${drop.lat.toFixed(4)}, ${drop.lng.toFixed(4)}`}</div>
                        </Popup>
                    </Marker>
                )}

                {/* Driver marker */}
                {driverLocation && (
                    <Marker position={[driverLocation.lat, driverLocation.lng]} icon={blueIcon}>
                        <Popup>
                            <div className="text-sm font-medium">🚗 Driver</div>
                        </Popup>
                    </Marker>
                )}

                {/* Route polyline */}
                {route && route.length >= 2 && (
                    <Polyline
                        positions={route}
                        color="#f88a0b"
                        weight={4}
                        opacity={0.8}
                        dashArray="8 4"
                    />
                )}

                {/* Draw line between pickup and drop if no route */}
                {!route && pickup && drop && (
                    <Polyline
                        positions={[
                            [pickup.lat, pickup.lng],
                            [drop.lat, drop.lng],
                        ]}
                        color="#f88a0b"
                        weight={3}
                        opacity={0.6}
                        dashArray="6 4"
                    />
                )}
            </MapContainer>
        </div>
    );
};

export default MapView;
