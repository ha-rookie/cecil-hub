# Cecil

匿名の System Engineer / Developer / Writer の個人ポータル。

> 作ったもの、書いたもの、考えていることを、ひとつの場所に。

## Development

このRepositoryはPrivateの開発正本です。公開サイトへ配信する対象は `public/` のみです。

- Project Overview: `docs/00_PROJECT_OVERVIEW.md`
- Requirements: `docs/01_REQUIREMENTS.md`
- System Architecture: `docs/02_SYSTEM_ARCHITECTURE.md`
- Application Architecture: `docs/03_APPLICATION_ARCHITECTURE.md`
- Repository Structure: `docs/04_REPOSITORY_STRUCTURE.md`
- Visual Design: `docs/design/README.md`
- ADR: `docs/adr/`

## v1 Architecture

- Static HTML / CSS / JavaScript
- Cloudflare Workers Static Assets
- DB / Login / APIなし
- Light / Dark / Auto theme
- Mobile responsive

## Public Boundary

Cloudflareへ公開するのは `public/` のみ。

`docs/`, `AGENTS.md`, `.github/`, ADR, Issue/PRなどの開発ノウハウは公開サイトへ含めません。

## Commands

```bash
npm install
npm run dev
npm run deploy
```

## Pending after public URL is fixed

- canonical
- og:url
- OGP image
- sitemap.xml
- Google Search Console
- Cloudflare Web Analytics
- outbound click analytics
