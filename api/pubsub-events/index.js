const { WebPubSubServiceClient } = require('@azure/web-pubsub');

// インメモリでルーム状態を管理（MVPとして簡易実装）
const rooms = new Map();

function getRoomState(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      participants: new Map(), // userId -> { nickname, hasVoted }
      votes: new Map(), // userId -> vote value
      isRevealed: false,
      facilitatorId: null,
    });
  }
  return rooms.get(roomId);
}

module.exports = async function (context, req) {
  const connectionString = process.env.WEB_PUBSUB_CONNECTION_STRING;
  if (!connectionString) {
    context.res = { status: 500, body: { error: 'Configuration error' } };
    return;
  }

  const client = new WebPubSubServiceClient(connectionString, 'poker');
  const eventType = req.headers['ce-type'];
  const userId = req.headers['ce-userid'];
  const connectionId = req.headers['ce-connectionid'];

  context.log(`Event: ${eventType}, User: ${userId}`);

  // システムイベント
  if (eventType === 'azure.webpubsub.sys.connected') {
    context.log(`User ${userId} connected`);
    context.res = { status: 200 };
    return;
  }

  if (eventType === 'azure.webpubsub.sys.disconnected') {
    context.log(`User ${userId} disconnected`);
    // TODO: ルームから削除してブロードキャスト
    context.res = { status: 200 };
    return;
  }

  // ユーザーイベント
  if (eventType === 'azure.webpubsub.user.poker-event') {
    try {
      const message = req.body;
      const roomId = message.group || message.roomId;

      context.log('Received message:', message);

      if (!roomId) {
        context.res = { status: 400, body: { error: 'roomId required' } };
        return;
      }

      const roomState = getRoomState(roomId);

      // メッセージタイプに応じた処理
      switch (message.type) {
        case 'join':
          roomState.participants.set(userId, {
            nickname: message.nickname,
            hasVoted: false,
          });

          if (!roomState.facilitatorId) {
            roomState.facilitatorId = userId;
          }

          // 参加したユーザーに現在のルーム状態を送信
          await client.sendToConnection(connectionId, {
            type: 'roomState',
            state: {
              participants: Array.from(roomState.participants.entries()).map(
                ([id, p]) => ({
                  id,
                  nickname: p.nickname,
                  hasVoted: p.hasVoted,
                })
              ),
              votes: roomState.isRevealed
                ? Object.fromEntries(roomState.votes)
                : {},
              isRevealed: roomState.isRevealed,
              facilitatorId: roomState.facilitatorId,
            },
          });

          // 全員に参加通知
          await client.group(roomId).sendToAll({
            type: 'userJoined',
            user: {
              id: userId,
              nickname: message.nickname,
              hasVoted: false,
            },
          });
          break;

        case 'vote':
          if (roomState.participants.has(userId)) {
            roomState.votes.set(userId, message.value);
            const participant = roomState.participants.get(userId);
            participant.hasVoted = true;

            // 投票済み通知（値は非公開）
            await client.group(roomId).sendToAll({
              type: 'voted',
              userId,
            });
          }
          break;

        case 'reveal':
          if (userId === roomState.facilitatorId) {
            roomState.isRevealed = true;
            const votes = Object.fromEntries(roomState.votes);

            await client.group(roomId).sendToAll({
              type: 'revealed',
              votes,
            });
          }
          break;

        case 'reset':
          if (userId === roomState.facilitatorId) {
            roomState.votes.clear();
            roomState.isRevealed = false;
            for (const participant of roomState.participants.values()) {
              participant.hasVoted = false;
            }

            await client.group(roomId).sendToAll({
              type: 'reset',
            });
          }
          break;

        default:
          context.log('Unknown message type:', message.type);
      }

      context.res = { status: 200 };
    } catch (error) {
      context.log.error('Error processing message:', error);
      context.res = { status: 500, body: { error: error.message } };
    }
    return;
  }

  context.res = { status: 200 };
};
