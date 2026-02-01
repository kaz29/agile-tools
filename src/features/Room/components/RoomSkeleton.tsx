import { Box, Container, Stack, Paper, Skeleton, AppBar, Toolbar } from '@mui/material';

export function RoomSkeleton() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* ヘッダー */}
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar>
          <Skeleton variant="text" width={300} sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }} />
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" spacing={1}>
            <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />
            <Skeleton variant="rectangular" width={60} height={32} sx={{ borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
          {/* 参加者リスト */}
          <Box sx={{ width: { xs: '100%', md: '33.333%' } }}>
            <Paper sx={{ p: 2 }}>
              <Skeleton variant="text" width={120} height={32} sx={{ mb: 2 }} />
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} variant="rectangular" width={80} height={32} sx={{ borderRadius: 2, mb: 1 }} />
                ))}
              </Stack>
            </Paper>
          </Box>

          {/* カード選択エリア */}
          <Box sx={{ width: { xs: '100%', md: '66.666%' } }}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Skeleton variant="circular" width={24} height={24} />
                <Skeleton variant="text" width={120} height={32} />
              </Box>
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' },
                gap: 1
              }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    sx={{
                      width: '100%',
                      aspectRatio: '2/3',
                      minHeight: 120,
                      borderRadius: 1,
                    }}
                  />
                ))}
              </Box>
            </Paper>
          </Box>
        </Stack>

        {/* ホストコントロール */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction="row" spacing={2}>
            <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
          </Stack>
        </Paper>

        {/* 結果表示 */}
        <Paper sx={{ p: 2 }}>
          <Skeleton variant="text" width={100} height={32} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 1 }} />
        </Paper>
      </Container>
    </Box>
  );
}
