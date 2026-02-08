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

const MemberItem = React.memo(({ member, onClick }: { member: TeamMember, onClick: (m: TeamMember) => void }) => (
    <div
        onClick={() => onClick(member)}
        className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-tertiary)] transition-all cursor-pointer group/item relative border border-transparent hover:border-[var(--border-subtle)]"
    >
        <div className="relative">
            <Avatar
                src={member.avatarUrl}
                size="md"
                isOnline={member.isOnline}
                className="group-hover/item:scale-105 transition-transform"
            />
            {member.hasUnread && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
            )}
        </div>

        <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
                <h4 className={`text-sm font-semibold truncate transition-colors ${member.hasUnread ? 'text-[var(--text-primary)] font-bold' : 'text-[var(--text-primary)]'}`}>
                    {member.name}
                </h4>
            </div>

            <div className="flex items-center gap-1.5">
                <span className="text-xs text-[var(--text-tertiary)] truncate capitalize">
                    {member.role === 'MANAGER' ? (member.departmentName || 'Gerente') : member.role.toLowerCase()}
                </span>
            </div>

            {member.statusPhrase && (
                <p className="text-xs text-[var(--text-secondary)] italic truncate mt-0.5">
                    "{member.statusPhrase}"
                </p>
            )}
        </div>

        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
            <MessageSquare className="w-4 h-4 text-[var(--text-tertiary)]" />
        </div>
    </div>
));

export const TeamSidebar: React.FC<TeamSidebarProps> = React.memo(({
    groups,
    members,
    onMemberClick,
    title = "Equipe",
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
            <Card className="h-full flex flex-col p-4 animate-pulse">
                <div className="h-8 bg-[var(--bg-tertiary)] rounded w-1/3 mb-4" />
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-3">
                            <div className="w-10 h-10 bg-[var(--bg-tertiary)] rounded-full" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-[var(--bg-tertiary)] rounded w-3/4" />
                                <div className="h-2 bg-[var(--bg-tertiary)] rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        );
    }

    return (
        <Card className="h-[calc(100vh-8rem)] flex flex-col overflow-hidden sticky top-8">
            {/* Header / Nav */}
            <div className="p-4 border-b border-[var(--border-subtle)]">
                {!groups || groups.length <= 1 ? (
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[var(--bg-tertiary)] rounded-lg">
                            {icon || <Users className="w-5 h-5 text-[var(--text-secondary)]" />}
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
                            <p className="text-xs text-[var(--text-tertiary)]">{currentMembers.filter(m => m.isOnline).length} online</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex bg-[var(--bg-tertiary)] p-1 rounded-xl">
                        {groups.map((group) => {
                            const unread = hasUnreadInGroup(group.id);
                            const isActive = activeGroupId === group.id;
                            return (
                                <button
                                    key={group.id}
                                    onClick={() => setActiveGroupId(group.id)}
                                    className={`
                                        flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all relative text-xs font-medium
                                        ${isActive
                                            ? 'bg-white text-[var(--text-primary)] shadow-sm'
                                            : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}
                                    `}
                                >
                                    {group.icon || (group.id === 'contacts' ? <Shield className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />)}
                                    <span className="hidden sm:inline">
                                        {group.title}
                                        <span className="ml-1 opacity-60 text-[10px]">({group.members.filter(m => m.isOnline).length})</span>
                                    </span>
                                    {unread && (
                                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* List area */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {currentMembers.length > 0 ? (
                    currentMembers.map(member => (
                        <MemberItem
                            key={member.id}
                            member={member}
                            onClick={onMemberClick}
                        />
                    ))
                ) : (
                    <div className="py-12 text-center">
                        <div className="w-12 h-12 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center mx-auto mb-3">
                            <Users className="w-6 h-6 text-[var(--text-tertiary)]" />
                        </div>
                        <p className="text-xs text-[var(--text-tertiary)] font-medium">Nenhum membro ativo</p>
                    </div>
                )}
            </div>
        </Card>
    );
});
