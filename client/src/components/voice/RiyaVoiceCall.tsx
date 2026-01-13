
import { useState, useEffect } from 'react';
import Vapi from '@vapi-ai/web';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff, Mic, MicOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Initialize Vapi SDK
// Ideally, getting this from env vars
const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY || 'YOUR_VAPI_PUBLIC_KEY';
const VAPI_ASSISTANT_ID = import.meta.env.VITE_VAPI_ASSISTANT_ID || 'YOUR_VAPI_ASSISTANT_ID';

const vapi = new Vapi(VAPI_PUBLIC_KEY);

interface RiyaVoiceCallProps {
  userId: string;
  onCallEnd?: () => void;
}

export default function RiyaVoiceCall({ userId, onCallEnd }: RiyaVoiceCallProps) {
  const [status, setStatus] = useState<"disconnected" | "connecting" | "connected" | "started" | "ended">("disconnected");
  const [isMuted, setIsMuted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Vapi Event Listeners
    vapi.on("call-start", () => {
      console.log("Vapi Call Started");
      setStatus("connected");
    });

    vapi.on("call-end", () => {
      console.log("Vapi Call Ended");
      setStatus("disconnected");
      if (onCallEnd) onCallEnd();
    });

    vapi.on("speech-start", () => console.log("User started speaking"));
    vapi.on("speech-end", () => console.log("User stopped speaking"));

    vapi.on("volume-level", (volume) => {
      // Optional: Visualize volume
      // console.log("Volume:", volume); 
    });

    vapi.on("error", (error) => {
      console.error("Vapi Error:", error);
      setStatus("disconnected");
      toast({
        title: "Voice Call Error",
        description: "Connection failed. Please check your network or try again.",
        variant: "destructive"
      });
    });

    return () => {
      vapi.stop();
      vapi.removeAllListeners();
    };
  }, [onCallEnd, toast]);

  const startCall = async () => {
    try {
      setStatus("connecting");

      // Check for keys
      if (VAPI_PUBLIC_KEY === 'YOUR_VAPI_PUBLIC_KEY' || VAPI_ASSISTANT_ID === 'YOUR_VAPI_ASSISTANT_ID') {
        toast({
          title: "Configuration Missing",
          description: "Please add VITE_VAPI_PUBLIC_KEY and VITE_VAPI_ASSISTANT_ID to your .env file.",
          variant: "destructive"
        });
        setStatus("disconnected");
        return;
      }

      await vapi.start(VAPI_ASSISTANT_ID, {
        metadata: {
          userId: userId // Pass userId to context if needed
        }
      });
    } catch (err) {
      console.error("Failed to start call:", err);
      setStatus("disconnected");
      toast({
        title: "Error",
        description: "Failed to start call.",
        variant: "destructive"
      });
    }
  };

  const endCall = () => {
    vapi.stop();
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    vapi.setMuted(newMutedState);
    setIsMuted(newMutedState);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-900/50 rounded-xl backdrop-blur-sm border border-gray-800">
      <div className="mb-8 text-2xl font-bold text-white">Riya Voice Call</div>

      <div className="flex flex-col items-center gap-6">
        {/* Status Indicator */}
        {status === "connecting" && (
          <div className="flex items-center gap-2 text-yellow-400 animate-pulse">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Connecting...</span>
          </div>
        )}

        {status === "connected" && (
          <div className="flex items-center gap-2 text-green-400 animate-pulse">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Live Connection</span>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-4">
          {status === "disconnected" || status === "ended" ? (
            <Button
              onClick={startCall}
              className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-700 shadow-lg shadow-green-900/20 transition-all hover:scale-105"
            >
              <Phone className="w-8 h-8 text-white" />
            </Button>
          ) : (
            <>
              <Button
                onClick={toggleMute}
                variant="secondary"
                className={`w-12 h-12 rounded-full ${isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-700 text-white'}`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>

              <Button
                onClick={endCall}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/20 transition-all hover:scale-105"
              >
                <PhoneOff className="w-8 h-8 text-white" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Helper Text */}
      <div className="mt-6 text-sm text-gray-400 text-center max-w-xs">
        {status === "connected"
          ? "Riya is listening. Speak naturally."
          : "Tap the phone icon to start a voice conversation."}
      </div>
    </div>
  );
}
