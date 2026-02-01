import { Box, Paper, Typography, TextField, Button } from '@mui/material';

interface JoinRoomFormProps {
  roomId: string;
  onJoin: (nickname: string) => void;
}

export function JoinRoomForm({ roomId, onJoin }: JoinRoomFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nickname = formData.get('nickname') as string;
    if (nickname.trim()) {
      onJoin(nickname.trim());
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'grey.50',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Paper sx={{ p: 3, maxWidth: 'md', width: '100%' }}>
        <Typography variant="h5" component="h2" gutterBottom>
          ルームに参加
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          ニックネームを入力してください
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            name="nickname"
            label="ニックネーム"
            placeholder="ニックネーム"
            slotProps={{ htmlInput: { maxLength: 20 } }}
            required
            sx={{ mb: 2 }}
          />
          <Button fullWidth type="submit" variant="contained" size="large">
            参加する
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
