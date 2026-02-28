import React from 'react';
import { Users, MessageSquare, Shield } from 'lucide-react';
import { Avatar, Card } from '../ui';

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string | null;
    isOnline: boolean;
    statusPhrase?: string;
    hasUnread?: boolean;
    departmentName?: string;
    email?: string;
}

export interface TeamGroup {
    id: string;
    title: string;
    members: TeamMember[];
    icon?: React.ReactNode;
}

export interface TeamSidebarProps {
    groups?: TeamGroup[];
    members?: TeamMember[];
    onMemberClick: (member: TeamMember) => void;
    title?: string;
    icon?: React.ReactNode;
    isLoading?: boolean;
}

const MemberItem = React.memo(({ member, onClick }: { member: TeamMember, onClick: (m: TeamMember) => void }) => {
    return (
        <div
            onClick={() => onClick(member)}
            className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer group/item relative border border-transparent hover:border-slate-200 dark:hover:border-white/5 active:scale-95 duration-300"
        >
            <div className="relative">
                <Avatar
                    src={member.avatarUrl}
                    size="md"
                    isOnline={member.isOnline}
                    className="group-hover/item:scale-110 transition-transform ring-2 ring-slate-200 dark:ring-white/5 shadow-2xl"
                />
                {member.hasUnread && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white dark:border-[#020617] animate-bounce shadow-lg" />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                    <h4 className={`text-sm font-black truncate transition-colors uppercase tracking-tight ${member.hasUnread ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 group-hover/item:text-slate-900 dark:text-slate-100 dark:group-hover/item:text-white'}`}>
                        {member.name}
                    </h4>
                </div>

                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${member.isOnline ? 'bg-emerald-500 animate-pulse shadow-sm dark:shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-300 dark:bg-slate-600'}`} />
                    <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 truncate uppercase tracking-widest">
                        {member.role === 'MANAGER' ? (member.departmentName || 'Comandante') : member.role === 'SUPERVISOR' ? 'Operador' : 'Agente de Campo'}
                    </span>
                </div>

                {member.statusPhrase && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold truncate mt-1.5 opacity-60 group-hover/item:opacity-100 transition-opacity italic">
                        "{member.statusPhrase}"
                    </p>
                )}
            </div>

            <div className="opacity-0 group-hover/item:opacity-100 translate-x-2 group-hover/item:translate-x-0 transition-all">
                <MessageSquare className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            </div>
        </div>
    );
});

export const TeamSidebar: React.FC<TeamSidebarProps> = React.memo(({
    groups,
    members,
    onMemberClick,
    title,
    icon,
    isLoading = false
}) => {
    const [activeGroupId, setActiveGroupId] = React.useState<string | null>(
        groups && groups.length > 0 ? groups[0].id : null
    );

    const currentMembers = React.useMemo(() => {
        if (groups && groups.length > 0 && activeGroupId) {
            return groups.find(g => g.id === activeGroupId)?.members || [];
        }
        return members || [];
    }, [groups, members, activeGroupId]);

    const hasUnreadInGroup = React.useCallback((groupId: string) => {
        if (!groups) return false;
        const group = groups.find(g => g.id === groupId);
        return group?.members.some(m => m.hasUnread) || false;
    }, [groups]);

    if (isLoading) {
        return (
            <Card className="h-full flex flex-col p-6 animate-pulse bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/5 rounded-2xl">
                <div className="h-8 bg-slate-200 dark:bg-white/5 rounded-xl w-1/2 mb-6" />
                <div className="space-y-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex gap-4">
                            <div className="w-12 h-12 bg-slate-200 dark:bg-white/5 rounded-full" />
                            <div className="flex-1 space-y-3">
                                <div className="h-4 bg-slate-200 dark:bg-white/5 rounded-lg w-3/4" />
                                <div className="h-3 bg-slate-200 dark:bg-white/5 rounded-lg w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        );
    }

    return (
        <Card className="h-[calc(100vh-8rem)] flex flex-col overflow-hidden sticky top-8 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl backdrop-blur-md shadow-2xl">
            {/* Header / Nav */}
            <div className="p-5 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/20">
                {!groups || groups.length <= 1 ? (
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl border border-indigo-200 dark:border-indigo-500/20 shadow-inner">
                            {icon || <Users className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />}
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">{title || 'Rede de Contatos'}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">{currentMembers.filter(m => m.isOnline).length} OPERACIONAIS</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex bg-slate-100 dark:bg-black/40 p-1 rounded-xl border border-slate-200 dark:border-white/5">
                        {groups.map((group) => {
                            const unread = hasUnreadInGroup(group.id);
                            const isActive = activeGroupId === group.id;
                            return (
                                <button
                                    title={group.title}
                                    type='button'
                                    key={group.id}
                                    onClick={() => setActiveGroupId(group.id)}
                                    className={`
                                        flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all relative text-[11px] font-black uppercase tracking-widest
                                        ${isActive
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}
                                    `}
                                >
                                    {group.icon || (group.id === 'contacts' ? <Shield className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />)}
                                    <span className="hidden sm:inline">
                                        {group.title}
                                        <span className="ml-1 opacity-40 text-[10px]">({group.members.filter(m => m.isOnline).length})</span>
                                    </span>
                                    {unread && (
                                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-black shadow-lg animate-pulse" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* List area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
                {currentMembers.length > 0 ? (
                    currentMembers.map(member => (
                        <MemberItem
                            key={member.id}
                            member={member}
                            onClick={onMemberClick}
                        />
                    ))
                ) : (
                    <div className="py-16 text-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-white/5 shadow-inner">
                            <Users className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                        </div>
                        <p className="text-[12px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest px-6 text-center">Setor desocupado no momento.</p>
                    </div>
                )}
            </div>
        </Card>
    );
});
