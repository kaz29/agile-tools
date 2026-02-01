import { Box, Paper, Button } from '@mui/material';
import { Visibility as VisibilityIcon, Refresh as RefreshIcon } from '@mui/icons-material';

interface HostControlsProps {
  isRevealed: boolean;
  onReveal: () => void;
  onReset: () => void;
}

export function HostControls({ isRevealed, onReveal, onReset }: HostControlsProps) {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          onClick={onReveal}
          disabled={isRevealed}
          startIcon={<VisibilityIcon />}
        >
          カードを公開
        </Button>
        <Button
          variant="contained"
          color="inherit"
          onClick={onReset}
          startIcon={<RefreshIcon />}
        >
          リセット
        </Button>
      </Box>
    </Paper>
  );
}
