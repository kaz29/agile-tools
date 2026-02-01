'use client';

import { Box, Container, Stack } from '@mui/material';
import { useRoomState } from './hooks';
import { RoomHeader } from './components/RoomHeader';
import { ParticipantsList } from './components/ParticipantsList';
import { CardSelection } from './components/CardSelection';
import { HostControls } from './components/HostControls';
import { VotingResults } from './components/VotingResults';
import { JoinRoomForm } from './components/JoinRoomForm';
import { RoomSkeleton } from './components/RoomSkeleton';

interface RoomPageProps {
  roomId: string;
}

export function RoomPage({ roomId }: RoomPageProps) {
  const {
    isLoading,
    userInfo,
    isHost,
    isConnected,
    selectedCard,
    participants,
    votes,
    isRevealed,
    facilitatorId,
    handleCardSelect,
    handleReveal,
    handleReset,
    handleCopyLink,
    handleJoinRoom,
  } = useRoomState(roomId);

  if (isLoading) {
    return <RoomSkeleton />;
  }

  if (!userInfo) {
    return <JoinRoomForm roomId={roomId} onJoin={handleJoinRoom} />;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <RoomHeader
        roomId={roomId}
        isConnected={isConnected}
        isHost={isHost}
        onCopyLink={handleCopyLink}
      />
      <Container maxWidth="lg" sx={{ py: 2 }}>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
          {/* 参加者リスト */}
          <Box sx={{ width: { xs: '100%', md: '33.333%' } }}>
            <ParticipantsList
              participants={participants}
              votes={votes}
              isRevealed={isRevealed}
              facilitatorId={facilitatorId}
            />
          </Box>

          {/* カード選択 */}
          <Box sx={{ width: { xs: '100%', md: '66.666%' } }}>
            <CardSelection
              selectedCard={selectedCard}
              isRevealed={isRevealed}
              onCardSelect={handleCardSelect}
            />
          </Box>
        </Stack>

        {/* ホスト用コントロール */}
        {isHost && (
          <HostControls
            isRevealed={isRevealed}
            onReveal={handleReveal}
            onReset={handleReset}
          />
        )}

        {/* 結果表示 */}
        <VotingResults
          participants={participants}
          votes={votes}
          isRevealed={isRevealed}
        />
      </Container>
    </Box>
  );
}
