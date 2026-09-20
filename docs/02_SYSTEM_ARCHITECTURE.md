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
        | workers.dev
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
- Production URL: `https://cecil-hub.edward-se-pg.workers.dev/`
- Custom domain: v1では使用しない
- Worker backendなし
- DB / KV / D1 / R2なし
- Loginなし
- APIなし

## Deployment

GitHub Actions + Wranglerを標準経路とする。

- Pull Request: Preview versionをupload
- main: Productionへdeploy
- Production route: `workers.dev`
- Preview URLs: enabled

Cloudflare Git integrationは使用しない。

## Environments

### Development
GitHub branch上で設計・実装。

### Preview
Pull RequestごとのCloudflare Preview URLでスマホを含む人間確認を行う。

### Production
人間承認後にmainへmergeし、GitHub ActionsからProductionへ反映する。

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

Production URLを正本として以下を導入・確認する。

- Cloudflare Web Analytics
- Google Search Console
- outbound click event

第三者サイト遷移後の行動をCecil側だけで完全追跡できる前提は置かない。
