'use client';

import { useRouter } from 'next/navigation';
import { ConferenceRoom } from '@/components/conference/ConferenceRoom';

interface PageProps {
  params: { roomCode: string };
}

export default function ConferencePage({ params }: PageProps) {
  const { roomCode } = params;
  const router = useRouter();

  const handleLeave = () => {
    router.back();
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Video Interview</h1>
        <p className="text-gray-500 text-sm">Room: {roomCode}</p>
      </div>
      <ConferenceRoom roomCode={roomCode} onLeave={handleLeave} />
    </div>
  );
}
