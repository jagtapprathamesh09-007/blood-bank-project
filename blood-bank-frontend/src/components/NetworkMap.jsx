import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Clock, ShieldCheck } from 'lucide-react';

// Custom Marker Icons
const hospitalIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const bloodBankIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Haversine Distance Calculator (in km)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in KM
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1); // Distance in KM
};

const NetworkMap = ({ center = [21.1458, 79.0882], zoom = 12 }) => {
    // Network Nodes
    const nodes = [
        { id: 1, name: "City General Hospital ER", type: "Hospital", lat: 21.1458, lng: 79.0882, status: "Active CODE RED" },
        { id: 2, name: "Central Blood Bank Reserve", type: "BloodBank", lat: 21.1658, lng: 79.1082, status: "O+ Stock Dispatched" }
    ];

    // Trajectory coordinates between Hospital & Blood Bank
    const routeCoordinates = [
        [nodes[0].lat, nodes[0].lng],
        [21.1558, 79.0982], // Mid-way transit waypoint
        [nodes[1].lat, nodes[1].lng]
    ];

    // Dynamic Distance & ETA Calculation
    const distanceKm = calculateDistance(nodes[0].lat, nodes[0].lng, nodes[1].lat, nodes[1].lng);
    const estimatedEtaMins = Math.round((distanceKm / 30) * 60) + 3; // Approx 30km/h emergency speed + 3m buffer

    return (
        <div className="w-full h-80 rounded-2xl overflow-hidden border border-slate-800 shadow-xl relative z-10">
            
            {/* Live Telemetry Distance Badge Overlay */}
            <div className="absolute top-3 right-3 z-[1000] bg-[#151924]/90 backdrop-blur-md border border-slate-800 px-3 py-2 rounded-xl shadow-2xl flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 text-slate-300 font-semibold">
                    <Navigation size={14} className="text-red-500" />
                    <span>Distance: <strong className="text-white">{distanceKm} km</strong></span>
                </div>
                <span className="text-slate-700">|</span>
                <div className="flex items-center gap-1 text-slate-300 font-semibold">
                    <Clock size={14} className="text-amber-400" />
                    <span>ETA: <strong className="text-amber-400 font-bold">{estimatedEtaMins} Mins</strong></span>
                </div>
            </div>

            <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} className="w-full h-full">
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Animated Red Trajectory Route Line */}
                <Polyline 
                    positions={routeCoordinates} 
                    color="#ef4444" 
                    weight={4} 
                    dashArray="8, 8" 
                    opacity={0.85} 
                />

                {/* Render Node Markers */}
                {nodes.map(node => (
                    <Marker 
                        key={node.id} 
                        position={[node.lat, node.lng]} 
                        icon={node.type === 'Hospital' ? hospitalIcon : bloodBankIcon}
                    >
                        <Popup>
                            <div className="p-1 text-slate-900 font-sans">
                                <strong className="text-sm block">{node.name}</strong>
                                <span className="text-xs text-slate-600 block mt-0.5">Type: {node.type}</span>
                                <span className="text-[11px] font-bold text-red-600 block mt-1">{node.status}</span>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default NetworkMap;