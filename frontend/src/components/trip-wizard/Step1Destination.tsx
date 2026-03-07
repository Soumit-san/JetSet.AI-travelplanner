import { useState, useEffect, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { TripFormValues } from "./TripWizard";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MapPin, Search, PlaneTakeoff, Loader2 } from "lucide-react";

interface Step1Props {
    form: UseFormReturn<TripFormValues>;
}

interface DestinationResult {
    id: string;
    name: string;
    country: string;
    lat: number;
    lon: number;
}

// Reusable hook for Location Search to avoid duplicating logic for Origin and Destination
function useLocationSearch(query: string, fieldName: "origin" | "destination", form: UseFormReturn<TripFormValues>) {
    const [suggestions, setSuggestions] = useState<DestinationResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const selectedRef = useRef<string | null>(null);

    useEffect(() => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            return;
        }
        if (query === selectedRef.current) return;

        const delayDebounceFn = setTimeout(async () => {
            setIsLoading(true);
            try {
                const baseUrl = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL
                    ? process.env.NEXT_PUBLIC_API_URL
                    : "http://localhost:3001";
                const response = await fetch(`${baseUrl}/destinations/search?q=${encodeURIComponent(query)}`);

                if (response.ok) {
                    const data = await response.json();
                    setSuggestions(data);
                    setShowDropdown(true);
                    setActiveIndex(-1);
                } else {
                    setSuggestions([]);
                    setShowDropdown(false);
                }
            } catch (error) {
                setSuggestions([]);
                setShowDropdown(false);
                console.error("Geocoding fetch completely failed:", error);
            } finally {
                setIsLoading(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSelect = (result: DestinationResult) => {
        selectedRef.current = result.name;
        form.setValue(fieldName, result.name, { shouldValidate: true });
        setShowDropdown(false);
        setActiveIndex(-1);
    };

    return { suggestions, isLoading, showDropdown, setShowDropdown, activeIndex, setActiveIndex, selectedRef, handleSelect };
}

export default function Step1Destination({ form }: Step1Props) {
    const originQuery = form.watch("origin");
    const destQuery = form.watch("destination");

    const originSearch = useLocationSearch(originQuery, "origin", form);
    const destSearch = useLocationSearch(destQuery, "destination", form);

    const originRef = useRef<HTMLDivElement>(null);
    const destRef = useRef<HTMLDivElement>(null);

    // Click outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (originRef.current && !originRef.current.contains(event.target as Node)) {
                originSearch.setShowDropdown(false);
            }
            if (destRef.current && !destRef.current.contains(event.target as Node)) {
                destSearch.setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [originSearch, destSearch]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, searchState: ReturnType<typeof useLocationSearch>) => {
        if (!searchState.showDropdown || searchState.suggestions.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            searchState.setActiveIndex((prev) => (prev < searchState.suggestions.length - 1 ? prev + 1 : prev));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            searchState.setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (searchState.activeIndex >= 0 && searchState.activeIndex < searchState.suggestions.length) {
                searchState.handleSelect(searchState.suggestions[searchState.activeIndex]);
            }
        } else if (e.key === "Escape") {
            searchState.setShowDropdown(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-display text-white">Where are you traveling?</h3>
                <p className="text-white/60 mt-2">Enter your origin and dream destination.</p>
            </div>

            <div className="space-y-4">
                {/* ORIGIN INPUT */}
                <FormField
                    control={form.control}
                    name="origin"
                    render={({ field }) => (
                        <FormItem className="relative" ref={originRef}>
                            <FormLabel className="sr-only">Origin</FormLabel>
                            <FormControl>
                                <div className="relative group">
                                    <PlaneTakeoff className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-vivid h-5 w-5 transition-transform group-focus-within:scale-110" />

                                    <Input
                                        placeholder="Leaving from... (e.g. London, UK)"
                                        {...field}
                                        onChange={(e) => {
                                            originSearch.selectedRef.current = null;
                                            field.onChange(e);
                                        }}
                                        onFocus={() => {
                                            if (originSearch.suggestions.length > 0) originSearch.setShowDropdown(true);
                                        }}
                                        onKeyDown={(e) => handleKeyDown(e, originSearch)}
                                        role="combobox"
                                        aria-expanded={originSearch.showDropdown}
                                        aria-autocomplete="list"
                                        aria-controls="origin-listbox"
                                        aria-activedescendant={originSearch.activeIndex >= 0 ? `suggestion-origin-${originSearch.activeIndex}` : undefined}
                                        className="pl-12 pr-12 h-14 text-lg glass-input text-white placeholder:text-white/40 border-white/20 focus:border-sky-glow focus:ring-1 focus:ring-sky-glow rounded-xl transition-all w-full"
                                    />

                                    {originSearch.isLoading && (
                                        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-sky-vivid h-5 w-5 animate-spin" />
                                    )}
                                </div>
                            </FormControl>

                            {originSearch.showDropdown && originSearch.suggestions.length > 0 && (
                                <div className="absolute w-full top-full mt-2 z-50 glass-panel rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/20 animate-in fade-in slide-in-from-top-2">
                                    <ul id="origin-listbox" role="listbox" className="max-h-60 overflow-y-auto custom-scrollbar">
                                        {originSearch.suggestions.map((s, idx) => (
                                            <li key={s.id} id={`suggestion-origin-${idx}`} role="option" aria-selected={originSearch.activeIndex === idx}>
                                                <button
                                                    type="button"
                                                    onClick={() => originSearch.handleSelect(s)}
                                                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors border-b border-white/5 last:border-0 ${originSearch.activeIndex === idx ? "bg-white/20" : "hover:bg-white/10"}`}
                                                >
                                                    <MapPin className="text-sky-400 h-4 w-4 shrink-0" />
                                                    <span className="text-white truncate">{s.name}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <FormMessage className="text-pink-400" />
                        </FormItem>
                    )}
                />

                {/* DESTINATION INPUT */}
                <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                        <FormItem className="relative" ref={destRef}>
                            <FormLabel className="sr-only">Destination</FormLabel>
                            <FormControl>
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-vivid h-5 w-5 transition-transform group-focus-within:scale-110" />

                                    <Input
                                        placeholder="Going to... (e.g. Kyoto, Japan)"
                                        {...field}
                                        onChange={(e) => {
                                            destSearch.selectedRef.current = null;
                                            field.onChange(e);
                                        }}
                                        onFocus={() => {
                                            if (destSearch.suggestions.length > 0) destSearch.setShowDropdown(true);
                                        }}
                                        onKeyDown={(e) => handleKeyDown(e, destSearch)}
                                        role="combobox"
                                        aria-expanded={destSearch.showDropdown}
                                        aria-autocomplete="list"
                                        aria-controls="destination-listbox"
                                        aria-activedescendant={destSearch.activeIndex >= 0 ? `suggestion-dest-${destSearch.activeIndex}` : undefined}
                                        className="pl-12 pr-12 h-14 text-lg glass-input text-white placeholder:text-white/40 border-white/20 focus:border-sky-glow focus:ring-1 focus:ring-sky-glow rounded-xl transition-all w-full"
                                    />

                                    {destSearch.isLoading && (
                                        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-sky-vivid h-5 w-5 animate-spin" />
                                    )}
                                </div>
                            </FormControl>

                            {destSearch.showDropdown && destSearch.suggestions.length > 0 && (
                                <div className="absolute w-full top-full mt-2 z-50 glass-panel rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/20 animate-in fade-in slide-in-from-top-2">
                                    <ul id="destination-listbox" role="listbox" className="max-h-60 overflow-y-auto custom-scrollbar">
                                        {destSearch.suggestions.map((s, idx) => (
                                            <li key={s.id} id={`suggestion-dest-${idx}`} role="option" aria-selected={destSearch.activeIndex === idx}>
                                                <button
                                                    type="button"
                                                    onClick={() => destSearch.handleSelect(s)}
                                                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors border-b border-white/5 last:border-0 ${destSearch.activeIndex === idx ? "bg-white/20" : "hover:bg-white/10"}`}
                                                >
                                                    <MapPin className="text-sky-400 h-4 w-4 shrink-0" />
                                                    <span className="text-white truncate">{s.name}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <FormMessage className="text-pink-400" />
                        </FormItem>
                    )}
                />

            </div>

            {/* Decorative Elements */}
            <div className="pt-8 flex justify-center flex-wrap gap-3">
                {["Tokyo, Japan", "Paris, France", "Bali, Indonesia", "New York, US"].map((city) => (
                    <button
                        key={city}
                        type="button"
                        onClick={() => {
                            destSearch.selectedRef.current = city;
                            form.setValue("destination", city, { shouldValidate: true });
                            destSearch.setShowDropdown(false);
                            destSearch.setActiveIndex(-1);
                        }}
                        className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-white/70 shadow-sm hover:shadow-[0_0_15px_rgba(96,165,250,0.3)] hover:bg-white/10 hover:text-white hover:border-sky-vivid/50 transition-all focus:outline-none focus:ring-2 focus:ring-sky-glow"
                    >
                        {city}
                    </button>
                ))}
            </div>
        </div>
    );
}
