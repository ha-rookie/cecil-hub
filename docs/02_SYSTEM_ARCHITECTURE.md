# System Architecture

## Overview

Cecil v1 は静的サイトとして構成する。

```text
Private GitHub Repository
  ha-rookie/cecil-hub
        |
        | GitHub Actions + Wrangler
        v
Cloudflare Workers Static Assets
        |
        +--> PR Version Preview
        |
        +--> Production（公開URL確定後）
        |
        v
Public Cecil Website
        |
        +--> note
        +--> ProtoPedia
        +--> X / Instagram / LINE / etc.
```

## Repository / Publication Boundary

GitHub Repository全体はPrivate。

Cloudflareへ配信する対象は `public/` のみとする。

配信対象外:
- `docs/`
- `AGENTS.md`
- `.github/`
- ADR
- Issue / PR
- 開発ノウハウ

公開サイトからPrivate GitHub Repositoryへリンクしない。

## Hosting

- Cloudflare Workers Static Assets
- v1ではWorker backendなし
- DB / KV / D1 / R2なし
- Loginなし
- APIなし
- 独自ドメインは当面使用しない

## Deployment

標準経路は GitHub Actions + Wrangler とする。

### Pull Request

`wrangler versions upload --preview-alias` を使い、PRごとのVersion Previewを作成する。

Preview URLはCloudflareアカウントの `workers.dev` サブドメインを利用する。

### main

承認済みmainを `wrangler deploy` する。

現時点では `workers_dev: false` のため、Productionの公開routeは有効化しない。

Production URLの確定と公開route有効化は別Issueで扱う。

## Environments

### Development
GitHub branch上で設計・実装。

### Preview
PRごとのCloudflare Version Previewでスマホを含む人間確認を行う。

### Production
人間承認後にmainへmergeし、GitHub ActionsでProduction versionをdeployする。
公開routeの有効化は別途承認する。

## Security Boundary

Static Assetsは公開される前提で扱う。

秘密情報・Token・内部設計は `public/` に置かない。

Security Header:
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
- Content-Security-Policy

## Analytics

公開URL確定後に以下を検討する。

- Cloudflare Web Analytics
- Google Search Console
- outbound click event

第三者サイト遷移後の行動をCecil側だけで完全追跡できる前提は置かない。
