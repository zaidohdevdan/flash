import { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useSearchParams, useNavigate, useOutletContext } from 'react-router-dom';
import type { Socket } from 'socket.io-client';
import { ChatWidget } from '../../components/ChatWidget';
import { Card, Avatar } from '../../components/ui';
import { Search, RefreshCw, MessageSquare } from 'lucide-react';

interface UserContact {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string;
}

export function ManagerChat() {
    const { user } = useAuth();
    const { socket, onlineUserIds = [], unreadMessages = {}, markAsRead } = useOutletContext<{
        socket: Socket | null,
        onlineUserIds?: string[],
        unreadMessages?: Record<string, boolean>,
        markAsRead: (userId: string) => void
    }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [subordinates, setSubordinates] = useState<UserContact[]>([]);
    const [contacts, setContacts] = useState<UserContact[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchContacts = async () => {
            setIsLoading(true);
            try {
                const [subRes, contactsRes] = await Promise.all([
                    api.get('/users/subordinates'),
                    api.get('/users/network')
                ]);
                setSubordinates(subRes.data);
                setContacts(contactsRes.data);
            } catch (err) {
                console.error('Error fetching chat contacts', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchContacts();
    }, []);

    const allContacts = useMemo(() => {
        const map = new Map<string, UserContact>();
        [...subordinates, ...contacts].forEach(c => {
            if (c.id !== user?.id) {
                map.set(c.id, c);
            }
        });
        return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [subordinates, contacts, user?.id]);

    const activeChatId = searchParams.get('chat');

    const selectedUser = useMemo(() => {
        if (!activeChatId) return null;
        return allContacts.find(c => c.id === activeChatId) || null;
    }, [activeChatId, allContacts]);

    const handleSelectContact = (id: string) => {
        markAsRead(id);
        setSearchParams(prev => {
            prev.set('chat', id);
            return prev;
        });
    };

    const handleCloseChat = () => {
        setSearchParams(prev => {
            prev.delete('chat');
            return prev;
        });
    };

    useEffect(() => {
        if (activeChatId) {
            markAsRead(activeChatId);
        }
    }, [activeChatId, markAsRead]);

    const filteredContacts = allContacts.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleStartVideo = () => {
        if (!activeChatId) return;
        const roomName = `war-room-${[user?.id || '', activeChatId].map(id => id.trim().toLowerCase()).sort().join('-')}`;
        // Temporarily, we can use the supervisor's conference route if Manager doesn't have one, or just an alert here.
        // Assuming we will add /manager/conference
        navigate(`/manager/conference?room=${roomName}`);
    };

    return (
        <div className="flex flex-col h-[calc(100dvh-10rem)] lg:h-[calc(100dvh-12rem)] overflow-hidden animate-in fade-in duration-500">
            <div className={`flex-col md:flex-row md:items-center justify-between gap-4 mb-5 flex-shrink-0 ${activeChatId ? 'hidden lg:flex' : 'flex'}`}>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Comunicação Operacional</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold mt-2 uppercase tracking-[0.2em] text-[10px]">Portal de Mensagens e War Room</p>
                </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Left Column: Contacts List */}
                <div className={`w-full lg:w-[350px] xl:w-[400px] flex-shrink-0 flex-col min-h-0 overflow-hidden ${activeChatId ? 'hidden lg:flex' : 'flex max-h-full'}`}>
                    <Card className="flex flex-col min-h-0 h-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/5 shadow-xl backdrop-blur-xl overflow-hidden p-6">
                        <div className="relative mb-6 flex-shrink-0">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar Rede de Contatos..."
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex-1 min-h-0 overflow-y-auto pr-2 chat-scrollbar space-y-2">
                            {isLoading ? (
                                <div className="flex justify-center py-10">
                                    <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
                                </div>
                            ) : filteredContacts.length === 0 ? (
                                <div className="text-center py-10 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                                    Nenhum contato encontrado.
                                </div>
                            ) : (
                                filteredContacts.map(contact => (
                                    <button
                                        key={contact.id}
                                        onClick={() => handleSelectContact(contact.id)}
                                        className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all border ${activeChatId === contact.id
                                            ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20 shadow-sm'
                                            : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-white/5'
                                            }`}
                                    >
                                        <div className="relative flex-shrink-0">
                                            <Avatar
                                                src={contact.avatarUrl}
                                                alt={contact.name}
                                                size="sm"
                                                hasUnread={!!unreadMessages[contact.id]}
                                            />
                                            {onlineUserIds.includes(contact.id) && (
                                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white dark:border-slate-900 rounded-full" />
                                            )}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <h4 className={`text-sm font-bold ${activeChatId === contact.id ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-900 dark:text-slate-200'}`}>
                                                {contact.name}
                                            </h4>
                                            <p className={`text-[9px] uppercase tracking-widest font-bold mt-0.5 ${activeChatId === contact.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
                                                {contact.role === 'PROFESSIONAL' ? 'Agente Operacional' : contact.role === 'SUPERVISOR' ? 'Comandante/Gestor' : contact.role}
                                            </p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right Column: Chat Window */}
                <div className={`flex-1 min-h-0 relative ${!activeChatId ? 'hidden lg:flex' : 'flex'}`}>
                    {selectedUser && user ? (
                        <ChatWidget
                            inline
                            currentUser={user}
                            targetUser={{
                                ...selectedUser,
                                isOnline: onlineUserIds.includes(selectedUser.id)
                            }}
                            onClose={handleCloseChat}
                            socket={socket}
                            onVideoClick={handleStartVideo}
                        />
                    ) : (
                        <Card className="flex flex-col items-center justify-center h-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/5 shadow-xl backdrop-blur-xl">
                            <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-full mb-4">
                                <MessageSquare className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Selecione uma conversa</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Escolha um contato na lista para iniciar a comunicação</p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ManagerChat;
