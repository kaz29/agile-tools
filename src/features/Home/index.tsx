'use client';

import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  AppBar,
  Toolbar,
  Paper,
  Alert,
} from '@mui/material';
import { Style as StyleIcon, AddCircle as AddCircleIcon, History as HistoryIcon } from '@mui/icons-material';
import Link from 'next/link';
import { useHomeState } from './hooks';

export function HomePage() {
  const {
    nickname,
    setNickname,
    teamName,
    setTeamName,
    hasHistories,
    handleCreateRoom,
  } = useHomeState();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <StyleIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            プランニングポーカー
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            チームで見積もりをしよう
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            プランニングポーカーでチームの合意形成をサポートします
          </Typography>
        </Box>

        {/* 過去のプランニングへのリンク */}
        {hasHistories && (
          <Alert
            severity="info"
            icon={<HistoryIcon />}
            sx={{ mb: 3 }}
            action={
              <Button
                component={Link}
                href="/history"
                color="inherit"
                size="small"
                variant="outlined"
              >
                一覧を見る
              </Button>
            }
          >
            過去のプランニング履歴があります
          </Alert>
        )}

        {/* 使い方の説明 */}
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary.main">
            使い方
          </Typography>
          <Box component="ol" sx={{ m: 0, pl: 2.5, '& li': { mb: 1 } }}>
            <li>
              <Typography variant="body2">
                <strong>スクラムマスター</strong>がルームを作成
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                招待リンクをチームメンバーに共有
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>メンバー</strong>はリンクから参加してカードを選択
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                全員の投票後、スクラムマスターが結果を公開
              </Typography>
            </li>
          </Box>
        </Paper>

        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, justifyContent: 'center' }}>
            <AddCircleIcon color="primary" fontSize="large" />
            <Typography variant="h5" component="h2" fontWeight="bold">
              新しいルームを作成
            </Typography>
          </Box>
          <Box component="form" onSubmit={handleCreateRoom}>
            <TextField
              fullWidth
              label="チーム名（任意）"
              placeholder="例: 開発チームA"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              slotProps={{ htmlInput: { maxLength: 30 } }}
              sx={{ mb: 2 }}
              autoFocus
              helperText="前回使用したチーム名が自動入力されます"
            />
            <TextField
              fullWidth
              label="あなたのニックネーム"
              placeholder="例: 山田太郎"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              slotProps={{ htmlInput: { maxLength: 20 } }}
              sx={{ mb: 3 }}
              helperText="前回使用したニックネームが自動入力されます"
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              disabled={!nickname.trim()}
              size="large"
              startIcon={<AddCircleIcon />}
            >
              ルームを作成してホストになる
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
