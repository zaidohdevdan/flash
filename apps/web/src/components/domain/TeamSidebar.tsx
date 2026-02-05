import React from 'react';
import { Users, MessageSquare, Shield } from 'lucide-react';
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
 * Interface para um grupo de membros.
 */
export interface TeamGroup {
    id: string;
    title: string;
    members: TeamMember[];
    icon?: React.ReactNode;
}

/**
 * Propriedades para o componente TeamSidebar.
 */
export interface TeamSidebarProps {
    /** Suporte para múltiplos grupos (com abas). */
    groups?: TeamGroup[];
    /** Lista única de membros (formato antigo/legado). */
    members?: TeamMember[];
    /** Função chamada ao clicar para abrir chat com um membro. */
    onMemberClick: (member: TeamMember) => void;
    /** Título da seção (usado para lista única). */
    title?: string;
    /** Ícone da seção (usado para lista única). */
    icon?: React.ReactNode;
    /** Carregando dados da equipe. */
    isLoading?: boolean;
}

// Sub-componente interno memoizado para cada item da lista
const MemberItem = React.memo(({ member, onClick }: { member: TeamMember, onClick: (m: TeamMember) => void }) => (
    <div
        onClick={() => onClick(member)}
        className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group/item relative border border-transparent hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-900/20 min-w-0"
    >
        <Avatar
            src={member.avatarUrl}
            size="md"
            isOnline={member.isOnline}
            className="group-hover/item:scale-105 transition-transform ring-2 ring-white/10"
        />
        <div className="flex-1 min-w-0">
            <h4 className={`text-xs font-black uppercase tracking-tighter truncate transition-colors ${member.hasUnread ? 'text-amber-400 animate-pulse-subtle font-black drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]' : 'text-slate-200'}`}>
                {member.name}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">
                    {member.role === 'MANAGER' ? (member.departmentName || 'Gerente') : member.role}
                </span>
            </div>
            {member.statusPhrase && (
                <p className="text-[9px] text-slate-400 font-medium italic truncate mt-0.5">
                    "{member.statusPhrase}"
                </p>
            )}
        </div>

        {member.hasUnread ? (
            <div className="absolute top-3 right-3 w-2 h-2 bg-amber-500 rounded-full border-2 border-[#020617] shadow-sm shadow-amber-500/50 animate-bounce" />
        ) : (
            <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
            </div>
        )}
    </div>
));

/**
 * Sidebar lateral para exibição de equipe e contatos.
 * Altamente performante através de memoização.
 */
export const TeamSidebar: React.FC<TeamSidebarProps> = React.memo(({
    groups,
    members,
    onMemberClick,
    title = "Equipe Flash",
    icon,
    isLoading = false
}) => {
    const [activeGroupId, setActiveGroupId] = React.useState<string | null>(
        groups && groups.length > 0 ? groups[0].id : null
    );

    // Memoização da lista atual de membros
    const currentMembers = React.useMemo(() => {
        if (groups && groups.length > 0 && activeGroupId) {
            return groups.find(g => g.id === activeGroupId)?.members || [];
        }
        return members || [];
    }, [groups, members, activeGroupId]);

    // Verificação se existe notificação em um grupo específico (memoizada)
    const hasUnreadInGroup = React.useCallback((groupId: string) => {
        if (!groups) return false;
        const group = groups.find(g => g.id === groupId);
        return group?.members.some(m => m.hasUnread) || false;
    }, [groups]);

    if (isLoading) {
        return (
            <GlassCard variant="dark" blur="lg" className="h-full flex flex-col !rounded-[3rem] border-white/5 shadow-2xl shadow-black/20 p-6">
                <div className="space-y-6">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex gap-4 animate-pulse">
                            <div className="w-10 h-10 bg-white/5 rounded-2xl" />
                            <div className="flex-1 space-y-2 py-1">
                                <div className="h-3 bg-white/5 rounded w-3/4" />
                                <div className="h-2 bg-white/5 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>
        );
    }

    return (
        <GlassCard variant="dark" blur="lg" className="h-full flex flex-col !rounded-[3rem] border-white/5 shadow-2xl shadow-black/20 overflow-hidden">
            {/* Header / Nav */}
            <div className="p-6 pb-2">
                {!groups || groups.length <= 1 ? (
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            {icon || <Users className="w-5 h-5 text-white" />}
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">{title}</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{currentMembers.length} Conectados</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-2 p-1.5 bg-slate-900/50 rounded-[2rem] border border-white/5 mb-6 h-14">
                        {groups.map((group) => {
                            const unread = hasUnreadInGroup(group.id);
                            const isActive = activeGroupId === group.id;
                            return (
                                <button
                                    key={group.id}
                                    onClick={() => setActiveGroupId(group.id)}
                                    className={`
                                        flex-1 flex items-center justify-center gap-2 rounded-2xl transition-all relative
                                        ${isActive
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-black'
                                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 font-bold'}
                                    `}
                                >
                                    {group.icon || (group.id === 'apoio' ? <Shield className="w-4 h-4" /> : <Users className="w-4 h-4" />)}
                                    <span className="text-[10px] uppercase tracking-widest hidden sm:inline">{group.title}</span>
                                    {unread && (
                                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 border-2 border-[#020617] rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-bounce" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* List area */}
            <div className="flex-1 overflow-y-auto px-3 pb-8 custom-scrollbar space-y-1">
                {currentMembers.length > 0 ? (
                    currentMembers.map(member => (
                        <MemberItem
                            key={member.id}
                            member={member}
                            onClick={onMemberClick}
                        />
                    ))
                ) : (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-white/5">
                            <Users className="w-8 h-8 text-slate-600" />
                        </div>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Nenhum membro ativo</p>
                    </div>
                )}
            </div>
        </GlassCard>
    );
});
