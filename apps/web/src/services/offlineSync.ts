import { db } from './db';
import { api } from './api';
import { toast } from 'react-hot-toast';

export async function syncPendingReports() {
    const pending = await db.pendingReports.where('status').equals('pending').toArray();

    if (pending.length === 0) return;

    console.log(`[OfflineSync] Tentando sincronizar ${pending.length} relatórios...`);

    for (const report of pending) {
        try {
            // 1. Marcar como sincronizando para evitar duplicidade
            await db.pendingReports.update(report.id!, { status: 'syncing' });

            // 2. Upload da imagem para o Cloudinary (precisa de internet aqui)
            const cloudinaryData = new FormData();
            cloudinaryData.append('file', report.imageBlob);
            cloudinaryData.append('upload_preset', 'flash_preset');

            const cloudinaryRes = await fetch('https://api.cloudinary.com/v1_1/dfr8mjlnb/image/upload', {
                method: 'POST',
                body: cloudinaryData
            });

            if (!cloudinaryRes.ok) throw new Error('Falha no upload da imagem (Cloudinary)');

            const cloudinaryJson = await cloudinaryRes.json();
            const imageUrl = cloudinaryJson.secure_url;

            // 3. Enviar para o backend
            await api.post('/reports', {
                comment: report.comment,
                imageUrl,
                createdAt: new Date(report.createdAt).toISOString()
            });

            // 4. Se deu tudo certo, remove do banco local
            await db.pendingReports.delete(report.id!);

            toast.success('Relatório offline sincronizado com sucesso!', {
                icon: '☁️',
                duration: 4000
            });

        } catch (error) {
            console.error('[OfflineSync] Erro ao sincronizar relatório:', error);
            await db.pendingReports.update(report.id!, { status: 'pending' }); // Volta para o estado inicial
        }
    }
}
