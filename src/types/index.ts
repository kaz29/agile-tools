// クライアント -> サーバー
export type ClientMessage =
  | { type: 'join'; userId: string; nickname: string }
  | { type: 'leave'; userId: string }
  | { type: 'vote'; userId: string; value: string }
  | { type: 'reveal' }
  | { type: 'reset' }
  | { type: 'setStory'; story: string; storyUrl?: string };

// サーバー -> クライアント
export type ServerMessage =
  | { type: 'roomState'; state: RoomState }
  | { type: 'userJoined'; user: Participant }
  | { type: 'userLeft'; userId: string }
  | { type: 'voted'; userId: string }
  | { type: 'revealed'; votes: Record<string, string> }
  | { type: 'reset' }
  | { type: 'storyUpdated'; story: string; storyUrl?: string };

export interface RoomState {
  roomId: string;
  story: string | null;
  storyUrl: string | null;
  participants: Participant[];
  votes: Record<string, string>; // userId -> カード値（公開後のみ）
  isRevealed: boolean;
  facilitatorId: string;
}

export interface Participant {
  id: string;
  nickname: string;
  hasVoted: boolean;
}

export interface UserInfo {
  userId: string;
  nickname: string;
}

export interface VoteRecord {
  id: string;
  sessionId: string;
  story: string;
  myVote: string;
  finalEstimate: string;
  participants: number;
  votedAt: Date;
}

export interface VotingHistoryItem {
  id: string;
  story: string;
  storyUrl?: string;
  votes: Record<string, string>; // userId -> vote value
  participantNames: Record<string, string>; // userId -> nickname
  estimate?: string;
  votedAt: string; // ISO timestamp
}

export interface RoomHistory {
  roomId: string;
  teamName?: string;
  createdAt: string; // ISO timestamp
  votingHistory: VotingHistoryItem[];
}
