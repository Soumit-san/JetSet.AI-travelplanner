"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plane, Hotel, CloudSun, Map, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

// Stub Components for the Modules
import FlightsModule from "./modules/FlightsModule";
import HotelsModule from "./modules/HotelsModule";
import SeasonModule from "./modules/SeasonModule";
import ItineraryModule from "./modules/ItineraryModule";
import SummaryModule from "./modules/SummaryModule";

interface ResultsDashboardProps {
    tripId: string;
    org?: string;
    dest?: string;
    dates?: string;
    curr?: string;
}

const TABS = [
    { id: "summary", label: "AI Summary", icon: Sparkles, color: "text-violet-400" },
    { id: "flights", label: "Flights", icon: Plane, color: "text-sky-vivid" },
    { id: "hotels", label: "Stays", icon: Hotel, color: "text-emerald-400" },
    { id: "season", label: "When to Go", icon: CloudSun, color: "text-amber-400" },
    { id: "itinerary", label: "Itinerary", icon: Map, color: "text-cyan-400" },
];

export default function ResultsDashboard({ tripId, org, dest, dates, curr }: ResultsDashboardProps) {
    const [activeTab, setActiveTab] = useState("summary");

    return (
        <div className="w-full flex justify-center">
            <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v)}
                className="w-full relative"
            >
                <div className="sticky top-4 z-50 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                    <TabsList className="glass-panel h-16 w-full max-w-fit mx-auto bg-ink-900/40 border-white/10 p-2 rounded-2xl flex gap-2">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className={`
                                        h-full rounded-xl px-4 md:px-6 transition-all duration-300 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:shadow-lg
                                        text-white/60 hover:text-white/80 border border-transparent data-[state=active]:border-white/10 relative overflow-hidden group
                                    `}
                                >
                                    <div className="flex items-center gap-2 md:gap-3 z-10 relative">
                                        <Icon className={`w-5 h-5 transition-colors ${isActive ? tab.color : 'group-hover:text-white'}`} />
                                        <span className={`font-medium hidden sm:block ${isActive ? 'text-white' : ''}`}>
                                            {tab.label}
                                        </span>
                                    </div>

                                    {/* Active Tab Glow */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTabGlow"
                                            className="absolute inset-0 bg-white/5 z-0"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>
                </div>

                <div className="mt-8 relative min-h-[500px]">
                    <TabsContent value="summary" className="mt-0 focus-visible:ring-0 outline-none">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                            <SummaryModule tripId={tripId} />
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="flights" className="mt-0 focus-visible:ring-0 outline-none">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                            <FlightsModule tripId={tripId} org={org} dest={dest} dates={dates} curr={curr} />
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="hotels" className="mt-0 focus-visible:ring-0 outline-none">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                            <HotelsModule tripId={tripId} />
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="season" className="mt-0 focus-visible:ring-0 outline-none">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                            <SeasonModule tripId={tripId} />
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="itinerary" className="mt-0 focus-visible:ring-0 outline-none">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                            <ItineraryModule tripId={tripId} />
                        </motion.div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
