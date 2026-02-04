import React, { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon,
    Clock as ClockIcon,
    StickyNote,
    Plus,
    X,
    ChevronLeft,
    ChevronRight,
    Search,
    Video,
    Forward,
    CheckCircle2,
    Trash2,
    Loader2,
    Users,
    Check
} from 'lucide-react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Modal, Button, GlassCard, Avatar } from '../../ui';
import { api } from '../../../services/api';
import { toast } from 'react-hot-toast';
import type { UserContact, AgendaEvent, AgendaEventType } from '../../../types';

interface AgendaModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AgendaModal: React.FC<AgendaModalProps> = ({ isOpen, onClose }) => {
    // State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState<AgendaEvent[]>([]);
    const [contacts, setContacts] = useState<UserContact[]>([]);
    const [note, setNote] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSavingNote, setIsSavingNote] = useState(false);
    const [isCreatingEvent, setIsCreatingEvent] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // New Event Form
    const [eventTitle, setEventTitle] = useState('');
    const [eventType, setEventType] = useState<AgendaEventType>('TASK');
    const [eventStartTime, setEventStartTime] = useState('09:00');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

    // Effects
    useEffect(() => {
        if (isOpen) {
            loadInitialData();
            const timer = setInterval(() => setCurrentTime(new Date()), 1000);
            return () => clearInterval(timer);
        }
    }, [isOpen]);

    const loadInitialData = async () => {
        setIsLoading(true);
        try {
            const [eventsRes, contactsRes, noteRes] = await Promise.all([
                api.get('/agenda'),
                api.get('/agenda/contacts'),
                api.get('/agenda/note')
            ]);
            setEvents(eventsRes.data);
            setContacts(contactsRes.data);
            setNote(noteRes.data.content || '');
        } catch (error) {
            toast.error('Erro ao carregar dados da agenda');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveNote = async () => {
        setIsSavingNote(true);
        try {
            await api.post('/agenda/note', { content: note });
            toast.success('Nota salva');
        } catch (error) {
            toast.error('Erro ao salvar nota');
        } finally {
            setIsSavingNote(false);
        }
    };

    const handleCreateEvent = async () => {
        if (!eventTitle) return toast.error('Título é obrigatório');

        const [hours, minutes] = eventStartTime.split(':').map(Number);
        const startTime = new Date(selectedDate);
        startTime.setHours(hours || 0, minutes || 0, 0, 0);

        if (startTime < new Date()) {
            return toast.error('Não é possível marcar agendamentos no passado');
        }

        try {
            const res = await api.post('/agenda', {
                title: eventTitle,
                type: eventType,
                startTime: startTime.toISOString(),
                participantIds: selectedParticipants,
            });
            setEvents([...events, res.data]);
            setIsCreatingEvent(false);
            setEventTitle('');
            setSelectedParticipants([]);
            toast.success('Evento agendado!');
        } catch (error: any) {
            const msg = error.response?.data?.error || 'Erro ao criar evento';
            toast.error(msg);
        }
    };

    const handleDeleteEvent = async (id: string) => {
        try {
            await api.delete(`/agenda/${id}`);
            setEvents(events.filter(e => e.id !== id));
            toast.success('Evento removido');
        } catch (error) {
            toast.error('Erro ao remover evento');
        }
    };

    const isPastSelection = () => {
        const [hours, minutes] = eventStartTime.split(':').map(Number);
        const startTime = new Date(selectedDate);
        startTime.setHours(hours || 0, minutes || 0, 0, 0);
        return startTime < new Date();
    };

    // Calendar Logic
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const selectedDayEvents = events.filter(e => isSameDay(new Date(e.startTime), selectedDate));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Agenda do Supervisor"
            maxWidth="6xl"
        >
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-[600px] gap-4">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest animate-pulse">Carregando Agenda...</p>
                </div>
            ) : isCreatingEvent ? (
                <div className="flex flex-col h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Novo Agendamento</h3>
                            <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}</p>
                        </div>
                        <button onClick={() => setIsCreatingEvent(false)} className="p-2 hover:bg-gray-100 rounded-2xl transition-all">
                            <X className="w-6 h-6 text-gray-400" />
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">
                        {/* Form Side */}
                        <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Informações Básicas</label>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        autoFocus
                                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-black text-gray-900 focus:bg-white focus:border-blue-500/20 outline-none transition-all placeholder:text-gray-400"
                                        placeholder="Título do Evento (ex: Reunião Técnica)"
                                        value={eventTitle}
                                        onChange={(e) => setEventTitle(e.target.value)}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Horário de Início</span>
                                            <input
                                                type="time"
                                                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-black text-gray-900 focus:bg-white focus:border-blue-500/20 outline-none transition-all"
                                                value={eventStartTime}
                                                onChange={(e) => setEventStartTime(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Tipo de Evento</span>
                                            <select
                                                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-black text-gray-900 focus:bg-white focus:border-blue-500/20 outline-none transition-all appearance-none cursor-pointer"
                                                value={eventType}
                                                onChange={(e) => setEventType(e.target.value as AgendaEventType)}
                                            >
                                                <option value="TASK">Tarefa Geral</option>
                                                <option value="CONFERENCE">Videoconferência</option>
                                                <option value="FORWARDING">Encaminhamento</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
                                    Confirmados ({selectedParticipants.length})
                                </label>
                                <div className="bg-blue-50/50 rounded-3xl p-6 border-2 border-dashed border-blue-100 min-h-[160px]">
                                    <div className="flex flex-wrap gap-3">
                                        {selectedParticipants.map(pid => {
                                            const c = contacts.find(x => x.id === pid);
                                            return c ? (
                                                <div key={pid} className="flex items-center gap-2 bg-white pl-1.5 pr-3 py-1.5 rounded-2xl border border-blue-200/50 shadow-sm animate-in zoom-in-50">
                                                    <Avatar src={c.avatarUrl} size="sm" />
                                                    <span className="text-[11px] font-black text-gray-900">{c.name}</span>
                                                    <button
                                                        onClick={() => setSelectedParticipants(prev => prev.filter(x => x !== pid))}
                                                        className="ml-1 p-1 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ) : null;
                                        })}
                                        {selectedParticipants.length === 0 && (
                                            <div className="flex flex-col items-center justify-center w-full py-4 text-blue-300">
                                                <Users className="w-8 h-8 mb-2 opacity-20" />
                                                <p className="text-[10px] font-black uppercase tracking-widest">Selecione pessoas na lista ao lado</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button variant="secondary" size="lg" className="flex-1 !rounded-2xl" onClick={() => setIsCreatingEvent(false)}>
                                    Escolher Outra Data
                                </Button>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="flex-[2] !rounded-2xl shadow-xl shadow-blue-500/20"
                                    onClick={handleCreateEvent}
                                    disabled={!eventTitle || selectedParticipants.length === 0 || isPastSelection()}
                                >
                                    Confirmar Agendamento
                                </Button>
                            </div>
                            {isPastSelection() && (
                                <p className="text-[10px] text-red-500 font-black uppercase tracking-widest text-center mt-2 animate-pulse">
                                    ⚠️ Não é possível agendar no passado
                                </p>
                            )}
                        </div>

                        {/* List Side */}
                        <div className="w-full lg:w-[360px] flex flex-col gap-4 bg-gray-50/50 rounded-[2.5rem] p-5 border border-gray-100">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nome ou papel..."
                                    className="w-full bg-white border-transparent border-2 rounded-2xl pl-12 pr-4 py-4 text-sm font-black text-gray-900 focus:border-blue-500/10 outline-none transition-all placeholder:text-gray-400"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                {contacts
                                    .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.role.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map(contact => {
                                        const isSelected = selectedParticipants.includes(contact.id);
                                        return (
                                            <button
                                                key={contact.id}
                                                onClick={() => {
                                                    setSelectedParticipants(prev =>
                                                        isSelected ? prev.filter(id => id !== contact.id) : [...prev, contact.id]
                                                    );
                                                }}
                                                className={`
                                                    w-full flex items-center justify-between p-3 rounded-2xl transition-all border-2
                                                    ${isSelected ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-[0.98]' : 'bg-white border-transparent hover:border-blue-100'}
                                                `}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Avatar src={contact.avatarUrl} size="md" />
                                                    <div className="text-left">
                                                        <p className="text-xs font-black leading-none mb-1">{contact.name}</p>
                                                        <p className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                                                            {contact.role}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-white text-blue-600' : 'bg-gray-100 text-gray-300'}`}>
                                                    {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                                </div>
                                            </button>
                                        );
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
                    {/* Col 1: Calendar & Events */}
                    <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                        <GlassCard variant="light" className="p-4 bg-white/40">
                            {/* Calendar Header */}
                            <div className="flex justify-between items-center mb-6 px-2">
                                <h3 className="font-black text-gray-900 uppercase tracking-tighter text-lg">
                                    {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                                </h3>
                                <div className="flex gap-1">
                                    <button onClick={prevMonth} className="p-1.5 hover:bg-white/60 rounded-lg transition-colors">
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button onClick={nextMonth} className="p-1.5 hover:bg-white/60 rounded-lg transition-colors">
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                                    <div key={day} className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest pb-2">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {calendarDays.map((day, idx) => {
                                    const isCurrentMonth = isSameMonth(day, monthStart);
                                    const isSel = isSameDay(day, selectedDate);
                                    const isTod = isToday(day);
                                    const hasEvents = events.some(e => isSameDay(new Date(e.startTime), day));

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedDate(day)}
                                            className={`
                                                relative h-10 flex flex-col items-center justify-center rounded-xl text-sm font-bold transition-all
                                                ${!isCurrentMonth ? 'text-gray-300 opacity-20' : 'text-gray-700'}
                                                ${isSel ? 'bg-blue-600 !text-white shadow-lg shadow-blue-500/30 scale-105 z-10' : 'hover:bg-white/60'}
                                                ${isTod && !isSel ? 'text-blue-600 !font-black' : ''}
                                            `}
                                        >
                                            {format(day, 'd')}
                                            {hasEvents && !isSel && (
                                                <span className="absolute bottom-1.5 w-1 h-1 bg-blue-500 rounded-full" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </GlassCard>

                        {/* Events for selected day */}
                        <div className="flex-1 overflow-y-auto pr-1">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest pl-1">
                                    Compromissos • {format(selectedDate, "dd 'de' MMM", { locale: ptBR })}
                                </h4>
                                <button
                                    onClick={() => setIsCreatingEvent(true)}
                                    className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-tighter bg-blue-50 px-2 py-1 rounded-lg transition-all"
                                >
                                    <Plus className="w-3 h-3" /> Agendar
                                </button>
                            </div>

                            <div className="space-y-2">
                                {selectedDayEvents.length > 0 ? (
                                    selectedDayEvents.map(event => (
                                        <GlassCard key={event.id} variant="light" className="p-3 !rounded-2xl border-white/40 flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-xl bg-opacity-10 
                                                    ${event.type === 'CONFERENCE' ? 'bg-red-500 text-red-600' :
                                                        event.type === 'FORWARDING' ? 'bg-emerald-500 text-emerald-600' :
                                                            'bg-blue-500 text-blue-600'}
                                                `}>
                                                    {event.type === 'CONFERENCE' ? <Video className="w-4 h-4" /> :
                                                        event.type === 'FORWARDING' ? <Forward className="w-4 h-4" /> :
                                                            <CheckCircle2 className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900 leading-none">{event.title}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">
                                                        {format(new Date(event.startTime), 'HH:mm')} • {event.participants.length} Participantes
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteEvent(event.id)}
                                                className="p-2 text-gray-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </GlassCard>
                                    ))
                                ) : (
                                    <div className="text-center py-8 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                                        <CalendarIcon className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Nenhum evento</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Col 2: Actions & Tools */}
                    <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-hidden">
                        {/* Clock & Quick Summary */}
                        <GlassCard variant="dark" className="p-4 !bg-[#0f172a] shadow-2xl overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/30 transition-all duration-700" />
                            <div className="relative z-10 flex flex-col items-center">
                                <ClockIcon className="w-4 h-4 text-blue-400 mb-2 animate-pulse" />
                                <h2 className="text-4xl font-black text-white tracking-tighter mb-1">
                                    {format(currentTime, 'HH:mm')}
                                    <span className="text-xl text-blue-500 ml-1 opacity-80">{format(currentTime, 'ss')}</span>
                                </h2>
                                <p className="text-[10px] text-blue-300 font-black uppercase tracking-[0.2em] opacity-60">
                                    {format(currentTime, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                                </p>
                            </div>
                        </GlassCard>

                        {/* Bloco de Notas */}
                        <div className="flex-1 flex flex-col gap-3 min-h-[300px]">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 mt-2">
                                Bloco de Notas
                            </h4>
                            <div className="flex-1 flex flex-col group">
                                <textarea
                                    className="flex-1 bg-yellow-50/30 border-2 border-dashed border-yellow-200/50 rounded-3xl p-4 text-sm font-black text-gray-900 focus:bg-yellow-50/50 focus:border-yellow-300 outline-none transition-all resize-none placeholder:text-yellow-900/30"
                                    placeholder="Anote algo rápido aqui..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                                <div className="flex justify-end mt-2">
                                    <button
                                        onClick={handleSaveNote}
                                        disabled={isSavingNote}
                                        className="text-[10px] font-black text-yellow-600 uppercase tracking-widest hover:bg-yellow-100 px-3 py-1.5 rounded-lg transition-all flex items-center gap-2"
                                    >
                                        {isSavingNote ? <Loader2 className="w-3 h-3 animate-spin" /> : <StickyNote className="w-3 h-3" />}
                                        Salvar Nota
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};
