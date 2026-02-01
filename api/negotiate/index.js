const { WebPubSubServiceClient } = require('@azure/web-pubsub');

module.exports = async function (context, req) {
  const roomId = req.query.roomId;
  const userId = req.query.userId;

  if (!roomId || !userId) {
    context.res = {
      status: 400,
      body: { error: 'roomId and userId are required' },
    };
    return;
  }

  const connectionString = process.env.WEB_PUBSUB_CONNECTION_STRING;
  if (!connectionString) {
    context.res = {
      status: 500,
      body: { error: 'Server configuration error' },
    };
    return;
  }

  try {
    const client = new WebPubSubServiceClient(connectionString, 'poker');

    const token = await client.getClientAccessToken({
      userId,
      groups: [roomId],
      roles: [
        'webpubsub.sendToGroup',
        'webpubsub.joinLeaveGroup',
      ],
    });

    context.res = {
      headers: {
        'Content-Type': 'application/json',
      },
      body: { url: token.url },
    };
  } catch (error) {
    context.log.error('Error generating token:', error);
    context.res = {
      status: 500,
      body: { error: 'Failed to generate connection token' },
    };
  }
};
