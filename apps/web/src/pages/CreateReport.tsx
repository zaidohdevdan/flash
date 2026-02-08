import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';
import {
    Plus,
    History,
    CloudOff,
    RefreshCw
} from 'lucide-react';
import { useDashboardSocket } from '../hooks/useDashboardSocket';
import {
    ProfessionalHeader,
    SupervisorHighlight,
    NewReportForm,
    SuccessView
} from '../components/domain/professional';
import { ChatWidget } from '../components/ChatWidget';
import {
    Button,
    Card,
    ReportShimmer
} from '../components/ui';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ReportCard } from '../components/domain';
import { ReportHistoryModal } from '../components/domain/modals/ReportHistoryModal';
import { ProfileSettingsModal } from '../components/domain/modals/ProfileSettingsModal';
import { ConferenceModal } from '../components/domain/modals/ConferenceModal';
import { ConferenceInviteNotification } from '../components/ui/ConferenceInviteNotification';
import { db } from '../services/db';
import { syncAll } from '../services/offlineSync';
import { useLiveQuery } from 'dexie-react-hooks';

import type { Report } from '../types';

export function CreateReport() {
    const { t } = useTranslation();
    const { user, signOut, updateUser } = useAuth();
    const [view, setView] = useState<'history' | 'form'>('history');
    const [searchParams, setSearchParams] = useSearchParams();
    const activeChatId = searchParams.get('chat');
    const isChatOpen = !!activeChatId;
    const [comment, setComment] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const [history, setHistory] = useState<Report[]>([]);
    const [success, setSuccess] = useState(false);
    const hasShownSummaryRef = useRef(false);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    // Dexie Notifications
    const notifications = useLiveQuery(() => db.notifications.orderBy('createdAt').reverse().toArray()) || [];

    const LIMIT = 4;

    const pendingReports = useLiveQuery(() => db.pendingReports.toArray());

    // Conference State from URL
    const activeRoom = searchParams.get('conference');
    const setActiveRoom = (roomId: string | null) => {
        const newParams = new URLSearchParams(searchParams);
        if (roomId) {
            newParams.set('conference', roomId);
        } else {
            newParams.delete('conference');
        }
        setSearchParams(newParams, { replace: true });
    };
    const [pendingInvite, setPendingInvite] = useState<{ roomId: string; hostId: string; hostName: string } | null>(null);

    const socketUser = useMemo(() => user ? {
        id: user.id || '',
        name: user.name || '',
        role: user.role || ''
    } : null, [user]);

    const {
        socket,
        onlineUserIds,
        unreadMessages,
        isConnected,
        markAsRead,
        playNotificationSound
    } = useDashboardSocket({
        user: socketUser,
        onConferenceInvite: (data) => {
            if (activeRoom) return;
            setPendingInvite({
                roomId: data.roomId,
                hostId: data.hostId,
                hostName: data.hostRole === 'SUPERVISOR' ? 'Supervisor' : 'Gerente'
            });
            playNotificationSound();
        },
    });

    const hasUnreadMessages = useMemo(() =>
        Object.values(unreadMessages).some(v => v === true),
        [unreadMessages]);


    const fetchNotifications = useCallback(async () => {
        if (hasShownSummaryRef.current) return;
        hasShownSummaryRef.current = true;

        try {
            const res = await api.get('/notifications');
            const remoteNotifications = res.data;
            let unreadCount = 0;

            // Upsert remote notifications into Dexie
            await db.transaction('rw', db.notifications, async () => {
                for (const notif of remoteNotifications) {
                    if (!notif.read) unreadCount++;
                    await db.notifications.put({
                        id: String(notif.id),
                        title: notif.title,
                        message: notif.message,
                        type: notif.type || 'system',
                        read: !!notif.read,
                        createdAt: notif.createdAt,
                        link: notif.link || undefined
                    });
                }
            });

            if (unreadCount > 0) {
                toast(`Você tem ${unreadCount} ${unreadCount === 1 ? 'notificação não lida' : 'notificações não lidas'} `, {
                    icon: '🔔',
                    duration: 4000
                });
            }

            // Also check for unread chat messages
            const chatRes = await api.get('/chat/unread-count');
            const unreadChatCount = chatRes.data.count;

            if (unreadChatCount > 0) {
                toast(`Você tem ${unreadChatCount} ${unreadChatCount === 1 ? 'mensagem não lida' : 'mensagens não lidas'} no chat`, {
                    icon: '💬',
                    duration: 5000,
                    style: {
                        borderRadius: '1.5rem',
                        background: '#333',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 'bold'
                    }
                });
            }
        } catch {
            console.error('Erro ao buscar notificações');
        }
    }, []);

    useEffect(() => {
        if (!socket) return;
        socket.on('report_status_updated', (data: { reportId: string, newStatus: unknown, feedback?: string, feedbackAt?: string }) => {
            setHistory(prev => {
                if (statusFilter && statusFilter !== data.newStatus) {
                    return prev.filter(item => item.id !== data.reportId);
                }
                return prev.map(item =>
                    item.id === data.reportId
                        ? { ...item, status: data.newStatus as Report['status'], feedback: data.feedback, feedbackAt: data.feedbackAt }
                        : item
                );
            });
        });
        return () => {
            socket.off('report_status_updated');
        };
    }, [socket, statusFilter]);

    // Sincroniza notificações
    useEffect(() => {
        if (user?.id) {
            fetchNotifications();
        }
    }, [user?.id, fetchNotifications]);

    // Sincroniza perfil apenas uma vez no mount ou se o ID mudar
    useEffect(() => {
        if (!user?.id) return;
        api.get('/profile/me').then(res => {
            if (res.data) updateUser(res.data);
        }).catch(() => { });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const loadHistory = useCallback(async (pageNum: number = 1, reset: boolean = false, status?: string) => {
        if (!user?.id) return;
        setLoadingHistory(pageNum === 1);
        try {
            const url = `/reports/me?page=${pageNum}&limit=${LIMIT}${status ? `&status=${status}` : ''}`;
            const response = await api.get(url);
            const newHistory = response.data;

            setHasMore(newHistory.length === LIMIT);
            setHistory(prev => reset ? newHistory : [...prev, ...newHistory]);
        } catch {
            console.error('Erro ao carregar histórico');
        } finally {
            setLoadingHistory(false);
        }
    }, [user?.id]);

    useEffect(() => {
        loadHistory(1, true, statusFilter);

        // Sincronização automática inicial
        if (navigator.onLine) {
            syncAll();
        }

        const handleOnline = () => {
            toast.success('Conexão restabelecida! Sincronizando dados...', { icon: '🌐' });
            syncAll();
        };

        const handleOffline = () => {
            toast.error('Você está offline. O sistema salvará as fotos localmente.', { icon: '📡' });
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [statusFilter, loadHistory]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                loadHistory(1, true, statusFilter);
                setPage(1);
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [statusFilter, loadHistory]);

    // Blob URL Cleanup
    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    const handleOpenChat = () => {
        if (!user?.supervisorId) {
            toast.error('Você ainda não possui um supervisor atribuído.', { icon: '⚠️' });
            return;
        }
        setSearchParams({ chat: user.supervisorId }, { replace: true });
        markAsRead(user.supervisorId);
    };

    const handleCloseChat = () => {
        setSearchParams({}, { replace: true });
    };

    function handleLoadMore() {
        const nextPage = page + 1;
        setPage(nextPage);
        loadHistory(nextPage, false, statusFilter);
    }



    const handleMarkAsRead = async (id: string) => {
        try {
            await api.patch(`/ notifications / ${id}/read`);
            await db.notifications.update(id, { read: true });
        } catch {
            await db.notifications.update(id, { read: true });
            toast.error('Erro ao sincronizar leitura com servidor');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.post('/notifications/read-all');
            const allLocal = await db.notifications.toArray();
            await db.transaction('rw', db.notifications, async () => {
                for (const n of allLocal) {
                    await db.notifications.update(n.id, { read: true });
                }
            });
            toast.success('Todas as notificações marcadas como lidas');
        } catch {
            toast.error('Erro ao marcar todas como lidas');
        }
    };

    // Profile Management
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [profilePhrase, setProfilePhrase] = useState(user?.statusPhrase || '');
    const [profileAvatar, setProfileAvatar] = useState<File | null>(null);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    useEffect(() => {
        if (user?.statusPhrase) {
            setProfilePhrase(user.statusPhrase);
        }
    }, [user?.statusPhrase]);

    const handleUpdateProfile = async () => {
        if (!user) return;
        setIsUpdatingProfile(true);
        try {
            const formData = new FormData();
            formData.append('statusPhrase', profilePhrase);
            if (profileAvatar) {
                formData.append('avatar', profileAvatar);
            }

            const response = await api.patch('/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            updateUser(response.data);
            setIsProfileOpen(false);
            setProfileAvatar(null);
            toast.success('Perfil atualizado com sucesso!');
        } catch (error) {
            console.error('Update profile error:', error);
            toast.error('Erro ao atualizar perfil.');
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!image) return toast.error('Por favor, tire uma foto para o relatório.');

        setSending(true);

        try {
            // Verificação de Conexão
            if (!navigator.onLine) {
                // Modo Offline: Salva no Dexie
                await db.pendingReports.add({
                    comment,
                    imageBlob: image,
                    previewUrl: preview!,
                    createdAt: Date.now(),
                    status: 'pending'
                });

                setSuccess(true);
                setComment('');
                setImage(null);
                setPreview(null);
                setView('history');
                toast.success('Relatório salvo localmente! Será enviado assim que houver internet.', {
                    icon: '💾',
                    duration: 5000
                });
                return;
            }

            const cloudinaryData = new FormData();
            cloudinaryData.append('file', image);
            cloudinaryData.append('upload_preset', 'flash_preset');

            const cloudinaryRes = await fetch('https://api.cloudinary.com/v1_1/dfr8mjlnb/image/upload', {
                method: 'POST',
                body: cloudinaryData
            });

            if (!cloudinaryRes.ok) throw new Error('Falha no upload da imagem');

            const cloudinaryJson = await cloudinaryRes.json();
            const imageUrl = cloudinaryJson.secure_url;

            const reportData = {
                comment,
                imageUrl,
                latitude: undefined as string | undefined,
                longitude: undefined as string | undefined
            };

            // Captura de Geolocalização (Otimizada)
            try {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 1000 * 60 * 5 // 5 minutes
                    });
                });
                reportData.latitude = position.coords.latitude.toString();
                reportData.longitude = position.coords.longitude.toString();
            } catch (error) {
                console.warn('GPS unavailable:', error);
            }

            await api.post('/reports', reportData);

            setSuccess(true);
            setComment('');
            setImage(null);
            setPreview(null);
            setView('history');
            loadHistory(1, true);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao enviar relatório. Tentaremos novamente depois.');
        } finally {
            setSending(false);
        }
    }

    if (success) {
        return <SuccessView onBack={() => setSuccess(false)} />;
    }

    return (
        <DashboardLayout
            user={{ name: user?.name, avatarUrl: user?.avatarUrl, role: user?.role }}
            onLogout={signOut}
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onProfileClick={() => setIsProfileOpen(true)}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
        >
            <div className="relative h-full">
                {/* Alerta de Modo Offline */}
                <div className="max-w-2xl mx-auto pt-4 mb-6">
                    {pendingReports && pendingReports.length > 0 && (
                        <Card variant="outline" className="p-4 border-amber-200 bg-amber-50 flex items-center justify-between animate-in slide-in-from-top-4 duration-500">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                                    <CloudOff className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-amber-900 uppercase tracking-tight">{t('reports.create.offlinePending')}</h4>
                                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">{t('reports.create.offlineWaiting', { count: pendingReports.length })}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => syncAll()}
                                    className="!text-amber-800 hover:bg-amber-100 !px-4"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    {t('reports.create.tryNow')}
                                </Button>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (confirm(t('reports.create.confirmClear'))) {
                                            await db.pendingReports.clear();
                                        }
                                    }}
                                    className="p-2 text-amber-400 hover:text-red-500 transition-colors"
                                    aria-label={t('reports.create.clearDrafts')}
                                    title={t('reports.create.clearDrafts')}
                                >
                                    <History className="w-4 h-4" />
                                </button>
                            </div>
                        </Card>
                    )}
                </div>

                {view === 'history' ? (
                    <div className="max-w-2xl mx-auto space-y-8 pb-24">
                        <ProfessionalHeader
                            userName={user?.name || t('reports.defaults.professional')}
                            isConnected={isConnected}
                        />

                        {user?.supervisorId && (
                            <SupervisorHighlight
                                supervisorName={user.supervisorName || t('reports.defaults.technicalLead')}
                                isOnline={onlineUserIds.includes(user.supervisorId)}
                                hasUnread={hasUnreadMessages || !!unreadMessages[user.supervisorId]}
                                onChatOpen={handleOpenChat}
                            />
                        )}

                        <div className="flex flex-col gap-4">

                            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                {[
                                    { id: '', label: t('reports.filters.all') },
                                    { id: 'SENT', label: t('reports.filters.sent') },
                                    { id: 'IN_REVIEW', label: t('reports.filters.inReview') },
                                    { id: 'FORWARDED', label: t('reports.filters.forwarded') },
                                    { id: 'RESOLVED', label: t('reports.filters.resolved') },
                                ].map(filter => (
                                    <button
                                        type="button"
                                        key={filter.id}
                                        onClick={() => { setStatusFilter(filter.id); setPage(1); }}
                                        className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all border shrink-0 whitespace-nowrap ${statusFilter === filter.id
                                            ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-sm'
                                            : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--bg-tertiary)]'
                                            }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {loadingHistory ? (
                            <div className="space-y-6">
                                <ReportShimmer />
                                <ReportShimmer />
                                <ReportShimmer />
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {history.filter(r =>
                                    r.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    r.id.toLowerCase().includes(searchTerm.toLowerCase())
                                ).map(item => (
                                    <ReportCard
                                        key={item.id}
                                        report={item}
                                        actions={
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedReport(item)}>
                                                {t('reports.create.details')}
                                            </Button>
                                        }
                                    />
                                ))}

                                {hasMore && (
                                    <Button variant="secondary" size="lg" fullWidth onClick={handleLoadMore} className="mt-4">
                                        {t('reports.create.loadMore')}
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="max-w-xl mx-auto space-y-8 animate-in slide-in-from-bottom-5 duration-500 pb-24">
                        <div className="flex items-center justify-between">
                            <ProfessionalHeader
                                userName={user?.name || t('reports.defaults.professional')}
                                isConnected={isConnected}
                            />
                            <Button variant="ghost" size="sm" onClick={() => setView('history')}>
                                {t('reports.create.cancel')}
                            </Button>
                        </div>

                        <NewReportForm
                            comment={comment}
                            onCommentChange={setComment}
                            preview={preview}
                            onImageChange={handleImageChange}
                            onClearImage={() => { setImage(null); setPreview(null); }}
                            onSubmit={handleSubmit}
                            isSending={sending}
                        />
                    </div>
                )}
            </div>

            {view === 'history' && (
                <button
                    type="button"
                    onClick={() => setView('form')}
                    className="fixed bottom-8 right-6 w-14 h-14 bg-[var(--accent-primary)] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[var(--accent-primary)]/30 active:scale-95 transition-all hover:-translate-y-1 z-30 group"
                    aria-label={t('reports.create.title')}
                    title={t('reports.create.title')}
                >
                    <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform" />
                </button>
            )}

            {isChatOpen && user && (
                <ChatWidget
                    currentUser={{ id: user.id || '', name: user.name || '', role: user.role || '' }}
                    targetUser={{
                        id: user.supervisorId || 'supervisor',
                        name: user.supervisorName || t('reports.defaults.supervisor'),
                        role: 'SUPERVISOR'
                    }}
                    onClose={handleCloseChat}
                    socket={socket}
                    onRead={markAsRead}
                />
            )}

            <ReportHistoryModal
                isOpen={!!selectedReport}
                onClose={() => setSelectedReport(null)}
                report={selectedReport}
            />

            <ProfileSettingsModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                onSave={handleUpdateProfile}
                isLoading={isUpdatingProfile}
                profilePhrase={profilePhrase}
                setProfilePhrase={setProfilePhrase}
                onAvatarChange={setProfileAvatar}
                avatarUrl={user?.avatarUrl}
            />

            <ConferenceModal
                isOpen={!!activeRoom}
                onClose={() => setActiveRoom(null)}
                roomName={activeRoom || ''}
                userName={user?.name}
            />

            <ConferenceInviteNotification
                isOpen={!!pendingInvite}
                hostName={pendingInvite?.hostName || ''}
                onAccept={() => {
                    setActiveRoom(pendingInvite?.roomId || null);
                    setPendingInvite(null);
                }}
                onDecline={() => setPendingInvite(null)}
            />
        </DashboardLayout>
    );
}
