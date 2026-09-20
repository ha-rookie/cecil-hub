# ADR-0001: Keep development repository private and publish only site assets

- Status: Accepted
- Date: 2026-09-20

## Context

Cecilは公開ポートフォリオだが、利用しているAI駆動開発テンプレートにはAGENTS、設計書、ADR、Issue/PR運用など蓄積した開発ノウハウが含まれる。

GitHub RepositoryをPublicにすると、コピーされたテンプレート由来ファイルも公開される。

## Decision

開発Repository `ha-rookie/cecil-hub` はPrivateで運用する。

公開するのはCloudflareへ配信する `public/` の成果物のみとする。

GitHubでコード公開が必要になった場合は、公開対象を限定したPublic Mirrorを別途設計する。

## Consequences

### Positive
- 開発ノウハウを非公開に保てる
- サイト自体はPublicにできる
- 開発用ドキュメントを削る必要がない

### Negative
- GitHub上でCecilの全開発履歴をポートフォリオとして直接見せられない

## Revisit

Public Repository自体に明確な価値が生じた時。
