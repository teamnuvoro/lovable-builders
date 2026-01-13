
import { useState, useEffect } from 'react';
import Vapi from '@vapi-ai/web';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Phone, PhoneOff, Mic, MicOff, Loader2, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Initialize Vapi SDK
const VAPI_PUBLIC_KEY = 'dddc9544-777b-43d8-98dc-97ecb344e57f';
const vapi = new Vapi(VAPI_PUBLIC_KEY);

interface RiyaVoiceCallProps {
  userId: string;
  onCallEnd?: () => void;
}

export default function RiyaVoiceCall({ userId, onCallEnd }: RiyaVoiceCallProps) {
  const [status, setStatus] = useState<"disconnected" | "connecting" | "connected" | "started" | "ended">("disconnected");
  const [isMuted, setIsMuted] = useState(false);
  const [serverUrl, setServerUrl] = useState<string>(() => {
    return localStorage.getItem('riya_ngrok_url') || 'https://prosurgical-nia-carpingly.ngrok-free.dev';
  });
  const [assistantId, setAssistantId] = useState<string>(() => {
    return localStorage.getItem('riya_vapi_assistant_id') || '';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Vapi Event Listeners
    vapi.on("call-start", () => {
      console.log("Vapi Call Started");
      setStatus("connected");
      // Close settings if open
      setIsSettingsOpen(false);
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
    });

    vapi.on("error", (error) => {
      console.error("Vapi Error Event:", error);
      setStatus("disconnected");
    });

    return () => {
      vapi.stop();
      vapi.removeAllListeners();
    };
  }, [onCallEnd]);

  const saveConfiguration = (url: string, id: string) => {
    setServerUrl(url);
    setAssistantId(id);
    localStorage.setItem('riya_ngrok_url', url);
    localStorage.setItem('riya_vapi_assistant_id', id);
  };

  const startCall = async () => {
    try {
      if (!assistantId) {
        setIsSettingsOpen(true);
        toast({
          title: "Configuration Needed",
          description: "Please enter your Assistant ID from Vapi Dashboard.",
          variant: "default"
        });
        return;
      }

      setStatus("connecting");
      console.log("Starting Vapi call with Assistant ID:", assistantId);

      // METHOD A: The Stable Way (Persisted Assistant)
      // Just pass the Assistant ID. Vapi grabs the config from the dashboard.
      await vapi.start(assistantId, {
        metadata: {
          userId: userId
        }
      });

    } catch (err) {
      console.error("Failed to start call:", err);
      setStatus("disconnected");
      toast({
        title: "Error",
        description: "Failed to start call. Check console for details.",
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
    <div className="flex flex-col items-center justify-center p-6 bg-gray-900/50 rounded-xl backdrop-blur-sm border border-gray-800 relative">
      <div className="absolute top-4 right-4">
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Settings className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>Voice Configuration</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Ngrok URL (For Dashboard)</label>
                <div className="text-xs text-gray-500 mb-2 p-2 bg-gray-800 rounded select-all">
                  {serverUrl ? `${serverUrl}/api/vapi/chat` : "Updating..."}
                </div>
                <Input
                  placeholder="https://..."
                  value={serverUrl}
                  onChange={(e) => saveConfiguration(e.target.value, assistantId)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <p className="text-xs text-gray-500">
                   Copy the full URL above and paste it into "Server URL" in Vapi Dashboard -> Assistant -> Model.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-800">
                <label className="text-sm font-medium text-gray-300">Assistant ID (Required)</label>
                <Input
                  placeholder="e.g. 84e1b..."
                  value={assistantId}
                  onChange={(e) => saveConfiguration(serverUrl, e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <p className="text-xs text-gray-500">Copy this from Vapi Dashboard (at the top of your assistant page).</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
          : "Tap the phone icon. Use the gear icon to set your Assistant ID."}
      </div>
    </div>
  );
}
