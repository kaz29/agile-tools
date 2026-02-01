'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { useWebPubSub } from '@/hooks/useWebPubSub';
import type { RoomState, ServerMessage, Participant } from '@/types';

const CARDS = ['0', '1', '2', '3', '5', '8', '13', '21', '?', '☕'];

export default function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const [userInfo, setUserInfo] = useState<{ userId: string; nickname: string } | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [isRevealed, setIsRevealed] = useState(false);
  const [facilitatorId, setFacilitatorId] = useState<string>('');

  // セッションストレージからユーザー情報を取得
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(`room:${roomId}:user`);
      const hostId = sessionStorage.getItem(`room:${roomId}:host`);

      if (stored) {
        const info = JSON.parse(stored);
        setUserInfo(info);
        if (hostId === info.userId) {
          setIsHost(true);
          setFacilitatorId(info.userId);
        }
      }
    }
  }, [roomId]);

  // メッセージハンドラー
  const handleMessage = useCallback((message: ServerMessage) => {
    switch (message.type) {
      case 'roomState':
        setParticipants(message.state.participants);
        setVotes(message.state.votes);
        setIsRevealed(message.state.isRevealed);
        setFacilitatorId(message.state.facilitatorId);
        break;

      case 'userJoined':
        setParticipants((prev) => {
          if (prev.find(p => p.id === message.user.id)) {
            return prev;
          }
          return [...prev, message.user];
        });
        break;

      case 'userLeft':
        setParticipants((prev) => prev.filter((p) => p.id !== message.userId));
        break;

      case 'voted':
        setParticipants((prev) =>
          prev.map((p) =>
            p.id === message.userId ? { ...p, hasVoted: true } : p
          )
        );
        break;

      case 'revealed':
        setIsRevealed(true);
        setVotes(message.votes);
        break;

      case 'reset':
        setIsRevealed(false);
        setVotes({});
        setSelectedCard(null);
        setParticipants((prev) =>
          prev.map((p) => ({ ...p, hasVoted: false }))
        );
        break;
    }
  }, []);

  const { isConnected, send } = useWebPubSub({
    roomId,
    userId: userInfo?.userId ?? '',
    nickname: userInfo?.nickname ?? '',
    onMessage: handleMessage,
    enabled: !!userInfo,
  });

  // カード選択
  const handleCardSelect = (card: string) => {
    if (isRevealed || !userInfo) return;
    setSelectedCard(card);
    send({ type: 'vote', userId: userInfo.userId, value: card });
  };

  // カード公開
  const handleReveal = () => {
    if (!isHost) return;
    send({ type: 'reveal' });
  };

  // リセット
  const handleReset = () => {
    if (!isHost) return;
    send({ type: 'reset' });
  };

  // 招待リンクコピー
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      alert('招待リンクをコピーしました');
    }
  };

  if (!userInfo) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow p-6 max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">ルームに参加</h2>
          <p className="text-gray-600 mb-4">
            ニックネームを入力してください
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const nickname = formData.get('nickname') as string;
              if (nickname.trim()) {
                const userId = crypto.randomUUID();
                const info = { userId, nickname: nickname.trim() };
                sessionStorage.setItem(`room:${roomId}:user`, JSON.stringify(info));
                setUserInfo(info);
              }
            }}
          >
            <input
              type="text"
              name="nickname"
              placeholder="ニックネーム"
              className="w-full px-3 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={20}
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              参加する
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">ルーム: {roomId}</h1>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded text-sm ${
                  isConnected
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {isConnected ? '接続済み' : '接続中...'}
              </span>
              {isHost && (
                <span className="px-2 py-1 rounded text-sm bg-blue-100 text-blue-800">
                  ホスト
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          {/* 参加者リスト */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-bold mb-3">
              👥 参加者 ({participants.length})
            </h2>
            <ul className="space-y-2">
              {participants.map((p) => (
                <li key={p.id} className="flex items-center gap-2">
                  {p.id === facilitatorId && <span>👑</span>}
                  <span className="flex-1">{p.nickname}</span>
                  <span>
                    {isRevealed
                      ? votes[p.id] || '-'
                      : p.hasVoted
                      ? '✅'
                      : '⏳'}
                  </span>
                </li>
              ))}
              {participants.length === 0 && (
                <li className="text-gray-500 text-sm">参加者を待っています...</li>
              )}
            </ul>
          </div>

          {/* カード選択 */}
          <div className="md:col-span-2 bg-white rounded-lg shadow p-4">
            <h2 className="font-bold mb-3">🎴 カードを選択</h2>
            <div className="grid grid-cols-5 gap-2">
              {CARDS.map((card) => (
                <button
                  key={card}
                  onClick={() => handleCardSelect(card)}
                  disabled={isRevealed}
                  className={`
                    aspect-[2/3] rounded-lg border-2 text-xl font-bold
                    transition-all hover:scale-105
                    ${
                      selectedCard === card
                        ? 'border-blue-500 bg-blue-50 text-blue-700 scale-105'
                        : 'border-gray-200 hover:border-gray-300'
                    }
                    ${
                      isRevealed
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer'
                    }
                  `}
                >
                  {card}
                </button>
              ))}
            </div>
            {selectedCard && !isRevealed && (
              <div className="mt-4 text-center text-sm text-gray-600">
                選択: <span className="font-bold text-blue-600">{selectedCard}</span>
              </div>
            )}
          </div>
        </div>

        {/* ホスト用コントロール */}
        {isHost && (
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleReveal}
                disabled={isRevealed}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                🔍 カードを公開
              </button>
              <button
                onClick={handleReset}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                🔄 リセット
              </button>
            </div>
          </div>
        )}

        {/* 結果表示 */}
        {isRevealed && Object.keys(votes).length > 0 && (
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h2 className="font-bold mb-3">📊 投票結果</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {participants.map((p) => (
                <div key={p.id} className="border rounded p-2 text-center">
                  <div className="text-sm text-gray-600">{p.nickname}</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {votes[p.id] || '-'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 招待リンク */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">📎 招待リンク:</span>
            <code className="flex-1 bg-gray-100 px-2 py-1 rounded text-sm truncate">
              {typeof window !== 'undefined' ? window.location.href : ''}
            </code>
            <button
              onClick={handleCopyLink}
              className="bg-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-300"
            >
              コピー
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
