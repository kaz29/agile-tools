# Agile Tools

## プロジェクト概要

Agile(Scrum)イベントで活用できるツール群を提供します。

## 開発環境のセットアップ

開発には3つのプロセスを起動する必要があります：

```bash
# 1. Next.js開発サーバー
npm run dev

# 2. Azure Functions（別ターミナル）
cd api && func start

# 3. Azure Web PubSub tunnel（別ターミナル）
export WebPubSubConnectionString="<接続文字列>"
awps-tunnel run --hub poker --upstream "http://localhost:7071"
```

詳細は[開発環境ドキュメント](./docs/development.md)を参照してください。

