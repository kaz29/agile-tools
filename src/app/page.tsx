'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
} from '@mui/material';

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
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #e3f2fd, #ffffff)',
        py: 8,
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h3" component="h1" align="center" gutterBottom sx={{ mb: 6, fontWeight: 'bold' }}>
          プランニングポーカー
        </Typography>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
          {/* ルーム作成 */}
          <Box sx={{ flex: 1 }}>
            <Card elevation={3}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" component="h2" gutterBottom sx={{ mb: 2 }}>
                  ルームを作成
                </Typography>
                <Box component="form" onSubmit={handleCreateRoom}>
                  <TextField
                    fullWidth
                    label="ニックネーム"
                    placeholder="例: 山田"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    inputProps={{ maxLength: 20 }}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={!nickname.trim()}
                    sx={{ py: 1.5 }}
                  >
                    作成する
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* ルーム参加 */}
          <Box sx={{ flex: 1 }}>
            <Card elevation={3}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" component="h2" gutterBottom sx={{ mb: 2 }}>
                  ルームに参加
                </Typography>
                <Box component="form" onSubmit={handleJoinRoom}>
                  <TextField
                    fullWidth
                    label="ルームID"
                    placeholder="例: abc123"
                    value={roomIdInput}
                    onChange={(e) => setRoomIdInput(e.target.value)}
                    inputProps={{ maxLength: 10 }}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="ニックネーム"
                    placeholder="例: 鈴木"
                    value={joinNickname}
                    onChange={(e) => setJoinNickname(e.target.value)}
                    inputProps={{ maxLength: 20 }}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    color="success"
                    disabled={!roomIdInput.trim() || !joinNickname.trim()}
                    sx={{ py: 1.5 }}
                  >
                    参加する
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
