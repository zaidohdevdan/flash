import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle2, ExternalLink, Calendar, Video, AlertCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from './';
import type { Notification } from '../../types';

interface NotificationDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
    onDelete: (id: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
    isOpen,
    onClose,
    notifications,
    onMarkAsRead,
    onMarkAllAsRead,
    onDelete
}) => {
    const currentLocale = ptBR;
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 lg:hidden"
                    />

                    {/* Drawer Content */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full sm:w-[400px] bg-[var(--bg-primary)] border-l border-[var(--border-subtle)] shadow-2xl z-[60] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-[var(--border-subtle)] flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tighter">Central de Alertas</h3>
                                    {unreadCount > 0 && (
                                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">
                                            {unreadCount} {unreadCount === 1 ? 'Nova Notificação' : 'Novas Notificações'}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                title="Fechar"
                                aria-label="Fechar"
                                className="p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-all"
                            >
                                <X className="w-6 h-6 text-[var(--text-tertiary)]" />
                            </button>
                        </div>

                        {/* Actions */}
                        {unreadCount > 0 && (
                            <div className="px-6 py-3 bg-[var(--bg-secondary)]/50 flex justify-end items-center">
                                <button
                                    type="button"
                                    onClick={onMarkAllAsRead}
                                    className="flex items-center gap-1.5 text-[10px] font-black text-[var(--text-tertiary)] hover:text-blue-500 uppercase tracking-widest transition-all"
                                >
                                    Limpar Tudo <CheckCircle2 className="w-3 h-3" />
                                </button>
                            </div>
                        )}

                        {/* Notifications List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {notifications.length > 0 ? (
                                notifications.map(notif => (
                                    <motion.div
                                        key={notif.id}
                                        layout
                                        className={`relative p-4 rounded-3xl border transition-all cursor-pointer group
                                            ${notif.read ? 'bg-[var(--bg-primary)] border-[var(--border-subtle)]' : 'bg-blue-500/5 border-blue-500/20 shelf-highlight'}
                                        `}
                                        onClick={() => !notif.read && onMarkAsRead(notif.id)}
                                    >
                                        {!notif.read && (
                                            <span className="absolute top-4 right-4 w-2 h-2 bg-blue-600 rounded-full" />
                                        )}

                                        <div className="flex gap-4">
                                            <div className={`
                                                flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center
                                                ${(notif.type.includes('AGENDA') && (notif.title.toLowerCase().includes('cancelado') || notif.type.includes('CANCEL'))) ? 'bg-red-100 text-red-600' :
                                                    notif.type.includes('AGENDA') ? 'bg-purple-100 text-purple-600' :
                                                        notif.type.includes('CONFERENCE') ? 'bg-red-100 text-red-600' :
                                                            'bg-blue-100 text-blue-600'}
                                            `}>
                                                {(notif.type.includes('AGENDA') && (notif.title.toLowerCase().includes('cancelado') || notif.type.includes('CANCEL'))) ? <X className="w-5 h-5" /> :
                                                    notif.type.includes('AGENDA') ? <Calendar className="w-5 h-5" /> :
                                                        notif.type.includes('CONFERENCE') ? <Video className="w-5 h-5" /> :
                                                            <AlertCircle className="w-5 h-5" />}
                                            </div>

                                            <div className="flex-1">
                                                <h4 className="text-sm font-black text-[var(--text-primary)] leading-tight mb-1">{notif.title}</h4>
                                                <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">{notif.message}</p>

                                                <div className="flex justify-between items-center mt-3">
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                        {format(new Date(notif.createdAt), "HH:mm • dd MMM", { locale: currentLocale })}
                                                    </span>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDelete(notif.id);
                                                            }}
                                                            className="p-1 text-[var(--text-tertiary)] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                            title="Excluir notificação"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        {notif.link && (
                                                            <Badge status="default" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <ExternalLink className="w-3 h-3" />
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center opacity-30 select-none">
                                    <Bell className="w-16 h-16 mb-4" />
                                    <h4 className="text-lg font-black uppercase tracking-tighter">Silêncio Absoluto</h4>
                                    <p className="text-sm font-bold opacity-60">Sua central de alertas está limpa no momento.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)]">
                            <p className="text-[10px] text-[var(--text-tertiary)] font-black uppercase tracking-widest text-center">
                                Monitoramento de Operações Ativo
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
