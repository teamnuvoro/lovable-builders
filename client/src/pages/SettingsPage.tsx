import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { ArrowLeft, Save, Loader2, User, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { Switch } from "@/components/ui/switch";
import { Zap } from "lucide-react";

const settingsSchema = z.object({
    name: z.string().min(1, "Name is required"),
    gender: z.enum(["male", "female", "other", "prefer_not_to_say"]),
    phoneNumber: z.string().optional(),
    proactivityLevel: z.enum(["low", "medium", "high"]),
    checkInEnabled: z.boolean(),
    voiceProvider: z.enum(["sarvam", "elevenlabs"]),
    voiceId: z.string(),
    elevenLabsApiKey: z.string().optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
    const [, setLocation] = useLocation();
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const form = useForm<SettingsFormData>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            name: user?.name || "",
            gender: (user?.gender as any) || "prefer_not_to_say",
            phoneNumber: user?.phoneNumber || "",
            proactivityLevel: (user?.proactivityLevel as any) || "medium",
            checkInEnabled: user?.checkInEnabled ?? true,
            voiceProvider: (user?.voiceProvider as any) || "elevenlabs",
            voiceId: user?.voiceId || "21m00Tcm4TlvDq8ikWAM",
            elevenLabsApiKey: user?.elevenLabsApiKey || "",
        },
    });

    // Update form when user data changes (e.g. after initial load or update)
    useEffect(() => {
        if (user) {
            form.reset({
                name: user.name || "",
                gender: (user.gender as any) || "prefer_not_to_say",
                phoneNumber: user.phoneNumber || "",
                proactivityLevel: (user.proactivityLevel as any) || "medium",
                checkInEnabled: user.checkInEnabled ?? true,
                voiceProvider: (user.voiceProvider as any) || "elevenlabs",
                voiceId: user.voiceId || "21m00Tcm4TlvDq8ikWAM",
                elevenLabsApiKey: user.elevenLabsApiKey || "",
            });
        }
    }, [user, form]);

    const updateProfileMutation = useMutation({
        mutationFn: async (data: SettingsFormData) => {
            const response = await apiRequest("PATCH", "/api/user", data);
            return response.json();
        },
        onSuccess: (data) => {
            toast({
                title: "Profile Updated",
                description: "Your settings have been saved successfully.",
            });
            // Invalidate auth query to refresh user data
            queryClient.invalidateQueries({ queryKey: ["/api/auth/session"] });
        },
        onError: (error: any) => {
            toast({
                title: "Update Failed",
                description: error.message || "Failed to update profile",
                variant: "destructive",
            });
        },
    });

    const onSubmit = (data: SettingsFormData) => {
        updateProfileMutation.mutate(data);
    };

    return (
        <div className="h-full w-full bg-background flex flex-col overflow-auto">
            {/* Header */}
            <header className="h-16 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10 px-4 flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setLocation("/")}
                    className="rounded-full hover:bg-secondary/20"
                >
                    <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                </Button>
                <h1 className="text-xl font-bold text-foreground">Settings</h1>
            </header>

            {/* Content */}
            <main className="flex-1 container max-w-2xl mx-auto p-4 space-y-6">
                {/* Subscription Status */}
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <Crown className="h-5 w-5 text-primary" />
                            <CardTitle className="text-lg text-primary">Subscription Status</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">
                                    {user?.premiumUser ? "Premium Member" : "Free Plan"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {user?.premiumUser
                                        ? "You have unlimited access to all features."
                                        : "Upgrade to unlock unlimited messages and calls."}
                                </p>
                            </div>
                            {!user?.premiumUser && (
                                <Button variant="default" size="sm" onClick={() => setLocation("/")}>
                                    Upgrade
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Profile Form */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <CardTitle className="text-lg">Profile Details</CardTitle>
                        </div>
                        <CardDescription>
                            Update your personal information
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Your name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gender</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select gender" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="male">Male</SelectItem>
                                                    <SelectItem value="female">Female</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                    <SelectItem value="prefer_not_to_say">
                                                        Prefer not to say
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="phoneNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="tel"
                                                    placeholder="Your phone number"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="pt-4 border-t">
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={updateProfileMutation.isPending}
                                    >
                                        {updateProfileMutation.isPending ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
