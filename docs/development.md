# 開発環境セットアップガイド

## 前提条件

- Node.js 18以上
- Azure Functions Core Tools v4
- Azure Web PubSub Tunnel (`npm install -g @azure/web-pubsub-tunnel-tool`)

## アーキテクチャ

このプロジェクトは以下の3つのコンポーネントで構成されています：

1. **Next.js (localhost:3000)**: フロントエンド
2. **Azure Functions (localhost:7071)**: バックエンドAPI
3. **Azure Web PubSub Tunnel**: ローカル開発用のトンネル接続

## セットアップ手順

### 1. 依存関係のインストール

```bash
# ルートディレクトリ
npm install

# Azure Functions
cd api
npm install
```

### 2. 環境変数の設定

`api/local.settings.json`に以下を設定してください：

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "WEB_PUBSUB_CONNECTION_STRING": "<Azure Web PubSub接続文字列>"
  }
}
```

### 3. 開発サーバーの起動

**ターミナル1: Next.js**
```bash
npm run dev
```

**ターミナル2: Azure Functions**
```bash
cd api
func start
```

**ターミナル3: Azure Web PubSub Tunnel**
```bash
export WebPubSubConnectionString="<接続文字列>"
awps-tunnel run --hub poker --upstream "http://localhost:7071"
```

## 動作確認

1. http://localhost:3000 にアクセス
2. ルームを作成
3. 別のブラウザウィンドウで同じルームに参加
4. 参加者リストに両方のユーザーが表示されることを確認

## トラブルシューティング

### 参加者が表示されない場合

- Azure Functions (`func start`) が起動しているか確認
- awps-tunnel が `Established tunnel connection` と表示されているか確認
- ブラウザのコンソールで WebSocket接続エラーがないか確認

### tunnel接続エラーが出る場合

- `WebPubSubConnectionString` 環境変数が正しく設定されているか確認
- Azure Web PubSubリソースのアクセスキーが有効か確認

## 技術スタック

- **Frontend**: Next.js 16, React 19, Material-UI v7
- **Backend**: Azure Functions v4 (Node.js)
- **Real-time**: Azure Web PubSub
- **Language**: TypeScript
