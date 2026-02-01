import { Box, Paper, Typography, Button } from '@mui/material';
import { Link as LinkIcon } from '@mui/icons-material';

interface InvitationLinkProps {
  onCopyLink: () => void;
}

export function InvitationLink({ onCopyLink }: InvitationLinkProps) {
  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <LinkIcon fontSize="small" color="action" />
        <Typography variant="body2" color="text.secondary">
          招待リンク:
        </Typography>
        <Box
          component="code"
          sx={{
            flex: 1,
            bgcolor: 'grey.100',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: 'small',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {typeof window !== 'undefined' ? window.location.href : ''}
        </Box>
        <Button variant="outlined" size="small" onClick={onCopyLink}>
          コピー
        </Button>
      </Box>
    </Paper>
  );
}
