import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function UserSettingsEffects() {
    const { user } = useAuth();

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
        }
    }, [user]);

    return null;
}
