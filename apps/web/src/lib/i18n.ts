import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        debug: true,
        fallbackLng: 'pt',
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
        resources: {
            en: {
                translation: {
                    settings: {
                        title: 'Settings',
                        subtitle: 'Customize your Flash experience.',
                        tabs: {
                            general: 'General',
                            notifications: 'Notifications',
                            appearance: 'Appearance',
                            security: 'Security',
                            offline: 'Offline & Data',
                            admin: 'Administration'
                        },
                        general: {
                            title: 'General',
                            description: 'Manage your basic information and language preferences.',
                            displayName: 'Display Name',
                            language: 'System Language',
                            save: 'Save Changes',
                            saving: 'Saving...',
                            success: 'Settings saved!',
                            error: 'Error saving changes.'
                        },
                        appearance: {
                            title: 'Appearance',
                            description: 'Customize how Flash looks on your device.',
                            theme: 'System Theme',
                            themes: {
                                light: 'Light',
                                dark: 'Dark',
                                system: 'System'
                            },
                            density: 'Layout Density',
                            densities: {
                                comfortable: 'Comfortable',
                                compact: 'Compact'
                            }
                        },
                        notifications: {
                            title: 'Notifications',
                            description: 'Control how and when you receive alerts.',
                            sound: 'New Message Sounds',
                            soundDesc: 'Play an audible alert when receiving chat.',
                            desktop: 'Desktop Notifications',
                            desktopDesc: 'Show visual alerts outside the browser.'
                        },
                        security: {
                            title: 'Security',
                            description: 'Manage your credentials and account access.',
                            changePassword: 'Change Access Key',
                            currentPassword: 'Current Password',
                            newPassword: 'New Password',
                            confirmPassword: 'Confirm New Password',
                            save: 'Save New Password',
                            success: 'Password updated successfully!',
                            error: 'Error updating password.',
                            mismatch: 'Passwords do not match.'
                        },
                        offline: {
                            title: 'Offline & Data',
                            description: 'Manage local storage and synchronization.',
                            messages: 'Saved Messages',
                            reports: 'Pending Reports',
                            notifications: 'Notifications',
                            clearData: 'Clear Data',
                            clearDataDesc: 'Removes local copies of messages and reports. Does not affect the server.',
                            clearButton: 'Clear Cache',
                            confirmClear: 'Are you sure? This will delete all offline messages and reports from this device.',
                            success: 'Local cache cleared successfully.',
                            error: 'Error clearing cache.'
                        },
                        admin: {
                            title: 'Administration',
                            description: 'Manage users and system permissions.',
                            searchPlaceholder: 'Search by name or email...',
                            noUsers: 'No users found.',
                            confirmDelete: 'Are you sure? This action cannot be undone.',
                            deleteSuccess: 'User removed.',
                            deleteError: 'Error removing user.'
                        }
                    },
                    layout: {
                        sidebar: {
                            dashboard: 'Dashboard',
                            settings: 'Settings',
                            logout: 'Logout',
                            defaultUser: 'User',
                            defaultRole: 'Member'
                        },
                        header: {
                            search: 'Search...',
                            online: 'Online',
                            offline: 'Offline'
                        },
                        teamSidebar: {
                            title: 'Team',
                            online: 'online',
                            noMembers: 'No active members',
                            manager: 'Manager'
                        },
                        notificationDrawer: {
                            title: 'Notifications',
                            newMessages: 'new messages',
                            close: 'Close notifications',
                            clearAll: 'Clear all',
                            emptyTitle: 'No notifications',
                            emptyMsg: 'All clean here!',
                            footer: 'Flash Notification System v2.0'
                        }
                    },
                    dashboard: {
                        title: 'Operational Dashboard',
                        subtitle: 'Real-time monitoring and rapid response.',
                        kpi: {
                            received: 'Received',
                            inReview: 'In Review',
                            forwarded: 'Forwarded',
                            finished: 'Finished'
                        },
                        filters: {
                            all: 'All',
                            sent: 'Received',
                            inReview: 'Review',
                            forwarded: 'Transit',
                            resolved: 'Finished',
                            from: 'From',
                            to: 'To',
                            clear: 'Clear'
                        },
                        actions: {
                            analytics: 'Analytics',
                            export: 'Export',
                            warRoom: 'War Room',
                            agenda: 'Agenda',
                            list: 'List',
                            map: 'Map',
                            process: 'Board',
                            history: 'History',
                            loadMore: 'Load More'
                        },
                        feed: {
                            empty: 'No reports found',
                            emptyMsg: 'No reports found',
                            newReport: 'New report created'
                        },
                        card: {
                            inSector: 'In Sector',
                            supervisor: 'Supervisor:',
                            noImage: 'No Image'
                        },
                        analysis: {
                            title: 'Flow Analysis',
                            success: 'Report processed successfully!',
                            error: 'Error processing report.'
                        },
                        analysisModal: {
                            subtitle: 'Operations Management and Feedback',
                            cancel: 'Cancel',
                            confirm: {
                                resolve: 'Finalize and Resolve',
                                forward: 'Forward Now',
                                update: 'Update Status'
                            },
                            feedbackLabel: 'Technical Opinion / Action Summary',
                            feedbackPlaceholder: 'Describe the measures or technical analysis...',
                            nextStep: 'Next Step',
                            status: {
                                review: 'REVIEW',
                                department: 'DEPARTMENT',
                                resolved: 'RESOLVED'
                            },
                            forwardTo: 'Forward to:',
                            selectDest: '-- Choose a destination --'
                        },
                        profileModal: {
                            title: 'User Profile',
                            subtitle: 'Customize your identification on the network',
                            cancel: 'Cancel',
                            save: 'Save',
                            photoLabel: 'Profile Photo',
                            photoHint: 'Click on image to change',
                            statusLabel: 'Operational Status',
                            statusPlaceholder: 'Ex: In operation / Available'
                        },
                        exportModal: {
                            title: 'Export Reports',
                            configTitle: 'Document Configuration',
                            configDesc: 'The PDF will include all operational data visible on dashboard based on filters below.',
                            filterStatus: 'Filter by Status',
                            filterSector: 'Filter by Sector',
                            allStatus: 'All statuses',
                            allSectors: 'All sectors',
                            status: {
                                SENT: 'Sent',
                                IN_REVIEW: 'In Review',
                                FORWARDED: 'Forwarded',
                                RESOLVED: 'Resolved'
                            },
                            unknownSector: 'Unknown Sector',
                            total: 'Total to export:',
                            reports: 'reports',
                            cancel: 'Cancel',
                            export: 'Export PDF',
                            generating: 'Generating...'
                        },
                        conference: {
                            title: 'Operations War Room',
                            live: 'Live',
                            leaveTitle: 'Leave Meeting',
                            endedTitle: 'Broadcast Ended',
                            endedDesc: 'The operation room has been deactivated. Coordinates and logs have been saved to system.',
                            leave: 'Leave Room'
                        },
                        agenda: {
                            title: 'Supervisor Agenda',
                            loading: 'Loading Agenda...',
                            newEvent: 'New Appointment',
                            basicInfo: 'Basic Information',
                            eventTitlePlaceholder: 'Event Title (ex: Technical Meeting)',
                            startTime: 'Start Time',
                            eventType: 'Event Type',
                            types: {
                                TASK: 'General Task',
                                CONFERENCE: 'Video Conference',
                                FORWARDING: 'Forwarding'
                            },
                            confirmed: 'Confirmed',
                            selectPeople: 'Select people from list',
                            pickDate: 'Pick Another Date',
                            confirm: 'Confirm Appointment',
                            pastError: '⚠️ Cannot schedule in the past',
                            searchPlaceholder: 'Search by name or role...',
                            appointments: 'Appointments',
                            schedule: 'Schedule',
                            noEvents: 'No events',
                            notepad: 'Notepad',
                            notePlaceholder: 'Write something quick here...',
                            saveNote: 'Save Note',
                            toast: {
                                noteSaved: 'Note saved',
                                noteError: 'Error saving note',
                                titleRequired: 'Title is required',
                                pastError: 'Cannot schedule events in the past',
                                eventCreated: 'Event scheduled!',
                                createError: 'Error creating event',
                                deleteSuccess: 'Event removed',
                                deleteError: 'Error removing event',
                                loadError: 'Error loading agenda data'
                            }
                        },
                        notifications: {
                            unread: 'You have {{count}} unread notification(s)',
                            unreadChat: 'You have {{count}} unread message(s) in chat',
                            profileUpdated: 'Profile updated!',
                            profileError: 'Error updating profile.',
                            warRoomStarted: 'War Room started! Invites sent.',
                            warRoomError: 'Error starting War Room.',
                            noParticipants: 'No online participants to invite.'
                        }
                    }
                }
            },
            pt: {
                translation: {
                    settings: {
                        title: 'Configurações',
                        subtitle: 'Personalize sua experiência no Flash.',
                        tabs: {
                            general: 'Geral',
                            notifications: 'Notificações',
                            appearance: 'Aparência',
                            security: 'Segurança',
                            offline: 'Offline e Dados',
                            admin: 'Administração'
                        },
                        general: {
                            title: 'Geral',
                            description: 'Gerencie suas informações básicas e preferências de idioma.',
                            displayName: 'Nome de Exibição',
                            language: 'Idioma do Sistema',
                            save: 'Salvar Alterações',
                            saving: 'Salvando...',
                            success: 'Configurações salvas!',
                            error: 'Erro ao salvar alterações.'
                        },
                        appearance: {
                            title: 'Aparência',
                            description: 'Personalize como o Flash se parece no seu dispositivo.',
                            theme: 'Tema do Sistema',
                            themes: {
                                light: 'Claro',
                                dark: 'Escuro',
                                system: 'Sistema'
                            },
                            density: 'Densidade do Layout',
                            densities: {
                                comfortable: 'Confortável',
                                compact: 'Compacto'
                            }
                        },
                        notifications: {
                            title: 'Notificações',
                            description: 'Controle como e quando você recebe alertas.',
                            sound: 'Sons de Novas Mensagens',
                            soundDesc: 'Reproduzir um alerta audível ao receber chat.',
                            desktop: 'Notificações de Desktop',
                            desktopDesc: 'Mostrar alertas visuais fora do navegador.'
                        },
                        security: {
                            title: 'Segurança',
                            description: 'Gerencie suas credenciais e acesso à conta.',
                            changePassword: 'Alterar Chave de Acesso',
                            currentPassword: 'Senha Atual',
                            newPassword: 'Nova Senha',
                            confirmPassword: 'Confirmar Nova Senha',
                            save: 'Salvar Nova Senha',
                            success: 'Senha atualizada com sucesso!',
                            error: 'Erro ao trocar senha.',
                            mismatch: 'As senhas não coincidem.'
                        },
                        offline: {
                            title: 'Offline e Dados',
                            description: 'Gerencie o armazenamento local e sincronização.',
                            messages: 'Mensagens Salvas',
                            reports: 'Relatórios Pendentes',
                            notifications: 'Notificações',
                            clearData: 'Limpeza de Dados',
                            clearDataDesc: 'Remove cópias locais de mensagens e relatórios. Não afeta o servidor.',
                            clearButton: 'Limpar Cache',
                            confirmClear: 'Tem certeza? Isso apagará todas as mensagens e relatórios offline deste dispositivo.',
                            success: 'Cache local limpo com sucesso.',
                            error: 'Erro ao limpar cache.'
                        },
                        admin: {
                            title: 'Administração',
                            description: 'Gerencie usuários e permissões do sistema.',
                            searchPlaceholder: 'Buscar por nome ou e-mail...',
                            noUsers: 'Nenhum usuário encontrado.',
                            confirmDelete: 'Tem certeza? Esta ação não pode ser desfeita.',
                            deleteSuccess: 'Usuário removido.',
                            deleteError: 'Erro ao remover usuário.'
                        }
                    },
                    layout: {
                        sidebar: {
                            dashboard: 'Dashboard',
                            settings: 'Configurações',
                            logout: 'Sair',
                            defaultUser: 'Usuário',
                            defaultRole: 'Membro'
                        },
                        header: {
                            search: 'Buscar...',
                            online: 'Online',
                            offline: 'Offline'
                        },
                        teamSidebar: {
                            title: 'Equipe',
                            online: 'online',
                            noMembers: 'Nenhum membro ativo',
                            manager: 'Gerente'
                        },
                        notificationDrawer: {
                            title: 'Notificações',
                            newMessages: 'novas mensagens',
                            close: 'Fechar notificações',
                            clearAll: 'Limpar todas',
                            emptyTitle: 'Sem notificações',
                            emptyMsg: 'Tudo limpo por aqui!',
                            footer: 'Flash Notification System v2.0'
                        }
                    },
                    dashboard: {
                        title: 'Dashboard Operacional',
                        subtitle: 'Monitoramento em tempo real e resposta rápida.',
                        kpi: {
                            received: 'Recebidos',
                            inReview: 'Em Análise',
                            forwarded: 'Encaminhados',
                            finished: 'Finalizados'
                        },
                        filters: {
                            all: 'Todos',
                            sent: 'Recebidos',
                            inReview: 'Análise',
                            forwarded: 'Trâmite',
                            resolved: 'Feitos',
                            from: 'De',
                            to: 'Até',
                            clear: 'Limpar'
                        },
                        actions: {
                            analytics: 'Analytics',
                            export: 'Exportar',
                            warRoom: 'War Room',
                            agenda: 'Agenda',
                            list: 'Lista',
                            map: 'Mapa',
                            process: 'Trâmite',
                            history: 'Histórico',
                            loadMore: 'Carregar Mais'
                        },
                        feed: {
                            empty: 'Nenhum reporte encontrado',
                            emptyMsg: 'Nenhum reporte encontrado',
                            newReport: 'Novo relatório criado'
                        },
                        card: {
                            inSector: 'Em Setor',
                            supervisor: 'Supervisor:',
                            noImage: 'Sem Imagem'
                        },
                        analysis: {
                            title: 'Análise de Fluxo',
                            success: 'Relatório processado com sucesso!',
                            error: 'Erro ao processar relatório.'
                        },
                        analysisModal: {
                            subtitle: 'Gestão de Operações e Feedback',
                            cancel: 'Cancelar',
                            confirm: {
                                resolve: 'Finalizar e Resolver',
                                forward: 'Encaminhar Agora',
                                update: 'Atualizar Status'
                            },
                            feedbackLabel: 'Parecer Técnico / Resumo da Ação',
                            feedbackPlaceholder: 'Descreva as providências ou análise técnica...',
                            nextStep: 'Próxima Etapa',
                            status: {
                                review: 'ANÁLISE',
                                department: 'DEPARTAMENTO',
                                resolved: 'RESOLVIDO'
                            },
                            forwardTo: 'Destinar para:',
                            selectDest: '-- Escolha um destino --'
                        },
                        profileModal: {
                            title: 'Perfil de Usuário',
                            subtitle: 'Personalize sua identificação na rede',
                            cancel: 'Cancelar',
                            save: 'Salvar',
                            photoLabel: 'Foto de Perfil',
                            photoHint: 'Clique na imagem para alterar',
                            statusLabel: 'Status Operacional',
                            statusPlaceholder: 'Ex: Em operação / Disponível'
                        },
                        exportModal: {
                            title: 'Exportar Relatórios',
                            configTitle: 'Configuração do Documento',
                            configDesc: 'O PDF incluirá todos os dados operacionais visíveis no dashboard com base nos filtros abaixo.',
                            filterStatus: 'Filtrar por Status',
                            filterSector: 'Filtrar por Setor',
                            allStatus: 'Todos os status',
                            allSectors: 'Todos os setores',
                            status: {
                                SENT: 'Enviado',
                                IN_REVIEW: 'Em Análise',
                                FORWARDED: 'Encaminhado',
                                RESOLVED: 'Resolvido'
                            },
                            unknownSector: 'Setor Desconhecido',
                            total: 'Total a exportar:',
                            reports: 'reportes',
                            cancel: 'Cancelar',
                            export: 'Exportar PDF',
                            generating: 'Gerando...'
                        },
                        conference: {
                            title: 'Operations War Room',
                            live: 'Ao Vivo',
                            leaveTitle: 'Sair da Reunião',
                            endedTitle: 'Transmissão Encerrada',
                            endedDesc: 'A sala de operação foi desativada. As coordenadas e logs foram salvos no sistema.',
                            leave: 'Sair da Sala'
                        },
                        agenda: {
                            title: 'Agenda do Supervisor',
                            loading: 'Carregando Agenda...',
                            newEvent: 'Novo Agendamento',
                            basicInfo: 'Informações Básicas',
                            eventTitlePlaceholder: 'Título do Evento (ex: Reunião Técnica)',
                            startTime: 'Horário de Início',
                            eventType: 'Tipo de Evento',
                            types: {
                                TASK: 'Tarefa Geral',
                                CONFERENCE: 'Videoconferência',
                                FORWARDING: 'Encaminhamento'
                            },
                            confirmed: 'Confirmados',
                            selectPeople: 'Selecione pessoas na lista ao lado',
                            pickDate: 'Escolher Outra Data',
                            confirm: 'Confirmar Agendamento',
                            pastError: '⚠️ Não é possível agendar no passado',
                            searchPlaceholder: 'Buscar por nome ou papel...',
                            appointments: 'Compromissos',
                            schedule: 'Agendar',
                            noEvents: 'Nenhum evento',
                            notepad: 'Bloco de Notas',
                            notePlaceholder: 'Anote algo rápido aqui...',
                            saveNote: 'Salvar Nota',
                            toast: {
                                noteSaved: 'Nota salva',
                                noteError: 'Erro ao salvar nota',
                                titleRequired: 'Título é obrigatório',
                                pastError: 'Não é possível marcar agendamentos no passado',
                                eventCreated: 'Evento agendado!',
                                createError: 'Erro ao criar evento',
                                deleteSuccess: 'Evento removido',
                                deleteError: 'Erro ao remover evento',
                                loadError: 'Erro ao carregar dados da agenda'
                            }
                        },
                        notifications: {
                            unread: 'Você tem {{count}} notificação(ões) não lida(s)',
                            unreadChat: 'Você tem {{count}} mensagem(ns) não lida(s) no chat',
                            profileUpdated: 'Perfil atualizado!',
                            profileError: 'Erro ao atualizar perfil.',
                            warRoomStarted: 'War Room iniciada! Convites enviados.',
                            warRoomError: 'Erro ao iniciar War Room.',
                            noParticipants: 'Nenhum participante online para convidar.'
                        }
                    }

                }
            }
        }
    });

export default i18n;
