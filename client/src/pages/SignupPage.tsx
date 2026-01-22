import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, ArrowLeft, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { OTPInput } from "@/components/OTPInput";
import { trackSignupStarted, trackOtpVerified } from "@/utils/amplitudeTracking";
import { sendOTP, verifyOTP, normalizePhoneNumber, createOrUpdateUserProfile } from "@/lib/supabaseAuth";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
});

const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});

type SignupFormData = z.infer<typeof signupSchema>;
type OTPFormData = z.infer<typeof otpSchema>;

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');
  const [signupData, setSignupData] = useState<SignupFormData | null>(null);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;


  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
    },
  });

  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    mode: "onChange",
    defaultValues: {
      otp: "",
    },
  });

  // Prefill phone number if redirected from login (via ?phone=...)
  useEffect(() => {
    if (!urlParams) return;
    const phoneParam = urlParams.get('phone');
    if (phoneParam) {
      signupForm.setValue('phoneNumber', phoneParam);
    }
  }, [urlParams, signupForm]);

  const normalizePhoneForDisplay = (phone: string) => {
    let cleaned = phone.replace(/\s+/g, '');
    if (!cleaned.startsWith('+')) {
      cleaned = `+91${cleaned.replace(/^91/, '')}`;
    }
    return cleaned;
  };


  // Verify OTP and signup mutation
  const verifyAndSignupMutation = useMutation({
    mutationFn: async (data: { phoneNumber: string; otpCode: string; name: string; email: string }) => {
      // Verify OTP with Supabase
      const { session, user } = await verifyOTP(data.phoneNumber, data.otpCode);
      
      if (!session || !user) {
        throw new Error('Failed to verify OTP');
      }
      
      // Create or update user profile
      const normalizedPhone = normalizePhoneNumber(data.phoneNumber);
      const profile = await createOrUpdateUserProfile(user.id, {
        name: data.name,
        email: data.email,
        phoneNumber: normalizedPhone,
      });
      
      return {
        session,
        user: profile,
      };
    },
    onSuccess: (data) => {
      // Track OTP verified
      trackOtpVerified(1);
      
      // Supabase handles session storage automatically
      // Update auth context
      login(data.user);

      // Show success message
      toast({
        title: "You're In! 🎉",
        description: "Account created successfully. Welcome to Riya!",
      });

      setStep('success');

      // Redirect to chat after brief success screen
      setTimeout(() => setLocation('/chat'), 1500);
    },
    onError: (error: any) => {
      setIsVerifying(false);
      const errorData = error.response?.data;
      const status = error.response?.status || error?.status;
      
      // Handle 409 Conflict - user already exists
      if (status === 409 || errorData?.shouldLogin || errorData?.error?.includes('already exists') || errorData?.error?.includes('duplicate')) {
        toast({
          title: "Account Already Exists",
          description: "This phone number is already registered. Please login instead.",
          variant: "destructive",
        });
        setTimeout(() => {
          setLocation(`/login?phone=${encodeURIComponent(signupData?.phoneNumber || '')}`);
        }, 2000);
      } else {
        toast({
          title: "Verification Failed",
          description: errorData?.error || error.message || "Invalid OTP. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const onSubmitSignup = async (data: SignupFormData) => {
    // Track signup started
    trackSignupStarted('web');
    setIsSendingOTP(true);
    
    try {
      const normalizedPhone = normalizePhoneNumber(data.phoneNumber);
      const displayPhone = normalizePhoneForDisplay(data.phoneNumber);
      
      setSignupData({
        ...data,
        phoneNumber: displayPhone,
      });
      
      // Send OTP via Supabase (with metadata for signup)
      await sendOTP(normalizedPhone, {
        name: data.name,
        email: data.email,
      });
      
      toast({
        title: "OTP Sent! 📱",
        description: "Check your phone for the verification code",
      });
      
      setStep('otp');
    } catch (error: any) {
      toast({
        title: "Failed to Send OTP",
        description: error.message || "Please check your phone number and try again",
        variant: "destructive",
      });
    } finally {
      setIsSendingOTP(false);
    }
  };

  const onSubmitOTP = async (data: OTPFormData) => {
    // Prevent double submission
    if (isVerifying || !signupData) {
      return;
    }

    setIsVerifying(true);

    // Verify OTP via Vonage (server-side)
    verifyAndSignupMutation.mutate({
      phoneNumber: signupData.phoneNumber,
      otpCode: data.otp,
      name: signupData.name,
      email: signupData.email,
    });
  };

  const handleResendOTP = async () => {
    if (!signupData) {
      return;
    }

    setIsSendingOTP(true);
    
    try {
      const normalizedPhone = normalizePhoneNumber(signupData.phoneNumber);
      
      // Send new OTP via Vonage (server-side)
      await sendOTP(normalizedPhone);
      
      toast({
        title: "OTP Resent",
        description: "Please check your phone for the new code",
      });
    } catch (error: any) {
      toast({
        title: "Failed to Resend OTP",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleBackToForm = () => {
    setStep('form');
    otpForm.reset();
  };

  // Success Screen
  if (step === 'success') {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-[rgba(252,231,243,1)] via-[rgba(243,232,255,1)] to-[rgba(255,237,212,1)] flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-32 h-32 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center shadow-2xl"
          >
            <CheckCircle className="w-20 h-20 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold text-[#9810fa] mb-4"
          >
            Welcome to Riya! 🎉
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg text-gray-600"
          >
            Redirecting you to chat...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[rgba(252,231,243,1)] via-[rgba(243,232,255,1)] to-[rgba(255,237,212,1)] flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5, type: "spring", stiffness: 50 }}
          className="absolute top-10 left-5 w-48 h-48 sm:w-72 sm:h-72 bg-purple-200/30 rounded-full blur-3xl animate-pulse"
        ></motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.8, type: "spring", stiffness: 50 }}
          className="absolute bottom-10 right-5 w-64 h-64 sm:w-96 sm:h-96 bg-pink-200/30 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></motion.div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 10 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="mb-6 relative"
        >
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
              alt="Riya"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 animate-pulse-slow opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1
            className="text-3xl sm:text-4xl font-bold text-[#9810fa] mb-2 relative"
            data-testid="text-signup-title"
          >
            {step === 'form' ? 'Tell Us About Yourself' : 'Verify Your Phone'}
            <motion.span
              initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
              animate={{ opacity: 1, scale: 1, rotate: [0, 15, -15, 0] }}
              transition={{ duration: 0.8, delay: 0.3, repeat: Infinity, repeatDelay: 5 }}
              className="absolute -top-2 -right-6 text-pink-500"
            >
              <Sparkles className="w-6 h-6" />
            </motion.span>
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-[#4a5565]"
            data-testid="text-signup-subtitle"
          >
            {step === 'form'
              ? 'Share your details to start your journey'
              : 'Enter the 6-digit code sent to your phone'}
          </motion.p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3, type: "spring", stiffness: 100 }}
          whileHover={{ boxShadow: "0 25px 50px -12px rgba(152, 16, 250, 0.25)" }}
          className="w-full bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl mb-6 transition-shadow duration-300"
        >
          {step === 'form' ? (
            // Step 1: Signup Form
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(onSubmitSignup)} className="space-y-5 sm:space-y-6">
                <FormField
                  control={signupForm.control}
                  name="name"
                  render={({ field }) => (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.35 }}
                    >
                      <FormItem>
                        <FormLabel className="text-[#364153] font-medium text-sm sm:text-base">Your Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your full name"
                            className="h-12 sm:h-14 rounded-xl border-gray-200 bg-[#f3f3f5] focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 text-sm sm:text-base text-[#717182]"
                            {...field}
                            data-testid="input-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </motion.div>
                  )}
                />

                <FormField
                  control={signupForm.control}
                  name="email"
                  render={({ field }) => (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.45 }}
                    >
                      <FormItem>
                        <FormLabel className="text-[#364153] font-medium text-sm sm:text-base">Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="your.email@example.com"
                            className="h-12 sm:h-14 rounded-xl border-gray-200 bg-[#f3f3f5] focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 text-sm sm:text-base text-[#717182]"
                            {...field}
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    </motion.div>
                  )}
                />

                <FormField
                  control={signupForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.55 }}
                    >
                      <FormItem>
                        <FormLabel className="text-[#364153] font-medium text-sm sm:text-base">Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="9876543210"
                            className="h-12 sm:h-14 rounded-xl border-gray-200 bg-[#f3f3f5] focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all duration-300 text-sm sm:text-base text-[#717182]"
                            {...field}
                            data-testid="input-phone"
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-gray-500 mt-1">We'll send a verification code to this number</p>
                      </FormItem>
                    </motion.div>
                  )}
                />

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.65 }}
                  className="w-full mt-8"
                >
                  <Button
                    type="submit"
                    className="w-full h-14 sm:h-16 text-base sm:text-lg font-semibold rounded-full bg-[#9810fa] hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 scale-100 hover:scale-102 active:scale-98"
                    disabled={isSendingOTP}
                    data-testid="button-signup"
                  >
                    {isSendingOTP ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Sending Code...
                      </>
                    ) : (
                      "Get Verification Code"
                    )}
                  </Button>
                </motion.div>
              </form>
            </Form>
          ) : (
            // Step 2: OTP Verification
            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(onSubmitOTP)} className="space-y-5 sm:space-y-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBackToForm}
                  className="mb-4 -ml-2"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Change details
                </Button>

                <FormField
                  control={otpForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#364153] font-medium text-sm sm:text-base">Verification Code</FormLabel>
                      <FormControl>
                        <div className="w-full">
                          <OTPInput
                            length={6}
                            value={field.value || ''}
                            onChange={(value) => {
                              // CRITICAL: Keep as STRING, never convert to number!
                              const otpString = String(value);
                              console.log('[Signup OTP] Raw value:', value);
                              console.log('[Signup OTP] Type:', typeof value);
                              console.log('[Signup OTP] String value:', otpString);
                              console.log('[Signup OTP] Length:', otpString.length);
                              console.log('[Signup OTP] Regex test /^\\d{6}$/:', /^\d{6}$/.test(otpString));

                              // Update form with STRING value - use setValue to control validation
                              if (otpString.length === 6 && /^\d{6}$/.test(otpString)) {
                                // Valid 6 digits - set value and clear errors, then trigger validation
                                otpForm.setValue('otp', otpString, { shouldValidate: true, shouldDirty: true });
                                console.log('[Signup OTP] Set valid 6-digit OTP');
                              } else {
                                // Less than 6 digits - update without validation to avoid error spam
                                field.onChange(otpString);
                              }
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Sent to {signupData?.phoneNumber}
                      </p>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-14 sm:h-16 text-base sm:text-lg font-semibold rounded-full bg-[#9810fa] hover:bg-purple-700 text-white shadow-lg"
                  disabled={verifyAndSignupMutation.isPending || isVerifying}
                  data-testid="button-verify-otp"
                >
                  {verifyAndSignupMutation.isPending || isVerifying ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Verify & Create Account"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResendOTP}
                  disabled={isSendingOTP}
                  className="w-full"
                >
                  {isSendingOTP ? "Sending..." : "Resend OTP"}
                </Button>
              </form>
            </Form>
          )}
        </motion.div>

        {/* Login Link */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.75 }}
          className="text-center text-gray-600 mt-6 text-sm sm:text-base"
        >
          Already have an account?{" "}
          <button
            onClick={() => setLocation("/login")}
            className="text-[#9333ea] font-semibold underline underline-offset-2 transition-all duration-300 hover:scale-105 active:scale-95"
            data-testid="link-login"
          >
            Login
          </button>
        </motion.p>
      </div>
    </div>
  );
}
