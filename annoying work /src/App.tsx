import { Button } from "./components/ui/button";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import { useState, useEffect } from "react";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Sparkles } from "lucide-react";
import { AICarousel } from "./components/AICarousel";
import { ChatScreen } from "./components/ChatScreen";
import { ProfileCreatedScreen } from "./components/ProfileCreatedScreen";
import { VAPI_CONFIG } from "./config/vapi-config";
import { SetupBanner } from "./components/SetupBanner";
import { Toaster } from "./components/ui/sonner";
import welcomeImage from "figma:asset/9cc6d9ded72d980b42e11384ff5be94a64446b8b.png";

const aiAssistants = [
  {
    id: 1,
    name: "Riya",
    personality: "Empathetic & Caring",
    description:
      "Your warm companion who truly understands emotions and offers heartfelt advice.",
    image:
      "https://images.unsplash.com/photo-1758600587728-9bde755354ad?w=800&q=80",
  },
  {
    id: 2,
    name: "Priya",
    personality: "Confident & Motivating",
    description:
      "A strong presence who encourages you to be your best self in relationships.",
    image:
      "https://images.unsplash.com/photo-1739303987902-eccc301b09fc?w=800&q=80",
  },
  {
    id: 3,
    name: "Ananya",
    personality: "Elegant & Wise",
    description:
      "Sophisticated guidance with a touch of class for mature relationship insights.",
    image:
      "https://images.unsplash.com/photo-1760551937537-a29dbbfab30b?w=800&q=80",
  },
  {
    id: 4,
    name: "Maya",
    personality: "Fun & Adventurous",
    description:
      "Brings excitement and fresh perspectives to help you enjoy relationship journey.",
    image:
      "https://images.unsplash.com/photo-1732588958769-fe931aca1ef0?w=800&q=80",
  },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<
    "welcome" | "form" | "success" | "select" | "chat"
  >("welcome");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [selectedAI, setSelectedAI] = useState<number | null>(
    null,
  );

  // Show setup instructions on app load
  useEffect(() => {
    if (VAPI_CONFIG.publicKey === "YOUR_VAPI_PUBLIC_KEY_HERE") {
      console.log("\n" + "=".repeat(60));
      console.log("💡 DEMO MODE - Voice calling UI only");
      console.log("=".repeat(60));
      console.log("\n📝 To enable REAL voice calling:");
      console.log("1. Sign up at: https://vapi.ai/signup");
      console.log("2. Get your API key from dashboard");
      console.log("3. Add it to: /config/vapi-config.ts");
      console.log("4. Read: /START_HERE.md for detailed steps");
      console.log("\n✨ First 10 minutes are FREE!");
      console.log("\n" + "=".repeat(60) + "\n");
    } else {
      console.log("\n" + "=".repeat(60));
      console.log("✅ REAL AI VOICE CALLING ENABLED!");
      console.log("=".repeat(60));
      console.log("\n🎉 Vapi.ai is configured and ready!");
      console.log(
        "🎤 Click any audio call button to start talking",
      );
      console.log("📚 See /WHAT_TO_EXPECT.md for details");
      console.log("\n" + "=".repeat(60) + "\n");
    }
  }, []);

  const handleGetStarted = () => {
    setCurrentScreen("form");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setCurrentScreen("success");
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectAI = (id: number) => {
    setSelectedAI(id);
  };

  const handleContinueWithAI = () => {
    if (selectedAI) {
      console.log("Selected AI:", selectedAI);
      setCurrentScreen("chat");
    }
  };

  // Chat Screen
  if (currentScreen === "chat") {
    const selectedAssistant = aiAssistants.find(
      (ai) => ai.id === selectedAI,
    );
    if (!selectedAssistant) return null;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        {/* Mobile Container */}
        <div className="w-full max-w-[430px] h-screen bg-white flex flex-col relative overflow-hidden">
          <ChatScreen
            aiName={selectedAssistant.name}
            aiImage={selectedAssistant.image}
            userName={formData.name || "User"}
            onBack={() => setCurrentScreen("select")}
          />
        </div>
      </div>
    );
  }

  // AI Selection Screen
  if (currentScreen === "select") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        {/* Mobile Container */}
        <div className="w-full max-w-[430px] h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-orange-100 flex flex-col relative overflow-hidden">
          {/* Header */}
          <div className="text-center pt-12 pb-6 px-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <h1 className="text-3xl text-gray-800">
                Choose Your AI Assistant
              </h1>
            </div>
            <p className="text-gray-600">
              Swipe to explore different personalities
            </p>
          </div>

          {/* Carousel */}
          <div className="flex-1 flex items-center">
            <AICarousel
              assistants={aiAssistants}
              onSelectAI={handleSelectAI}
              selectedAI={selectedAI}
            />
          </div>

          {/* Continue Button */}
          <div className="px-6 pb-8">
            <Button
              size="lg"
              onClick={handleContinueWithAI}
              disabled={!selectedAI}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 rounded-full shadow-lg disabled:opacity-50 transition-colors"
            >
              Continue with{" "}
              {selectedAI
                ? aiAssistants.find(
                    (ai) => ai.id === selectedAI,
                  )?.name
                : "AI"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === "form") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        {/* Mobile Container */}
        <div className="w-full max-w-[430px] h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-orange-100 flex flex-col relative">
          {/* Form Screen - Removed excessive padding */}
          <div className="flex-1 flex flex-col px-6 py-8">
            {/* Avatar on top */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white rounded-full p-1 shadow-lg">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1758600587728-9bde755354ad?w=400&q=80"
                  alt="Riya AI"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-3xl text-purple-600 mb-2">
                Tell Us About Yourself
              </h1>
              <p className="text-gray-600">
                Share your details to start your journey
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-3xl shadow-xl p-6 flex-1 flex flex-col">
              <form
                onSubmit={handleSubmit}
                className="flex flex-col h-full"
              >
                <div className="space-y-5 flex-1">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-gray-700"
                    >
                      Your Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange(
                          "name",
                          e.target.value,
                        )
                      }
                      required
                      className="h-12 border-2 border-gray-200 focus:border-purple-400 rounded-xl"
                    />
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-gray-700"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange(
                          "email",
                          e.target.value,
                        )
                      }
                      required
                      className="h-12 border-2 border-gray-200 focus:border-purple-400 rounded-xl"
                    />
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-gray-700"
                    >
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange(
                          "phone",
                          e.target.value,
                        )
                      }
                      required
                      className="h-12 border-2 border-gray-200 focus:border-purple-400 rounded-xl"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-6">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 rounded-full shadow-lg transition-colors"
                  >
                    Submit
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === "success") {
    return (
      <ProfileCreatedScreen
        onComplete={() => setCurrentScreen("select")}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* Mobile Container */}
      <div className="w-full max-w-[430px] h-screen relative overflow-hidden">
        {/* Full Screen Background Image */}
        <img
          src={welcomeImage}
          alt="Riya AI - Always here for you"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay gradient for better text readability - lighter for this image */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />

        {/* Content overlay */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Spacer - no title needed as it's in the image */}
          <div className="flex-1"></div>

          {/* Bottom CTA Section */}
          <div className="px-6 pb-8 flex flex-col items-center">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="w-[240px] bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white py-4 rounded-full shadow-xl transition-all"
            >
              Let's Get Started
            </Button>
            <p className="text-center text-white text-xs mt-3 drop-shadow-lg">
              Already have an account?{" "}
              <span className="text-white font-bold cursor-pointer hover:underline">
                Login
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Toast notifications */}
      <Toaster position="top-center" richColors />
    </div>
  );
}