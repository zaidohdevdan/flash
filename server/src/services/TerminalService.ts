import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import { TerminalLogger } from '../lib/logger';
import { presenceService } from './PresenceService';
import { NetworkSniffer } from '../lib/sniffer';
import os from 'os';
import net from 'net';

export type TerminalAction =
    | { action: 'SET_APPEARANCE'; params: { theme?: 'light' | 'dark' | 'system'; density?: 'comfortable' | 'compact' } }
    | { action: 'SET_NOTIFICATIONS'; params: { enabled?: boolean; desktop?: boolean } }
    | { action: 'CLEAR_OFFLINE_CACHE'; params?: never };

export type TerminalOutput = {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
} & (TerminalAction | { action?: never; params?: never });

export class TerminalService {
    static async executeCommand(commandStr: string, userEmail: string): Promise<TerminalOutput[]> {
        const output: TerminalOutput[] = [];

        // Simple tokenizer
        const args = commandStr.match(/(?:[^\s"]+|"[^"]*")+/g)?.map(arg => arg.replace(/^"|"$/g, '')) || [];

        if (args.length === 0) {
            return [{ type: 'info', message: '' }];
        }

        const baseCommand = args[0] || '';
        const subCommand = args[1] || '';
        const restArgs = args.slice(2);

        try {
            switch (baseCommand) {
                case 'help':
                    output.push({ type: 'info', message: this.getHelpText(subCommand) });
                    break;
                case 'user':
                    output.push(await this.handleUserCommand(subCommand, restArgs));
                    break;
                case 'report':
                    output.push(await this.handleReportCommand(subCommand, restArgs));
                    break;
                case 'db':
                    output.push(await this.handleDbCommand(subCommand, restArgs));
                    break;
                case 'sys':
                    output.push(await this.handleSysCommand(subCommand, restArgs));
                    break;
                case 'audit':
                    output.push(await this.handleAuditCommand(subCommand, restArgs));
                    break;
                default:
                    output.push({ type: 'error', message: `Comando não encontrado: ${baseCommand}. Digite 'help' para comandos.` });
            }
        } catch (error: any) {
            output.push({ type: 'error', message: `Erro de execução: ${error.message}` });
        }

        return output;
    }

    private static getHelpText(command?: string): string {
        if (command === 'user') {
            return `=== [ GERENCIAMENTO DE USUÁRIOS ] ===
Comandos para manipular contas e permissões.

  user create --name <nome> --email <email> --password <pass> [--role <ADMIN|PROFESSIONAL|...>]
  user rm <email|id>      (Exclui permanentemente um usuário)
  user edit <email|id>    [--name <novo_nome>] [--role <novo_cargo>]
  user passwd <email|id>  --new <senha> (Redefine senha sem confirmação)
  user link <prof>        --to <supervisor> (Vincula profissional ao supervisor)
  user info <email|id>    (Exibe perfil completo, data de criação e auditoria)

💡 DICA: Use --role ADMIN para garantir acesso ao terminal via frontend.`;
        }
        if (command === 'report') {
            return `=== [ GERENCIAMENTO DE RELATÓRIOS ] ===
Ações administrativas sobre protocolos registrados.

  report rm --hard <protocolo> (Exclui relatório, anexos e histórico do DB)`;
        }
        if (command === 'db') {
            return `=== [ DATABASE EXPLORER ] ===
Interface direta de consulta ao banco de dados (Prisma).

  db ls <table> [--limit <n>] [--where "campo=valor"] (Lista registros)
  db count <table> [--where "c=v"] (Total de registros)
  db analyze reports/storage    (Gera insights de volumetria de dados)

Tabelas válidas: users, reports, tickets, auditLogs, chatMessage, notification`;
        }
        if (command === 'sys') {
            return `=== [ MONITORAMENTO DE SISTEMA ] ===
Comandos de infraestrutura e status em tempo real.

[ MONITORAMENTO ]
  sys tail [--n <linhas>]      (Logs do servidor em tempo real)
  sys health                  (CPU, RAM, DB Status e Uptime)
  sys sessions                (Usuários ativos com Socket.IO)
  sys map                     (Arquitetura de rede e serviços)
  sys sniff [--filter <t>]    (Sniffer semântico HTTP/WebSockets)

[ CONFIGURAÇÃO CLIENTE ]
  sys config appearance --theme <dark|light|system> --density <compact|comfortable>
  sys config notifications --enabled <t|f> --desktop <t|f>
  sys config offline --clear   (Reseta DexieDB local)

[ SEGURANÇA ]
  sys scan [--host <ip>]      (Pentest: Varredura de portas de rede)`;
        }
        if (command === 'audit') {
            return `=== [ AUDITORIA E SEGURANÇA ] ===
Rastreamento de atividades administrativas.

  audit ls [--limit <num>]     (Últimos 100 eventos protegidos)
  audit security               (Filtra apenas falhas de segurança e escalação de cargos)`;
        }

        return `=== [ TERMINAL MISSION CONTROL ] ===
Digite 'help <comando>' para detalhes e flags.

📁 [ USUÁRIOS ]     user      (create, rm, edit, passwd, link, info)
📑 [ RELATÓRIOS ]   report    (rm --hard)
🗄️ [ DADOS ]        db        (ls, count, analyze)
⚡ [ SISTEMA ]      sys       (tail, health, sniff, config, scan, map)
🛡️ [ SEGURANÇA ]    audit     (ls, security)

🛠️ [ OUTROS ]
  clear     Limpa a tela do terminal
  exit      Fecha o terminal console`;
    }

    private static parseArgs(args: string[]): { parsed: Record<string, string>, raw: string[] } {
        const parsed: Record<string, string> = {};
        const raw: string[] = [];
        for (let i = 0; i < args.length; i++) {
            const currentArg = args[i];
            if (!currentArg) continue;

            if (currentArg.startsWith('--')) {
                const key = currentArg.replace('--', '');
                const nextArg = args[i + 1];
                const value = nextArg && !nextArg.startsWith('--') ? nextArg : 'true';
                parsed[key] = value;
                if (value !== 'true') i++; // Pulou o valor
            } else {
                raw.push(currentArg);
            }
        }
        return { parsed, raw };
    }

    private static async handleUserCommand(subCommand: string, args: string[]): Promise<TerminalOutput> {
        if (!subCommand) return { type: 'error', message: 'Uso incorreto. Ex: user create, user rm' };

        if (subCommand === 'rm') {
            const { parsed, raw } = this.parseArgs(args);
            const identifier = raw[0] || (parsed.force !== 'true' ? parsed.force : '');

            if (!identifier) return { type: 'error', message: 'Identificador (E-mail ou ID) obrigatório. Ex: user rm teste@flash.com' };

            const user = await prisma.user.findFirst({
                where: { OR: [{ email: identifier }, { id: identifier }] }
            });
            if (!user) return { type: 'error', message: `Usuário '${identifier}' não encontrado.` };

            await prisma.user.delete({ where: { id: user.id } });
            return { type: 'success', message: `Usuário '${user.email}' deletado com sucesso.` };
        }

        if (subCommand === 'info') {
            const { raw } = this.parseArgs(args);
            const identifier = raw[0];
            if (!identifier) return { type: 'error', message: 'Identificador (E-mail ou ID) obrigatório. Ex: user info 65f... ou user info email@doc.com' };

            const user = await prisma.user.findFirst({
                where: { OR: [{ email: identifier }, { id: identifier }] }
            });

            if (!user) return { type: 'error', message: `Usuário '${identifier}' não encontrado.` };

            const info = [
                `=== Informações do Usuário ===`,
                `ID:      ${user.id}`,
                `Nome:    ${user.name}`,
                `Email:   ${user.email}`,
                `Cargo:   ${user.role}`,
                `Criação: ${new Date(user.createdAt).toLocaleString('pt-BR')}`,
            ].join('\n');

            return { type: 'info', message: info };
        }

        const { parsed, raw } = this.parseArgs(args);

        const validUserFlags = ['name', 'email', 'password', 'role', 'new', 'to'];
        const unknownFlags = Object.keys(parsed).filter(k => !validUserFlags.includes(k));
        if (unknownFlags.length > 0) {
            return { type: 'error', message: `Argumento desconhecido: --${unknownFlags.join(', --')}` };
        }

        switch (subCommand) {
            case 'create': {
                if (raw.length > 0) {
                    return { type: 'error', message: `Comando malformado. Argumento inesperado: '${raw[0]}'. Use sempre formato de flag (ex: --name "João")` };
                }
                if (!parsed.name || !parsed.email || !parsed.password) {
                    return { type: 'error', message: 'Parâmetros ausentes: --name, --email, e --password são obrigatórios.' };
                }
                const existing = await prisma.user.findUnique({ where: { email: parsed.email } });
                if (existing) return { type: 'error', message: 'E-mail já está em uso.' };

                let validRole = 'PROFESSIONAL';
                if (parsed.role) {
                    const upperRole = parsed.role.toUpperCase();
                    if (!['ADMIN', 'PROFESSIONAL', 'SUPERVISOR', 'MANAGER'].includes(upperRole)) {
                        return { type: 'error', message: `Cargo inválido: ${parsed.role}. Valores válidos: ADMIN, PROFESSIONAL, SUPERVISOR, MANAGER.` };
                    }
                    validRole = upperRole;
                }

                const hashedPassword = await bcrypt.hash(parsed.password, 10);
                await prisma.user.create({
                    data: {
                        name: parsed.name,
                        email: parsed.email,
                        passwordHash: hashedPassword,
                        role: validRole as 'ADMIN' | 'PROFESSIONAL' | 'SUPERVISOR' | 'MANAGER'
                    }
                });
                return { type: 'success', message: `Usuário '${parsed.name}' (${parsed.email}) criado como ${validRole}.` };
            }
            case 'edit': {
                const { parsed, raw } = this.parseArgs(args);
                const identifier = raw[0];
                if (!identifier) return { type: 'error', message: 'Identificador (E-mail ou ID) é obrigatório. Ex: user edit alvo@flash.com ...' };

                const user = await prisma.user.findFirst({
                    where: { OR: [{ email: identifier }, { id: identifier }] }
                });
                if (!user) return { type: 'error', message: `Usuário '${identifier}' não encontrado.` };

                const dataToUpdate: any = {};
                if (parsed.name) dataToUpdate.name = parsed.name;

                if (parsed.role) {
                    const upperRole = parsed.role.toUpperCase();
                    if (!['ADMIN', 'PROFESSIONAL', 'SUPERVISOR', 'MANAGER'].includes(upperRole)) {
                        return { type: 'error', message: `Cargo inválido: ${parsed.role}. Valores válidos: ADMIN, PROFESSIONAL, SUPERVISOR, MANAGER.` };
                    }
                    dataToUpdate.role = upperRole as 'ADMIN' | 'PROFESSIONAL' | 'SUPERVISOR' | 'MANAGER';
                }

                if (Object.keys(dataToUpdate).length === 0) return { type: 'error', message: 'Nenhuma alteração passada (--name, --role)' };

                await prisma.user.update({
                    where: { id: user.id },
                    data: dataToUpdate
                });
                return { type: 'success', message: `Perfil do usuário '${user.email}' atualizado.` };
            }
            case 'passwd': {
                const { parsed, raw } = this.parseArgs(args);
                const identifier = raw[0];
                if (!identifier) return { type: 'error', message: 'Identificador (E-mail ou ID) é obrigatório. Ex: user passwd alvo@flash.com --new xyz' };
                if (!parsed.new) return { type: 'error', message: '--new senha é obrigatório.' };

                const user = await prisma.user.findFirst({
                    where: { OR: [{ email: identifier }, { id: identifier }] }
                });
                if (!user) return { type: 'error', message: `Usuário '${identifier}' não encontrado.` };

                const hashedPassword = await bcrypt.hash(parsed.new, 10);
                await prisma.user.update({
                    where: { id: user.id },
                    data: { passwordHash: hashedPassword }
                });
                return { type: 'success', message: `Senha de '${user.email}' atualizada com sucesso.` };
            }
            case 'link': {
                const { parsed, raw } = this.parseArgs(args);
                const proIdentifier = raw[0];
                if (!proIdentifier) return { type: 'error', message: 'Identificador do profissional (E-mail ou ID) é obrigatório.' };
                if (!parsed.to) return { type: 'error', message: '--to <email_super|id_super> é obrigatório.' };

                const professional = await prisma.user.findFirst({
                    where: { OR: [{ email: proIdentifier }, { id: proIdentifier }] }
                });
                if (!professional) return { type: 'error', message: `Profissional '${proIdentifier}' não encontrado.` };

                const supervisor = await prisma.user.findFirst({
                    where: {
                        AND: [
                            { OR: [{ email: parsed.to }, { id: parsed.to }] },
                            { role: 'SUPERVISOR' }
                        ]
                    }
                });
                if (!supervisor) {
                    return { type: 'error', message: `Supervisor '${parsed.to}' não encontrado ou não tem cargo SUPERVISOR.` };
                }

                await prisma.user.update({
                    where: { id: professional.id },
                    data: { supervisorId: supervisor.id }
                });
                return { type: 'success', message: `Profissional '${professional.email}' vinculado ao supervisor '${supervisor.name}' com sucesso.` };
            }
            default:
                return { type: 'error', message: `Sub-comando desconhecido: user ${subCommand}` };
        }
    }

    private static async handleReportCommand(subCommand: string, args: string[]): Promise<TerminalOutput> {
        if (subCommand === 'rm') {
            const { parsed, raw } = this.parseArgs(args);
            // Protocol ID can be in raw[0] (report rm E0012E --hard)
            // Or swallowed by parsed.hard (report rm --hard E0012E)
            let protocolId = raw[0];
            if (!protocolId && parsed.hard && parsed.hard !== 'true') {
                protocolId = parsed.hard;
            }

            if (!parsed.hard) return { type: 'error', message: 'Aviso de Segurança: Relatórios são cruciais. Para forçar a deleção definitiva, use a flag --hard. O argumento dever ser parte do protocolo.' };
            if (!protocolId) return { type: 'error', message: 'ID (Protocolo) é obrigatório. Ex: report rm ABC123FF --hard' };

            // Find the report that matches trailing ID loosely
            const reports = await prisma.report.findMany();
            const report = reports.find((r: any) => r.id.endsWith(protocolId.toLowerCase()) || r.id.endsWith(protocolId.toUpperCase()));

            if (!report) {
                return { type: 'error', message: `Protocolo contendo '${protocolId}' não foi encontrado.` };
            }

            // Excluir histórico associado
            await prisma.reportHistory.deleteMany({
                where: { reportId: report.id }
            });

            // Excluir anexos
            await prisma.media.deleteMany({
                where: { reportId: report.id }
            });

            // Excluir ticket
            await prisma.ticket.deleteMany({
                where: { protocol: report.id }
            });

            await prisma.report.delete({
                where: { id: report.id }
            });

            return { type: 'success', message: `Protocolo e todas as suas ramificações excluídos PERMANENTEMENTE.` };
        }
        return { type: 'error', message: `Sub-comando desconhecido: report ${subCommand}` };
    }

    private static async handleDbCommand(subCommand: string, args: string[]): Promise<TerminalOutput> {
        if (subCommand !== 'ls' && subCommand !== 'count' && subCommand !== 'analyze') {
            return { type: 'error', message: `Sub-comando desconhecido: db ${subCommand}. Use 'db ls', 'db count' ou 'db analyze'` };
        }

        const { parsed, raw } = this.parseArgs(args);
        const model = raw[0];
        if (!model) return { type: 'error', message: 'Especifique o que listar: users, reports, tickets, logs' };

        if (raw.length > 1) {
            return { type: 'error', message: `Comando malformado. Argumento solto inesperado: '${raw[1]}'. Use sempre as flags corretas (ex: --limit 8)` };
        }

        const validDbFlags = ['limit', 'where'];
        const unknownFlags = Object.keys(parsed).filter(k => !validDbFlags.includes(k));
        if (unknownFlags.length > 0) {
            return { type: 'error', message: `Flag desconhecida: --${unknownFlags.join(', --')}` };
        }

        const limitStr = parsed.limit || '5';
        const limit = parseInt(limitStr, 10);
        if (isNaN(limit)) return { type: 'error', message: 'O valor do limit deve ser numérico.' };

        let whereClause: any = {};
        if (parsed.where && typeof parsed.where === 'string') {
            const parts = parsed.where.split('=');
            if (parts.length === 2) {
                const [key, val] = [parts[0]!.trim(), parts[1]!.trim().replace(/^"|"$/g, '')];

                if (val === 'true') whereClause[key] = true;
                else if (val === 'false') whereClause[key] = false;
                else if (!isNaN(Number(val))) whereClause[key] = Number(val);
                else if (['SENT', 'IN_REVIEW', 'FORWARDED', 'RESOLVED'].includes(val.toUpperCase())) whereClause[key] = val.toUpperCase();
                else if (['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(val.toUpperCase())) whereClause[key] = val.toUpperCase();
                else if (['ADMIN', 'PROFESSIONAL', 'SUPERVISOR', 'MANAGER'].includes(val.toUpperCase())) whereClause[key] = val.toUpperCase();
                else whereClause[key] = val;
            } else {
                return { type: 'error', message: 'Formato inválido. Use --where "campo=valor"' };
            }
        }

        try {
            const hasWhere = Object.keys(whereClause).length > 0;
            const whereOpt = hasWhere ? whereClause : undefined;

            if (subCommand === 'analyze') {
                if (model.toLowerCase() === 'reports') {
                    const total = await prisma.report.count();
                    const sent = await prisma.report.count({ where: { status: 'SENT' } });
                    const inReview = await prisma.report.count({ where: { status: 'IN_REVIEW' } });
                    const forwarded = await prisma.report.count({ where: { status: 'FORWARDED' } });
                    const resolved = await prisma.report.count({ where: { status: 'RESOLVED' } });
                    const archived = await prisma.report.count({ where: { isArchived: true } });

                    const msg = [
                        `=== Análise de Relatórios ===`,
                        `Total: ${total}`,
                        `Enviados: ${sent}`,
                        `Em Análise: ${inReview}`,
                        `Encaminhados: ${forwarded}`,
                        `Resolvidos: ${resolved}`,
                        `Arquivados: ${archived}`,
                        `Taxa de Resolução: ${total > 0 ? ((resolved / total) * 100).toFixed(1) : 0}%`,
                    ].join('\n');
                    return { type: 'info', message: msg };
                }

                if (model.toLowerCase() === 'storage') {
                    const media = await prisma.media.findMany({ select: { bytes: true } });
                    const totalCount = media.length;
                    const totalBytes = media.reduce((acc: number, m: any) => acc + (m.bytes || 0), 0);
                    const totalMB = (totalBytes / 1024 / 1024).toFixed(2);

                    const msg = [
                        `=== Análise de Armazenamento ===`,
                        `Total de Arquivos: ${totalCount}`,
                        `Tamanho Total: ${totalMB} MB`,
                        `Média por Arquivo: ${totalCount > 0 ? (totalBytes / totalCount / 1024).toFixed(2) : 0} KB`,
                    ].join('\n');
                    return { type: 'info', message: msg };
                }

                return { type: 'error', message: `Análise não disponível para: ${model}. Tente reports ou storage.` };
            }

            if (subCommand === 'count') {
                let total = 0;
                switch (model.toLowerCase()) {
                    case 'users': total = await prisma.user.count({ where: whereOpt }); break;
                    case 'reports': total = await prisma.report.count({ where: whereOpt }); break;
                    case 'tickets': total = await prisma.ticket.count({ where: whereOpt }); break;
                    case 'logs': total = await prisma.reportHistory.count({ where: whereOpt }); break;
                    default: return { type: 'error', message: `Modelo desconhecido: ${model}.` };
                }
                const filterText = hasWhere ? ` com filtro ${JSON.stringify(whereClause)}` : '';
                return { type: 'info', message: `Total de ${model.toUpperCase()}${filterText}: ${total} registro(s).` };
            }

            // subCommand === 'ls'
            let data: any[] = [];
            switch (model.toLowerCase()) {
                case 'users':
                    data = await prisma.user.findMany({ where: whereOpt, select: { name: true, email: true, role: true }, take: limit, orderBy: { name: 'asc' } });
                    break;
                case 'reports':
                    data = await prisma.report.findMany({ where: whereOpt, select: { id: true, status: true, isArchived: true, createdAt: true }, take: limit, orderBy: { createdAt: 'desc' } });
                    break;
                case 'tickets':
                    data = await prisma.ticket.findMany({ where: whereOpt, select: { protocol: true, status: true, subject: true }, take: limit, orderBy: { createdAt: 'desc' } });
                    break;
                case 'logs':
                    data = await prisma.reportHistory.findMany({ where: whereOpt, select: { reportId: true, status: true, userName: true, createdAt: true }, take: limit, orderBy: { createdAt: 'desc' } });
                    break;
                default:
                    return { type: 'error', message: `Modelo desconhecido: ${model}. Tente users, reports, tickets, logs.` };
            }

            if (data.length === 0) {
                return { type: 'info', message: `Nenhum registro encontrado para '${model}'.` };
            }

            const header = `=== Listagem de ${model.toUpperCase()} (Max: ${limit}) ===`;
            const rows = data.map(item => JSON.stringify(item)).join('\n');
            return { type: 'info', message: `${header}\n${rows}` };
        } catch (error: any) {
            return { type: 'error', message: `Erro ao buscar dados: ${error.message}` };
        }
    }

    private static async handleSysCommand(subCommand: string, args: string[]): Promise<TerminalOutput> {
        const validSys = ['tail', 'health', 'sessions', 'map', 'scan', 'sniff', 'config'];
        if (!validSys.includes(subCommand)) {
            return { type: 'error', message: `Sub-comando desconhecido: sys ${subCommand}. Use 'sys tail', 'sys health', 'sys sessions', 'sys map', 'sys scan', 'sys sniff' ou 'sys config'.` };
        }

        const { parsed, raw } = this.parseArgs(args);

        if (subCommand === 'config') {
            const module = raw[0];
            if (!module) return { type: 'error', message: 'Uso: sys config <appearance|notifications|offline> [flags]' };

            if (module === 'appearance') {
                const theme = parsed.theme as 'light' | 'dark' | 'system' | undefined;
                const density = parsed.density as 'comfortable' | 'compact' | undefined;

                if (!theme && !density) return { type: 'error', message: 'Uso: sys config appearance --theme <dark|light|system> --density <compact|comfortable>' };

                return {
                    type: 'success',
                    message: `Configuração de aparência solicitada.`,
                    action: 'SET_APPEARANCE',
                    params: { theme, density }
                };
            }

            if (module === 'notifications') {
                const enabled = parsed.enabled ? parsed.enabled === 'true' : undefined;
                const desktop = parsed.desktop ? parsed.desktop === 'true' : undefined;

                if (enabled === undefined && desktop === undefined) return { type: 'error', message: 'Uso: sys config notifications --enabled <true|false> --desktop <true|false>' };

                return {
                    type: 'success',
                    message: `Configuração de notificações enviada ao cliente.`,
                    action: 'SET_NOTIFICATIONS',
                    params: { enabled, desktop }
                };
            }

            if (module === 'offline') {
                if (parsed.clear) {
                    return {
                        type: 'warning',
                        message: 'Solicitando limpeza de cache local (DexieDB) via Terminal...',
                        action: 'CLEAR_OFFLINE_CACHE'
                    };
                }
                return { type: 'error', message: 'Uso: sys config offline --clear' };
            }

            return { type: 'error', message: `Módulo de config desconhecido: ${module}` };
        }

        if (subCommand === 'sniff') {
            const limitStr = parsed.limit || '20';
            const filter = parsed.filter;
            const limit = parseInt(limitStr, 10);

            if (isNaN(limit)) {
                return { type: 'error', message: 'O limit precisa ser numérico.' };
            }

            const entries = NetworkSniffer.getEntries(limit, filter);
            if (entries.length === 0) {
                return { type: 'info', message: 'Nenhum tráfego capturado ainda.' };
            }

            const header = `=== Application Network Sniffer (Últimos ${entries.length} eventos) ===`;
            const lines = entries.map(e => {
                const time = (e.timestamp as any).toISOString().split('T')[1].split('.')[0];
                if (e.type === 'HTTP') {
                    const color = e.status && (e.status as number) >= 400 ? '🔴' : '🟢';
                    return `${color} [${time}] HTTP ${e.method} ${e.url} -> ${e.status} (${e.duration}ms)`;
                } else {
                    return `🔵 [${time}] WS   EVENT: ${e.event} | Payload: ${e.payload || 'empty'}`;
                }
            }).join('\n');

            return { type: 'info', message: `${header}\n${lines}` };
        }

        if (subCommand === 'scan') {
            const host = parsed.host || '127.0.0.1';
            const commonPorts = [
                { port: 80, service: 'HTTP (Web)' },
                { port: 443, service: 'HTTPS (SSL)' },
                { port: 5173, service: 'Flash Frontend (Vite)' },
                { port: 3000, service: 'Flash Backend (Bun)' },
                { port: 27017, service: 'MongoDB (Database)' },
                { port: 6379, service: 'Redis (Cache)' },
                { port: 5432, service: 'PostgreSQL' },
                { port: 3306, service: 'MySQL' },
                { port: 25, service: 'SMTP (Email)' }
            ];

            const checkPort = (port: number, service: string): Promise<string> => {
                return new Promise((resolve) => {
                    const socket = new net.Socket();
                    const start = Date.now();
                    socket.setTimeout(800);

                    socket.on('connect', () => {
                        const elapsed = Date.now() - start;
                        socket.destroy();
                        resolve(`[OPEN]   Port ${port.toString().padEnd(5)} | ${service.padEnd(22)} (${elapsed}ms)`);
                    });

                    socket.on('timeout', () => {
                        socket.destroy();
                        resolve(`[CLOSED] Port ${port.toString().padEnd(5)} | ${service.padEnd(22)} (Timeout)`);
                    });

                    socket.on('error', () => {
                        socket.destroy();
                        resolve(`[CLOSED] Port ${port.toString().padEnd(5)} | ${service.padEnd(22)} (Refused)`);
                    });

                    socket.connect(port, host);
                });
            };

            const results = await Promise.all(commonPorts.map(p => checkPort(p.port, p.service)));
            const header = `=== Infrastructure Port Scan: ${host} ===`;
            return { type: 'info', message: `${header}\n${results.join('\n')}\n\nScan concluído em tempo real.` };
        }

        if (subCommand === 'map') {
            const map = [
                `+-------------------------------------------------------------+`,
                `|                    FLASH OS SYSTEM MAP                      |`,
                `+-------------------------------------------------------------+`,
                `| [ USUÁRIO / BROWSER ] <---------> [ FRONTEND APP ]          |`,
                `|   (Chrome / Safari)              (React / Tailwind)         |`,
                `+-------------+---------------------------+-------------------+`,
                `              |                           ^                    `,
                `    HTTP/REST | (JSON API)                | WebSocket (Real-Time)`,
                `              v                           |                    `,
                `+-------------+---------------------------+-------------------+`,
                `| [ BACKEND SERVER ] (Bun Runtime - High Performance)         |`,
                `| - Express Engine & Auth Middleware                          |`,
                `| - Socket.io Gateway (Notificações & Chat)                   |`,
                `| - Terminal & Presence Service                               |`,
                `+-------------+---------------------------+-------------------+`,
                `              |                           |                    `,
                `      Prisma  | (ORM)                     | API Ext. (SDK)     `,
                `              v                           v                    `,
                `+-------------+-------------+  +----------+-------------------+`,
                `| [ DATABASE ]              |  | [ CLOUDINARY ]               |`,
                `| (MongoDB Atlas / Cloud)   |  | (Storage de Imagens/Vídeos)  |`,
                `+---------------------------+  +------------------------------+`,
                ``,
                `STATUS ATUAL: SISTEMA OPERACIONAL (Capa 1/4 Verificada)`
            ].join('\n');

            return { type: 'info', message: map };
        }

        if (subCommand === 'health') {
            const uptime = process.uptime();
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);

            const mem = process.memoryUsage();
            const rss = (mem.rss / 1024 / 1024).toFixed(2);
            const heapTotal = (mem.heapTotal / 1024 / 1024).toFixed(2);
            const heapUsed = (mem.heapUsed / 1024 / 1024).toFixed(2);

            const start = Date.now();
            let dbStatus = 'ONLINE';
            let dbLatency = 0;
            try {
                await prisma.$runCommandRaw({ ping: 1 });
                dbLatency = Date.now() - start;
            } catch (err) {
                dbStatus = 'OFFline';
            }

            // @ts-ignore - Bun global
            const bunVersion = typeof Bun !== 'undefined' ? `Bun ${Bun.version}` : `Node ${process.version}`;

            const message = [
                `=== FlashOS System Health ===`,
                `Runtime: ${bunVersion}`,
                `Uptime: ${hours}h ${minutes}m ${seconds}s`,
                `RAM (RSS): ${rss} MB`,
                `Heap (Used/Total): ${heapUsed} MB / ${heapTotal} MB`,
                `CPU Arch: ${os.arch()}`,
                `OS Platform: ${os.platform()}`,
                `Database: ${dbStatus} (${dbLatency}ms)`,
            ].join('\n');

            return { type: 'info', message };
        }

        if (subCommand === 'sessions') {
            const users = presenceService.getOnlineUsers();
            if (users.length === 0) {
                return { type: 'info', message: 'Nenhum usuário online no momento.' };
            }

            const header = `=== Usuários Online (${users.length}) ===`;
            const lines = users.map(u =>
                `[${u.role}] ${u.name.padEnd(20)} | ID: ${u.userId}`
            ).join('\n');

            return { type: 'info', message: `${header}\n${lines}` };
        }

        if (subCommand !== 'tail') {
            return { type: 'error', message: `Sub-comando desconhecido: sys ${subCommand}. Use 'sys tail'.` };
        }

        if (raw.length > 0) {
            return { type: 'error', message: `Argumento solto inesperado: '${raw[0]}'. Use formato de flag (--limit).` };
        }

        const limitStr = parsed.limit || '20';
        const limit = parseInt(limitStr, 10);

        if (isNaN(limit)) {
            return { type: 'error', message: 'O limit precisa ser numérico.' };
        }

        const logs = TerminalLogger.getLogs(limit);
        if (logs.length === 0) {
            return { type: 'info', message: 'Nenhum log gravado em memória ainda.' };
        }

        const header = `=== Últimos ${limit} logs do Servidor NodeJS ===`;
        const lines = logs.map(l => {
            const time = new Date(l.timestamp).toISOString().split('T')[1]?.split('.')[0];
            return `[${time}] [${l.level.toUpperCase()}] ${l.message}`;
        }).join('\n');

        return { type: 'info', message: `${header}\n${lines}` };
    }

    private static async handleAuditCommand(subCommand: string, args: string[]): Promise<TerminalOutput> {
        if (subCommand !== 'ls' && subCommand !== 'security') {
            return { type: 'error', message: `Sub-comando desconhecido: audit ${subCommand}. Use 'audit ls' ou 'audit security'.` };
        }

        const { parsed, raw } = this.parseArgs(args);
        const limitStr = parsed.limit || '20';
        const limit = parseInt(limitStr, 10);

        if (isNaN(limit)) {
            return { type: 'error', message: 'O limit precisa ser numérico.' };
        }

        try {
            let whereClause: any = {};
            if (subCommand === 'security') {
                whereClause = {
                    OR: [
                        { action: { contains: 'FAIL' } },
                        { action: { contains: 'DELETE' } },
                        { action: { contains: 'PASSWD' } },
                        { action: 'UNAUTHORIZED_ACCESS' }
                    ]
                };
            }

            const logs = await prisma.auditLog.findMany({
                where: whereClause,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { name: true } } }
            });

            if (logs.length === 0) {
                return { type: 'info', message: 'Nenhum log de auditoria encontrado.' };
            }

            const header = `=== Audit Logs (${subCommand.toUpperCase()}) ===`;
            const lines = logs.map(l => {
                const time = l.createdAt.toISOString().replace('T', ' ').split('.')[0];
                const user = l.user?.name || 'Sistema';
                return `[${time}] [${l.action}] By: ${user} | Target: ${l.target || 'N/A'}`;
            }).join('\n');

            return { type: 'info', message: `${header}\n${lines}` };
        } catch (error: any) {
            return { type: 'error', message: `Erro ao consultar auditoria: ${error.message}` };
        }
    }
}
