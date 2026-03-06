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
import { MapPin, Search, Loader2 } from "lucide-react";

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

export default function Step1Destination({ form }: Step1Props) {
    const [suggestions, setSuggestions] = useState<DestinationResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const query = form.watch("destination");

    // Click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounced Search Fetch
    useEffect(() => {
        // Don't search if query is empty or we just selected an item
        if (!query || query.length < 2) {
            setSuggestions([]);
            return;
        }

        // Extremely basic check to see if we just selected something (to prevent re-fetching the selected name)
        const isSelectedName = suggestions.some(s => s.name === query);
        if (isSelectedName) return;

        const delayDebounceFn = setTimeout(async () => {
            setIsLoading(true);
            try {
                // Fetch from our new NestJS Backend
                const response = await fetch(`http://localhost:3001/destinations/search?q=${encodeURIComponent(query)}`);
                if (response.ok) {
                    const data = await response.json();
                    setSuggestions(data);
                    setShowDropdown(true);
                }
            } catch (error) {
                console.error("Geocoding fetch failed:", error);
            } finally {
                setIsLoading(false);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSelect = (result: DestinationResult) => {
        form.setValue("destination", result.name, { shouldValidate: true });
        setShowDropdown(false);
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-display text-white">Where do you want to go?</h3>
                <p className="text-white/60 mt-2">Enter a city, country, or region.</p>
            </div>

            <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                    <FormItem className="relative" ref={dropdownRef}>
                        <FormLabel className="sr-only">Destination</FormLabel>
                        <FormControl>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-vivid h-5 w-5 transition-transform group-focus-within:scale-110" />

                                <Input
                                    placeholder="e.g. Kyoto, Japan"
                                    {...field}
                                    onFocus={() => {
                                        if (suggestions.length > 0) setShowDropdown(true);
                                    }}
                                    className="pl-12 pr-12 h-14 text-lg glass-input text-white placeholder:text-white/40 border-white/20 focus:border-sky-glow focus:ring-1 focus:ring-sky-glow rounded-xl transition-all w-full"
                                />

                                {isLoading && (
                                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-sky-vivid h-5 w-5 animate-spin" />
                                )}
                            </div>
                        </FormControl>

                        {/* Dropdown Menu */}
                        {showDropdown && suggestions.length > 0 && (
                            <div className="absolute w-full top-full mt-2 z-50 glass-panel rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/20 animate-in fade-in slide-in-from-top-2">
                                <ul className="max-h-60 overflow-y-auto custom-scrollbar">
                                    {suggestions.map((s) => (
                                        <li key={s.id}>
                                            <button
                                                type="button"
                                                onClick={() => handleSelect(s)}
                                                className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
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

            {/* Decorative Elements */}
            <div className="pt-8 flex justify-center flex-wrap gap-3">
                {["Tokyo, Japan", "Paris, France", "Bali, Indonesia", "New York, United States"].map((city) => (
                    <button
                        key={city}
                        type="button"
                        onClick={() => {
                            form.setValue("destination", city, { shouldValidate: true });
                            setShowDropdown(false);
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
