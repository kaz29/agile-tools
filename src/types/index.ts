// クライアント -> サーバー
export type ClientMessage =
  | { type: 'join'; userId: string; nickname: string }
  | { type: 'leave'; userId: string }
  | { type: 'vote'; userId: string; value: string }
  | { type: 'reveal' }
  | { type: 'reset' }
  | { type: 'setStory'; story: string }
  | { type: 'setEstimate'; estimate: string };

// サーバー -> クライアント
export type ServerMessage =
  | { type: 'roomState'; state: RoomState }
  | { type: 'userJoined'; user: Participant }
  | { type: 'userLeft'; userId: string }
  | { type: 'voted'; userId: string }
  | { type: 'revealed'; votes: Record<string, string> }
  | { type: 'reset' }
  | { type: 'storyUpdated'; story: string }
  | { type: 'estimateSet'; estimate: string };

export interface RoomState {
  roomId: string;
  story: string | null;
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
