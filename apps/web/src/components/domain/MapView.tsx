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
    let icon = <MapPin size={18} color="white" />;
    let colorClass = 'bg-blue-500';
    let glowClass = 'shadow-[0_0_15px_rgba(59,130,246,0.5)]';

    switch (status) {
        case 'SENT':
            icon = <AlertCircle size={18} color="white" />;
            colorClass = 'bg-blue-500';
            glowClass = 'shadow-[0_0_15px_rgba(59,130,246,0.5)]';
            break;
        case 'IN_REVIEW':
            icon = <Clock size={18} color="white" />;
            colorClass = 'bg-indigo-500';
            glowClass = 'shadow-[0_0_15px_rgba(99,102,241,0.5)]';
            break;
        case 'FORWARDED':
            icon = <Folder size={18} color="white" />;
            colorClass = 'bg-amber-500';
            glowClass = 'shadow-[0_0_15px_rgba(245,158,11,0.5)]';
            break;
        case 'RESOLVED':
            icon = <CheckCircle size={18} color="white" />;
            colorClass = 'bg-emerald-500';
            glowClass = 'shadow-[0_0_15px_rgba(16,185,129,0.5)]';
            break;
    }

    const html = renderToStaticMarkup(
        <div className={`
            relative w-10 h-10 flex items-center justify-center 
            rounded-2xl border-2 border-white/20 
            ${colorClass} ${glowClass} transition-all duration-500 hover:scale-110 hover:-translate-y-1 shadow-2xl
        `}>
            {status === 'SENT' && (
                <span className={`absolute -inset-3 rounded-2xl opacity-40 animate-ping ${colorClass}`}></span>
            )}
            {icon}
        </div>
    );

    return divIcon({
        className: 'custom-marker-icon',
        html: html,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
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
    const dateLocale = ptBR;
    const [isDark, setIsDark] = React.useState(document.documentElement.classList.contains('dark'));

    // Detect theme changes
    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    setIsDark(document.documentElement.classList.contains('dark'));
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

    // Filter reports with valid coordinates
    const validReports = useMemo(() =>
        reports.filter(r => r.latitude && r.longitude),
        [reports]);

    const defaultCenter: [number, number] = [-3.71839, -38.5434];

    // Map Style URIs
    const tileUrl = isDark
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

    return (
        <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/5 relative z-0">
            <MapContainer
                center={defaultCenter}
                zoom={13}
                maxZoom={18}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                className={`z-0 transition-colors duration-500 ${isDark ? 'bg-[#020617]' : 'bg-[#f8fafc]'}`}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url={tileUrl}
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
                                <div className={`min-w-[240px] p-4 font-sans backdrop-blur-xl border rounded-2xl shadow-2xl transition-all duration-500 ${isDark
                                    ? 'bg-black/80 border-white/10'
                                    : 'bg-white/90 border-slate-200'
                                    }`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] text-white shadow-lg
                                            ${report.status === 'RESOLVED' ? 'bg-emerald-500 shadow-emerald-500/20' :
                                                report.status === 'FORWARDED' ? 'bg-amber-500 shadow-amber-500/20' :
                                                    report.status === 'IN_REVIEW' ? 'bg-indigo-500 shadow-indigo-500/20' : 'bg-blue-500 shadow-blue-500/20'
                                            }`}
                                        >
                                            {report.status}
                                        </div>
                                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                            {format(new Date(report.createdAt), "HH:mm", { locale: dateLocale })}
                                        </span>
                                    </div>

                                    <p className={`font-bold text-sm mb-4 leading-relaxed tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                        "{report.comment}"
                                    </p>

                                    <div className={`flex items-center gap-3 pt-4 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                                        <div className={`w-10 h-10 rounded-full overflow-hidden ring-2 shadow-xl flex-shrink-0 ${isDark ? 'bg-white/5 ring-indigo-500/20' : 'bg-slate-100 ring-indigo-500/10'}`}>
                                            {report.user.avatarUrl ? (
                                                <img src={report.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-500 bg-white/5 uppercase">
                                                    {report.user.name[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className={`text-xs font-black truncate uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{report.user.name}</span>
                                            <span className="text-[10px] font-bold text-slate-500 truncate uppercase tracking-widest">
                                                {report.user.role || 'Agente'}
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
                    background: transparent;
                    backdrop-filter: blur(12px);
                    border-radius: 1.5rem;
                    box-shadow: none;
                    border: none;
                    padding: 0;
                }
                .glass-popup .leaflet-popup-content {
                    margin: 0;
                }
                .glass-popup .leaflet-popup-tip {
                    background: ${isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)'};
                    box-shadow: none;
                }
                .glass-popup a.leaflet-popup-close-button {
                    color: #64748b;
                    top: 12px;
                    right: 12px;
                    padding: 6px;
                }
                .glass-popup a.leaflet-popup-close-button:hover {
                    color: ${isDark ? '#fff' : '#000'};
                }
                .custom-marker-icon {
                    background: transparent;
                    border: none;
                }
                .leaflet-container {
                    background-color: ${isDark ? '#020617' : '#f8fafc'} !important;
                }
            `}</style>
        </div>
    );
};
