import { Box, Paper, Typography, Card, CardContent } from '@mui/material';
import { BarChart as BarChartIcon } from '@mui/icons-material';
import type { Participant } from '@/types';

interface VotingResultsProps {
  participants: Participant[];
  votes: Record<string, string>;
  isRevealed: boolean;
}

export function VotingResults({ participants, votes, isRevealed }: VotingResultsProps) {
  if (!isRevealed || Object.keys(votes).length === 0) {
    return null;
  }

  return (
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
  );
}
