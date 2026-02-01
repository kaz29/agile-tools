# ADR-001: Web PubSub接続状態の管理方式

## ステータス

採用

## 日付

2025-02-01

## コンテキスト

プランニングポーカーでは、ルームに参加している参加者の一覧をリアルタイムで表示する必要がある。Azure Web PubSubを使用してリアルタイム通信を実現するが、「現在接続中のユーザー一覧」をどのように管理するかを決定する必要がある。

### 調査結果

Azure Web PubSubのAPI/SDKで接続一覧を取得できるか調査した。

| SDK/API | 一覧取得機能 | 備考 |
|---------|-------------|------|
| .NET SDK | ✅ `ListConnectionsInGroup` | `ConnectionId`と`UserId`を取得可能 |
| JavaScript SDK | ❌ なし | 2025年2月時点で未実装 |
| REST API | ❌ なし | `ConnectionExists`、`UserExists`、`GroupExists`のみ |

JavaScript SDKおよびREST APIでは、グループ内の接続一覧を取得する機能が提供されていない。

### 検討した選択肢

#### 選択肢A: クライアントサイドで参加者リストを管理

各クライアントが `join` / `leave` メッセージを受信し、自身のローカル状態として参加者リストを保持する。

**メリット:**
- サーバーサイドの状態管理が不要
- Azure Functionsのステートレス性と相性が良い
- 追加コストなし
- 実装がシンプル

**デメリット:**
- 参加者リストの整合性はクライアント間で保証されない（ネットワーク遅延等）
- 途中参加時に既存参加者リストの同期が必要

#### 選択肢B: Azure Redis Cacheで参加者リストを管理

サーバーサイドでRedisに参加者リストを永続化し、APIで取得可能にする。

**メリット:**
- サーバーサイドで一元管理
- 参加者リストの整合性が高い
- 途中参加時も正確なリストを取得可能

**デメリット:**
- Azure Redis CacheにはFree tierがない（最低約5,000円/月）
- インフラが複雑化
- コールドスタート時のRedis接続オーバーヘッド

#### 選択肢C: Azure Table Storageで参加者リストを管理

サーバーサイドでTable Storageに参加者リストを永続化する。

**メリット:**
- 非常に安価（ほぼ無料）
- 永続化が確実

**デメリット:**
- レイテンシが高い（リアルタイム性に欠ける）
- 切断検知が遅れる可能性
- TTL管理が複雑

#### 選択肢D: .NET SDKを使用したAzure Functions

Azure FunctionsをC#で実装し、.NET SDKの`ListConnectionsInGroup`を活用する。

**メリット:**
- Web PubSubネイティブの機能を活用
- 参加者リストの取得が確実

**デメリット:**
- フロントエンド（Next.js）とバックエンド（C#）で言語が分かれる
- 開発・保守の複雑性が増す

## 決定

**選択肢A: クライアントサイドで参加者リストを管理** を採用する。

## 理由

1. **コスト最優先**: 個人開発プロジェクトであり、月額0円での運用を目指している
2. **シンプルさ**: JavaScript/TypeScriptで統一することで開発効率を維持
3. **十分な精度**: プランニングポーカーの用途では、数秒程度の同期ズレは許容範囲
4. **スケーラビリティ**: 将来的にRedis等を追加する拡張パスは残る

## 実装方針

### 1. メッセージフロー

```
[参加者A] --join--> [Web PubSub] --broadcast--> [全クライアント]
                                                      |
                                                      v
                                            各自のローカル状態を更新
```

### 2. 途中参加時の同期

新規参加者には、ホスト（または最初に接続したクライアント）から現在のルーム状態を送信する。

```typescript
// 新規参加者がjoinした時
if (message.type === 'userJoined') {
  // ホストの場合、現在のルーム状態を新規参加者に送信
  if (isHost) {
    send({
      type: 'roomState',
      state: currentRoomState,
      targetUserId: message.user.id,
    });
  }
}
```

### 3. 切断検知

Web PubSubの `disconnected` システムイベントをイベントハンドラーで受信し、全クライアントにブロードキャストする。

```typescript
// api/pubsub/events/index.ts
if (eventType === 'azure.webpubsub.sys.disconnected') {
  const userId = req.headers['ce-userid'];
  // 全クライアントに退出を通知
  await client.sendToAll({
    type: 'userLeft',
    userId,
  });
}
```

### 4. データ構造

```typescript
// クライアントサイドの状態
interface RoomState {
  roomId: string;
  participants: Map<string, Participant>;  // userId -> Participant
  votes: Map<string, string>;              // oderId -> vote value
  story: string | null;
  isRevealed: boolean;
  facilitatorId: string;
}

interface Participant {
  id: string;
  nickname: string;
  hasVoted: boolean;
  joinedAt: number;  // タイムスタンプ（同期時の順序保証用）
}
```

## 影響

### ポジティブ
- インフラコストが0円に維持される
- 実装がシンプルで開発速度が上がる
- デバッグが容易（クライアントのみで完結）

### ネガティブ
- ネットワーク遅延により、一時的に参加者リストが不整合になる可能性
- 複数タブで同じユーザーが参加した場合の挙動に注意が必要

### 将来の拡張
- 参加者数が増えた場合やより厳密な整合性が必要になった場合は、Azure Redis Cacheの導入を検討
- .NET SDKの`ListConnectionsInGroup`相当の機能がJavaScript SDKに追加されれば、そちらに移行

## 参考リンク

- [Azure Web PubSub .NET SDK - ListConnectionsInGroup](https://learn.microsoft.com/en-us/dotnet/api/overview/azure/messaging.webpubsub-readme)
- [Azure Web PubSub REST API](https://learn.microsoft.com/en-us/rest/api/webpubsub/dataplane/web-pub-sub)
- [GitHub Issue: List users in a group](https://github.com/Azure/azure-webpubsub/issues/325)
