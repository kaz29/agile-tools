'use client';

import { Box, Container, Paper } from '@mui/material';
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
    allVotedNotified,
    teamName,
    handleCardSelect,
    handleReveal,
    handleReset,
    handleCopyLink,
    handleJoinRoom,
  } = useRoomState(roomId);

  const allVoted = participants.length > 0 && participants.every((p) => p.hasVoted);

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
        teamName={teamName}
        isConnected={isConnected}
        isHost={isHost}
        onCopyLink={handleCopyLink}
      />
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Paper sx={{ mb: 2 }}>
          {/* 参加者リスト */}
          <ParticipantsList
            participants={participants}
            votes={votes}
            isRevealed={isRevealed}
            facilitatorId={facilitatorId}
          />

          {/* カード選択 */}
          <CardSelection
            selectedCard={selectedCard}
            isRevealed={isRevealed}
            onCardSelect={handleCardSelect}
          />
        </Paper>

        {/* 結果表示 */}
        <VotingResults
          participants={participants}
          votes={votes}
          isRevealed={isRevealed}
        />

        {/* ホスト用コントロール */}
        {isHost && (
          <HostControls
            isRevealed={isRevealed}
            allVoted={allVoted}
            onReveal={handleReveal}
            onReset={handleReset}
          />
        )}
      </Container>
    </Box>
  );
}
