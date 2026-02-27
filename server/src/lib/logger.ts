export interface LogEntry {
    timestamp: Date;
    level: 'info' | 'error' | 'warn';
    message: string;
}

class InMemoryLogger {
    private logs: LogEntry[] = [];
    private readonly maxSize: number = 200;

    // Save originals
    private originalLog = console.log;
    private originalError = console.error;
    private originalWarn = console.warn;

    public init() {
        console.log = (...args: any[]) => {
            this.pushLog('info', args);
            this.originalLog.apply(console, args);
        };
        console.error = (...args: any[]) => {
            this.pushLog('error', args);
            this.originalError.apply(console, args);
        };
        console.warn = (...args: any[]) => {
            this.pushLog('warn', args);
            this.originalWarn.apply(console, args);
        };
    }

    private pushLog(level: 'info' | 'error' | 'warn', args: any[]) {
        const message = args.map(a =>
            typeof a === 'object' ? JSON.stringify(a) : String(a)
        ).join(' ');

        this.logs.push({ timestamp: new Date(), level, message });

        if (this.logs.length > this.maxSize) {
            this.logs.shift();
        }
    }

    public getLogs(limit: number = 50, levelFilter?: 'info' | 'error' | 'warn'): LogEntry[] {
        let filtered = this.logs;
        if (levelFilter) {
            filtered = filtered.filter(l => l.level === levelFilter);
        }
        return filtered.slice(-limit);
    }
}

export const TerminalLogger = new InMemoryLogger();
