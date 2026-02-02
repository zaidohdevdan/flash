import React from 'react';
import { Users, User as UserIcon, MessageSquare } from 'lucide-react';
import { Avatar, GlassCard } from '../ui';

/**
 * Interface para os dados de um membro da equipe.
 */
export interface TeamMember {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string | null;
    isOnline: boolean;
    statusPhrase?: string;
    hasUnread?: boolean;
    departmentName?: string;
}

/**
 * Propriedades para o componente TeamSidebar.
 */
export interface TeamSidebarProps {
    members: TeamMember[];
    /** Função chamada ao clicar para abrir chat com um membro. */
    onMemberClick: (member: TeamMember) => void;
    /** Título da seção. */
    title?: string;
    /** Carregando dados da equipe. */
    isLoading?: boolean;
}

/**
 * Sidebar de Equipe especializada.
 * Exibe membros, status de presença (online/offline) e notificações de mensagens não lidas.
 */
export const TeamSidebar: React.FC<TeamSidebarProps> = ({
    members,
    onMemberClick,
    title = 'Equipe Operacional',
    isLoading = false
}) => {
    return (
        <GlassCard
            blur="lg"
            className="p-6 md:p-8 flex flex-col h-full sticky top-24"
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/60">
                <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/20">
                    <Users className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-[10px] font-black text-gray-950 uppercase tracking-widest">
                    {title}
                </h2>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2">
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center gap-4 animate-pulse">
                                <div className="w-12 h-12 bg-gray-100 rounded-[1.25rem]" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                                    <div className="h-2 bg-gray-100 rounded w-1/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : members.length === 0 ? (
                    <div className="text-center py-10">
                        <UserIcon className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Nenhum colega</p>
                    </div>
                ) : (
                    <div className="space-y-4 md:space-y-6">
                        {members.map(member => (
                            <div
                                key={member.id}
                                onClick={() => onMemberClick(member)}
                                className="group flex items-center justify-between p-3 md:p-4 hover:bg-blue-50/50 rounded-2xl md:rounded-[2rem] transition-all border border-transparent hover:border-blue-100/30 cursor-pointer min-w-0"
                            >
                                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                                    <div className="relative shrink-0">
                                        <Avatar
                                            src={member.avatarUrl}
                                            isOnline={member.isOnline}
                                            size="lg"
                                            className="group-hover:scale-105"
                                        />
                                        {member.hasUnread && (
                                            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-black text-gray-900 leading-tight truncate">
                                            {member.name}
                                        </p>
                                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5 truncate">
                                            {member.role} {member.departmentName ? `• ${member.departmentName}` : ''}
                                        </p>
                                        {member.statusPhrase && (
                                            <p className="text-[9px] text-blue-400 italic mt-1 truncate max-w-[120px]">
                                                "{member.statusPhrase}"
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-white p-2 rounded-xl shadow-sm text-blue-600">
                                        <MessageSquare className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </GlassCard>
    );
};
