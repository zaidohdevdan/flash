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
                    },
                    reports: {
                        defaults: {
                            professional: 'Professional',
                            technicalLead: 'Technical Lead',
                            supervisor: 'Supervisor'
                        },
                        header: {
                            greeting: 'Hello, {{name}}!',
                            subtitle: 'Your operational history'
                        },
                        create: {
                            title: 'Create New Report',
                            cancel: 'Cancel',
                            details: 'Details',
                            loadMore: 'Load More Activities',
                            offlinePending: 'Pending Reports',
                            offlineWaiting: '{{count}} files waiting for internet',
                            tryNow: 'Try Now',
                            clearDrafts: 'Clear offline drafts',
                            confirmClear: 'Do you want to clear all offline drafts?',
                            successLocal: 'Report saved locally! Will be sent once online.',
                            errorUpload: 'Image upload failed',
                            errorSend: 'Error sending report. Try again later.',
                            photoRequired: 'Please take a photo for the report.'
                        },
                        form: {
                            placeholder: 'DESCRIBE THE OCCURRENCE or OPERATIONAL UPDATE...',
                            submit: 'CONFIRM OPERATION',
                            sending: 'SENDING REPORT...',
                            capture: 'Tap to capture evidence',
                            captureHidden: 'Capture evidence',
                            remove: 'Remove evidence'
                        },
                        success: {
                            title: 'Report Sent!',
                            subtitle: 'Your supervisor has been notified in real-time.',
                            back: 'BACK TO HOME'
                        },
                        filters: {
                            all: 'All',
                            sent: 'Sent',
                            inReview: 'In Review',
                            forwarded: 'Dept',
                            resolved: 'Resolved',
                            archived: 'Archived'
                        },
                        supervisor: {
                            label: 'Direct Supervisor',
                            newMessage: 'NEW MESSAGE',
                            contact: 'CONTACT SUPERVISOR',
                            noneAssigned: 'You have no assigned supervisor.'
                        },
                        historyModal: {
                            title: 'Operational Trail',
                            subtitle: 'Protocol: #{{id}} • Full History',
                            noObservation: 'No observation recorded.',
                            by: 'By:'
                        }
                    },
                    chat: {
                        roles: {
                            manager: 'Manager / Sector',
                            supervisor: 'Supervisor',
                            professional: 'Operational',
                            contact: 'Contact'
                        },
                        actions: {
                            clearHistory: 'Clear History',
                            close: 'Close',
                            edit: 'Edit',
                            delete: 'Delete',
                            cancelEdit: 'Cancel edit',
                            saveEdit: 'Save changes',
                            deleteForMe: 'For me',
                            deleteForEveryone: 'For everyone',
                            stopRecording: 'Stop recording',
                            startRecording: 'Record audio',
                            send: 'Send'
                        },
                        placeholders: {
                            start: 'Start chatting...',
                            type: 'Type your message...',
                            edit: 'Edit message'
                        },
                        status: {
                            expiring: 'Expiring...',
                            recording: 'Recording audio...',
                            online: 'Online',
                            offline: 'Offline'
                        },
                        toasts: {
                            savedOffline: 'Message saved offline',
                            uploadError: 'Audio upload failed.',
                            sendError: 'Error sending message.',
                            editError: 'Failed to edit message.',
                            deleteError: 'Failed to delete message.',
                            historyCleared: 'History cleared.',
                            historyError: 'Error clearing history.'
                        },
                        confirm: {
                            clearHistory: 'Are you sure you want to delete all history for this conversation?'
                        }
                    },
                    auth: {
                        login: {
                            accessRestricted: 'Access Restricted',
                            identify: 'Please identify yourself to access the dashboard.',
                            emailLabel: 'Operational ID / Email',
                            passwordLabel: 'Access Key',
                            submit: 'Enter System',
                            forgotPassword: 'Forgot your password?',
                            recover: 'Recover access',
                            secureConnection: 'Secure Connection E2EE',
                            error: 'Invalid credentials. Please check and try again.'
                        },
                        register: {
                            title: 'Create Account',
                            subtitle: 'Join the largest operational intelligence network.',
                            backToLogin: 'Back to Login',
                            labels: {
                                name: 'Full Name',
                                email: 'E-mail',
                                password: 'Password',
                                role: 'Access Type',
                                supervisor: 'Technical Manager'
                            },
                            placeholders: {
                                name: 'Ex: John Doe',
                                email: 'you@flash.com',
                                supervisor: 'Select your supervisor'
                            },
                            roles: {
                                professional: 'Professional',
                                supervisor: 'Supervisor'
                            },
                            submit: 'Complete Registration',
                            secureSystem: 'Secure System',
                            sslActive: 'SSL Connection Active',
                            success: {
                                title: 'Account Created!',
                                subtitle: 'Welcome to Flash.',
                                message: 'Your account has been successfully created.',
                                redirecting: 'Redirecting to login...'
                            },
                            errors: {
                                selectSupervisor: 'Please select a supervisor.',
                                generic: 'Error creating account.'
                            }
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
                    },
                    home: {
                        nav: {
                            features: 'Features',
                            process: 'Process',
                            specs: 'Technology',
                            contact: 'Contact',
                            login: 'Access System'
                        },
                        hero: {
                            badge: 'Enterprise System v4.0',
                            title: 'Management',
                            subtitle: 'No Noise.',
                            description: '<0>FLASH</0> unifies your field operation. Predictive intelligence, offline operation, and minimalist design for those leading the future.',
                            start: 'Start Operation',
                            docs: 'Read Documentation'
                        },
                        demo: {
                            offline: 'Offline Mode',
                            sync: 'Active Sync'
                        },
                        features: {
                            overline: 'Core System',
                            title: 'Expanded',
                            subtitle: 'Capabilities',
                            neural: {
                                title: 'Neural Core AI',
                                desc: 'Integrated predictive analysis identifying operational bottlenecks before they become crises. Automatic executive summarization.'
                            },
                            offline: {
                                title: 'Offline First',
                                desc: 'Robust PWA. Work in dead zones with automatic synchronization.'
                            },
                            mesh: {
                                title: 'Global Mesh',
                                desc: 'Active orbital network. Multi-region synchronization with < 20ms latency.'
                            },
                            analytics: {
                                title: 'Deep Analytics',
                                desc: 'Executive dashboards with data intelligence and real-time efficiency metrics.'
                            }
                        },
                        developer: {
                            role: 'Software Engineering',
                            name: 'Daniel de Almeida',
                            desc: 'Specialist in creating systems that unite refined aesthetics with robust architecture. FLASH is the result of this philosophy: invisible in complexity, powerful in delivery.',
                            manifesto: {
                                overline: 'Manifesto',
                                title: '"Enterprise software',
                                subtitle: 'doesn\'t have to be boring."',
                                text: 'We believe that the quality of the tool defines the quality of the work. That\'s why we invest time in every pixel, every transition, and every millisecond of performance.'
                            }
                        },
                        contact: {
                            overline: 'Contact',
                            title: 'Ready to transform',
                            subtitle: 'your operation?',
                            success: {
                                title: 'Request Received!',
                                desc: 'We will be in touch shortly.',
                                reset: 'Send Another'
                            },
                            form: {
                                name: 'Your Name',
                                namePlaceholder: 'Ex: John Doe',
                                company: 'Company',
                                companyPlaceholder: 'Ex: Acme Corp',
                                email: 'Corporate Email',
                                emailPlaceholder: 'name@company.com',
                                message: 'Message',
                                messagePlaceholder: 'How can we help?',
                                submit: 'REQUEST DEMO',
                                sending: 'SENDING...'
                            }
                        },
                        footer: {
                            desc: 'Unified platform for high-performance field operations. Perfect sync, secure data, and invisible design.',
                            product: {
                                title: 'Product',
                                neural: 'Neural Core',
                                offline: 'Offline First',
                                mesh: 'Global Mesh',
                                changelog: 'Changelog'
                            },
                            company: {
                                title: 'Company',
                                about: 'About',
                                careers: 'Careers',
                                blog: 'Blog',
                                contact: 'Contact'
                            },
                            legal: {
                                title: 'Legal',
                                privacy: 'Privacy',
                                terms: 'Terms',
                                compliance: 'Compliance'
                            },
                            copyright: '© 2026 Daniel de Almeida Inc. All rights reserved.',
                            status: 'All Systems Normal'
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
                            feedbackLabel: 'Technical Opinion / Action Summary',
                            feedbackPlaceholder: 'Describe the measures or technical analysis...',
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
                            },
                        },
                    },
                    reports: {
                        defaults: {
                            professional: 'Profissional',
                            technicalLead: 'Responsável Técnico',
                            supervisor: 'Supervisor'
                        },
                        header: {
                            greeting: 'Olá, {{name}}!',
                            subtitle: 'Seu histórico operacional'
                        },
                        create: {
                            title: 'Criar Nova Ocorrência',
                            cancel: 'Cancelar',
                            details: 'Detalhes',
                            loadMore: 'Carregar Mais Atividades',
                            offlinePending: 'Relatórios Pendentes',
                            offlineWaiting: '{{count}} arquivos aguardando internet',
                            tryNow: 'Tentar Agora',
                            clearDrafts: 'Limpar rascunhos offline',
                            confirmClear: 'Deseja limpar todos os rascunhos offline?',
                            successLocal: 'Relatório salvo localmente! Será enviado assim que houver internet.',
                            errorUpload: 'Falha no upload da imagem',
                            errorSend: 'Erro ao enviar relatório. Tentaremos novamente depois.',
                            photoRequired: 'Por favor, tire uma foto para o relatório.'
                        },
                        form: {
                            placeholder: 'DESCREVA A OCORRÊNCIA OU ATUALIZAÇÃO OPERACIONAL...',
                            submit: 'CONFIRMAR OPERAÇÃO',
                            sending: 'ENVIANDO RELATÓRIO...',
                            capture: 'Toque para capturar evidência',
                            captureHidden: 'Capturar evidência',
                            remove: 'Remover evidência'
                        },
                        success: {
                            title: 'Relatório Enviado!',
                            subtitle: 'O seu supervisor foi notificado em tempo real.',
                            back: 'VOLTAR AO INÍCIO'
                        },
                        filters: {
                            all: 'Tudo',
                            sent: 'Enviados',
                            inReview: 'Análise',
                            forwarded: 'Depto',
                            resolved: 'Finalizado',
                            archived: 'Arquivado'
                        },
                        supervisor: {
                            label: 'Supervisor Direto',
                            newMessage: 'NOVA MENSAGEM',
                            contact: 'CONTATAR SUPERVISOR',
                            noneAssigned: 'Você ainda não possui um supervisor atribuído.'
                        },
                        historyModal: {
                            title: 'Trilha Operacional',
                            subtitle: 'Protocolo: #{{id}} • Histórico Completo',
                            noObservation: 'Nenhuma observação registrada.',
                            by: 'Por:'
                        }
                    },
                    chat: {
                        roles: {
                            manager: 'Gerente / Setor',
                            supervisor: 'Supervisor',
                            professional: 'Operacional',
                            contact: 'Contato'
                        },
                        actions: {
                            clearHistory: 'Excluir Histórico',
                            close: 'Fechar',
                            edit: 'Editar',
                            delete: 'Excluir',
                            cancelEdit: 'Cancelar edição',
                            saveEdit: 'Salvar alteração',
                            deleteForMe: 'Para mim',
                            deleteForEveryone: 'Para todos',
                            stopRecording: 'Parar gravação',
                            startRecording: 'Gravar áudio',
                            send: 'Enviar'
                        },
                        placeholders: {
                            start: 'Inicie a conversa...',
                            type: 'Digite sua mensagem...',
                            edit: 'Editar mensagem'
                        },
                        status: {
                            expiring: 'Expirando...',
                            recording: 'Gravando áudio...',
                            online: 'Online',
                            offline: 'Offline'
                        },
                        toasts: {
                            savedOffline: 'Mensagem salva offline',
                            uploadError: 'Falha ao enviar áudio.',
                            sendError: 'Erro ao enviar mensagem.',
                            editError: 'Falha ao editar mensagem.',
                            deleteError: 'Falha ao excluir mensagem.',
                            historyCleared: 'Histórico excluído.',
                            historyError: 'Erro ao excluir histórico.'
                        },
                        confirm: {
                            clearHistory: 'Você tem certeza que deseja excluir todo o histórico desta conversa?'
                        }
                    },
                    auth: {
                        login: {
                            accessRestricted: 'Acesso Restrito',
                            identify: 'Identifique-se para acessar o dashboard.',
                            emailLabel: 'ID Operacional / E-mail',
                            passwordLabel: 'Chave de Acesso',
                            submit: 'Entrar no Sistema',
                            forgotPassword: 'Esqueceu sua senha?',
                            recover: 'Recuperar acesso',
                            secureConnection: 'Conexão Segura E2EE',
                            error: 'Credenciais inválidas. Verifique e tente novamente.'
                        },
                        register: {
                            title: 'Criar Conta',
                            subtitle: 'Junte-se à maior rede de inteligência operacional.',
                            backToLogin: 'Voltar ao Login',
                            labels: {
                                name: 'Nome Completo',
                                email: 'E-mail',
                                password: 'Senha',
                                role: 'Tipo de Acesso',
                                supervisor: 'Responsável Técnico'
                            },
                            placeholders: {
                                name: 'Ex: Carlos Oliveira',
                                email: 'seu@flash.com',
                                supervisor: 'Selecione seu supervisor'
                            },
                            roles: {
                                professional: 'Profissional',
                                supervisor: 'Supervisor'
                            },
                            submit: 'Finalizar Cadastro',
                            secureSystem: 'Sistema Seguro',
                            sslActive: 'Conexão SSL Ativa',
                            success: {
                                title: 'Conta Criada!',
                                subtitle: 'Bem-vindo ao Flash.',
                                message: 'Sua conta foi criada com sucesso.',
                                redirecting: 'Redirecionando para o login...'
                            },
                            errors: {
                                selectSupervisor: 'Por favor, selecione um supervisor.',
                                generic: 'Erro ao realizar cadastro.'
                            }
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
                    },
                    home: {
                        nav: {
                            features: 'Recursos',
                            process: 'Processo',
                            specs: 'Tecnologia',
                            contact: 'Contato',
                            login: 'Acessar Sistema'
                        },
                        hero: {
                            badge: 'Enterprise System v4.0',
                            title: 'Gestão',
                            subtitle: 'Sem Ruído.',
                            description: 'O <0>FLASH</0> unifica sua operação de campo. Inteligência preditiva, operação offline e design minimalista para quem lidera o futuro.',
                            start: 'Iniciar Operação',
                            docs: 'Ver Documentação'
                        },
                        demo: {
                            offline: 'Modo Offline',
                            sync: 'Sincronização Ativa'
                        },
                        features: {
                            overline: 'Core System',
                            title: 'Capacidades',
                            subtitle: 'Expandidas',
                            neural: {
                                title: 'Neural Core AI',
                                desc: 'Análise preditiva integrada que identifica gargalos operacionais antes que eles virem crise. Sumarização executiva automática.'
                            },
                            offline: {
                                title: 'Offline First',
                                desc: 'PWA robusto. Trabalhe em zonas sem sinal com sincronização automática.'
                            },
                            mesh: {
                                title: 'Global Mesh',
                                desc: 'Rede orbital ativa. Sincronização multi-região com latência < 20ms.'
                            },
                            analytics: {
                                title: 'Deep Analytics',
                                desc: 'Dashboards executivos com inteligência de dados e métricas de eficiência em tempo real.'
                            }
                        },
                        developer: {
                            role: 'Engenharia de Software',
                            name: 'Daniel de Almeida',
                            desc: 'Especialista em criar sistemas que unem estética refinada com arquitetura robusta. O FLASH é o resultado dessa filosofia: invisível na complexidade, poderoso na entrega.',
                            manifesto: {
                                overline: 'Manifesto',
                                title: '"Software corporativo',
                                subtitle: 'não precisa ser chato."',
                                text: 'Acreditamos que a qualidade da ferramenta define a qualidade do trabalho. Por isso, investimos tempo em cada pixel, cada transição e cada milissegundo de performance.'
                            }
                        },
                        contact: {
                            overline: 'Contato',
                            title: 'Pronto para transformar',
                            subtitle: 'sua operação?',
                            success: {
                                title: 'Solicitação Recebida!',
                                desc: 'Entraremos em contato em breve.',
                                reset: 'Enviar Outra'
                            },
                            form: {
                                name: 'Seu Nome',
                                namePlaceholder: 'Ex: João Silva',
                                company: 'Empresa',
                                companyPlaceholder: 'Ex: Acme Corp',
                                email: 'E-mail Corporativo',
                                emailPlaceholder: 'nome@empresa.com',
                                message: 'Mensagem',
                                messagePlaceholder: 'Como podemos ajudar?',
                                submit: 'SOLICITAR DEMO',
                                sending: 'ENVIANDO...'
                            }
                        },
                        footer: {
                            desc: 'Plataforma unificada para operações de campo de alta performance. Sincronia perfeita, dados seguros e design invisível.',
                            product: {
                                title: 'Produto',
                                neural: 'Neural Core',
                                offline: 'Offline First',
                                mesh: 'Global Mesh',
                                changelog: 'Changelog'
                            },
                            company: {
                                title: 'Empresa',
                                about: 'Sobre',
                                careers: 'Carreiras',
                                blog: 'Blog',
                                contact: 'Contato'
                            },
                            legal: {
                                title: 'Legal',
                                privacy: 'Privacidade',
                                terms: 'Termos',
                                compliance: 'Compliance'
                            },
                            copyright: '© 2026 Daniel de Almeida Inc. Todos os direitos reservados.',
                            status: 'All Systems Normal'
                        }
                    }
                }
            }
        }
    });

export default i18n;
