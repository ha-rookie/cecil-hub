# Analytics report operation

CecilのWorkers Analytics Engine集計をGitHub Actionsから取得し、Google Sheetsの日次正本を補完するための運用。

## 標準実行方法

GitHub:

1. Actions
2. `Cecil analytics report`
3. `Run workflow`
4. そのまま実行
5. 実行結果のSummary / logを確認

取得期間の選択はしない。

GitHub ActionsはCloudflareの保持期間に合わせた90日の補完窓を固定で取得する。

## 標準更新フロー

CECILアクセス分析では次を一連の処理として扱う。

1. `Cecil analytics report` を実行
2. `ReportMeta` と日次配列を取得
3. Google Sheets `CECIL_アクセス分析データ` と日付単位で照合
4. 未取得日を追加
5. 既存日付は重複追加しない
6. 既存値と再集計値が異なる場合は最新値へ更新
7. 日次正本の更新後に分析を行う

ユーザーから「CECILアクセス分析をお願い」と依頼された場合、原則としてこの標準フローを使用する。

## 日付の扱い

- タイムゾーン: Asia/Tokyo
- Analytics計測開始日: 2026-09-20
- 確定対象: 昨日まで
- 当日: 途中値なので日次正本へ反映しない
- 補完窓: 90日

`DailyOverview` は0PVの日も明示的に0として出力する。

これにより、Google Sheets上で「本当に0件だった日」と「まだ取得していない日」を区別できる。

source / medium / path / destination等の明細配列は、0件の日にダミー行を作らない。

## 7日 / 30日 / 90日の意味

7日 / 30日 / 90日はCloudflare取得時に人が選択する期間ではない。

Google Sheetsの日次正本を更新した後に、分析目的に応じて集計する期間として使う。

例:

- 直近7日: 短期トレンド
- 直近30日: 通常の月次に近い傾向
- 直近90日: 中期推移
- 全期間: 累積・長期傾向

## 出力

GitHub Actions logに次を機械可読JSONとして出力する。

- `ReportMeta`
- `DailyOverview`
- `DailyInbound`
- `DailyPaths`
- `DailyOutbound`
- `DailyJourneys`

`ReportMeta` には以下を含める。

- backfill_days
- analytics_start_date
- window_start_jst
- window_end_jst
- current_jst_day_excluded
- daily_overview_zero_filled

## 集計内容

- Page views
- Outbound clicks
- Inbound: source / medium
- Path
- Outbound: destination / link_id / section
- Source → Destination

## Google Sheetsへの反映

GitHub Actions自体はGoogle Sheetsへ直接書き込まない。

Actionsの機械可読出力を使い、ChatGPT側でGoogle Sheets `CECIL_アクセス分析データ` を更新する。

反映ルール:

- `日次サマリー`: 日付キーでupsert。0PV日も保持
- `流入元`: 日付 + source + medium をキーとして扱う
- `ページ`: 日付 + path をキーとして扱う
- `外部クリック`: 日付 + destination + link_id + section をキーとして扱う
- `流入→遷移`: 日付 + source + destination をキーとして扱う

同一キーを重複追加しない。

既存値とCloudflare再集計値が異なる場合は、Cloudflare側の最新集計値で更新する。

## 通常分析から除外するデータ

通常レポートでは以下を自動除外する。

- `source = outbound_test`
- `medium = qa`
- `source = chatgpt.com`
- `source = chatgpt`

生データはAnalytics Engineに残し、通常分析だけから除外する。

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

そのためreportは匿名の集計値だけを出し、以下は出力しない。

- IP
- User-Agent
- Cookie/User ID
- 個別イベント
- full referrer URL

## SQL API

Cloudflare Workers Analytics Engine SQL APIを利用する。

dataset:

`cecil_hub_events`

Workers Analytics Engineの保持期間は3か月。90日を超えて更新を空けた場合、保持期間外の未取得データは復元できない可能性がある。
