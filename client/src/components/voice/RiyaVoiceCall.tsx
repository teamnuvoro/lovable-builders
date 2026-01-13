
import { useState, useEffect, useRef } from 'react';
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

// Bolna Manual Integration
// Since there is no React SDK, we use native WebSockets and Web Audio API
interface RiyaVoiceCallProps {
  userId: string;
  onCallEnd?: () => void;
}

export default function RiyaVoiceCall({ userId, onCallEnd }: RiyaVoiceCallProps) {
  const [status, setStatus] = useState<"disconnected" | "connecting" | "connected" | "started" | "ended">("disconnected");
  const [isMuted, setIsMuted] = useState(false);

  // Configuration
  const [agentId, setAgentId] = useState<string>(() => localStorage.getItem('riya_bolna_agent_id') || '');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Refs for Audio/WS
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const { toast } = useToast();

  const saveConfiguration = (id: string) => {
    setAgentId(id);
    localStorage.setItem('riya_bolna_agent_id', id);
  };

  const startCall = async () => {
    if (!agentId) {
      setIsSettingsOpen(true);
      toast({ title: "Agent ID Required", description: "Please enter your Bolna Agent ID from the dashboard." });
      return;
    }

    try {
      setStatus("connecting");
      console.log("Connecting to Bolna Agent:", agentId);

      // 1. Initialize Audio Context (for playback)
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

      // 2. Connect WebSocket
      // NOTE: Using a likely WebSocket URL pattern. If this fails, we need the exact URL from docs.
      // Trying: wss://api.bolna.ai/connection/ (common pattern) or via the backend proxy if needed.
      // For now, attempting direct connection.
      const wsUrl = `wss://api.bolna.ai/agent/${agentId}/connect`; // Best guess URL
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("Bolna WebSocket Connected");
        setStatus("connected");
        startRecording(); // Start sending audio
      };

      ws.onmessage = async (event) => {
        // Handle incoming audio/text
        // Assuming binary audio or JSON events
        if (event.data instanceof Blob) {
          // Play Audio
          const arrayBuffer = await event.data.arrayBuffer();
          playAudioChunk(arrayBuffer);
        } else if (typeof event.data === 'string') {
          console.log("Bolna Message:", event.data);
        }
      };

      ws.onerror = (error) => {
        console.error("Bolna WebSocket Error:", error);
        toast({ title: "Connection Error", description: "Failed to connect to Bolna. Check Agent ID.", variant: "destructive" });
        cleanup();
      };

      ws.onclose = () => {
        console.log("Bolna WebSocket Closed");
        cleanup();
      };

    } catch (err) {
      console.error("Failed to start call:", err);
      cleanup();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          // Send audio chunk to Bolna
          wsRef.current.send(event.data);
        }
      };

      mediaRecorder.start(100); // Send chunks every 100ms
    } catch (err) {
      console.error("Microphone Error:", err);
      toast({ title: "Microphone Error", description: "Could not access microphone.", variant: "destructive" });
    }
  };

  const playAudioChunk = async (arrayBuffer: ArrayBuffer) => {
    if (!audioContextRef.current) return;
    try {
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start();
    } catch (e) {
      console.error("Audio Playback Error:", e);
    }
  };

  const cleanup = () => {
    setStatus("disconnected");
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (onCallEnd) onCallEnd();
  };

  const endCall = () => {
    cleanup();
  };

  const toggleMute = () => {
    // Local mute only for now
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream.getAudioTracks().forEach(track => track.enabled = !newMutedState);
    }
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
              <DialogTitle>Bolna Configuration</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Agent ID (Required)</label>
                <Input
                  placeholder="e.g. 12345-abcde..."
                  value={agentId}
                  onChange={(e) => saveConfiguration(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <p className="text-xs text-gray-500">
                  Create an agent in Bolna Dashboard and paste the ID here.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-8 text-2xl font-bold text-white">Riya (Bolna)</div>

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
          ? "Riya is listening."
          : "Set your Bolna Agent ID in settings to call."}
      </div>
    </div>
  );
}
