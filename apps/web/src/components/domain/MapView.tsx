import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Report } from '../../types';

// Fix Leaflet Default Icon
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Custom Icons could be added here
const createCustomIcon = (color: string) => new Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const Icons = {
    SENT: createCustomIcon('blue'),
    IN_REVIEW: createCustomIcon('violet'),
    FORWARDED: createCustomIcon('orange'),
    RESOLVED: createCustomIcon('green')
};



interface MapViewProps {
    reports: Report[];
    onMarkerClick?: (report: Report) => void;
}

// Auto-fit bounds
function MapBounds({ markers }: { markers: Report[] }) {
    const map = useMap();

    useEffect(() => {
        if (markers.length > 0) {
            const bounds = markers.map(m => [m.latitude!, m.longitude!] as [number, number]);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [markers, map]);

    return null;
}

export const MapView: React.FC<MapViewProps> = ({ reports, onMarkerClick }) => {
    // Filter reports with valid coordinates
    const validReports = useMemo(() =>
        reports.filter(r => r.latitude && r.longitude),
        [reports]);

    // Default center (Fortaleza/CE)
    const defaultCenter: [number, number] = [-3.71839, -38.5434];

    return (
        <div className="w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/20 relative z-0">
            <MapContainer
                center={defaultCenter}
                zoom={13}
                style={{ height: '100%', width: '100%', borderRadius: '2rem' }}
                zoomControl={false}
                className="z-0"
            >
                {/* Dark Mode Tiles */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {validReports.map(report => (
                    <Marker
                        key={report.id}
                        position={[report.latitude!, report.longitude!]}
                        icon={Icons[report.status as keyof typeof Icons] || Icons.SENT}
                        eventHandlers={{
                            click: () => onMarkerClick?.(report)
                        }}
                    >
                        <Popup className="glass-popup">
                            <div className="min-w-[200px] p-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-2 h-2 rounded-full ${report.status === 'RESOLVED' ? 'bg-green-500' :
                                        report.status === 'FORWARDED' ? 'bg-orange-500' :
                                            report.status === 'IN_REVIEW' ? 'bg-purple-500' : 'bg-blue-500'
                                        }`} />
                                    <span className="text-xs font-bold uppercase text-gray-500">
                                        {report.status}
                                    </span>
                                </div>
                                <p className="font-bold text-gray-800 text-sm mb-2 line-clamp-2">
                                    "{report.comment}"
                                </p>
                                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                                        {report.user.avatarUrl ? (
                                            <img src={report.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-500">
                                                {report.user.name[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-700">{report.user.name}</span>
                                        <span className="text-[9px] text-gray-400">
                                            {format(new Date(report.createdAt), "dd MMM HH:mm", { locale: ptBR })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                <MapBounds markers={validReports} />
            </MapContainer>

            <style>{`
                .glass-popup .leaflet-popup-content-wrapper {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border-radius: 1.5rem;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }
                .glass-popup .leaflet-popup-tip {
                    background: rgba(255, 255, 255, 0.95);
                }
            `}</style>
        </div>
    );
};
