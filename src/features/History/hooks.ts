import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import type { RoomHistory } from '@/types';
import { getAllRoomHistories, deleteRoomHistory } from '@/utils/roomStorage';

const NICKNAME_KEY = 'planning-poker:nickname';

export function useHistoryState() {
  const router = useRouter();
  const [histories, setHistories] = useState<RoomHistory[]>([]);

  // 履歴を読み込み
  useEffect(() => {
    const loadedHistories = getAllRoomHistories();
    setHistories(loadedHistories);
  }, []);

  // ルームを復元
  const handleRestore = useCallback((oldRoomId: string) => {
    if (typeof window === 'undefined') return;

    // 保存されているニックネームを取得
    const savedNickname = localStorage.getItem(NICKNAME_KEY) || '';

    // 新しいルームIDとuserIdを生成
    const newRoomId = nanoid(6);
    const userId = nanoid(10);

    // sessionStorageに必要な情報を設定
    sessionStorage.setItem(`room:${newRoomId}:user`, JSON.stringify({
      userId,
      nickname: savedNickname,
    }));

    // ホストとして設定
    sessionStorage.setItem(`room:${newRoomId}:host`, userId);

    // 履歴からteamNameを取得して設定
    const history = histories.find(h => h.roomId === oldRoomId);
    if (history?.teamName) {
      sessionStorage.setItem(`room:${newRoomId}:teamName`, history.teamName);
    }

    // 古い履歴を新しいルームIDでコピー
    if (history) {
      const newHistory = {
        ...history,
        roomId: newRoomId,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(`room:${newRoomId}:history`, JSON.stringify(newHistory));
    }

    // ルームページに遷移
    router.push(`/room/${newRoomId}`);
  }, [router, histories]);

  // ルーム履歴を削除
  const handleDelete = useCallback((roomId: string) => {
    if (confirm('このルームの履歴を削除してもよろしいですか？')) {
      deleteRoomHistory(roomId);
      setHistories(prev => prev.filter(h => h.roomId !== roomId));
    }
  }, []);

  return {
    histories,
    handleRestore,
    handleDelete,
  };
}
