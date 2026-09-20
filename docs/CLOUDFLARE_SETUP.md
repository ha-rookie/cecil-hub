# Cloudflare Setup — Cecil

## 1. v1 Hosting

Cecil v1 は **Cloudflare Pages** で配信する。

Production URL:

`https://cecil-hub.pages.dev/`

当面、独自ドメインは使用しない。

公開対象ディレクトリは `public/` のみ。

`docs/`、`AGENTS.md`、`.github/`、ADR、Issue / PRなどの開発ノウハウは配信対象に含めない。

## 2. Source Repository

Source Repository:

`ha-rookie/cecil-hub`

RepositoryはPrivateで運用する。

公開サイトのためにRepository自体をPublicへ変更する必要はない。

## 3. Standard Deployment Path

標準経路は **GitHub Actions → Wrangler Direct Upload → Cloudflare Pages** とする。

```text
Private GitHub Repository
        |
        | GitHub Actions
        v
Wrangler Pages Direct Upload
        |
        +--> PR Preview
        |      pr-<number>.cecil-hub.pages.dev
        |
        +--> Production
               cecil-hub.pages.dev
```

Cloudflare Git integrationは使用しない。

## 4. Wrangler

`wrangler.jsonc`:

```json
{
  "name": "cecil-hub",
  "pages_build_output_dir": "./public",
  "compatibility_date": "2026-09-20"
}
```

v1ではPages Functions、DB、KV、D1、R2を使用しない。

GitHub ActionsではCloudflare認証用に以下のRepository Secretsを使用する。

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## 5. Preview

Productionへ反映する前にPull Request Previewで確認する。

Stable Preview Alias:

`https://pr-<PR番号>.cecil-hub.pages.dev/`

最低限:

- Smartphone表示
- Light
- Dark
- Theme toggle
- 主要外部リンク
- 404
- Security Headers
- 公開対象が `public/` に限定されていること

## 6. Production

Productionは承認済み `main` を基準とする。

Production URL:

`https://cecil-hub.pages.dev/`

mainへのmerge後、GitHub Actionsから以下を実行する。

`wrangler pages deploy public --project-name=cecil-hub --branch=main`

## 7. Production Smoke

Deploy成功だけでRelease完了としない。

最低限:

- HTTP 200
- HTTPS
- CecilのHTML marker
- CSS / JavaScript
- 404
- Security Headers
- Production URLが承認済みmainを配信していること

## 8. Security

秘密情報を `public/` に置かない。

`public/_headers` を初期Security Headerの正本とし、Preview / Productionの実レスポンスでも確認する。

## 9. SEO / Analytics

Production URLを正本として、後続Issueで以下を整備する。

- canonical
- og:url
- OGP image
- sitemap.xml
- robots.txt Sitemap
- Cloudflare Web Analytics
- Google Search Console
- outbound click measurement

## 10. Rollback

重大な回帰時は直前の正常main commitまたは正常deploymentを特定する。

- mainをforce updateしない
- revert PRを基本にする
- 理由をIssue / PRへ残す
- rollback後もProduction Smokeを行う
