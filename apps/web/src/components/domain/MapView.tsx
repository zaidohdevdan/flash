import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { renderToStaticMarkup } from 'react-dom/server';
import { AlertCircle, Clock, CheckCircle, Folder, MapPin } from 'lucide-react';
import type { Report } from '../../types';

interface MapViewProps {
    reports: Report[];
    onMarkerClick?: (report: Report) => void;
}

// Custom Marker Generator
const createCustomMarker = (status: string) => {
    let icon = <MapPin size={20} color="white" />;
    let colorClass = 'bg-blue-500';

    switch (status) {
        case 'SENT':
            icon = <AlertCircle size={20} color="white" />;
            colorClass = 'bg-blue-500';
            break;
        case 'IN_REVIEW':
            icon = <Clock size={20} color="white" />;
            colorClass = 'bg-purple-500';
            break;
        case 'FORWARDED':
            icon = <Folder size={20} color="white" />;
            colorClass = 'bg-orange-500';
            break;
        case 'RESOLVED':
            icon = <CheckCircle size={20} color="white" />;
            colorClass = 'bg-emerald-500';
            break;
    }

    const html = renderToStaticMarkup(
        <div className={`
            relative w-10 h-10 flex items-center justify-center 
            rounded-full shadow-lg border-2 border-white 
            ${colorClass} transition-transform hover:scale-110
        `}>
            {status === 'SENT' && (
                <span className={`absolute -inset-2 rounded-full opacity-50 animate-ping ${colorClass}`}></span>
            )}
            {icon}
        </div>
    );

    return divIcon({
        className: 'custom-marker-icon', // Remove default leaflet styles
        html: html,
        iconSize: [40, 40],
        iconAnchor: [20, 40], // Center bottom
        popupAnchor: [0, -40]
    });
};

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

    const defaultCenter: [number, number] = [-3.71839, -38.5434];

    return (
        <div className="w-full h-full rounded-2xl overflow-hidden shadow-sm border border-[var(--border-subtle)] relative z-0">
            <MapContainer
                center={defaultCenter}
                zoom={13}
                maxZoom={18}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                className="z-0 bg-[var(--bg-secondary)]"
            >
                {/* Light Mode Tiles - Voyager (Clean & Modern) */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    maxZoom={18}
                />

                <MarkerClusterGroup
                    chunkedLoading
                    spiderfyOnMaxZoom={true}
                    spiderfyDistanceMultiplier={2}
                    showCoverageOnHover={false}
                    maxClusterRadius={60}
                >
                    {validReports.map(report => (
                        <Marker
                            key={report.id}
                            position={[report.latitude!, report.longitude!]}
                            icon={createCustomMarker(report.status)}
                            eventHandlers={{
                                click: () => onMarkerClick?.(report)
                            }}
                        >
                            <Popup className="glass-popup">
                                <div className="min-w-[220px] p-2 font-sans">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide text-white
                                            ${report.status === 'RESOLVED' ? 'bg-emerald-500' :
                                                report.status === 'FORWARDED' ? 'bg-orange-500' :
                                                    report.status === 'IN_REVIEW' ? 'bg-purple-500' : 'bg-blue-500'
                                            }`}
                                        >
                                            {report.status}
                                        </div>
                                        <span className="text-[10px] font-medium text-gray-400">
                                            {format(new Date(report.createdAt), "HH:mm", { locale: ptBR })}
                                        </span>
                                    </div>

                                    <p className="font-semibold text-gray-800 text-sm mb-3 leading-snug">
                                        "{report.comment}"
                                    </p>

                                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden ring-2 ring-white shadow-sm flex-shrink-0">
                                            {report.user.avatarUrl ? (
                                                <img src={report.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-400 bg-gray-100">
                                                    {report.user.name[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-xs font-bold text-gray-900 truncate">{report.user.name}</span>
                                            <span className="text-[10px] text-gray-500 truncate">
                                                {report.user.role || 'Profissional'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MarkerClusterGroup>

                <MapBounds markers={validReports} />
            </MapContainer>

            <style>{`
                .glass-popup .leaflet-popup-content-wrapper {
                    background: rgba(255, 255, 255, 0.98);
                    backdrop-filter: blur(12px);
                    border-radius: 1rem;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
                    border: 1px solid rgba(0,0,0,0.05);
                    padding: 0;
                }
                .glass-popup .leaflet-popup-content {
                    margin: 0;
                }
                .glass-popup .leaflet-popup-tip {
                    background: rgba(255, 255, 255, 0.98);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                }
                .glass-popup a.leaflet-popup-close-button {
                    color: #9ca3af;
                    top: 8px;
                    right: 8px;
                    padding: 4px;
                }
                .glass-popup a.leaflet-popup-close-button:hover {
                    color: #4b5563;
                }
                .custom-marker-icon {
                    background: transparent;
                    border: none;
                }
            `}</style>
        </div>
    );
};
