# ADR-0003: Use GitHub Actions and Wrangler for Cecil deployment

- Status: Accepted
- Date: 2026-09-20

## Context

ADR-0002でCloudflare Workers Static Assetsを採用した時点では、Cloudflare Git integrationを優先する方針だった。

その後、Cecilでも他の個人開発と同じ Issue → Branch → Pull Request → Preview → Human Review → Merge の流れをGitHub側で一貫して管理する方針へ変更した。

Cloudflareのworkers.devアカウントサブドメインはユーザー側で整理し、CecilはPagesへ移行せずWorkers Static Assetsを継続する。

## Decision

- HostingはCloudflare Workers Static Assetsを継続する
- Deploy標準経路はGitHub Actions + Wranglerとする
- Pull RequestではVersion Previewを作成する
- Preview URLはCloudflareが返す実URLを正とし、workers.devアカウントサブドメインをハードコードしない
- mainでは承認済みversionをdeployする
- Production公開routeは別Issueで明示的に有効化する
- Cloudflare PagesはCecilのHostingとして使用しない
- 独自ドメインは当面使用しない

## Consequences

### Positive
- GitHubのIssue / PR / CI / Preview / Deployを一貫した開発フローとして扱える
- workers.devサブドメインを変更してもPreview URLを設定ファイルへ固定する必要がない
- Workers Static Assetsの拡張性を維持できる

### Negative
- DeployにGitHub Actions minutesを使用する
- workers.devの公開URLはCloudflareアカウントサブドメインに依存する
- Production routeの有効化は別途管理が必要

## Revisit

- 独自ドメインを採用する時
- HostingをCloudflare Pages等へ変更する時
- CI/CD方式を変更する時
