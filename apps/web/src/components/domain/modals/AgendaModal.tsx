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
import { Modal, Button, Card, Avatar } from '../../ui';
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
            console.error(error);
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
            console.error(error);
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
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            const msg = err.response?.data?.error || 'Erro ao criar evento';
            toast.error(msg);
        }
    };

    const handleDeleteEvent = async (id: string) => {
        try {
            await api.delete(`/agenda/${id}`);
            setEvents(events.filter(e => e.id !== id));
            toast.success('Evento removido');
        } catch {
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
                    <Loader2 className="w-12 h-12 text-[var(--accent-primary)] animate-spin" />
                    <p className="text-sm font-bold text-[var(--text-tertiary)] uppercase tracking-widest animate-pulse">Carregando Agenda...</p>
                </div>
            ) : isCreatingEvent ? (
                <div className="flex flex-col h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-[var(--text-primary)] uppercase tracking-tight">Novo Agendamento</h3>
                            <p className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-widest">{format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}</p>
                        </div>
                        <button type="button" onClick={() => setIsCreatingEvent(false)} className="p-2 hover:bg-[var(--bg-secondary)] rounded-xl transition-all" title="Fechar novo agendamento" aria-label="Fechar novo agendamento">
                            <X className="w-6 h-6 text-[var(--text-secondary)] hover:text-[var(--error)]" />
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">
                        {/* Form Side */}
                        <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest pl-1">Informações Básicas</label>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        autoFocus
                                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm font-medium text-[var(--text-primary)] focus:bg-white focus:border-[var(--accent-secondary)] outline-none transition-all placeholder:text-[var(--text-tertiary)]"
                                        placeholder="Título do Evento (ex: Reunião Técnica)"
                                        value={eventTitle}
                                        onChange={(e) => setEventTitle(e.target.value)}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">Horário de Início</span>
                                            <input
                                                type="time"
                                                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm font-medium text-[var(--text-primary)] focus:bg-white focus:border-[var(--accent-secondary)] outline-none transition-all"
                                                value={eventStartTime}
                                                onChange={(e) => setEventStartTime(e.target.value)}
                                                title="Horário de Início"
                                                aria-label="Horário de Início"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest ml-1">Tipo de Evento</span>
                                            <select
                                                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm font-medium text-[var(--text-primary)] focus:bg-white focus:border-[var(--accent-secondary)] outline-none transition-all appearance-none cursor-pointer"
                                                value={eventType}
                                                onChange={(e) => setEventType(e.target.value as AgendaEventType)}
                                                title="Tipo de Evento"
                                                aria-label="Tipo de Evento"
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
                                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest pl-1">
                                    Confirmados ({selectedParticipants.length})
                                </label>
                                <div className="bg-[var(--bg-secondary)] rounded-2xl p-6 border border-dashed border-[var(--border-medium)] min-h-[160px]">
                                    <div className="flex flex-wrap gap-3">
                                        {selectedParticipants.map(pid => {
                                            const c = contacts.find(x => x.id === pid);
                                            return c ? (
                                                <div key={pid} className="flex items-center gap-2 bg-white pl-1.5 pr-3 py-1.5 rounded-xl border border-[var(--border-subtle)] shadow-sm animate-in zoom-in-50">
                                                    <Avatar src={c.avatarUrl} size="sm" />
                                                    <span className="text-[11px] font-bold text-[var(--text-primary)]">{c.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedParticipants(prev => prev.filter(x => x !== pid))}
                                                        className="ml-1 p-1 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all text-[var(--text-tertiary)]"
                                                        title="Remover participante"
                                                        aria-label="Remover participante"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ) : null;
                                        })}
                                        {selectedParticipants.length === 0 && (
                                            <div className="flex flex-col items-center justify-center w-full py-4 text-[var(--text-tertiary)]">
                                                <Users className="w-8 h-8 mb-2 opacity-50" />
                                                <p className="text-[10px] font-bold uppercase tracking-widest">Selecione pessoas na lista ao lado</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button type="button" variant="ghost" size="lg" className="flex-1" onClick={() => setIsCreatingEvent(false)}>
                                    Escolher Outra Data
                                </Button>
                                <Button
                                    type="button"
                                    variant="primary"
                                    size="lg"
                                    className="flex-[2] shadow-lg shadow-[var(--accent-primary)]/20"
                                    onClick={handleCreateEvent}
                                    disabled={!eventTitle || selectedParticipants.length === 0 || isPastSelection()}
                                >
                                    Confirmar Agendamento
                                </Button>
                            </div>
                            {isPastSelection() && (
                                <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest text-center mt-2 animate-pulse">
                                    ⚠️ Não é possível agendar no passado
                                </p>
                            )}
                        </div>

                        {/* List Side */}
                        <div className="w-full lg:w-[360px] flex flex-col gap-4 bg-[var(--bg-secondary)] rounded-3xl p-5 border border-[var(--border-subtle)]">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nome ou papel..."
                                    className="w-full bg-white border border-[var(--border-subtle)] rounded-xl pl-12 pr-4 py-3 text-sm font-medium text-[var(--text-primary)] focus:border-[var(--accent-secondary)] outline-none transition-all placeholder:text-[var(--text-tertiary)]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    aria-label="Filtrar contatos"
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                {contacts
                                    .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.role.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map(contact => {
                                        const isSelected = selectedParticipants.includes(contact.id);
                                        return (
                                            <button
                                                type="button"
                                                key={contact.id}
                                                onClick={() => {
                                                    setSelectedParticipants(prev =>
                                                        isSelected ? prev.filter(id => id !== contact.id) : [...prev, contact.id]
                                                    );
                                                }}
                                                className={`
                                                    w-full flex items-center justify-between p-3 rounded-xl transition-all border
                                                    ${isSelected ? 'bg-[var(--accent-primary)] border-[var(--accent-secondary)] text-[var(--accent-text)] shadow-sm' : 'bg-white border-transparent hover:border-[var(--border-subtle)] text-[var(--text-secondary)]'}
                                                `}
                                                title={`Selecionar ${contact.name}`}
                                                aria-label={`Selecionar ${contact.name}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Avatar src={contact.avatarUrl} size="md" />
                                                    <div className="text-left">
                                                        <p className="text-xs font-bold leading-none mb-1">{contact.name}</p>
                                                        <p className={`text-[9px] font-bold uppercase tracking-widest ${isSelected ? 'text-[var(--accent-text)] opacity-70' : 'text-[var(--text-tertiary)]'}`}>
                                                            {contact.role}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-white text-[var(--accent-text)]' : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'}`}>
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
                        <Card className="p-4 bg-white border border-[var(--border-subtle)] shadow-sm">
                            {/* Calendar Header */}
                            <div className="flex justify-between items-center mb-6 px-2">
                                <h3 className="font-bold text-[var(--text-primary)] uppercase tracking-tight text-lg">
                                    {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                                </h3>
                                <div className="flex gap-1">
                                    <button type="button" onClick={prevMonth} className="p-1.5 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors text-[var(--text-tertiary)] hover:text-[var(--text-primary)]" title="Mês anterior" aria-label="Mês anterior">
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button type="button" onClick={nextMonth} className="p-1.5 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors text-[var(--text-tertiary)] hover:text-[var(--text-primary)]" title="Próximo mês" aria-label="Próximo mês">
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                                    <div key={day} className="text-center text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest pb-2">
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
                                            type="button"
                                            key={idx}
                                            onClick={() => setSelectedDate(day)}
                                            className={`
                                                relative h-10 flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all
                                                ${!isCurrentMonth ? 'text-[var(--text-tertiary)] opacity-40' : 'text-[var(--text-secondary)]'}
                                                ${isSel ? 'bg-[var(--accent-primary)] !text-[var(--accent-text)] shadow-sm font-bold scale-105 z-10' : 'hover:bg-[var(--bg-secondary)]'}
                                                ${isTod && !isSel ? 'text-[var(--accent-secondary)] !font-bold' : ''}
                                            `}
                                            title={`Selecionar ${format(day, 'dd/MM/yyyy')}`}
                                            aria-label={`Selecionar ${format(day, 'dd/MM/yyyy')}`}
                                        >
                                            {format(day, 'd')}
                                            {hasEvents && !isSel && (
                                                <span className="absolute bottom-1.5 w-1 h-1 bg-[var(--accent-secondary)] rounded-full" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </Card>

                        {/* Events for selected day */}
                        <div className="flex-1 overflow-y-auto pr-1">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest pl-1">
                                    Compromissos • {format(selectedDate, "dd 'de' MMM", { locale: ptBR })}
                                </h4>
                                <button
                                    type="button"
                                    onClick={() => setIsCreatingEvent(true)}
                                    className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--accent-text)] hover:opacity-80 uppercase tracking-tight bg-[var(--accent-primary)] px-3 py-1.5 rounded-lg transition-all"
                                >
                                    <Plus className="w-3 h-3" /> Agendar
                                </button>
                            </div>

                            <div className="space-y-2">
                                {selectedDayEvents.length > 0 ? (
                                    selectedDayEvents.map(event => (
                                        <Card key={event.id} className="p-3 !rounded-2xl border-[var(--border-subtle)] bg-white flex items-center justify-between group hover:border-[var(--border-medium)] transition-colors shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-xl bg-opacity-10 
                                                    ${event.type === 'CONFERENCE' ? 'bg-red-500 text-red-600' :
                                                        event.type === 'FORWARDING' ? 'bg-orange-500 text-orange-600' :
                                                            'bg-blue-500 text-blue-600'}
                                                `}>
                                                    {event.type === 'CONFERENCE' ? <Video className="w-4 h-4" /> :
                                                        event.type === 'FORWARDING' ? <Forward className="w-4 h-4" /> :
                                                            <CheckCircle2 className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-[var(--text-primary)] leading-none">{event.title}</p>
                                                    <p className="text-[10px] text-[var(--text-tertiary)] font-medium mt-1 uppercase tracking-widest">
                                                        {format(new Date(event.startTime), 'HH:mm')} • {event.participants.length} Participantes
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteEvent(event.id)}
                                                className="p-2 text-[var(--text-tertiary)] hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                                title="Excluir evento"
                                                aria-label="Excluir evento"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="text-center py-12 bg-[var(--bg-secondary)] rounded-3xl border-2 border-dashed border-[var(--border-subtle)]">
                                        <CalendarIcon className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-2 opacity-50" />
                                        <p className="text-xs text-[var(--text-tertiary)] font-bold uppercase tracking-widest">Nenhum evento</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Col 2: Actions & Tools */}
                    <div className="w-full lg:w-[320px] flex flex-col gap-4 overflow-hidden">
                        {/* Clock & Quick Summary */}
                        <Card className="p-6 bg-white shadow-md overflow-hidden relative group border-[var(--border-subtle)]">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-primary)]/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[var(--accent-primary)]/20 transition-all duration-700" />
                            <div className="relative z-10 flex flex-col items-center">
                                <ClockIcon className="w-4 h-4 text-[var(--accent-secondary)] mb-2 animate-pulse" />
                                <h2 className="text-4xl font-black text-[var(--text-primary)] tracking-tight mb-1">
                                    {format(currentTime, 'HH:mm')}
                                    <span className="text-xl text-[var(--text-tertiary)] ml-1 font-medium">{format(currentTime, 'ss')}</span>
                                </h2>
                                <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-[0.2em] opacity-80">
                                    {format(currentTime, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                                </p>
                            </div>
                        </Card>

                        {/* Bloco de Notas */}
                        <div className="flex-1 flex flex-col gap-3 min-h-[300px]">
                            <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest pl-1 mt-2">
                                Bloco de Notas
                            </h4>
                            <div className="flex-1 flex flex-col group">
                                <textarea
                                    className="flex-1 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-sm font-medium text-yellow-900 focus:bg-yellow-100/50 focus:border-yellow-400 outline-none transition-all resize-none placeholder:text-yellow-900/40"
                                    placeholder="Anote algo rápido aqui..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    aria-label="Bloco de notas"
                                />
                                <div className="flex justify-end mt-2">
                                    <button
                                        type="button"
                                        onClick={handleSaveNote}
                                        disabled={isSavingNote}
                                        className="text-[10px] font-bold text-yellow-700 uppercase tracking-widest hover:bg-yellow-100 px-3 py-1.5 rounded-lg transition-all flex items-center gap-2"
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
