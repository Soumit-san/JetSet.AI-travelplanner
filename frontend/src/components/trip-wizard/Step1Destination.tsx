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
    const [activeIndex, setActiveIndex] = useState(-1);
    const [selectedDestination, setSelectedDestination] = useState<DestinationResult | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const selectedRef = useRef<string | null>(null);

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
        // Reset state if query is too small
        if (!query || query.length < 2) {
            setSuggestions([]);
            return;
        }

        // Short circuit if this change was triggered by a user selection
        if (query === selectedRef.current) return;

        const delayDebounceFn = setTimeout(async () => {
            setIsLoading(true);
            try {
                // Fetch from Next.js configured base URL or fallback to localhost
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
                const response = await fetch(`${baseUrl}/destinations/search?q=${encodeURIComponent(query)}`);

                if (response.ok) {
                    const data = await response.json();
                    setSuggestions(data);
                    setShowDropdown(true);
                    setActiveIndex(-1); // Reset keyboard interaction mapping
                } else {
                    // Handle failure gracefully to avoid crashing array mappers
                    setSuggestions([]);
                    setShowDropdown(false);
                    console.error(`Geocoding failed with status: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                // Catch DNS network errors completely isolated from HTTP statuses
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
        setSelectedDestination(result);
        form.setValue("destination", result.name, { shouldValidate: true });
        setShowDropdown(false);
        setActiveIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showDropdown || suggestions.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeIndex >= 0 && activeIndex < suggestions.length) {
                handleSelect(suggestions[activeIndex]);
            }
        } else if (e.key === "Escape") {
            setShowDropdown(false);
        }
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
                                    onChange={(e) => {
                                        // User typed something manually, remove explicit selection cache
                                        selectedRef.current = null;
                                        field.onChange(e);
                                    }}
                                    onFocus={() => {
                                        if (suggestions.length > 0) setShowDropdown(true);
                                    }}
                                    onKeyDown={handleKeyDown}
                                    role="combobox"
                                    aria-expanded={showDropdown}
                                    aria-autocomplete="list"
                                    aria-controls="destination-listbox"
                                    aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
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
                                <ul
                                    id="destination-listbox"
                                    role="listbox"
                                    className="max-h-60 overflow-y-auto custom-scrollbar"
                                >
                                    {suggestions.map((s, idx) => (
                                        <li
                                            key={s.id}
                                            id={`suggestion-${idx}`}
                                            role="option"
                                            aria-selected={activeIndex === idx}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => handleSelect(s)}
                                                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors border-b border-white/5 last:border-0 ${activeIndex === idx ? "bg-white/20" : "hover:bg-white/10"
                                                    }`}
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
                            selectedRef.current = city;
                            form.setValue("destination", city, { shouldValidate: true });
                            setShowDropdown(false);
                            setActiveIndex(-1);
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
