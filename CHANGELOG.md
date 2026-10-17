# Changelog

## Unreleased

今後の追加改善をここへ記録する。

### CECIL SEO title production release — 2026-10-17

- 日本語トップのtitle / og:title：`CECIL｜Webアプリ・文章・名古屋の記録`
- 英語トップのtitle / og:title：`CECIL | Web Apps, Writing & Local Discoveries`
- 実装：PR #88、main Squash commit `d44125d20f178d870c5c371968d071450f7fb273`
- 検証済み：Project validation CI・npm test（40/40）・Cloudflare Preview smoke（日本語/英語・Privacy・404・icons）・Human Preview確認
- 本番反映：Release Issue #89に従い、別PRをマージ後に既存main-push GitHub Actionsで実行・検証する。実際のProduction Deploy・本番表示・Security/Analytics smokeの成功を確認するまではリリース完了と扱わない
- リリース記録の追加によって、既存HTML・JS・CSS・Assets・Cloudflare設定・Secrets・GitHub Actions workflowは変更しない

## v0.2 - 2026-09-20

朝マズメ潮ナビ、あと一杯ナビ、よう拝（遥拝）アプリ、くるくるソムリエ等の実証から、公開・運用フェーズの共通知見をTemplateへ還流した。

### Added

- GitHub Actionsを有限の実行資源として扱う運用ルール
- 80% / 90%利用時の確認、重複trigger監査、failed job rerun判断
- Assetの原本保存型 / ビルド時生成型 / 同一Blob再利用型
- OGP / favicon / Apple Touch / PWA icon / maskable iconの標準
- Git Blob + Base64直接輸送の判断基準と切り分け手順
- Cloudflare Pages bootstrap / Hello World Gate / Production Workflow Template
- Design Preview専用Pages Projectの標準
- Design Preview starter / noindex / security placeholder
- Recommended Security Headers baseline
- Public Web Quality標準
- Google Search Console初期登録、HTML所有権確認、URL検査、sitemap運用
- About / Disclaimer / Privacy / Footerの判断基準
- 検索公開 / URL限定共有の選択
- Production Verification中心のRelease Checklist

### Changed

- Golden PathをDeploy後のProduction Verification、設計書同期、公開後観測まで拡張
- Merge / Deploy成功だけではRelease完了としない
- Production / App Preview / Design Previewの責務を分離
- PWA / Analytics / index公開 / LLMOを一律必須ではなくHuman decisionへ変更
- Cloudflare SetupをGitHub Actions + Wrangler中心の再現可能な手順へ拡張
- Template validationでCloudflare / Security / Public Web Quality / Design Preview / Asset / CI運用規約を検証
- Notionを「開発のやり方」の正本、GitHubをコードとコード密接設計の正本として役割分担を明確化

## v0.1

朝マズメ潮ナビの開発実証から、共通化できる開発プロセスを抽出した初版。

- Golden Path
- Git、Asset、Cloudflare、Troubleshooting、Releaseの標準文書
- Feature／Bug Issue Forms
- Pull Request Template
- Template構造検証Workflow
- AI向けAGENTS.md
- 要件、System Architecture、Application Architecture、Repository Structureの標準設計書
- Design ManagementとRequirements Traceability
- Visual Design管理方針
- Architecture Decision Record運用
