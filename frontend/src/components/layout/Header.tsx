'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plane, AlertTriangle } from 'lucide-react';
import { EmergencyPanel } from '@/components/emergency/EmergencyPanel';

export function Header() {
    const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);

    return (
        <>
            <header className="fixed top-0 inset-x-0 z-50 bg-ink-900/40 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center transform group-hover:scale-105 transition-all shadow-[0_0_15px_rgba(56,189,248,0.5)]">
                                <Plane className="w-6 h-6 text-white -rotate-45 relative right-0.5 top-0.5" />
                            </div>
                            <span className="font-syne font-bold text-xl tracking-tight text-white hidden sm:block">
                                JetSet<span className="text-sky-400">.AI</span>
                            </span>
                        </Link>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsEmergencyOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all font-medium text-sm shadow-[0_0_15px_rgba(239,68,68,0.15)] group"
                            >
                                <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
                                <span className="hidden sm:inline">Emergency Flights</span>
                                <span className="sm:hidden">Rescue</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mount the Global Emergency Panel Drawer */}
            <EmergencyPanel isOpen={isEmergencyOpen} onClose={() => setIsEmergencyOpen(false)} />
        </>
    );
}
