import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

export function UserSettingsEffects() {
    const { user } = useAuth();
    const { i18n } = useTranslation();

    useEffect(() => {
        const applyTheme = (theme: string) => {
            if (theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else if (theme === 'light') {
                document.documentElement.classList.remove('dark');
            } else {
                // System
                if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            }
        };

        const applyDensity = (density: string) => {
            document.documentElement.setAttribute('data-density', density);
        };

        if (user) {
            // Load User Settings
            const savedTheme = localStorage.getItem(`settings_${user.id}_theme`);
            const savedLang = localStorage.getItem(`settings_${user.id}_language`);
            const savedDensity = localStorage.getItem(`settings_${user.id}_density`);

            if (savedTheme) {
                applyTheme(savedTheme);
            } else {
                applyTheme('system');
            }

            if (savedDensity) {
                applyDensity(savedDensity);
            } else {
                applyDensity('comfortable'); // Default
            }

            if (savedLang) {
                if (i18n.language !== savedLang) {
                    i18n.changeLanguage(savedLang);
                }
            }
        } else {
            // No user - maintain current global settings or fallback to system
            const savedTheme = localStorage.getItem('theme');
            const savedDensity = localStorage.getItem('density');

            if (savedTheme) {
                applyTheme(savedTheme);
            } else {
                applyTheme('system');
            }

            if (savedDensity) {
                applyDensity(savedDensity);
            } else {
                applyDensity('comfortable');
            }

            // Reset Language to System Default
            const savedGlobalLang = localStorage.getItem('language') || 'pt';
            if (i18n.language !== savedGlobalLang) {
                i18n.changeLanguage(savedGlobalLang);
            }
        }
    }, [user, i18n]);

    return null;
}
