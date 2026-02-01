import type { RoomHistory } from '@/types';

/**
 * LocalStorageから全てのルーム履歴を取得
 */
export function getAllRoomHistories(): RoomHistory[] {
  if (typeof window === 'undefined') return [];

  const histories: RoomHistory[] = [];

  // localStorageのすべてのキーをチェック
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.match(/^room:.+:history$/)) continue;

    try {
      const data = localStorage.getItem(key);
      if (!data) continue;

      const parsed = JSON.parse(data);

      // 旧形式（配列）の場合はスキップ
      if (Array.isArray(parsed)) continue;

      // 新形式（RoomHistory）の場合のみ追加
      if (parsed.roomId && parsed.votingHistory) {
        histories.push(parsed as RoomHistory);
      }
    } catch (e) {
      console.error(`Failed to parse room history for key ${key}:`, e);
    }
  }

  // 作成日時の降順でソート（新しい順）
  return histories.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * 特定のルーム履歴を取得
 */
export function getRoomHistory(roomId: string): RoomHistory | null {
  if (typeof window === 'undefined') return null;

  try {
    const data = localStorage.getItem(`room:${roomId}:history`);
    if (!data) return null;

    const parsed = JSON.parse(data);

    // 旧形式の場合はnull
    if (Array.isArray(parsed)) return null;

    return parsed as RoomHistory;
  } catch (e) {
    console.error(`Failed to parse room history for ${roomId}:`, e);
    return null;
  }
}

/**
 * ルーム履歴を削除
 */
export function deleteRoomHistory(roomId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`room:${roomId}:history`);
}
