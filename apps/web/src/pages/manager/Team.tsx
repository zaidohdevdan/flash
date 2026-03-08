import { useState, useCallback, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { TeamSidebar } from '../../components/domain/TeamSidebar';
import { InviteConferenceModal } from '../../components/domain/modals/InviteConferenceModal';
import { Button, Card } from '../../components/ui';
import { Shield, Video, Users, ArrowRight } from 'lucide-react';
import type { TeamMember } from '../../components/domain/TeamSidebar';
import type { UserContact } from '../../types';

export function Team() {
    const navigate = useNavigate();

    const [contacts, setContacts] = useState<UserContact[]>([]);
    const [subordinates, setSubordinates] = useState<UserContact[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const [contactsRes, subRes] = await Promise.all([
                api.get('/users/network'),
                api.get('/users/subordinates')
            ]);
            setContacts(contactsRes.data);
            setSubordinates(subRes.data);
        } catch (error) {
            console.error('Erro ao buscar contatos:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
        const interval = setInterval(loadUsers, 30000);
        return () => clearInterval(interval);
    }, [loadUsers]);

    const handleChatWith = () => {
        navigate('/manager/chat');
    };

    const mapUserToTeamMember = (u: UserContact): TeamMember => ({
        id: u.id,
        name: u.name,
        role: u.role,
        avatarUrl: u.avatarUrl,
        isOnline: u.isOnline || false,
        statusPhrase: u.statusPhrase,
        departmentName: u.departmentName,
    });

    const teamGroups = useMemo(() => [
        {
            id: 'contacts',
            title: 'Hierarquia Superior',
            icon: <Shield className="w-4 h-4" />,
            members: contacts.map(mapUserToTeamMember)
        },
        {
            id: 'subordinates',
            title: 'Equipe Operacional',
            icon: <Users className="w-4 h-4" />,
            members: subordinates.map(mapUserToTeamMember)
        }
    ], [contacts, subordinates]);

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mt-1">
                        Equipe &amp; War Room
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold mt-2 uppercase tracking-[0.2em] text-[10px]">
                        Controle Operacional e Sala de Situação
                    </p>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-6 lg:gap-8 overflow-hidden min-h-[600px]">
                {/* Left Column: TeamSidebar */}
                <div className="w-full lg:w-[350px] flex-shrink-0 flex flex-col gap-6">
                    <TeamSidebar
                        groups={teamGroups}
                        onMemberClick={() => handleChatWith()}
                        isLoading={isLoading}
                    />
                </div>

                {/* Right Column: War Room Actions */}
                <div className="flex-1 flex flex-col gap-6">
                    <Card className="p-8 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/5 shadow-xl backdrop-blur-xl rounded-[2.5rem]">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-4 bg-rose-50 dark:bg-rose-500/10 rounded-2xl border border-rose-100 dark:border-rose-500/20 shadow-inner">
                                <Video className="w-8 h-8 text-rose-600 dark:text-rose-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">War Room</h2>
                                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">Sala de Situação e Videoconferência</p>
                            </div>
                        </div>

                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                            Inicie uma sala de conferência criptografada para alinhar prioridades operacionais, discutir relatórios sensíveis ou resolver incidentes em tempo real com diretores, supervisores ou agentes de campo.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                variant="primary"
                                onClick={() => setIsInviteModalOpen(true)}
                                className="h-[52px] px-8 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-indigo-600/20 group"
                            >
                                <Video className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                Iniciar Conferência
                            </Button>

                            <Button
                                variant="secondary"
                                onClick={() => navigate('/manager/chat')}
                                className="h-[52px] px-8 rounded-2xl font-black uppercase tracking-widest text-[11px] bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-white/5 dark:text-slate-300 dark:border-white/10 dark:hover:bg-white/10 group"
                            >
                                Ir para o Chat Geral
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </Card>

                    {/* Quick Stats or Department Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <Card className="p-6 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 shadow-sm rounded-3xl">
                            <div className="flex flex-col">
                                <span className="text-emerald-600 dark:text-emerald-400 font-black text-2xl uppercase tracking-tighter">
                                    {subordinates.filter(u => u.isOnline).length} / {subordinates.length}
                                </span>
                                <span className="text-[10px] text-emerald-800/60 dark:text-emerald-200/50 font-bold uppercase tracking-widest mt-1">
                                    Agentes Online
                                </span>
                            </div>
                        </Card>
                        <Card className="p-6 bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 shadow-sm rounded-3xl">
                            <div className="flex flex-col">
                                <span className="text-indigo-600 dark:text-indigo-400 font-black text-2xl uppercase tracking-tighter">
                                    {contacts.filter(u => u.isOnline).length} / {contacts.length}
                                </span>
                                <span className="text-[10px] text-indigo-800/60 dark:text-indigo-200/50 font-bold uppercase tracking-widest mt-1">
                                    Superiores Online
                                </span>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            <InviteConferenceModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                participants={[...contacts, ...subordinates]}
                onConfirm={(selectedIds) => {
                    const roomName = `war-room-manager-${selectedIds.join('-')}`;
                    navigate(`/manager/conference?room=${roomName}`);
                }}
            />
        </div>
    );
}
