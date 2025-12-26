import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { enableBackdoor } from "@/components/BackdoorActivator";

export default function LoginPageSimple() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();

  // State
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [devModeOTP, setDevModeOTP] = useState("");
  const [backdoorPassword, setBackdoorPassword] = useState("");

  // Check if entered phone is backdoor number
  const isBackdoorPhone = (phoneNum: string) => {
    const clean = phoneNum.replace(/\s+/g, '').replace(/^\+91/, '').replace(/^91/, '');
    return clean === '8828447880';
  };

  // Backdoor Login Mutation (Backend API)
  const backdoorLoginMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/backdoor-login", {
        phoneNumber: phone,
        password: backdoorPassword
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Store session token
      if (data.sessionToken) {
        localStorage.setItem('sessionToken', data.sessionToken);
      }

      // Update Auth Context
      login(data.user);

      toast({
        title: "🔓 Backdoor Access Granted!",
        description: `Hi ${data.user.name}! Logged in via backdoor.`,
      });

      // Redirect to chat
      setTimeout(() => setLocation('/chat'), 1500);
    },
    onError: (error: any) => {
      toast({
        title: "Backdoor Login Failed",
        description: error.response?.data?.error || error.message || "Invalid credentials.",
        variant: "destructive",
      });
    },
  });

  // STEP 1: Send Login OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if this is backdoor phone number
    if (isBackdoorPhone(phone)) {
      // If password is entered, trigger backdoor login
      if (backdoorPassword) {
        backdoorLoginMutation.mutate();
        return;
      } else {
        // Show password field (it will appear below)
        toast({
          title: "Backdoor Access",
          description: "Enter password to continue",
        });
        return;
      }
    }
    e.preventDefault();

    if (!phone) {
      toast({
        title: "Missing Phone",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let cleanPhone = phone.replace(/\s+/g, '');
      if (!cleanPhone.startsWith('+')) {
        cleanPhone = '+91' + cleanPhone;
      }

      const { error } = await supabase.auth.signInWithOtp({
        phone: cleanPhone,
      });

      if (error) throw error;

      toast({
        title: "OTP Sent! 📱",
        description: "Check your phone for the code",
        duration: 8000,
      });

      setStep('otp');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify Login OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter all 6 digits",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let cleanPhone = phone.replace(/\s+/g, '');
      if (!cleanPhone.startsWith('+')) {
        cleanPhone = '+91' + cleanPhone;
      }

      const { data, error } = await supabase.auth.verifyOtp({
        phone: cleanPhone,
        token: otp,
        type: 'sms',
      });

      if (error) throw error;

      if (data.session) {
        toast({
          title: "Welcome Back! 🎉",
          description: "Login successful",
        });
        setTimeout(() => setLocation('/chat'), 1500);
      }

    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[rgba(252,231,243,1)] via-[rgba(243,232,255,1)] to-[rgba(255,237,212,1)] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Avatar */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white shadow-xl">
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
            alt="Riya"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#9810fa] mb-2">
            {step === 'phone' ? 'Welcome Back!' : `Hi ${userName}!`}
            <Sparkles className="inline-block w-6 h-6 ml-2 text-pink-500" />
          </h1>
          <p className="text-lg text-gray-600">
            {step === 'phone'
              ? 'Login to continue with Riya'
              : 'Enter the verification code'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl">
          {step === 'phone' ? (
            // STEP 1: Phone Form
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full h-14 px-4 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-base"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">We'll send verification code</p>
              </div>

              {/* Backdoor Password Field - Only shown for backdoor phone */}
              {isBackdoorPhone(phone) && (
                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">Backdoor Password</label>
                  <input
                    type="password"
                    value={backdoorPassword}
                    onChange={(e) => setBackdoorPassword(e.target.value)}
                    placeholder="Enter backdoor password"
                    className="w-full h-14 px-4 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-base"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && backdoorPassword) {
                        backdoorLoginMutation.mutate();
                      }
                    }}
                  />
                  <p className="text-xs text-yellow-600 font-medium">🔓 Backdoor access mode</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || backdoorLoginMutation.isPending}
                className="w-full h-16 text-lg font-semibold rounded-full bg-[#9810fa] hover:bg-purple-700 text-white shadow-lg disabled:opacity-50"
              >
                {backdoorLoginMutation.isPending ? (
                  <>
                    <Loader2 className="inline-block w-5 h-5 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : loading ? (
                  <>
                    <Loader2 className="inline-block w-5 h-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : isBackdoorPhone(phone) ? (
                  "Backdoor Login"
                ) : (
                  "Send Verification Code"
                )}
              </button>

              {/* Backdoor Buttons */}
              <div className="space-y-3 mt-4 pt-4 border-t border-gray-200">
                {/* Backend Backdoor Button */}
                <button
                  type="button"
                  onClick={() => {
                    setPhone('8828447880');
                    setBackdoorPassword('0000');
                    setTimeout(() => {
                      backdoorLoginMutation.mutate();
                    }, 100);
                  }}
                  disabled={backdoorLoginMutation.isPending}
                  className="w-full h-12 text-sm font-medium rounded-full border-2 border-gray-300 hover:border-purple-400 hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition-all duration-300 shadow-sm disabled:opacity-50"
                >
                  {backdoorLoginMutation.isPending ? (
                    <>
                      <Loader2 className="inline-block w-4 h-4 mr-2 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <span className="text-lg mr-2">🔒</span>
                      Backend Backdoor (Phone: 8828447880)
                    </>
                  )}
                </button>

                {/* Frontend Backdoor Button */}
                <button
                  type="button"
                  onClick={() => {
                    enableBackdoor();
                    toast({
                      title: "🔓 Frontend Backdoor Enabled!",
                      description: "Redirecting to chat...",
                    });
                    setTimeout(() => {
                      window.location.href = '/chat';
                    }, 1500);
                  }}
                  className="w-full h-12 text-sm font-medium rounded-full border-2 border-green-300 hover:border-green-500 hover:bg-green-50 text-gray-700 hover:text-green-700 transition-all duration-300 shadow-sm"
                >
                  <span className="text-lg mr-2">🚪</span>
                  Frontend Backdoor (No Auth Required)
                </button>
                <p className="text-xs text-gray-400 text-center mt-2">
                  Quick access for testing • Press Ctrl+Shift+B to toggle frontend backdoor
                </p>
              </div>
            </form>
          ) : (
            // STEP 2: OTP Verification
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOtp("");
                  setDevModeOTP("");
                }}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Change number
              </button>

              {devModeOTP && (
                <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-4">
                  <p className="text-sm font-semibold text-yellow-800">🔧 Dev Mode - Your OTP:</p>
                  <p className="text-3xl font-bold text-yellow-900 mt-2">{devModeOTP}</p>
                </div>
              )}

              <div>
                <label className="block text-gray-700 font-medium mb-2">Verification Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(value);
                    console.log('[LOGIN OTP] Value:', value, 'Length:', value.length);
                  }}
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                  className="w-full h-16 px-4 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none text-center text-3xl font-bold tracking-widest"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full h-16 text-lg font-semibold rounded-full bg-[#9810fa] hover:bg-purple-700 text-white shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="inline-block w-5 h-5 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Login"
                )}
              </button>

              <button
                type="button"
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full text-gray-600 hover:text-purple-600"
              >
                Resend OTP
              </button>
            </form>
          )}
        </div>

        {/* Signup Link */}
        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{" "}
          <button
            onClick={() => setLocation("/signup")}
            className="text-[#9333ea] font-semibold underline"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}

