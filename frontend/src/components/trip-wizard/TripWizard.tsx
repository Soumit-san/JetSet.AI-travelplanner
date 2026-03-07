"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import Step1Destination from "./Step1Destination";
import Step2Dates from "./Step2Dates";
import Step3Preferences from "./Step3Preferences";

// Define the form schema
export const tripFormSchema = z.object({
    origin: z.string().min(2, {
        message: "Origin must be at least 2 characters.",
    }),
    destination: z.string().min(2, {
        message: "Destination must be at least 2 characters.",
    }),
    dateRange: z.object({
        from: z.date().optional(),
        to: z.date().optional(),
    }).refine((data) => data.from && data.to, {
        message: "Please select start and end dates.",
    }),
    budget: z.string().min(1, "Please select a budget level"),
    companions: z.string().min(1, "Please select who you are traveling with"),
    interests: z.array(z.string()).min(1, "Select at least one interest"),
    currency: z.string().optional(),
});

export type TripFormValues = z.infer<typeof tripFormSchema>;

const generatePlaceholderId = () => `trip-${Date.now()}-${Math.random().toString(36).substring(7)}`;

export default function TripWizard() {
    const [step, setStep] = useState(1);
    const totalSteps = 3;

    const form = useForm<TripFormValues>({
        resolver: zodResolver(tripFormSchema),
        defaultValues: {
            origin: "",
            destination: "",
            dateRange: {
                from: undefined,
                to: undefined,
            },
            budget: "",
            companions: "",
            interests: [],
            currency: "",
        },
        mode: "onChange",
    });

    const router = useRouter();
    const onSubmit = async (data: TripFormValues) => {
        // TODO: [TASK-1] Implement real API integration for Trip Planning Submission
        // 1. Endpoint: POST `/api/trip-plan` or equivalent NestJS/NextRoute.
        // 2. Payload Shape: Sanitize `data` (e.g., convert dataRange dates to ISO strings).
        // 3. Form State: Set a loading state variable to disable the submit button and show a spinner.
        // 4. On Success: Navigate user to the Results Dashboard (`/results/:id`) populated with initial skeleton loaders.
        // 5. On Failure: Catch error, toggle loading off, and show a destructive toast notification to the user.
        console.log("Form Submitted:", data);

        const placeholderId = generatePlaceholderId();

        const orgParam = encodeURIComponent(data.origin);
        const destParam = encodeURIComponent(data.destination);

        const displayDates = data.dateRange?.from
            ? `${data.dateRange.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${data.dateRange.to ? data.dateRange.to.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}`
            : '';

        const exactDates = data.dateRange?.from
            ? `${data.dateRange.from.toISOString().split("T")[0]}${data.dateRange.to ? '_' + data.dateRange.to.toISOString().split("T")[0] : ''}`
            : '';

        const displayDatesParam = encodeURIComponent(displayDates);
        const datesParam = encodeURIComponent(exactDates);
        const currParam = data.currency ? `&curr=${data.currency}` : '';

        router.push(`/results/${placeholderId}?org=${orgParam}&dest=${destParam}&dates=${datesParam}&displayDates=${displayDatesParam}${currParam}`);
    };

    const nextStep = async () => {
        // Validate current step before moving
        let fieldsToValidate: (keyof TripFormValues)[] = [];
        if (step === 1) fieldsToValidate = ["origin", "destination"];
        else if (step === 2) fieldsToValidate = ["dateRange", "budget"];
        else if (step === 3) fieldsToValidate = ["companions", "interests"];

        const isStepValid = await form.trigger(fieldsToValidate);
        if (isStepValid) {
            setStep((prev) => Math.min(prev + 1, totalSteps));
        }
    };

    const prevStep = () => {
        setStep((prev) => Math.max(prev - 1, 1));
    };

    return (
        <div className="w-full max-w-2xl mx-auto glass-panel rounded-2xl p-6 md:p-10 relative overflow-hidden">
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 h-1 bg-white/10 w-full">
                <div
                    className="h-full bg-sky-glow transition-all duration-500 ease-in-out"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                />
            </div>

            <div className="text-center mb-8">
                <h2 className="text-3xl font-display text-white mb-2">Plan Your Next Escape</h2>
                <p className="text-sky-vivid/80 font-mono text-sm uppercase tracking-widest">
                    Step {step} of {totalSteps}
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="relative min-h-[300px]">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Step1Destination form={form} />
                                </motion.div>
                            )}
                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Step2Dates form={form} />
                                </motion.div>
                            )}
                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Step3Preferences form={form} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={prevStep}
                            className={`text-white/70 hover:text-white hover:bg-white/10 ${step === 1 ? "invisible" : ""
                                }`}
                        >
                            Back
                        </Button>

                        {step < totalSteps ? (
                            <Button
                                type="button"
                                onClick={nextStep}
                                className="bg-sky-pure hover:bg-sky-deep text-white shadow-[0_0_15px_rgba(96,165,250,0.5)] transition-all"
                            >
                                Continue
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all"
                            >
                                Find My Trip
                            </Button>
                        )}
                    </div>
                </form>
            </Form>
        </div>
    );
}
