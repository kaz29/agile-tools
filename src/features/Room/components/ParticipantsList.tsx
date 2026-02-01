import { Box, Typography, Chip, Divider } from '@mui/material';
import { Group as GroupIcon, Star as StarIcon } from '@mui/icons-material';
import type { Participant } from '@/types';

interface ParticipantsListProps {
  participants: Participant[];
  votes: Record<string, string>;
  isRevealed: boolean;
  facilitatorId: string;
}

export function ParticipantsList({
  participants,
  votes,
  isRevealed,
  facilitatorId,
}: ParticipantsListProps) {
  const getChipColor = (participant: Participant) => {
    if (isRevealed) {
      return votes[participant.id] ? 'primary' : 'default';
    }
    return participant.hasVoted ? 'success' : 'default';
  };

  const getChipVariant = (participant: Participant): 'filled' | 'outlined' => {
    if (isRevealed) {
      return 'filled';
    }
    return participant.hasVoted ? 'filled' : 'outlined';
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <GroupIcon />
        <Typography variant="h6">
          参加者 ({participants.length})
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {participants.map((p) => (
          <Chip
            key={p.id}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {p.id === facilitatorId && <StarIcon fontSize="small" />}
                <span>{p.nickname}</span>
                {isRevealed && votes[p.id] && (
                  <Box component="span" sx={{ ml: 0.5, fontWeight: 'bold' }}>
                    ({votes[p.id]})
                  </Box>
                )}
              </Box>
            }
            color={getChipColor(p)}
            variant={getChipVariant(p)}
            size="medium"
          />
        ))}
        {participants.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            参加者を待っています...
          </Typography>
        )}
      </Box>
      <Divider />
    </Box>
  );
}
