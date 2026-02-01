import { useState } from 'react';
import { Box, Paper, Typography, Chip, Divider, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { BarChart as BarChartIcon, Functions as FunctionsIcon, TrendingUp as TrendingUpIcon, Save as SaveIcon } from '@mui/icons-material';
import type { Participant } from '@/types';

interface VotingResultsProps {
  participants: Participant[];
  votes: Record<string, string>;
  isRevealed: boolean;
  isHost?: boolean;
  onSetEstimate?: (estimate: string) => void;
}

export function VotingResults({ participants, votes, isRevealed, isHost, onSetEstimate }: VotingResultsProps) {
  const [estimateDialogOpen, setEstimateDialogOpen] = useState(false);
  const [estimateValue, setEstimateValue] = useState('');

  if (!isRevealed || Object.keys(votes).length === 0) {
    return null;
  }

  const handleSetEstimate = () => {
    if (estimateValue.trim() && onSetEstimate) {
      onSetEstimate(estimateValue.trim());
      setEstimateDialogOpen(false);
      setEstimateValue('');
    }
  };

  // 統計情報の計算
  const voteValues = Object.values(votes).filter(v => v);
  const numericVotes = voteValues
    .filter(v => !isNaN(Number(v)))
    .map(v => Number(v));

  // ポイントごとの集計
  const voteCounts = voteValues.reduce((acc, vote) => {
    acc[vote] = (acc[vote] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedVotes = Object.entries(voteCounts)
    .sort((a, b) => {
      const aNum = Number(a[0]);
      const bNum = Number(b[0]);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      return a[0].localeCompare(b[0]);
    });

  // 平均値の計算
  const average = numericVotes.length > 0
    ? (numericVotes.reduce((sum, v) => sum + v, 0) / numericVotes.length).toFixed(1)
    : null;

  // 最頻値の計算
  const maxCount = Math.max(...Object.values(voteCounts));
  const modes = Object.entries(voteCounts)
    .filter(([_, count]) => count === maxCount)
    .map(([vote]) => vote);

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <BarChartIcon />
        <Typography variant="h6">
          投票結果
        </Typography>
      </Box>

      {/* 統計サマリー */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <FunctionsIcon color="action" />
          <Typography variant="body1" fontWeight="medium" color="text.secondary">
            集計:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {sortedVotes.map(([vote, count]) => (
              <Chip
                key={vote}
                label={`${vote}: ${count}人`}
                size="medium"
                color={count === maxCount ? 'primary' : 'default'}
                variant={count === maxCount ? 'filled' : 'outlined'}
                sx={{
                  fontSize: '0.95rem',
                  fontWeight: count === maxCount ? 'bold' : 'normal',
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 4, mb: 3, flexWrap: 'wrap' }}>
        {average && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <TrendingUpIcon color="action" />
            <Typography variant="body1" fontWeight="medium" color="text.secondary">
              平均:
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="primary.main">
              {average}
            </Typography>
          </Box>
        )}
        {modes.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <BarChartIcon color="action" />
            <Typography variant="body1" fontWeight="medium" color="text.secondary">
              最多:
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="primary.main">
              {modes.join(', ')} ({maxCount}人)
            </Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* 個別の投票結果 */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {participants.map((p) => {
          const vote = votes[p.id];
          return (
            <Chip
              key={p.id}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="body2">{p.nickname}:</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {vote || '-'}
                  </Typography>
                </Box>
              }
              color={vote ? 'primary' : 'default'}
              variant="filled"
              size="medium"
            />
          );
        })}
      </Box>

      {/* ホスト用：見積もり設定ボタン */}
      {isHost && onSetEstimate && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<SaveIcon />}
            onClick={() => setEstimateDialogOpen(true)}
            size="large"
          >
            見積もりを確定
          </Button>
        </Box>
      )}

      {/* 見積もり入力ダイアログ */}
      <Dialog open={estimateDialogOpen} onClose={() => setEstimateDialogOpen(false)}>
        <DialogTitle>見積もりを確定</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="見積もり"
            fullWidth
            value={estimateValue}
            onChange={(e) => setEstimateValue(e.target.value)}
            placeholder={average || modes[0] || ''}
            helperText="平均値や最頻値を参考に見積もりを入力してください"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEstimateDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleSetEstimate} variant="contained" disabled={!estimateValue}>
            確定
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
