import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plane, Clock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface FlightCardProps {
    flight: any;
}

const MAP_TO_AIRLINE: Record<string, string> = {
    // Indian Airlines
    "AI": "Air India",
    "6E": "IndiGo",
    "UK": "Vistara",
    "SG": "SpiceJet",
    "QP": "Akasa Air",
    "I5": "AIX Connect",
    "IX": "Air India Express",
    // International Airlines
    "AA": "American Airlines",
    "DL": "Delta Air Lines",
    "UA": "United Airlines",
    "BA": "British Airways",
    "EK": "Emirates",
    "QR": "Qatar Airways",
    "EY": "Etihad Airways",
    "SQ": "Singapore Airlines",
    "LH": "Lufthansa",
    "AF": "Air France",
    "JL": "Japan Airlines",
    "NH": "ANA",
    "CX": "Cathay Pacific",
    "AC": "Air Canada",
    "QF": "Qantas",
    "VS": "Virgin Atlantic",
    "TK": "Turkish Airlines",
    "KL": "KLM",
    "NZ": "Air New Zealand",
    "FZ": "flydubai",
    "MH": "Malaysia Airlines",
    "TG": "Thai Airways"
};

export function FlightCard({ flight }: FlightCardProps) {
    // Amadeus returns itineraries. Let's just grab the outbound itinerary for display
    const outbound = flight.itineraries?.[0];
    const segments = outbound?.segments || [];
    const firstSegment = segments[0];
    const lastSegment = segments[segments.length - 1];

    if (!firstSegment || !lastSegment) return null;

    const departure = new Date(firstSegment.departure.at);
    const arrival = new Date(lastSegment.arrival.at);
    const duration = outbound.duration?.replace('PT', '').toLowerCase(); // e.g. PT5H30M -> 5h30m
    const currency = flight.price?.currency;
    const price = flight.price?.total;
    const stops = segments.length - 1;
    const orgCode = firstSegment.departure.iataCode;
    const destCode = lastSegment.arrival.iataCode;

    // Format the date DDMMYYYY for MakeMyTrip / Ixigo
    const mmtDate = `${departure.getDate().toString().padStart(2, '0')}${((departure.getMonth() + 1)).toString().padStart(2, '0')}${departure.getFullYear()}`;

    const airlineName = MAP_TO_AIRLINE[firstSegment.carrierCode] || `${firstSegment.carrierCode} Airlines`;
    const operatingAirline = firstSegment.operating?.carrierCode
        ? MAP_TO_AIRLINE[firstSegment.operating.carrierCode] || firstSegment.operating.carrierCode
        : airlineName;

    // Deterministically rotate between providers based on the flight ID's characters
    const providers = [
        { name: "MakeMyTrip", url: `https://www.makemytrip.com/flight/search?itinerary=${orgCode}-${destCode}-${mmtDate}&tripType=O&paxType=A-1_C-0_I-0&intl=false&cabinClass=E` },
        { name: "Ixigo", url: `https://www.ixigo.com/search/result/flight?from=${orgCode}&to=${destCode}&date=${mmtDate}&returnDate=&adults=1&children=0&infants=0&class=e` },
        { name: "Goibibo", url: `https://www.goibibo.com/flights/air-${orgCode}-${destCode}-${departure.getFullYear()}${((departure.getMonth() + 1)).toString().padStart(2, '0')}${departure.getDate().toString().padStart(2, '0')}--1-0-0-E-D/` }
    ];
    // Simple hash to consistently pick a provider based on flight ID
    const providerIndex = flight.id ? flight.id.charCodeAt(0) % providers.length : 0;
    const provider = providers[providerIndex];

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.1)] p-6 overflow-hidden group hover:bg-white/15 transition-all duration-300"
        >
            <div className="absolute top-0 right-0 p-4 opacity-50 text-xs font-mono">
                {flight.id}
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Airlines & Basic Info */}
                <div className="flex items-center gap-4 w-full md:w-1/3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center border border-white/30 text-lg font-bold">
                        {firstSegment.carrierCode}
                    </div>
                    <div>
                        <h4 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                            {airlineName}
                        </h4>
                        <p className="text-sm font-mono text-slate-500 dark:text-slate-400">
                            Operated by {operatingAirline}
                        </p>
                    </div>
                </div>

                {/* Route Graph */}
                <div className="flex-1 w-full flex items-center justify-center px-4 font-mono">
                    <div className="text-right">
                        <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-500">
                            {departure.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-slate-500 text-sm">{firstSegment.departure.iataCode}</p>
                    </div>

                    <div className="flex flex-col items-center justify-center flex-1 px-4 relative">
                        <p className="text-xs text-slate-400 mb-1">{duration}</p>
                        <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-sky-400 to-transparent relative flex items-center justify-center">
                            <Plane className="w-4 h-4 text-sky-500 absolute bg-white/50 dark:bg-black/50 rounded-full p-0.5" />
                        </div>
                        <p className="text-xs font-medium mt-1 text-slate-500">
                            {stops === 0 ? 'Direct' : `${stops} Stop${stops > 1 ? 's' : ''}`}
                        </p>
                    </div>

                    <div className="text-left">
                        <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-500">
                            {arrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-slate-500 text-sm">{lastSegment.arrival.iataCode}</p>
                    </div>
                </div>

                {/* Price & Action */}
                <div className="w-full md:w-1/4 flex flex-row md:flex-col items-center justify-between md:justify-end gap-3 font-mono">
                    <div className="flex flex-col md:items-end">
                        <p className="text-sm text-slate-500">Price per adult</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                            {currency} {price}
                        </p>
                    </div>
                    <div className="flex flex-col md:items-end w-full md:w-auto mt-2 md:mt-0">
                        <Button
                            asChild
                            className="w-full md:w-auto bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 text-white shadow-lg border-none group-hover:scale-105 transition-transform"
                        >
                            <a href={provider.url} target="_blank" rel="noopener noreferrer">
                                Book on {provider.name}
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
