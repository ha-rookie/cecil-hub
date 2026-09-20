# Cecil Analytics design

更新日: 2026-09-20
関連Issue: #20

## 目的

Cecilを「アクセス観測拠点」として使い、個人を識別せずに次を把握する。

- どこからCecilへ来たか
- Cecilからどこへ移動したか
- 流入元ごとに、どの遷移先が選ばれたか

## 採用構成

- Cloudflare Workers Static Assets: Web配信
- Workers Analytics Engine: `page_view` / `outbound_click` の匿名集計
- `/api/event`: same-originの計測受付
- Cookie / localStorage ID / fingerprint / user IDは使わない

朝マズメ潮ナビで採用済みの「Cloudflare内で完結する匿名custom event」の考え方をCecil向けに簡素化して再利用する。

Cloudflare公式仕様では、Workers Static Assetsは `run_worker_first` をAPIパスだけに限定でき、Analytics Engine bindingはWrangler設定から利用できる。datasetは最初のwriteで自動作成される。

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

これにより、ユーザーIDを持たなくても「source × destination」の集計ができる。

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

## 可視化クエリ

### 流入元

```sql
SELECT
  blob2 AS source,
  blob3 AS medium,
  SUM(_sample_interval) AS views
FROM cecil_hub_events
WHERE timestamp > NOW() - INTERVAL '30' DAY
  AND blob1 = 'page_view'
GROUP BY source, medium
ORDER BY views DESC
```

### Cecilからの遷移先

```sql
SELECT
  blob7 AS destination,
  SUM(_sample_interval) AS clicks
FROM cecil_hub_events
WHERE timestamp > NOW() - INTERVAL '30' DAY
  AND blob1 = 'outbound_click'
GROUP BY destination
ORDER BY clicks DESC
```

### 流入元 × 遷移先

```sql
SELECT
  blob2 AS source,
  blob7 AS destination,
  SUM(_sample_interval) AS clicks
FROM cecil_hub_events
WHERE timestamp > NOW() - INTERVAL '30' DAY
  AND blob1 = 'outbound_click'
GROUP BY source, destination
ORDER BY clicks DESC
```

## 次段階

Issue #20ではまず「正しく収集できる」ことを完成させる。
可視化画面をCecil本体へ公開はしない。Cloudflare SQL API / private dashboard化が必要になった時点で別Issueとする。
