import { useState, useEffect, useCallback } from 'react';
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
import { Button, Card, Avatar } from '../../components/ui';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import type { UserContact, AgendaEvent, AgendaEventType } from '../../types';

export function Schedule() {
    const dateLocale = ptBR;

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
    const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

    const loadInitialData = useCallback(async () => {
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
            toast.error("Erro ao carregar dados da agenda");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadInitialData();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, [loadInitialData]);

    const handleSaveNote = async () => {
        setIsSavingNote(true);
        try {
            await api.post('/agenda/note', { content: note });
            toast.success("Nota salva com sucesso");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar nota");
        } finally {
            setIsSavingNote(false);
        }
    };

    const handleCreateEvent = async () => {
        if (!eventTitle) return toast.error("O título do evento é obrigatório");

        const [hours, minutes] = eventStartTime.split(':').map(Number);
        const startTime = new Date(selectedDate);
        startTime.setHours(hours || 0, minutes || 0, 0, 0);

        if (startTime < new Date()) {
            return toast.error("Não é possível agendar no passado");
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
            toast.success("Agendamento criado com sucesso");
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            const msg = err.response?.data?.error || "Erro ao criar agendamento";
            toast.error(msg);
        }
    };

    const handleDeleteEvent = async (id: string) => {
        try {
            await api.delete(`/agenda/${id}`);
            setEvents(events.filter(e => e.id !== id));
            toast.success("Evento excluído");
            setDeletingEventId(null);
        } catch {
            toast.error("Erro ao excluir evento");
        }
    };

    const isPastSelection = () => {
        const [hours, minutes] = eventStartTime.split(':').map(Number);
        const startTime = new Date(selectedDate);
        startTime.setHours(hours || 0, minutes || 0, 0, 0);
        return startTime < new Date();
    };

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const selectedDayEvents = events.filter(e => isSameDay(new Date(e.startTime), selectedDate));

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Agenda</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold mt-2 uppercase tracking-[0.2em] text-[10px]">Organização Operacional</p>
                </div>
            </div>

            <div className="flex-1 bg-white dark:bg-black/20 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl p-6 lg:p-8 backdrop-blur-xl">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">Carregando Agenda...</p>
                    </div>
                ) : isCreatingEvent ? (
                    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Novo Agendamento</h3>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{format(selectedDate, "EEEE, dd 'de' MMMM", { locale: dateLocale })}</p>
                            </div>
                            <button type="button" onClick={() => setIsCreatingEvent(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all" title="Fechar novo agendamento">
                                <X className="w-6 h-6 text-slate-500 hover:text-red-500" />
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col md:flex-row gap-8 overflow-hidden">
                            {/* Form Side */}
                            <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Informações Básicas</label>
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            autoFocus
                                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-white/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                            placeholder="Ex: Reunião Técnica / Vistoria Campo"
                                            value={eventTitle}
                                            onChange={(e) => setEventTitle(e.target.value)}
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Horário</span>
                                                <input
                                                    type="time"
                                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-white/10 focus:border-indigo-500 outline-none transition-all"
                                                    value={eventStartTime}
                                                    onChange={(e) => setEventStartTime(e.target.value)}
                                                    title="Início"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Tipo</span>
                                                <select
                                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-white/10 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                                                    value={eventType}
                                                    onChange={(e) => setEventType(e.target.value as AgendaEventType)}
                                                    title="Tipo de Evento"
                                                >
                                                    <option value="TASK" className="dark:bg-slate-900">Tarefa / Ação</option>
                                                    <option value="CONFERENCE" className="dark:bg-slate-900">Conferência / Briefing</option>
                                                    <option value="FORWARDING" className="dark:bg-slate-900">Encaminhamento</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
                                        PARTICIPANTES ({selectedParticipants.length})
                                    </label>
                                    <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-6 border border-dashed border-slate-300 dark:border-white/10 min-h-[160px]">
                                        <div className="flex flex-wrap gap-3">
                                            {selectedParticipants.map(pid => {
                                                const c = contacts.find(x => x.id === pid);
                                                return c ? (
                                                    <div key={pid} className="flex items-center gap-2 bg-white dark:bg-white/10 pl-1.5 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm animate-in zoom-in-50">
                                                        <Avatar src={c.avatarUrl} size="sm" />
                                                        <span className="text-[11px] font-bold text-slate-900 dark:text-white">{c.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedParticipants(prev => prev.filter(x => x !== pid))}
                                                            className="ml-1 p-1 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400 rounded-lg transition-all text-slate-400"
                                                            title="Remover participante"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ) : null;
                                            })}
                                            {selectedParticipants.length === 0 && (
                                                <div className="flex flex-col items-center justify-center w-full py-4 text-slate-400 dark:text-slate-500">
                                                    <Users className="w-8 h-8 mb-2 opacity-50" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest">Selecione contatos ao lado</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button type="button" variant="ghost" size="lg" className="flex-1" onClick={() => setIsCreatingEvent(false)}>
                                        Voltar
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="primary"
                                        size="lg"
                                        className="flex-[2] shadow-lg shadow-indigo-600/20"
                                        onClick={handleCreateEvent}
                                        disabled={!eventTitle || selectedParticipants.length === 0 || isPastSelection()}
                                    >
                                        Confirmar Agendamento
                                    </Button>
                                </div>
                                {isPastSelection() && (
                                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest text-center mt-2 animate-pulse">
                                        Não é possível agendar no passado
                                    </p>
                                )}
                            </div>

                            {/* List Side */}
                            <div className="w-full md:w-[360px] flex flex-col gap-4 bg-slate-50 dark:bg-white/5 rounded-3xl p-5 border border-slate-200 dark:border-white/5">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar contatos..."
                                        className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
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
                                                        ${isSelected ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm' : 'bg-white dark:bg-black/40 border-transparent hover:border-slate-200 dark:hover:border-white/5 text-slate-700 dark:text-slate-300'}
                                                    `}
                                                    title={`Selecionar ${contact.name}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Avatar src={contact.avatarUrl} size="md" />
                                                        <div className="text-left">
                                                            <p className="text-xs font-bold leading-none mb-1">{contact.name}</p>
                                                            <p className={`text-[9px] font-bold uppercase tracking-widest ${isSelected ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
                                                                {contact.role}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-400'}`}>
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
                    <div className="flex flex-col md:flex-row gap-6 h-full min-h-[600px]">
                        {/* Col 1: Calendar & Events */}
                        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                            <Card className="p-4 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 shadow-sm">
                                {/* Calendar Header */}
                                <div className="flex justify-between items-center mb-6 px-2">
                                    <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-tight text-lg">
                                        {format(currentDate, 'MMMM yyyy', { locale: dateLocale })}
                                    </h3>
                                    <div className="flex gap-1">
                                        <button type="button" onClick={prevMonth} title="Mês anterior" className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-slate-900 dark:hover:text-white">
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <button type="button" onClick={nextMonth} title="Próximo mês" className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-slate-900 dark:hover:text-white">
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Calendar Grid */}
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                                        <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest pb-2">
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
                                                    relative h-10 w-full flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all
                                                    ${!isCurrentMonth ? 'text-slate-300 dark:text-slate-600' : 'text-slate-700 dark:text-slate-300'}
                                                    ${isSel ? 'bg-indigo-600 !text-white shadow-sm font-bold scale-105 z-10' : 'hover:bg-slate-50 dark:hover:bg-white/5'}
                                                    ${isTod && !isSel ? 'text-indigo-600 dark:text-indigo-400 !font-bold border border-indigo-200 dark:border-indigo-500/30' : ''}
                                                    ${hasEvents && !isSel ? 'animate-pulse font-bold' : ''}
                                                `}
                                            >
                                                {format(day, 'd')}
                                                {hasEvents && !isSel && (
                                                    <span className="absolute bottom-1.5 w-1 h-1 bg-indigo-500 rounded-full" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </Card>

                            {/* Events for selected day */}
                            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest pl-1">
                                        Compromissos • {format(selectedDate, "dd 'de' MMM", { locale: dateLocale })}
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={() => setIsCreatingEvent(true)}
                                        className="flex items-center gap-1.5 text-[10px] font-bold text-white hover:opacity-90 uppercase tracking-tight bg-indigo-600 px-3 py-1.5 rounded-lg transition-all shadow-sm"
                                    >
                                        <Plus className="w-3 h-3" /> AGENDAR
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {selectedDayEvents.length > 0 ? (
                                        selectedDayEvents.map(event => (
                                            <Card key={event.id} className="p-4 !rounded-2xl border-slate-200 dark:border-white/5 bg-white dark:bg-black/40 flex items-center justify-between group hover:border-slate-300 dark:hover:border-white/10 transition-colors shadow-sm relative overflow-hidden">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-xl bg-opacity-10 dark:bg-opacity-20
                                                        ${event.type === 'CONFERENCE' ? 'bg-red-500 text-red-600 dark:text-red-400' :
                                                            event.type === 'FORWARDING' ? 'bg-orange-500 text-orange-600 dark:text-orange-400' :
                                                                'bg-indigo-500 text-indigo-600 dark:text-indigo-400'}
                                                    `}>
                                                        {event.type === 'CONFERENCE' ? <Video className="w-5 h-5" /> :
                                                            event.type === 'FORWARDING' ? <Forward className="w-5 h-5" /> :
                                                                <CheckCircle2 className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{event.title}</p>
                                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1.5 uppercase tracking-widest">
                                                            {format(new Date(event.startTime), 'HH:mm')} • {event.participants.length} Participantes
                                                        </p>
                                                    </div>
                                                </div>

                                                {deletingEventId === event.id ? (
                                                    <div className="absolute inset-0 bg-white/95 dark:bg-black/95 backdrop-blur-sm flex items-center justify-end px-6 gap-3 rounded-2xl animate-in fade-in zoom-in duration-200 z-10">
                                                        <span className="text-xs font-bold text-slate-900 dark:text-white">Confirmar?</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteEvent(event.id)}
                                                            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-[10px] font-bold hover:bg-red-600 transition-colors shadow-sm"
                                                        >
                                                            Sim
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeletingEventId(null)}
                                                            className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white rounded-lg text-[10px] font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-colors border border-slate-200 dark:border-white/5"
                                                        >
                                                            Não
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeletingEventId(event.id)}
                                                        className="p-2 text-slate-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                                        title="Excluir evento"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </Card>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 bg-slate-50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10">
                                            <CalendarIcon className="w-8 h-8 text-slate-400 mx-auto mb-3 opacity-50" />
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Nenhum evento neste dia</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Col 2: Actions & Tools */}
                        <div className="w-full md:w-[360px] flex flex-col gap-6 overflow-hidden">
                            {/* Clock & Quick Summary */}
                            <Card className="p-8 bg-white dark:bg-black/40 shadow-sm overflow-hidden relative group border-slate-200 dark:border-white/5">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-indigo-500/30 transition-all duration-700" />
                                <div className="relative z-10 flex flex-col items-center">
                                    <ClockIcon className="w-5 h-5 text-indigo-500 dark:text-indigo-400 mb-3 animate-pulse" />
                                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                                        {format(currentTime, 'HH:mm')}
                                        <span className="text-xl md:text-2xl text-slate-400 dark:text-slate-500 ml-1 font-medium">{format(currentTime, 'ss')}</span>
                                    </h2>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] opacity-80">
                                        {format(currentTime, "EEEE, dd 'de' MMMM", { locale: dateLocale })}
                                    </p>
                                </div>
                            </Card>

                            {/* Bloco de Notas */}
                            <div className="flex-1 flex flex-col gap-3 min-h-[300px]">
                                <h4 className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest pl-1">
                                    Bloco de Notas
                                </h4>
                                <div className="flex-1 flex flex-col group">
                                    <textarea
                                        className="flex-1 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-3xl p-6 text-sm font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-white/5 focus:border-indigo-500/50 outline-none transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-inner dark:shadow-none"
                                        placeholder="Rascunhos para o turno de operações..."
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        aria-label="Bloco de notas"
                                    />
                                    <div className="flex justify-end mt-4">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={handleSaveNote}
                                            disabled={isSavingNote}
                                            className="text-[9px] font-black uppercase tracking-widest !rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-none shadow-sm"
                                        >
                                            {isSavingNote ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <StickyNote className="w-3 h-3 mr-2" />}
                                            SALVAR NOTAS
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
