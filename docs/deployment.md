# デプロイガイド

## 概要

このドキュメントでは、Planning PokerアプリケーションをAzure Static Web Appsに手動でデプロイする方法を説明します。

## 前提条件

- Azure CLI がインストールされていること
- Azure Static Web Apps CLI (`@azure/static-web-apps-cli`) がインストールされていること
- Node.js 20以上がインストールされていること
- Azureサブスクリプションへのアクセス権限

## 環境変数の設定

デプロイ前に、以下の環境変数を設定してください。

```bash
# Azure リソース設定
export RESOURCE_GROUP="<your-resource-group>"
export STATIC_WEB_APP_NAME="<your-static-web-app-name>"
export WEB_PUBSUB_NAME="<your-web-pubsub-name>"
export WEB_PUBSUB_HUB_NAME="<your-hub-name>"

# デプロイされるアプリケーションのURL（デプロイ後に確認）
export APP_URL="<your-app-url>"

# Web PubSub接続文字列（Azure Portalから取得）
export WEB_PUBSUB_CONNECTION_STRING="<your-web-pubsub-connection-string>"
```

**設定例:**
```bash
export RESOURCE_GROUP="rg-<your-resource-group>"
export STATIC_WEB_APP_NAME="stapp-<your-static-web-app-name>"
export WEB_PUBSUB_NAME="wps-<your-web-pubsub-name>"
export WEB_PUBSUB_HUB_NAME="poker"
export APP_URL="https://your-app.azurestaticapps.net"
export WEB_PUBSUB_CONNECTION_STRING="Endpoint=https://your-service.webpubsub.azure.com;AccessKey=...;Version=1.0;"
```

**注意**: これらの環境変数は、デプロイスクリプトやコマンド実行時に使用されます。セッションごとに設定する必要があるため、`.envrc`ファイルや`.bashrc`などに保存することを推奨します。

## 必要なAzureリソース

1. **Azure Static Web Apps**
   - リソースグループ: `$RESOURCE_GROUP`
   - 名前: `$STATIC_WEB_APP_NAME`
   - リージョン: East Asia

2. **Azure Web PubSub**
   - リソースグループ: `$RESOURCE_GROUP`
   - 名前: `$WEB_PUBSUB_NAME`
   - Hub名: `$WEB_PUBSUB_HUB_NAME`

## デプロイ手順

### 1. ビルド

本番環境用にアプリケーションをビルドします。

```bash
NODE_ENV=production npm run build
```

これにより、`./out` ディレクトリに静的ファイルが生成されます。

### 2. デプロイトークンの取得

Azure Static Web Appsのデプロイトークンを取得します。

```bash
export DEPLOYMENT_TOKEN=$(az staticwebapp secrets list \
  --name $STATIC_WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "properties.apiKey" \
  -o tsv)
```

### 3. デプロイ実行

Static Web Apps CLIを使用してデプロイします。

```bash
swa deploy ./out \
  --api-location ./api \
  --api-language node \
  --api-version 20 \
  --env production \
  --deployment-token $DEPLOYMENT_TOKEN
```

**パラメータ説明:**
- `./out`: フロントエンドのビルド成果物のパス
- `--api-location ./api`: Azure Functionsのソースコードのパス
- `--api-language node`: APIの言語（Node.js）
- `--api-version 20`: Node.jsのバージョン
- `--env production`: デプロイ環境（production）
- `--deployment-token`: 環境変数から取得したデプロイトークン

### 4. Azure環境変数の設定

Azure Static Web AppsのAPIに必要な環境変数を設定します。

```bash
az staticwebapp appsettings set \
  --name $STATIC_WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --setting-names WEB_PUBSUB_CONNECTION_STRING="$WEB_PUBSUB_CONNECTION_STRING"
```

**設定される環境変数:**
- `WEB_PUBSUB_CONNECTION_STRING`: Azure Web PubSubの接続文字列

### 5. Web PubSubイベントハンドラーの設定

Web PubSubのイベントハンドラーを本番環境のURLに設定します。

```bash
az webpubsub hub update \
  --name $WEB_PUBSUB_NAME \
  --resource-group $RESOURCE_GROUP \
  --hub-name $WEB_PUBSUB_HUB_NAME \
  --event-handler url-template="${APP_URL}/api/events" \
  user-event-pattern="*" \
  system-event="connected" \
  system-event="disconnected"
```

**注意**: `$APP_URL`は、デプロイ完了後に表示されるURLを設定してください。

## デプロイ後の確認

1. デプロイされたURLにアクセス: `$APP_URL`
2. 新しいルームを作成
3. 参加者リストが正しく表示されることを確認
4. カード選択、公開、リセットなどの機能が動作することを確認

## 完全なデプロイスクリプト例

以下は、環境変数を設定した後に実行できる完全なデプロイスクリプトの例です。

```bash
#!/bin/bash
set -e

# 環境変数が設定されているか確認
required_vars=("RESOURCE_GROUP" "STATIC_WEB_APP_NAME" "WEB_PUBSUB_NAME" "WEB_PUBSUB_HUB_NAME" "APP_URL" "WEB_PUBSUB_CONNECTION_STRING")
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "Error: $var is not set"
    exit 1
  fi
done

echo "1. ビルド中..."
NODE_ENV=production npm run build

echo "2. デプロイトークンを取得中..."
export DEPLOYMENT_TOKEN=$(az staticwebapp secrets list \
  --name $STATIC_WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "properties.apiKey" \
  -o tsv)

echo "3. デプロイ実行中..."
swa deploy ./out \
  --api-location ./api \
  --api-language node \
  --api-version 20 \
  --env production \
  --deployment-token $DEPLOYMENT_TOKEN

echo "4. Azure環境変数を設定中..."
az staticwebapp appsettings set \
  --name $STATIC_WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --setting-names WEB_PUBSUB_CONNECTION_STRING="$WEB_PUBSUB_CONNECTION_STRING"

echo "5. Web PubSubイベントハンドラーを設定中..."
az webpubsub hub update \
  --name $WEB_PUBSUB_NAME \
  --resource-group $RESOURCE_GROUP \
  --hub-name $WEB_PUBSUB_HUB_NAME \
  --event-handler url-template="${APP_URL}/api/events" \
  user-event-pattern="*" \
  system-event="connected" \
  system-event="disconnected"

echo "デプロイ完了！"
echo "アプリケーションURL: $APP_URL"
```

## トラブルシューティング

### Application Insightsでログを確認

```bash
# Azure Portalにアクセス
# Static Web Apps → Application Insights → Logs

# 以下のクエリで最近のログを確認
traces
| where timestamp > ago(10m)
| order by timestamp desc
| project timestamp, message, severityLevel
```

### Web PubSubのライブトレースを確認

Azure Portal → Web PubSub → Live trace で、イベントの送受信状況を確認できます。

### よくある問題

**問題: 参加者が更新されない**
- Web PubSubのイベントハンドラーが正しく設定されているか確認
- Azure Functionsのログでエラーがないか確認
- 環境変数 `WEB_PUBSUB_CONNECTION_STRING` が設定されているか確認

**問題: API呼び出しが404エラー**
- `api/host.json` の `routePrefix` が `"api"` になっているか確認
- デプロイ時に `--api-location` が正しく指定されているか確認

**問題: crypto is not definedエラー**
- Node.jsバージョンが20以上になっているか確認
- `--api-version 20` が指定されているか確認

## CI/CDパイプライン（参考）

将来的にGitHub Actionsでの自動デプロイを設定する場合は、以下の情報が必要です：

- `AZURE_STATIC_WEB_APPS_API_TOKEN`: デプロイトークン
- `WEB_PUBSUB_CONNECTION_STRING`: Web PubSubの接続文字列（Secret）

## 関連ドキュメント

- [Azure Static Web Apps公式ドキュメント](https://learn.microsoft.com/ja-jp/azure/static-web-apps/)
- [Azure Web PubSub公式ドキュメント](https://learn.microsoft.com/ja-jp/azure/azure-web-pubsub/)
- [開発環境セットアップ](./development.md)
