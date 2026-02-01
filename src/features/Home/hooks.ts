import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';

export function useHomeState() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [roomIdInput, setRoomIdInput] = useState('');
  const [joinNickname, setJoinNickname] = useState('');

  // ルーム作成
  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    const roomId = nanoid(6);
    const userId = nanoid(10);

    // ホストとしてユーザー情報を保存
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`room:${roomId}:user`, JSON.stringify({
        userId,
        nickname: nickname.trim(),
      }));
      // ホスト情報を別途保存
      sessionStorage.setItem(`room:${roomId}:host`, userId);
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
    roomIdInput,
    setRoomIdInput,
    joinNickname,
    setJoinNickname,
    handleCreateRoom,
    handleJoinRoom,
  };
}
