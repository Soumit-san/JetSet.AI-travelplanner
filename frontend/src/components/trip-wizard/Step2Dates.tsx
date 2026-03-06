import { UseFormReturn } from "react-hook-form";
import { TripFormValues } from "./TripWizard";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Wallet } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Step2Props {
    form: UseFormReturn<TripFormValues>;
}

const BUDGET_TIERS = [
    { id: "budget", label: "Budget", desc: "Hostels & Street Food" },
    { id: "moderate", label: "Moderate", desc: "3★ Hotels & Local Dining" },
    { id: "luxury", label: "Luxury", desc: "5★ Resorts & Fine Dining" },
];

export default function Step2Dates({ form }: Step2Props) {
    return (
        <div className="space-y-8">
            <div className="text-center mb-6">
                <h3 className="text-2xl font-display text-white">When and How?</h3>
                <p className="text-white/60 mt-2">Set your travel dates and budget level.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Date Range Picker */}
                <FormField
                    control={form.control}
                    name="dateRange"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel className="text-white/80 font-mono text-sm uppercase mb-2">Travel Dates</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full h-14 pl-4 text-left font-normal glass-input text-white border-white/20 hover:bg-white/10 hover:text-white justify-start",
                                                !field.value?.from && "text-white/40"
                                            )}
                                        >
                                            <CalendarIcon className="mr-4 h-5 w-5 text-sky-vivid" />
                                            {field.value?.from ? (
                                                field.value.to ? (
                                                    <>
                                                        {format(field.value.from, "LLL dd, y")} -{" "}
                                                        {format(field.value.to, "LLL dd, y")}
                                                    </>
                                                ) : (
                                                    format(field.value.from, "LLL dd, y")
                                                )
                                            ) : (
                                                <span>Pick dates</span>
                                            )}
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 glass-panel border-white/20 bg-ink-900/95 shadow-2xl z-50" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={field.value?.from}
                                        selected={{
                                            from: field.value?.from,
                                            to: field.value?.to,
                                        }}
                                        onSelect={field.onChange}
                                        numberOfMonths={2}
                                        className="text-white"
                                        classNames={{
                                            day_selected: "bg-sky-pure text-white hover:bg-sky-pure hover:text-white focus:bg-sky-pure focus:text-white",
                                            day_today: "bg-white/10 text-white",
                                            day_range_middle: "bg-sky-pure/20 text-white",
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage className="text-pink-400" />
                        </FormItem>
                    )}
                />

                {/* Budget Selector */}
                <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel className="text-white/80 font-mono text-sm uppercase mb-2">Budget per Person</FormLabel>
                            <FormControl>
                                <div className="relative group w-full">
                                    <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 h-5 w-5" />
                                    <select
                                        {...field}
                                        className="w-full h-14 pl-12 pr-10 text-base glass-input text-white appearance-none border-white/20 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 rounded-md transition-all outline-none bg-transparent"
                                    >
                                        <option value="" disabled className="bg-ink-900 text-white/50">Select tier</option>
                                        {BUDGET_TIERS.map(tier => (
                                            <option key={tier.id} value={tier.id} className="bg-ink-800 text-white">
                                                {tier.label} - {tier.desc}
                                            </option>
                                        ))}
                                    </select>
                                    {/* Custom Arrow */}
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                                        ▼
                                    </div>
                                </div>
                            </FormControl>
                            <FormMessage className="text-pink-400" />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
}
