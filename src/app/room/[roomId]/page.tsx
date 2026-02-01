'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { useWebPubSub } from '@/hooks/useWebPubSub';
import type { RoomState, ServerMessage, Participant } from '@/types';
import {
  Container,
  Box,
  Typography,
  Paper,
  Card,
  CardActionArea,
  CardContent,
  TextField,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Alert,
  Stack,
} from '@mui/material';
import {
  Group as GroupIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Style as StyleIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  BarChart as BarChartIcon,
  Link as LinkIcon,
} from '@mui/icons-material';

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
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'grey.50',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Paper sx={{ p: 3, maxWidth: 'md', width: '100%' }}>
          <Typography variant="h5" component="h2" gutterBottom>
            ルームに参加
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            ニックネームを入力してください
          </Typography>
          <Box
            component="form"
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
            <TextField
              fullWidth
              name="nickname"
              label="ニックネーム"
              placeholder="ニックネーム"
              inputProps={{ maxLength: 20 }}
              required
              sx={{ mb: 2 }}
            />
            <Button fullWidth type="submit" variant="contained" size="large">
              参加する
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', p: 2 }}>
      <Container maxWidth="lg">
        {/* ヘッダー */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="h6" component="h1">
              ルーム: {roomId}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label={isConnected ? '接続済み' : '接続中...'}
                color={isConnected ? 'success' : 'warning'}
                size="small"
              />
              {isHost && (
                <Chip label="ホスト" color="primary" size="small" />
              )}
            </Box>
          </Box>
        </Paper>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
          {/* 参加者リスト */}
          <Box sx={{ width: { xs: '100%', md: '33.333%' } }}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <GroupIcon />
                <Typography variant="h6">
                  参加者 ({participants.length})
                </Typography>
              </Box>
              <List dense>
                {participants.map((p) => (
                  <ListItem key={p.id}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {p.id === facilitatorId && <StarIcon fontSize="small" sx={{ color: 'warning.main' }} />}
                          <span>{p.nickname}</span>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {isRevealed ? (
                            votes[p.id] || '-'
                          ) : p.hasVoted ? (
                            <>
                              <CheckCircleIcon fontSize="small" sx={{ color: 'success.main' }} />
                              <span>投票済み</span>
                            </>
                          ) : (
                            <>
                              <HourglassEmptyIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                              <span>投票待ち</span>
                            </>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
                {participants.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="参加者を待っています..."
                      primaryTypographyProps={{ color: 'text.secondary', fontSize: 'small' }}
                    />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Box>

          {/* カード選択 */}
          <Box sx={{ width: { xs: '100%', md: '66.666%' } }}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <StyleIcon />
                <Typography variant="h6">
                  カードを選択
                </Typography>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' }, gap: 1 }}>
                {CARDS.map((card) => (
                  <Box key={card}>
                    <Card
                      elevation={selectedCard === card ? 8 : 1}
                      sx={{
                        aspectRatio: '2/3',
                        border: selectedCard === card ? 2 : 1,
                        borderColor: selectedCard === card ? 'primary.main' : 'grey.300',
                        bgcolor: selectedCard === card ? 'primary.50' : 'white',
                        opacity: isRevealed ? 0.5 : 1,
                        transition: 'all 0.2s',
                        '&:hover': !isRevealed ? {
                          transform: 'scale(1.05)',
                          borderColor: 'grey.400',
                        } : {},
                      }}
                    >
                      <CardActionArea
                        onClick={() => handleCardSelect(card)}
                        disabled={isRevealed}
                        sx={{
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography
                          variant="h4"
                          component="div"
                          sx={{
                            fontWeight: 'bold',
                            color: selectedCard === card ? 'primary.main' : 'text.primary',
                          }}
                        >
                          {card}
                        </Typography>
                      </CardActionArea>
                    </Card>
                  </Box>
                ))}
              </Box>
              {selectedCard && !isRevealed && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  選択: <strong>{selectedCard}</strong>
                </Alert>
              )}
            </Paper>
          </Box>
        </Stack>

        {/* ホスト用コントロール */}
        {isHost && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                onClick={handleReveal}
                disabled={isRevealed}
                startIcon={<VisibilityIcon />}
              >
                カードを公開
              </Button>
              <Button
                variant="contained"
                color="inherit"
                onClick={handleReset}
                startIcon={<RefreshIcon />}
              >
                リセット
              </Button>
            </Box>
          </Paper>
        )}

        {/* 結果表示 */}
        {isRevealed && Object.keys(votes).length > 0 && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <BarChartIcon />
              <Typography variant="h6">
                投票結果
              </Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
              {participants.map((p) => (
                <Box key={p.id}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        {p.nickname}
                      </Typography>
                      <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                        {votes[p.id] || '-'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </Paper>
        )}

        {/* 招待リンク */}
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <LinkIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              招待リンク:
            </Typography>
            <Box
              component="code"
              sx={{
                flex: 1,
                bgcolor: 'grey.100',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontSize: 'small',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {typeof window !== 'undefined' ? window.location.href : ''}
            </Box>
            <Button variant="outlined" size="small" onClick={handleCopyLink}>
              コピー
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
