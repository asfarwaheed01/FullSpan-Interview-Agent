"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Room, RoomEvent } from "livekit-client";
import {
  BarVisualizer,
  DisconnectButton,
  RoomAudioRenderer,
  RoomContext,
  VideoTrack,
  VoiceAssistantControlBar,
  useVoiceAssistant,
} from "@livekit/components-react";
import { Phone, X } from "lucide-react";
import {
  ConnectionDetails,
  InterviewFormData,
  InterviewResponse,
} from "@/app/interfaces/interview";
import { interviewAPI } from "@/app/utils/api";

interface InterviewRoomProps {
  interviewData: InterviewResponse;
  formData: InterviewFormData;
  onEndInterview: () => void;
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

  console.log(isConnected);

  // components/InterviewRoom.tsx - Update the onConnectButtonClicked function

  // components/InterviewRoom.tsx - Update the onConnectButtonClicked function

  // components/InterviewRoom.tsx - Update the onConnectButtonClicked function

  const onConnectButtonClicked = useCallback(async () => {
    try {
      setConnectionStatus("connecting");

      const connectionDetails: ConnectionDetails = {
        serverUrl: interviewData.wsUrl,
        participantToken: interviewData.access_token,
        roomName: interviewData.room_name,
      };

      // Correct LiveKit connection options
      // const roomOptions = {
      //   adaptiveStream: true,
      //   dynacast: true,
      // };

      await room.connect(
        connectionDetails.serverUrl,
        connectionDetails.participantToken
        // roomOptions
      );

      // Configure microphone with proper LiveKit audio options
      const audioOptions = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: false,
      };

      await room.localParticipant.setMicrophoneEnabled(true, audioOptions);

      setIsConnected(true);
      setConnectionStatus("connected");
    } catch (error) {
      console.error("Failed to connect to room:", error);
      setConnectionStatus("disconnected");
    }
  }, [room, interviewData]);

  const onDeviceFailure = useCallback((error: Error) => {
    console.error(error);
    alert(
      "Error acquiring camera or microphone permissions. Please make sure you grant the necessary permissions in your browser and reload the tab"
    );
  }, []);

  useEffect(() => {
    room.on(RoomEvent.MediaDevicesError, onDeviceFailure);

    // Auto-connect when component mounts
    onConnectButtonClicked();

    return () => {
      room.off(RoomEvent.MediaDevicesError, onDeviceFailure);
      room.disconnect();
    };
  }, [room, onDeviceFailure, onConnectButtonClicked]);

  const handleEndInterview = useCallback(async () => {
    try {
      // Call the end interview API
      await interviewAPI.endInterview(interviewData.room_name);
      room.disconnect();
      onEndInterview();
    } catch (error) {
      console.error("Failed to end interview:", error);
      // Still disconnect and navigate back even if API call fails
      room.disconnect();
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
            </div>
            <div className="flex items-center gap-4">
              <div className="text-purple-300 text-sm">
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
          <div className="flex-1 flex flex-col p-6">
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-4xl">
                <SimpleVoiceAssistant
                  onConnectButtonClicked={onConnectButtonClicked}
                />
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="w-80 bg-black/20 backdrop-blur-sm border-l border-white/10 p-6">
            <div className="space-y-6">
              {/* Candidate Info */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-white font-semibold mb-3">
                  Candidate Profile
                </h3>
                <div className="space-y-2">
                  <p className="text-purple-200 text-sm">
                    <span className="font-medium">Name:</span>{" "}
                    {formData.candidate_name}
                  </p>
                  <p className="text-purple-200 text-sm">
                    <span className="font-medium">Status:</span> In Progress
                  </p>
                </div>
              </div>

              {/* Interview Details */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-white font-semibold mb-3">
                  Interview Details
                </h3>
                <div className="space-y-2">
                  <p className="text-purple-200 text-sm">
                    <span className="font-medium">Room:</span>{" "}
                    {interviewData.room_name.split("-").pop()?.substring(0, 8)}
                  </p>
                  <p className="text-purple-200 text-sm">
                    <span className="font-medium">Connection:</span> LiveKit
                    Voice AI
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
                <h3 className="text-white font-semibold mb-3">
                  Position Summary
                </h3>
                <p className="text-purple-200 text-sm line-clamp-4">
                  {formData.job_description.substring(0, 150)}...
                </p>
              </div>
            </div>
          </div>
        </div>

        <RoomAudioRenderer />
      </RoomContext.Provider>
    </main>
  );
};

// Simple Voice Assistant Component integrated with your existing code
function SimpleVoiceAssistant({
  onConnectButtonClicked,
}: {
  onConnectButtonClicked: () => void;
}) {
  const { state: agentState } = useVoiceAssistant();

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8">
      <AnimatePresence mode="wait">
        {agentState === "disconnected" ? (
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

function AgentVisualizer() {
  const { state: agentState, videoTrack, audioTrack } = useVoiceAssistant();

  if (videoTrack) {
    return (
      <div className="w-96 h-96 rounded-2xl overflow-hidden border border-white/20 bg-gradient-to-br from-purple-600/10 to-indigo-600/10">
        <VideoTrack trackRef={videoTrack} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg">
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-white mb-2">
            AI Interviewer
          </h3>
          <p className="text-purple-300 text-sm capitalize">{agentState}</p>
        </div>
        <div className="h-32">
          <BarVisualizer
            state={agentState}
            barCount={5}
            trackRef={audioTrack}
            className="agent-visualizer"
            options={{ minHeight: 24 }}
          />
        </div>
      </div>
    </div>
  );
}

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
