# ADR-0002: Use Cloudflare Workers Static Assets for v1

- Status: Superseded by ADR-0003
- Date: 2026-09-20

## Context

Cecil v1はポートフォリオ / Personal Hubであり、DB、Login、APIを必要としない。

スマホ中心の確認と、既存Cloudflare運用経験を活かしたい。

## Decision

v1はHTML / CSS / JavaScriptの静的構成とし、Cloudflare Workers Static Assetsで配信する。

GitHub Actionsから本番deployする構成を必須にせず、Cloudflare Git integrationを優先する。

## Consequences

### Positive
- 構成が単純
- Runtime依存が少ない
- 公開対象を `public/` に限定しやすい
- Actions minutesをデプロイ用途で消費しない

### Negative
- 動的機能追加時にはArchitecture再検討が必要

## Revisit

DB、認証、フォーム処理、Server APIなどが必要になった時。
