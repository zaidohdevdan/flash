import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle2, ExternalLink, Calendar, Video, AlertCircle } from 'lucide-react';
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
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
    isOpen,
    onClose,
    notifications,
    onMarkAsRead,
    onMarkAllAsRead
}) => {
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
                        className="fixed right-0 top-0 bottom-0 w-full sm:w-[400px] bg-white border-l border-gray-100 shadow-2xl z-[60] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Notificações</h3>
                                    {unreadCount > 0 && (
                                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">
                                            {unreadCount} novas mensagens
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-all"
                            >
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        {/* Actions */}
                        {unreadCount > 0 && (
                            <div className="px-6 py-3 bg-gray-50/50 flex justify-end items-center">
                                <button
                                    onClick={onMarkAllAsRead}
                                    className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 hover:text-blue-600 uppercase tracking-widest transition-all"
                                >
                                    Limpar todas <CheckCircle2 className="w-3 h-3" />
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
                                            ${notif.read ? 'bg-white border-gray-100' : 'bg-blue-50/30 border-blue-100/50 shelf-highlight'}
                                        `}
                                        onClick={() => !notif.read && onMarkAsRead(notif.id)}
                                    >
                                        {!notif.read && (
                                            <span className="absolute top-4 right-4 w-2 h-2 bg-blue-600 rounded-full" />
                                        )}

                                        <div className="flex gap-4">
                                            <div className={`
                                                flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center
                                                ${notif.type.includes('AGENDA') ? 'bg-purple-100 text-purple-600' :
                                                    notif.type.includes('CONFERENCE') ? 'bg-red-100 text-red-600' :
                                                        'bg-blue-100 text-blue-600'}
                                            `}>
                                                {notif.type.includes('AGENDA') ? <Calendar className="w-5 h-5" /> :
                                                    notif.type.includes('CONFERENCE') ? <Video className="w-5 h-5" /> :
                                                        <AlertCircle className="w-5 h-5" />}
                                            </div>

                                            <div className="flex-1">
                                                <h4 className="text-sm font-black text-gray-900 leading-tight mb-1">{notif.title}</h4>
                                                <p className="text-xs text-gray-600 font-medium leading-relaxed">{notif.message}</p>

                                                <div className="flex justify-between items-center mt-3">
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                        {format(new Date(notif.createdAt), "HH:mm • dd MMM", { locale: ptBR })}
                                                    </span>

                                                    {notif.link && (
                                                        <Badge status="default" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <ExternalLink className="w-3 h-3" />
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center opacity-30 select-none">
                                    <Bell className="w-16 h-16 mb-4" />
                                    <h4 className="text-lg font-black uppercase tracking-tighter">Sem notificações</h4>
                                    <p className="text-sm font-bold opacity-60">Tudo limpo por aqui!</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-100">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest text-center">
                                Flash Notification System v2.0
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
