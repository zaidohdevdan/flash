import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L, { divIcon } from 'leaflet';
import 'leaflet.heat';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { renderToStaticMarkup } from 'react-dom/server';
import { AlertCircle, Clock, CheckCircle, Folder, MapPin, Layers, Target, Maximize2, Activity, Zap } from 'lucide-react';
import type { Report } from '../../types';

interface MapViewProps {
    reports: Report[];
    onMarkerClick?: (report: Report) => void;
}

interface TacticalIconOptions extends L.DivIconOptions {
    status?: string;
}

const createCustomMarker = (status: string) => {
    let icon = <MapPin size={18} color="white" />;
    let colorClass = 'bg-blue-500';
    let glowClass = 'shadow-[0_0_15px_rgba(59,130,246,0.5)]';

    switch (status) {
        case 'SENT':
            icon = <AlertCircle size={18} color="white" />;
            colorClass = 'bg-rose-500';
            glowClass = 'shadow-[0_0_20px_rgba(244,63,94,0.6)]';
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
            relative w-12 h-12 flex items-center justify-center 
            rounded-2xl border-2 border-white/30 backdrop-blur-md
            ${colorClass} ${glowClass} transition-all duration-700 hover:scale-125 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] shadow-2xl z-50
        `}>
            {status === 'SENT' && (
                <div className="absolute -inset-4">
                    <div className="absolute inset-0 bg-rose-500/40 rounded-3xl animate-[ping_1.5s_infinite]" />
                    <div className="absolute inset-2 bg-rose-500/20 rounded-2xl animate-[ping_2s_infinite]" />
                </div>
            )}
            <div className="relative z-10 flex items-center justify-center">
                {icon}
            </div>
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
        </div>
    );

    return divIcon({
        className: 'custom-marker-icon',
        html: html,
        iconSize: [48, 48],
        iconAnchor: [24, 48],
        popupAnchor: [0, -48],
        status
    } as TacticalIconOptions);
};

interface LeafletCluster {
    getAllChildMarkers: () => Array<{
        options: {
            icon: { options: { status?: string } }
        }
    }>;
}

const createTacticalCluster = (cluster: LeafletCluster, isDark: boolean) => {
    const markers = cluster.getAllChildMarkers();
    const count = markers.length;

    // Count status distribution
    const stats = markers.reduce((acc: Record<string, number>, m) => {
        const s = m.options.icon.options.status || 'OTHER';
        acc[s] = (acc[s] || 0) + 1;
        return acc;
    }, {});

    const html = renderToStaticMarkup(
        <div className="relative w-14 h-14 flex items-center justify-center group">
            {/* Outer Ring */}
            <div className={`
                absolute inset-0 rounded-full backdrop-blur-xl border shadow-2xl group-hover:scale-125 hover:shadow-indigo-500/20 transition-all duration-700
                ${isDark ? 'bg-slate-900/60 border-white/30' : 'bg-white/90 border-slate-300'}
            `} />

            {/* Animated Pulses based on count */}
            <div className={`absolute -inset-2 rounded-full border border-indigo-500/20 ${count > 10 ? 'animate-pulse' : ''}`} />

            {/* Multi-layered content */}
            <div className="relative z-10 flex flex-col items-center justify-center gap-0.5">
                <span className={`text-sm font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>{count}</span>

                {/* Status Bar Micro-Representation */}
                <div className={`flex gap-0.5 h-1 w-8 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
                    {stats.SENT > 0 && <div className="bg-rose-500" style={{ flex: stats.SENT }} />}
                    {stats.IN_REVIEW > 0 && <div className="bg-indigo-500" style={{ flex: stats.IN_REVIEW }} />}
                    {stats.FORWARDED > 0 && <div className="bg-amber-500" style={{ flex: stats.FORWARDED }} />}
                    {stats.RESOLVED > 0 && <div className="bg-emerald-500" style={{ flex: stats.RESOLVED }} />}
                </div>
            </div>

            {/* Tactical Corners */}
            <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l ${isDark ? 'border-white/40' : 'border-slate-400/40'}`} />
            <div className={`absolute top-0 right-0 w-2 h-2 border-t border-r ${isDark ? 'border-white/40' : 'border-slate-400/40'}`} />
            <div className={`absolute bottom-0 left-0 w-2 h-2 border-b border-l ${isDark ? 'border-white/40' : 'border-slate-400/40'}`} />
            <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r ${isDark ? 'border-white/40' : 'border-slate-400/40'}`} />
        </div>
    );

    return divIcon({
        html,
        className: 'tactical-cluster',
        iconSize: [56, 56],
        iconAnchor: [28, 28]
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

function MapResizer({ trigger }: { trigger?: number }) {
    const map = useMap();

    useEffect(() => {
        // Invalidate on mount (catches initial render)
        const t = setTimeout(() => map.invalidateSize(), 50);
        return () => clearTimeout(t);
    }, [map, trigger]);

    return null;
}

function HeatMapLayer({ points, intensity = 0.5 }: { points: [number, number, number][], intensity?: number }) {
    const map = useMap();

    useEffect(() => {
        if (!map || !points.length) return;

        const heatLayer = L.heatLayer(points, {
            radius: 25,
            blur: 15,
            maxZoom: 17,
            max: intensity,
            gradient: {
                0.2: '#6366f1', // Indigo
                0.4: '#8b5cf6', // Violet
                0.6: '#ec4899', // Pink
                0.8: '#f43f5e', // Rose
                1.0: '#e11d48'  // Rose 600
            }
        }).addTo(map);

        return () => {
            map.removeLayer(heatLayer);
        };
    }, [map, points, intensity]);

    return null;
}

export const MapView: React.FC<MapViewProps> = ({ reports, onMarkerClick }) => {
    const dateLocale = ptBR;
    const [isDark, setIsDark] = React.useState(document.documentElement.classList.contains('dark'));
    const [layer, setLayer] = React.useState<'tactical' | 'satellite' | 'voyager'>('tactical');
    const [isHeatmapVisible, setIsHeatmapVisible] = React.useState(false);
    const [resizeTrigger] = React.useState(0);

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

    const stats = useMemo(() => {
        return {
            total: validReports.length,
            critical: validReports.filter(r => r.status === 'SENT').length,
            active: validReports.filter(r => r.status === 'IN_REVIEW').length,
            resolved: validReports.filter(r => r.status === 'RESOLVED').length
        };
    }, [validReports]);

    const heatPoints = useMemo(() => 
        validReports.map(r => [r.latitude!, r.longitude!, 1] as [number, number, number]),
    [validReports]);

    const defaultCenter: [number, number] = [-3.71839, -38.5434];

    // Tactical Focus Logic
    const handleFocusCritical = () => {
        const criticalReport = validReports.find(r => r.status === 'SENT');
        if (criticalReport && criticalReport.latitude && criticalReport.longitude) {
            onMarkerClick?.(criticalReport);
            // The MapBounds component or a direct map interaction will handle the zoom
        }
    };

    // Map Style URIs
    const getTileUrl = () => {
        if (layer === 'satellite') return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
        if (layer === 'voyager') return "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
        return isDark
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    };

    return (
        <div className="w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative z-0 group/map">
            {/* Tactical Vignette Overlay */}
            <div className="absolute inset-0 pointer-events-none z-10 bg-[radial-gradient(circle,transparent_50%,rgba(0,0,0,0.2)_100%)] dark:bg-[radial-gradient(circle,transparent_50%,rgba(0,0,0,0.4)_100%)] mix-blend-multiply opacity-50" />

            <MapContainer
                center={defaultCenter}
                zoom={13}
                maxZoom={18}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                className={`z-0 transition-colors duration-500 ${isDark ? 'bg-[#020617]' : 'bg-[#f8fafc]'}`}
            >
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url={getTileUrl()}
                    maxZoom={18}
                />

                {isHeatmapVisible && (
                    <HeatMapLayer points={heatPoints} />
                )}

                <MarkerClusterGroup
                    chunkedLoading
                    spiderfyOnMaxZoom={true}
                    spiderfyDistanceMultiplier={2}
                    showCoverageOnHover={false}
                    maxClusterRadius={60}
                    iconCreateFunction={(cluster: LeafletCluster) => createTacticalCluster(cluster, isDark)}
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
                <MapResizer trigger={resizeTrigger} />
            </MapContainer>

            {/* Tactical HUD Left */}
            <div className="absolute top-8 left-8 z-[1000] flex flex-col gap-4 pointer-events-none">
                <div className="bg-white/90 dark:bg-black/70 backdrop-blur-2xl border-2 border-slate-200 dark:border-white/20 rounded-[2rem] p-6 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] flex flex-col gap-5 pointer-events-auto min-w-[220px] animate-in slide-in-from-left-8 duration-700">
                    <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-4 h-4 text-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-500 dark:text-white/40 uppercase tracking-[0.2em]">Live Tactical HUD</span>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Alertas Críticos</span>
                            </div>
                            <span className="text-xs font-black text-rose-500">{stats.critical}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Em Análise</span>
                            </div>
                            <span className="text-xs font-black text-indigo-500 dark:text-indigo-400">{stats.active}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Resolvidos</span>
                            </div>
                            <span className="text-xs font-black text-emerald-500 dark:text-emerald-400">{stats.resolved}</span>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-white/5 my-1" />

                    <div className="flex flex-col gap-2 pointer-events-auto">
                        <button
                            onClick={handleFocusCritical}
                            disabled={stats.critical === 0}
                            className={`flex items-center justify-between w-full p-2.5 rounded-xl border transition-all
                                ${stats.critical > 0
                                    ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border-rose-500/20 shadow-sm shadow-rose-500/10'
                                    : 'opacity-50 grayscale cursor-not-allowed text-slate-400 dark:text-slate-500 border-slate-100 dark:border-white/5'}`}
                        >
                            <div className="flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Focar Críticos</span>
                            </div>
                            {stats.critical > 0 && <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
                        </button>

                        <div className="flex items-center justify-between group cursor-pointer px-1 pt-1">
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-indigo-500 dark:text-indigo-400 group-hover:rotate-90 transition-transform duration-500" />
                                <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">Total Monitorado</span>
                            </div>
                            <span className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">{stats.total}</span>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-white/5 my-1" />

                    <button
                        onClick={() => setIsHeatmapVisible(!isHeatmapVisible)}
                        className={`flex items-center justify-between w-full p-3 rounded-2xl border transition-all duration-500 relative overflow-hidden group/btn
                            ${isHeatmapVisible 
                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' 
                                : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-indigo-500/50'}`}
                    >
                        <div className="flex items-center gap-2 relative z-10">
                            <Layers className={`w-4 h-4 transition-transform duration-500 ${isHeatmapVisible ? 'rotate-180' : ''}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Mapa de Calor</span>
                        </div>
                        <div className="relative z-10">
                            <div className={`w-2 h-2 rounded-full ${isHeatmapVisible ? 'bg-white animate-pulse' : 'bg-slate-300 dark:bg-white/20'}`} />
                        </div>
                        {isHeatmapVisible && (
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-100" />
                        )}
                    </button>
                </div>

                {/* Layer Control */}
                <div className="bg-white/90 dark:bg-black/70 backdrop-blur-2xl border-2 border-slate-200 dark:border-white/20 rounded-2xl p-2 shadow-2xl flex items-center gap-1.5 pointer-events-auto w-fit">
                    {(['tactical', 'satellite', 'voyager'] as const).map(id => {
                        const config = {
                            tactical: { icon: Zap, label: 'Tático' },
                            satellite: { icon: Layers, label: 'Satélite' },
                            voyager: { icon: Maximize2, label: 'Standard' }
                        }[id];
                        const Icon = config.icon;

                        return (
                            <button
                                key={id}
                                onClick={() => setLayer(id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${layer === id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'}`}
                            >
                                <Icon size={14} />
                                <span className="text-[9px] font-black uppercase tracking-widest">{config.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tactical Status Floating */}
            <div className="absolute top-8 right-8 z-[1000] flex gap-3">
                <div className="bg-white/90 dark:bg-black/70 backdrop-blur-2xl border-2 border-slate-200 dark:border-white/20 rounded-2xl px-5 py-3 shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex items-center gap-4">
                    <div className="flex -space-x-2">
                        {validReports.slice(0, 3).map((r, i) => (
                            <div key={r.id} className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[8px] font-black overflow-hidden shadow-lg ${isDark ? 'border-slate-900 bg-indigo-500' : 'border-white bg-indigo-400'}`} style={{ zIndex: 10 - i }}>
                                {r.user?.avatarUrl ? <img src={r.user.avatarUrl} alt={r.user.name} className="w-full h-full object-cover" /> : r.user.name[0]}
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Network Online</span>
                        <div className="flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[8px] font-bold text-slate-500 dark:text-white/40 uppercase">Active Nodes Monitoring</span>
                        </div>
                    </div>
                </div>
            </div>

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
                .tactical-cluster {
                    background: transparent;
                    border: none;
                }
                .leaflet-container {
                    background-color: ${isDark ? '#020617' : '#f8fafc'} !important;
                }
                /* Hide Leaflet Branding */
                .leaflet-control-attribution {
                    font-size: 8px !important;
                    background: transparent !important;
                    color: rgba(255,255,255,0.2) !important;
                }
                .leaflet-control-attribution a {
                    color: rgba(255,255,255,0.4) !important;
                }
            `}</style>
        </div>
    );
};
