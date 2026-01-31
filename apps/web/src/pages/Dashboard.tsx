import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { LogOut, CheckCircle, Clock, AlertCircle, MessageSquare, Users, User, Send, Archive, History, X, Folder, Plus } from 'lucide-react';
import { ChatWidget } from '../components/ChatWidget';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface ReportHistory {
    id: string;
    status: string;
    comment: string;
    userName: string;
    departmentName?: string;
    createdAt: string;
}

interface Subordinate {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string;
    statusPhrase?: string;
    isOnline?: boolean;
}

interface Stats {
    status: string;
    _count: number;
}

interface Report {
    id: string;
    imageUrl: string;
    comment: string;
    feedback?: string;
    status: 'SENT' | 'IN_REVIEW' | 'FORWARDED' | 'RESOLVED' | 'ARCHIVED';
    history: ReportHistory[];
    department?: { name: string };
    createdAt: string;
    user: {
        name: string;
        avatarUrl?: string;
        statusPhrase?: string;
    };
}

interface Department {
    id: string;
    name: string;
}

export function Dashboard() {
    const { user, signOut, updateUser } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [stats, setStats] = useState<Stats[]>([]);
    const [subordinates, setSubordinates] = useState<Subordinate[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);

    // Modals
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [analyzingReport, setAnalyzingReport] = useState<Report | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [targetStatus, setTargetStatus] = useState<'IN_REVIEW' | 'FORWARDED' | 'RESOLVED'>('IN_REVIEW');

    // Profile Form
    const [profilePhrase, setProfilePhrase] = useState(user?.statusPhrase || '');
    const [profileAvatar, setProfileAvatar] = useState<File | null>(null);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    // Chat
    const [chatTarget, setChatTarget] = useState<Subordinate | null>(null);
    const [unreadMessages, setUnreadMessages] = useState<Record<string, boolean>>({});

    const playNotificationSound = () => {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.error('Erro ao tocar som:', e));
    };

    // Form for Forwarding/Review
    const [formFeedback, setFormFeedback] = useState('');
    const [selectedDeptId, setSelectedDeptId] = useState('');
    const [newDeptName, setNewDeptName] = useState('');

    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>('SENT'); const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 6;

    useEffect(() => {
        loadReports(1, true, statusFilter);
        loadStats();
        loadSubordinates();
        loadDepartments();

        const socket = io(SOCKET_URL, {
            query: { userId: user?.id, role: user?.role, userName: user?.name }
        });

        socket.on('new_report_to_review', (data: { data: Report }) => {
            if (!statusFilter || statusFilter === 'SENT') {
                setReports(prev => [data.data, ...prev]);
            }
            loadStats();
        });

        socket.on('initial_presence_list', (ids: string[]) => {
            setSubordinates(prev => prev.map(s => ({ ...s, isOnline: ids.includes(s.id) })));
        });

        socket.on('user_presence_changed', (data: { userId: string, status: 'online' | 'offline' }) => {
            setSubordinates(prev => prev.map(s => s.id === data.userId ? { ...s, isOnline: data.status === 'online' } : s));
        });

        socket.on('report_status_updated_for_supervisor', (data: Report) => {
            setReports(prev => {
                if (statusFilter && statusFilter !== data.status) return prev.filter(r => r.id !== data.id);
                const exists = prev.find(r => r.id === data.id);
                if (exists) return prev.map(r => r.id === data.id ? data : r);
                if (statusFilter === data.status || !statusFilter) return [data, ...prev];
                return prev;
            });
            setSelectedReport(current => current?.id === data.id ? data : current);
            loadStats();
        });

        socket.on('new_chat_notification', (data: { from: string, fromName?: string, text: string }) => {
            if (chatTarget?.id !== data.from) {
                setUnreadMessages(prev => ({ ...prev, [data.from]: true }));
                playNotificationSound();
                toast(`Mensagem de ${data.fromName || 'Subordinado'}: ${data.text}`, {
                    icon: '💬',
                    duration: 4000
                });
            }
        });

        return () => { socket.disconnect(); };
    }, [user, statusFilter, startDate, endDate]);

    async function loadReports(pageNum: number, reset: boolean = false, status?: string) {
        try {
            let url = `/reports?page=${pageNum}&limit=${LIMIT}`;
            if (status) url += `&status=${status}`;
            if (startDate) url += `&startDate=${new Date(startDate).toISOString()}`;
            if (endDate) url += `&endDate=${new Date(endDate).toISOString()}`;

            const response = await api.get(url);
            setHasMore(response.data.length === LIMIT);
            setReports(prev => reset ? response.data : [...prev, ...response.data]);
        } catch (error) { console.error('Erro ao buscar relatórios'); }
    }

    async function loadStats() {
        try {
            const response = await api.get('/reports/stats');
            setStats(response.data);
        } catch (error) { console.error('Erro ao buscar estatísticas'); }
    }

    async function loadSubordinates() {
        try {
            const response = await api.get('/subordinates');
            setSubordinates(response.data);
        } catch (error) { console.error('Erro ao buscar subordinados'); }
    }

    async function loadDepartments() {
        try {
            const response = await api.get('/departments');
            setDepartments(response.data);
        } catch (error) { console.error('Erro ao buscar departamentos'); }
    }

    async function handleProcessAnalysis() {
        if (!analyzingReport) return;

        const status = targetStatus;
        let deptId = selectedDeptId;

        try {
            // Se houver nome para novo departamento, cria primeiro
            if (status === 'FORWARDED' && newDeptName.trim()) {
                const deptRes = await api.post('/departments', { name: newDeptName });
                deptId = deptRes.data.id;
                loadDepartments();
            }

            const response = await api.patch(`/reports/${analyzingReport.id}/status`, {
                status,
                feedback: formFeedback,
                departmentId: status === 'FORWARDED' ? deptId : undefined
            });

            const updatedReport = response.data;
            setReports(prev => {
                if (statusFilter && statusFilter !== status) return prev.filter(r => r.id !== analyzingReport.id);
                return prev.map(r => r.id === analyzingReport.id ? updatedReport : r);
            });

            setAnalyzingReport(null);
            resetAnalysisForm();
            loadStats();
        } catch (error) {
            alert('Erro ao processar análise');
        }
    }

    async function handleUpdateStatus(id: string, status: string) {
        if (status === 'IN_REVIEW' || status === 'FORWARDED') {
            const report = reports.find(r => r.id === id);
            if (report) {
                setAnalyzingReport(report);
                setTargetStatus(status as any);
                return;
            }
        }

        const feedback = window.prompt(`Adicione um comentário para (${status}):`);
        if (feedback === null) return;

        try {
            const response = await api.patch(`/reports/${id}/status`, { status, feedback });
            const updatedReport = response.data;
            setReports(prev => {
                if (statusFilter && statusFilter !== status) return prev.filter(r => r.id !== id);
                return prev.map(r => r.id === id ? updatedReport : r);
            });
            loadStats();
        } catch (error) { alert('Erro ao atualizar status'); }
    }

    async function handleUpdateProfile() {
        setIsUpdatingProfile(true);
        const formData = new FormData();
        formData.append('statusPhrase', profilePhrase);
        if (profileAvatar) {
            formData.append('avatar', profileAvatar);
        }

        try {
            const response = await api.patch('/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            updateUser(response.data);
            setIsProfileOpen(false);
            setProfileAvatar(null);
        } catch (error) {
            alert('Erro ao atualizar perfil');
        } finally {
            setIsUpdatingProfile(false);
        }
    }

    function handleLoadMore() {
        const nextPage = page + 1;
        setPage(nextPage);
        loadReports(nextPage, false, statusFilter);
    }

    function resetAnalysisForm() {
        setFormFeedback('');
        setSelectedDeptId('');
        setNewDeptName('');
        setTargetStatus('IN_REVIEW');
    }


    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'RESOLVED': return <CheckCircle className="text-green-500 w-5 h-5" />;
            case 'IN_REVIEW': return <Clock className="text-blue-500 w-5 h-5" />;
            case 'FORWARDED': return <Send className="text-purple-500 w-5 h-5" />;
            case 'ARCHIVED': return <Archive className="text-gray-400 w-5 h-5" />;
            default: return <AlertCircle className="text-yellow-500 w-5 h-5" />;
        }
    };


    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
                            <Send className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-gray-800 tracking-tighter">FLASH <span className="text-blue-600">DASH</span></h1>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">Supervisor: {user?.name}</p>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-3 bg-gray-50 p-1.5 rounded-2xl border">
                        <div className="flex items-center gap-2 px-3 border-r">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="bg-transparent text-[10px] font-bold outline-none text-gray-600"
                            />
                        </div>
                        <div className="flex items-center gap-2 px-3">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="bg-transparent text-[10px] font-bold outline-none text-gray-600"
                            />
                        </div>
                        {(startDate || endDate) && (
                            <button
                                onClick={() => { setStartDate(''); setEndDate(''); }}
                                className="p-1 hover:bg-white rounded-lg transition text-gray-400 hover:text-red-500"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsProfileOpen(true)}
                            className="flex items-center gap-3 p-1 pr-4 bg-gray-50 hover:bg-gray-100 rounded-full border transition"
                        >
                            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm bg-blue-100 flex items-center justify-center">
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-4 h-4 text-blue-600" />
                                )}
                            </div>
                            <span className="text-[10px] font-black text-gray-700 uppercase tracking-tight">Meu Perfil</span>
                        </button>
                        <button onClick={signOut} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Dashboard Hero / Metrics (Top of the T) */}
            <div className="bg-gradient-to-br from-blue-700 to-blue-900 border-b border-white/10 pb-20 pt-10">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tight">Painel de Controle</h2>
                            <p className="text-blue-200 text-sm font-medium mt-1">Visão geral do trâmite operacional da sua equipe.</p>
                        </div>
                        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-lg p-1.5 rounded-2xl border border-white/10">
                            {[
                                { id: '', label: 'Status' },
                                { id: 'SENT', label: 'Recebidos' },
                                { id: 'IN_REVIEW', label: 'Análise' },
                                { id: 'FORWARDED', label: 'Depto.' },
                                { id: 'RESOLVED', label: 'Feitos' },
                            ].map(filter => (
                                <button
                                    key={filter.id}
                                    onClick={() => { setStatusFilter(filter.id); setPage(1); }}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === filter.id
                                        ? 'bg-white text-blue-900 shadow-xl'
                                        : 'text-white/60 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* KPI Cards (Glassmorphism) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Recebidos', status: 'SENT', icon: AlertCircle, color: 'text-yellow-400' },
                            { label: 'Em Análise', status: 'IN_REVIEW', icon: Clock, color: 'text-blue-400' },
                            { label: 'No Depto.', status: 'FORWARDED', icon: Send, color: 'text-purple-400' },
                            { label: 'Resolvidos', status: 'RESOLVED', icon: CheckCircle, color: 'text-green-400' },
                        ].map(kpi => {
                            const count = stats.find(s => s.status === kpi.status)?._count || 0;
                            return (
                                <div key={kpi.label} className="bg-white/10 backdrop-blur-2xl border border-white/20 p-5 rounded-3xl group hover:bg-white/20 transition-all cursor-default">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-2.5 rounded-2xl bg-white/10 ${kpi.color}`}>
                                            <kpi.icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Tempo Médio: 2h</span>
                                    </div>
                                    <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">{kpi.label}</p>
                                    <h4 className="text-3xl font-black text-white">{count}</h4>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content (Stem of the T) */}
            <main className="max-w-4xl mx-auto px-6 -mt-10 pb-20 relative z-10 flex flex-col lg:flex-row gap-10">
                {/* Center Feed */}
                <div className="flex-1 space-y-8">



                    {reports.length === 0 ? (
                        <div className="bg-white p-12 rounded-lg text-center border-2 border-dashed border-gray-200">
                            <p className="text-gray-500">Nenhum relatório pendente.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {reports.map(report => (
                                    <div key={report.id} className="bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col">


                                        <img
                                            src={report.imageUrl}
                                            alt="Relatado"
                                            className="w-full h-48 object-cover bg-gray-100"
                                        />
                                        <div className="p-4 flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                    {new Date(report.createdAt).toLocaleString()}
                                                </span>
                                                {getStatusIcon(report.status)}
                                            </div>
                                            <p className="text-sm text-gray-700 mb-4 h-12 line-clamp-2">{report.comment}</p>

                                            {report.feedback && (
                                                <div className="bg-blue-50 border-l-4 border-blue-400 p-2 mb-4">
                                                    <p className="text-[10px] font-bold text-blue-800 uppercase flex items-center gap-1">
                                                        <MessageSquare className="w-3 h-3" /> Feedback:
                                                    </p>
                                                    <p className="text-xs text-blue-700 italic mt-1">{report.feedback}</p>
                                                </div>
                                            )}

                                            <div className="flex flex-col gap-1 text-gray-500 mb-4">
                                                <div className="flex items-center gap-2 text-sm">
                                                    {report.user?.avatarUrl ? (
                                                        <img src={report.user.avatarUrl} alt="" className="w-8 h-8 flex-shrink-0 rounded-full object-cover border-2 border-white shadow-sm" />
                                                    ) : (
                                                        <div className="w-8 h-8 flex-shrink-0 bg-gray-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                                            <User className="w-4 h-4 text-gray-400" />
                                                        </div>
                                                    )}
                                                    Por: <span className="font-medium text-gray-800">{report.user?.name || 'Sistema'}</span>
                                                </div>
                                                {report.user?.statusPhrase && (
                                                    <p className="text-[10px] text-gray-400 italic leading-tight pl-7">
                                                        "{report.user.statusPhrase}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-4 bg-gray-50 border-t flex flex-wrap gap-2">
                                            {report.status === 'FORWARDED' ? (
                                                <button
                                                    onClick={() => { setAnalyzingReport(report); setTargetStatus('FORWARDED'); }}
                                                    className="w-full bg-blue-600 text-white py-2.5 text-[10px] font-black rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                                                >
                                                    <Folder className="w-4 h-4" /> TRÂMITE {report.department?.name.toUpperCase()}
                                                </button>
                                            ) : (
                                                <>
                                                    {report.status !== 'RESOLVED' && report.status !== 'ARCHIVED' && (
                                                        <>
                                                            {report.status !== 'IN_REVIEW' && (
                                                                <button onClick={() => handleUpdateStatus(report.id, 'IN_REVIEW')} className="flex-1 min-w-[100px] bg-white border py-2 text-[10px] font-bold rounded-lg hover:bg-gray-100 transition uppercase">Analisar</button>
                                                            )}
                                                            <button onClick={() => handleUpdateStatus(report.id, 'RESOLVED')} className="flex-1 min-w-[100px] bg-green-600 text-white py-2 text-[10px] font-bold rounded-lg hover:bg-green-700 transition">RESOLVER</button>
                                                        </>
                                                    )}
                                                    {report.status === 'RESOLVED' && (
                                                        <button onClick={() => handleUpdateStatus(report.id, 'ARCHIVED')} className="flex-1 bg-gray-200 text-gray-600 py-2 text-[10px] font-bold rounded-lg hover:bg-gray-300 transition">ARQUIVAR</button>
                                                    )}
                                                </>
                                            )}

                                            <button
                                                onClick={() => setSelectedReport(report)}
                                                className="w-full mt-1 flex items-center justify-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-widest py-1 hover:text-blue-600 transition"
                                            >
                                                <History className="w-3 h-3" /> Ver Linha do Tempo
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {hasMore && reports.length > 0 && (
                                <div className="mt-12 flex justify-center pb-10">
                                    <button
                                        onClick={handleLoadMore}
                                        className="bg-white border-2 border-blue-100 text-blue-600 px-10 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition shadow-xl shadow-blue-100/50 hover:-translate-y-1"
                                    >
                                        CARREGAR MAIS CONTEÚDO
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
                {/* Right Side: Team Sidebar */}
                <aside className="w-full lg:w-80 space-y-6">
                    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl shadow-blue-900/5 border border-white sticky top-24">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
                            <div className="bg-blue-50 p-2 rounded-xl">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-xs font-black text-gray-800 uppercase tracking-widest">Minha Equipe</h2>
                        </div>

                        {subordinates.length === 0 ? (
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider text-center py-10">Nenhum colega conectado</p>
                        ) : (
                            <div className="space-y-6">
                                {subordinates.map(sub => (
                                    <div key={sub.id} className="group flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50 flex items-center justify-center group-hover:bg-white transition-all">
                                                    {sub.avatarUrl ? (
                                                        <img src={sub.avatarUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="w-6 h-6 text-gray-300" />
                                                    )}
                                                </div>
                                                <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 border-[3px] border-white rounded-full ${sub.isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-300'}`} />
                                                {unreadMessages[sub.id] && (
                                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-ping" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-gray-800">{sub.name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter opacity-70">{sub.role}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setChatTarget(sub);
                                                setUnreadMessages(prev => ({ ...prev, [sub.id]: false }));
                                            }}
                                            className="p-2.5 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-lg shadow-blue-100 border border-blue-50"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </aside>
            </main>

            {/* Analysis & Forwarding Modal */}
            {analyzingReport && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in zoom-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                {analyzingReport.status === 'FORWARDED' ? <Folder className="text-purple-600 w-5 h-5" /> : <AlertCircle className="text-blue-600 w-5 h-5" />}
                                <h3 className="font-black text-gray-800 uppercase tracking-widest">
                                    {analyzingReport.status === 'FORWARDED' ? `Resposta do Depto: ${analyzingReport.department?.name}` : 'Análise de Processo'}
                                </h3>
                            </div>
                            <button onClick={() => { setAnalyzingReport(null); resetAnalysisForm(); }} className="p-2 hover:bg-gray-100 rounded-full transition"><X className="w-5 h-5 text-gray-400" /></button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Parecer Técnico / Feedback</label>
                                <textarea
                                    value={formFeedback}
                                    onChange={e => setFormFeedback(e.target.value)}
                                    placeholder="Descreva as providências ou análise do caso..."
                                    className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-2xl resize-none outline-none focus:bg-white focus:border-blue-500 transition-all text-sm font-medium"
                                />
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="flex items-center justify-between p-1 bg-gray-100 rounded-xl">
                                    <button
                                        onClick={() => setTargetStatus('IN_REVIEW')}
                                        className={`flex-1 py-2 text-[10px] font-black tracking-widest rounded-lg transition-all ${targetStatus === 'IN_REVIEW' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
                                    >
                                        ANÁLISE
                                    </button>
                                    <button
                                        onClick={() => setTargetStatus('FORWARDED')}
                                        className={`flex-1 py-2 text-[10px] font-black tracking-widest rounded-lg transition-all ${targetStatus === 'FORWARDED' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500'}`}
                                    >
                                        DEPARTAMENTO
                                    </button>
                                    <button
                                        onClick={() => setTargetStatus('RESOLVED')}
                                        className={`flex-1 py-2 text-[10px] font-black tracking-widest rounded-lg transition-all ${targetStatus === 'RESOLVED' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500'}`}
                                    >
                                        RESOLVIDO
                                    </button>
                                </div>

                                {targetStatus === 'FORWARDED' && (
                                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Selecionar Departamento</label>
                                            <select
                                                value={selectedDeptId}
                                                onChange={e => setSelectedDeptId(e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-purple-500 transition-all font-bold text-gray-700 appearance-none"
                                            >
                                                <option value="">-- Escolha um destino --</option>
                                                {departments.map(d => (
                                                    <option key={d.id} value={d.id}>{d.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="h-px bg-gray-100 flex-1"></div>
                                            <span className="text-[8px] font-black text-gray-300 uppercase">Ou criar novo</span>
                                            <div className="h-px bg-gray-100 flex-1"></div>
                                        </div>

                                        <input
                                            type="text"
                                            value={newDeptName}
                                            onChange={e => setNewDeptName(e.target.value)}
                                            placeholder="Nome do novo departamento..."
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-purple-500 transition-all font-medium text-sm"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 border-t flex gap-3">
                            <button
                                onClick={() => { setAnalyzingReport(null); resetAnalysisForm(); }}
                                className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-black text-gray-400 text-xs uppercase tracking-widest hover:bg-gray-100 transition"
                            >
                                CANCELAR
                            </button>

                            <button
                                onClick={handleProcessAnalysis}
                                className={`flex-[2] py-4 rounded-2xl font-black text-white text-xs uppercase tracking-widest shadow-xl transition-all ${targetStatus === 'RESOLVED' ? 'bg-green-600 hover:bg-green-700 shadow-green-100' :
                                    targetStatus === 'FORWARDED' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-100' :
                                        'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
                                    }`}
                            >
                                {targetStatus === 'RESOLVED' ? 'FINALIZAR E RESOLVER' :
                                    targetStatus === 'FORWARDED' ? 'ENVIAR PARA DEPTO.' : 'SALVAR ANÁLISE'}
                            </button>
                        </div>
                    </div>
                </div>
            )
            }

            {/* Timeline Modal */}
            {
                selectedReport && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                        <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                                <div className="flex items-center gap-3">
                                    <History className="text-blue-600 w-5 h-5" />
                                    <h3 className="font-black text-gray-800 uppercase tracking-widest">Linha do Tempo</h3>
                                </div>
                                <button onClick={() => setSelectedReport(null)} className="p-2 hover:bg-gray-100 rounded-full transition"><X className="w-5 h-5 text-gray-400" /></button>
                            </div>

                            <div className="p-8 overflow-y-auto flex-1">
                                <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-100">
                                    {selectedReport.history?.map((step, idx) => (
                                        <div key={idx} className="relative pl-10">
                                            <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${step.status === 'SENT' ? 'bg-yellow-400' :
                                                step.status === 'IN_REVIEW' ? 'bg-blue-500' :
                                                    step.status === 'FORWARDED' ? 'bg-purple-500' :
                                                        step.status === 'RESOLVED' ? 'bg-green-500' : 'bg-gray-400'
                                                }`} />

                                            <div className="flex flex-col">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{new Date(step.createdAt).toLocaleString()}</span>
                                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${step.status === 'SENT' ? 'text-yellow-600 border-yellow-100 bg-yellow-50' :
                                                        step.status === 'IN_REVIEW' ? 'text-blue-600 border-blue-100 bg-blue-50' :
                                                            step.status === 'FORWARDED' ? 'text-purple-600 border-purple-100 bg-purple-50' :
                                                                'text-gray-600 border-gray-100 bg-gray-50'
                                                        }`}>{step.status}</span>
                                                </div>
                                                <p className="text-sm font-bold text-gray-800">{step.comment || 'Sem observações.'}</p>
                                                <div className="flex justify-between items-center mt-1">
                                                    <p className="text-[10px] text-gray-400 font-medium">Responsável: <b className="text-gray-600">{step.userName}</b></p>
                                                    {step.departmentName && (
                                                        <span className="text-[9px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100 flex items-center gap-1">
                                                            <Folder className="w-3 h-3" /> {step.departmentName.toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 bg-gray-50 border-t">
                                <button
                                    onClick={() => setSelectedReport(null)}
                                    className="w-full py-4 bg-white border border-gray-200 rounded-2xl font-black text-gray-500 uppercase tracking-widest hover:bg-gray-100 transition"
                                >
                                    FECHAR LINHA DO TEMPO
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Profile Modal */}
            {
                isProfileOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in zoom-in duration-300">
                        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                                <div className="flex items-center gap-3">
                                    <User className="text-blue-600 w-5 h-5" />
                                    <h3 className="font-black text-gray-800 uppercase tracking-widest">Meu Perfil</h3>
                                </div>
                                <button onClick={() => setIsProfileOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition"><X className="w-5 h-5 text-gray-400" /></button>
                            </div>

                            <div className="p-8 space-y-6 text-center">
                                <div className="relative inline-block mx-auto">
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gray-100 mx-auto group">
                                        {(profileAvatar || user?.avatarUrl) ? (
                                            <img
                                                src={
                                                    profileAvatar
                                                        ? URL.createObjectURL(profileAvatar)
                                                        : user?.avatarUrl ?? ''
                                                }
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-12 h-12 text-gray-300 mx-auto mt-6" />
                                        )}
                                        <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
                                            <Plus className="w-6 h-6 text-white" />
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={e => setProfileAvatar(e.target.files?.[0] || null)}
                                                accept="image/*"
                                            />
                                        </label>
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-blue-600 p-1.5 rounded-full border-2 border-white shadow-lg">
                                        <Plus className="w-3 h-3 text-white" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-black text-gray-800 text-lg">{user?.name}</h4>
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{user?.role}</p>
                                    </div>

                                    <div className="space-y-2 text-left">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Frase Motivacional / Status</label>
                                        <textarea
                                            value={profilePhrase}
                                            onChange={e => setProfilePhrase(e.target.value)}
                                            placeholder="Digite algo que te inspire..."
                                            className="w-full h-24 p-4 bg-gray-50 border border-gray-100 rounded-2xl resize-none outline-none focus:bg-white focus:border-blue-500 transition-all text-sm font-medium italic text-gray-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-gray-50 border-t flex gap-3">
                                <button
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-black text-gray-400 text-xs uppercase tracking-widest hover:bg-gray-100 transition"
                                >
                                    FECHAR
                                </button>
                                <button
                                    onClick={handleUpdateProfile}
                                    disabled={isUpdatingProfile}
                                    className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black text-white text-xs uppercase tracking-widest shadow-xl shadow-blue-100 transition-all disabled:opacity-50"
                                >
                                    {isUpdatingProfile ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Chat Widget */}
            {chatTarget && user && (
                <ChatWidget
                    currentUser={user!}
                    targetUser={chatTarget}
                    onClose={() => setChatTarget(null)}
                />
            )}
        </div>
    );
}
