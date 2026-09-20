# Analytics report operation

CecilのWorkers Analytics Engine集計をGitHub Actionsから確認する。

## 実行方法

GitHub:

1. Actions
2. `Cecil analytics report`
3. `Run workflow`
4. 7日または30日を選択
5. 実行結果のSummaryを確認

## 集計内容

- Page views
- Inbound: source / medium
- Outbound: destination
- Source → Destination

## セキュリティ

Cloudflare API tokenはRepository Secret
`CLOUDFLARE_ANALYTICS_READ_TOKEN` に保存する。

権限:

- Account
- Account Analytics
- Read

Secret値はworkflowの出力に表示しない。

## 公開範囲

`cecil-hub` はPublic repositoryのため、ActionsのログやSummaryは第三者から参照される可能性がある。
そのためこのreportは匿名の集計値だけを出し、以下は出力しない。

- IP
- User-Agent
- Cookie/User ID
- 個別イベント
- full referrer URL

## SQL API

Cloudflare Workers Analytics Engine SQL APIを利用する。

dataset:

`cecil_hub_events`

期間は7日または30日。
