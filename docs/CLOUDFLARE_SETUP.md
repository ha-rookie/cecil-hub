# Cloudflare Setup — Cecil

## 1. v1 Hosting

Cecil v1 は **Cloudflare Workers Static Assets** で配信する。

公開対象ディレクトリは `public/` のみ。

`docs/`、`AGENTS.md`、`.github/`、ADR、Issue / PRなどの開発ノウハウは配信対象に含めない。

独自ドメインは当面使用しない。

## 2. Source Repository

Source Repository:

`ha-rookie/cecil-hub`

RepositoryはPrivateで運用する。

公開サイトのためにRepository自体をPublicへ変更する必要はない。

公開サイトからPrivate GitHub Repositoryへリンクしない。

## 3. Standard Deployment Path

標準経路は **GitHub Actions → Wrangler → Cloudflare Workers Static Assets** とする。

```text
Private GitHub Repository
        |
        | GitHub Actions
        v
Wrangler
        |
        +--> PR: Version Preview
        |
        +--> main: Production version deploy
```

Cloudflare Git integrationは使用しない。

## 4. Wrangler

`wrangler.jsonc`:

```json
{
  "name": "cecil-hub",
  "workers_dev": false,
  "preview_urls": true,
  "assets": {
    "directory": "./public",
    "not_found_handling": "404-page",
    "html_handling": "auto-trailing-slash"
  }
}
```

v1ではWorker backend、DB、KV、D1、R2、Bindingsを使用しない。

GitHub ActionsではCloudflare認証用に以下のRepository Secretsを使用する。

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## 5. Preview

Pull Requestでは `wrangler versions upload --preview-alias "pr-<PR番号>"` を使う。

Preview URLはCloudflareが返した実URLを正とし、アカウントの `workers.dev` サブドメイン変更後もハードコードしない。

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

mainへのmerge後、GitHub Actionsから `wrangler deploy` を実行する。

現時点では `workers_dev: false` のためProduction公開routeは有効化しない。

Production公開URLの確定とroute有効化は別Issueで行う。

## 7. Production Smoke

Production公開routeを有効化した後は、Deploy成功だけでRelease完了としない。

最低限:

- HTTP 200
- HTTPS
- CecilのHTML marker
- CSS / JavaScript / SVG
- 404
- Security Headers
- Production URLが承認済みmainを配信していること
- Preview用noindexがProductionへ誤適用されていないこと

## 8. Security

秘密情報を `public/` に置かない。

`public/_headers` を初期Security Headerの正本とし、Preview / Productionの実レスポンスでも確認する。

## 9. Analytics

Production公開URL確定後に導入判断する。

候補:

- Cloudflare Web Analytics
- Google Search Console
- outbound click measurement

第三者サイトへ遷移した後の行動をCecilだけで完全に把握できる前提は置かない。

## 10. Rollback

重大な回帰時は直前の正常main commitまたは正常deploymentを特定する。

- mainをforce updateしない
- revert PRを基本にする
- 理由をIssue / PRへ残す
- rollback後もProduction Smokeを行う

## 11. Design Previewとの責務分離

- Design Preview: 視覚設計レビュー
- App Preview: 実装Branch / PRの動作確認
- Production: mainの承認済み成果物

Design Previewは `docs/DESIGN_PREVIEW.md` に従う。
