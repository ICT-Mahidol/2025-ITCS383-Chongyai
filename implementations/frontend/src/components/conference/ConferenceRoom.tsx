'use client';

import { useState, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, Users } from 'lucide-react';
import api, { getApiErrorMessage } from '@/lib/api';
import type { Conference, ApiResponse } from '@/types';

interface ConferenceRoomProps {
  roomCode: string;
  onLeave?: () => void;
}

export function ConferenceRoom({ roomCode, onLeave }: ConferenceRoomProps) {
  const [conference, setConference] = useState<Conference | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await api.get<ApiResponse<Conference>>(`/conference/rooms/${roomCode}`);
        setConference(res.data.data);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    const joinRoom = async () => {
      try {
        await api.post(`/conference/rooms/${roomCode}/join`);
        setHasJoined(true);
      } catch (err) {
        setError(getApiErrorMessage(err));
      }
    };

    fetchRoom();
    joinRoom();

    return () => {
      if (hasJoined) {
        api.post(`/conference/rooms/${roomCode}/leave`).catch(() => undefined);
      }
    };
  }, [roomCode]);

  const handleLeave = async () => {
    await api.post(`/conference/rooms/${roomCode}/leave`).catch(() => undefined);
    onLeave?.();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary-light border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Joining room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-500">
          <p className="font-medium mb-1">Failed to join room</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden">
      {/* Room header */}
      <div className="bg-gray-800 px-5 py-3 flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold text-sm">{conference?.title ?? 'Interview Room'}</h3>
          <p className="text-gray-400 text-xs">Room: {roomCode}</p>
        </div>
        <div className="flex items-center gap-2 text-gray-400 text-xs">
          <Users className="w-3.5 h-3.5" />
          {conference?.participants?.length ?? 0} participant(s)
        </div>
      </div>

      {/* Video grid */}
      <div className="grid grid-cols-2 gap-3 p-4">
        {/* Local video */}
        <div className="aspect-video bg-gray-700 rounded-xl flex items-center justify-center relative">
          {isCameraOff ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 bg-gray-600 rounded-full flex items-center justify-center">
                <VideoOff className="w-6 h-6 text-gray-400" />
              </div>
              <span className="text-gray-400 text-xs">Camera off</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center">
                <Video className="w-6 h-6 text-primary" />
              </div>
              <span className="text-gray-300 text-xs">Your video</span>
            </div>
          )}
          <span className="absolute bottom-2 left-2 text-xs bg-black/50 text-white px-2 py-0.5 rounded-full">
            You {isMuted && '🔇'}
          </span>
        </div>

        {/* Remote video */}
        <div className="aspect-video bg-gray-700 rounded-xl flex items-center justify-center relative">
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-gray-600 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-gray-400" />
            </div>
            <span className="text-gray-400 text-xs">Waiting for others...</span>
          </div>
          <span className="absolute bottom-2 left-2 text-xs bg-black/50 text-white px-2 py-0.5 rounded-full">
            Remote
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 px-5 py-3 flex items-center justify-center gap-4">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-3 rounded-full transition-colors ${isMuted ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <button
          onClick={() => setIsCameraOff(!isCameraOff)}
          className={`p-3 rounded-full transition-colors ${isCameraOff ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
          title={isCameraOff ? 'Turn on camera' : 'Turn off camera'}
        >
          {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </button>

        <button
          className="p-3 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors"
          title="Share screen"
        >
          <Monitor className="w-5 h-5" />
        </button>

        <button
          onClick={handleLeave}
          className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
          title="Leave call"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
