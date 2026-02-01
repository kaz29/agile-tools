'use client';

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
import { useHomeState } from './hooks';

export function HomePage() {
  const {
    nickname,
    setNickname,
    roomIdInput,
    setRoomIdInput,
    joinNickname,
    setJoinNickname,
    handleCreateRoom,
    handleJoinRoom,
  } = useHomeState();

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
                    slotProps={{ htmlInput: { maxLength: 20 } }}
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
                    slotProps={{ htmlInput: { maxLength: 10 } }}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="ニックネーム"
                    placeholder="例: 鈴木"
                    value={joinNickname}
                    onChange={(e) => setJoinNickname(e.target.value)}
                    slotProps={{ htmlInput: { maxLength: 20 } }}
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
