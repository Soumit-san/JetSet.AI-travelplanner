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
import { MapPin } from "lucide-react";

interface Step1Props {
    form: UseFormReturn<TripFormValues>;
}

export default function Step1Destination({ form }: Step1Props) {
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
                    <FormItem>
                        <FormLabel className="sr-only">Destination</FormLabel>
                        <FormControl>
                            <div className="relative group">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-vivid h-5 w-5 transition-transform group-focus-within:scale-110" />
                                <Input
                                    placeholder="e.g. Kyoto, Japan"
                                    {...field}
                                    className="pl-12 h-14 text-lg glass-input text-white placeholder:text-white/40 border-white/20 focus:border-sky-glow focus:ring-1 focus:ring-sky-glow rounded-xl transition-all w-full"
                                />
                            </div>
                        </FormControl>
                        <FormMessage className="text-pink-400" />
                    </FormItem>
                )}
            />

            {/* Decorative Elements */}
            <div className="pt-8 flex justify-center gap-4">
                {["Tokyo", "Paris", "Bali", "New York"].map((city) => (
                    <button
                        key={city}
                        type="button"
                        onClick={() => form.setValue("destination", city, { shouldValidate: true })}
                        className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-white/70 hover:bg-white/10 hover:text-white hover:border-sky-vivid/50 transition-all focus:outline-none focus:ring-2 focus:ring-sky-glow"
                    >
                        {city}
                    </button>
                ))}
            </div>
        </div>
    );
}
