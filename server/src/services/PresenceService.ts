class PresenceService {
    private onlineUsers = new Map<string, { userId: string; name: string; role: string; lastSeen: Date }>();

    public addUser(userId: string, name: string, role: string) {
        this.onlineUsers.set(userId, { userId, name, role, lastSeen: new Date() });
    }

    public removeUser(userId: string) {
        this.onlineUsers.delete(userId);
    }

    public getOnlineUsers() {
        return Array.from(this.onlineUsers.values());
    }

    public getCount() {
        return this.onlineUsers.size;
    }
}

export const presenceService = new PresenceService();
