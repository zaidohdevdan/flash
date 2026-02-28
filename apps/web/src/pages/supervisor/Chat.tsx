import { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useDashboardSocket } from '../../hooks/useDashboardSocket';
import { ChatWidget } from '../../components/ChatWidget';
import { Card, Avatar } from '../../components/ui';
import { Search, RefreshCw, MessageSquare } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

interface UserContact {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string;
}

export function SupervisorChat() {
    const { user } = useAuth();
    const socketUser = user ? { id: user.id || '', name: user.name || '', role: user.role || '' } : null;
    const { socketRef } = useDashboardSocket({ user: socketUser });
    const [searchParams, setSearchParams] = useSearchParams();

    const [subordinates, setSubordinates] = useState<UserContact[]>([]);
    const [contacts, setContacts] = useState<UserContact[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchContacts = async () => {
            setIsLoading(true);
            try {
                const [subRes, contactsRes] = await Promise.all([
                    api.get('/subordinates'),
                    api.get('/support-network') // e.g., admins or other managers depending on backend
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

    // Also include any generic admins, if they are returned in support-network.
    // Dashboard.tsx combined both into a single selectable list.
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

    // Derived selected user
    const selectedUser = useMemo(() => {
        if (!activeChatId) return null;
        return allContacts.find(c => c.id === activeChatId) || null;
    }, [activeChatId, allContacts]);

    const handleSelectContact = (id: string) => {
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

    const filteredContacts = allContacts.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="flex flex-col overflow-hidden animate-in fade-in duration-500" style={{ height: 'calc(100vh - 9rem)' }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Central de Mensagens</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold mt-2 uppercase tracking-[0.2em] text-[10px]">Comunicação Direta P2P</p>
                </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Left Column: Contacts List */}
                <div className="w-full lg:w-[350px] xl:w-[400px] flex-shrink-0 flex flex-col min-h-0 max-h-[45%] lg:max-h-none overflow-hidden">
                    <Card className="flex flex-col min-h-0 h-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/5 shadow-xl backdrop-blur-xl overflow-hidden p-6">
                        <div className="relative mb-6 flex-shrink-0">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar contatos..."
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
                                        <Avatar
                                            src={contact.avatarUrl}
                                            alt={contact.name}
                                            size="sm"
                                        />
                                        <div className="flex-1 text-left">
                                            <h4 className={`text-sm font-bold ${activeChatId === contact.id ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-900 dark:text-slate-200'}`}>
                                                {contact.name}
                                            </h4>
                                            <p className={`text-[9px] uppercase tracking-widest font-bold mt-0.5 ${activeChatId === contact.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
                                                {contact.role === 'PROFESSIONAL' ? 'Agente Opc.' : contact.role === 'ADMIN' ? 'Administração' : contact.role}
                                            </p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right Column: Chat Window */}
                <div className="flex-1 min-h-0 flex flex-col">
                    {selectedUser && user ? (
                        <ChatWidget
                            inline
                            currentUser={user}
                            targetUser={selectedUser}
                            onClose={handleCloseChat}
                            socket={socketRef.current}
                        />
                    ) : (
                        <Card className="flex flex-col items-center justify-center h-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/5 shadow-xl backdrop-blur-xl">
                            <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-full mb-4">
                                <MessageSquare className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Selecione uma conversa</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Escolha um contato na lista para iniciar</p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

// Ensure default export if used with Next.js or React.lazy where appropriate, 
// though our App.tsx expects named export `SupervisorChat` in some places.
// We'll export both.
export default SupervisorChat;