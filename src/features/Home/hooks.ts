import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';

const TEAM_NAME_KEY = 'planning-poker:team-name';
const NICKNAME_KEY = 'planning-poker:nickname';

// SessionStorageの古いルーム情報をクリーンナップ
function cleanupRoomStorage() {
  if (typeof window === 'undefined') return;

  const keysToRemove: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith('room:')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => sessionStorage.removeItem(key));
}

export function useHomeState() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [teamName, setTeamName] = useState('');
  const [roomIdInput, setRoomIdInput] = useState('');
  const [joinNickname, setJoinNickname] = useState('');

  // LocalStorageからチーム名とニックネームを読み込み
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTeamName = localStorage.getItem(TEAM_NAME_KEY);
      if (savedTeamName) {
        setTeamName(savedTeamName);
      }

      const savedNickname = localStorage.getItem(NICKNAME_KEY);
      if (savedNickname) {
        setNickname(savedNickname);
      }
    }
  }, []);

  // ルーム作成
  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    const roomId = nanoid(6);
    const userId = nanoid(10);
    const trimmedTeamName = teamName.trim();
    const trimmedNickname = nickname.trim();

    // 古いルーム情報をクリーンナップ
    cleanupRoomStorage();

    // ホストとしてユーザー情報を保存
    if (typeof window !== 'undefined') {
      // 新しいルーム情報を保存
      sessionStorage.setItem(`room:${roomId}:user`, JSON.stringify({
        userId,
        nickname: trimmedNickname,
      }));
      // ホスト情報を別途保存
      sessionStorage.setItem(`room:${roomId}:host`, userId);

      // チーム名を保存
      if (trimmedTeamName) {
        sessionStorage.setItem(`room:${roomId}:teamName`, trimmedTeamName);
        localStorage.setItem(TEAM_NAME_KEY, trimmedTeamName);
      }

      // ニックネームを保存
      localStorage.setItem(NICKNAME_KEY, trimmedNickname);
    }

    router.push(`/room/${roomId}`);
  };

  // ルーム参加
  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomIdInput.trim() || !joinNickname.trim()) return;

    const roomId = roomIdInput.trim().toLowerCase();
    const userId = nanoid(10);

    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`room:${roomId}:user`, JSON.stringify({
        userId,
        nickname: joinNickname.trim(),
      }));
    }

    router.push(`/room/${roomId}`);
  };

  return {
    nickname,
    setNickname,
    teamName,
    setTeamName,
    roomIdInput,
    setRoomIdInput,
    joinNickname,
    setJoinNickname,
    handleCreateRoom,
    handleJoinRoom,
  };
}
