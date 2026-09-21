# Repository Structure

## Target Structure

```text
cecil-hub/
├─ .github/
│  ├─ ISSUE_TEMPLATE/
│  ├─ workflows/
│  └─ PULL_REQUEST_TEMPLATE.md
├─ docs/
│  ├─ 00_PROJECT_OVERVIEW.md
│  ├─ 01_REQUIREMENTS.md
│  ├─ 02_SYSTEM_ARCHITECTURE.md
│  ├─ 03_APPLICATION_ARCHITECTURE.md
│  ├─ 04_REPOSITORY_STRUCTURE.md
│  ├─ 05_DESIGN_MANAGEMENT.md
│  ├─ 06_REQUIREMENTS_TRACEABILITY.md
│  ├─ HUMAN_AI_COLLABORATION.md
│  ├─ ASSET_WORKFLOW.md
│  ├─ design/
│  │  └─ assets/          # Human review / upload staging for visual assets
│  └─ adr/
├─ public/
│  ├─ index.html
│  ├─ styles.css
│  ├─ script.js
│  ├─ 404.html
│  ├─ robots.txt
│  ├─ _headers
│  ├─ icons/              # generated/deployable favicon and app icon artifacts
│  └─ patterns/
│     ├─ hero-geometry.svg
│     ├─ side-grid.svg
│     └─ section-corner.svg
├─ AGENTS.md
├─ CHANGELOG.md
├─ README.md
├─ package.json
├─ wrangler.jsonc
└─ .gitignore
```

## Public Boundary

Cloudflareへ配信可能なのは `public/` のみ。

Repositoryが将来Publicになった場合でも、現在の設計・運用ノウハウをそのまま公開する前提にはしない。

GitHub公開が必要になった場合はPublic Mirrorを別Issueで検討する。

## Ownership

- Product / requirement / judgment: Human
- Draft implementation / alternatives / review assistance: AI + Human
- Final approval / production decision: Human

## Source of Truth

- 承認済み設計: main
- 提案中設計: issue branch / PR
- 公開成果物: public/
- 実際の公開環境: Cloudflare Production

## Asset Placement

- Human review / upload staging: `docs/design/assets/`
- Issue #41の承認済みMaster Source Asset: `docs/design/assets/issue-41-icons/`
- Issue #41の配信用favicon / Apple Touch Icon等の生成物: `public/icons/`
- Issue #41では承認済みPNG MasterをSource Assetとして固定し、派生サイズは生成処理から作る。派生PNG / ICOを個別に手編集しない
- 別IssueのSource Asset配置は、そのAsset分類と生成方式を確定してからIssue/設計で明記する
- Human/AI間のUpload手順は `docs/HUMAN_AI_COLLABORATION.md`、Asset lifecycleは `docs/ASSET_WORKFLOW.md` を正本とする
