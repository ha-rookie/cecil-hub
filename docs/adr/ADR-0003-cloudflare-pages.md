# ADR-0003: Use Cloudflare Pages for Cecil v1

- Status: Accepted
- Date: 2026-09-20

## Context

Cecil v1は静的なPersonal Hubであり、Worker runtimeを必要としない。

当初はCloudflare Workers Static Assetsを採用したが、既存の個人開発アプリである朝マズメ潮ナビ、あと一杯ナビ、よう拝、くるくるソムリエはいずれも利用者向け公開先をCloudflare Pagesへ統一している。

Cecilだけ `workers.dev` を公開URLにすると、公開URL体系とデプロイ運用が分かれる。

## Decision

Cecil v1のHostingをCloudflare Pagesへ変更する。

- Production: `https://cecil-hub.pages.dev/`
- Preview: PR branch deploy
- Deploy: GitHub Actions + Wrangler Direct Upload
- Production branch: `main`
- Publish directory: `public/`
- Cloudflare Git integrationは使用しない
- 独自ドメインは当面使用しない
- `workers.dev` は正式公開URLとして使用しない

## Consequences

### Positive
- 既存アプリ群とURL・運用を統一できる
- 静的サイトというCecil v1の性質に合う
- PR Preview → Human Review → main → Productionの流れを維持できる
- 公開URLにCloudflareアカウントのworkers.devサブドメインが入らない

### Negative
- 将来Worker固有機能が必要になった場合はPages FunctionsまたはWorkersとの役割分担を再設計する必要がある

## Revisit

- Server APIが必要になった時
- Pages Functionsを導入する時
- 独自ドメインを採用する時
