import { use } from 'react';
import { RoomPage } from '@/features/Room';

export default function RoomPageWrapper({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  return <RoomPage roomId={roomId} />;
}
