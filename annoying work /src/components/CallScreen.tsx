import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Phone, Video, Mic, MicOff, VideoOff, PhoneOff, Volume2, VolumeX } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import Vapi from "@vapi-ai/web";
import { VAPI_CONFIG, AI_ASSISTANTS, AIAssistantName } from "../config/vapi-config";
import { toast } from "sonner@2.0.3";

interface CallScreenProps {
  aiName: string;
  aiImage: string;
  callType: "audio" | "video";
  onEndCall: () => void;
}

export function CallScreen({ aiName, aiImage, callType, onEndCall }: CallScreenProps) {
  const [callState, setCallState] = useState<"connecting" | "ringing" | "connected">("connecting");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(callType === "video");
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const vapiRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize audio context to ensure browser allows audio playback
    initializeAudioContext();
    
    // Initialize Vapi
    if (VAPI_CONFIG.publicKey !== "YOUR_VAPI_PUBLIC_KEY_HERE") {
      vapiRef.current = new Vapi(VAPI_CONFIG.publicKey);
      setupVapiListeners();
    } else {
      // Demo mode - no errors, just silent fallback
      console.log("💡 Running in DEMO mode - Add Vapi API key for real voice calling");
      console.log("📚 See START_HERE.md for setup instructions");
      toast.info("Demo Mode - No Real Audio", {
        description: "Add your Vapi API key to enable real AI voice calling",
        duration: 5000,
      });
    }

    // Simulate connecting states
    const connectTimer = setTimeout(() => {
      setCallState("ringing");
    }, 1000);

    const answerTimer = setTimeout(() => {
      setCallState("connected");
      startAICall();
      startCallTimer();
      if (callType === "video") {
        initializeVideo();
      }
    }, 3000);

    return () => {
      clearTimeout(connectTimer);
      clearTimeout(answerTimer);
      endAICall();
      cleanupMedia();
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const initializeAudioContext = () => {
    try {
      // Create audio context to enable audio playback (required by some browsers)
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioContextRef.current = new AudioContext();
        
        // Resume audio context on user interaction (browser requirement)
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume().then(() => {
            console.log('Audio context resumed');
            setAudioInitialized(true);
          });
        } else {
          setAudioInitialized(true);
        }
      }
    } catch (error) {
      console.log('Could not initialize audio context:', error);
    }
  };

  const setupVapiListeners = () => {
    if (!vapiRef.current) return;

    // When call starts
    vapiRef.current.on("call-start", () => {
      console.log("AI call started");
      setConversationStarted(true);
    });

    // When call ends
    vapiRef.current.on("call-end", () => {
      console.log("AI call ended");
      setConversationStarted(false);
    });

    // When AI is speaking
    vapiRef.current.on("speech-start", () => {
      console.log("AI started speaking");
      setAiSpeaking(true);
    });

    // When AI stops speaking
    vapiRef.current.on("speech-end", () => {
      console.log("AI stopped speaking");
      setAiSpeaking(false);
    });

    // When user is speaking
    vapiRef.current.on("volume-level", (volume: number) => {
      // Adjust threshold as needed (0-1)
      setUserSpeaking(volume > 0.05);
    });

    // Handle errors
    vapiRef.current.on("error", (error: any) => {
      console.error("Vapi error:", error);
    });

    // When we receive a message from AI
    vapiRef.current.on("message", (message: any) => {
      console.log("AI message:", message);
    });
  };

  const startAICall = async () => {
    if (!vapiRef.current) {
      // Demo mode - just show UI, no error
      console.log("💡 Demo mode active - Add API key for real voice calling");
      return;
    }

    try {
      // Get the AI assistant config
      const assistantConfig = AI_ASSISTANTS[aiName as AIAssistantName] || AI_ASSISTANTS.Riya;

      // Start the call with Vapi
      await vapiRef.current.start({
        // Transcriber settings (Speech to Text)
        transcriber: {
          provider: "deepgram",
          model: "nova-2",
          language: "en-IN", // Indian English for better Hinglish support
        },
        // AI Model settings
        model: {
          provider: "openai",
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: assistantConfig.systemPrompt,
            },
          ],
          // Temperature controls creativity (0-1)
          temperature: 0.7,
        },
        // Voice settings
        voice: {
          provider: "11labs",
          voiceId: assistantConfig.voice,
        },
        // First message from AI
        firstMessage: `Namaste! Main ${assistantConfig.name} hoon. Kaise ho aap? Aaj kya baat karni hai?`,
        // End call settings
        endCallMessage: "Thank you for talking with me. Take care!",
        endCallPhrases: ["goodbye", "bye", "end call", "disconnect"],
      });

      console.log("Vapi call started successfully");
    } catch (error) {
      console.error("Failed to start AI call:", error);
      alert("Failed to start AI call. Please check your Vapi API key in /config/vapi-config.ts");
    }
  };

  const endAICall = () => {
    if (vapiRef.current) {
      try {
        vapiRef.current.stop();
      } catch (error) {
        console.error("Error stopping Vapi call:", error);
      }
    }
  };

  const startCallTimer = () => {
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const initializeVideo = async () => {
    try {
      const constraints = {
        audio: false, // Audio is handled by Vapi
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error: any) {
      // Gracefully handle permission denial - app continues working
      if (error.name === 'NotAllowedError') {
        console.log("📹 Camera access not granted - continuing with audio only");
      } else {
        console.log("📹 Video unavailable - continuing with audio only");
      }
      // Disable video UI since camera not available
      setIsVideoOn(false);
    }
  };

  const cleanupMedia = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const handleToggleMute = () => {
    if (vapiRef.current) {
      vapiRef.current.setMuted(!isMuted);
    }
    setIsMuted(!isMuted);
  };

  const handleToggleVideo = () => {
    if (mediaStreamRef.current) {
      const videoTracks = mediaStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !isVideoOn;
      });
    }
    setIsVideoOn(!isVideoOn);
  };

  const handleToggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  const handleEndCall = () => {
    endAICall();
    cleanupMedia();
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
    onEndCall();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (callState === "connecting" || callState === "ringing") {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 z-50 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl mb-6 mx-auto">
            <ImageWithFallback
              src={aiImage}
              alt={aiName}
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-white text-2xl mb-2">{aiName}</h2>
          <p className="text-white/90 text-lg mb-8">
            {callState === "connecting" ? "Connecting to AI..." : "Starting conversation..."}
          </p>
          
          {/* Animated rings for ringing state */}
          {callState === "ringing" && (
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping"></div>
              <div className="absolute inset-0 rounded-full border-4 border-white/50 animate-pulse"></div>
            </div>
          )}
        </div>

        {/* End call button */}
        <button
          onClick={handleEndCall}
          className="mt-8 w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition"
        >
          <PhoneOff className="w-8 h-8 text-white" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Video Area */}
      <div className="flex-1 relative bg-gradient-to-br from-purple-900 to-pink-900">
        {callType === "video" ? (
          <>
            {/* Remote Video (AI) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full bg-gradient-to-br from-purple-800 to-pink-800 flex items-center justify-center">
                <div className="text-center">
                  <div className={`w-40 h-40 rounded-full overflow-hidden border-4 shadow-2xl mb-4 mx-auto transition-all duration-300 ${
                    aiSpeaking ? "border-green-400 scale-110 shadow-green-500/50" : "border-white"
                  }`}>
                    <ImageWithFallback
                      src={aiImage}
                      alt={aiName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-white text-lg">{aiName}</p>
                  {aiSpeaking && (
                    <p className="text-green-400 text-sm animate-pulse mt-2">🎤 Speaking...</p>
                  )}
                  {!aiSpeaking && conversationStarted && (
                    <p className="text-white/70 text-sm mt-2">👂 Listening...</p>
                  )}
                </div>
              </div>
            </div>

            {/* Local Video (User) - Picture in Picture */}
            <div className="absolute top-4 right-4 w-28 h-36 bg-gray-900 rounded-lg overflow-hidden shadow-xl border-2 border-white/20">
              {isVideoOn ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <VideoOff className="w-8 h-8 text-white/50" />
                </div>
              )}
              {userSpeaking && !isMuted && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Speaking
                </div>
              )}
            </div>
          </>
        ) : (
          /* Audio Call UI */
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className={`w-40 h-40 rounded-full overflow-hidden border-4 shadow-2xl mb-6 mx-auto transition-all duration-300 ${
                aiSpeaking ? "border-green-400 scale-110 shadow-green-500/50" : "border-white"
              }`}>
                <ImageWithFallback
                  src={aiImage}
                  alt={aiName}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-white text-2xl mb-2">{aiName}</h2>
              
              {/* Real-time status indicators */}
              {aiSpeaking && (
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-green-400 text-lg animate-pulse">AI is speaking...</p>
                </div>
              )}
              {!aiSpeaking && conversationStarted && userSpeaking && !isMuted && (
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <p className="text-blue-400 text-lg animate-pulse">You are speaking...</p>
                </div>
              )}
              {!aiSpeaking && conversationStarted && !userSpeaking && (
                <p className="text-white/60 text-lg mb-2">👂 Listening to you...</p>
              )}
              {!conversationStarted && (
                <p className="text-white/60 text-lg mb-2">Starting conversation...</p>
              )}
              
              <p className="text-white/80">Audio Call</p>
              
              {/* Voice visualization bars */}
              {(aiSpeaking || userSpeaking) && (
                <div className="flex justify-center gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 bg-gradient-to-t from-purple-400 to-pink-400 rounded-full animate-pulse`}
                      style={{
                        height: `${Math.random() * 30 + 10}px`,
                        animationDelay: `${i * 100}ms`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Call Info Overlay */}
        <div className="absolute top-4 left-4 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
          <p className="text-white">{formatDuration(callDuration)}</p>
        </div>

        {/* Status badge */}
        {conversationStarted && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-500/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <p className="text-white text-sm">Live AI Conversation</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gradient-to-t from-black/90 to-black/50 px-6 py-8">
        <div className="flex justify-center items-center gap-4 max-w-md mx-auto">
          {/* Mute/Unmute */}
          <button
            onClick={handleToggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition shadow-lg ${
              isMuted ? "bg-red-500 text-white" : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {/* Speaker */}
          <button
            onClick={handleToggleSpeaker}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition shadow-lg ${
              isSpeakerOn ? "bg-white/20 text-white hover:bg-white/30" : "bg-white text-gray-900"
            }`}
          >
            {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>

          {/* Video Toggle (only for video calls) */}
          {callType === "video" && (
            <button
              onClick={handleToggleVideo}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition shadow-lg ${
                isVideoOn ? "bg-white/20 text-white hover:bg-white/30" : "bg-white text-gray-900"
              }`}
            >
              {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>
          )}

          {/* End Call */}
          <button
            onClick={handleEndCall}
            className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Call Labels */}
        <div className="flex justify-center items-center gap-4 max-w-md mx-auto mt-4">
          <p className="text-white/60 text-xs w-14 text-center">
            {isMuted ? "Unmute" : "Mute"}
          </p>
          <p className="text-white/60 text-xs w-14 text-center">
            {isSpeakerOn ? "Speaker" : "Earpiece"}
          </p>
          {callType === "video" && (
            <p className="text-white/60 text-xs w-14 text-center">
              {isVideoOn ? "Camera" : "No Video"}
            </p>
          )}
          <p className="text-red-300 text-xs w-14 text-center">End</p>
        </div>

        {/* Instructions for first-time users */}
        {!conversationStarted && callState === "connected" && (
          <div className="mt-6 bg-purple-500/20 backdrop-blur-sm rounded-lg px-4 py-3 max-w-md mx-auto">
            <p className="text-white/80 text-sm text-center">
              💡 The AI will greet you first, then you can start talking!
            </p>
          </div>
        )}
        
        {/* Audio Troubleshooting Help */}
        {VAPI_CONFIG.publicKey === "YOUR_VAPI_PUBLIC_KEY_HERE" && callState === "connected" && (
          <div className="mt-4 bg-yellow-500/20 backdrop-blur-sm rounded-lg px-4 py-3 max-w-md mx-auto border border-yellow-500/30">
            <p className="text-yellow-200 text-sm text-center mb-2">
              🔇 <strong>Can't hear audio?</strong>
            </p>
            <p className="text-yellow-100/80 text-xs text-center">
              You're in demo mode. Add your Vapi API key to enable real AI voice calling with audio.
            </p>
          </div>
        )}
        
        {/* Real audio troubleshooting */}
        {VAPI_CONFIG.publicKey !== "YOUR_VAPI_PUBLIC_KEY_HERE" && conversationStarted && callDuration > 10 && !aiSpeaking && (
          <div className="mt-4 bg-blue-500/20 backdrop-blur-sm rounded-lg px-4 py-3 max-w-md mx-auto border border-blue-500/30">
            <p className="text-blue-200 text-sm text-center mb-2">
              🔊 <strong>No audio?</strong>
            </p>
            <p className="text-blue-100/80 text-xs text-center">
              • Check your device volume<br/>
              • Grant microphone permission<br/>
              • Try unplugging/replugging headphones
            </p>
          </div>
        )}
      </div>
    </div>
  );
}