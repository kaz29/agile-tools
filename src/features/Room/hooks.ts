import { useCallback, useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useWebPubSub } from '@/hooks/useWebPubSub';
import type { ServerMessage, Participant } from '@/types';

interface UserInfo {
  userId: string;
  nickname: string;
}

export function useRoomState(roomId: string) {
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [isRevealed, setIsRevealed] = useState(false);
  const [facilitatorId, setFacilitatorId] = useState<string>('');
  const [allVotedNotified, setAllVotedNotified] = useState(false);

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
      setIsLoading(false);
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
        setAllVotedNotified(false);
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

  // 全員投票完了の検出と通知
  useEffect(() => {
    if (isRevealed || participants.length === 0 || allVotedNotified) return;

    const allVoted = participants.every((p) => p.hasVoted);
    if (allVoted && participants.length > 0) {
      enqueueSnackbar('全員がカードを選択しました！', {
        variant: 'success',
        autoHideDuration: 3000,
      });
      setAllVotedNotified(true);
    }
  }, [participants, isRevealed, allVotedNotified, enqueueSnackbar]);

  // カード選択
  const handleCardSelect = useCallback((card: string) => {
    if (isRevealed || !userInfo) return;
    setSelectedCard(card);
    send({ type: 'vote', userId: userInfo.userId, value: card });
  }, [isRevealed, userInfo, send]);

  // カード公開
  const handleReveal = useCallback(() => {
    if (!isHost) return;
    send({ type: 'reveal' });
  }, [isHost, send]);

  // リセット
  const handleReset = useCallback(() => {
    if (!isHost) return;
    send({ type: 'reset' });
  }, [isHost, send]);

  // 招待リンクコピー
  const handleCopyLink = useCallback(() => {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      enqueueSnackbar('招待リンクをコピーしました', { variant: 'success' });
    }
  }, [enqueueSnackbar]);

  // ルーム参加
  const handleJoinRoom = useCallback((nickname: string) => {
    if (typeof window !== 'undefined') {
      const userId = crypto.randomUUID();
      const info = { userId, nickname };
      sessionStorage.setItem(`room:${roomId}:user`, JSON.stringify(info));
      setUserInfo(info);
    }
  }, [roomId]);

  return {
    isLoading,
    userInfo,
    setUserInfo,
    isHost,
    isConnected,
    selectedCard,
    participants,
    votes,
    isRevealed,
    facilitatorId,
    allVotedNotified,
    handleCardSelect,
    handleReveal,
    handleReset,
    handleCopyLink,
    handleJoinRoom,
  };
}
