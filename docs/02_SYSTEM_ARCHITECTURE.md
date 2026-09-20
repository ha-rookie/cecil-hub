# System Architecture

## Overview

Cecil v1 は静的サイトとして構成する。

```text
Private GitHub Repository
  ha-rookie/cecil-hub
        |
        | GitHub Actions + Wrangler Direct Upload
        v
Cloudflare Pages
        |
        v
https://cecil-hub.pages.dev/
        |
        +--> note
        +--> ProtoPedia
        +--> X / Instagram / LINE / etc.
```

## Repository / Publication Boundary

GitHub Repository全体はPrivate。

Cloudflare Pagesへ配信する対象は `public/` のみとする。

配信対象外:
- `docs/`
- `AGENTS.md`
- `.github/`
- ADR
- Issue / PR
- 開発ノウハウ

公開サイトからPrivate GitHub Repositoryへリンクしない。

## Hosting

- Cloudflare Pages
- Production URL: `https://cecil-hub.pages.dev/`
- Custom domain: 当面使用しない
- Backend APIなし
- DB / KV / D1 / R2なし
- Loginなし

## Deployment

Cloudflare Git integrationは使用しない。

GitHub Actions + Wrangler Direct Uploadを標準経路とする。

- Pull Request: `pr-<番号>.cecil-hub.pages.dev`
- main: `cecil-hub.pages.dev`
- Production branch: `main`
- Deploy directory: `public/`

## Environments

### Development
GitHub branch上で設計・実装。

### Preview
Pull RequestごとのCloudflare Pages Previewでスマホを含む人間確認を行う。

### Production
人間承認後にmainへmergeし、GitHub ActionsからCloudflare Pages Productionへ反映する。

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

Production URL確定後に以下を検討する。

- Cloudflare Web Analytics
- Google Search Console
- outbound click event

第三者サイト遷移後の行動をCecil側だけで完全追跡できる前提は置かない。
