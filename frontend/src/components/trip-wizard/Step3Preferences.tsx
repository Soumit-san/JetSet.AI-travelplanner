import { UseFormReturn } from "react-hook-form";
import { TripFormValues } from "./TripWizard";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

interface Step3Props {
    form: UseFormReturn<TripFormValues>;
}

const COMPANIONS = [
    { id: "solo", label: "Solo", icon: "🎒" },
    { id: "couple", label: "Couple", icon: "❤️" },
    { id: "family", label: "Family", icon: "👨‍👩‍👧‍👦" },
    { id: "friends", label: "Friends", icon: "🎉" },
];

const INTERESTS = [
    "Culture & History",
    "Food & Culinary",
    "Nature & Outdoors",
    "Relaxation & Spa",
    "Nightlife",
    "Shopping",
    "Adventure Sports",
    "Art & Museums"
];

const CURRENCIES = [
    { code: "", label: "Auto-detect by Location" },
    { code: "INR", label: "🇮🇳 Indian Rupee (INR)" },
    { code: "USD", label: "🇺🇸 US Dollar (USD)" },
    { code: "GBP", label: "🇬🇧 British Pound (GBP)" },
    { code: "EUR", label: "🇪🇺 Euro (EUR)" },
    { code: "JPY", label: "🇯🇵 Japanese Yen (JPY)" },
    { code: "AUD", label: "🇦🇺 Australian Dollar (AUD)" },
];

export default function Step3Preferences({ form }: Step3Props) {
    return (
        <div className="space-y-8">
            <div className="text-center mb-6">
                <h3 className="text-2xl font-display text-white">Your Travel Style</h3>
                <p className="text-white/60 mt-2">Tailoring the perfect itinerary for you.</p>
            </div>

            {/* Companions */}
            <FormField
                control={form.control}
                name="companions"
                render={({ field }) => (
                    <FormItem className="space-y-4">
                        <FormLabel className="text-white/80 font-mono text-sm uppercase">Who is traveling?</FormLabel>
                        <FormControl>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {COMPANIONS.map((companion) => {
                                    const isSelected = field.value === companion.id;
                                    return (
                                        <button
                                            key={companion.id}
                                            type="button"
                                            onClick={() => field.onChange(companion.id)}
                                            aria-pressed={isSelected}
                                            className={`
                        p-4 rounded-xl border transition-all flex flex-col items-center gap-2
                        ${isSelected
                                                    ? 'bg-sky-pure/20 border-sky-vivid shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30'
                                                }
                      `}
                                        >
                                            <span className="text-2xl">{companion.icon}</span>
                                            <span className={`font-medium ${isSelected ? 'text-white' : 'text-white/70'}`}>
                                                {companion.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </FormControl>
                        <FormMessage className="text-pink-400" />
                    </FormItem>
                )}
            />

            <div className="h-px w-full bg-white/10 rounded-full" />

            {/* Interests */}
            <FormField
                control={form.control}
                name="interests"
                render={({ field }) => {
                    const watchedInterests = form.watch("interests") || [];
                    return (
                        <FormItem className="space-y-4">
                            <FormLabel className="text-white/80 font-mono text-sm uppercase">What are you interested in?</FormLabel>
                            <div className="flex flex-wrap gap-3">
                                {INTERESTS.map((interest) => {
                                    const isSelected = watchedInterests.includes(interest);
                                    return (
                                        <FormField
                                            key={interest}
                                            control={form.control}
                                            name="interests"
                                            render={({ field }) => {
                                                return (
                                                    <FormItem key={interest}>
                                                        <FormControl>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const current = field.value || [];
                                                                    const updated = isSelected
                                                                        ? current.filter((i: string) => i !== interest)
                                                                        : [...current, interest];
                                                                    field.onChange(updated);
                                                                }}
                                                                aria-pressed={isSelected}
                                                                className={`
                                px-4 py-2 rounded-full border transition-all text-sm
                                ${isSelected
                                                                        ? 'bg-violet-500/20 border-violet-400 text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                                                                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/30 hover:text-white'
                                                                    }
                              `}
                                                            >
                                                                {interest}
                                                            </button>
                                                        </FormControl>
                                                    </FormItem>
                                                );
                                            }}
                                        />
                                    );
                                })}
                            </div>
                            <FormMessage className="text-pink-400" />
                        </FormItem>
                    );
                }}
            />

            <div className="h-px w-full bg-white/10 rounded-full" />

            {/* Currency Preference */}
            <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                    <FormItem className="space-y-4">
                        <FormLabel className="text-white/80 font-mono text-sm uppercase">Nationality / Preferred Currency</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <select
                                    {...field}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all cursor-pointer"
                                >
                                    {CURRENCIES.map(curr => (
                                        <option key={curr.code} value={curr.code} className="bg-slate-900 text-white">
                                            {curr.label}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-white/50">
                                    ▼
                                </div>
                            </div>
                        </FormControl>
                        <FormMessage className="text-pink-400" />
                    </FormItem>
                )}
            />
        </div>
    );
}
