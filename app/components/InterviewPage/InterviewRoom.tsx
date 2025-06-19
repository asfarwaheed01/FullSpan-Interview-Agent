"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Room, RoomEvent, Track } from "livekit-client";
import {
  BarVisualizer,
  DisconnectButton,
  RoomAudioRenderer,
  RoomContext,
  VideoTrack,
  VoiceAssistantControlBar,
  useVoiceAssistant,
  useTracks,
  useLocalParticipant,
} from "@livekit/components-react";
import {
  Phone,
  X,
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageSquare,
  AlertTriangle,
  Bot,
} from "lucide-react";
import {
  ConnectionDetails,
  InterviewFormData,
  InterviewResponse,
} from "@/app/interfaces/interview";
import { interviewAPI } from "@/app/utils/api";

interface TranscriptMessage {
  id: string;
  participant: string;
  text: string;
  timestamp: Date;
  isFinal: boolean;
}

interface PartialTranscript {
  participant: string;
  text: string;
  lastUpdate: Date;
}

interface InterviewRoomProps {
  interviewData: InterviewResponse;
  formData: InterviewFormData;
  onEndInterview: () => void;
}

interface TranscriptionSegment {
  text: string;
  final: boolean;
}

interface Participant {
  identity?: string;
  name?: string;
}

interface TrackPublication {
  trackSid?: string;
}

const InterviewRoom: React.FC<InterviewRoomProps> = ({
  interviewData,
  formData,
  onEndInterview,
}) => {
  const [room] = useState(new Room());
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [partialTranscripts, setPartialTranscripts] = useState<
    Map<string, PartialTranscript>
  >(new Map());
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const transcriptEndRef = useRef<HTMLDivElement>(null);

  console.log(
    "Room state:",
    room.state,
    "Connected:",
    isConnected,
    "Status:",
    connectionStatus
  );

  // Auto-scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  const onConnectButtonClicked = useCallback(async () => {
    try {
      setConnectionStatus("connecting");
      setConnectionError(null);

      const connectionDetails: ConnectionDetails = {
        serverUrl: interviewData.wsUrl,
        participantToken: interviewData.access_token,
        roomName: interviewData.room_name,
      };

      console.log("Connecting to room...", room.state);

      // Ensure room is in proper state before connecting
      if (room.state !== "disconnected") {
        console.log("Room not disconnected, current state:", room.state);
        room.disconnect();
        // Wait for disconnect to complete
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Connect to room
      await room.connect(
        connectionDetails.serverUrl,
        connectionDetails.participantToken
      );

      // Wait for connection to be established with proper error handling
      await new Promise<void>((resolve, reject) => {
        if (room.state === "connected") {
          console.log("Room already connected");
          resolve();
          return;
        }

        const timeout = setTimeout(() => {
          cleanup();
          reject(new Error("Connection timeout"));
        }, 15000);

        const cleanup = () => {
          clearTimeout(timeout);
          room.off(RoomEvent.Connected, onConnected);
          room.off(RoomEvent.Disconnected, onDisconnected);
        };

        const onConnected = () => {
          console.log("Room connected successfully");
          cleanup();
          resolve();
        };

        const onDisconnected = (reason?: unknown) => {
          console.log("Room disconnected during connection:", reason);
          cleanup();
          reject(new Error(`Connection failed: ${reason || "Unknown"}`));
        };

        room.on(RoomEvent.Connected, onConnected);
        room.on(RoomEvent.Disconnected, onDisconnected);
      });

      // Wait for connection to stabilize
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Only proceed if still connected
      if (room.state !== "connected") {
        throw new Error("Room disconnected after connection");
      }

      // Enable microphone
      try {
        const audioOptions = {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        };
        await room.localParticipant.setMicrophoneEnabled(true, audioOptions);
        setIsMicEnabled(true);
        console.log("Microphone enabled");
      } catch (error) {
        console.warn("Failed to enable microphone:", error);
      }

      // Enable camera with delay
      setTimeout(async () => {
        if (room.state === "connected") {
          try {
            const videoOptions = {
              resolution: { width: 1280, height: 720 },
            };
            await room.localParticipant.setCameraEnabled(true, videoOptions);
            setIsVideoEnabled(true);
            console.log("Camera enabled");
          } catch (error) {
            console.warn("Failed to enable camera:", error);
          }
        }
      }, 2000);

      setIsConnected(true);
      setConnectionStatus("connected");
    } catch (error) {
      console.error("Failed to connect to room:", error);
      setConnectionStatus("disconnected");
      setIsConnected(false);
      setConnectionError(
        error instanceof Error ? error.message : "Connection failed"
      );

      // Ensure room is disconnected on error
      if (room.state !== "disconnected") {
        try {
          room.disconnect();
        } catch (e) {
          console.warn("Error disconnecting room:", e);
        }
      }
    }
  }, [room, interviewData]);

  useEffect(() => {
    const partialTimeouts = new Map<string, NodeJS.Timeout>();

    const handleTranscription = (
      segments: TranscriptionSegment[],
      participant?: Participant,
      publication?: TrackPublication
    ) => {
      // Handle both single segment and array of segments
      const segmentsArray = Array.isArray(segments) ? segments : [segments];

      segmentsArray.forEach((segment) => {
        if (segment && segment.text && segment.text.trim()) {
          const participantId =
            participant?.identity || participant?.name || "AI";
          const participantKey = `${participantId}-${
            publication?.trackSid || "default"
          }`;

          // Clear any existing timeout for this participant
          if (partialTimeouts.has(participantKey)) {
            clearTimeout(partialTimeouts.get(participantKey)!);
          }

          if (segment.final) {
            // This is a final transcript - add to main transcript
            const newMessage: TranscriptMessage = {
              id: `${Date.now()}-${Math.random()}`,
              participant: participantId,
              text: segment.text.trim(),
              timestamp: new Date(),
              isFinal: true,
            };

            setTranscript((prev) => {
              // Avoid duplicate messages by checking recent messages
              const isDuplicate = prev.some(
                (msg) =>
                  msg.text === newMessage.text &&
                  msg.participant === newMessage.participant &&
                  Math.abs(
                    msg.timestamp.getTime() - newMessage.timestamp.getTime()
                  ) < 3000
              );

              if (!isDuplicate) {
                return [...prev, newMessage];
              }
              return prev;
            });

            // Remove partial transcript for this participant
            setPartialTranscripts((prev) => {
              const newMap = new Map(prev);
              newMap.delete(participantKey);
              return newMap;
            });
          } else {
            // This is a partial transcript - only show if text is substantial
            if (segment.text.trim().length > 10) {
              setPartialTranscripts((prev) => {
                const newMap = new Map(prev);
                newMap.set(participantKey, {
                  participant: participantId,
                  text: segment.text.trim(),
                  lastUpdate: new Date(),
                });
                return newMap;
              });
            }

            // Set timeout to convert partial to final if no update comes
            // Use shorter timeout for user speech to capture complete thoughts
            const timeoutDuration =
              participantId.includes("AI") || participantId.includes("agent")
                ? 3000
                : 1500;

            const timeout = setTimeout(() => {
              // If no final transcript comes, treat this as final
              const finalMessage: TranscriptMessage = {
                id: `${Date.now()}-${Math.random()}`,
                participant: participantId,
                text: segment.text.trim(),
                timestamp: new Date(),
                isFinal: true,
              };

              setTranscript((prev) => {
                const isDuplicate = prev.some(
                  (msg) =>
                    msg.text === finalMessage.text &&
                    msg.participant === finalMessage.participant &&
                    Math.abs(
                      msg.timestamp.getTime() - finalMessage.timestamp.getTime()
                    ) < 5000
                );

                if (!isDuplicate && finalMessage.text.length > 5) {
                  return [...prev, finalMessage];
                }
                return prev;
              });

              // Remove from partials
              setPartialTranscripts((prev) => {
                const newMap = new Map(prev);
                newMap.delete(participantKey);
                return newMap;
              });

              partialTimeouts.delete(participantKey);
            }, timeoutDuration);

            partialTimeouts.set(participantKey, timeout);
          }
        }
      });
    };

    // Listen for transcription events
    room.on(RoomEvent.TranscriptionReceived, handleTranscription);

    // Clean up old partial transcripts periodically
    const cleanupInterval = setInterval(() => {
      setPartialTranscripts((prev) => {
        const newMap = new Map(prev);
        const now = new Date();

        for (const [key, partial] of newMap.entries()) {
          // Remove partial transcripts older than 5 seconds
          if (now.getTime() - partial.lastUpdate.getTime() > 5000) {
            newMap.delete(key);
          }
        }

        return newMap;
      });
    }, 3000);

    return () => {
      room.off(RoomEvent.TranscriptionReceived, handleTranscription);
      clearInterval(cleanupInterval);

      // Clear all timeouts
      for (const timeout of partialTimeouts.values()) {
        clearTimeout(timeout);
      }
      partialTimeouts.clear();
    };
  }, [room]);

  const toggleMicrophone = useCallback(async () => {
    if (room.state !== "connected") {
      console.warn("Cannot toggle microphone: Room not connected");
      return;
    }

    try {
      const enabled = !isMicEnabled;
      await room.localParticipant.setMicrophoneEnabled(enabled);
      setIsMicEnabled(enabled);
    } catch (error) {
      console.error("Failed to toggle microphone:", error);
    }
  }, [room, isMicEnabled]);

  const toggleCamera = useCallback(async () => {
    if (room.state !== "connected") {
      console.warn("Cannot toggle camera: Room not connected");
      return;
    }

    try {
      const enabled = !isVideoEnabled;
      await room.localParticipant.setCameraEnabled(enabled);
      setIsVideoEnabled(enabled);
    } catch (error) {
      console.error("Failed to toggle camera:", error);
    }
  }, [room, isVideoEnabled]);

  const onDeviceFailure = useCallback((error: Error) => {
    console.error(error);
    alert(
      "Error acquiring camera or microphone permissions. Please make sure you grant the necessary permissions in your browser and reload the tab"
    );
  }, []);

  useEffect(() => {
    let mounted = true;

    const connectWithDelay = async () => {
      // Small delay to ensure component is mounted
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (mounted && room.state === "disconnected") {
        onConnectButtonClicked();
      }
    };

    room.on(RoomEvent.MediaDevicesError, onDeviceFailure);
    connectWithDelay();

    return () => {
      mounted = false;
      room.off(RoomEvent.MediaDevicesError, onDeviceFailure);

      // Safe disconnect
      if (room.state === "connected" || room.state === "connecting") {
        console.log("Disconnecting room on cleanup");
        try {
          room.disconnect();
        } catch (error) {
          console.warn("Error during disconnect:", error);
        }
      }
    };
  }, [room, onDeviceFailure, onConnectButtonClicked]);

  const handleEndInterview = useCallback(async () => {
    try {
      console.log("Ending interview...");

      // First try to end interview via API
      try {
        await interviewAPI.endInterview(interviewData.room_name);
        console.log("Interview ended via API");
      } catch (apiError) {
        console.warn("Failed to end interview via API:", apiError);
      }

      // Safely disconnect from room
      if (room.state === "connected" || room.state === "connecting") {
        console.log("Disconnecting from room...");
        try {
          room.disconnect();
        } catch (disconnectError) {
          console.warn("Error disconnecting room:", disconnectError);
        }
      }

      // Update state
      setConnectionStatus("disconnected");
      setIsConnected(false);

      // Wait a bit for cleanup
      setTimeout(() => {
        onEndInterview();
      }, 500);
    } catch (error) {
      console.error("Failed to end interview:", error);

      // Force disconnect and end even on error
      try {
        if (room.state !== "disconnected") {
          room.disconnect();
        }
      } catch (e) {
        console.warn("Error in force disconnect:", e);
      }

      onEndInterview();
    }
  }, [room, onEndInterview, interviewData.room_name]);

  return (
    <main
      data-lk-theme="default"
      className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950"
    >
      <RoomContext.Provider value={room}>
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-3 h-3 rounded-full ${
                  connectionStatus === "connected"
                    ? "bg-green-400 animate-pulse"
                    : connectionStatus === "connecting"
                    ? "bg-yellow-400 animate-pulse"
                    : "bg-red-400"
                }`}
              ></div>
              <h2 className="text-white font-semibold">AI Interview Session</h2>
              <span className="text-purple-300 text-sm">
                {connectionStatus === "connecting"
                  ? "Connecting..."
                  : connectionStatus === "connected"
                  ? "Connected"
                  : "Disconnected"}
              </span>
              {connectionError && connectionStatus !== "connected" && (
                <div className="flex items-center gap-1 text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Connection Error</span>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMicrophone}
                className={`p-2 rounded-lg transition-colors ${
                  isMicEnabled
                    ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                    : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                }`}
              >
                {isMicEnabled ? (
                  <Mic className="w-4 h-4" />
                ) : (
                  <MicOff className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={toggleCamera}
                className={`p-2 rounded-lg transition-colors ${
                  isVideoEnabled
                    ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                    : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                }`}
              >
                {isVideoEnabled ? (
                  <Video className="w-4 h-4" />
                ) : (
                  <VideoOff className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className={`p-2 rounded-lg transition-colors ${
                  showTranscript
                    ? "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                    : "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              <div className="text-purple-300 text-sm ml-4">
                Candidate: {formData.candidate_name}
              </div>

              <button
                onClick={handleEndInterview}
                className="p-2 text-purple-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex min-h-[calc(100vh-80px)]">
          {/* Interview Area */}
          <div
            className={`flex-1 flex flex-col p-6 ${
              showTranscript ? "pr-3" : ""
            }`}
          >
            <div className="flex-1 flex gap-6">
              {/* AI Agent Area */}
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-4xl">
                  <SimpleVoiceAssistant
                    onConnectButtonClicked={onConnectButtonClicked}
                  />
                </div>
              </div>

              {/* User Video */}
              <div className="w-80 flex flex-col">
                <UserVideoSection />
              </div>
            </div>
          </div>

          {/* Transcript Panel */}
          {showTranscript && (
            <div className="w-96 bg-black/20 backdrop-blur-sm border-l border-white/10 p-6">
              <TranscriptPanel
                transcript={transcript}
                partialTranscripts={partialTranscripts}
                transcriptEndRef={transcriptEndRef}
              />
            </div>
          )}

          {/* Side Panel */}
          {!showTranscript && (
            <div className="w-80 bg-black/20 backdrop-blur-sm border-l border-white/10 p-6">
              <SidePanel formData={formData} interviewData={interviewData} />
            </div>
          )}
        </div>

        <RoomAudioRenderer />
      </RoomContext.Provider>
    </main>
  );
};

// User Video Component
function UserVideoSection() {
  const { localParticipant } = useLocalParticipant();
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: false });

  const userVideoTrack = tracks.find(
    (track) => track.participant === localParticipant
  );

  return (
    <div className="space-y-4">
      <h3 className="text-white font-semibold text-center">You</h3>
      <div className="aspect-video bg-black/20 rounded-xl overflow-hidden border border-white/10">
        {userVideoTrack ? (
          <VideoTrack
            trackRef={userVideoTrack}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <VideoOff className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Camera Off</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Transcript Panel Component
function TranscriptPanel({
  transcript,
  partialTranscripts,
  transcriptEndRef,
}: {
  transcript: TranscriptMessage[];
  partialTranscripts: Map<string, PartialTranscript>;
  transcriptEndRef: React.RefObject<HTMLDivElement | null>;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isAutoScrollEnabled && transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [transcript, partialTranscripts, isAutoScrollEnabled]);

  // Check if user has scrolled up manually
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const isAtBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      50;
    setIsAutoScrollEnabled(isAtBottom);
  }, []);

  return (
    <div className="max-h-[90vh] flex flex-col overflow-y-scroll">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Live Transcript</h3>
        <div className="flex items-center gap-2">
          {!isAutoScrollEnabled && (
            <button
              onClick={() => {
                setIsAutoScrollEnabled(true);
                transcriptEndRef.current?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className="text-xs text-purple-400 hover:text-purple-300 bg-purple-500/20 px-2 py-1 rounded"
            >
              Scroll to bottom
            </button>
          )}
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto space-y-3 bg-white/5 rounded-xl p-4 border border-white/10 scroll-smooth"
        style={{ scrollBehavior: "smooth" }}
      >
        {transcript.length === 0 && partialTranscripts.size === 0 ? (
          <div className="text-center text-purple-300 text-sm">
            Transcript will appear here once the conversation starts...
          </div>
        ) : (
          <>
            {/* Final transcript messages */}
            {transcript.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg transition-all duration-300 ${
                  message.participant === "AI" ||
                  message.participant.includes("agent")
                    ? "bg-purple-500/20 border-l-2 border-purple-400"
                    : "bg-blue-500/20 border-l-2 border-blue-400"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-white">
                    {message.participant === "AI" ||
                    message.participant.includes("agent")
                      ? "AI Interviewer"
                      : "You"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-200 leading-relaxed">
                  {message.text}
                </p>
              </div>
            ))}

            {/* Partial transcript messages */}
            {Array.from(partialTranscripts.values())
              .filter((partial) => partial.text.length > 5)
              .slice(-2)
              .map((partial, index) => (
                <div
                  key={`partial-${index}`}
                  className={`p-3 rounded-lg opacity-70 border-dashed border transition-all duration-300 ${
                    partial.participant === "AI" ||
                    partial.participant.includes("agent")
                      ? "bg-purple-500/10 border-purple-400"
                      : "bg-blue-500/10 border-blue-400"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-white flex items-center gap-1">
                      {partial.participant === "AI" ||
                      partial.participant.includes("agent")
                        ? "AI Interviewer"
                        : "You"}
                      <span className="text-yellow-400 animate-pulse">●</span>
                      <span className="text-xs text-yellow-400">
                        speaking...
                      </span>
                    </span>
                    <span className="text-xs text-gray-400">
                      {partial.lastUpdate.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 italic leading-relaxed">
                    {partial.text}
                  </p>
                </div>
              ))}
          </>
        )}
        <div ref={transcriptEndRef} />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-purple-300">
          Transcript is being recorded for interview analysis
        </div>
        <div className="text-xs text-gray-400">
          {transcript.length} messages
        </div>
      </div>
    </div>
  );
}

// Side Panel Component
function SidePanel({
  formData,
  interviewData,
}: {
  formData: InterviewFormData;
  interviewData: InterviewResponse;
}) {
  return (
    <div className="space-y-6">
      {/* Candidate Info */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <h3 className="text-white font-semibold mb-3">Candidate Profile</h3>
        <div className="space-y-2">
          <p className="text-purple-200 text-sm">
            <span className="font-medium">Name:</span> {formData.candidate_name}
          </p>
          <p className="text-purple-200 text-sm">
            <span className="font-medium">Status:</span> In Progress
          </p>
        </div>
      </div>

      {/* Interview Details */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <h3 className="text-white font-semibold mb-3">Interview Details</h3>
        <div className="space-y-2">
          <p className="text-purple-200 text-sm">
            <span className="font-medium">Room:</span>{" "}
            {interviewData.room_name.split("-").pop()?.substring(0, 8)}
          </p>
          <p className="text-purple-200 text-sm">
            <span className="font-medium">Connection:</span> LiveKit Voice AI
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <h3 className="text-white font-semibold mb-3">Instructions</h3>
        <ul className="text-purple-200 text-sm space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-0.5">•</span>
            Speak clearly and naturally
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-0.5">•</span>
            Wait for the AI to finish speaking
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-0.5">•</span>
            Provide detailed examples
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-0.5">•</span>
            Ask for clarification if needed
          </li>
        </ul>
      </div>

      {/* Job Summary */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <h3 className="text-white font-semibold mb-3">Position Summary</h3>
        <p className="text-purple-200 text-sm line-clamp-4">
          {formData.job_description.substring(0, 150)}...
        </p>
      </div>
    </div>
  );
}

// Simple Voice Assistant Component - RESTORED TO ORIGINAL WORKING VERSION
function SimpleVoiceAssistant({
  onConnectButtonClicked,
}: {
  onConnectButtonClicked: () => void;
}) {
  const { agent, state, videoTrack, audioTrack } = useVoiceAssistant();

  console.log("SimpleVoiceAssistant - agentState:", state);
  console.log("SimpleVoiceAssistant - agent:", agent);
  console.log("SimpleVoiceAssistant - videoTrack:", videoTrack);
  console.log("SimpleVoiceAssistant - audioTrack:", audioTrack);

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8">
      <AnimatePresence mode="wait">
        {state === "disconnected" ? (
          <motion.div
            key="disconnected"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="text-center"
          >
            <div className="mb-8">
              <div className="w-32 h-32 bg-purple-600/20 rounded-full flex items-center justify-center mb-4 mx-auto border border-purple-500/30">
                <Phone className="w-16 h-16 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Ready to Start
              </h3>
              <p className="text-purple-300">
                Click to begin your AI interview
              </p>
            </div>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
              onClick={onConnectButtonClicked}
            >
              Start Interview
            </motion.button>
          </motion.div>
        ) : state === "connecting" ? (
          <motion.div
            key="connecting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="w-32 h-32 bg-yellow-600/20 rounded-full flex items-center justify-center mb-4 mx-auto border border-yellow-500/30">
              <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Connecting...
            </h3>
            <p className="text-yellow-300">Setting up your interview session</p>
          </motion.div>
        ) : (
          <motion.div
            key="connected"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="flex flex-col items-center gap-8 w-full max-w-2xl"
          >
            <AgentVisualizer />
            <ControlBar />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Agent Visualizer - RESTORED TO ORIGINAL WORKING VERSION + VIDEO SUPPORT
function AgentVisualizer() {
  const { state, videoTrack, audioTrack } = useVoiceAssistant();

  // If video track is available, show video
  if (videoTrack) {
    console.log("✅ Displaying agent video track");
    return (
      <div className="w-full max-w-lg">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10">
          <div className="p-4 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border-b border-white/10">
            <div className="flex items-center justify-center gap-2">
              <Bot className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">
                AI Interviewer
              </h3>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-purple-300 capitalize">
                  {state}
                </span>
              </div>
            </div>
            <div className="text-center mt-2">
              <span className="text-xs text-green-300">✅ Video Connected</span>
            </div>
          </div>
          <div className="aspect-video relative bg-gradient-to-br from-purple-900/50 to-indigo-900/50">
            <VideoTrack
              trackRef={videoTrack}
              className="w-full h-full object-cover"
            />
            {/* Audio visualizer overlay */}
            {audioTrack && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2">
                  <BarVisualizer
                    state={state}
                    barCount={7}
                    trackRef={audioTrack}
                    className="agent-audio-visualizer"
                    options={{ minHeight: 8, maxHeight: 24 }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Original audio-only visualizer (RESTORED)
  console.log("📻 Displaying audio-only visualizer");
  return (
    <div className="w-full max-w-lg">
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center mb-4 mx-auto border border-purple-500/30">
            <Bot className="w-10 h-10 text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            AI Interviewer
          </h3>
          <p className="text-purple-300 text-sm capitalize">{state}</p>
        </div>
        <div className="h-32">
          <BarVisualizer
            state={state}
            barCount={5}
            trackRef={audioTrack}
            className="agent-visualizer"
            options={{ minHeight: 24 }}
          />
        </div>
        {state === "listening" && (
          <div className="text-center mt-4">
            <p className="text-sm text-purple-300 animate-pulse">
              The AI is listening...
            </p>
          </div>
        )}
        {state === "speaking" && (
          <div className="text-center mt-4">
            <p className="text-sm text-green-300 animate-pulse">
              The AI is speaking...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Control Bar - RESTORED TO ORIGINAL
function ControlBar() {
  const { state: agentState } = useVoiceAssistant();

  return (
    <div className="relative">
      <AnimatePresence>
        {agentState !== "disconnected" && agentState !== "connecting" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="flex items-center justify-center gap-4 bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
          >
            <VoiceAssistantControlBar controls={{ leave: false }} />
            <DisconnectButton className="p-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-red-400 hover:text-red-300 transition-all duration-200">
              <Phone className="w-5 h-5 transform rotate-[135deg]" />
            </DisconnectButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default InterviewRoom;
