# ADR-0003: Use GitHub Actions and workers.dev for Cecil v1 deployment

- Status: Accepted
- Date: 2026-09-20

## Context

ADR-0002でCloudflare Workers Static Assetsを採用した時点では、Cloudflare Git integrationを優先し、GitHub ActionsによるProduction Deployを必須にしない方針だった。

その後、Cecilでも他の個人開発アプリと同様に、Issue → Branch → Pull Request → Preview → Human Review → Merge → DeployをGitHub側で一貫して管理する方針へ変更した。

また、当面は独自ドメインを使用しない。

## Decision

- Deploy標準経路を GitHub Actions + Wrangler とする
- Pull RequestではCloudflare Preview URLを生成する
- mainでは `wrangler deploy` を実行する
- Productionは `https://cecil-hub.edward-se-pg.workers.dev/` を使用する
- `workers_dev: true`
- `preview_urls: true`
- Cloudflare Git integrationは使用しない
- 独自ドメインはv1では使用しない

## Consequences

### Positive
- Issue / PR / CI / Preview / DeployがGitHubに集約される
- 他の個人開発アプリと運用を揃えられる
- 独自ドメインなしで公開できる
- PreviewとProductionの責務が明確になる

### Negative
- DeployごとにGitHub Actions minutesを使用する
- `workers.dev` のURLはCloudflareアカウントサブドメインに依存する

## Revisit

- 独自ドメインを採用する時
- Production routeをCustom Domainへ移す時
- GitHub Actions以外のCI/CDへ変更する時
