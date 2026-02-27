export interface SniffEntry {
    timestamp: Date;
    type: 'HTTP' | 'WS';
    method?: string;
    url?: string;
    status?: number;
    event?: string;
    payload?: string;
    duration?: number;
}

class NetworkSnifferService {
    private entries: SniffEntry[] = [];
    private readonly maxSize: number = 100;

    public logHttp(method: string, url: string, status: number, duration: number) {
        this.push({
            timestamp: new Date(),
            type: 'HTTP',
            method,
            url,
            status,
            duration
        });
    }

    public logWs(event: string, payload?: any) {
        this.push({
            timestamp: new Date(),
            type: 'WS',
            event,
            payload: payload ? JSON.stringify(payload).substring(0, 500) : undefined
        });
    }

    private push(entry: SniffEntry) {
        this.entries.push(entry);
        if (this.entries.length > this.maxSize) {
            this.entries.shift();
        }
    }

    public getEntries(limit: number = 20, filter?: string): SniffEntry[] {
        let filtered = this.entries;
        if (filter) {
            const lowerFilter = filter.toLowerCase();
            filtered = filtered.filter(e =>
                (e.event && e.event.toLowerCase().includes(lowerFilter)) ||
                (e.method && e.method.toLowerCase().includes(lowerFilter)) ||
                (e.url && e.url.toLowerCase().includes(lowerFilter))
            );
        }
        return filtered.slice(-limit);
    }

    public clear() {
        this.entries = [];
    }
}

export const NetworkSniffer = new NetworkSnifferService();
