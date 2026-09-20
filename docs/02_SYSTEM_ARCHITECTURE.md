# System Architecture

## Overview

Cecil v1 は静的サイトとして構成する。

```text
Private GitHub Repository
  ha-rookie/cecil-hub
        |
        | Git integration / deploy
        v
Cloudflare Workers Static Assets
        |
        v
Public Cecil Website
        |
        +--> note
        +--> ProtoPedia
        +--> GitHub
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

## Hosting

- Cloudflare Workers Static Assets
- v1ではWorker backendなし
- DB / KV / D1 / R2なし
- Loginなし
- APIなし

## Deployment

CloudflareのGitHub連携を優先する。

GitHub Actionsによる本番デプロイはv1の必須構成にしない。Actions minutes節約と運用単純化を理由とする。

## Environments

### Development
GitHub branch上で設計・実装。

### Preview
Cloudflare Previewでスマホを含む人間確認を行う。

### Production
人間承認後にProductionへ反映する。

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
