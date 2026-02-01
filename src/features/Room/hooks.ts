import { useCallback, useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useWebPubSub } from '@/hooks/useWebPubSub';
import type { ServerMessage, Participant, VotingHistoryItem, RoomHistory } from '@/types';

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
  const [teamName, setTeamName] = useState<string | undefined>(undefined);
  const [story, setStory] = useState<string | null>(null);
  const [storyUrl, setStoryUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<VotingHistoryItem[]>([]);

  // localStorageから履歴を読み込み（ホストのみ）
  useEffect(() => {
    if (typeof window !== 'undefined' && isHost) {
      const saved = localStorage.getItem(`room:${roomId}:history`);
      if (saved) {
        try {
          const data = JSON.parse(saved);

          // 旧形式（配列）からの移行処理
          if (Array.isArray(data)) {
            const roomHistory: RoomHistory = {
              roomId,
              teamName: teamName,
              createdAt: new Date().toISOString(),
              votingHistory: data,
            };
            localStorage.setItem(`room:${roomId}:history`, JSON.stringify(roomHistory));
            setHistory(data);
          } else if (data.votingHistory) {
            // 新形式（RoomHistory）
            setHistory(data.votingHistory);
          }
        } catch (e) {
          console.error('Failed to parse history:', e);
        }
      }
    }
  }, [roomId, isHost, teamName]);

  // セッションストレージからユーザー情報を取得
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(`room:${roomId}:user`);
      const hostId = sessionStorage.getItem(`room:${roomId}:host`);
      const savedTeamName = sessionStorage.getItem(`room:${roomId}:teamName`);

      if (stored) {
        const info = JSON.parse(stored);
        setUserInfo(info);
        if (hostId === info.userId) {
          setIsHost(true);
          setFacilitatorId(info.userId);
        }
      }

      if (savedTeamName) {
        setTeamName(savedTeamName);
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
        setStory(message.state.story);
        setStoryUrl(message.state.storyUrl);
        break;

      case 'userJoined':
        setParticipants((prev) => {
          // 既に存在する場合は追加しない
          if (prev.find(p => p.id === message.user.id)) {
            return prev;
          }
          // 自分自身の join メッセージの場合もスキップ（roomStateで既に追加されているため）
          if (userInfo && message.user.id === userInfo.userId) {
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

        // ホストの場合、履歴に保存
        if (isHost && userInfo) {
          const participantNames: Record<string, string> = {};
          participants.forEach(p => {
            participantNames[p.id] = p.nickname;
          });

          const historyItem: VotingHistoryItem = {
            id: crypto.randomUUID(),
            story: story || '(ストーリー未設定)',
            storyUrl: storyUrl || undefined,
            votes: message.votes,
            participantNames,
            votedAt: new Date().toISOString(),
          };

          setHistory(prev => {
            const newHistory = [...prev, historyItem];
            // RoomHistory形式でlocalStorageに保存
            if (typeof window !== 'undefined') {
              const saved = localStorage.getItem(`room:${roomId}:history`);
              let roomHistory: RoomHistory;

              if (saved) {
                try {
                  const data = JSON.parse(saved);
                  if (Array.isArray(data)) {
                    // 旧形式からの移行
                    roomHistory = {
                      roomId,
                      teamName,
                      createdAt: new Date().toISOString(),
                      votingHistory: newHistory,
                    };
                  } else {
                    // 新形式の更新
                    roomHistory = { ...data, votingHistory: newHistory, teamName };
                  }
                } catch {
                  roomHistory = {
                    roomId,
                    teamName,
                    createdAt: new Date().toISOString(),
                    votingHistory: newHistory,
                  };
                }
              } else {
                roomHistory = {
                  roomId,
                  teamName,
                  createdAt: new Date().toISOString(),
                  votingHistory: newHistory,
                };
              }

              localStorage.setItem(`room:${roomId}:history`, JSON.stringify(roomHistory));
            }
            return newHistory;
          });
        }
        break;

      case 'reset':
        setIsRevealed(false);
        setVotes({});
        setSelectedCard(null);
        setAllVotedNotified(false);
        setStory(null);
        setStoryUrl(null);
        setParticipants((prev) =>
          prev.map((p) => ({ ...p, hasVoted: false }))
        );
        break;

      case 'storyUpdated':
        setStory(message.story || null);
        setStoryUrl(message.storyUrl || null);
        break;
    }
  }, [enqueueSnackbar, isHost, userInfo, participants, story, storyUrl, roomId]);

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

  // ストーリー設定
  const handleSetStory = useCallback((story: string, storyUrl: string) => {
    if (!isHost) return;
    send({ type: 'setStory', story, storyUrl });
  }, [isHost, send]);

  // ストーリークリア
  const handleClearStory = useCallback(() => {
    if (!isHost) return;
    send({ type: 'setStory', story: '', storyUrl: '' });
  }, [isHost, send]);

  // 見積もり設定
  const handleSetEstimate = useCallback((estimate: string) => {
    if (!isHost || !isRevealed) return;

    // 最新の履歴に見積もりを追加
    setHistory(prev => {
      if (prev.length === 0) return prev;

      const newHistory = [...prev];
      const latest = { ...newHistory[newHistory.length - 1] };
      latest.estimate = estimate;
      newHistory[newHistory.length - 1] = latest;

      // RoomHistory形式でlocalStorageに保存
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(`room:${roomId}:history`);
        let roomHistory: RoomHistory;

        if (saved) {
          try {
            const data = JSON.parse(saved);
            if (Array.isArray(data)) {
              // 旧形式からの移行
              roomHistory = {
                roomId,
                teamName,
                createdAt: new Date().toISOString(),
                votingHistory: newHistory,
              };
            } else {
              // 新形式の更新
              roomHistory = { ...data, votingHistory: newHistory, teamName };
            }
          } catch {
            roomHistory = {
              roomId,
              teamName,
              createdAt: new Date().toISOString(),
              votingHistory: newHistory,
            };
          }
        } else {
          roomHistory = {
            roomId,
            teamName,
            createdAt: new Date().toISOString(),
            votingHistory: newHistory,
          };
        }

        localStorage.setItem(`room:${roomId}:history`, JSON.stringify(roomHistory));
      }

      return newHistory;
    });

    enqueueSnackbar(`見積もりを ${estimate} に設定しました`, {
      variant: 'success',
    });
  }, [isHost, isRevealed, roomId, teamName, enqueueSnackbar]);

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
    teamName,
    story,
    storyUrl,
    history,
    handleCardSelect,
    handleReveal,
    handleReset,
    handleCopyLink,
    handleJoinRoom,
    handleSetStory,
    handleClearStory,
    handleSetEstimate,
  };
}
