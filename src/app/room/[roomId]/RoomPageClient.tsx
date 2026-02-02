'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { RoomPage } from '@/features/Room';

export function RoomPageClient() {
  const pathname = usePathname();
  const [actualRoomId, setActualRoomId] = useState<string | null>(null);

  useEffect(() => {
    // URL から実際の roomId を取得
    const match = pathname?.match(/\/room\/([^/]+)/);
    if (match) {
      setActualRoomId(match[1]);
    }
  }, [pathname]);

  if (!actualRoomId) {
    return null; // またはローディング表示
  }

  return <RoomPage roomId={actualRoomId} />;
}
