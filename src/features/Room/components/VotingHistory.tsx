'use client';

import { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Link as MuiLink,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  History as HistoryIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import type { VotingHistoryItem } from '@/types';

interface VotingHistoryProps {
  history: VotingHistoryItem[];
}

export function VotingHistory({ history }: VotingHistoryProps) {
  const [expanded, setExpanded] = useState<string | false>(false);

  if (history.length === 0) {
    return null;
  }

  const handleChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateAverage = (votes: Record<string, string>) => {
    const numericVotes = Object.values(votes)
      .map((v) => parseFloat(v))
      .filter((v) => !isNaN(v));

    if (numericVotes.length === 0) return null;
    const avg = numericVotes.reduce((sum, v) => sum + v, 0) / numericVotes.length;
    return avg.toFixed(1);
  };

  return (
    <Paper sx={{ mb: 2, p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <HistoryIcon color="primary" />
        <Typography variant="h6">投票履歴</Typography>
        <Chip label={`${history.length}件`} size="small" color="primary" />
      </Box>

      {[...history].reverse().map((item, index) => {
        const average = calculateAverage(item.votes);
        const actualIndex = history.length - 1 - index;

        return (
          <Accordion
            key={item.id}
            expanded={expanded === item.id}
            onChange={handleChange(item.id)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <Typography sx={{ fontWeight: 'medium' }}>
                  #{actualIndex + 1}
                </Typography>
                <Typography sx={{ flex: 1 }}>
                  {item.story}
                </Typography>
                {item.estimate && (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label={`見積: ${item.estimate}`}
                    color="success"
                    size="small"
                  />
                )}
                <Typography variant="caption" color="text.secondary">
                  {formatDate(item.votedAt)}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {item.storyUrl && (
                <Box sx={{ mb: 2 }}>
                  <MuiLink
                    href={item.storyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                  >
                    <OpenInNewIcon fontSize="small" />
                    ストーリーを開く
                  </MuiLink>
                </Box>
              )}

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(2, 1fr)',
                    sm: 'repeat(3, 1fr)',
                    md: 'repeat(4, 1fr)',
                  },
                  gap: 2,
                }}
              >
                {Object.entries(item.votes).map(([userId, vote]) => (
                  <Box
                    key={userId}
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: 'grey.100',
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {item.participantNames[userId] || 'Unknown'}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {vote}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                {average && (
                  <Typography variant="body2" color="text.secondary">
                    平均: <strong>{average}</strong>
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  参加者数: <strong>{Object.keys(item.votes).length}</strong>
                </Typography>
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Paper>
  );
}
