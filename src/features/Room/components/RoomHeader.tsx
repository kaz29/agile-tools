import { AppBar, Toolbar, Typography, Chip, Box, IconButton, Tooltip } from '@mui/material';
import {
  ContentCopy as ContentCopyIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';

interface RoomHeaderProps {
  roomId: string;
  teamName?: string;
  isConnected: boolean;
  isHost: boolean;
  onCopyLink: () => void;
}

export function RoomHeader({ roomId, teamName, isConnected, isHost, onCopyLink }: RoomHeaderProps) {
  const inviteUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <AppBar position="static" color="primary" elevation={2}>
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="h1" sx={{ color: 'white' }}>
            プランニングポーカー
            {teamName && (
              <>
                {' - '}
                <Typography component="span" variant="h6" sx={{ fontWeight: 'bold' }}>
                  {teamName}
                </Typography>
              </>
            )}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Room ID: {roomId}
          </Typography>
        </Box>
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
          <Tooltip title={isConnected ? '接続済み' : '接続中...'} arrow>
            <Chip
              icon={isConnected ? <CheckCircleIcon /> : <SyncIcon />}
              color={isConnected ? 'success' : 'warning'}
              size="small"
              sx={{
                bgcolor: isConnected ? 'success.light' : 'warning.light',
                color: 'white',
                fontWeight: 'bold',
                '& .MuiChip-icon': {
                  color: 'white',
                  marginLeft: 0,
                  marginRight: 0,
                  animation: !isConnected ? 'spin 2s linear infinite' : 'none',
                },
                '& .MuiChip-label': {
                  display: 'none',
                },
                paddingLeft: '12px',
                paddingRight: '12px',
                '@keyframes spin': {
                  '0%': {
                    transform: 'rotate(0deg)',
                  },
                  '100%': {
                    transform: 'rotate(360deg)',
                  },
                },
              }}
            />
          </Tooltip>
          <Tooltip title={isHost ? 'ホスト' : '参加者'} arrow>
            <Chip
              icon={isHost ? <AdminPanelSettingsIcon /> : <PersonIcon />}
              size="small"
              sx={{
                bgcolor: isHost ? 'secondary.light' : 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 'bold',
                '& .MuiChip-icon': {
                  color: 'white',
                  marginLeft: 0,
                  marginRight: 0,
                },
                '& .MuiChip-label': {
                  display: 'none',
                },
                paddingLeft: '12px',
                paddingRight: '12px',
              }}
            />
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
