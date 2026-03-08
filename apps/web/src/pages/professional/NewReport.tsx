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
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);

    function handleImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            const newImages = [...images, ...files];
            setImages(newImages);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviews([...previews, ...newPreviews]);
        }
    }

    function handleRemoveImage(index: number) {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (images.length === 0) return toast.error('Por favor, tire uma foto para o relatório.');

        setSending(true);

        try {
            if (!navigator.onLine) {
                if (images.length > 0) {
                    await db.pendingReports.add({
                        comment,
                        imageBlob: images[0],
                        previewUrl: previews[0]!,
                        createdAt: Date.now(),
                        status: 'pending'
                    });

                    setSuccess(true);
                    setComment('');
                    setImages([]);
                    setPreviews([]);
                    toast.success('Relatório salvo localmente! Será enviado assim que houver internet.', {
                        icon: '💾',
                        duration: 5000
                    });
                }
                return;
            }

            const uploadPromises = images.map(async (img) => {
                const cloudinaryData = new FormData();
                cloudinaryData.append('file', img);
                cloudinaryData.append('upload_preset', 'flash_preset');

                const cloudinaryRes = await fetch('https://api.cloudinary.com/v1_1/dfr8mjlnb/image/upload', {
                    method: 'POST',
                    body: cloudinaryData
                });

                if (!cloudinaryRes.ok) throw new Error('Falha no upload da imagem');
                return cloudinaryRes.json();
            });

            const cloudinaryResults = await Promise.all(uploadPromises);
            const mainImageUrl = cloudinaryResults[0].secure_url;

            const mediaItems = cloudinaryResults.map(res => ({
                publicId: res.public_id,
                url: res.url,
                secureUrl: res.secure_url,
                format: res.format,
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
            setImages([]);
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
                previews={previews}
                onImagesChange={handleImagesChange}
                onRemoveImage={handleRemoveImage}
                onSubmit={handleSubmit}
                isSending={sending}
            />
        </div>
    );
}
