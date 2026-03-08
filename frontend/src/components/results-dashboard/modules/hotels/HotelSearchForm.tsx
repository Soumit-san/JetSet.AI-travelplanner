import { useState, useRef } from "react";
import { Search, MapPin, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HotelSearchFormProps {
    onSearch: (cityCode: string, dates?: string, guests?: string) => void;
    isLoading: boolean;
    dates?: string;
}

export default function HotelSearchForm({ onSearch, isLoading, dates }: HotelSearchFormProps) {
    const [cityInput, setCityInput] = useState("");
    const [dateInput, setDateInput] = useState(dates || "");
    const [guestInput, setGuestInput] = useState("2 Adults, 1 Room");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setCityInput(val);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        if (val.length < 3) {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
            }
            setSuggestions([]);
            return;
        }

        timeoutRef.current = setTimeout(async () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            abortControllerRef.current = new AbortController();

            try {
                setIsFetchingSuggestions(true);
                const params = new URLSearchParams({ keyword: val }).toString();
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotels/autocomplete?${params}`, {
                    signal: abortControllerRef.current.signal
                });
                if (res.ok) {
                    const data = await res.json();
                    setSuggestions(data.data || []);
                }
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    console.error("Failed to fetch autocomplete", error);
                }
            } finally {
                setIsFetchingSuggestions(false);
            }
        }, 300);
    };

    const handleSelectSuggestion = (suggestion: any) => {
        const code = suggestion.address?.cityCode || suggestion.iataCode || "";
        setCityInput(code);
        setSuggestions([]);
        if (code) {
            onSearch(code, dateInput, guestInput);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (cityInput.length >= 3) {
            onSearch(cityInput.toUpperCase(), dateInput, guestInput);
            setSuggestions([]);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative z-10 w-full mb-8">
            <div className="flex flex-col md:flex-row items-center bg-[#151923] border border-white/5 rounded-2xl p-2 shadow-2xl">

                {/* Location Input */}
                <div className="flex-1 w-full relative flex items-center p-3 md:border-r border-white/10">
                    <MapPin className="w-5 h-5 text-emerald-500 mr-4" />
                    <div className="flex-1">
                        <label className="text-[10px] font-bold tracking-wider text-white/40 uppercase mb-1 block">Location</label>
                        <input
                            className="w-full bg-transparent border-none text-white placeholder:text-white/30 focus:outline-none focus:ring-0 text-sm font-medium"
                            placeholder="Enter city or airport (e.g. PAR)"
                            value={cityInput || ""}
                            onChange={handleInput}
                            disabled={isLoading}
                        />
                    </div>
                    {/* Autocomplete Dropdown */}
                    {(suggestions.length > 0 || isFetchingSuggestions) && (
                        <div className="absolute top-[calc(100%+12px)] left-0 w-[300px] bg-[#151923] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-[60]">
                            {isFetchingSuggestions && suggestions.length === 0 && (
                                <div className="px-4 py-3 text-white/40 text-sm">Searching...</div>
                            )}
                            {suggestions.map((s) => {
                                const key = s.id || s.hotelId || s.iataCode || s.name || Math.random().toString();
                                const addressLine = [s.address?.cityName, s.address?.countryCode].filter(Boolean).join(', ');
                                const codeLabel = s.address?.cityCode ? ` (${s.address.cityCode})` : '';
                                return (
                                    <div
                                        key={key}
                                        className="px-4 py-3 hover:bg-white/5 cursor-pointer flex flex-col text-sm border-b border-white/5 last:border-0"
                                        onClick={() => handleSelectSuggestion(s)}
                                    >
                                        <span className="text-white font-medium">{s.name || 'Unknown location'}</span>
                                        <span className="text-white/50 text-xs">
                                            {addressLine ? `${addressLine}${codeLabel}` : 'Location unknown'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Dates Input */}
                <div className="flex-1 w-full flex items-center p-3 md:border-r border-white/10">
                    <Calendar className="w-5 h-5 text-emerald-500 mr-4" />
                    <div className="flex-1">
                        <label className="text-[10px] font-bold tracking-wider text-white/40 uppercase mb-1 block">Dates</label>
                        <input
                            type="text"
                            className="w-full bg-transparent border-none text-white placeholder:text-white/30 focus:outline-none focus:ring-0 text-sm font-medium"
                            placeholder="e.g. 2026-03-10 - 2026-03-15"
                            value={dateInput}
                            onChange={(e) => setDateInput(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {/* Guests Input */}
                <div className="flex-1 w-full flex items-center p-3">
                    <User className="w-5 h-5 text-emerald-500 mr-4" />
                    <div className="flex-1">
                        <label className="text-[10px] font-bold tracking-wider text-white/40 uppercase mb-1 block">Guests</label>
                        <input
                            type="text"
                            className="w-full bg-transparent border-none text-white placeholder:text-white/30 focus:outline-none focus:ring-0 text-sm font-medium"
                            placeholder="e.g. 2 Adults, 1 Room"
                            value={guestInput}
                            onChange={(e) => setGuestInput(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {/* Search Button */}
                <Button
                    type="submit"
                    className="w-full md:w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl flex items-center justify-center shrink-0 ml-2"
                    disabled={isLoading || cityInput.length < 3}
                >
                    {isLoading ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <Search className="w-5 h-5" />}
                </Button>
            </div>
        </form>
    );
}
