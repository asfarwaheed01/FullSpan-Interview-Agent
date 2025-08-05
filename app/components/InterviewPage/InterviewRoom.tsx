"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Room, RoomEvent } from "livekit-client";
import {
  BarVisualizer,
  RoomAudioRenderer,
  RoomContext,
  useVoiceAssistant,
  useLocalParticipant,
  useTracks,
} from "@livekit/components-react";
import {
  X,
  Mic,
  MicOff,
  MessageSquare,
  PhoneOff,
  Camera,
  CameraOff,
} from "lucide-react";
import {
  ConnectionDetails,
  InterviewRoomProps,
  PartialTranscript,
  Participant,
  TrackPublication,
  TranscriptionSegment,
  TranscriptMessage,
} from "@/app/interfaces/interview";
import { interviewAPI } from "@/app/utils/api";
import { Track } from "livekit-client";
import avatar from "@/public/assets/technology.png";
import Image from "next/image";

const InterviewRoom: React.FC<InterviewRoomProps> = ({
  interviewData,
  onEndInterview,
}) => {
  const [room] = useState(new Room());
  const [isConnected, setIsConnected] = useState<boolean>(false);
  console.log(isConnected);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [partialTranscripts, setPartialTranscripts] = useState<
    Map<string, PartialTranscript>
  >(new Map());
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const requestPermissions = useCallback(async () => {
    try {
      setPermissionError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      });

      stream.getTracks().forEach((track) => track.stop());
      setPermissionsGranted(true);

      setTimeout(() => {
        onConnectButtonClicked();
      }, 500);
    } catch (error) {
      console.error("Permission denied:", error);
      setPermissionError(
        "Camera and microphone access is required for the interview. Please allow access and try again."
      );
    }
  }, []);

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

      if (room.state !== "disconnected") {
        room.disconnect();
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      await room.connect(
        connectionDetails.serverUrl,
        connectionDetails.participantToken
      );

      await new Promise<void>((resolve, reject) => {
        if (room.state === "connected") {
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
          cleanup();
          resolve();
        };

        const onDisconnected = (reason?: unknown) => {
          cleanup();
          reject(new Error(`Connection failed: ${reason || "Unknown"}`));
        };

        room.on(RoomEvent.Connected, onConnected);
        room.on(RoomEvent.Disconnected, onDisconnected);
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (room.state !== "connected") {
        throw new Error("Room disconnected after connection");
      }

      try {
        const audioOptions = {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        };
        await room.localParticipant.setMicrophoneEnabled(true, audioOptions);
        setIsMicEnabled(true);

        await room.localParticipant.setCameraEnabled(true);
        setIsCameraEnabled(true);
      } catch (error) {
        console.warn("Failed to enable devices:", error);
      }

      setIsConnected(true);
      setConnectionStatus("connected");
    } catch (error) {
      console.error("Failed to connect to room:", error);
      setConnectionStatus("disconnected");
      setIsConnected(false);
      setConnectionError(
        error instanceof Error ? error.message : "Connection failed"
      );

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
      const segmentsArray = Array.isArray(segments) ? segments : [segments];

      segmentsArray.forEach((segment) => {
        if (segment && segment.text && segment.text.trim()) {
          const participantId =
            participant?.identity || participant?.name || "AI";
          const participantKey = `${participantId}-${
            publication?.trackSid || "default"
          }`;

          if (partialTimeouts.has(participantKey)) {
            clearTimeout(partialTimeouts.get(participantKey)!);
          }

          if (segment.final) {
            const newMessage: TranscriptMessage = {
              id: `${Date.now()}-${Math.random()}`,
              participant: participantId,
              text: segment.text.trim(),
              timestamp: new Date(),
              isFinal: true,
            };

            setTranscript((prev) => {
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

            setPartialTranscripts((prev) => {
              const newMap = new Map(prev);
              newMap.delete(participantKey);
              return newMap;
            });
          } else {
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

            const timeoutDuration =
              participantId.includes("AI") || participantId.includes("agent")
                ? 3000
                : 1500;

            const timeout = setTimeout(() => {
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

    room.on(RoomEvent.TranscriptionReceived, handleTranscription);

    const cleanupInterval = setInterval(() => {
      setPartialTranscripts((prev) => {
        const newMap = new Map(prev);
        const now = new Date();

        for (const [key, partial] of newMap.entries()) {
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

      for (const timeout of partialTimeouts.values()) {
        clearTimeout(timeout);
      }
      partialTimeouts.clear();
    };
  }, [room]);

  const toggleMicrophone = useCallback(async () => {
    if (room.state !== "connected") {
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
      return;
    }

    try {
      const enabled = !isCameraEnabled;
      await room.localParticipant.setCameraEnabled(enabled);
      setIsCameraEnabled(enabled);
    } catch (error) {
      console.error("Failed to toggle camera:", error);
    }
  }, [room, isCameraEnabled]);

  const onDeviceFailure = useCallback((error: Error) => {
    console.error(error);
    setPermissionError(
      "Error accessing camera/microphone. Please check permissions and reload."
    );
  }, []);

  useEffect(() => {
    let mounted = true;
    console.log(mounted);

    room.on(RoomEvent.MediaDevicesError, onDeviceFailure);

    return () => {
      mounted = false;
      room.off(RoomEvent.MediaDevicesError, onDeviceFailure);

      if (room.state === "connected" || room.state === "connecting") {
        try {
          room.disconnect();
        } catch (error) {
          console.warn("Error during disconnect:", error);
        }
      }
    };
  }, [room, onDeviceFailure]);

  const handleEndInterview = useCallback(async () => {
    try {
      try {
        await interviewAPI.endInterview(interviewData.room_name);
      } catch (apiError) {
        console.warn("Failed to end interview via API:", apiError);
      }

      if (room.state === "connected" || room.state === "connecting") {
        try {
          room.disconnect();
        } catch (disconnectError) {
          console.warn("Error disconnecting room:", disconnectError);
        }
      }

      setConnectionStatus("disconnected");
      setIsConnected(false);

      setTimeout(() => {
        onEndInterview();
      }, 500);
    } catch (error) {
      console.error("Failed to end interview:", error);

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

  if (!permissionsGranted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
          <div className="text-center">
            <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Camera className="w-10 h-10 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Camera & Microphone Access
            </h2>
            <p className="text-purple-200 mb-6">
              To proceed with your interview, we need access to your camera and
              microphone. This allows you to communicate with the AI
              interviewer.
            </p>

            {permissionError && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
                <p className="text-red-300 text-sm">{permissionError}</p>
              </div>
            )}

            <button
              onClick={requestPermissions}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
            >
              Allow Camera & Microphone
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      data-lk-theme="default"
      className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 relative"
    >
      <RoomContext.Provider value={room}>
        <div className="flex h-screen">
          <div className="flex-1 relative">
            <UserVideoFeed room={room} />

            <div className="flex items-center justify-center h-full">
              <SimpleVoiceAssistant
                onConnectButtonClicked={onConnectButtonClicked}
                connectionStatus={connectionStatus}
                connectionError={connectionError}
              />
            </div>

            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center gap-4 bg-black/40 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
                <button
                  onClick={toggleMicrophone}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    isMicEnabled
                      ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  }`}
                >
                  {isMicEnabled ? (
                    <Mic className="w-5 h-5" />
                  ) : (
                    <MicOff className="w-5 h-5" />
                  )}
                </button>

                <button
                  onClick={toggleCamera}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    isCameraEnabled
                      ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  }`}
                >
                  {isCameraEnabled ? (
                    <Camera className="w-5 h-5" />
                  ) : (
                    <CameraOff className="w-5 h-5" />
                  )}
                </button>

                <div className="w-px h-8 bg-white/20"></div>

                <button
                  onClick={handleEndInterview}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center gap-2"
                >
                  <PhoneOff className="w-5 h-5" />
                  End Interview
                </button>
              </div>
            </div>
          </div>

          {showTranscript && (
            <div className="w-96 bg-black/20 backdrop-blur-sm border-l border-white/10">
              <TranscriptPanel
                transcript={transcript}
                partialTranscripts={partialTranscripts}
                transcriptEndRef={transcriptEndRef}
                onClose={() => setShowTranscript(false)}
              />
            </div>
          )}

          {!showTranscript && (
            <button
              onClick={() => setShowTranscript(true)}
              className="fixed top-1/2 right-4 transform -translate-y-1/2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 p-3 rounded-xl border border-purple-500/30 transition-all duration-200"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          )}
        </div>

        <RoomAudioRenderer />
      </RoomContext.Provider>
    </main>
  );
};

function UserVideoFeed({ room }: { room: Room }) {
  console.log(room);
  const { localParticipant } = useLocalParticipant();
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: false });

  const videoTrack = tracks.find(
    (track) => track.participant.identity === localParticipant.identity
  );

  useEffect(() => {
    if (videoTrack?.publication?.track) {
      const videoElement = document.getElementById(
        "user-video"
      ) as HTMLVideoElement;
      if (videoElement) {
        videoTrack.publication.track.attach(videoElement);
        return () => {
          videoTrack.publication.track?.detach(videoElement);
        };
      }
    }
  }, [videoTrack]);

  return (
    <div className="absolute top-6 left-6 z-10">
      <div className="w-48 h-36 bg-black/50 rounded-xl overflow-hidden border border-white/20 backdrop-blur-sm">
        {videoTrack?.publication?.track ? (
          <video
            id="user-video"
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover transform scale-x-[-1]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <Camera className="w-8 h-8 text-white/50 mx-auto mb-2" />
              <p className="text-white/50 text-xs">Camera Off</p>
            </div>
          </div>
        )}
      </div>
      <div className="mt-2 text-center">
        <span className="text-white/70 text-sm font-medium">You</span>
      </div>
    </div>
  );
}

function TranscriptPanel({
  transcript,
  partialTranscripts,
  transcriptEndRef,
  onClose,
}: {
  transcript: TranscriptMessage[];
  partialTranscripts: Map<string, PartialTranscript>;
  transcriptEndRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);

  useEffect(() => {
    if (isAutoScrollEnabled && transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [transcript, partialTranscripts, isAutoScrollEnabled]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const isAtBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      50;
    setIsAutoScrollEnabled(isAtBottom);
  }, []);

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold">Live Transcript</h3>
        <button
          onClick={onClose}
          className="text-purple-300 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto space-y-3 bg-white/5 rounded-xl p-4 border border-white/10"
      >
        {transcript.length === 0 && partialTranscripts.size === 0 ? (
          <div className="text-center text-purple-300 text-sm">
            Transcript will appear here once the conversation starts...
          </div>
        ) : (
          <>
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
    </div>
  );
}

function SimpleVoiceAssistant({
  onConnectButtonClicked,
  connectionStatus,
  connectionError,
}: {
  onConnectButtonClicked: () => void;
  connectionStatus: string;
  connectionError: string | null;
}) {
  const { state, audioTrack } = useVoiceAssistant();

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <AnimatePresence mode="wait">
        {connectionStatus === "disconnected" ||
        connectionStatus === "connecting" ? (
          <motion.div
            key="disconnected"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center"
          >
            <div className="mb-8">
              <div className="relative w-40 h-40 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/30 to-indigo-500/30 animate-pulse"></div>
                <div className="absolute inset-2 rounded-full bg-purple-600/20 flex items-center justify-center">
                  <Image
                    src={avatar}
                    alt="AI Interviewer"
                    width={120}
                    height={120}
                    className="rounded-full"
                  />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">
                {connectionStatus === "connecting"
                  ? "Connecting..."
                  : "AI Interview Ready"}
              </h3>
              <p className="text-purple-300 text-lg">
                {connectionStatus === "connecting"
                  ? "Setting up your interview session"
                  : "Click to begin your voice interview with AI"}
              </p>
              {connectionError && (
                <div className="mt-4 bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                  <p className="text-red-300 text-sm">{connectionError}</p>
                </div>
              )}
            </div>
            {connectionStatus !== "connecting" && (
              <button
                onClick={onConnectButtonClicked}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                Start Interview
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="connected"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <AgentVisualizer state={state} audioTrack={audioTrack} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AgentVisualizer({
  state,
  audioTrack,
}: {
  state: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  audioTrack: any;
}) {
  return (
    <div className="relative">
      <div className="relative w-64 h-64 mx-auto">
        {state === "speaking" && (
          <div className="absolute inset-0 rounded-full">
            <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping"></div>
            <div className="absolute inset-2 rounded-full bg-green-400/30 animate-ping animation-delay-200"></div>
            <div className="absolute inset-4 rounded-full bg-green-400/40 animate-ping animation-delay-400"></div>
          </div>
        )}

        {state === "listening" && (
          <div className="absolute inset-0 rounded-full">
            <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-pulse"></div>
            <div className="absolute inset-2 rounded-full bg-blue-400/30 animate-pulse animation-delay-300"></div>
          </div>
        )}

        {state === "thinking" && (
          <div className="absolute inset-0 rounded-full">
            <div className="absolute inset-0 rounded-full bg-yellow-400/20 animate-spin"></div>
            <div
              className="absolute inset-4 rounded-full bg-yellow-400/30 animate-spin animation-delay-500"
              style={{ animationDirection: "reverse" }}
            ></div>
          </div>
        )}

        <div className="absolute inset-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
          <Image
            src={avatar}
            alt="AI Interviewer"
            width={180}
            height={180}
            className="rounded-full"
          />
        </div>
      </div>

      <div className="mt-8 text-center">
        <h3 className="text-2xl font-semibold text-white mb-2">
          AI Interviewer
        </h3>
        <div className="flex items-center justify-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              state === "speaking"
                ? "bg-green-400 animate-pulse"
                : state === "listening"
                ? "bg-blue-400 animate-pulse"
                : state === "thinking"
                ? "bg-yellow-400 animate-pulse"
                : "bg-gray-400"
            }`}
          ></div>
          <span className="text-purple-300 capitalize">
            {state === "speaking"
              ? "Speaking"
              : state === "listening"
              ? "Listening"
              : state === "thinking"
              ? "Thinking"
              : "Ready"}
          </span>
        </div>

        {audioTrack && (
          <div className="mt-6 h-20 flex items-center justify-center">
            <BarVisualizer
              barCount={15}
              trackRef={audioTrack}
              className="w-full max-w-xs"
              options={{
                minHeight: 8,
                maxHeight: 60,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default InterviewRoom;
