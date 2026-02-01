'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';

export default function HomePage() {
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-12">
          プランニングポーカー
        </h1>

        <div className="max-w-2xl mx-auto grid md:grid-cols-2 gap-8">
          {/* ルーム作成 */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4">ルームを作成</h2>
            <form onSubmit={handleCreateRoom}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  ニックネーム
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="例: 山田"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={20}
                />
              </div>
              <button
                type="submit"
                disabled={!nickname.trim()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                作成する
              </button>
            </form>
          </div>

          {/* ルーム参加 */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4">ルームに参加</h2>
            <form onSubmit={handleJoinRoom}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  ルームID
                </label>
                <input
                  type="text"
                  value={roomIdInput}
                  onChange={(e) => setRoomIdInput(e.target.value)}
                  placeholder="例: abc123"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  maxLength={10}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  ニックネーム
                </label>
                <input
                  type="text"
                  value={joinNickname}
                  onChange={(e) => setJoinNickname(e.target.value)}
                  placeholder="例: 鈴木"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  maxLength={20}
                />
              </div>
              <button
                type="submit"
                disabled={!roomIdInput.trim() || !joinNickname.trim()}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                参加する
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
