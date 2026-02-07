import React from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-[var(--bg-secondary)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                    Flash<span className="text-[var(--accent-primary)]">.</span>
                </h2>
                <h2 className="mt-2 text-center text-xl font-semibold text-[var(--text-primary)]">
                    {title}
                </h2>
                {subtitle && (
                    <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">
                        {subtitle}
                    </p>
                )}
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-[var(--bg-primary)] py-8 px-4 shadow-[var(--shadow-md)] border border-[var(--border-subtle)] sm:rounded-2xl sm:px-10">
                    {children}
                </div>
            </div>
        </div>
    );
}
