'use client';

import {
  Container,
  Box,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Paper,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Style as StyleIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useHistoryState } from './hooks';

export function HistoryPage() {
  const router = useRouter();
  const { histories, handleRestore, handleDelete } = useHistoryState();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <StyleIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            プランニングポーカー
          </Typography>
          <Button
            color="inherit"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/')}
          >
            ホームに戻る
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <HistoryIcon fontSize="large" color="primary" />
          <Typography variant="h4" component="h1" fontWeight="bold">
            過去のプランニング
          </Typography>
        </Box>

        {histories.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              まだプランニングの履歴がありません
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push('/')}
              sx={{ mt: 2 }}
            >
              新しいルームを作成
            </Button>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {histories.map((history) => (
              <Card key={history.roomId} elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {history.teamName || 'チーム名なし'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        ルームID: {history.roomId}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        作成日時: {new Date(history.createdAt).toLocaleString('ja-JP')}
                      </Typography>
                    </Box>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(history.roomId)}
                      sx={{ ml: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={`${history.votingHistory.length} 件の投票`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleRestore(history.roomId)}
                  >
                    このルームを復元
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}
