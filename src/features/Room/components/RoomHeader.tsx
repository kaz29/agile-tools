import { AppBar, Toolbar, Typography, Chip, Box, IconButton, Tooltip } from '@mui/material';
import { ContentCopy as ContentCopyIcon } from '@mui/icons-material';

interface RoomHeaderProps {
  roomId: string;
  isConnected: boolean;
  isHost: boolean;
  onCopyLink: () => void;
}

export function RoomHeader({ roomId, isConnected, isHost, onCopyLink }: RoomHeaderProps) {
  const inviteUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <AppBar position="static" color="primary" elevation={2}>
      <Toolbar>
        <Typography variant="h6" component="h1" sx={{ flexGrow: 1, color: 'white' }}>
          プランニングポーカー - {roomId}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Tooltip title={inviteUrl || '招待リンクをコピー'} arrow>
            <IconButton
              onClick={onCopyLink}
              sx={{
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
              size="small"
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Chip
            label={isConnected ? '接続済み' : '接続中...'}
            color={isConnected ? 'success' : 'warning'}
            size="small"
            sx={{
              bgcolor: isConnected ? 'success.light' : 'warning.light',
              color: 'white',
              fontWeight: 'bold',
            }}
          />
          {isHost && (
            <Chip
              label="ホスト"
              size="small"
              sx={{
                bgcolor: 'secondary.main',
                color: 'white',
                fontWeight: 'bold',
              }}
            />
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
