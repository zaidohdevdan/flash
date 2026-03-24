import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import { ProfessionalHeader, NewReportForm, SuccessView } from '../../components/domain/professional';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/db';

export function NewReport() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [comment, setComment] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);

    function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length > 0) {
            const newFiles = [...files, ...selectedFiles].slice(0, 10);
            setFiles(newFiles);
            const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
            setPreviews([...previews, ...newPreviews].slice(0, 10));
        }
    }

    function handleRemoveFile(index: number) {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (files.length === 0) return toast.error('Por favor, anexe pelo menos um arquivo ou foto.');

        setSending(true);

        try {
            if (!navigator.onLine) {
                if (files.length > 0) {
                    await db.pendingReports.add({
                        comment,
                        imageBlob: files[0], // Mantido como imageBlob por compatibilidade com o DB local, mas aceita qualquer arquivo
                        previewUrl: previews[0]!,
                        createdAt: Date.now(),
                        status: 'pending'
                    });

                    setSuccess(true);
                    setComment('');
                    setFiles([]);
                    setPreviews([]);
                    toast.success('Relatório salvo localmente! Será enviado assim que houver internet.', {
                        icon: '💾',
                        duration: 5000
                    });
                }
                return;
            }

            const uploadPromises = files.map(async (file) => {
                const cloudinaryData = new FormData();
                cloudinaryData.append('file', file);
                cloudinaryData.append('upload_preset', 'flash_preset');

                // Usamos 'auto' para que o Cloudinary identifique se é imagem, vídeo ou raw (pdf, doc, etc)
                const cloudinaryRes = await fetch('https://api.cloudinary.com/v1_1/dfr8mjlnb/auto/upload', {
                    method: 'POST',
                    body: cloudinaryData
                });

                if (!cloudinaryRes.ok) throw new Error('Falha no upload do arquivo');
                return cloudinaryRes.json();
            });

            const cloudinaryResults = await Promise.all(uploadPromises);
            
            // Procura a primeira imagem para ser o thumbnail principal, se não houver, usa o primeiro arquivo
            const firstImage = cloudinaryResults.find(res => res.resource_type === 'image');
            const mainImageUrl = firstImage ? firstImage.secure_url : cloudinaryResults[0].secure_url;

            const mediaItems = cloudinaryResults.map(res => ({
                publicId: res.public_id,
                url: res.url,
                secureUrl: res.secure_url,
                format: res.format || (res.resource_type === 'raw' ? res.public_id.split('.').pop() : ''),
                width: res.width,
                height: res.height,
                bytes: res.bytes,
                resourceType: res.resource_type
            }));

            const reportData = {
                comment,
                imageUrl: mainImageUrl,
                mediaItems: mediaItems,
                latitude: undefined as string | undefined,
                longitude: undefined as string | undefined
            };

            try {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 1000 * 60 * 5
                    });
                });
                reportData.latitude = position.coords.latitude.toString();
                reportData.longitude = position.coords.longitude.toString();
            } catch (error) {
                console.warn('GPS unavailable:', error);
            }

            await api.post('/reports', reportData);

            setSuccess(true);
            setComment('');
            setFiles([]);
            setPreviews([]);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao enviar relatório. Tentaremos novamente depois.');
        } finally {
            setSending(false);
        }
    }

    if (success) {
        return <SuccessView onBack={() => navigate('/dashboard/overview')} />;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-5 duration-700 pb-24 px-4 sm:px-6">
            <div className="flex items-center justify-between mb-4 sm:mb-2 mt-4">
                <ProfessionalHeader
                    userName={user?.name || 'Profissional'}
                    isConnected={navigator.onLine}
                />
            </div>

            <NewReportForm
                comment={comment}
                onCommentChange={setComment}
                files={files}
                previews={previews}
                onFilesChange={handleFilesChange}
                onRemoveFile={handleRemoveFile}
                onSubmit={handleSubmit}
                isSending={sending}
            />
        </div>
    );
}
