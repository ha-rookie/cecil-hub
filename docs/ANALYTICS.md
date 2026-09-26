# Cecil Analytics design

更新日: 2026-09-26
関連Issue: #20 / #53 / #70

## 目的

Cecilを「アクセス観測拠点」として使い、個人を識別せずに次を把握する。

- どこからCecilへ来たか
- Cecilからどこへ移動したか
- 流入元ごとに、どの遷移先が選ばれたか
- 日ごとのアクセス推移
- どの導線・セクションがクリックされたか

## 採用構成

- Cloudflare Workers Static Assets: Web配信
- Workers Analytics Engine: `page_view` / `outbound_click` の匿名集計
- `/api/event`: same-originの計測受付
- Cookie / localStorage ID / fingerprint / user IDは使わない

朝マズメ潮ナビで採用済みの「Cloudflare内で完結する匿名custom event」の考え方をCecil向けに簡素化して再利用する。

## 分析の正本

取得時点の「前回 / 今回」比較を正本にしない。

アクセスが発生した日を正本とし、Cloudflare Analytics Engineの `timestamp` をJST日付へ変換して日次集計する。

通常分析の基礎データ:

- 日次PV
- 日次Outbound click
- 日次 source / medium別PV
- 日次 path別PV
- 日次 destination / link_id / section別click
- 日次 source × destination（source → destination）

前週比、7日移動合計、30日集計、90日集計、月次推移、最新比較等はGoogle Sheetsの日次データから派生させる。

**7 / 30 / 90日は分析期間であり、Cloudflareからのデータ取得期間を人が選ぶためのものではない。**

現行計測は匿名でuser/session IDを持たないため、次は算出しない。

- UU
- session
- retention
- user単位の回遊

## 日次データ更新の標準ルール

CECILアクセス分析を実行するときは、次の順序を標準とする。

1. GitHub Actions `Cecil analytics report` を実行する
2. Cloudflare Analytics Engineから、保持期間内の補完用データを取得する
3. Google Sheetsの既存日付と照合する
4. 未取得日を補完する
5. 同じ日付は重複追加しない
6. 既存日付の値と再集計値が異なる場合は最新の再集計値へ更新する
7. 日次正本の更新後に7日 / 30日 / 90日 / 全期間などの分析を行う

標準操作では利用者に取得期間を選ばせない。

### 補完窓

Workers Analytics Engineの保持期間が3か月のため、GitHub Actionsは90日を補完窓として固定する。

- 取得窓: 直近90日相当
- 確定対象: JSTの昨日まで
- JSTの当日は途中値なので正本更新対象外
- Analytics計測開始日: 2026-09-20

90日を超えて実行しなかった場合、Cloudflare側の保持期間を超えた未取得データは復元できない可能性がある。

### 0件日の扱い

日次サマリーでは、アクセスが0件の日も日付行を持つ。

例:

- 2026-09-23: 7 PV
- 2026-09-24: 0 PV
- 2026-09-25: 2 PV

これにより「未取得」と「実アクセス0件」を区別する。

source / medium / path / destination等の明細シートは、実データが0件の日にダミー明細行を作らない。

## 通常分析から除外するトラフィック

生データは削除せず、集計クエリ側で除外する。

- `source = outbound_test`
- `medium = qa`
- `source = chatgpt.com`
- `source = chatgpt`

ChatGPT流入は、開発・確認作業由来のアクセスが混在するため、CECILの通常アクセス分析には含めない。

## イベント

### page_view

保存する項目:

- source
- medium
- campaign
- content
- referrer_host
- path

### outbound_click

`page_view` と同じ流入情報に加えて保存する。

- destination
- link_id
- section

### deployment_smoke_test

本番デプロイ後のbinding疎通確認専用。利用統計から除外する。

## 流入判定

UTMがある場合はUTMを優先する。

UTMがない場合はreferrer hostnameから以下を推定する。

- note
- X
- Instagram
- ProtoPedia
- LINE
- lit.link
- 朝マズメ潮ナビ
- あと一杯ナビ
- よう拝
- くるくるソムリエ
- 想いの方角
- Google / Bing / Yahoo
- Direct
- Other referral

## 推奨UTM

Cecil本番URL:

`https://cecil-hub.ha-rookie.workers.dev/`

外部プロフィール等に置くリンクは以下を基準にする。

- note: `?utm_source=note&utm_medium=profile&utm_campaign=hub`
- X: `?utm_source=x&utm_medium=profile&utm_campaign=hub`
- Instagram: `?utm_source=instagram&utm_medium=profile&utm_campaign=hub`
- ProtoPedia: `?utm_source=protopedia&utm_medium=profile&utm_campaign=hub`
- LINE: `?utm_source=line&utm_medium=profile&utm_campaign=hub`
- lit.link: `?utm_source=litlink&utm_medium=profile&utm_campaign=hub`
- 朝マズメ潮ナビ: `?utm_source=asamazume&utm_medium=app&utm_campaign=hub`
- あと一杯ナビ: `?utm_source=ato_ippai&utm_medium=app&utm_campaign=hub`
- よう拝: `?utm_source=yohai&utm_medium=app&utm_campaign=hub`
- くるくるソムリエ: `?utm_source=kurukuru_sommelier&utm_medium=app&utm_campaign=hub`
- 想いの方角: `?utm_source=omoi_no_hougaku&utm_medium=app&utm_campaign=hub`

## Preview / 内部テスト

- Production host以外ではブラウザイベントを送信しない
- Worker APIもProduction hostname以外を拒否する
- Production確認で `?internal_test=1` を付けるとブラウザイベントを送信しない
- PR Previewの操作は本番統計に混ぜない

## Privacy

保存しない:

- IPアドレス
- User-Agent
- Cookie ID
- localStorage ID
- fingerprint
- 氏名 / メールアドレス
- URLの任意query全文
- referrer URL全文

referrerはhostnameのみ保存する。

保持期間:

- Workers Analytics Engineへ書き込まれたデータはCloudflare公式仕様で3か月
- 参照: https://developers.cloudflare.com/analytics/analytics-engine/limits/#data-retention

公開Privacy:

- `/privacy.html`
- Privacyページ自体では `analytics.js` を読み込まず、計測対象外とする。

## Analytics Engine schema

index:

1. event

blobs:

1. event
2. source
3. medium
4. campaign
5. content
6. referrer_host
7. destination
8. link_id
9. section
10. hostname
11. path

doubles:

1. count (=1)

dataset:

- `cecil_hub_events`

## GitHub Actionsレポート

`.github/workflows/analytics-report.yml` を手動実行する。

取得期間の選択は行わない。`scripts/analytics-report.mjs` が90日の補完窓を固定で取得する。

レポート出力:

- `ReportMeta`
- `DailyOverview`
- `DailyInbound`
- `DailyPaths`
- `DailyOutbound`
- `DailyJourneys`

`DailyOverview` はAnalytics計測開始日以降について、アクセス0件の日も0で補完する。

GitHub Actions自体はGoogle Sheetsへ直接書き込まない。Actionsログの機械可読配列を使い、ChatGPT側でGoogle Sheetsの日次正本と照合してupsertする。

## 保存先と役割分担

Google Sheets:
- 日次実績の正本
- source / medium / path / destination / link_id / section等の分析元データ
- 0PV日を含む連続した日付軸
- 時系列グラフ、週次/月次、7日/30日/90日集計の計算元

Notion:
- データが一定量たまった後の分析結果
- 何が増減したか
- その背景にある施策や公開記事
- 次に試す変更
- 変更後の検証結果
- 長期的な判断履歴

数値そのものの正本はSheets、解釈と意思決定の正本はNotionとする。
